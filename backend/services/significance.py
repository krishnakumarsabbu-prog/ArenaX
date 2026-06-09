import math

try:
    from scipy import stats
    _HAS_SCIPY = True
except ImportError:
    _HAS_SCIPY = False


class SignificanceEngine:
    """Two-proportion z-test for A/B conversion rate comparison."""

    def compute_confidence(
        self,
        n_treatment: int,
        conv_treatment: int,
        n_control: int,
        conv_control: int
    ) -> float:
        if n_treatment < 30 or n_control < 30:
            return 0.0

        p1 = conv_treatment / n_treatment
        p2 = conv_control / n_control

        if p1 == 0 and p2 == 0:
            return 0.0

        p_pool = (conv_treatment + conv_control) / (n_treatment + n_control)
        se = math.sqrt(p_pool * (1 - p_pool) * (1 / n_treatment + 1 / n_control))

        if se == 0:
            return 0.0

        z = (p1 - p2) / se

        if _HAS_SCIPY:
            p_value = 2 * (1 - stats.norm.cdf(abs(z)))
        else:
            # Approximation without scipy
            p_value = 2 * (1 - self._norm_cdf(abs(z)))

        confidence = 1 - p_value
        return max(0.0, min(1.0, confidence))

    def _norm_cdf(self, x: float) -> float:
        """Abramowitz and Stegun approximation for normal CDF."""
        t = 1.0 / (1.0 + 0.2316419 * abs(x))
        d = 0.3989422820 * math.exp(-x * x / 2.0)
        p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))))
        if x > 0:
            return 1.0 - p
        return p

    def minimum_sample_size(self, baseline_cvr: float, mde: float, alpha: float = 0.05, power: float = 0.80) -> int:
        p1 = baseline_cvr
        p2 = baseline_cvr * (1 + mde)
        if _HAS_SCIPY:
            z_alpha = stats.norm.ppf(1 - alpha / 2)
            z_beta  = stats.norm.ppf(power)
        else:
            z_alpha = 1.96
            z_beta  = 0.842
        n = ((z_alpha * math.sqrt(2 * p1 * (1 - p1)) +
              z_beta  * math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2) / ((p2 - p1) ** 2)
        return math.ceil(n)
