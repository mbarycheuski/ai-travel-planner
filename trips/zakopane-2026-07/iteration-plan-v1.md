# Iteration Plan v1

## Failed Gates

- **QG1 — Budget cap.** `validation.md`: nominal total 2,945.6 PLN is only 54.4 PLN
  (1.8%) under the 3,000 PLN ceiling, with zero contingency and multiple
  unverified line items (accommodation ±100 PLN, two unpriced activity fees
  ≈74 PLN, food entirely model-based) whose documented uncertainty exceeds the
  remaining headroom. Recommendation: trim ≥150 PLN to restore real buffer.

## Agents To Rerun

- `accommodation-planner` — use the low end of its own cited 900–1,100 PLN
  range (900 PLN) or find a directly-quoted lower-cost qualifying option, to
  remove ~100 PLN of uncertainty.
- `food-planner` — trim the per-meal cost model by ~10% (e.g. substitute one
  sit-down dinner for a cheaper/self-catered option) to save ≈90 PLN.
- `budget-aggregator` — re-roll up totals from the new `accommodation-v2.md`
  and `food-v2.md`, confirm QG1 now passes with real headroom (target ≤2,800
  PLN, leaving ≥200 PLN buffer).

No other artifacts are affected — transport, weather, activities, and packing
did not change and are not rerun.

## Guidance Per Agent

- **accommodation-planner**: Re-read `trips/zakopane-2026-07/accommodation.md`
  (your own prior output) plus `requirements-v2.md`. Keep Hotel Helios if you
  select the low end (900 PLN for 2 nights, i.e. ≈450 PLN/night) IF you can
  find a source pinning down the lower end of the range with more confidence,
  OR select a comparably-featured (verified pool, family-friendly, ≤900 PLN/2
  nights) alternative with a more directly-quoted rate. The pool requirement
  (QG6) and free parking are still hard requirements — do not regress them.
  Write to `trips/zakopane-2026-07/accommodation-v2.md`.
- **food-planner**: Re-read `trips/zakopane-2026-07/food.md` (your own prior
  output). Cut ≈90 PLN from the 942 PLN meal total — e.g. swap one of the
  three sit-down dinners (Bistro Schronisko Krupówki or Krupowa Izba) for a
  cheaper milk-bar dinner, or reduce the assumed per-meal PLN figures toward
  the lower end of comparable venues found. Keep all picks family/kid-friendly
  (QG7) and cited (QG5). Write to `trips/zakopane-2026-07/food-v2.md`.
- **budget-aggregator**: Wait for both reruns above. Re-read
  `transport.md` (unchanged, use the corrected 386.6 PLN figure),
  `accommodation-v2.md`, `activities.md` (unchanged, 559 PLN), and
  `food-v2.md`. Recompute the total and confirm it now sits at ≥200 PLN (≈7%)
  under the 3,000 PLN ceiling. Write to
  `trips/zakopane-2026-07/budget-v2.md`.
