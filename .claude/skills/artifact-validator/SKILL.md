---
name: artifact-validator
description: Structural template check for a workflow artifact — confirms required sections exist, no placeholders remain, and cross-references (e.g. latest artifact versions) resolve, before the artifact is treated as ready for the next step. Reusable across every stage that produces or consumes an artifact.
---

# Artifact Validator

A reusable structural check, distinct from the domain-specific `validation-agent`.
The `validation-agent` judges whether the *travel plan* meets quality gates
(budget, travel time, duplicates, ...). This skill instead checks that an
individual *artifact file* is well-formed enough to be consumed at all —
catching malformed output early, before it ever reaches a downstream agent or
the validation-agent.

## When to use this skill
- Orchestrator: after each planning agent group returns, before dispatching
  the next group or the validation-agent.
- Orchestrator: before dispatching `final-plan-agent`, on the latest version
  of every planning artifact.
- Orchestrator: before dispatching `html-builder-agent`, on `final-plan.md`
  and `approval.md`.
- Any future agent that produces a templated Markdown artifact.

## Procedure
Given a file path and its expected section list (provided by the caller, e.g.
`## Accommodations`, `## Estimated Accommodation Total`, `## Rationale` for
`accommodation.md`):

1. **Read the file.** If it doesn't exist, fail with "missing artifact".
2. **Check every expected section header is present**, in any order. Report
   any that are missing.
3. **Scan for unresolved placeholders** — literal `TBD`, `TODO`, `FIXME`,
   `<placeholder>`, `???`, or empty bullet stubs. Any hit is a failure.
4. **Check cross-references resolve** — if the artifact was told to read
   specific input paths (e.g. the latest `route.md`), confirm those paths
   exist and were plausibly used (the output references the same stops/legs).
5. **Report** `PASS` or `FAIL` with the specific missing section(s) or
   placeholder(s) found. On `FAIL`, name the exact artifact/agent responsible
   so the caller can re-dispatch just that one agent rather than the whole
   group.

## Output contract
This is a check, not a content generator — it never edits the artifact under
test. The caller decides what to do with a `FAIL` (typically: re-run the
single responsible agent with the specific gap called out).
