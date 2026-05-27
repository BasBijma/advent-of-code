"""
Tribal Wars precision auto-clicker using Chrome DevTools Protocol.

Setup:
  1. Quit Chrome completely (Cmd+Q).
  2. Relaunch with debugging enabled:
       "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/chrome-debug-profile" --no-first-run --no-default-browser-check "--remote-allow-origins=*"
  3. Log in to Tribal Wars and open the page you want to click on.
  4. pip3 install websocket-client pyautogui
  5. python3 autoclicker.py [HH:MM:SS.mmm] [HH:MM:SS]

Reads in-game server time via CDP, then fires a real OS click at the cursor
position at (arrival - travel).
"""

import json
import sys
import time
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from websocket import create_connection
import pyautogui

pyautogui.PAUSE = 0          # no built-in post-action sleep
pyautogui.FAILSAFE = True    # slam mouse to a corner to abort

DEBUG_PORT = 9222
TARGET_URL_SUBSTR = "tribalwars.nl"

# ms subtracted from fire time for input/network latency. Tune if clicks miss.
INPUT_JITTER_LATENCY_MS = 3

# This subtracts from fire time (higher == earlier click)
MANUAL_OFFSET_MS = 55

# Safety cap on the timer-sync offset ONLY (not input jitter / manual offset). If a sync
# reading claims the server clock is more than this far ahead of local, clamp it: a runaway
# offset would yank the fire way too early. Clamping the offset down always fires LATER,
# which is the safe direction. Jitter + manual offset are still applied in full on top.
SYNC_OFFSET_CAP_MS = 85

# Final sync: average SYNC_SAMPLES offsets over SYNC_WINDOW_S before fire to cut rollover noise.
SYNC_SAMPLES = 6
SYNC_WINDOW_S = 15.0
SYNC_HEADROOM_S = 1.5  # min seconds before fire to start another sample (a sync takes ~1s)

# Early-click guard: clicking early is a dead sin, a little late is fine. When the final
# sync samples disagree, lean toward the offset that fires LATEST (= the smallest
# server-local offset) instead of the plain mean, which sits mid-noise and risks early.
# 0.0 = plain mean (original), 1.0 = always use the safest (latest-firing) sample.
EARLY_BIAS = 0.6


# ---------- CDP wrapper -------------------------------------------------------

class CDP:
    def __init__(self, ws_url):
        self.ws = create_connection(ws_url, timeout=5)
        self.msg_id = 0

    def call(self, method, params=None):
        self.msg_id += 1
        msg = {"id": self.msg_id, "method": method}
        if params:
            msg["params"] = params
        self.ws.send(json.dumps(msg))
        while True:
            resp = json.loads(self.ws.recv())
            if resp.get("id") == self.msg_id:
                if "error" in resp:
                    raise RuntimeError(f"CDP error on {method}: {resp['error']}")
                return resp.get("result", {})

    def eval(self, expr):
        r = self.call("Runtime.evaluate", {"expression": expr, "returnByValue": True})
        if r["result"].get("subtype") == "error":
            raise RuntimeError(f"JS error: {r['result'].get('description')}")
        return r["result"].get("value")


def find_tab():
    with urllib.request.urlopen(f"http://localhost:{DEBUG_PORT}/json") as r:
        tabs = json.load(r)
    for tab in tabs:
        if tab.get("type") == "page" and TARGET_URL_SUBSTR in tab.get("url", ""):
            return tab
    raise RuntimeError(
        f"No tab matching {TARGET_URL_SUBSTR!r} on port {DEBUG_PORT}. "
        "Did you launch Chrome with --remote-debugging-port=9222 and open the game?"
    )


# ---------- Server time sync (via the page itself) ----------------------------

def get_server_offset(cdp: CDP) -> float:
    """Return server_time - local_time (s). Polls #serverTime until it ticks for sub-second precision."""
    expr = """
        (() => {
            const t = document.getElementById('serverTime');
            const d = document.getElementById('serverDate');
            return {time: t ? t.textContent.trim() : null, date: d ? d.textContent.trim() : null};
        })()
    """
    print("Syncing to in-game server clock...")
    prev = None
    for _ in range(80):  # up to ~4s
        local_before = time.time() * 1000
        sample = cdp.eval(expr)
        local_after = time.time() * 1000
        if not sample or not sample.get("time"):
            raise RuntimeError("Couldn't find #serverTime element. Make sure you're on a game page.")

        if prev is not None and sample["time"] != prev["time"]:
            # New server second began between local_before/after; use midpoint.
            server_sec_ms = parse_server_datetime(sample["date"], sample["time"]) * 1000
            offset_ms = server_sec_ms - (local_before + local_after) / 2
            print(f"  Server offset: {offset_ms:+.0f}ms  (CDP RTT {local_after - local_before:.1f}ms)")
            return offset_ms / 1000.0

        prev = sample
        time.sleep(0.05)

    raise RuntimeError("Never saw the server clock tick — page may be frozen.")


def parse_server_datetime(date_str: str, time_str: str) -> float:
    """Parse TW's 'om 14:30:00' / 'op 20/05/26' server clock to Unix seconds."""
    for prefix in ("op ", "on ", "om ", "at "):
        if date_str.lower().startswith(prefix):
            date_str = date_str[len(prefix):]
        if time_str.lower().startswith(prefix):
            time_str = time_str[len(prefix):]

    for fmt in ("%d/%m/%y", "%d/%m/%Y", "%Y-%m-%d", "%d.%m.%Y"):
        try:
            d = datetime.strptime(date_str, fmt).date()
            break
        except ValueError:
            continue
    else:
        raise RuntimeError(f"Couldn't parse server date: {date_str!r}")

    for fmt in ("%H:%M:%S", "%H:%M"):
        try:
            t = datetime.strptime(time_str, fmt).time()
            break
        except ValueError:
            continue
    else:
        raise RuntimeError(f"Couldn't parse server time: {time_str!r}")

    return datetime.combine(d, t).timestamp()


# ---------- Target time parsing ----------------------------------------------

def parse_arrival(text: str, reference: datetime) -> datetime:
    text = text.strip()
    for fmt in ("%H:%M:%S.%f", "%H:%M:%S", "%H:%M"):
        try:
            t = datetime.strptime(text, fmt).time()
        except ValueError:
            continue
        target = reference.replace(
            hour=t.hour, minute=t.minute, second=t.second, microsecond=t.microsecond
        )
        if target <= reference:
            target += timedelta(days=1)
        return target
    raise ValueError(f"Could not parse arrival time: {text!r}. Use HH:MM:SS.mmm")


def parse_travel(text: str) -> timedelta:
    text = text.strip()
    parts = text.split(":")
    if len(parts) == 3:
        h, m, s = parts
    elif len(parts) == 2:
        h, m, s = "0", parts[0], parts[1]
    else:
        raise ValueError(f"Could not parse travel time: {text!r}. Use HH:MM:SS")
    try:
        return timedelta(hours=int(h), minutes=int(m), seconds=int(s))
    except ValueError:
        raise ValueError(f"Could not parse travel time: {text!r}. Use HH:MM:SS")


# ---------- Averaged final sync ----------------------------------------------

def sample_offsets(cdp: CDP, start_ts: float, end_ts: float, n: int, fire_at_ts: float):
    """Average up to n offsets across [start_ts, end_ts]; stop early near fire. None if none ran."""
    offsets = []
    for i in range(n):
        sample_at = start_ts + (end_ts - start_ts) * i / (n - 1) if n > 1 else start_ts
        sleep_for = sample_at - time.time()
        if sleep_for > 0:
            time.sleep(sleep_for)

        if fire_at_ts - time.time() < SYNC_HEADROOM_S:
            print(f"  Stopping early at sample {i + 1}/{n} — not enough time left.")
            break

        off = get_server_offset(cdp)
        offsets.append(off)
        print(f"  sample {i + 1}/{n}: {off * 1000:+.0f}ms")

    if not offsets:
        return None
    mean = sum(offsets) / len(offsets)
    lo = min(offsets)  # smallest offset == latest (safest) fire; can't click early on it
    chosen = lo + (1.0 - EARLY_BIAS) * (mean - lo)  # blend mean->safest by EARLY_BIAS
    spread = (max(offsets) - min(offsets)) * 1000
    print(
        f"  Offsets: mean {mean * 1000:+.0f}ms, safest {lo * 1000:+.0f}ms"
        f" -> using {chosen * 1000:+.0f}ms"
        f"  (early-bias {EARLY_BIAS:.2f}, spread {spread:.0f}ms over {len(offsets)})"
    )
    return chosen



# ---------- Main --------------------------------------------------------------

def main():
    tab = find_tab()
    print(f"Connected to tab: {tab.get('title', '?')}")
    cdp = CDP(tab["webSocketDebuggerUrl"])

    offset = get_server_offset(cdp)
    server_now = datetime.fromtimestamp(time.time() + offset)
    print(f"  Server time now: {server_now.strftime('%H:%M:%S.%f')[:-3]}")

    # Inputs
    if len(sys.argv) >= 3:
        arrival_text, travel_text = sys.argv[1], sys.argv[2]
    else:
        arrival_text = input("Gewenste aankomsttijd (server)? (HH:MM:SS.mmm) ")
        travel_text = input("Reistijd? (HH:MM:SS) ")

    arrival_server = parse_arrival(arrival_text, server_now)
    travel = parse_travel(travel_text)

    target_server = arrival_server - travel
    if target_server <= server_now:
        target_server += timedelta(days=1)
        arrival_server += timedelta(days=1)

    print("Position the mouse over the button now — it clicks wherever the cursor is.")

    anticipation_ms = INPUT_JITTER_LATENCY_MS + MANUAL_OFFSET_MS

    def compute_fire_at(off: float) -> float:
        # Cap the sync offset only; jitter + manual offset are applied in full on top.
        capped_off = min(off, SYNC_OFFSET_CAP_MS / 1000.0)
        return target_server.timestamp() - capped_off - anticipation_ms / 1000.0

    if offset * 1000 > SYNC_OFFSET_CAP_MS:
        print(f"  Sync offset {offset * 1000:+.0f}ms over cap — clamped to {SYNC_OFFSET_CAP_MS}ms for firing.")

    fire_at_ts = compute_fire_at(offset)
    wait = fire_at_ts - time.time()
    print(
        f"Arrival {arrival_server.strftime('%H:%M:%S.%f')[:-3]}  "
        f"- travel {travel}  "
        f"= click {target_server.strftime('%H:%M:%S.%f')[:-3]} (server) "
        f"(anticipation {anticipation_ms}ms + sync, firing in {wait:.3f}s)"
    )

    # Phase 1: wait until the sync window opens (SYNC_WINDOW_S before fire).
    window_start_ts = fire_at_ts - SYNC_WINDOW_S
    while True:
        remaining = window_start_ts - time.time()
        if remaining <= 0.05:
            break
        print(
            f"\rT-minus {fire_at_ts - time.time():7.2f}s "
            f"(sync window opens in {remaining:5.1f}s) ",
            end="", flush=True,
        )
        time.sleep(min(0.2, remaining))
    print()

    # Phase 2: sample & average offsets; last sample ~2s before fire.
    window_end_ts = fire_at_ts - 2.0
    avg_offset = sample_offsets(
        cdp, max(window_start_ts, time.time()), window_end_ts, SYNC_SAMPLES, fire_at_ts
    )
    if avg_offset is not None:
        offset = avg_offset
        if offset * 1000 > SYNC_OFFSET_CAP_MS:
            print(f"  Re-locked sync {offset * 1000:+.0f}ms over cap — clamped to {SYNC_OFFSET_CAP_MS}ms.")
        fire_at_ts = compute_fire_at(offset)
        print(f"  Re-locked: clicking in {fire_at_ts - time.time():.3f}s")
    else:
        print("  No time to re-sample — using initial sync offset.")

    # Phase 3: final countdown.
    while True:
        remaining = fire_at_ts - time.time()
        if remaining <= 0.05:
            break
        print(f"\rT-minus {remaining:6.2f}s ", end="", flush=True)
        time.sleep(min(0.1, remaining - 0.05))
    print("\rT-minus   0.00s ")

    # Busy-wait final stretch for ms accuracy
    while time.time() < fire_at_ts:
        pass

    t_fire = time.time()
    pyautogui.click()  # real OS click; mouse is already positioned
    t_done = time.time()

    # Everything below runs after the click, so it doesn't affect timing.
    fire_err_ms = (t_fire - fire_at_ts) * 1000              # busy-wait precision
    click_ms = (t_done - t_fire) * 1000                     # pyautogui call cost
    vs_target_ms = (t_fire + offset - target_server.timestamp()) * 1000
    click_server = datetime.fromtimestamp(t_fire + offset)
    print(
        f"Clicked at server {click_server.strftime('%H:%M:%S.%f')[:-3]}  "
        f"(fire err {fire_err_ms:+.1f}ms, click {click_ms:.1f}ms, vs target {vs_target_ms:+.0f}ms)"
    )


if __name__ == "__main__":
    main()
