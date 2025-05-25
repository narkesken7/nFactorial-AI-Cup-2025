from typing import List, Dict
import random

class SafetyChecker:
    def check_safety(self, guide_rnas: List[Dict]) -> List[Dict]:
        """Simulate safety analysis for guide RNAs."""
        safety_results = []
        
        for guide in guide_rnas:
            # Mock safety metrics
            safety_score = random.uniform(0.6, 1.0)
            toxicity_risk = random.uniform(0.0, 0.3)
            immunogenicity_risk = random.uniform(0.0, 0.2)
            
            safety_results.append({
                "guide_sequence": guide["sequence"],
                "safety_score": round(safety_score, 2),
                "toxicity_risk": round(toxicity_risk, 2),
                "immunogenicity_risk": round(immunogenicity_risk, 2),
                "recommendation": "Proceed with caution" if safety_score < 0.8 else "Safe to proceed",
                "warnings": [
                    "Potential off-target effects" if guide["off_target_sites"] > 0 else None,
                    "High toxicity risk" if toxicity_risk > 0.2 else None,
                    "Immunogenicity concerns" if immunogenicity_risk > 0.15 else None
                ]
            })
        
        return safety_results 