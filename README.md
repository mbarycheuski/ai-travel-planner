# AI Travel Planner - Multi-Agent Workflow

A Claude Code multi-agent workflow that turns a free-text travel request into a
human-approved, standalone HTML travel guide. An orchestrator coordinates a team
of planning sub-agents (transport, accommodation, activities, food, weather,
packing, budget), validates their work against quality gates, iterates on
failures, asks you to approve the plan, and only then builds the guide. Every
recommendation links to its real source page.

**How it works:** see [`docs/ai-travel-planner.md`](docs/ai-travel-planner.md)
for the architecture, sub-agents, stages, and flow diagram.

## Prerequisites

- **Claude Code** and **Node.js ≥ 22** on `PATH` (used by the project hooks and
  by `npx` to launch the `open-meteo` MCP server).

No build step and no `npm install`. Clone/open the repo in Claude Code from its
root — `.claude/settings.json` and `.mcp.json` are picked up automatically. On
first use, approve the project MCP server (`open-meteo`) when prompted.

## Run it

```
/plan-trip Plan a 5-day family trip to Lisbon. We're 2 adults and 2 kids (ages 5 and 8). Departure from Warsaw on August 1, 2026. We prefer a comfortable trip with sightseeing, nearby beaches, good local restaurants, activities for children, and minimal walking due to the summer heat.
```

The `/plan-trip` command asks any clarifying questions (including transport mode
— flight, train, or car), runs the planning team and validation, asks you to
approve the daily plan, then builds the HTML guide.

More examples:

```
/plan-trip Warsaw → Vienna city break by train, 4 days in October, 2 adults,
mid-range budget, vegetarian-friendly.
```

```
/plan-trip One-week self-drive loop through Tuscany in July for 2 adults +
2 kids, land in Florence, ≤2.5h driving/day, €2,500 excl. flights.
```

**Resume:** re-run `/plan-trip` with a request that yields the same run slug
(same destination + month). The orchestrator reads
`trips/<slug>/workflow-state.json` and skips every completed step, resuming at
the first pending/failed one — no finished work is redone.

## Where artifacts live

Each run is isolated under `trips/<destination>-<date>/`: all planning artifacts
(`requirements.md`, `transport.md`, …), the `daily-plan.md`, the final
`travel-guide.html`, and `workflow-state.json`. A few sample runs are committed
under `trips/` on purpose, to demonstrate different scenarios (e.g. a happy
path and a validation-driven iteration).

## Tools & technologies

- **Claude Code** — sub-agents (`.claude/agents/`), reusable skills
  (`.claude/skills/`), and hooks (`.claude/hooks/`, Node.js).
- **[`open-meteo` MCP](https://www.npmjs.com/package/open-meteo-mcp-server)**
  (`.mcp.json`, no API key) — weather source, called by the `weather` agent.
- **Live web** (`WebSearch` / `WebFetch`) — recommendations and images are
  sourced from real pages at runtime, not from model memory.
