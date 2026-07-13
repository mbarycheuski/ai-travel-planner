# Iteration Plan — Round 2

## Failed Gates

- **QG-BUDGET:** Trip cost (Scenario A: ibis accommodation + low food, no contingency) is **1,322 PLN**, exceeding the 1,300 PLN cap by **22 PLN (+1.7%)**.

## Root Cause

The recommended accommodation (ibis Gdańsk Stare Miasto at 271 PLN incl. parking) is too expensive for the tight 1,300 PLN budget. The `accommodation.md` artifact already identified a lower-cost alternative (Moon Hostel at 119 PLN + Interparking fallback at ~60 PLN = 179 PLN total), but it was listed as a secondary "budget alternative" rather than the primary recommendation.

## User Decision

No user input required; the validation report and iteration strategy provide clear guidance. Proceed with accommodation swap.

## Agents To Rerun

1. **accommodation-planner** — Re-dispatch to update the primary recommendation from ibis to Moon Hostel (which it already researched).
   - Output: `accommodation-v2.md` with Moon Hostel as the primary pick, saving 92 PLN.

2. **budget-aggregator** — Re-dispatch with the updated accommodation costs.
   - Input: `accommodation-v2.md` (Moon Hostel primary, 179 PLN)
   - Output: `budget-v3.md` (expected total: ~1,230 PLN, within budget)

## Guidance Per Agent

**accommodation-planner:**
- **Input:** `requirements-v2.md`, `transport.md`
- **Change:** Reverse the ranking — promote Moon Hostel (119 PLN room + ~60 PLN Interparking garage fallback if not booked on-site, total ~179 PLN) to the primary recommendation. Keep ibis as a secondary "upscale alternative" if desired, but the primary pick must be Moon Hostel to meet the budget gate.
- **Output:** `accommodation-v2.md` with all recommendation links and details preserved, but the primary pick reordered.
- **Rationale:** Validator explicitly recommends this swap (92 PLN savings) to close the budget gap and bring the trip to 1,230 PLN (70 PLN under cap, leaving a 5% contingency buffer).

**budget-aggregator:**
- **Input:** `requirements-v2.md`, all v1 planning artifacts except accommodation (use `accommodation-v2.md` instead)
- **Task:** Re-aggregate with Moon Hostel as the accommodation source.
- **Expected output:** `budget-v3.md` with total ≈1,230 PLN, status **PASS** against the 1,300 PLN cap.

---

**Revalidation:** After both agents complete, run `validator` again with the v2/v3 artifacts to confirm QG-BUDGET now PASS. All other gates should remain PASS.
