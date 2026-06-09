import numpy as np
from typing import List
import models


class BayesianBandit:
    """Thompson Sampling multi-armed bandit for variant assignment."""

    def sample(self, variants: List[models.Variant]) -> models.Variant:
        if not variants:
            raise ValueError("No variants provided to bandit")

        samples = []
        for v in variants:
            draw = np.random.beta(max(v.alpha, 0.1), max(v.beta, 0.1))
            samples.append((draw, v))

        samples.sort(key=lambda x: x[0], reverse=True)
        chosen = samples[0][1]

        total = sum(v.alpha + v.beta for v in variants)
        for v in variants:
            v.traffic_weight = round((v.alpha + v.beta) / total, 4)

        return chosen

    def posterior_mean(self, variant: models.Variant) -> float:
        return variant.alpha / (variant.alpha + variant.beta)

    def probability_best(self, target: models.Variant, all_variants: List[models.Variant], n_samples: int = 10000) -> float:
        draws = {v.id: np.random.beta(v.alpha, v.beta, n_samples) for v in all_variants}
        target_draws = draws[target.id]
        others = [d for vid, d in draws.items() if vid != target.id]
        if not others:
            return 1.0
        other_max = np.maximum.reduce(others)
        return float(np.mean(target_draws > other_max))
