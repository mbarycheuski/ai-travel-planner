# Budget

## Budget Breakdown

| Category                 | Cost  | Source Artifact |
| ------------------------ | ----- | --------------- |
| Transport: Fuel          | $65   | `transport.md` — ## Estimated Transport Total (590 km round trip @ 7 L/100 km, ~$1.58/L) |
| Transport: Tolls         | $19   | `transport.md` — ## Estimated Transport Total (A4 Katowice–Kraków section, 2 directions) |
| Transport: Parking       | $32   | `accommodation.md` — ## Rationale & Assumptions (on-site hotel parking ~120 PLN/night ≈ $32; corrected from `transport.md`'s original ~$20 placeholder) |
| Accommodation            | $115  | `accommodation.md` — ## Estimated Accommodation Total (Mercure Kraków Stare Miasto, Superior Room, 1 night) |
| Activities               | $154  | `activities.md` — ## Estimated Activities Total (Wawel State Rooms $88 + Rynek Underground $37 + Cloth Hall $0 + St. Mary's Basilica $16 + Dragon's Den $13 + Vistula Boulevards $0) |
| Food                     | $192  | `food.md` — ## Estimated Food Cost (Hard Rock Café $65 + Pod Aniołami $80 + Milkbar Tomasza $27 + snacks/treats $20) |
| **Subtotal**             | **$577** | |
| Contingency (10%)        | **$58** | Assumption: see ## Assumptions section |
| **Estimated Total**      | **$635** | |

## Estimated Total

**$577** (transport + accommodation + activities + food) + **$58** (contingency)
= **$635**

### Arithmetic Detail

- **Transport:** $65 + $19 + $32 = $116
- **Accommodation:** $115
- **Activities:** $154
- **Food:** $192
- **Subtotal:** $116 + $115 + $154 + $192 = $577
- **Contingency (10% of $577):** $577 × 0.10 = $57.70 ≈ $58
- **Grand Total:** $577 + $58 = **$635**

## Against Limit

**Traveler's stated budget limit:** $1,000–1,500 total (accommodation + food + activities + fuel)  
**Estimated total with contingency:** $635  
**Status:** **UNDER** limit by $365 (relative to lower bound of $1,000) and **UNDER** by $865 (relative to upper bound of $1,500)

The trip is **well within budget**, leaving substantial headroom (~$365–$865) for actual variations in dining choices, optional activities, or unplanned spend.

## Assumptions

- **Contingency percentage:** A flat **10% contingency** is applied to the subtotal ($577 × 0.10 = ~$58) to account for small variations in actual prices, currency fluctuations, and minor unplanned spend. This is a standard planning buffer for a 2-day family trip with confirmed rates.

- **Parking rate correction:** `accommodation.md` (## Rationale & Assumptions) flags that the hotel's confirmed on-site parking rate is **~120 PLN/night ≈ $32**, higher than the mid-range placeholder (~$20) originally used in `transport.md` (## Estimated Transport Total). Per the accommodation planner's note ("This $32 figure should be used to update the transport plan..."), the **corrected $32 parking figure is used in this aggregation**, not the original $20. Both artifacts are cited.

- **Exchange rate consistency:** All PLN-to-USD conversions use approximately **PLN 3.77 = $1 USD**, consistent with the rate applied in `transport.md`'s fuel-cost sourcing (GlobalPetrolPrices) and carried through `activities.md` and `food.md`.

- **Meal count and breakfast assumption:** `food.md` assumes the hotel includes breakfast on Day 2 or that the family has a light/complimentary breakfast there; only 3 main paid meals (Day 1 lunch, Day 1 dinner, Day 2 breakfast/lunch) plus snacks are costed, totaling $192. If the hotel does not include Day 2 breakfast, a 4th meal (~$15–25) may be needed; contingency should absorb this.

- **Activities pricing:** Rynek Underground pricing (~$37 for a family of 4) is based on a mid-range estimate since the official page does not publish an exact bundled family-ticket price; verify at time of booking. All other activity prices (Wawel State Rooms, Cloth Hall, St. Mary's Basilica, Dragon's Den, Vistula Boulevards) are sourced directly from official venue pages.

- **Food cost is a midpoint estimate:** The food total ($192) uses mid-point estimates for meal ranges (e.g., Hard Rock Café $53–74 midpoint = $65) and assumes moderate portion ordering and possible sharing between children; actual spend will vary with menu choices, beverages, and individual family preferences.

- **No additional transport costs assumed:** Beyond fuel, tolls, and hotel parking, no car rental, additional fuel, or local public transport costs are included — the family is assumed to travel in their own car (per `requirements.md` and `transport.md`'s rationale) and move entirely on foot within Kraków after parking.
