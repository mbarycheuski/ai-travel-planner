# Transport Plan — Flight

## Mode

Flight (matches confirmed requirement: "Transport mode: flight")

## Stops & Nights

| Order | Stop            | Nights | Purpose                                                                                     |
| ----- | --------------- | ------ | -------------------------------------------------------------------------------------------- |
| 1     | Lisbon, Portugal | 4      | Single-base family stay (Aug 1 arrival – Aug 5 departure); day trips to Cascais/Estoril from here |

## Legs

| #   | From → To                          | Day/Date        | Detail                                                                                                  | Duration            | Est. Cost                                   | Link                                                                                     |
| --- | ----------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- | -------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Warsaw Chopin (WAW) → Lisbon (LIS)  | Sat, Aug 1, 2026  | Wizz Air, nonstop, main-airport departure (no Modlin transfer needed); economy, standard cabin bag       | ~3h50m–4h20m nonstop | €230/person round-trip est. × 4 = €920 total (see Rationale) | [Wizz Air Warsaw–Lisbon route & fares (Trip.com aggregator)](https://us.trip.com/flights/warsaw-to-lisbon/airfares-waw-lis/) |
| 2   | Airport (LIS) → Hotel, Lisbon       | Sat, Aug 1, 2026  | Taxi / Bolt / Uber from Humberto Delgado Airport to central Lisbon — door-to-door, no walking, no transfers, ~15–20 min (fits the ≤1 hr transfer assumption easily) | ~15–20 min           | ~€15–20 (one car, fits family of 4 + luggage) | [World Taximeter — Lisbon Airport to Baixa-Chiado fare estimate](https://www.worldtaximeter.com/lisbon/Lisbon+airport/baixa+chiado) |
| 3   | Hotel, Lisbon → Airport (LIS)       | Wed, Aug 5, 2026  | Taxi / Bolt / Uber return transfer, same route reversed                                                  | ~15–20 min           | ~€15–20                                      | [World Taximeter — Lisbon Airport to Baixa-Chiado fare estimate](https://www.worldtaximeter.com/lisbon/Lisbon+airport/baixa+chiado) |
| 4   | Lisbon (LIS) → Warsaw Chopin (WAW)  | Wed, Aug 5, 2026  | Wizz Air, nonstop return, same fare structure as outbound (included in round-trip total above)           | ~3h50m–4h20m nonstop | (included in row 1 total)                    | [Wizz Air Warsaw–Lisbon route & fares (Trip.com aggregator)](https://us.trip.com/flights/warsaw-to-lisbon/airfares-waw-lis/) |

## Local Transport

| Stop   | Option                                                              | Est. Cost                                            | Link                                                                                   |
| ------ | -------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Lisbon | Taxi / Bolt / Uber for in-city trips (recommended over metro given minimal-walking / heat constraint and two young children) | ~€8–18 per ride depending on distance/time of day     | [World Taximeter — Lisbon fare estimator](https://www.worldtaximeter.com/lisbon/Lisbon+airport/baixa+chiado) |
| Lisbon | Navegante 24-hour public transport pass (Metro + Carris bus/tram) — for days the family prefers transit over taxis | €7.25 per person per day (Navegante card itself €0.50 one-time, reusable) | [Metropolitano de Lisboa — ticket prices](https://www.metrolisboa.pt/en/buy/) |
| Lisbon | Combined 24h pass incl. CP suburban trains (needed for the Cascais/Estoril day trip) | €11.40 per person per day                             | [Metropolitano de Lisboa — ticket prices](https://www.metrolisboa.pt/en/buy/) |
| Lisbon | CP suburban train, Cais do Sodré ↔ Cascais/Estoril (for the optional beach day trip; ~33–40 min each way, within the ≤1 hr assumption) | €2.30 per person per single trip (no return ticket sold; buy two singles), or covered by the €11.40 combined day pass above | [Cascais Portugal Tourism — Cais do Sodré to Cascais train guide](https://www.cascaisportugaltourism.com/transportation/lisbon-to-cascais-trains-from-cais-do-sodre.html) |

## Estimated Transport Total

- Round-trip flights, 4 travelers: €230 × 4 = **€920**
- Airport transfer, Lisbon (arrival + departure), 1 car each way for the family: €18 + €18 = **€36**
- Local transport in Lisbon (4 nights, taxi-first with one Cascais day-trip using the combined day pass): estimated **€150–€200** allowance (owned/priced in detail by activities-planner day-by-day; shown here as a planning placeholder only)

**Transport total (flights + airport transfers): €920 + €36 = €956** (party of 4, EUR)

## Rationale & Assumptions

- **Flight choice**: Wizz Air was selected over TAP Air Portugal and LOT Polish Airlines because it operates nonstop from Warsaw **Chopin** (WAW, the main Warsaw airport — no separate transfer to Modlin needed, unlike some other Ryanair/low-cost routings) directly to Lisbon (LIS), keeping the family to a single ~4-hour flight leg with no connections, consistent with the "no long layovers, comfortable pace" constraint. TAP fares researched for these dates ran materially higher (~€597+ round trip per person per flytap.com search results), which would jeopardize the €3,500 total trip budget; Wizz Air fares researched in the €181–€260 round-trip-per-person range are assumed more compatible with budget. **Assumption**: exact fare for the specific Aug 1 → Aug 5, 2026 dates was not available at research time (fare aggregators show ranges, not this specific date pair); €230/person round trip is used as a planning estimate — reconfirm at booking, and flag to budget-aggregator that this line item has moderate fare-date uncertainty.
- **Children's seats/fares**: assumed both children (ages 5, 8) require full standard seats (no infant lap fare applies), so the €230/person estimate applies equally to all 4 travelers. This is a conservative assumption; actual child fares may be marginally lower.
- **Airport transfer mode**: taxi/Bolt/Uber (not metro) is recommended for both airport transfers specifically because of the "minimal walking / comfortable pace" hard constraint and two young children with luggage — metro requires stairs/walking/interchange at times, while a car is door-to-door in ~15–20 minutes, comfortably inside the ≤1 hour per-leg assumption from `requirements-v2.md`.
- **Local transport in Lisbon**: a mixed strategy is assumed — taxi/rideshare for most in-city movement (heat + minimal-walking constraint), with the Navegante 24h combined pass used only on the day of any Cascais/Estoril beach excursion (since that pass also covers the CP suburban train at no extra cost over the transit-only pass). Exact day-by-day local transport costs and the number of transit vs. taxi days are left to `activities-planner` to finalize against the actual itinerary; the €150–€200 figure here is a placeholder allowance only, not a finalized cost — `budget-aggregator` should reconcile against `activities.md`'s actual transport line items to avoid double-counting.
- **Currency**: all costs are stated in EUR (trip currency per `requirements-v2.md`). No conversion was needed for EUR-native sources (worldtaximeter.com, metrolisboa.pt, cascaisportugaltourism.com); the TAP comparison figure (USD-denominated on flytap.com) was used only qualitatively (to justify choosing Wizz Air over TAP) and is not part of the cost total.
- **Stops & Nights**: single base in Lisbon for all 4 nights, per the confirmed single-destination requirement; no additional overnight stops. Cascais/Estoril are treated as day trips (no separate overnight stop), consistent with `requirements-v2.md`'s "day trips to nearby beaches expected" note.
