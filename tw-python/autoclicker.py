"""
Tribal Wars precision auto-clicker using Chrome DevTools Protocol.

Setup:
  1. Quit Chrome completely (Cmd+Q).
  2. Relaunch with debugging enabled:
       "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="$HOME/chrome-debug-profile" --no-first-run --no-default-browser-check "--remote-allow-origins=*"
  3. Log in to Tribal Wars and open the page you want to click on.
  4. pip3 install websocket-client
  5. python3 autoclicker.py [HH:MM:SS.mmm]

The script:
  - Connects to the running Chrome via CDP.
  - Reads in-game server time directly from the page (sub-second accurate).
  - Dispatches a trusted mouse event at the chosen element's center.
"""

import json
import sys
import time
import urllib.request
from datetime import datetime, timedelta
from websocket import create_connection

DEBUG_PORT = 9222
TARGET_URL_SUBSTR = "tribalwars.nl"

# CSS selector for the element to click. Override at the prompt or here.
DEFAULT_CLICK_SELECTOR = "#troop_confirm_submit"  # the "send attack" confirm button

# CDP click is dispatched directly into Chrome's input pipeline;
# the WebSocket round-trip (~1-3ms locally). 
# Network Jitter & latency can affect timing depending on server congestion and connection quality.
# Tune if you see consistent miss.
INPUT_JITTER_LATENCY_MS = 35


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

    def click_at(self, x, y):
        common = {"x": x, "y": y, "button": "left", "clickCount": 1}
        self.call("Input.dispatchMouseEvent", {"type": "mousePressed", **common})
        self.call("Input.dispatchMouseEvent", {"type": "mouseReleased", **common})


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
    """
    Returns (server_unix_ms - local_unix_ms) / 1000 — the offset to add to
    local time.time() to get server time.

    Reads the page's #serverTime / #serverDate elements (TW updates these every
    second). We poll until the text changes — that boundary pins the server
    second to a precise local timestamp.
    """
    expr = """
        (() => {
            const t = document.getElementById('serverTime');
            const d = document.getElementById('serverDate');
            return {
                time: t ? t.textContent.trim() : null,
                date: d ? d.textContent.trim() : null,
                now: Date.now()
            };
        })()
    """

    print("Syncing to in-game server clock...")
    prev = None
    for _ in range(80):  # up to ~4s
        local_before = time.time() * 1000
        sample = cdp.eval(expr)
        local_after = time.time() * 1000
        if not sample or not sample.get("time"):
            raise RuntimeError(
                "Couldn't find #serverTime element. Make sure you're on a game page."
            )

        if prev is not None and sample["time"] != prev["time"]:
            # Rollover: the new server second started somewhere between
            # local_before and local_after. Use the midpoint.
            server_sec_ms = parse_server_datetime(sample["date"], sample["time"]) * 1000
            local_ms_at_boundary = (local_before + local_after) / 2
            offset_ms = server_sec_ms - local_ms_at_boundary
            rtt_ms = local_after - local_before
            print(f"  Server offset: {offset_ms:+.0f}ms  (CDP RTT {rtt_ms:.1f}ms)")
            return offset_ms / 1000.0

        prev = sample
        time.sleep(0.05)

    raise RuntimeError("Never saw the server clock tick — page may be frozen.")


def parse_server_datetime(date_str: str, time_str: str) -> float:
    """
    TW NL shows the server time as e.g. 'om 14:30:00' and date as 'op 20/05/26'.
    Strip the leading word and parse. Returns Unix seconds.
    """
    # Strip common Dutch/English prefixes ('op', 'on')
    for prefix in ("op ", "on ", "om ", "at "):
        if date_str.lower().startswith(prefix):
            date_str = date_str[len(prefix):]
        if time_str.lower().startswith(prefix):
            time_str = time_str[len(prefix):]

    # Try a few date formats
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

def parse_target(text: str, server_now: datetime) -> datetime:
    text = text.strip()
    for fmt in ("%H:%M:%S.%f", "%H:%M:%S", "%H:%M"):
        try:
            t = datetime.strptime(text, fmt).time()
        except ValueError:
            continue
        target = server_now.replace(
            hour=t.hour, minute=t.minute, second=t.second, microsecond=t.microsecond
        )
        if target <= server_now:
            target += timedelta(days=1)
        return target
    raise ValueError(f"Could not parse time: {text!r}. Use HH:MM:SS.mmm")


# ---------- Resolve click coordinates ----------------------------------------

def get_click_coords(cdp: CDP, selector: str) -> tuple[float, float]:
    expr = f"""
        (() => {{
            const el = document.querySelector({json.dumps(selector)});
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {{x: r.x + r.width/2, y: r.y + r.height/2, visible: r.width > 0 && r.height > 0}};
        }})()
    """
    pos = cdp.eval(expr)
    if not pos:
        raise RuntimeError(f"Element not found for selector: {selector!r}")
    if not pos.get("visible"):
        raise RuntimeError(f"Element {selector!r} has zero size (hidden?).")
    return pos["x"], pos["y"]


# ---------- Main --------------------------------------------------------------

def main():
    tab = find_tab()
    print(f"Connected to tab: {tab.get('title', '?')}")
    cdp = CDP(tab["webSocketDebuggerUrl"])

    offset = get_server_offset(cdp)
    server_now = datetime.fromtimestamp(time.time() + offset)
    print(f"  Server time now: {server_now.strftime('%H:%M:%S.%f')[:-3]}")

    # Time input
    if len(sys.argv) >= 2:
        target_text = sys.argv[1]
    else:
        target_text = input("Click at what SERVER time? (HH:MM:SS.mmm) ")

    # Selector input
    selector = input(f"CSS selector to click [default: {DEFAULT_CLICK_SELECTOR}]: ").strip()
    if not selector:
        selector = DEFAULT_CLICK_SELECTOR

    x, y = get_click_coords(cdp, selector)
    print(f"  Target element at ({x:.0f}, {y:.0f})")

    target_server = parse_target(target_text, server_now)

    target_local_ts = target_server.timestamp() - offset
    fire_at_ts = target_local_ts - INPUT_JITTER_LATENCY_MS / 1000.0

    wait = fire_at_ts - time.time()
    print(
        f"Clicking at server time {target_server.strftime('%H:%M:%S.%f')[:-3]} "
        f"(firing {INPUT_JITTER_LATENCY_MS}ms early, in {wait:.3f}s)"
    )

    # Countdown
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

    cdp.click_at(x, y)
    click_server = datetime.fromtimestamp(time.time() + offset)
    print(f"Clicked at server time {click_server.strftime('%H:%M:%S.%f')[:-3]}")


if __name__ == "__main__":
    main()
