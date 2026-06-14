# Niv Agents System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-agent personal AI system (DARIUS + MAYA) as Python CLI tools on Mac, with shared brain, append-only memory, and a daily cron job for DARIUS.

**Architecture:** Modular Python scripts in `~/niv-agents/`. DARIUS has `--auto` (cron) and `--chat` (interactive) modes; MAYA is interactive-only. Both read `brain/niv.md` on every run. Memory is append-only markdown. Search is zero-API-key using `duckduckgo-search` + `feedparser`.

**Tech Stack:** Python 3.11+, `anthropic` SDK, `duckduckgo-search`, `feedparser`, `rich`, `python-dotenv`, `pytest` for tests, Mac `crontab` for scheduling.

---

## File Map

| File | Responsibility |
|------|---------------|
| `~/niv-agents/brain/niv.md` | Who Niv is — single source of truth both agents read |
| `~/niv-agents/darius/sources.md` | Configurable search topics + RSS feed URLs |
| `~/niv-agents/darius/search.py` | DuckDuckGo news search + RSS feed parsing |
| `~/niv-agents/darius/analyze.py` | Claude analysis: raw results → ranked brief |
| `~/niv-agents/darius/darius.py` | Main entry: `--auto` and `--chat` modes |
| `~/niv-agents/maya/tone.md` | Niv's voice guide — Maya internalizes this |
| `~/niv-agents/maya/maya.py` | Interactive writing CLI, reads inbox/, saves drafts |
| `~/niv-agents/tests/conftest.py` | sys.path setup for all tests |
| `~/niv-agents/tests/test_search.py` | Tests for search.py |
| `~/niv-agents/tests/test_analyze.py` | Tests for analyze.py |
| `~/niv-agents/tests/test_maya.py` | Tests for maya.py helper functions |
| `~/niv-agents/requirements.txt` | Pinned dependencies |
| `~/niv-agents/.env.example` | Template for API key |
| `~/niv-agents/.gitignore` | Excludes .env, output/, memory/ |

---

## Task 1: Project Scaffold

**Files:**
- Create: `~/niv-agents/` (full directory tree)
- Create: `~/niv-agents/requirements.txt`
- Create: `~/niv-agents/.env.example`
- Create: `~/niv-agents/.gitignore`

- [ ] **Step 1: Create the full folder structure**

```bash
mkdir -p ~/niv-agents/{brain,darius,maya,memory,inbox/used,output/drafts,tests}
touch ~/niv-agents/memory/darius-log.md
touch ~/niv-agents/memory/maya-log.md
```

- [ ] **Step 2: Create `requirements.txt`**

Write to `~/niv-agents/requirements.txt`:
```
anthropic>=0.40.0
duckduckgo-search>=6.0.0
feedparser>=6.0.11
rich>=13.0.0
python-dotenv>=1.0.0
pytest>=8.0.0
pytest-mock>=3.14.0
```

- [ ] **Step 3: Create `.env.example`**

Write to `~/niv-agents/.env.example`:
```
# Copy this file to .env and fill in your key
ANTHROPIC_API_KEY=sk-ant-...
```

- [ ] **Step 4: Create `.gitignore`**

Write to `~/niv-agents/.gitignore`:
```
.env
__pycache__/
*.pyc
.DS_Store
output/
memory/
```

- [ ] **Step 5: Git init and install dependencies**

```bash
cd ~/niv-agents
git init
pip install -r requirements.txt
```

Expected: pip installs 5 packages without errors.

- [ ] **Step 6: Create `.env` with your API key**

```bash
cp ~/niv-agents/.env.example ~/niv-agents/.env
```

Then open `~/niv-agents/.env` and add your real `ANTHROPIC_API_KEY`.

- [ ] **Step 7: Initial commit**

```bash
cd ~/niv-agents
git add requirements.txt .env.example .gitignore
git commit -m "feat: scaffold niv-agents project structure"
```

---

## Task 2: `brain/niv.md` — Shared Knowledge Base

**Files:**
- Create: `~/niv-agents/brain/niv.md`

- [ ] **Step 1: Write `brain/niv.md`**

Write to `~/niv-agents/brain/niv.md`:
```markdown
# Niv Shimoni — Context for AI Agents

## Who I Am
I'm an Israeli entrepreneur and digital strategist with a background in BizDev,
digital marketing, and AI automation. I work across Israel, Lithuania, and Cyprus —
building bridges between ecosystems and identifying opportunities before they become
obvious to others.

10 years of experience in tech: QA, BizDev, digital marketing, Google Business Profile
optimization, AI consulting for SMBs.

## What I Do
- AI automation consulting for small and medium businesses
- BizDev and ecosystem bridge-building between Israel, Lithuania, and Cyprus
- Tourism content and digital strategy
- Google Maps / Google Business Profile specialist (Google Maps influencer)

## Active Markets
- **Lithuania**: Main focus. Building client base and partnerships in Vilnius and Kaunas.
- **Israel**: Home base. Network in tech, startups, marketing.
- **Cyprus**: Secondary market. Expanding presence.
- **EU**: General opportunity radar — funding, startup deals, agritech, tourism tech.

## Sectors I Watch
- **AI & automation**: tools, applications, SMB adoption, consulting opportunities
- **Tourism tech**: digitization of tourism experiences, AI concierge, booking systems
- **Agritech**: precision agriculture, Baltic/EU deals, Israel-Lithuania angle
- **Startups**: early-stage, ecosystem builders, accelerators in the Baltics
- **Israel-Lithuania connections**: any bridge — tech, trade, people, investment

## Active Projects
- Lithuania Tourism Collaboration Network
- AI Concierge for hotels (WhatsApp-based)
- Spa Appointment Automation
- Tech Zity Booking AI Agent

## Key Relationships (Lithuania)
- Magnusson Law Firm (Vilnius) — improved their Google Business presence
- Kotryna Network — active client
- Grand SPA Lietuva — AI Concierge project in progress
- Nida Tourism Center, Trakai Municipality — tourism partnerships
- Startup Lithuania ecosystem — ongoing engagement

## What I'm Looking For
1. **New clients** for AI/automation services (SMBs in Lithuania, Cyprus, Israel)
2. **Strategic partners** for collaboration and joint projects
3. **Funded projects or tenders** I can consult on (EU, Lithuanian government)
4. **People worth knowing** — founders, BizDev leads, ecosystem builders
5. **Opportunities before they're obvious** — news, signals, emerging trends

## How to Help Me
- Be direct. No filler.
- Connect every piece of news or opportunity to my specific context.
- Think like a strategic partner, not an assistant.
- Short sentences. Practical implications. No buzzwords.
```

- [ ] **Step 2: Commit**

```bash
cd ~/niv-agents
git add brain/niv.md
git commit -m "feat: add brain/niv.md shared knowledge base"
```

---

## Task 3: `darius/sources.md` — Configurable Sources

**Files:**
- Create: `~/niv-agents/darius/sources.md`

- [ ] **Step 1: Write `darius/sources.md`**

Write to `~/niv-agents/darius/sources.md`:
```markdown
# DARIUS Sources Configuration

Edit this file to control what Darius searches every morning.

## Topics
- Lithuania AI startups
- Lithuania tech funding 2025
- Lithuania Israel business partnership
- agritech Baltic EU funding round
- tourism tech startup Europe
- startup accelerator Lithuania Vilnius
- Login accelerator Lithuania
- Startup Lithuania news
- EU agritech investment
- Israel Lithuania trade
- AI automation SMB Europe

## RSS
- https://eu-startups.com/feed/
- https://news.google.com/rss/search?q=Lithuania+startup&hl=en&gl=US&ceid=US:en
- https://news.google.com/rss/search?q=agritech+Baltic&hl=en&gl=US&ceid=US:en
- https://news.google.com/rss/search?q=Israel+Lithuania&hl=en&gl=US&ceid=US:en
- https://news.google.com/rss/search?q=tourism+tech+Europe&hl=en&gl=US&ceid=US:en
- https://startuplithuania.lt/feed/
```

- [ ] **Step 2: Commit**

```bash
cd ~/niv-agents
git add darius/sources.md
git commit -m "feat: add darius/sources.md with search topics and RSS feeds"
```

---

## Task 4: `darius/search.py` — Search Module (TDD)

**Files:**
- Create: `~/niv-agents/darius/search.py`
- Create: `~/niv-agents/tests/conftest.py`
- Create: `~/niv-agents/tests/test_search.py`

- [ ] **Step 1: Create `tests/conftest.py`**

Write to `~/niv-agents/tests/conftest.py`:
```python
import sys
from pathlib import Path

# Add ~/niv-agents/ to sys.path so tests can use package imports:
# from darius.search import ..., from maya.maya import ...
sys.path.insert(0, str(Path(__file__).parent.parent))
```

- [ ] **Step 2: Write failing tests in `tests/test_search.py`**

Write to `~/niv-agents/tests/test_search.py`:
```python
import pytest
from unittest.mock import patch, MagicMock, call

# These imports will fail until search.py exists
from darius.search import search_web, search_rss, run_searches, parse_sources


class TestSearchWeb:
    def test_returns_formatted_results(self):
        mock_news = [
            {
                "title": "Lithuania AI boom",
                "url": "https://example.com/news",
                "body": "Big things happening in Vilnius.",
                "source": "TechCrunch",
                "date": "2026-06-14",
            }
        ]
        with patch("darius.search.DDGS") as mock_ddgs:
            mock_ddgs.return_value.__enter__.return_value.news.return_value = mock_news
            results = search_web("Lithuania AI")

        assert len(results) == 1
        assert results[0]["title"] == "Lithuania AI boom"
        assert results[0]["source"] == "TechCrunch"
        assert "url" in results[0]
        assert "body" in results[0]

    def test_returns_empty_list_on_failure(self):
        with patch("darius.search.DDGS") as mock_ddgs:
            mock_ddgs.return_value.__enter__.return_value.news.side_effect = Exception(
                "Rate limited"
            )
            results = search_web("test query")

        assert results == []

    def test_respects_max_results(self):
        mock_news = [{"title": f"Item {i}", "url": f"https://example.com/{i}", "body": "", "source": "Test", "date": ""} for i in range(10)]
        with patch("darius.search.DDGS") as mock_ddgs:
            mock_ddgs.return_value.__enter__.return_value.news.return_value = mock_news[:3]
            results = search_web("test", max_results=3)

        mock_ddgs.return_value.__enter__.return_value.news.assert_called_once_with("test", max_results=3)


class TestSearchRSS:
    def test_returns_formatted_feed_entries(self):
        mock_feed = MagicMock()
        mock_feed.feed.title = "EU Startups"
        mock_entry = MagicMock()
        mock_entry.title = "Baltic agritech raises €5M"
        mock_entry.link = "https://eu-startups.com/story"
        mock_entry.summary = "A Vilnius agritech startup just raised."
        mock_entry.get.side_effect = lambda k, default="": {
            "title": "Baltic agritech raises €5M",
            "link": "https://eu-startups.com/story",
            "summary": "A Vilnius agritech startup just raised.",
            "published": "2026-06-14",
        }.get(k, default)
        mock_feed.entries = [mock_entry]

        with patch("darius.search.feedparser.parse", return_value=mock_feed):
            results = search_rss("https://eu-startups.com/feed/")

        assert len(results) == 1
        assert results[0]["title"] == "Baltic agritech raises €5M"
        assert results[0]["source"] == "EU Startups"

    def test_returns_empty_list_on_failure(self):
        with patch("darius.search.feedparser.parse", side_effect=Exception("Network error")):
            results = search_rss("https://bad-url.example.com/feed")

        assert results == []


class TestParseSources:
    def test_parses_topics_and_rss_from_markdown(self, tmp_path):
        sources_file = tmp_path / "sources.md"
        sources_file.write_text(
            "## Topics\n- Lithuania AI\n- agritech Baltic\n\n## RSS\n- https://example.com/feed\n"
        )
        topics, feeds = parse_sources(str(sources_file))

        assert topics == ["Lithuania AI", "agritech Baltic"]
        assert feeds == ["https://example.com/feed"]


class TestRunSearches:
    def test_combines_web_and_rss_results(self):
        with patch("darius.search.search_web", return_value=[{"title": "Web result"}]) as mock_web, \
             patch("darius.search.search_rss", return_value=[{"title": "RSS result"}]) as mock_rss:

            results = run_searches(["topic1"], ["https://feed.example.com"])

        assert len(results) == 2
        assert any(r["title"] == "Web result" for r in results)
        assert any(r["title"] == "RSS result" for r in results)

    def test_continues_when_one_search_fails(self):
        with patch("darius.search.search_web", return_value=[]) as mock_web, \
             patch("darius.search.search_rss", return_value=[{"title": "RSS result"}]) as mock_rss:

            results = run_searches(["bad topic"], ["https://feed.example.com"])

        assert len(results) == 1
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
cd ~/niv-agents
pytest tests/test_search.py -v
```

Expected: `ModuleNotFoundError: No module named 'darius.search'`

- [ ] **Step 4: Create `darius/__init__.py`**

```bash
touch ~/niv-agents/darius/__init__.py
```

- [ ] **Step 5: Write `darius/search.py`**

Write to `~/niv-agents/darius/search.py`:
```python
"""
Search module for DARIUS.
Zero API keys: DuckDuckGo news search + RSS feed parsing.
"""

from __future__ import annotations

import feedparser
from duckduckgo_search import DDGS


def search_web(query: str, max_results: int = 5) -> list[dict]:
    """Search DuckDuckGo news. Returns [] on any failure."""
    try:
        with DDGS() as ddgs:
            raw = ddgs.news(query, max_results=max_results)
            return [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "body": r.get("body", ""),
                    "source": r.get("source", ""),
                    "date": r.get("date", ""),
                }
                for r in raw
            ]
    except Exception as e:
        print(f"[search_web] Failed for '{query}': {e}")
        return []


def search_rss(feed_url: str, max_items: int = 5) -> list[dict]:
    """Parse an RSS feed. Returns [] on any failure."""
    try:
        feed = feedparser.parse(feed_url)
        source_name = getattr(feed.feed, "title", feed_url)
        results = []
        for entry in feed.entries[:max_items]:
            results.append(
                {
                    "title": entry.get("title", ""),
                    "url": entry.get("link", ""),
                    "body": entry.get("summary", ""),
                    "source": source_name,
                    "date": entry.get("published", ""),
                }
            )
        return results
    except Exception as e:
        print(f"[search_rss] Failed for '{feed_url}': {e}")
        return []


def parse_sources(sources_path: str) -> tuple[list[str], list[str]]:
    """
    Parse darius/sources.md into (topics, rss_feeds).

    Expected format:
        ## Topics
        - topic one
        - topic two

        ## RSS
        - https://feed.example.com
    """
    topics: list[str] = []
    feeds: list[str] = []
    section = None

    with open(sources_path) as f:
        for line in f:
            line = line.strip()
            if line == "## Topics":
                section = "topics"
            elif line == "## RSS":
                section = "rss"
            elif line.startswith("- ") and section == "topics":
                topics.append(line[2:].strip())
            elif line.startswith("- ") and section == "rss":
                feeds.append(line[2:].strip())

    return topics, feeds


def run_searches(topics: list[str], rss_feeds: list[str]) -> list[dict]:
    """Run all topic searches and RSS feeds. Returns combined results."""
    results: list[dict] = []
    for topic in topics:
        results.extend(search_web(topic))
    for feed_url in rss_feeds:
        results.extend(search_rss(feed_url))
    return results
```

- [ ] **Step 6: Run tests — verify they pass**

```bash
cd ~/niv-agents
pytest tests/test_search.py -v
```

Expected:
```
tests/test_search.py::TestSearchWeb::test_returns_formatted_results PASSED
tests/test_search.py::TestSearchWeb::test_returns_empty_list_on_failure PASSED
tests/test_search.py::TestSearchWeb::test_respects_max_results PASSED
tests/test_search.py::TestSearchRSS::test_returns_formatted_feed_entries PASSED
tests/test_search.py::TestSearchRSS::test_returns_empty_list_on_failure PASSED
tests/test_search.py::TestParseSources::test_parses_topics_and_rss_from_markdown PASSED
tests/test_search.py::TestRunSearches::test_combines_web_and_rss_results PASSED
tests/test_search.py::TestRunSearches::test_continues_when_one_search_fails PASSED
```

- [ ] **Step 7: Commit**

```bash
cd ~/niv-agents
git add darius/__init__.py darius/search.py tests/conftest.py tests/test_search.py
git commit -m "feat: add darius/search.py with DuckDuckGo + RSS support"
```

---

## Task 5: `darius/analyze.py` — Claude Analysis Module (TDD)

**Files:**
- Create: `~/niv-agents/darius/analyze.py`
- Create: `~/niv-agents/tests/test_analyze.py`

- [ ] **Step 1: Write failing tests in `tests/test_analyze.py`**

Write to `~/niv-agents/tests/test_analyze.py`:
```python
import pytest
from unittest.mock import MagicMock, patch
from pathlib import Path

from darius.analyze import generate_brief, save_brief, append_to_log, format_results_for_prompt


class TestFormatResultsForPrompt:
    def test_formats_list_of_results_as_text(self):
        results = [
            {"title": "Lithuania AI deal", "source": "TechCrunch", "url": "https://tc.com", "body": "A deal was signed."},
            {"title": "Agritech raises €5M", "source": "EU Startups", "url": "https://eu.com", "body": "Baltic round closed."},
        ]
        text = format_results_for_prompt(results)

        assert "Lithuania AI deal" in text
        assert "TechCrunch" in text
        assert "Agritech raises €5M" in text
        assert "https://tc.com" in text

    def test_handles_empty_results(self):
        text = format_results_for_prompt([])
        assert text == "No results found."


class TestGenerateBrief:
    def test_calls_claude_with_model_and_returns_text(self):
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.content = [MagicMock(text="## 1. Lithuania AI News\n**Source:** TechCrunch\n**Why:** Relevant to Niv.")]
        mock_client.messages.create.return_value = mock_response

        results = [{"title": "Test", "source": "Test", "url": "http://test.com", "body": "Test body"}]
        brief = generate_brief(results, "Niv is an entrepreneur in Lithuania.", mock_client)

        assert "Lithuania AI News" in brief
        mock_client.messages.create.assert_called_once()
        call_kwargs = mock_client.messages.create.call_args.kwargs
        assert call_kwargs["model"] == "claude-sonnet-4-6"
        assert call_kwargs["max_tokens"] == 2000

    def test_brief_prompt_includes_niv_context(self):
        mock_client = MagicMock()
        mock_client.messages.create.return_value.content = [MagicMock(text="Brief content")]

        generate_brief([], "Niv works in agritech.", mock_client)

        call_kwargs = mock_client.messages.create.call_args.kwargs
        prompt_text = call_kwargs["messages"][0]["content"]
        assert "Niv works in agritech." in prompt_text


class TestSaveBrief:
    def test_writes_brief_to_file_with_header(self, tmp_path):
        output_file = tmp_path / "darius-brief.md"
        save_brief("## 1. Test item\nContent here.", str(output_file))

        content = output_file.read_text()
        assert "DARIUS Daily Brief" in content
        assert "## 1. Test item" in content
        assert "Generated:" in content

    def test_overwrites_existing_file(self, tmp_path):
        output_file = tmp_path / "darius-brief.md"
        output_file.write_text("Old content")
        save_brief("New content", str(output_file))

        assert "Old content" not in output_file.read_text()
        assert "New content" in output_file.read_text()


class TestAppendToLog:
    def test_creates_log_file_if_missing(self, tmp_path):
        log_file = tmp_path / "darius-log.md"
        append_to_log("Found 3 items", str(log_file), mode="Auto Run")

        assert log_file.exists()
        content = log_file.read_text()
        assert "Auto Run" in content
        assert "Found 3 items" in content

    def test_appends_to_existing_log(self, tmp_path):
        log_file = tmp_path / "darius-log.md"
        log_file.write_text("## 2026-06-13 | Auto Run\n- Previous entry\n")
        append_to_log("New entry", str(log_file), mode="Chat Session")

        content = log_file.read_text()
        assert "Previous entry" in content
        assert "New entry" in content
        assert "Chat Session" in content
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd ~/niv-agents
pytest tests/test_analyze.py -v
```

Expected: `ModuleNotFoundError: No module named 'darius.analyze'`

- [ ] **Step 3: Write `darius/analyze.py`**

Write to `~/niv-agents/darius/analyze.py`:
```python
"""
Analysis module for DARIUS.
Sends raw search results to Claude, receives prioritized brief.
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

import anthropic

BRIEF_SYSTEM_PROMPT = """You are DARIUS, an intelligence scout and strategic advisor for Niv Shimoni.
Your job: analyze today's search results and produce a tight, prioritized daily brief.
Be direct. No filler. Think like a strategic partner, not a newsletter writer."""

BRIEF_USER_TEMPLATE = """WHO NIV IS:
{niv_context}

TODAY'S SEARCH RESULTS:
{results_text}

Analyze these results. Select the top 5–8 most relevant items for Niv.

Format each item exactly as:
## [Number]. [Headline]
**Source:** [source] | [date]
**Summary:** [2 sentences max]
**Why this matters for Niv:** [1–2 sentences connecting this specifically to Niv's goals]

End with:
---
**Today's Signal:** [single most important takeaway for Niv today — one sentence]"""


def format_results_for_prompt(results: list[dict]) -> str:
    """Convert list of result dicts to a readable text block for Claude."""
    if not results:
        return "No results found."
    parts = []
    for r in results:
        parts.append(
            f"Title: {r.get('title', '')}\n"
            f"Source: {r.get('source', '')} | {r.get('date', '')}\n"
            f"URL: {r.get('url', '')}\n"
            f"Summary: {r.get('body', '')}"
        )
    return "\n\n---\n\n".join(parts)


def generate_brief(
    raw_results: list[dict],
    niv_context: str,
    client: anthropic.Anthropic,
) -> str:
    """Send raw results + Niv's context to Claude. Return ranked brief text."""
    results_text = format_results_for_prompt(raw_results)
    prompt = BRIEF_USER_TEMPLATE.format(
        niv_context=niv_context,
        results_text=results_text,
    )
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2000,
        system=BRIEF_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text


def save_brief(content: str, output_path: str) -> None:
    """Write brief to output/darius-brief.md (overwrites each day)."""
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    full_content = f"# DARIUS Daily Brief\n**Generated:** {date_str}\n\n---\n\n{content}"
    Path(output_path).write_text(full_content, encoding="utf-8")


def append_to_log(summary: str, log_path: str, mode: str = "Auto Run") -> None:
    """Append a dated entry to memory/darius-log.md (never overwrites)."""
    date_str = datetime.now().strftime("%Y-%m-%d")
    entry = f"\n## {date_str} | {mode}\n{summary}\n"
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(entry)
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
cd ~/niv-agents
pytest tests/test_analyze.py -v
```

Expected:
```
tests/test_analyze.py::TestFormatResultsForPrompt::test_formats_list_of_results_as_text PASSED
tests/test_analyze.py::TestFormatResultsForPrompt::test_handles_empty_results PASSED
tests/test_analyze.py::TestGenerateBrief::test_calls_claude_with_model_and_returns_text PASSED
tests/test_analyze.py::TestGenerateBrief::test_brief_prompt_includes_niv_context PASSED
tests/test_analyze.py::TestSaveBrief::test_writes_brief_to_file_with_header PASSED
tests/test_analyze.py::TestSaveBrief::test_overwrites_existing_file PASSED
tests/test_analyze.py::TestAppendToLog::test_creates_log_file_if_missing PASSED
tests/test_analyze.py::TestAppendToLog::test_appends_to_existing_log PASSED
```

- [ ] **Step 5: Commit**

```bash
cd ~/niv-agents
git add darius/analyze.py tests/test_analyze.py
git commit -m "feat: add darius/analyze.py for Claude-powered brief generation"
```

---

## Task 6: `darius/darius.py` — Main Entry Point

**Files:**
- Create: `~/niv-agents/darius/darius.py`

- [ ] **Step 1: Write `darius/darius.py`**

Write to `~/niv-agents/darius/darius.py`:
```python
#!/usr/bin/env python3
"""
DARIUS — Intelligence & Opportunity Scout
Usage:
    python darius/darius.py --auto    # morning cron scan
    python darius/darius.py --chat    # interactive conversation
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

# Resolve ~/niv-agents/ regardless of where the script is called from
BASE_DIR = Path(__file__).resolve().parent.parent

# Make darius/ importable when running as python darius/darius.py
sys.path.insert(0, str(BASE_DIR / "darius"))

import anthropic
from analyze import append_to_log, generate_brief, save_brief
from search import parse_sources, run_searches


def _get_client() -> anthropic.Anthropic:
    load_dotenv(BASE_DIR / ".env")
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not found. Add it to ~/niv-agents/.env")
        sys.exit(1)
    return anthropic.Anthropic(api_key=api_key)


def run_auto(client: anthropic.Anthropic) -> None:
    """Auto mode: search → analyze → save brief. Designed for cron."""
    print("DARIUS: Starting morning scan...")

    niv_context = (BASE_DIR / "brain" / "niv.md").read_text(encoding="utf-8")
    topics, feeds = parse_sources(str(BASE_DIR / "darius" / "sources.md"))

    print(f"  Searching {len(topics)} topics + {len(feeds)} RSS feeds...")
    raw_results = run_searches(topics, feeds)
    print(f"  Got {len(raw_results)} raw results. Analyzing with Claude...")

    brief = generate_brief(raw_results, niv_context, client)

    output_path = str(BASE_DIR / "output" / "darius-brief.md")
    save_brief(brief, output_path)
    print(f"  Brief saved → {output_path}")

    log_summary = f"- Scanned {len(raw_results)} results across {len(topics)} topics + {len(feeds)} feeds\n- Brief saved to output/darius-brief.md"
    append_to_log(log_summary, str(BASE_DIR / "memory" / "darius-log.md"), "Auto Run")

    print("DARIUS: Done.")


def run_chat(client: anthropic.Anthropic) -> None:
    """Chat mode: interactive conversation. Darius loads brain + memory as context."""
    from rich.console import Console
    from rich.markdown import Markdown

    console = Console()

    niv_context = (BASE_DIR / "brain" / "niv.md").read_text(encoding="utf-8")

    log_path = BASE_DIR / "memory" / "darius-log.md"
    log_content = log_path.read_text(encoding="utf-8") if log_path.exists() else ""

    brief_path = BASE_DIR / "output" / "darius-brief.md"
    brief_content = brief_path.read_text(encoding="utf-8") if brief_path.exists() else ""

    system_prompt = f"""You are DARIUS, a strategic intelligence agent for Niv Shimoni.
You think like a senior BizDev advisor who knows the Lithuanian, Israeli, and EU startup scenes.
You are direct, concise, and always connect information back to Niv's specific goals.

WHO NIV IS:
{niv_context}

YOUR MEMORY (recent activity):
{log_content[-3000:] if log_content else "No previous sessions yet."}

TODAY'S BRIEF:
{brief_content if brief_content else "No brief generated yet today. Run with --auto to generate one."}

When asked to search for something, say you're searching, then use your knowledge to surface
relevant names, companies, deals, or people. Be direct. One insight is worth more than five generic facts."""

    console.print("\n[bold cyan]DARIUS:[/bold cyan] Ready. What do you want to know?\n")

    messages: list[dict] = []
    session_notes: list[str] = []

    try:
        while True:
            user_input = input("You: ").strip()
            if not user_input or user_input.lower() in ("exit", "quit", "bye"):
                break

            messages.append({"role": "user", "content": user_input})
            session_notes.append(f"- Niv asked: {user_input[:80]}")

            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1000,
                system=system_prompt,
                messages=messages,
            )
            reply = response.content[0].text
            messages.append({"role": "assistant", "content": reply})

            console.print(f"\n[bold cyan]DARIUS:[/bold cyan]")
            console.print(Markdown(reply))
            console.print()

    except KeyboardInterrupt:
        pass

    if session_notes:
        summary = "\n".join(session_notes[:5])
        append_to_log(summary, str(BASE_DIR / "memory" / "darius-log.md"), "Chat Session")

    console.print("\n[dim]Session logged. Goodbye.[/dim]\n")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="DARIUS — Intelligence & Opportunity Scout",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="Examples:\n  python darius/darius.py --auto\n  python darius/darius.py --chat",
    )
    parser.add_argument("--auto", action="store_true", help="Run morning scan (for cron)")
    parser.add_argument("--chat", action="store_true", help="Start interactive chat with Darius")
    args = parser.parse_args()

    if not args.auto and not args.chat:
        parser.print_help()
        return

    client = _get_client()

    if args.auto:
        run_auto(client)
    elif args.chat:
        run_chat(client)


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Make it executable**

```bash
chmod +x ~/niv-agents/darius/darius.py
```

- [ ] **Step 3: Smoke test — auto mode**

```bash
cd ~/niv-agents
python darius/darius.py --auto
```

Expected output:
```
DARIUS: Starting morning scan...
  Searching 11 topics + 5 RSS feeds...
  Got [N] raw results. Analyzing with Claude...
  Brief saved → /Users/<you>/niv-agents/output/darius-brief.md
DARIUS: Done.
```

Then verify the brief was created:
```bash
cat ~/niv-agents/output/darius-brief.md
```

Expected: A markdown brief with 5–8 numbered items, each with "Why this matters for Niv."

- [ ] **Step 4: Smoke test — chat mode**

```bash
cd ~/niv-agents
python darius/darius.py --chat
```

Type: `What do you know about the agritech scene in Lithuania?`
Expected: DARIUS responds with relevant context. Type `exit` to quit.

- [ ] **Step 5: Commit**

```bash
cd ~/niv-agents
git add darius/darius.py
git commit -m "feat: add darius/darius.py with --auto and --chat modes"
```

---

## Task 7: `maya/tone.md` — Niv's Voice Guide

**Files:**
- Create: `~/niv-agents/maya/tone.md`
- Create: `~/niv-agents/maya/__init__.py`

- [ ] **Step 1: Create `maya/__init__.py`**

```bash
touch ~/niv-agents/maya/__init__.py
```

- [ ] **Step 2: Write `maya/tone.md`**

Write to `~/niv-agents/maya/tone.md`:
```markdown
# Maya — Niv's Voice Guide

You write like Niv would write — if he had unlimited time and perfect words.
Internalize this guide completely before writing anything.

---

## Core Writing Principles

1. **Short sentences.** One idea per sentence. If a sentence has a comma, it's probably two sentences.
2. **Human first, business second.** Start with the person, not the pitch.
3. **No buzzwords.** Never write: "leverage", "synergy", "game-changer", "disruptive", "innovative", 
   "cutting-edge", "passionate about", "excited to share", "touch base", "circle back".
4. **Build trust before asking for anything.** The first message never asks for a meeting.
5. **Specificity over flattery.** Reference something real about the person or company. 
   Show you actually looked.
6. **Confident, not pushy.** State what you do clearly. Don't oversell.
7. **Earn the reply.** Every message should give something — an insight, a relevant angle, 
   a specific observation. Not just "let's connect."

---

## English vs Hebrew

**English:** Use for Lithuanian contacts, EU ecosystem, international audiences.
- Tone: Professional but warm. Not stiff.
- Length: Shorter than you think. Europeans appreciate brevity.
- Opening: Never "I hope this email finds you well."

**Hebrew:** Use for Israeli contacts, familiar relationships.
- Tone: More direct. Less formal. Can be warmer and more casual.
- Slang is OK if the relationship allows it.
- Don't translate English-style corporate emails into Hebrew — rewrite them.

---

## Things Niv Never Says

- "I'd love to connect and explore synergies"
- "I'm reaching out because I came across your profile"
- "Let me know if you'd like to schedule a call"
- "I think there's a great opportunity here for both of us"
- "Looking forward to hearing from you!" (exclamation mark)
- Any sentence starting with "I" three times in a row

---

## What Good Looks Like

**Bad outreach:**
> Hi [Name], I came across your profile and was very impressed by your work in agritech. 
> I'm an AI consultant and I think there could be synergies between us. 
> Would love to schedule a 30-minute call to explore. Let me know!

**Good outreach:**
> Hi [Name], I've been following what Rooted is doing in precision irrigation — 
> the sensor-to-action loop you described in the Delfi interview is exactly the gap 
> most Lithuanian farms are stuck on. I'm working on a similar bridge from the 
> AI automation side — specifically for SMBs that can't afford enterprise setups. 
> Worth a short conversation?

---

## Format Rules

- Emails: Subject line is specific, not clever. Body is 3–5 sentences max for cold outreach.
- LinkedIn posts: Start with a statement or question, not "I'm excited to announce."
  End with one concrete question or observation, not a CTA.
- WhatsApp: Even shorter. One paragraph. Sounds like a text, not an email.
- Follow-ups: Never start with "Just following up." Say something new or don't send.
```

- [ ] **Step 3: Commit**

```bash
cd ~/niv-agents
git add maya/__init__.py maya/tone.md
git commit -m "feat: add maya/tone.md voice guide"
```

---

## Task 8: `maya/maya.py` — Interactive Writing CLI (TDD)

**Files:**
- Create: `~/niv-agents/maya/maya.py`
- Create: `~/niv-agents/tests/test_maya.py`

- [ ] **Step 1: Write failing tests in `tests/test_maya.py`**

Write to `~/niv-agents/tests/test_maya.py`:
```python
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock

from maya.maya import load_inbox_context, move_used_files, save_draft, append_to_log


class TestLoadInboxContext:
    def test_returns_empty_when_inbox_has_no_files(self, tmp_path):
        inbox_dir = tmp_path / "inbox"
        inbox_dir.mkdir()
        context, files = load_inbox_context(str(inbox_dir))
        assert context == ""
        assert files == []

    def test_loads_md_and_txt_files(self, tmp_path):
        inbox_dir = tmp_path / "inbox"
        inbox_dir.mkdir()
        (inbox_dir / "profile.md").write_text("Name: Lukas\nRole: Founder")
        (inbox_dir / "notes.txt").write_text("Met at conference in Vilnius.")

        context, files = load_inbox_context(str(inbox_dir))

        assert "Lukas" in context
        assert "Vilnius" in context
        assert len(files) == 2

    def test_ignores_files_in_used_subfolder(self, tmp_path):
        inbox_dir = tmp_path / "inbox"
        used_dir = inbox_dir / "used"
        used_dir.mkdir(parents=True)
        (used_dir / "old.md").write_text("Old context")

        context, files = load_inbox_context(str(inbox_dir))

        assert context == ""
        assert files == []


class TestMoveUsedFiles:
    def test_moves_files_to_used_subfolder(self, tmp_path):
        inbox_dir = tmp_path / "inbox"
        inbox_dir.mkdir()
        file1 = inbox_dir / "profile.md"
        file1.write_text("Some content")

        move_used_files([file1], str(inbox_dir))

        assert not file1.exists()
        assert (inbox_dir / "used" / "profile.md").exists()

    def test_creates_used_dir_if_missing(self, tmp_path):
        inbox_dir = tmp_path / "inbox"
        inbox_dir.mkdir()
        f = inbox_dir / "test.md"
        f.write_text("content")

        move_used_files([f], str(inbox_dir))

        assert (inbox_dir / "used").is_dir()


class TestSaveDraft:
    def test_saves_content_to_drafts_folder(self, tmp_path):
        drafts_dir = tmp_path / "drafts"
        path = save_draft("Dear Lukas,\nHope this finds you well.", "email to Lukas agritech", str(drafts_dir))

        assert Path(path).exists()
        assert "email-to-lukas" in path
        assert "Dear Lukas" in Path(path).read_text()

    def test_filename_includes_date(self, tmp_path):
        drafts_dir = tmp_path / "drafts"
        path = save_draft("Content", "test task", str(drafts_dir))
        filename = Path(path).name

        import re
        assert re.match(r"\d{4}-\d{2}-\d{2}-", filename)


class TestAppendToMayaLog:
    def test_appends_dated_entry(self, tmp_path):
        log_file = tmp_path / "maya-log.md"
        append_to_log("Wrote outreach to Lukas", str(log_file))

        content = log_file.read_text()
        assert "Wrote outreach to Lukas" in content

    def test_appends_to_existing_log(self, tmp_path):
        log_file = tmp_path / "maya-log.md"
        log_file.write_text("## 2026-06-13\n- Old entry\n")
        append_to_log("New entry today", str(log_file))

        content = log_file.read_text()
        assert "Old entry" in content
        assert "New entry today" in content
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd ~/niv-agents
pytest tests/test_maya.py -v
```

Expected: `ModuleNotFoundError: No module named 'maya.maya'`

- [ ] **Step 3: Write `maya/maya.py`**

Write to `~/niv-agents/maya/maya.py`:
```python
#!/usr/bin/env python3
"""
MAYA — Voice, Content & Outreach
Usage:
    python maya/maya.py
"""

from __future__ import annotations

import os
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent


def load_inbox_context(inbox_dir: str | None = None) -> tuple[str, list[Path]]:
    """
    Load all .md and .txt files from inbox/ (excludes inbox/used/).
    Returns (combined_context_string, list_of_file_paths).
    """
    inbox_path = Path(inbox_dir) if inbox_dir else BASE_DIR / "inbox"
    inbox_path.mkdir(exist_ok=True)

    files = [
        f for f in inbox_path.iterdir()
        if f.is_file() and f.suffix in (".md", ".txt")
    ]

    if not files:
        return "", []

    parts = [f"--- {f.name} ---\n{f.read_text(encoding='utf-8')}" for f in files]
    return "\n\n".join(parts), files


def move_used_files(files: list[Path], inbox_dir: str | None = None) -> None:
    """Move used inbox files to inbox/used/ (never deleted)."""
    inbox_path = Path(inbox_dir) if inbox_dir else BASE_DIR / "inbox"
    used_dir = inbox_path / "used"
    used_dir.mkdir(exist_ok=True)
    for f in files:
        dest = used_dir / f.name
        f.rename(dest)


def save_draft(content: str, task_description: str, drafts_dir: str | None = None) -> str:
    """Save a draft to output/drafts/YYYY-MM-DD-slug.md. Returns path."""
    output_dir = Path(drafts_dir) if drafts_dir else BASE_DIR / "output" / "drafts"
    output_dir.mkdir(parents=True, exist_ok=True)

    date_str = datetime.now().strftime("%Y-%m-%d")
    slug = task_description[:40].lower().replace(" ", "-")
    slug = "".join(c for c in slug if c.isalnum() or c == "-")
    filename = f"{date_str}-{slug}.md"
    path = output_dir / filename
    path.write_text(content, encoding="utf-8")
    return str(path)


def append_to_log(entry: str, log_path: str | None = None) -> None:
    """Append a dated session entry to memory/maya-log.md."""
    path = Path(log_path) if log_path else BASE_DIR / "memory" / "maya-log.md"
    date_str = datetime.now().strftime("%Y-%m-%d")
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"\n## {date_str}\n{entry}\n")


def main() -> None:
    import anthropic
    from rich.console import Console
    from rich.markdown import Markdown

    load_dotenv(BASE_DIR / ".env")
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not found. Add it to ~/niv-agents/.env")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    console = Console()

    niv_context = (BASE_DIR / "brain" / "niv.md").read_text(encoding="utf-8")
    tone_guide = (BASE_DIR / "maya" / "tone.md").read_text(encoding="utf-8")

    inbox_context, inbox_files = load_inbox_context()
    if inbox_files:
        console.print(f"[dim]Loaded from inbox: {', '.join(f.name for f in inbox_files)}[/dim]")

    system_prompt = f"""You are MAYA, Niv Shimoni's writing partner.

WHO NIV IS:
{niv_context}

HOW NIV WRITES — internalize this completely:
{tone_guide}

{"CONTEXT FROM INBOX:" + chr(10) + inbox_context if inbox_context else ""}

Your job: write content that sounds exactly like Niv.
When given a task, write immediately — don't explain your approach first.
Just write. Then ask if it's right. One piece of content per turn.
Iterate until Niv says it's good."""

    console.print("\n[bold magenta]MAYA:[/bold magenta] Hey Niv. What are we writing today?\n")

    messages: list[dict] = []
    session_log: list[str] = []

    try:
        while True:
            user_input = input("You: ").strip()
            if not user_input or user_input.lower() in ("exit", "quit", "bye", "done"):
                break

            messages.append({"role": "user", "content": user_input})

            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1000,
                system=system_prompt,
                messages=messages,
            )
            reply = response.content[0].text
            messages.append({"role": "assistant", "content": reply})

            console.print(f"\n[bold magenta]MAYA:[/bold magenta]")
            console.print(Markdown(reply))
            console.print()

            save_choice = input("Save this draft? (y/n): ").strip().lower()
            if save_choice == "y":
                path = save_draft(reply, user_input)
                session_log.append(f"- Wrote: {user_input[:60]}")
                session_log.append(f"  Saved: {path}")
                console.print(f"[green]Saved → {path}[/green]\n")

    except KeyboardInterrupt:
        pass

    if inbox_files:
        clear = input(f"\nMove {len(inbox_files)} inbox file(s) to inbox/used/? (y/n): ").strip().lower()
        if clear == "y":
            move_used_files(inbox_files)
            console.print(f"[dim]Moved to inbox/used/[/dim]")

    if session_log:
        append_to_log("\n".join(session_log))

    console.print("\n[dim]Session complete. Goodbye.[/dim]\n")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Make it executable**

```bash
chmod +x ~/niv-agents/maya/maya.py
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
cd ~/niv-agents
pytest tests/test_maya.py -v
```

Expected:
```
tests/test_maya.py::TestLoadInboxContext::test_returns_empty_when_inbox_has_no_files PASSED
tests/test_maya.py::TestLoadInboxContext::test_loads_md_and_txt_files PASSED
tests/test_maya.py::TestLoadInboxContext::test_ignores_files_in_used_subfolder PASSED
tests/test_maya.py::TestMoveUsedFiles::test_moves_files_to_used_subfolder PASSED
tests/test_maya.py::TestMoveUsedFiles::test_creates_used_dir_if_missing PASSED
tests/test_maya.py::TestSaveDraft::test_saves_content_to_drafts_folder PASSED
tests/test_maya.py::TestSaveDraft::test_filename_includes_date PASSED
tests/test_maya.py::TestAppendToMayaLog::test_appends_dated_entry PASSED
tests/test_maya.py::TestAppendToMayaLog::test_appends_to_existing_log PASSED
```

- [ ] **Step 6: Smoke test Maya**

```bash
cd ~/niv-agents
python maya/maya.py
```

Type: `Write a cold outreach LinkedIn message to a Lithuanian agritech founder I just discovered.`
Expected: Maya writes a message in Niv's voice. Type `exit` to quit.

- [ ] **Step 7: Commit**

```bash
cd ~/niv-agents
git add maya/maya.py tests/test_maya.py
git commit -m "feat: add maya/maya.py interactive writing CLI"
```

---

## Task 9: Cron Setup + Full Test Suite

**Files:**
- Modify: Mac crontab

- [ ] **Step 1: Run the full test suite**

```bash
cd ~/niv-agents
pytest tests/ -v
```

Expected: All tests pass. Fix any failures before continuing.

- [ ] **Step 2: Verify Python path for cron**

```bash
which python3
```

Copy the output — you'll need the exact path for cron (e.g. `/usr/bin/python3` or `/opt/homebrew/bin/python3`).

- [ ] **Step 3: Open crontab**

```bash
crontab -e
```

- [ ] **Step 4: Add the morning cron job**

Add this line (replace `/opt/homebrew/bin/python3` with your actual Python path from Step 2):

```
0 7 * * * cd /Users/YOUR_USERNAME/niv-agents && /opt/homebrew/bin/python3 darius/darius.py --auto >> /tmp/darius-cron.log 2>&1
```

Replace `YOUR_USERNAME` with your actual Mac username. Save and close the editor.

- [ ] **Step 5: Verify crontab was saved**

```bash
crontab -l
```

Expected: The line you just added appears.

- [ ] **Step 6: Test cron manually right now**

```bash
cd ~/niv-agents && python3 darius/darius.py --auto
cat output/darius-brief.md
```

Expected: A fresh brief with today's date appears.

- [ ] **Step 7: Final commit**

```bash
cd ~/niv-agents
git add tests/
git commit -m "feat: complete niv-agents system — DARIUS + MAYA + cron"
```

---

## Quick Reference

After everything is built:

```bash
# Run Darius manually (morning scan)
cd ~/niv-agents && python darius/darius.py --auto

# Chat with Darius
cd ~/niv-agents && python darius/darius.py --chat

# Talk to Maya
cd ~/niv-agents && python maya/maya.py

# Drop a file for Maya to use as context
cp ~/Downloads/linkedin-profile.md ~/niv-agents/inbox/

# Run all tests
cd ~/niv-agents && pytest tests/ -v

# Check Darius cron logs
cat /tmp/darius-cron.log

# Read today's brief
cat ~/niv-agents/output/darius-brief.md
```
