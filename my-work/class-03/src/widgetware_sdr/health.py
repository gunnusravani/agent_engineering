"""System health check module."""

from __future__ import annotations

from typing import Any

from widgetware_sdr.context_builder import load_config
from widgetware_sdr.instructions import get_model_id


def check_health() -> dict[str, Any]:
    """Return health status of configuration and environment setup."""
    icp = load_config("icp.yaml")
    policies = load_config("policies.yaml")
    products = load_config("products.yaml")

    return {
        "status": "healthy",
        "model_id": get_model_id(),
        "config": {
            "icp_loaded": bool(icp),
            "policies_loaded": bool(policies),
            "products_loaded": bool(products),
        },
    }
