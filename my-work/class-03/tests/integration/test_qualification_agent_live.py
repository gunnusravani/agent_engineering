"""Integration tests for live qualification agent reasoning.

Guarded by pytest skip if live API key / credentials are missing.
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest
import yaml

from widgetware_sdr.app import run_qualification_sync

HAS_CREDENTIALS = bool(
    os.environ.get("GOOGLE_API_KEY")
    or (os.environ.get("GOOGLE_CLOUD_PROJECT") and os.environ.get("GOOGLE_CLOUD_LOCATION"))
)

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "sample_accounts"


@pytest.mark.skipif(not HAS_CREDENTIALS, reason="No Gemini API credentials available")
def test_live_qualified_account() -> None:
    with (DATA_DIR / "acme-001.yaml").open("r", encoding="utf-8") as f:
        account = yaml.safe_load(f)

    events = run_qualification_sync(account=account)
    assert len(events) > 0
    final_text = "".join(
        part.text
        for event in events
        if hasattr(event, "content")
        for part in (event.content.parts or [])
        if hasattr(part, "text")
    )
    assert "QUALIFY" in final_text.upper()


@pytest.mark.skipif(not HAS_CREDENTIALS, reason="No Gemini API credentials available")
def test_live_disqualified_account() -> None:
    with (DATA_DIR / "brightleaf-002.yaml").open("r", encoding="utf-8") as f:
        account = yaml.safe_load(f)

    events = run_qualification_sync(account=account)
    assert len(events) > 0
    final_text = "".join(
        part.text
        for event in events
        if hasattr(event, "content")
        for part in (event.content.parts or [])
        if hasattr(part, "text")
    )
    assert "DO_NOT_QUALIFY" in final_text.upper()


@pytest.mark.skipif(not HAS_CREDENTIALS, reason="No Gemini API credentials available")
def test_live_ambiguous_account() -> None:
    with (DATA_DIR / "meridian-003.yaml").open("r", encoding="utf-8") as f:
        account = yaml.safe_load(f)

    events = run_qualification_sync(account=account)
    assert len(events) > 0
    final_text = "".join(
        part.text
        for event in events
        if hasattr(event, "content")
        for part in (event.content.parts or [])
        if hasattr(part, "text")
    )
    assert "NEEDS_RESEARCH" in final_text.upper()

