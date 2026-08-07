"""Unit tests for system instructions and model configuration."""

from __future__ import annotations

from widgetware_sdr.instructions import DEFAULT_MODEL_ID, SYSTEM_INSTRUCTIONS, get_model_id


def test_default_model_id() -> None:
    assert get_model_id() == DEFAULT_MODEL_ID


def test_override_model_id(monkeypatch) -> None:
    monkeypatch.setenv("WIDGETWARE_MODEL_ID", "gemini-1.5-pro")
    assert get_model_id() == "gemini-1.5-pro"


def test_system_instructions_roles_and_boundaries() -> None:
    assert "WidgetWare Account Qualification Assistant" in SYSTEM_INSTRUCTIONS
    assert "UNTRUSTED CONTENT" in SYSTEM_INSTRUCTIONS
    assert "PROHIBITED" in SYSTEM_INSTRUCTIONS
