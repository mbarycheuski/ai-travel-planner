# Validation Result: FAIL

## Gate Results

| QG# | Gate | Result | Evidence |
| --- | ---- | ------ | -------- |
| QG-CITE | Every recommendation row (transport, accommodation, activities, food) carries a real `http(s)://` link | PASS | `transport.md` — 2/2 Legs rows + 3/3 Local Transport rows all have `Link` cells with valid URLs (conadrogach.pl, glosgdanska.pl, gdansk.pl). `accommodation.md` — 3/3 rows linked (moonhostel.pl, all.accor.com, hotel-bb.com). `activities.md` — 2/2 Friday rows + 5/5 Saturday rows linked (inyourpocket.com, bazylikamariacka.gdansk.pl, muzeumgdansk.pl, bilety.ecs.gda.pl). `food.md` — 7/7 Restaurants rows + 3/3 Local Food rows linked (pierogarnia-mandu.pl, restauracjakubicki.pl, pomelogdansk.pl, inyourpocket.com, pyrabar.pl, gdanskiewedzonki.pl). Total 25 recommendation rows checked across 4 artifacts, 0 missing links. `budget-v2.md` correctly exempt (cites source artifacts by name/section instead of URLs). |
| QG-BUDGET | Total trip cost ≤ 1,300 PLN (revised cap per `requirements-v2.md`) | **FAIL** | `budget-v2.md` § Against Limit: Scenario A (lowest-cost accommodation tier used + low-food, no contingency) = **1,322 PLN**, which is **+22 PLN (+1.7%) over** the 1,300 PLN cap. `budget-v2.md` itself records `**Status:** OVER LIMIT`. No scenario in the artifact comes in at or under 1,300 PLN — Scenario B (mid food) is 1,452 PLN (+152, +11.7%), and both contingency-adjusted variants (1,388 / 1,454 PLN) are further over. The requirement states the cap as a firm number ("Budget: Up to 1,300 PLN total... Budget cap: 1,300 PLN total"), with no stated tolerance for overage; a self-reported 1.7% miss against an explicit numeric ceiling is not treated as passing rounding — it is a real overage that must be closed by a cost change, not by definitional slack. |
| QG-CURRENCY | All costs in PLN (trip currency per `requirements-v2.md`) | PASS | `transport.md`, `accommodation.md` (final table values), `activities.md`, `food.md`, `budget-v2.md` all state figures in PLN. `accommodation.md` § Rationale discloses that ibis (241 PLN) and B&B (308 PLN) were sourced in USD ($61/$78) and converted at an assumed ~3.95 PLN/USD, but the values actually recorded in the table and used everywhere downstream are already in PLN — no artifact carries a raw USD figure into a cost row, so this is a disclosed assumption, not a currency-gate violation. |
| QG-TRAVEL-TIME | No single car leg exceeds 6 hours (assumed daily cap per `requirements-v2.md`) | PASS | `transport.md` § Legs: both legs (Łódź→Gdańsk and Gdańsk→Łódź) are `~3h 25min`, well under the 6-hour assumed ceiling (≈57% of the limit). |
| QG-TRANSPORT-MODE | Transport artifact matches CAR mode | PASS | `requirements-v2.md`: "Transport mode: car". `transport.md` § Mode: "Car (matches confirmed requirement...)"; no rental/flight/train content present. |
| QG-STRUCTURE | All artifacts have required sections, no placeholders remain, cross-references resolve | PASS | All six artifacts (`transport.md`, `weather.md`, `accommodation.md`, `activities.md`, `food.md`, `budget-v2.md`) have their required headers (Mode/Stops/Legs/Local Transport/Total, Accommodations/Recommended pick/Total, Activities by Day/Total, Restaurants/Local Food/Total, Budget Breakdown/Estimated Total/Against Limit) populated with concrete data. No `TBD`/`TODO`/`[placeholder]` tokens found. Cross-references (`transport.md`'s Interparking cost reused in `accommodation.md` and `budget-v2.md`; `weather.md`'s rain-risk figures reused in `activities.md`) resolve consistently. |

## Findings

### QG-BUDGET — FAIL

**Issue:** The trip's own lowest-cost scenario (Scenario A: recommended ibis accommodation + cheapest food selections, no contingency buffer) totals **1,322 PLN**, exceeding the revised 1,300 PLN cap by **22 PLN (1.7%)**. Every other scenario in `budget-v2.md` is further over (up to +152 PLN / +11.7%). `budget-v2.md` self-labels its status as "OVER LIMIT" — this is not a borderline pass, it is the budget-aggregator's own finding.

**Responsible artifact/agent:** `budget-v2.md` (budget-aggregator), with the root cost driver traceable to `accommodation.md` (accommodation-planner)'s recommended pick.

**Recommendation (concrete, quantified):** Close the 22 PLN gap by changing the accommodation selection, which has the largest available swing:
- Switch from the recommended **ibis Gdańsk Stare Miasto (271 PLN incl. parking)** to **Moon Hostel + Interparking Centrum fallback (119 + 60 = 179 PLN)**, a saving of **92 PLN** — this alone brings Scenario A to **1,230 PLN**, 70 PLN (5.4%) *under* the 1,300 PLN cap, leaving headroom to also absorb a 5% contingency buffer (1,230 × 1.05 ≈ 1,292 PLN, still under cap).
- Alternatively, if the ibis pick is kept for its parking/reliability advantages, trim **at least 25 PLN** from the food estimate (e.g., drop the optional 15–25 PLN smoked-fish snack in `food.md` and select the lower end of the Saturday-breakfast range) to bring Scenario A to ≈1,290–1,297 PLN — but this leaves **zero contingency margin**, so the hostel-swap option is the more robust fix.
- Rerun scope per `execution-plan.md` Iteration Strategy: this is a QG-BUDGET failure → rerun `budget-aggregator` with the corrected accommodation tier (and `accommodation-planner` only if the recommended pick itself needs to change), then re-validate.

## Baseline Checks

- **Budget total ≤ user limit:** FAIL — see QG-BUDGET above (1,322 PLN vs 1,300 PLN cap).
- **Trip currency (PLN) in every cost-bearing artifact:** PASS — see QG-CURRENCY.
- **Daily travel time ≤ user limit:** PASS — see QG-TRAVEL-TIME (3h25m per leg vs 6h assumed ceiling).
- **Transport mode matches confirmed requirement:** PASS — see QG-TRANSPORT-MODE.
- **QG-CITE citation coverage:** PASS — 25/25 recommendation rows across `transport.md`, `accommodation.md`, `activities.md`, `food.md` carry valid links; `budget-v2.md` exempt.
- **All mandatory requirements satisfied:** Destination, dates, 1 night, car mode, 2 adults all reflected consistently across artifacts. Budget requirement (1,300 PLN cap) is the one mandatory requirement **not** satisfied (see QG-BUDGET).
- **No duplicate attractions (`activities.md`):** PASS — 7 distinct activity rows; the Motława Embankment appears once on Friday (night stroll) and once on Saturday (daytime walk), explicitly justified in `activities.md` § Rationale as a distinct day/night experience, not a duplicate booking.
- **Every day has ≥1 meaningful activity:** PASS — Friday (2 free evening activities) and Saturday (5 activities incl. 3 paid attractions + waterfront walk + lunch).
- **Accommodation matches preferences:** PASS — no explicit stars/parking/accessibility preference stated in `requirements-v2.md`; `accommodation.md` assumes a budget-to-mid-range 2–3★ option with guaranteed parking (car mode), consistent with the recorded assumption, and the recommended ibis pick satisfies it.
- **Dietary constraints satisfied:** PASS (vacuously + courtesy) — `requirements-v2.md` states none; `food.md` nonetheless notes a vegetarian option at every venue.
- **No unresolved placeholders/missing info:** PASS — see QG-STRUCTURE.

## Overall

**FAIL** — 5 of 6 gates PASS; **QG-BUDGET FAILs** because the trip's best-case scenario (1,322 PLN) exceeds the 1,300 PLN cap by 22 PLN. This is a genuine overage (not a rounding artifact — it is the budget-aggregator's own computed, labeled "OVER LIMIT" result) and must be resolved before proceeding to `daily-plan-builder`. Recommended fix: swap to the Moon Hostel + Interparking accommodation combination (saves 92 PLN), then rerun `budget-aggregator` and re-validate as iteration round 2.
