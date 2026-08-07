"""The Account Qualification Assistant.

Reasons about a supplied account profile and recommends an outcome in prose.
No tools or external services are bound to this agent.
"""

from __future__ import annotations

from google.adk.agents import Agent

from widgetware_sdr.context_builder import load_config
from widgetware_sdr.instructions import SYSTEM_INSTRUCTIONS, get_model_id

EMBEDDED_QUALIFICATION_PROCEDURE = """\
=== QUALIFICATION PROCEDURE ===

1. Check explicit exclusion criteria first. If the account's industry
   is in the excluded-industries list, the outcome is DO_NOT_QUALIFY
   regardless of any other positive signal.
2. Compare the account's attributes against the ICP thresholds:
   employee count against the minimum, industry against the preferred
   list, region against the preferred list.
3. Identify confirmed pain signals in the account's known challenges
   and source notes — concrete, specific statements, not vague
   mentions.
4. Identify what information is missing that would be needed to
   qualify or disqualify confidently.
5. Distinguish fact (directly stated) from inference (your own
   reasoning about what a fact implies). Never state an inference with
   the confidence of a fact.
6. Select a provisional outcome: QUALIFY, DO_NOT_QUALIFY, or
   NEEDS_RESEARCH (when a decisive fact, most commonly employee count,
   is missing, or the available signal is too vague to be decisive).
7. Explain the outcome: which specific criteria were matched or
   failed, which evidence supports the pain signal (if any), and what
   remains unknown.

Never fabricate an account attribute. Exclusions override positive
heuristics. Insufficient evidence produces NEEDS_RESEARCH, never a
guess.
"""


def build_agent_instruction() -> str:
    """Assemble the agent's static instruction."""
    icp = load_config("icp.yaml")
    policies = load_config("policies.yaml")

    return "\n\n".join(
        [
            SYSTEM_INSTRUCTIONS.strip(),
            "=== WIDGETWARE ICP ===",
            f"Minimum employee count: {icp['minimum_employee_count']}",
            f"Preferred industries: {', '.join(icp['preferred_industries'])}",
            f"Excluded industries: {', '.join(icp['excluded_industries'])}",
            f"Preferred regions: {', '.join(icp['preferred_regions'])}",
            f"Buying signals: {', '.join(icp['buying_signals'])}",
            "=== ESCALATION RULE ===",
            policies["escalation_rule"].strip(),
            EMBEDDED_QUALIFICATION_PROCEDURE.strip(),
        ]
    )


def create_qualification_agent() -> Agent:
    """Construct the qualification agent."""
    return Agent(
        name="qualification_agent",
        model=get_model_id(),
        description=(
            "Evaluates whether a target account fits WidgetWare's ideal "
            "customer profile, using only the account data it is given."
        ),
        instruction=build_agent_instruction(),
    )
