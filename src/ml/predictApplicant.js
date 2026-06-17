import { preprocess } from "./preprocess";
import { runMLP } from "./mlpTfjs";
import { calculateTopsisForApplicant } from "./topsis";
import { RISK_LABELS, getEligibilityStatus } from "./mappings";

export async function predictApplicant(applicantData) {
  const inputVector = preprocess(applicantData);

  const probabilities = await runMLP(inputVector);
  const predictedLabel = probabilities.indexOf(Math.max(...probabilities));

  const predictedRiskCategory = RISK_LABELS[predictedLabel];

  const maxProb = Math.max(...probabilities);
  let confidence_level, confidence_label;
  if (maxProb >= 0.90) {
    confidence_level = "high";
    confidence_label = "Tinggi — profil pemohon sangat jelas";
  } else if (maxProb >= 0.70) {
    confidence_level = "medium";
    confidence_label = "Sedang — perlu pertimbangan tambahan";
  } else {
    confidence_level = "low";
    confidence_label = "Rendah — disarankan review manual oleh analis";
  }

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
    confidence_level,
    confidence_label,
    topsis_score: topsisResult.topsis_score,
    ranking: topsisResult.ranking,
    total_benchmark: topsisResult.total_benchmark,
    eligibility_status: getEligibilityStatus(topsisResult.topsis_score),
  };
}
