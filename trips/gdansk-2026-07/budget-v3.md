# Budget

## Budget Breakdown

| Category                                               | Cost       | Source Artifact                                                                                           |
| ------------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------- |
| Transport                                              | 427 PLN    | `transport.md` — ## Estimated Transport Total                                                            |
| Accommodation (Moon Hostel + parking)                  | ~179 PLN   | `accommodation.md` — Moon Hostel alternative (room 119 PLN + Interparking fallback 60 PLN)               |
| Activities (Saturday, excl. lunch)                     | 194 PLN    | `activities.md` — ## Estimated Activities Total (Saturday: 40 + 74 + 0 + 80 = 194 PLN)                   |
| Food (2 adults, low-cost scenario)                    | 430 PLN    | `food.md` — ## Estimated Food Cost (Fri dinner + Sat breakfast/lunch/dinner, no snack)                   |
| **Subtotal**                                           | **1,230 PLN** |                                                                                                           |
| Contingency (5% assumption — see Assumptions)          | ~62 PLN    | Buffer for unforeseen costs (fuel price variance, toll rate change, meal overages)                       |
| **Total with Contingency**                             | **~1,292 PLN** |                                                                                                           |

## Estimated Total

**Scenario A (Moon Hostel + low-cost food):** 1,230 PLN  
**Arithmetic:**
- Transport: 427 PLN (fuel 307 + toll 59.80 + parking 60)
- Accommodation: 179 PLN (Moon Hostel room 119 + Interparking 60)
- Activities: 194 PLN (St. Mary's tower 40 + Amber Museum 74 + ECS 80)
- Food: 430 PLN (Fri dinner 50 + Sat breakfast 52.50 + Sat lunch 30 + Sat dinner 100 for party of 2)
- **= 427 + 179 + 194 + 430 = 1,230 PLN**

**With 5% contingency buffer:** 1,230 × 1.05 ≈ **1,292 PLN**

## Against Limit

**Budget cap (per requirements-v2.md):** 1,300 PLN  
**Scenario A total (without contingency):** 1,230 PLN  
**Status:** **PASS** — 70 PLN under cap (5.4% margin)

**With contingency (5%):** 1,292 PLN  
**Status with contingency:** **PASS** — 8 PLN under cap (0.6% margin)

The Moon Hostel accommodation swap (from ibis at 271 PLN to Moon Hostel + Interparking at 179 PLN) saves 92 PLN, bringing the trip from 1,322 PLN (v2) to 1,230 PLN (v3), and now comfortably passes the 1,300 PLN budget cap with a usable contingency buffer.

## Assumptions

- **Trip currency:** all costs are quoted in PLN (trip currency per `requirements.md`); no currency conversion was applied.
- **Accommodation primary:** Moon Hostel private double room (119 PLN/night from official website) with parking fallback to Interparking Centrum Gdańsk (~60 PLN per `transport.md`), chosen for budget optimization over the previously recommended ibis (241 PLN room + 30 PLN parking = 271 PLN). Moon Hostel's parking is normally reserved in advance per `accommodation.md` notes; using Interparking fallback removes that booking risk for a late Friday arrival.
- **Activities cost:** 194 PLN covers Saturday paid attractions only (St. Mary's Basilica tower, Amber Museum, European Solidarity Centre) excluding lunch; the lunch cost (40–60 PLN) is budgeted separately under Food. Friday evening walk is free (0 PLN).
- **Food cost (low scenario):** 430 PLN uses the lower estimates from `food.md` for each meal: Pierogarnia Mandu Friday dinner (~50 PLN/person), Pomelo breakfast (~52.50/person), Bar Mleczny Neptun lunch (~30/person), Restauracja Kubicki dinner (~100/person for 2 adults). Excludes optional smoked-fish snack.
- **Contingency buffer:** 5% applied to 1,230 PLN subtotal (= 62 PLN) as a safety margin for fuel price variance (PB95 prices fluctuate day-to-day), possible meal overages, or minor toll/parking adjustments. This is a planning assumption; actual final cost depends on real-time vehicle fuel consumption, market rates on 17–18 Jul 2026, and traveler choices among listed options.
- **No currency conversion uncertainty:** all source costs were quoted natively in PLN (Moon Hostel official site, `transport.md` fuel/toll/parking, `activities.md` museum tickets, `food.md` restaurant prices), so no FX assumption variance applies (unlike v2's ibis rate conversion).
