# Execution Plan

## Agents Required

- `car-planner` — confirmed transport mode is car. Produces `transport.md`.
- `weather` — destination status is confirmed (Krakow, Poland). Produces `weather.md`.
- `accommodation-planner` — economical hotel needed near Krakow. Produces `accommodation.md`.
- `activities-planner` — family-friendly itinerary for ages 5 and 8. Produces `activities.md`.
- `food-planner` — casual, budget-conscious dining, no dietary restrictions. Produces `food.md`.
- `packing-planner` — destination confirmed, so scheduled (not deferred). Produces `packing.md`.
- `budget-aggregator` — aggregates all cost-bearing artifacts against the 2500 PLN all-inclusive cap. Produces `budget.md`.
- `validator` — always runs. Produces `validation.md`.
- `daily-plan-builder` — always runs. Produces `daily-plan.md`.
- `html-builder` — always runs, after approval. Produces `travel-guide.html`.

## Execution Groups

1. **Group 1** (depends only on `requirements-v2.md`):
   - `car-planner` → `transport.md`
   - `weather` → `weather.md`
2. **Group 2** (depends on `transport.md`'s `## Stops & Nights`):
   - `accommodation-planner` → `accommodation.md`
   - `activities-planner` → `activities.md`
   - `food-planner` → `food.md`
3. **Group 3** (depends on Group 2 outputs; `packing-planner` and `budget-aggregator` are mutually independent):
   - `packing-planner` — needs `weather.md`, `activities.md`, `accommodation.md`, and `transport.md` (car trip) → `packing.md`
   - `budget-aggregator` — needs `transport.md`, `accommodation.md`, `activities.md`, `food.md` → `budget.md`

## Quality Gates

- **QG1** — Budget total (from `budget.md`) ≤ 2500 PLN, all-inclusive (fuel/tolls/car + hotel + food).
- **QG2** — All costs across all artifacts are denominated in PLN.
- **QG3** — Daily driving time ≤ 4 hours one-way for any single leg (per `transport.md`).
- **QG4** — No duplicate attractions/activities across days in `activities.md`.
- **QG5** — Transport mode matches confirmed mode: car (per `transport.md`, using `car-planner`).
- **QG6 (QG-CITE)** — Every recommendation row in `transport.md`, `accommodation.md`, `activities.md`, `food.md` carries a real `http(s)://` source link.
- **QG7** — Activities and accommodation are suitable for children ages 5 and 8 (no age-inappropriate or excessively physically demanding items without a noted alternative).
- **QG8** — Accommodation includes parking or clear guidance on parking near the property (car trip).

## Iteration Strategy

- **QG1 fail (budget over cap)** → rerun `budget-aggregator` after adjusting whichever cost-bearing artifact(s) drove the overage (cheapest fix first: `accommodation-planner`, `food-planner`, or `activities-planner`); re-run `budget-aggregator` after.
- **QG2 fail (currency mismatch)** → rerun only the offending artifact's agent.
- **QG3 fail (travel time over cap)** → rerun `car-planner`; if stops change, rerun downstream Group 2 agents referencing `## Stops & Nights`.
- **QG4 fail (duplicate activities)** → rerun `activities-planner`; rerun `daily-plan-builder` afterward.
- **QG5 fail (transport mode mismatch)** → rerun `car-planner`.
- **QG6 fail (missing citations)** → rerun only the specific agent(s) whose artifact is missing links.
- **QG7 fail (age-inappropriate content)** → rerun `activities-planner` and/or `accommodation-planner` as applicable.
- **QG8 fail (no parking info)** → rerun `accommodation-planner`.

Max iterations: 3 (tracked via `iteration_count` in `workflow-state.json`).
