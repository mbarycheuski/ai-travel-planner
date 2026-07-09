# Execution Plan — Minsk, Belarus (2026-07-04 to 2026-07-05)

## Agents Required
- **route-agent** — Trivial for this trip (single destination loop Brest → Minsk → Brest), but still required to document train timing constraints that govern the sightseeing window (arrival window Day 1, departure window Day 2).
- **packing-agent** — Family with two young children (5, 8), summer season, 1 night.
- **transport-agent** — Intercity train Brest↔Minsk (times/options) + in-city Minsk transport (metro/bus/walking).
- **accommodation-agent** — One night, central Minsk, budget-friendly, family room/apartment for 4.
- **activities-agent** — Museums/culture (interactive/kid-friendly) and parks/nature, suited to ages 5 and 8, fitted into the train-constrained window.
- **food-agent** — Budget-friendly meals for a family of 4, no dietary restrictions.
- **budget-agent** — Aggregate total cost vs. 300–500 BYN target.

All seven agents are justified by the requirements; none are skipped.

## Execution Groups

### Group A — No dependencies (parallel)
- `route-agent`: Establishes the Brest→Minsk→1 night→Minsk→Brest structure and, critically, the train arrival/departure timing constraints that bound the usable sightseeing hours on Day 1 and Day 2.
- `packing-agent`: Depends only on destination, season, and traveler profile (2 adults + kids 5 & 8) — all known from requirements, no dependency on other agents.

### Group B — Depends on Group A output (specifically route-agent's timing window) (parallel)
- `transport-agent`: Needs route-agent's train-leg framing to select specific train times/tickets and plan in-city transport around the arrival/departure window.
- `accommodation-agent`: Needs route-agent's confirmation of "1 night in Minsk, central" to select a hotel/apartment.
- `activities-agent`: Needs route-agent's sightseeing window (bounded by train times) to fit museums/parks into Day 1 (post-arrival) and Day 2 (pre-departure).
- `food-agent`: Needs the same day-window and (loosely) accommodation area to suggest budget-friendly meal locations near lodging/activities.

### Group C — Depends on Group B (all four outputs)
- `budget-agent`: Aggregates transport + accommodation + activities + food costs into a total, checked against the 300–500 BYN budget tier for the group of 4.

**Max iterations cap: 3** (across the full plan → validate → targeted-iteration cycle).

## Quality Gates

- **QG1 (Budget ceiling):** Total cost from budget-agent (transport + accommodation + activities + food) is ≤ 500 BYN, ideally within 300–500 BYN, for all 4 travelers.
- **QG2 (Train-window feasibility):** All activities/food items scheduled on Day 1 occur after the train's Minsk arrival time, and all Day 2 items conclude with enough buffer before the return train's departure time (per route-agent's stated window).
- **QG3 (Age-appropriateness):** Every activity is suitable for both a 5-year-old and an 8-year-old (no excessive walking/duration, no age-inappropriate content); packing list matches both children's needs.
- **QG4 (Interest coverage):** At least one museum/culture activity AND at least one park/nature activity are included, consistent with "Main interests."
- **QG5 (Accommodation fit):** Accommodation is a single night, central Minsk, budget-tier, and sleeps/fits a family of 4 (family room or apartment).
- **QG6 (Cross-artifact consistency):** Locations, dates, and times referenced across route, transport, accommodation, activities, and food artifacts agree with each other (no contradictions, no orphaned references) and no unresolved placeholders remain in any artifact.
- **QG7 (Dietary/logistics defaults honored):** Food recommendations require no special dietary accommodation (per stated assumption) and are walkable/transit-accessible from accommodation or activity locations, consistent with budget-tier local transport assumptions.

## Iteration Strategy

- **QG1 fails (over budget):** Rerun `accommodation-agent` and `food-agent` (cheaper options) and `activities-agent` (cut/replace paid activities) → then rerun `budget-agent`.
- **QG2 fails (train-window infeasibility):** Rerun `route-agent` (re-confirm/clarify timing constraints) → then rerun `transport-agent`, `activities-agent`, and `food-agent` (re-sequence around the corrected window) → then `budget-agent` if costs changed.
- **QG3 fails (age-appropriateness):** Rerun `activities-agent` (swap unsuitable items) and `packing-agent` if packing list is implicated → then `budget-agent` if costs changed.
- **QG4 fails (interest coverage gap):** Rerun `activities-agent` only → then `budget-agent` if costs changed.
- **QG5 fails (accommodation fit):** Rerun `accommodation-agent` only → then `budget-agent`.
- **QG6 fails (cross-artifact inconsistency):** Rerun only the specific agent(s) whose artifact contains the inconsistency/placeholder; if the inconsistency traces back to route-agent's timing data, rerun `route-agent` first, then downstream Group B agents that consumed the wrong data.
- **QG7 fails (food logistics/dietary):** Rerun `food-agent` only → then `budget-agent` if costs changed.

In every case, `budget-agent` is rerun last if any upstream cost-affecting agent (transport, accommodation, activities, food) was rerun, since it depends on all four.

**Cap:** Maximum 3 full iteration cycles. If quality gates still fail after 3 cycles, escalate to the user with a summary of the persistent failure(s) rather than continuing to iterate.
