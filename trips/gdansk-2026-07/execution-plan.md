# Execution Plan — Gdansk 2-Day Car Trip

## Agents Required

**Transport Planning:**
- `car-planner` — route, stops, drive times, fuel, tolls, parking (confirmed CAR mode)

**Destination Planning (Destination Status: confirmed):**
- `weather` — per-stop forecast for Gdansk, July 17–18, 2026
- `accommodation-planner` — 1 night in Gdansk (Friday 17 Jul)
- `activities-planner` — attractions and activities for Gdansk (2-day pace)
- `food-planner` — restaurants and local food recommendations
- `packing-planner` — packing checklist for 2 adults, 1 night, car trip, Gdansk climate

**Integration & Validation:**
- `budget-aggregator` — aggregate all costs against 1,000 PLN budget
- `validator` — validate all artifacts against QG gates and requirements
- `daily-plan-builder` — merge all validated artifacts into day-by-day itinerary
- `html-builder` — render approved daily plan as standalone HTML guide

## Execution Groups

**Group 1 — Foundation (parallel):**
Dependency: `requirements.md` only
- `car-planner` — input: `requirements.md` → output: `transport.md` (v1)
- `weather` — input: `requirements.md` → output: `weather.md` (v1)

**Group 2 — Destination Planning (parallel):**
Dependency: `transport.md` (v1); `activities-planner` also reads `weather.md` (v1)
- `accommodation-planner` — input: `requirements.md`, `transport.md` (v1) → output: `accommodation.md` (v1)
- `activities-planner` — input: `requirements.md`, `transport.md` (v1), `weather.md` (v1) → output: `activities.md` (v1)
- `food-planner` — input: `requirements.md`, `transport.md` (v1) → output: `food.md` (v1)

**Group 3 — Packing & Budget (parallel):**
Dependency: `weather.md` (v1), `accommodation.md` (v1), `activities.md` (v1), `transport.md` (v1)
- `packing-planner` — input: `weather.md` (v1), `accommodation.md` (v1), `activities.md` (v1), `transport.md` (v1) → output: `packing.md` (v1)
- `budget-aggregator` — input: `transport.md` (v1), `accommodation.md` (v1), `activities.md` (v1), `food.md` (v1) → output: `budget.md` (v1)

**Sequential (after validation):**
- `validator` — input: `requirements.md`, all v1 planning artifacts → output: `validation.md` (v1)
- If PASS: `daily-plan-builder` — input: all latest artifacts + `weather.md` → output: `daily-plan.md` (v1, draft)
- On user approval: `html-builder` — input: approved `daily-plan.md` → output: `travel-guide.html`

## Quality Gates

| Gate | Condition | Owner(s) |
|------|-----------|---------|
| **QG-CITE** | Every recommendation in accommodation, activities, food, transport carries a real `http(s)://` link | All planners |
| **QG-BUDGET** | Total trip cost ≤ 1,000 PLN (from budget.md sum) | budget-aggregator, validator |
| **QG-CURRENCY** | All costs denominated in PLN (trip currency per requirements.md) | All planners, validator |
| **QG-TRAVEL-TIME** | No single car leg exceeds 6 hours (max daily travel limit from requirements.md assumptions) | car-planner, validator |
| **QG-TRANSPORT-MODE** | Transport artifact matches CAR mode (not flight/train) | car-planner, validator |
| **QG-STRUCTURE** | All artifacts have required sections, no placeholders remain, all cross-references resolve | artifact-validator skill |

## Iteration Strategy

Max iterations: 3 (see `workflow-state.json`).

**On FAIL:**
1. Identify failed gate(s) from `validation.md`.
2. Rerun minimal agent set:
   - **QG-CITE failures** → rerun the named planner(s); re-run all downstream (budget, validator, daily-plan)
   - **QG-BUDGET or QG-CURRENCY failures** → rerun `budget-aggregator` (and its feeders if costs are wrong); validate; if persists, rerun cost-bearing planner and budget-aggregator
   - **QG-TRAVEL-TIME or QG-TRANSPORT-MODE failures** → rerun `car-planner`; propagate to downstream
   - **QG-STRUCTURE failures** → fix artifact directly or rerun the agent
3. Write `iteration-plan-vN.md` (one per iteration) documenting failed gates and rerun scope.
4. Rerun agents; produce next versions; re-validate.

**Escalation (after 3 iterations):**
Stop and report unresolved failures. Do not present plan to user for approval if any gate is FAIL.
