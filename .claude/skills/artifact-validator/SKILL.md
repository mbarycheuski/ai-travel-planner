---
name: artifact-validator
description: Structural template check for a workflow artifact — confirms required sections exist, no placeholders remain, citation links are present on every recommendation, and cross-references (e.g. latest artifact versions) resolve, before the artifact is treated as ready for the next step. Reusable across every stage that produces or consumes an artifact.
---

# Artifact Validator

A reusable structural check, distinct from the domain-specific `validator`
agent. The `validator` judges whether the _travel plan_ meets quality gates
(budget, travel time, duplicates, ...). This skill instead checks that an
individual _artifact file_ is well-formed enough to be consumed at all —
catching malformed output early, before it ever reaches a downstream agent or
the validator.

## When to use this skill

- Orchestrator: after each planning agent group returns, before dispatching
  the next group or the validator.
- Orchestrator: before dispatching `daily-plan-builder`, on the latest version
  of every planning artifact.
- Orchestrator: before dispatching `html-builder`, on the latest daily plan
  (confirm its frontmatter records `documentStatus: approved`).
- Any future agent that produces a templated Markdown artifact.

## Required-section registry

The expected sections per artifact type (latest `-vN` version of each). The
caller may pass a custom list for a new artifact type; otherwise use this
registry:

| Artifact               | Required sections                                                                                                                                                   | Recommendation tables (Link required)                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `requirements.md`      | `## Confirmed`, `## Optional Preferences`, `## Constraints`, `## Assumptions (explicit)`                                                                            | —                                                               |
| `execution-plan.md`    | `## Agents Required`, `## Execution Groups`, `## Quality Gates`, `## Iteration Strategy`                                                                            | —                                                               |
| `transport.md`         | `## Mode`, `## Stops & Nights`, `## Legs`, `## Local Transport`, `## Estimated Transport Total`, `## Rationale & Assumptions`                                       | Legs, Local Transport                                           |
| `weather.md`           | one `## <Stop>` section per stop, `## Assumptions`                                                                                                                  | — (per-stop Method line cites the Open-Meteo method, not a URL) |
| `accommodation.md`     | `## Accommodations`, `## Estimated Accommodation Total`, `## Rationale & Assumptions`                                                                               | Accommodations                                                  |
| `activities.md`        | `## Activities by Day/Stop`, `## Estimated Activities Total`, `## Rationale & Assumptions`                                                                          | Activities by Day/Stop                                          |
| `food.md`              | `## Restaurants by Stop`, `## Local Food to Try`, `## Estimated Food Cost`, `## Rationale & Assumptions`                                                            | Restaurants by Stop                                             |
| `packing.md`           | `## Weather Outlook`, `## Clothing`, `## Electronics`, `## Travel Documents`, `## Medicines & Health`, `## Destination-Specific`, `## Sources`                      | — (Sources section instead)                                     |
| `budget.md`            | `## Budget Breakdown`, `## Estimated Total`, `## Against Limit`, `## Assumptions`                                                                                   | — (cites source artifacts, not URLs)                            |
| `validation.md`        | a `# Validation Result: PASS` or `FAIL` heading (first line after the frontmatter), `## Gate Results`, `## Findings`                                                | —                                                               |
| `iteration-plan-vN.md` | `## Failed Gates`, `## Agents To Rerun`, `## Guidance Per Agent`                                                                                                    | —                                                               |
| `daily-plan.md`        | `## Trip Summary`, `## Day-by-Day Itinerary`, `## Where You're Staying`, `## Getting There & Around`, `## Budget Summary`, `## Packing Checklist`, `## Travel Tips` | links carried through from inputs                               |

## Procedure

Given a file path (and optionally a custom expected-section list):

1. **Read the file.** If it doesn't exist, fail with "missing artifact".
2. **Check frontmatter (daily plan only).** Versioning is tracked by the `-vN`
   filename suffix, so artifacts carry no `version` frontmatter — do not require
   one. Only `daily-plan.md` carries frontmatter: a `documentStatus` of
   `draft`, `approved`, or `rejected` (a `rejected` daily plan also carries a
   `reason:` line). On the daily plan, a missing block, missing status, or
   out-of-vocabulary status is a **FAIL**; when checking the latest daily plan
   at the pre-`html-builder` step it must be exactly `documentStatus: approved`.
   Any other artifact needs no frontmatter.
3. **Check every expected section header is present**, in any order. Report
   any that are missing.
4. **Scan for unresolved placeholders** — literal `TBD`, `TODO`, `FIXME`,
   `<placeholder>`, `???`, or empty bullet stubs. Any hit is a failure.
5. **Check citation coverage** (mandatory for the recommendation tables named
   in the registry): every data row must have a non-empty `Link` cell
   containing a markdown link with an `http(s)://` URL — e.g.
   `[Hotel Alfama](https://www.booking.com/hotel/pt/alfama.html)`. A bare
   name, `n/a`, or an empty cell is a **FAIL** naming the responsible agent.
   Recommendations without a verifiable source are not acceptable.
6. **Check cross-references resolve** — if the artifact was told to read
   specific input paths (e.g. the latest `transport.md`), confirm those paths
   exist and were plausibly used (the output references the same stops/legs).
7. **Report** `PASS` or `FAIL` with the specific missing section(s),
   placeholder(s), or uncited row(s) found. On `FAIL`, name the exact
   artifact/agent responsible so the caller can re-dispatch just that one agent
   rather than the whole group.

## Output contract

This is a check, not a content generator — it never edits the artifact under
test. The caller decides what to do with a `FAIL` (typically: re-run the
single responsible agent with the specific gap called out).
