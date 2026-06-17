export const INCOME_STABILITY_OPTIONS = [
  { label: "Stabil", value: "STABLE" },
  { label: "Naik-turun", value: "FLUCTUATING" },
  { label: "Tidak stabil", value: "UNSTABLE" },
];

export const EMPLOYER_CATEGORY_OPTIONS = [
  { label: "Perusahaan besar / BUMN / Pemerintahan", value: "Category A (MNC/Govt/PSU)" },
  { label: "Perusahaan swasta", value: "Category B (Private Ltd)" },
  { label: "Usaha kecil / kemitraan / proprietorship", value: "Category C (Partnership/Proprietorship)" },
  { label: "Tidak terdaftar / tidak jelas", value: "Unlisted" },
];

export const CREDIT_EXPOSURE_OPTIONS = [
  { label: "Tidak ada — tidak punya tanggungan kredit", value: 0 },
  { label: "Rendah — 1 cicilan kecil", value: 1 },
  { label: "Rendah-menengah — 1-2 cicilan ringan", value: 2 },
  { label: "Sedang — beberapa cicilan aktif", value: 3 },
  { label: "Sedang-tinggi — banyak cicilan berjalan", value: 4 },
  { label: "Tinggi — beban kredit berat", value: 5 },
  { label: "Sangat tinggi — hampir seluruh pendapatan untuk cicilan", value: 6 },
];

export const YES_NO_OPTIONS = [
  { label: "Ya", value: 1 },
  { label: "Tidak", value: 0 },
];

export const RISK_LABELS = {
  0: "Low Risk",
  1: "Medium Risk",
  2: "High Risk",
};

export const RISK_LABEL_ID = {
  "Low Risk": "Rendah",
  "Medium Risk": "Sedang",
  "High Risk": "Tinggi",
};

export const ELIGIBILITY_STATUS = [
  { min: 0.80, label: "Sangat Layak" },
  { min: 0.60, label: "Layak" },
  { min: 0.40, label: "Dipertimbangkan" },
  { min: 0.20, label: "Berisiko" },
  { min: 0, label: "Tidak Layak" },
];

export function getEligibilityStatus(score) {
  for (const tier of ELIGIBILITY_STATUS) {
    if (score >= tier.min) return tier.label;
  }
  return "Tidak Layak";
}
