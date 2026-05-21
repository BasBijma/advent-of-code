"""
Simple auto-clicker using Tribal Wars SERVER time.

Clicks once at (arrival_time - travel_time), where both are interpreted
as server time. Syncs to the TW server via HTTP HEAD requests so local
clock drift doesn't matter.

Usage:
  python3 autoclicker_local.py 14:30:00.500 02:15:30
  python3 autoclicker_local.py                          # prompts for both

Formats:
  arrival_time: HH:MM:SS.mmm   (server time, 24-hour, milliseconds required)
  travel_time:  HH:MM:SS       (duration, no milliseconds)
"""

import sys
import time
import urllib.request
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
import pyautogui

# Hit the game backend directly (avoids CDN/marketing-server Date headers).
SERVER_URL = "https://nl115.tribalwars.nl/interface.php?func=get_config"

# 7 ms == sweet spot for office
CLICK_LATENCY_MS = 7 # pyautogui.click() -> OS click event

# Manual calibration. If clicks still land late by N ms after server sync,
# set this to +N. If they land early, set negative.
MANUAL_OFFSET_MS = 0


def fetch_server_date() -> tuple[datetime, float]:
    """One HEAD request. Returns (server Date header, local time at response)."""
    req = urllib.request.Request(SERVER_URL, method="HEAD")
    with urllib.request.urlopen(req, timeout=5) as resp:
        local = time.time()
        date_str = resp.headers.get("Date")
    return parsedate_to_datetime(date_str), local


def get_server_offset(samples: int = 60) -> float:
    """
    Returns server_time - local_time in seconds.

    The HTTP Date header has 1s resolution, so poll quickly and look for
    the rollover — that boundary pins server time to sub-second precision.
    """
    print("Syncing with server clock...")
    prev_date = None
    for _ in range(samples):
        server_dt, local_t = fetch_server_date()
        if prev_date is not None and server_dt > prev_date:
            offset = server_dt.timestamp() - local_t
            sign = "+" if offset >= 0 else ""
            print(f"  Server is {sign}{offset*1000:.0f}ms vs local clock.")
            return offset
        prev_date = server_dt
        time.sleep(0.1)

    # Fallback: no rollover seen — use coarse estimate.
    offset = server_dt.timestamp() - local_t
    print(f"  (no rollover detected — using coarse ±1s offset {offset:+.3f}s)")
    return offset


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


def main():
    offset = get_server_offset()
    server_now = datetime.fromtimestamp(time.time() + offset)
    print(f"  Server time now: {server_now.strftime('%H:%M:%S.%f')[:-3]}")

    if len(sys.argv) >= 3:
        arrival_text, travel_text = sys.argv[1], sys.argv[2]
    else:
        arrival_text = input("Gewenste aankomsttijd (server)? (HH:MM:SS.mmm) ")
        travel_text = input("Reistijd? (HH:MM:SS) ")

    try:
        arrival_server = parse_arrival(arrival_text, server_now)
        travel = parse_travel(travel_text)
    except ValueError as e:
        print(e)
        return

    target_server = arrival_server - travel
    if target_server <= server_now:
        target_server += timedelta(days=1)
        arrival_server += timedelta(days=1)

    # Convert server target into local-clock timestamp, then apply latency
    # buffer and any manual calibration offset.
    target_local_ts = target_server.timestamp() - offset
    fire_at_ts = target_local_ts - (CLICK_LATENCY_MS + MANUAL_OFFSET_MS) / 1000.0

    wait = fire_at_ts - time.time()
    print(
        f"Arrival {arrival_server.strftime('%H:%M:%S.%f')[:-3]}  "
        f"- travel {travel}  "
        f"= click {target_server.strftime('%H:%M:%S.%f')[:-3]} (server) "
        f"(firing {CLICK_LATENCY_MS}ms early, in {wait:.3f}s)"
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

    pyautogui.click()
    click_server = datetime.fromtimestamp(time.time() + offset)
    print(f"Clicked at server time {click_server.strftime('%H:%M:%S.%f')[:-3]}")


if __name__ == "__main__":
    main()
