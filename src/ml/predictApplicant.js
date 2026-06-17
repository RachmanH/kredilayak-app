import { preprocess } from "./preprocess";
import { runMLP } from "./mlp";
import { calculateTopsisForApplicant } from "./topsis";
import { RISK_LABELS, getEligibilityStatus } from "./mappings";

export function predictApplicant(applicantData) {
  const inputVector = preprocess(applicantData);

  const probabilities = runMLP(inputVector);
  const predictedLabel = probabilities.indexOf(Math.max(...probabilities));

  const predictedRiskCategory = RISK_LABELS[predictedLabel];

  const topsisInput = {
    ...applicantData,
    high_risk_probability: probabilities[2],
  };

  const topsisResult = calculateTopsisForApplicant(topsisInput);

  return {
    predicted_risk_category: predictedRiskCategory,
    low_risk_probability: probabilities[0],
    medium_risk_probability: probabilities[1],
    high_risk_probability: probabilities[2],
    topsis_score: topsisResult.topsis_score,
    ranking: topsisResult.ranking,
    total_benchmark: topsisResult.total_benchmark,
    eligibility_status: getEligibilityStatus(topsisResult.topsis_score),
  };
}
