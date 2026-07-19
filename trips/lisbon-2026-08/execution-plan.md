# Execution Plan

## Agents Required

- flight-planner (transport mode confirmed: flight)
- weather
- accommodation-planner
- activities-planner
- food-planner
- packing-planner
- budget-aggregator
- validator
- daily-plan-builder
- html-builder

## Execution Groups

**Group 1** (parallel) — depends only on `requirements-v2.md`:
- `flight-planner` → `transport.md`
- `weather` → `weather.md`

**Group 2** (parallel) — depends on `transport.md` (`## Stops & Nights`) and, for activities, `weather.md`:
- `accommodation-planner` → `accommodation.md`
- `activities-planner` → `activities.md` (also reads latest `weather.md` to weigh outdoor/beach picks against forecast, and heat levels against the minimal-walking constraint)
- `food-planner` → `food.md`

**Group 3** (parallel) — depends on Group 2 outputs plus `weather.md`:
- `packing-planner` → `packing.md` (reads `weather.md`, `activities.md`, `accommodation.md`)
- `budget-aggregator` → `budget.md` (reads `transport.md`, `accommodation.md`, `activities.md`, `food.md`)

## Quality Gates

- QG1 — Budget total (from `budget.md`) ≤ 3500 EUR
- QG2 — All costs across every artifact are stated in EUR (trip currency)
- QG3 — Daily travel/transfer time ≤ ~1 hour each way per leg (per flagged assumption in `requirements-v2.md`), and no single day's itinerary requires excessive walking (minimal-walking constraint honored)
- QG4 — No duplicate attractions/activities across days in `activities.md`
- QG5 — Transport mode matches confirmed mode (flight) in `transport.md`
- QG-CITE — Every recommendation row in `transport.md`, `accommodation.md`, `activities.md`, `food.md` carries a real `http(s)://` source link (exceptions per CLAUDE.md: `budget.md`, `packing.md`'s `## Sources`, `weather.md`'s per-stop method)
- QG6 — All activities, dining, and transport suitable for children ages 5 and 8 (family/kid suitability noted)
- QG7 — Accommodation matches stated preference: 4-star hotel with pool

## Iteration Strategy

- QG1 fail (over budget) → rerun `budget-aggregator` after minimally adjusting the highest-cost contributing artifact(s) (`accommodation-planner`, `activities-planner`, `flight-planner`, or `food-planner` — whichever line items are driving the overage), then rerun `budget-aggregator`.
- QG2 fail (wrong currency) → rerun only the offending artifact's agent, then rerun `budget-aggregator` if costs changed.
- QG3 fail (travel/walking time) → rerun `flight-planner` (if the flight/transfer leg is the issue) or `activities-planner` (if day-trip/beach transfers or in-city walking are the issue).
- QG4 fail (duplicates) → rerun `activities-planner`.
- QG5 fail (transport mismatch) → rerun `flight-planner`.
- QG-CITE fail → rerun only the artifact(s) missing citations.
- QG6 fail (child suitability) → rerun the specific artifact's agent (`activities-planner`, `food-planner`, or `flight-planner`).
- QG7 fail (accommodation mismatch) → rerun `accommodation-planner`.
- Any rerun that changes cost or content stales `budget-aggregator` and/or `packing-planner` — rerun those downstream as needed.
- Max iterations: 3. On exhaustion, stop and report unresolved failures rather than proceeding.
