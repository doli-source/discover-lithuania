# Niv Agents System — Design Spec
**Date:** 2026-06-14  
**Author:** Niv Shimoni  
**Status:** Approved

---

## Overview

A personal AI agent system built on Claude Code (Mac), consisting of two autonomous agents — DARIUS and MAYA — that share a common brain layer and memory system. No third-party automation platforms. Pure Python + Claude API.

Inspired by the ABC-TOM method: Brain → Action → Memory, with each agent having a distinct role and personality.

---

## Approach

**Option B — Modular Agent System.** Each agent has separate modules (search, analyze, memory, CLI). A shared `brain/` layer is read before every task. Memory is written as append-only markdown logs after every session, so agents accumulate real context over time.

---

## Folder Structure

```
~/niv-agents/
├── brain/
│   └── niv.md                  # WHO NIV IS — both agents read this first
│
├── darius/
│   ├── darius.py               # main entry (--auto or --chat)
│   ├── search.py               # search module (DuckDuckGo + RSS feeds)
│   ├── analyze.py              # Claude analysis & prioritization
│   └── sources.md              # list of sources + keywords Darius watches
│
├── maya/
│   ├── maya.py                 # interactive CLI
│   └── tone.md                 # Niv's voice — Maya reads this every session
│
├── memory/
│   ├── darius-log.md           # append-only: what Darius found, when
│   └── maya-log.md             # append-only: what Maya wrote, for whom
│
├── inbox/                      # drop .md or .txt files here → agents read as context
│
└── output/
    ├── darius-brief.md         # today's brief (overwritten each morning)
    └── drafts/                 # Maya's output — YYYY-MM-DD-task.md
```

---

## Agent 1 — DARIUS (Intelligence & Opportunity Scout)

Named after the Lithuanian king. Strategic, knows the terrain.

### Two Modes

**Auto mode** (`python darius/darius.py --auto`) — runs via cron at 7am daily:
1. Load `brain/niv.md` + `darius/sources.md`
2. Run 8–12 targeted searches across pre-defined topics
3. Pass raw results to Claude with Niv's full context
4. Claude produces a ranked brief (top 5–8 items), each with: headline, source, 2-line summary, and *"why this matters for Niv"*
5. Save → `output/darius-brief.md` (overwrite)
6. Append summary line → `memory/darius-log.md`

**Chat mode** (`python darius/darius.py --chat`):
1. Load `brain/niv.md` + `memory/darius-log.md` + today's brief (if exists)
2. Start interactive chat loop
3. Darius can run live searches mid-conversation when asked
4. On exit → append session summary to `memory/darius-log.md`

### Search Strategy (zero API keys)

| Tool | What it does |
|------|-------------|
| `duckduckgo-search` Python lib | General + news searches, no key required |
| `feedparser` Python lib | Reads RSS feeds directly |
| Google News RSS | Custom topic queries, no key |
| EU-Startups.com RSS | EU startup deals and funding |
| Startup Lithuania feeds | Local ecosystem news |
| Hacker News API | Tech community signals |
| DuckDuckGo `site:linkedin.com` | People searches on LinkedIn |

### Search Topics (editable in `sources.md`)
- Lithuania AI / startups / tech funding
- Israel–Lithuania business connections
- EU agritech & tourism tech deals
- Lithuanian government tenders
- Specific accelerators (Login, Startup Lithuania, Pramoné)
- Relevant people: founders, BizDev leads, ecosystem builders in Vilnius/Kaunas

### Claude's Role
Receives: all raw search results + `niv.md` context  
Produces: ranked brief — top 5–8 items with "why this matters for Niv" per item  
Model: `claude-sonnet-4-6`  
Temperature: `0.3` (analytical, precise)  
Prompt caching: `niv.md` cached (loaded on every run — ideal cache candidate)

---

## Agent 2 — MAYA (Voice, Content & Outreach)

Maya knows how Niv communicates. She writes like Niv would — if he had unlimited time.

### One Mode — Interactive CLI

**`python maya/maya.py`**:
1. Load `brain/niv.md` + `maya/tone.md`
2. Scan `inbox/` — load any `.md` or `.txt` files as extra context
3. Greet: *"Hey Niv. What are we writing today?"*
4. Chat loop — Niv describes the task, Maya writes
5. After each output: *"Save this draft? (y/n)"*
   - Yes → save to `output/drafts/YYYY-MM-DD-[task-slug].md`
   - No → keep iterating in same session
6. On exit → offer to move used `inbox/` files to `inbox/used/` (never deleted), append one-line log to `memory/maya-log.md`

### What Maya Writes
- Outreach emails (cold or warm, English or Hebrew)
- LinkedIn posts (Niv's voice, never corporate)
- Follow-up messages after meetings or pitches
- Short pitch summaries for a specific person/company
- WhatsApp business messages

### `maya/tone.md` — The Voice Doc
Loaded every session. Contains:
- Core writing principles (short sentences, no buzzwords, trust before ask)
- English vs Hebrew rules (when to use each, tone differences)
- Things Niv never says (phrases that feel salesy or generic)
- 3–5 real examples of writing Niv likes

### Claude's Role
Receives: `niv.md` + `tone.md` + `inbox/` context (if any) + task description  
Produces: content in Niv's voice, iterates until approved  
Model: `claude-sonnet-4-6`  
Temperature: `0.7` (creative, expressive)

---

## Memory System

**Principle: nothing overwrites memory.** Only `darius-brief.md` gets overwritten daily (it's today's brief). Everything in `memory/` is append-only.

### `memory/darius-log.md`
```
## 2026-06-14 | Auto Run
- Found: 3 agritech deals in Baltics (see brief)
- Found: Lithuanian gov tender for tourism digitization
- Notable: Login Accelerator opening applications Q3

## 2026-06-14 | Chat Session
- Niv asked about AI scene in Vilnius
- Ran 2 live searches, surfaced 4 relevant people
```

### `memory/maya-log.md`
```
## 2026-06-12
- Wrote cold outreach email to Lukas (agritech founder, Kaunas)
- Wrote LinkedIn post: Israel-Lithuania AI bridge opportunity
- Draft saved: output/drafts/2026-06-12-lukas-outreach.md
```

---

## Data Flow

```
[cron 7am]
     ↓
darius.py --auto
     ↓
search.py → raw results (DuckDuckGo + RSS)
     ↓
analyze.py → Claude (reads niv.md) → ranked brief
     ↓
output/darius-brief.md  ←  overwrite
memory/darius-log.md    ←  append


[you open terminal]
     ↓
maya.py
     ↓
reads: brain/niv.md + maya/tone.md + inbox/ (if any files)
     ↓
chat loop → Claude generates in Niv's voice → iterate
     ↓
output/drafts/YYYY-MM-DD-task.md  ←  save on approval
memory/maya-log.md                ←  append
```

---

## Cron Setup

Daily at 7am, Mac crontab:
```
0 7 * * * cd ~/niv-agents && /usr/bin/python3 darius/darius.py --auto >> /tmp/darius-cron.log 2>&1
```

---

## Dependencies

```
anthropic          # Claude API
duckduckgo-search  # web search, no key
feedparser         # RSS feed reader
rich               # terminal formatting (nice CLI output)
python-dotenv      # load ANTHROPIC_API_KEY from .env
```

---

## Environment

```
~/niv-agents/.env
ANTHROPIC_API_KEY=sk-...
```

`.env` is never committed. Both agents load it via `python-dotenv` at startup.

---

## Out of Scope (for now)

- Email delivery of Darius brief (upgrade path: add SMTP or send to WhatsApp)
- Tool-use / agentic search decisions (Option C — easy upgrade later)
- Web UI or dashboard
- Multi-user support
