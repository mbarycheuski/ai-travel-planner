# Iteration Plan v1 — Minsk 2026-07

## Failed Gates

- **QG1 (Budget ceiling ≤500 BYN) — FAIL.** The plan's own labeled "RECOMMENDED" options (accommodation Option 1 Kirova St. 100 BYN, food.md's Vasilki sit-down dinner 80 BYN + bakery breakfast 32 BYN, activities.md's mid/high-end activity pricing) aggregate to ≈587 BYN (≈534 pre-contingency) — 87 BYN over the ceiling even before contingency is fully applied. The ≈497 BYN figure in budget.md is only a hypothetical re-derivation using options that accommodation.md/food.md do not actually recommend.
- **QG6 (Cross-artifact consistency) — FAIL.** budget.md carries two contradictory totals (≈587 BYN vs ≈497 BYN) because its cheaper total assumes options that accommodation.md and food.md have not adopted as their stated recommendation. The artifacts are internally inconsistent about what the "recommended" plan actually is.

Both failures share one root cause: the cost-bearing artifacts (accommodation, food, activities) have not been updated to make their *own* "recommended" choice the budget-compliant one. Fixing that resolves both gates simultaneously — no separate QG6-only rework is needed.

## Agents To Rerun

Minimal set, in order:

1. **accommodation-agent** (parallel with 2, 3)
2. **food-agent** (parallel with 1, 3)
3. **activities-agent** (parallel with 1, 2)
4. **budget-agent** (after 1–3 complete)

**transport-agent is NOT rerun.** Its stated range (15–25 BYN) already contains a compliant low-end figure; the savings already available from accommodation (~14 BYN), food (~56 BYN), and activities (~13 BYN) — combined ~83 BYN — clear the ~79.5 BYN pre-contingency shortfall on their own, so no artifact change is required from transport.md. budget-agent may simply select the low end of the existing range when recomputing; this is a computation choice, not a rerun trigger.

route-agent and packing-agent are unaffected (QG2–QG5, QG7 all passed) and are not rerun.

## Guidance Per Agent

- **accommodation-agent** → produce `accommodation-v2.md`. Read `route.md` and current `accommodation.md`. Change the labeled "RECOMMENDED" option from Option 1 (Kirova St., 100 BYN) to Option 3 (Ploshchad Pobedy, 86 BYN) — i.e., make the cheaper option the actual recommendation, not just a listed alternative. Do not invent new options; only re-label/adjust the existing recommendation.

- **food-agent** → produce `food-v2.md`. Read `route.md`, `activities.md` (current), and current `food.md`. Change the Day 1 dinner recommendation from Vasilki (sit-down, ~80 BYN) to the existing "Pizza (budget backup)" option (~56 BYN), and change the Day 2 breakfast recommendation from the bakery (~32 BYN) to self-catering from the apartment kitchen (0 BYN — contingent on accommodation-v2's apartment having kitchen access). Make these the stated "RECOMMENDED" choices, not just fallback mentions.

- **activities-agent** → produce `activities-v2.md`. Read `route.md` and current `activities.md`. Adopt the low end of the already-stated cost ranges as the planning figures: Gorky Park at 15 BYN (not the midpoint) and Central Botanical Garden at 22 BYN (not the midpoint/high end). No change to activity selection, sequencing, or timing — cost figures only.

- **budget-agent** → produce `budget-v2.md`. Read `accommodation-v2.md`, `food-v2.md`, `activities-v2.md`, and the existing `transport.md` (unchanged; use the 15 BYN low end of its stated local-transport range as the planning figure). Recompute a single, non-contradictory total reflecting only the artifacts' actual "RECOMMENDED" selections (expected ≈497 BYN or lower after the 10% contingency). Remove or clearly relabel any superseded ≈587 BYN figure as a "pre-trim, do-not-use" reference. Note remaining headroom (or lack thereof) against the 500 BYN ceiling given the trimmed total sits close to the limit.
