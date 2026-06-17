export function buildReasonSummary(data) {
  const reasons = [];

  if (data.credit_score < 600) {
    reasons.push("skor kredit rendah");
  } else if (data.credit_score >= 700) {
    reasons.push("skor kredit baik");
  }

  if (data.average_obligation_to_income_ratio > 50) {
    reasons.push("rasio cicilan terhadap pendapatan tinggi");
  } else if (data.average_obligation_to_income_ratio <= 30) {
    reasons.push("rasio cicilan terhadap pendapatan rendah");
  }

  if (data.bounce_count > 0) {
    reasons.push("terdapat transaksi gagal");
  }

  if (data.gambling_transaction_count > 0) {
    reasons.push("terdapat transaksi berisiko/gambling");
  }

  if (data.active_loans_count >= 4) {
    reasons.push("jumlah pinjaman aktif tinggi");
  }

  if (data.income_stability === "STABLE") {
    reasons.push("pendapatan stabil");
  } else if (data.income_stability === "FLUCTUATING") {
    reasons.push("pendapatan fluktuatif");
  } else if (data.income_stability === "UNSTABLE") {
    reasons.push("pendapatan tidak stabil");
  }

  if (reasons.length === 0) {
    return "Profil pemohon tidak memiliki indikator risiko dominan berdasarkan aturan sederhana.";
  }

  return "Pemohon memiliki faktor utama: " + reasons.join(", ") + ".";
}

const RISK_ID = {
  "Low Risk": "rendah",
  "Medium Risk": "sedang",
  "High Risk": "tinggi",
};

function describeConfidence(confidenceLevel, highRiskProb) {
  const pct = (highRiskProb * 100).toFixed(1);
  if (confidenceLevel === "high") {
    return `Model memiliki kepercayaan tinggi terhadap prediksi ini, dengan probabilitas risiko tinggi sebesar ${pct}%.`;
  }
  if (confidenceLevel === "medium") {
    return `Kepercayaan model bersifat sedang — probabilitas risiko tinggi tercatat ${pct}%, dan pertimbangan tambahan dari analis sangat disarankan.`;
  }
  return `Kepercayaan model rendah (probabilitas risiko tinggi ${pct}%), sehingga hasil ini tidak cukup kuat untuk menjadi dasar keputusan tanpa review manual.`;
}

function describeEligibility(eligibilityStatus) {
  switch (eligibilityStatus) {
    case "Sangat Layak":
      return "Berdasarkan skor kelayakan, pemohon berada pada posisi sangat layak dan direkomendasikan untuk diproses ke tahap selanjutnya.";
    case "Layak":
      return "Berdasarkan skor kelayakan, pemohon tergolong layak dan dapat dipertimbangkan untuk persetujuan pinjaman.";
    case "Dipertimbangkan":
      return "Berdasarkan skor kelayakan, pemohon berada pada zona abu-abu — diperlukan pertimbangan lebih lanjut sebelum keputusan diambil.";
    case "Berisiko":
      return "Berdasarkan skor kelayakan, pemohon tergolong berisiko dan penolakan atau penundaan perlu dipertimbangkan.";
    case "Tidak Layak":
      return "Berdasarkan skor kelayakan, pemohon tidak memenuhi ambang kelayakan dan tidak direkomendasikan untuk disetujui.";
    default:
      return "";
  }
}

function describeRisk(riskCategory) {
  const id = RISK_ID[riskCategory] || riskCategory;
  if (id === "rendah") {
    return "Prediksi risiko kredit pemohon tergolong rendah, yang menunjukkan kemampuan dan kebiasaan finansial yang sehat.";
  }
  if (id === "sedang") {
    return "Prediksi risiko kredit pemohon tergolong sedang — terdapat beberapa indikator yang memerlukan perhatian analis.";
  }
  return "Prediksi risiko kredit pemohon tergolong tinggi, yang mengindikasikan potensi masalah dalam kemampuan bayar atau riwayat kredit.";
}

function describeFactors(reasonSummary) {
  if (!reasonSummary || reasonSummary.includes("tidak memiliki indikator")) {
    return "Tidak ditemukan indikator dominan yang secara signifikan mempengaruhi hasil analisis.";
  }
  return reasonSummary.replace(
    "Pemohon memiliki faktor utama:",
    "Faktor-faktor yang paling mempengaruhi keputusan ini meliputi:"
  );
}

export function buildAnalysisNarrative(result, reasonSummary) {
  const parts = [
    describeEligibility(result.eligibility_status),
    describeRisk(result.predicted_risk_category),
    describeConfidence(result.confidence_level, result.high_risk_probability),
    describeFactors(reasonSummary),
  ];

  return parts.join(" ");
}
