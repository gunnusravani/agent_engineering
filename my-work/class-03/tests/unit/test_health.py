"""Unit tests for system health check."""

from __future__ import annotations

from widgetware_sdr.health import check_health


def test_health_check() -> None:
    health = check_health()
    assert health["status"] == "healthy"
    assert health["model_id"] == "gemini-2.5-flash"
    assert health["config"]["icp_loaded"] is True
    assert health["config"]["policies_loaded"] is True
    assert health["config"]["products_loaded"] is True
