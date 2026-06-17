import creditModel from "../data/creditModel.json";

const { mean, scale } = creditModel.scaler;
const { encoder_categories } = creditModel;

const NUMERIC_COLUMNS = creditModel.numeric_columns;

export function preprocess(applicantData) {
  const numericValues = NUMERIC_COLUMNS.map((col) => Number(applicantData[col]));

  const scaled = numericValues.map((val, i) => (val - mean[i]) / scale[i]);

  const incomeOHE = encoder_categories.income_stability.map(
    (cat) => (applicantData.income_stability === cat ? 1 : 0)
  );

  const employerOHE = encoder_categories.employer_category.map(
    (cat) => (applicantData.employer_category === cat ? 1 : 0)
  );

  return [...scaled, ...incomeOHE, ...employerOHE];
}
