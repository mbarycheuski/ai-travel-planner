# Iteration Plan v1

## Failed Gates

- **QG-CITE** — `activities.md` Day 5 row "Hotel rest / pack, then airport transfer" has a Link cell of `*(logistics only — see transport plan; no separate source needed)*`, which contains no `http(s)://` URL. All other 32 recommendation rows across `transport.md`, `accommodation.md`, `activities.md`, `food.md` are properly cited.

## Agents To Rerun

- `activities-planner` only — every other gate (QG1-QG9) passed; no downstream agent's inputs change as a result of this fix.

## Guidance Per Agent

- **activities-planner**: Rewrite `trips/lisbon-2026-08/activities.md` (in place — same file, pre-validator-pass correction). Fix the Day 5 "Hotel rest / pack, then airport transfer" row: either (a) remove it from the `## Activities by Day/Stop` recommendation table entirely since it's pure logistics with no travel-content recommendation to cite, keeping it only as prose narrative in that day's description or in `## Rationale & Assumptions`, or (b) if kept as a table row, add a real `http(s)://` source link (e.g. citing the hotel's own page from `accommodation.md` or the airport transfer info already cited in `transport.md`). Read the latest `transport.md` and `accommodation.md` for a valid link if option (b) is chosen. Keep every other row, cost figure, and day structure unchanged — this is a citation-only fix, not a content rework.
