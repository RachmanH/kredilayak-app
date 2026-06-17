import jsPDF from "jspdf";
import {
  INCOME_STABILITY_OPTIONS,
  EMPLOYER_CATEGORY_OPTIONS,
  RISK_LABEL_ID,
} from "../ml/mappings";

const CURRENCY_FIELDS = new Set([
  "average_eligible_emi",
  "average_usable_salary",
  "average_monthly_credit",
  "average_month_end_balance",
]);

const FIELD_LABELS = {
  income_stability: "Stabilitas pendapatan",
  average_eligible_emi: "Kemampuan bayar cicilan/bulan",
  average_usable_salary: "Rata-rata gaji bersih/bulan",
  average_monthly_credit: "Total pemasukan bulanan",
  employer_category: "Jenis tempat bekerja",
  employment_tenure_years: "Lama bekerja (tahun)",
  average_month_end_balance: "Rata-rata saldo akhir bulan",
  bounce_count: "Transaksi ditolak (saldo tidak cukup)",
  gambling_transaction_count: "Transaksi judi online/spekulasi",
  active_loans_count: "Jumlah pinjaman aktif",
  has_credit_card: "Memiliki kartu kredit",
  has_personal_loan: "Memiliki pinjaman pribadi",
  has_home_loan: "Memiliki pinjaman rumah/KPR",
  credit_exposure_intensity: "Tingkat beban kredit",
  average_obligation_to_income_ratio: "Rasio cicilan/pendapatan",
  credit_score: "Skor kredit",
};

const SECTIONS = [
  {
    title: "Data Pekerjaan dan Pendapatan",
    fields: [
      "income_stability",
      "average_eligible_emi",
      "average_usable_salary",
      "average_monthly_credit",
      "employer_category",
      "employment_tenure_years",
    ],
  },
  {
    title: "Kondisi Rekening",
    fields: ["average_month_end_balance", "bounce_count", "gambling_transaction_count"],
  },
  {
    title: "Kondisi Kredit Saat Ini",
    fields: [
      "active_loans_count",
      "has_credit_card",
      "has_personal_loan",
      "has_home_loan",
      "credit_exposure_intensity",
      "average_obligation_to_income_ratio",
      "credit_score",
    ],
  },
];

function formatValue(key, value) {
  if (value === "" || value === null || value === undefined) return "-";

  if (CURRENCY_FIELDS.has(key)) {
    return "Rp " + new Intl.NumberFormat("id-ID").format(value * 100);
  }

  if (key === "income_stability") {
    const opt = INCOME_STABILITY_OPTIONS.find((o) => o.value === value);
    return opt ? opt.label : value;
  }

  if (key === "employer_category") {
    const opt = EMPLOYER_CATEGORY_OPTIONS.find((o) => o.value === value);
    return opt ? opt.label : value;
  }

  if (key === "has_credit_card" || key === "has_personal_loan" || key === "has_home_loan") {
    return value === 1 ? "Ya" : "Tidak";
  }

  if (key === "average_obligation_to_income_ratio") {
    return value + "%";
  }

  if (key === "employment_tenure_years") {
    return value + " tahun";
  }

  return String(value);
}

function drawSectionTitle(doc, title, y) {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 107, 53);
  doc.text(title, 15, y);
  doc.setDrawColor(255, 107, 53);
  doc.line(15, y + 1.5, 195, y + 1.5);
  return y + 8;
}

function drawRow(doc, label, value, y, stripe) {
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  if (stripe) {
    doc.setFillColor(250, 249, 239);
    doc.rect(15, y - 4.5, 180, 7, "F");
  }
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(85, 85, 85);
  doc.text(label, 18, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  doc.text(value, 120, y);
  return y + 7;
}

export function exportToPdf(identity, formData, result, reasonSummary) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;

  doc.setFillColor(255, 107, 53);
  doc.rect(0, 0, pageWidth, 30, "F");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Laporan Analisis Kelayakan Pinjaman", 15, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text("Tanggal analisis: " + dateStr + " | " + timeStr, 15, 23);

  let y = 42;

  y = drawSectionTitle(doc, "Identitas Pemohon", y);
  y = drawRow(doc, "Nama Lengkap", identity.applicant_name, y, false);
  y = drawRow(doc, "Umur", identity.applicant_age + " tahun", y, true);
  y = drawRow(doc, "Jenis Kelamin", identity.applicant_gender, y, false);
  y += 4;

  for (const section of SECTIONS) {
    y = drawSectionTitle(doc, section.title, y);
    section.fields.forEach((field, i) => {
      const label = FIELD_LABELS[field] || field;
      const value = formatValue(field, formData[field]);
      y = drawRow(doc, label, value, y, i % 2 === 1);
    });
    y += 4;
  }

  y = drawSectionTitle(doc, "Hasil Prediksi Risiko Kredit (MLP)", y);
  const riskLabel = RISK_LABEL_ID[result.predicted_risk_category] || result.predicted_risk_category;
  y = drawRow(doc, "Kategori Risiko", riskLabel, y, false);
  y = drawRow(doc, "Probabilitas Risiko Rendah", (result.low_risk_probability * 100).toFixed(1) + "%", y, true);
  y = drawRow(doc, "Probabilitas Risiko Sedang", (result.medium_risk_probability * 100).toFixed(1) + "%", y, false);
  y = drawRow(doc, "Probabilitas Risiko Tinggi", (result.high_risk_probability * 100).toFixed(1) + "%", y, true);
  y += 4;

  y = drawSectionTitle(doc, "Skor Kelayakan TOPSIS", y);
  y = drawRow(doc, "Skor TOPSIS", result.topsis_score.toFixed(4), y, false);
  y = drawRow(doc, "Ranking", "#" + result.ranking + " dari " + result.total_benchmark, y, true);
  y = drawRow(doc, "Status Rekomendasi", result.eligibility_status, y, false);
  y += 4;

  y = drawSectionTitle(doc, "Ringkasan Faktor", y);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 26, 26);
  const reasonLines = doc.splitTextToSize(reasonSummary, 174);
  if (y + reasonLines.length * 5 > 270) {
    doc.addPage();
    y = 20;
  }
  doc.text(reasonLines, 18, y);
  y += reasonLines.length * 5 + 6;

  if (y > 255) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(255, 248, 243);
  doc.rect(15, y - 4, 180, 18, "F");
  doc.setDrawColor(255, 107, 53);
  doc.setLineWidth(0.5);
  doc.line(15, y - 4, 15, y + 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(85, 85, 85);
  doc.text("Disclaimer:", 18, y);
  doc.setFont("helvetica", "normal");
  const disclaimer =
    "Hasil ini adalah rekomendasi pendukung keputusan analis kredit, bukan persetujuan pinjaman otomatis. Validasi bisnis akhir tetap harus dilakukan oleh analis kredit.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, 170);
  doc.text(disclaimerLines, 18, y + 5);

  const fileName = "Analisis_" + identity.applicant_name.replace(/\s+/g, "_") + ".pdf";
  doc.save(fileName);
}
