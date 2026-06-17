export function validateIdentity(data) {
  const errors = {};

  if (!data.applicant_name || data.applicant_name.trim() === "") {
    errors.applicant_name = "Nama wajib diisi";
  }

  const age = Number(data.applicant_age);
  if (isNaN(age) || !Number.isInteger(age) || age < 17 || age > 100) {
    errors.applicant_age = "Angka bulat, 17-100 tahun";
  }

  if (!data.applicant_gender || data.applicant_gender.trim() === "") {
    errors.applicant_gender = "Wajib dipilih";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateApplicant(data) {
  const errors = {};

  if (!data.income_stability) {
    errors.income_stability = "Wajib dipilih";
  }

  const moneyFields = [
    "average_eligible_emi",
    "average_usable_salary",
    "average_monthly_credit",
    "average_month_end_balance",
  ];

  for (const field of moneyFields) {
    const val = Number(data[field]);
    if (isNaN(val) || val < 0) {
      errors[field] = "Angka, minimal 0";
    }
  }

  if (!data.employer_category) {
    errors.employer_category = "Wajib dipilih";
  }

  const tenure = Number(data.employment_tenure_years);
  if (isNaN(tenure) || tenure < 0) {
    errors.employment_tenure_years = "Angka, minimal 0";
  }

  const intFields = ["bounce_count", "gambling_transaction_count", "active_loans_count"];
  for (const field of intFields) {
    const val = Number(data[field]);
    if (isNaN(val) || val < 0 || !Number.isInteger(val)) {
      errors[field] = "Angka bulat, minimal 0";
    }
  }

  const yesNoFields = ["has_credit_card", "has_personal_loan", "has_home_loan"];
  for (const field of yesNoFields) {
    if (data[field] !== 0 && data[field] !== 1) {
      errors[field] = "Wajib Ya atau Tidak";
    }
  }

  const exposure = Number(data.credit_exposure_intensity);
  if (isNaN(exposure) || exposure < 0 || exposure > 6 || !Number.isInteger(exposure)) {
    errors.credit_exposure_intensity = "Angka 0-6";
  }

  const oir = Number(data.average_obligation_to_income_ratio);
  if (isNaN(oir) || oir < 0) {
    errors.average_obligation_to_income_ratio = "Angka, minimal 0";
  }

  const cs = Number(data.credit_score);
  if (isNaN(cs) || cs < 300 || cs > 900) {
    errors.credit_score = "Angka 300-900";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
