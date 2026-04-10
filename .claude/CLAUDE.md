<!-- OMC:START -->
<!-- OMC:VERSION:4.9.3 -->

# oh-my-claudecode - Intelligent Multi-Agent Orchestration

You are running with oh-my-claudecode (OMC), a multi-agent orchestration layer for Claude Code.
Coordinate specialized agents, tools, and skills so work is completed accurately and efficiently.

<operating_principles>
- Delegate specialized work to the most appropriate agent.
- Prefer evidence over assumptions: verify outcomes before final claims.
- Choose the lightest-weight path that preserves quality.
- Consult official docs before implementing with SDKs/frameworks/APIs.
</operating_principles>

<delegation_rules>
Delegate for: multi-file changes, refactors, debugging, reviews, planning, research, verification.
Work directly for: trivial ops, small clarifications, single commands.
Route code to `executor` (use `model=opus` for complex work). Uncertain SDK usage → `document-specialist` (repo docs first; Context Hub / `chub` when available, graceful web fallback otherwise).
</delegation_rules>

<model_routing>
`haiku` (quick lookups), `sonnet` (standard), `opus` (architecture, deep analysis).
Direct writes OK for: `~/.claude/**`, `.omc/**`, `.claude/**`, `CLAUDE.md`, `AGENTS.md`.
</model_routing>

<skills>
Invoke via `/oh-my-claudecode:<name>`. Trigger patterns auto-detect keywords.
Tier-0 workflows include `autopilot`, `ultrawork`, `ralph`, `team`, and `ralplan`.
Keyword triggers: `"autopilot"→autopilot`, `"ralph"→ralph`, `"ulw"→ultrawork`, `"ccg"→ccg`, `"ralplan"→ralplan`, `"deep interview"→deep-interview`, `"deslop"`/`"anti-slop"`→ai-slop-cleaner, `"deep-analyze"`→analysis mode, `"tdd"`→TDD mode, `"deepsearch"`→codebase search, `"ultrathink"`→deep reasoning, `"cancelomc"`→cancel.
Team orchestration is explicit via `/team`.
Detailed agent catalog, tools, team pipeline, commit protocol, and full skills registry live in the native `omc-reference` skill when skills are available, including reference for `explore`, `planner`, `architect`, `executor`, `designer`, and `writer`; this file remains sufficient without skill support.
</skills>

<verification>
Verify before claiming completion. Size appropriately: small→haiku, standard→sonnet, large/security→opus.
If verification fails, keep iterating.
</verification>

<execution_protocols>
Broad requests: explore first, then plan. 2+ independent tasks in parallel. `run_in_background` for builds/tests.
Keep authoring and review as separate passes: writer pass creates or revises content, reviewer/verifier pass evaluates it later in a separate lane.
Never self-approve in the same active context; use `code-reviewer` or `verifier` for the approval pass.
Before concluding: zero pending tasks, tests passing, verifier evidence collected.
</execution_protocols>

<hooks_and_context>
Hooks inject `<system-reminder>` tags. Key patterns: `hook success: Success` (proceed), `[MAGIC KEYWORD: ...]` (invoke skill), `The boulder never stops` (ralph/ultrawork active).
Persistence: `<remember>` (7 days), `<remember priority>` (permanent).
Kill switches: `DISABLE_OMC`, `OMC_SKIP_HOOKS` (comma-separated).
</hooks_and_context>

<cancellation>
`/oh-my-claudecode:cancel` ends execution modes. Cancel when done+verified or blocked. Don't cancel if work incomplete.
</cancellation>

<worktree_paths>
State: `.omc/state/`, `.omc/state/sessions/{sessionId}/`, `.omc/notepad.md`, `.omc/project-memory.json`, `.omc/plans/`, `.omc/research/`, `.omc/logs/`
</worktree_paths>

## Setup

Say "setup omc" or run `/oh-my-claudecode:omc-setup`.

<!-- OMC:END -->

---

## Project Context (Cashari Flow Hub)

> **MANDATORY — read these files before doing any work in this repository.**

This project ships two authoritative reference documents that must be consulted at the start of every task:

### 1. `PROJECT_DESCRIPTION.md` — Domain & Product Context
Read this file **first** to understand:
- What Cashari is (personal finance & investment tracker)
- The core domain model: `Wallet → Goal → Instrument → Asset`
- Analytics metrics: Active Capital, Invested Capital, Current Value, Realized/Unrealized Profit, ROI
- Product philosophy: Accuracy First, Progressive Complexity, Transparency, Performance-Aware UX
- Current challenges: multi-currency, data gaps (missing FX / asset price), performance constraints
- Designer rules — what Claude **must**, **should**, and **must not** do when proposing changes

### 2. `DESIGN_GUIDANCE.md` — UI/UX & Code Standards
Read this file before touching any UI component to understand:
- Tech stack: React 18 + Vite, shadcn/ui, Tailwind CSS v3, Recharts, react-hook-form, TanStack Table, Lucide icons
- **UI language:** Indonesian (Bahasa Indonesia) for all user-facing copy
- Color tokens and financial semantic colors (emerald = profit, rose = loss, amber = stale/warning)
- Page layout patterns (gradient banner vs plain row header, detail page header, dashboard header)
- Chart patterns via `ReusableLineChart` (heights, axis, tooltip, data-quality dot colors)
- Card patterns (metric card, summary cards row, hero total card, missing-data warning card)
- Table patterns via `AdvancedDataTableToolbar` + TanStack Table
- Form & dialog patterns (header gradient, field structure, validation copy in Indonesian, delete confirmation)
- Financial color-coding rules and `AmountText` component usage
- Badge, status, empty state, and loading patterns
- Anti-patterns to avoid

### 3. `SPEC.md` — Feature Specifications
Read this file when implementing any of the planned features. It contains:
- Dashboard redesign (supporting cards: Cash Flow, Budget health, Total wallet balance)
- Analytics page (5 tabs: Ikhtisar, Arus Kas, Portofolio, Tujuan, Tren Saldo)
- Budget improvements (monthly/yearly recurring, rollover config, overlap warning, alerts)
- In-app toast notifications (budget threshold, debt due date, goal milestone, unusual spending)
- Debt management improvements (summary section: total, monthly obligations, DTI, payoff estimate)
- Investment analytics improvements (distribution charts, performance timeline, dividend UI, asset tx history)
- Implementation priority order (Sprint 1–4)
- Edge cases and constraints table

### Quick Reference Rules (always apply)
- Never hardcode HSL values — use Tailwind tokens from `src/index.css`
- All monetary values must use `tabular-nums`
- All user-visible text must be in Indonesian
- Never trigger expensive backend operations directly from UI — use materialized views and RPCs
- Never simplify away wallet/goal/instrument/asset hierarchy
- Always provide tooltips for financial metric cards
- Use `AmountText` with `showSign` for profit/loss columns
- Use `DeleteConfirmationModal` + `useDeleteConfirmation` for all delete actions
