import os
import json
import httpx

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
CLAUDE_MODEL = "claude-sonnet-4-5"


class AIService:

    async def synthesize_experiment(self, exp_data: dict, variant_stats: list) -> dict:
        prompt = f"""
You are an expert CRO (Conversion Rate Optimisation) analyst. Analyse this A/B experiment
and return ONLY a JSON object with no markdown, no preamble.

Experiment:
- Name: {exp_data['name']}
- URL: {exp_data['url']}
- Hypothesis: {exp_data.get('hypothesis', 'Not stated')}
- Goal metric: {exp_data['goal_metric']}

Variant results:
{json.dumps(variant_stats, indent=2)}

Return JSON with exactly these keys:
{{
  "hypothesis_confirmed": true/false,
  "verdict_summary": "2-3 sentence plain-English verdict",
  "winner_variant": "variant key or null",
  "key_insights": ["insight 1", "insight 2", "insight 3"],
  "key_segments": ["segment insight 1", "segment insight 2"],
  "next_tests": ["next test idea 1", "next test idea 2", "next test idea 3"],
  "confidence_level": "high/medium/low",
  "raw_analysis": "detailed 4-6 sentence analysis"
}}
"""
        return await self._call_claude(prompt)

    async def champion_strategy(self, challenge_data: dict, team_data: dict, competitor_data: dict) -> dict:
        gap = (competitor_data.get('score', 0) or 0) - (team_data.get('score', 0) or 0)
        prompt = f"""
You are a competitive growth strategist. A team needs a strategy to close a performance gap
in a live A/B testing competition. Return ONLY a JSON object with no markdown.

Challenge: {challenge_data['name']}
Current round: {challenge_data['current_round']} of {challenge_data['total_rounds']}

Team requesting strategy: {team_data['name']}
Team URL: {team_data['url']}
Team current score: {team_data.get('score', 'unknown')}
Team CVR: {team_data.get('cvr', 'unknown')}

Top competitor: {competitor_data['name']}
Competitor score: {competitor_data.get('score', 'unknown')}
Competitor CVR: {competitor_data.get('cvr', 'unknown')}
Gap to close: {gap:.1f} points

Return JSON:
{{
  "gap_analysis": "2-3 sentence analysis of why the gap exists",
  "quick_wins": ["immediate action 1", "immediate action 2"],
  "strategic_tests": ["test idea 1 with rationale", "test idea 2 with rationale"],
  "risk_moves": ["high-risk high-reward move"],
  "predicted_outcome": "outcome if recommendations are followed",
  "confidence": "high/medium/low"
}}
"""
        return await self._call_claude(prompt)

    async def _call_claude(self, prompt: str) -> dict:
        if not ANTHROPIC_API_KEY:
            return self._mock_response(prompt)

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": ANTHROPIC_API_KEY,
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json"
                    },
                    json={
                        "model": CLAUDE_MODEL,
                        "max_tokens": 1024,
                        "messages": [{"role": "user", "content": prompt}]
                    }
                )
                resp.raise_for_status()
                data = resp.json()
                text = data["content"][0]["text"].strip()
                text = text.replace("```json", "").replace("```", "").strip()
                return json.loads(text)
        except Exception as e:
            return {"error": str(e), "mock": True}

    def _mock_response(self, prompt: str) -> dict:
        if "champion" in prompt.lower() or "competitor" in prompt.lower():
            return {
                "gap_analysis": "The performance gap stems from lower conversion rates on mobile devices and a less optimised CTA placement. The competitor's structured layout and prominent social proof are driving higher engagement.",
                "quick_wins": [
                    "Increase CTA button contrast and size on mobile viewports",
                    "Add customer count social proof near the primary CTA"
                ],
                "strategic_tests": [
                    "Test a sticky CTA bar on scroll — retains the offer in view without disrupting the reading flow",
                    "Test a value-first headline variant that leads with the benefit rather than the product name"
                ],
                "risk_moves": [
                    "Replace the hero section entirely with a video testimonial — high variance but proven to double CVR in SaaS contexts"
                ],
                "predicted_outcome": "Implementing the quick wins alone should close 40–60% of the gap within 72 hours of deployment.",
                "confidence": "medium"
            }
        return {
            "hypothesis_confirmed": True,
            "verdict_summary": "The treatment variant showed a statistically meaningful improvement in conversion rate. The hypothesis is supported by the data with high confidence.",
            "winner_variant": "variant_b",
            "key_insights": [
                "Variant B achieved 18% higher CVR across all device types",
                "Mobile users responded 2.3x better to the new CTA copy",
                "New visitors converted at a notably higher rate with Variant B"
            ],
            "key_segments": [
                "Mobile users showed the strongest positive response to the change",
                "US and GB markets drove the majority of the observed lift"
            ],
            "next_tests": [
                "Test CTA button colour — current blue vs high-contrast orange",
                "Test hero image — lifestyle photo vs product screenshot",
                "Test pricing page with a 'Most Popular' badge to drive plan anchoring"
            ],
            "confidence_level": "high",
            "raw_analysis": "The experiment ran for sufficient sessions to reach statistical significance. Variant B outperformed control across all measured segments. The effect size is large enough to be commercially meaningful and warrants full traffic allocation to Variant B. The hypothesis that changed copy reduces friction was confirmed."
        }
