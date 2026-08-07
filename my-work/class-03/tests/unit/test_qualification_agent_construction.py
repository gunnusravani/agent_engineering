"""Unit tests for qualification agent construction."""

from __future__ import annotations

from pathlib import Path

from widgetware_sdr.agents.qualification_agent import (
    EMBEDDED_QUALIFICATION_PROCEDURE,
    build_agent_instruction,
    create_qualification_agent,
)


def test_qualification_agent_construction() -> None:
    agent = create_qualification_agent()

    assert agent.name == "qualification_agent"
    assert agent.model == "gemini-2.5-flash"
    assert agent.tools is None or len(agent.tools) == 0


def test_agent_instruction_assembly() -> None:
    instruction = build_agent_instruction()

    assert "Minimum employee count: 5000" in instruction
    assert "manufacturing" in instruction
    assert EMBEDDED_QUALIFICATION_PROCEDURE.strip() in instruction


def test_no_skills_directory_exists_checkpoint() -> None:
    """Verify that no skills/ directory exists yet in this checkpoint (Class 03)."""
    root_dir = Path(__file__).resolve().parent.parent.parent
    skills_dir = root_dir / "skills"
    assert not skills_dir.exists(), "Class 3 must not contain a skills/ directory"
