"""Unit tests for local application harness."""

from __future__ import annotations

from widgetware_sdr.app import render_task_message


def test_render_task_message() -> None:
    account = {"account_id": "test-123", "name": "Test Industry Inc"}
    notes = [{"source": "call_notes", "text": "Needs modern control systems."}]

    msg = render_task_message(account=account, notes=notes)

    assert "=== TASK: Qualify this account ===" in msg
    assert "test-123" in msg
    assert "=== BEGIN EVIDENCE" in msg
    assert "Needs modern control systems." in msg
