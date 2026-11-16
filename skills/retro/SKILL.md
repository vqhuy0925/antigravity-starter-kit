---
name: retro
description: Closed-loop AI retrospective. Capture unbiased developer-first notes and counted workflow signals after a task/review wraps up, and synthesize recurring themes across iterations with persistent theme IDs and verification lifecycles.
---

# Closed-Loop AI Retrospective (`retro`)

Captures structured feedback after a story, bugfix, or review completes, and synthesizes recurring themes across sprints or milestones so process/skill improvements are verified rather than forgotten.

---

## Mode 1: Capture (Post-Task / Post-Review)

Run when wrapping up a story, bugfix, or after `review-code` completes (suggest once; if declined, do not ask again in the same session).

### 1. Ask the Developer's View First
Before drafting or showing any AI reflection, ask **one question** (so AI framing never biases the human's answer):
> "One line: where did the AI cost you the most time on this task — or save you the most? (or 'skip')"

Record the reply **verbatim** under `## Developer's View` (do not paraphrase or soften).

### 2. Draft AI Reflection & Counted Signals
From the current conversation only, draft:
- **Went well** / **To improve** (any user correction belongs under *To improve*, even if the final result succeeded).
- **Counted Signals** (never estimate or guess; use `n/a` if a step didn't happen or context was compacted):
  - `gates-declined`: gates where the user answered no or stopped
  - `verify-failures`: failed test/build/lint runs during the task
  - `user-corrections`: times the user corrected the output or approach
  - `stops`: genuine blockers hit
  - `review-blocking`: blocking review findings (`fixed/left-open`)

### 3. Save Note
Present the draft for confirmation, then write to `.agents/retro/<period>/<task-id>.md` (or the user's configured retro folder).

---

## Mode 2: Synthesize (Sprint / Milestone Boundary)

Run when the user asks to synthesize retro notes or review AI workflow effectiveness over a period.

### 1. Carry Forward Earlier Themes
Read the previous period's `SYNTHESIS.md` (if any). Every theme keeps a persistent ID (`R-<period>-<n>`). Update each carried theme's status:
- `open`: proposed, no owner yet
- `addressed <commit/PR>`: a commit or rule/skill edit explicitly cites the theme ID
- `verified`: was `addressed` earlier, and no note in this period raised it **while at least one note used the skill/rule it touched** (silence without usage stays `addressed`)
- `regressed`: was `addressed` earlier, and this period's notes raised the same root cause again (**rank regressed themes first**)

### 2. Cluster by Root Cause
Group bullets across all notes by underlying cause (e.g., "missed null checks" + "manual validation added" → `input-validation-gaps`).
- **Developer's view outweighs AI reflection:** Themes raised in `Developer's View` count double. If a developer's line contradicts AI's `Went well` on the same note, classify it as *To improve* and flag `self-assessment disagreed`.

### 3. Propose Concrete Changes
Output `SYNTHESIS.md` with signal totals, ranked themes, and concrete proposed edits to `AGENTS.md` or skills. Never edit shared rules/skills directly without user approval.
