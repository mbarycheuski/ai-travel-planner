# Transport Plan — Car

## Mode

Car (matches confirmed requirement: "Transport mode: car"; travelers use their own vehicle — no rental needed for this same-car round trip from Lodz)

## Stops & Nights

| Order | Stop   | Nights | Purpose                                                                 |
| ----- | ------ | ------ | ------------------------------------------------------------------------ |
| 1     | Gdańsk | 1      | Main and only destination — Old Town, waterfront, short overnight visit |

No intermediate overnight stop is used: the Lodz→Gdańsk leg (~3h25m) departs after 18:00 Friday and comfortably fits within a single evening drive, well inside the ~6-hour daily-driving assumption in `requirements.md`, and the traveler confirmed only one night of accommodation (in Gdańsk). See Rationale for the "what if you don't want to drive Friday night" fallback.

## Legs

| #   | From → To       | Day/Date                  | Detail                                                                                          | Duration               | Est. Cost                                            | Link                                                                                                                                       |
| --- | --------------- | -------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Łódź → Gdańsk   | Fri 17 Jul 2026, depart after 18:00 | A1/S6 expressway via Włocławek, Grudziądz; 339 km, mostly dual-carriageway/motorway               | ~3h 25min (≤ 6h assumed daily cap) | Fuel ~153 PLN + toll 29.90 PLN = **~183 PLN**        | [Route: Łódź–Gdańsk (conadrogach.pl)](https://conadrogach.pl/wyznaczanie-trasy/lodz-gdansk/)                                              |
| 2   | Gdańsk → Łódź   | Sat 18 Jul 2026, evening   | Same A1/S6 route in reverse; 339 km                                                              | ~3h 25min (≤ 6h assumed daily cap) | Fuel ~153 PLN + toll 29.90 PLN = **~183 PLN**        | [Route: Gdańsk–Łódź (conadrogach.pl)](https://conadrogach.pl/wyznaczanie-trasy/gdansk-lodz/)                                              |

No rental rows: the trip is a same-car there-and-back journey from home (Łódź), so no pickup/drop-off is needed.

## Local Transport

| Stop   | Option                                                                          | Est. Cost                          | Link                                                                                                                        |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| Gdańsk | Interparking Centrum Gdańsk (covered garage, steps from Old Town) — leave car parked overnight Fri→Sat | ~60 PLN for the ~20h stay (one 24h period) | [Interparking Centrum Gdańsk rates](https://glosgdanska.pl/20230508351613/interparking-centrum-gdansk-idealne-rozwiazanie-dla-zwiedzajacych-stare-miasto) |
| Gdańsk | Alternative: on-street Śródmieście paid parking zone (SPP) if only a short daytime stop | 7.50 PLN for first hour, rising per hour | [Gdańsk paid parking zones (gdansk.pl)](https://www.gdansk.pl/wiadomosci/Srodmiejska-Strefa-Platnego-Parkowania-od-29-czerwca-Nowe-miejsca-nowe-stawki-za-postoj,a,173222) |
| Gdańsk | Old Town / waterfront: fully walkable once parked — no local transit needed for sightseeing | 0 PLN                                | [Interparking Centrum Gdańsk rates](https://glosgdanska.pl/20230508351613/interparking-centrum-gdansk-idealne-rozwiazanie-dla-zwiedzajacych-stare-miasto) |

## Estimated Transport Total

- Fuel, Łódź→Gdańsk→Łódź: 678 km × 6.5 L/100km = 44.07 L × 6.96 PLN/L ≈ **307 PLN**
- Toll, A1 Gdańsk–Toruń paid section, round trip: 29.90 PLN × 2 = **59.80 PLN**
- Parking in Gdańsk (Interparking Centrum, ~20h Fri evening–Sat evening): ≈ **60 PLN**
- Rental: **0 PLN** (own car)

**Total: 307 + 59.80 + 60 ≈ 427 PLN** (well within the 1,000 PLN whole-trip budget, leaving ~573 PLN for accommodation and food/activities)

## Rationale & Assumptions

- **Route choice**: A1 (partly toll) + S6 via Włocławek/Grudziądz is the standard, fastest Łódź–Gdańsk route (339 km, ~3h25m) per [conadrogach.pl](https://conadrogach.pl/wyznaczanie-trasy/lodz-gdansk/). A slightly shorter (318 km) toll-free alternative via road 91/S7 exists but adds ~15 minutes; not chosen since the time saving on A1 outweighs the small toll.
- **Fuel consumption assumption**: no vehicle was specified, so 6.5 L/100km (typical mid-size petrol car, mixed motorway/expressway driving) is assumed — a placeholder, not vehicle-specific data.
- **Fuel price**: PB95 retail price 6.96 PLN/L as quoted for 13 Jul 2026 on [cenypaliw.fyi](https://cenypaliw.fyi/); price is volatile day to day (VAT reverted to 23% from 1 July 2026, pushing prices up ~0.85 PLN/L versus June), so actual cost on the travel date may vary by a few percent.
- **Toll**: A1 is only tolled on the 152 km Gdańsk–Toruń concession section (operator GTC); rate for passenger cars (Category 1) is 0.16 PLN/km, 29.90 PLN for the full paid section, per [A1.com.pl fare calculator](https://a1.com.pl/en/fare-calculator-and-trip-planning/). The Łódź–Gdańsk route covers this full paid stretch, so 29.90 PLN each way is used; the remainder of the route (south of Toruń) is toll-free.
- **Parking duration/cost**: assumed the car is parked in the Gdańsk garage from Friday ~21:30–22:00 arrival to Saturday ~18:00–19:00 departure (~20 hours), billed as one ~60 PLN daily rate per [Interparking Centrum Gdańsk coverage](https://glosgdanska.pl/20230508351613/interparking-centrum-gdansk-idealne-rozwiazanie-dla-zwiedzajacych-stare-miasto). If the garage bills by calendar day rather than a rolling 24h window, this could become two daily charges (~120 PLN); this is flagged as a soft assumption to confirm at check-in.
- **No intermediate overnight stop used**: `requirements.md` states only Friday-night accommodation (1 night) and a same-night Saturday return, and the ~3h25m one-way drive is well inside the assumed 6-hour daily-driving ceiling (itself an unconfirmed planning assumption per `requirements.md`). If travelers later prefer to break up the Friday evening drive, a natural midpoint stop is Włocławek or Toruń (both directly on the A1/S6 route, roughly half-way); this is not built into the plan since it is not needed to satisfy the constraint, but is noted as a fallback.
- **No car rental**: `requirements.md` confirms "Transport mode: car" with no mention of not having a car; per the launch task instructions, this plan assumes the travelers use their own vehicle for the round trip, so no rental line items or links are included.
- **Currency**: all costs are quoted directly in PLN, matching the trip currency confirmed in `requirements.md` — no conversion was needed since all sources (cenypaliw.fyi, A1.com.pl, Interparking, gdansk.pl) already quote PLN.
