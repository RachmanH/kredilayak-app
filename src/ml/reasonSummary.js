export function buildReasonSummary(data) {
  const reasons = [];

  if (data.credit_score < 600) {
    reasons.push("skor kredit rendah");
  } else if (data.credit_score >= 700) {
    reasons.push("skor kredit baik");
  }

  if (data.average_obligation_to_income_ratio > 50) {
    reasons.push("rasio kewajiban terhadap pendapatan tinggi");
  } else if (data.average_obligation_to_income_ratio <= 30) {
    reasons.push("rasio kewajiban terhadap pendapatan rendah");
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
