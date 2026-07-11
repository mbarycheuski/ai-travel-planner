# Execution Plan

## Agents Required

- Transport planner (exactly one, per confirmed mode CAR): `car-planner`
- `weather-planner` — Destination Status is `confirmed`, so it runs from the start.
- `accommodation-planner`
- `activities-planner`
- `food-planner`
- `packing-planner` — runs after weather/activities/accommodation/car (car trip, so it also waits on `transport.md`)
- `budget-aggregator`
- `validator` (always)
- `daily-plan-builder` (always)
- `html-builder` (always, post-approval)

## Execution Groups

- **Group A** (needs only `requirements-v2.md`): `car-planner`, `weather-planner` — run in parallel.
- **Group B** (needs Group A's `transport.md` for stops/route): `accommodation-planner`, `activities-planner`, `food-planner` — run in parallel.
- **Group C** (needs Groups A+B outputs — weather, activities, accommodation, transport for a car trip): `packing-planner`, `budget-aggregator` — run in parallel.
- **Validation**: `validator` after Group C.
- **Daily plan**: `daily-plan-builder` after validation PASS.
- **HTML**: `html-builder` after traveler approval.

## Quality Gates

- **QG1 — Budget cap**: Total trip cost ≤ 3000 PLN (traveler's stated ceiling; target range 2000–3000 PLN) for the family of 4 across transport, accommodation (2 nights), food, and activities.
- **QG2 — Daily travel time**: Driving time per day within the assumed ~4–5 hour one-way tolerance; no day should require excessive additional driving beyond the Łódź↔Zakopane legs plus local transfers.
- **QG3 — No duplicate attractions**: No attraction/activity listed more than once across the itinerary.
- **QG4 — Transport mode match**: `transport.md` must describe CAR travel (route, drive times, parking, fuel/tolls) — no other mode.
- **QG5 — QG-CITE**: Every recommendation row in every content artifact (`transport.md`, `accommodation.md`, `activities.md`, `food.md`, `packing.md` sources, `weather.md` method note) carries a real `http(s)://` markdown link to its source.
- **QG6 — Accommodation pool requirement**: The selected hotel(s) in `accommodation.md` must explicitly have a swimming pool, with the source link substantiating it.
- **QG7 — Kid-suitability**: Activities and food recommendations must be appropriate for children aged 5 and 8 (no adults-only venues, no activities requiring capabilities young children lack, e.g. long unassisted hikes).

## Iteration Strategy

Max iterations: 3. On FAIL, rerun only the minimal agent set per failed gate:

- QG1 (budget) → `budget-aggregator` + `accommodation-planner` (and/or `activities-planner`/`food-planner` if their costs are the driver).
- QG2 (daily travel time) → `car-planner` + `activities-planner` (adjust route/stops or trim activity spread).
- QG3 (duplicate attractions) → `activities-planner`.
- QG4 (transport mode mismatch) → `car-planner`.
- QG5 (QG-CITE) → only the specific agent(s) whose artifact has uncited rows.
- QG6 (pool requirement) → `accommodation-planner`.
- QG7 (kid-suitability) → `activities-planner` and/or `food-planner`, whichever artifact has the unsuitable entries.
  Any rerun that changes a downstream-consumed artifact (e.g. new `transport.md` stops) also triggers a rerun of the artifacts that consumed it (e.g. `accommodation-planner`, `activities-planner`, `packing-planner`).
