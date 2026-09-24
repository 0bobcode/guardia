#!/usr/bin/env python3
"""Guardia's "Ask Guardia" brief writer — a simple, fully local, rule-based
text generator. No model, no API key, no network call: it reads real,
already-computed stats as JSON on stdin and picks/fills a template based on
their severity, so it can never invent a number that wasn't given to it.

Contract: one JSON object on stdin, one JSON object ({"summary": "..."}) on
stdout. Anything unexpected on stdin should still produce *some* reasonable
summary rather than crash — the caller falls back to a plain stats line if
this script fails or isn't available at all, so failures here are cheap,
but a working reply is always better than a fallback.
"""

import json
import random
import sys


def plural(n: int, word: str) -> str:
    return word if n == 1 else word + "s"


def was_were(n: int) -> str:
    return "was" if n == 1 else "were"


def build_summary(payload: dict) -> str:
    scope = payload.get("scope", "student")
    subject = payload.get("subject") or ("this child" if scope == "student" else "the district")
    question = (payload.get("question") or "").lower()
    window_days = payload.get("windowDays", 14)
    stats = payload.get("stats", {})
    highlights = payload.get("highlights", [])

    total = int(stats.get("totalMessages", 0))
    flagged = int(stats.get("flaggedCount", 0))
    blocked = int(stats.get("blockedCount", 0))
    top_app = stats.get("topApp")

    unit = "messages" if scope == "student" else "scans"
    total_unit = plural(total, unit[:-1])
    activity_clause_options = []
    if total > 0 and top_app:
        activity_clause_options = [
            f"{subject} generated {total} {total_unit} over the last {window_days} days, most often on {top_app}.",
            f"Over the last {window_days} days, {subject} logged {total} {total_unit}, mostly through {top_app}.",
            f"In the last {window_days} days there {was_were(total)} {total} {total_unit} from {subject}, with {top_app} the most-used app.",
        ]
    elif total > 0:
        activity_clause_options = [
            f"{subject} generated {total} {total_unit} over the last {window_days} days.",
            f"Over the last {window_days} days, {subject} logged {total} {total_unit}.",
        ]
    else:
        activity_clause_options = [
            f"There's been no recorded activity from {subject} in the last {window_days} days."
        ]
    activity_clause = random.choice(activity_clause_options)

    asks_if_safe = any(w in question for w in ("safe", "ok?", " ok ", "okay", "concern", "worry", "worried"))
    asks_about_blocked = "block" in question

    if flagged == 0:
        if asks_if_safe:
            risk_clause_options = [
                "Nothing was flagged — you're clear on that front right now.",
                "To answer directly: no, nothing here raises a concern.",
            ]
        else:
            risk_clause_options = [
                "None of it was flagged — nothing to act on right now.",
                "Nothing was flagged in that window, so there's nothing here that needs attention.",
                "Everything passed GuardRail's checks clean.",
            ]
        risk_clause = random.choice(risk_clause_options)
    else:
        top = highlights[0] if highlights else None
        severity = (top or {}).get("severity", "LOW")
        category = (top or {}).get("title")

        block_fragment = (
            f", {blocked} of which {was_were(blocked)} blocked before a reply went out" if blocked else ""
        )
        flagged_clause = f"{flagged} {plural(flagged, unit[:-1])} {was_were(flagged)} flagged{block_fragment}"

        if asks_about_blocked:
            lead_options = [
                f"{blocked} {plural(blocked, unit[:-1])} {was_were(blocked)} blocked outright" + (
                    f", out of {flagged} flagged total." if flagged != blocked else "."
                ),
            ] if blocked else [
                f"None were blocked — {flagged} {plural(flagged, unit[:-1])} {was_were(flagged)} flagged but allowed through after review."
            ]
        elif asks_if_safe and severity == "HIGH":
            lead_options = [
                f"Not entirely — {flagged_clause}, and {category or 'the top category'} is worth your attention."
            ]
        elif severity == "HIGH":
            lead_options = [
                f"{flagged_clause} — the top concern was {category}." if category else f"{flagged_clause}.",
                f"That includes {flagged} flagged {unit}{block_fragment}, with {category} as the highest-severity category."
                if category
                else f"That includes {flagged} flagged {unit}{block_fragment}.",
            ]
        elif severity == "MEDIUM":
            lead_options = [
                f"{flagged_clause}, mostly around {category} — worth a look, not urgent."
                if category
                else f"{flagged_clause} — worth a look, not urgent.",
            ]
        else:
            lead_options = [
                f"{flagged_clause}, all low-severity.",
            ]
        risk_clause = random.choice(lead_options)

    if total == 0:
        return activity_clause

    summary = f"{activity_clause} {risk_clause}"
    if "compar" in question or "trend" in question or "usual" in question:
        summary += " I don't have a prior period's numbers to compare against yet, so this is just the current window."
    return summary


def main() -> None:
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw) if raw.strip() else {}
    except Exception:
        payload = {}

    try:
        summary = build_summary(payload)
    except Exception:
        summary = ""

    sys.stdout.write(json.dumps({"summary": summary}))


if __name__ == "__main__":
    main()
