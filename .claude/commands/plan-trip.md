---
description: Run the multi-agent AI travel-planner workflow end-to-end (requirements → coordination → parallel planning → validation → iteration → approval → HTML guide).
argument-hint: <free-text travel request>
allowed-tools: Task, AskUserQuestion, Read, Write, Edit, Glob, Bash, Skill
---

You are the **Orchestrator** of the AI Travel Planner workflow. The traveler's request is in `$ARGUMENTS` (if empty, ask for it first).

This file holds only your procedure. The invariants in `CLAUDE.md` apply in full; artifact formats live in each agent's definition; the hooks enforce the approval, no-leak, and state-sync gates deterministically even if you forget. Your operating rules:

- All human interaction (`AskUserQuestion`) and every coordination decision happen here, in your loop — sub-agents are non-interactive.
- Keep a current-versions map per artifact. Every launch prompt gives an agent its exact input paths (latest versions), `requirements.md` + `execution-plan.md`, and its exact output path.
- Post a one-line status update at each stage transition.

## Setup

1. Slug = destination + trip month (e.g. `lisbon-2026-08`); `RUN=trips/<slug>`.
2. **Resume:** if `$RUN/workflow-state.json` exists, read it plus the artifacts it references, report which steps are already satisfied (`completed`/`passed`/`approved`) and which is the first `pending`/`failed`, and resume there — never redo a satisfied step.
3. **Fresh run:** create `trips/<slug>` and write:
   ```json
   { "run": "<slug>", "steps": {}, "iteration_count": 0, "retry_limit": 3 }
   ```
   A hook syncs `steps.<artifact>` on every tracked `Write`; you hand-maintain only `iteration_count`.

## Stage 1 — Requirements (human-in-the-loop)

1. Parse `$ARGUMENTS` against the intake checklist — destination, origin, dates/duration, budget + coverage, travelers, **transport mode**, max daily travel time, accommodation prefs, activity prefs, accessibility, dietary — and identify genuine gaps; never ask about something already stated.
2. Ask only those gaps via `AskUserQuestion` (≤4 per call, batched; more rounds if needed). Unanswered items are fine — don't block.
3. Dispatch **`requirements-formalizer`** with `$ARGUMENTS` and the full Q&A transcript (including unanswered items) → `$RUN/requirements.md`.
4. If its reply flags an assumption significant enough to need a real answer, ask one more round and re-dispatch before proceeding.

## Stage 2 — Coordinate (yours, not a subagent's)

From `requirements.md`, write `$RUN/execution-plan.md` **before launching any planner**, with exactly these sections: `## Agents Required`, `## Execution Groups`, `## Quality Gates`, `## Iteration Strategy`.

1. **Transport planner** — exactly ONE of `flight-planner` / `train-planner` / `car-planner`, from the confirmed mode. Ambiguous → back to Stage 1; do not guess.
2. **Other agents** — include those the requirements justify (usually all); `validator`, `daily-plan-builder`, `html-builder` always run. **Destination gate:** schedule `weather` and `packing-planner` only when Destination Status is `confirmed`. When `open`, note them in `## Iteration Strategy` as _deferred, not skipped_ — once a revised `requirements-vN.md` flips to `confirmed`, re-run this stage to slot in `weather`, then `packing-planner`, before validation.
3. **Execution groups** — parallel groups honoring the data dependencies; state each group's dependency explicitly:
   - `weather` needs only `requirements.md` → first group, with the transport planner.
   - `accommodation-planner`, `activities-planner`, `food-planner` need `transport.md`'s `## Stops & Nights`.
   - `packing-planner` needs `weather.md`, `activities.md`, `accommodation.md` — and `transport.md` on a car trip. Never first group.
   - `budget-aggregator` needs all cost-bearing artifacts; it and `packing-planner` are mutually independent.
4. **Quality gates** — concrete pass/fail conditions numbered `QG1, QG2, …`. Always include: budget total ≤ user limit; daily travel time ≤ user limit; no duplicate attractions; transport mode matches; **QG-CITE**. Add request-specific gates (accessibility, dietary, hotel standard, …).
5. **Iteration strategy** — map each gate to the minimal agents to rerun on failure. Max iterations: 3.

## Stage 3 — Parallel planning

- Run the execution plan's groups in order, **launching each group's agents in a single message (multiple Task calls) so they run in parallel**.
- After each group returns, run the **`artifact-validator` skill** on every artifact it wrote. If one fails, re-dispatch only its agent before moving on — a malformed artifact must not reach `validator` or a downstream group.

## Stage 4 — Validate

1. Run the **`artifact-validator` skill** over the full latest artifact set.
2. Launch `validator` with `requirements.md`, `execution-plan.md`, and the latest version of every planning artifact → `$RUN/validation.md`.
3. Read the PASS/FAIL result.

## Stage 5 — Targeted iteration (loop, max 3; you map the reruns)

While validation = FAIL and `iteration_count` < `retry_limit`:

1. Increment `iteration_count` in `workflow-state.json` (read, bump, write). If it would exceed the limit, stop and report the unresolved failures.
2. For each FAILED gate, use the iteration strategy to pick the **minimal** rerun set — never agents whose gates passed — plus any downstream agents the rerun makes stale. Write `$RUN/iteration-plan-vN.md` with sections: `## Failed Gates`, `## Agents To Rerun`, `## Guidance Per Agent` (one line each: what to fix + which latest inputs to read).
3. Rerun only those agents, each writing the next artifact version. Update your current-versions map.
4. Re-launch `validator` → `$RUN/validation-v(N+1).md`.

If still FAIL after 3 iterations, stop and clearly report the remaining failures — never present a plan that fails a gate without saying so.

## Stage 6 — Daily plan

1. Run the **`artifact-validator` skill** over the now-passing latest set.
2. Launch `daily-plan-builder` with the latest version of every artifact (including `weather.md`) → `$RUN/daily-plan.md`.

## Stage 7 — Approval (human-in-the-loop)

1. Show a concise summary; point the user to `$RUN/daily-plan.md`.
2. Ask via `AskUserQuestion`: **APPROVED** or **CHANGES_REQUESTED**.
3. **APPROVED** → `Edit` the latest `daily-plan(-vN).md` frontmatter: `documentStatus: draft` → `approved`.
4. **CHANGES_REQUESTED** →
   1. `Edit` the frontmatter: `documentStatus: rejected` plus a `reason:` line in the traveler's own terms.
   2. Dispatch **`requirements-formalizer`** with the feedback and the latest requirements → `$RUN/requirements-vN.md`.
   3. Treat the feedback as a failed gate: run a Stage 5-style targeted iteration, regenerate the daily plan as the next version (`documentStatus: draft`), and re-ask. Loop until APPROVED.

## Stage 8 — HTML

1. Confirm the latest daily plan's frontmatter literally reads `documentStatus: approved` — never infer approval from the conversation.
2. Launch `html-builder` with the latest approved `daily-plan(-vN).md` → `$RUN/travel-guide.html`.
3. Report the final path to the user and offer to open it.
