"""
Simple auto-clicker using local system time.

Clicks once at a given local time via pyautogui. No browser connection,
no server sync — just your machine's clock.

Usage:
  python3 autoclicker_local.py 14:30:00.500
  python3 autoclicker_local.py            # prompts for the time

Format: HH:MM:SS.mmm  (24-hour). If the time already passed today,
it schedules for tomorrow.
"""

import sys
import time
from datetime import datetime, timedelta
import pyautogui

# 75 ms == sweet spot for office
CLICK_LATENCY_MS = 75  # pyautogui.click() -> OS click event


def parse_target(text: str) -> datetime:
    text = text.strip()
    now = datetime.now()
    for fmt in ("%H:%M:%S.%f", "%H:%M:%S", "%H:%M"):
        try:
            t = datetime.strptime(text, fmt).time()
        except ValueError:
            continue
        target = now.replace(
            hour=t.hour, minute=t.minute, second=t.second, microsecond=t.microsecond
        )
        if target <= now:
            target += timedelta(days=1)
        return target
    raise ValueError(f"Could not parse time: {text!r}. Use HH:MM:SS.mmm")


def main():
    if len(sys.argv) >= 2:
        text = sys.argv[1]
    else:
        text = input("Click at what time? (HH:MM:SS.mmm) ")

    try:
        target = parse_target(text)
    except ValueError as e:
        print(e)
        return

    fire_at = target - timedelta(milliseconds=CLICK_LATENCY_MS)
    wait = (fire_at - datetime.now()).total_seconds()
    print(
        f"Clicking at {target.strftime('%H:%M:%S.%f')[:-3]} "
        f"(firing {CLICK_LATENCY_MS}ms early, in {wait:.3f}s)"
    )

    # Countdown
    while True:
        remaining = (fire_at - datetime.now()).total_seconds()
        if remaining <= 0.05:
            break
        print(f"\rT-minus {remaining:6.2f}s ", end="", flush=True)
        time.sleep(min(0.1, remaining - 0.05))
    print("\rT-minus   0.00s ")

    # Busy-wait final stretch for ms accuracy
    while datetime.now() < fire_at:
        pass

    pyautogui.click()
    print(f"Clicked at {datetime.now().strftime('%H:%M:%S.%f')[:-3]}")


if __name__ == "__main__":
    main()
