---
name: requirements-interview
description: Structured clarification interview — turns a free-text request into confirmed requirements + explicit assumptions, without inventing missing information. Reusable wherever the workflow needs human input turned into a structured artifact (initial intake, change-request capture during approval iteration).
---

# Requirements Interview

A reusable capability for turning a free-text request (or a change note) into a
structured, confirmed set of requirements — used by the orchestrator wherever it
needs to capture human intent as a durable artifact rather than as ephemeral
conversation.

## When to use this skill
- Stage 1 of the travel-planner workflow: turning the user's initial free-text
  trip request into `requirements.md`.
- Stage 7 (approval loop): when the user responds `CHANGES_REQUESTED`, turning
  their feedback into a structured change note the coordinator can route to
  specific agents.
- Any future workflow step (in this domain or another) that needs a
  human-in-the-loop clarification round before work proceeds.

## Procedure
1. **Parse what's already stated.** Extract every fact the requester already
   gave. Do not ask about anything already answered, even implicitly.
2. **Identify genuine gaps** against the domain's mandatory field list (for
   travel: destination, duration, budget + what it covers, travelers incl.
   children/ages, transport preference, max daily travel time, accommodation
   preferences, activity/interest preferences, accessibility needs, dietary
   constraints, dates/season, trip shape).
3. **Ask only the genuine gaps**, batched (≤4 questions per round) via
   `AskUserQuestion`. Never ask about something already answered. Never
   silently invent an answer.
4. **If the requester doesn't answer** a question (e.g. they're unavailable,
   or explicitly say "you decide"), record a clearly labeled **assumption**
   instead of blocking — but never label a real answer as an assumption.
5. **Write the structured artifact** with four sections:
   - `## Confirmed` — facts stated or explicitly answered.
   - `## Optional Preferences` — nice-to-haves, not hard constraints.
   - `## Constraints` — hard limits that quality gates will check.
   - `## Assumptions (explicit)` — anything filled in without a direct
     answer, clearly flagged so it can be revisited.

## Output contract
The calling step provides the output path. This skill never chooses where to
write — it only produces the four-section structure above at that path.
