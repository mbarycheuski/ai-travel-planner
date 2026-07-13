# Execution Plan

## Agents Required

- `flight-planner` — transport mode confirmed as FLIGHT (Warsaw → Lisbon)
- `weather` — destination confirmed (Lisbon), so scheduled now
- `accommodation-planner`
- `activities-planner`
- `food-planner`
- `packing-planner` — destination confirmed, scheduled now
- `budget-aggregator`
- `validator`
- `daily-plan-builder`
- `html-builder`

## Execution Groups

- **Group 1** (parallel, depend only on `requirements.md`):
  - `flight-planner` → `transport.md`
  - `weather` → `weather.md`
- **Group 2** (parallel, depend on `transport.md`'s `## Stops & Nights`):
  - `accommodation-planner` → `accommodation.md`
  - `activities-planner` → `activities.md`
  - `food-planner` → `food.md`
- **Group 3** (parallel, mutually independent):
  - `packing-planner` → `packing.md` (needs `weather.md`, `activities.md`, `accommodation.md`)
  - `budget-aggregator` → `budget.md` (needs `transport.md`, `accommodation.md`, `activities.md`, `food.md`)
- **Group 4** (sequential): `validator` → `validation.md`
- **Group 5** (sequential): `daily-plan-builder` → `daily-plan.md`
- **Group 6** (sequential, after human approval): `html-builder` → `travel-guide.html`

## Quality Gates

- **QG1**: Budget total ≤ 3500 EUR (all-in: flights, hotel, food, activities for 2 adults + 2 children).
- **QG2**: All costs across all artifacts expressed in EUR (trip currency per `requirements.md`).
- **QG3**: Daily travel/activity legs stay light — no single travel leg materially exceeding ~2 hours, consistent with the heat/pacing constraint (assumption in `requirements.md`).
- **QG4**: No duplicate attractions/activities recommended across days or artifacts.
- **QG5**: Transport mode matches confirmed mode (flight) — no train/car content in `transport.md`.
- **QG-CITE**: Every recommendation row in `transport.md`, `accommodation.md`, `activities.md`, `food.md` carries a real `http(s)://` source link (exceptions: `budget.md`, `packing.md`'s `## Sources`, `weather.md`'s per-stop method).
- **QG6**: Itinerary pacing respects minimal-walking/heat constraint — activities favor shaded/indoor options, short walking legs, midday downtime, consistent with young children (ages 5, 8) and August heat.
- **QG7**: At least one nearby-beach day trip included, matching the traveler's stated preference.
- **QG8**: Activities and restaurants are family/child-appropriate (ages 5 and 8) — no adult-only or inappropriate recommendations.
- **QG9**: No internal-artifact filenames leak into `daily-plan.md` or `travel-guide.html`.

## Iteration Strategy

- QG1/QG2 fail → rerun `budget-aggregator` (and the specific cost-bearing agent(s) whose figures are wrong or mis-currencied), then re-validate.
- QG3/QG6 fail (pacing/travel-time) → rerun `flight-planner` and/or `activities-planner` depending on which artifact violates pacing, then `budget-aggregator` if costs shift.
- QG4 fail (duplicates) → rerun `activities-planner` (and `food-planner` if duplication spans food/activity overlap).
- QG5 fail → rerun `flight-planner`.
- QG-CITE fail → rerun only the specific agent(s) whose artifact is missing citations.
- QG7 fail (no beach trip) → rerun `activities-planner`.
- QG8 fail → rerun `activities-planner` and/or `food-planner`.
- QG9 fail → rerun `daily-plan-builder`.
- Max iterations: 3. On exhaustion, stop and report unresolved failures rather than proceeding to daily-plan/HTML.
- No deferred agents — Destination Status is confirmed, so `weather` and `packing-planner` run in their normal groups above (no deferral needed).
