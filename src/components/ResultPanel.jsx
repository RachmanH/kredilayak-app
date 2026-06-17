import { RISK_LABEL_ID } from "../ml/mappings";
import { exportToPdf } from "../utils/exportPdf";

function pct(val) {
  return (val * 100).toFixed(1) + "%";
}

function scoreColor(score) {
  if (score >= 0.5054) return "status--excellent";
  if (score >= 0.4602) return "status--good";
  if (score >= 0.4176) return "status--moderate";
  if (score >= 0.3319) return "status--risky";
  return "status--bad";
}

function riskColor(risk) {
  if (risk === "Low Risk") return "risk--low";
  if (risk === "Medium Risk") return "risk--medium";
  return "risk--high";
}

export default function ResultPanel({ result, reasonSummary, identity, formData }) {
  if (!result) return null;

  function handleExport() {
    exportToPdf(identity, formData, result, reasonSummary);
  }

  return (
    <div className="result-panel">
      <h2 className="result-panel__title">Hasil Analisis Pemohon</h2>

      {identity && (
        <div className="result-panel__identity">
          <div className="identity-card">
            <span className="identity-card__label">Nama</span>
            <span className="identity-card__value">{identity.applicant_name}</span>
          </div>
          <div className="identity-card">
            <span className="identity-card__label">Umur</span>
            <span className="identity-card__value">{identity.applicant_age} tahun</span>
          </div>
          <div className="identity-card">
            <span className="identity-card__label">Jenis Kelamin</span>
            <span className="identity-card__value">{identity.applicant_gender}</span>
          </div>
        </div>
      )}

      <div className="result-panel__grid">
        <div className={`result-card ${riskColor(result.predicted_risk_category)}`}>
          <span className="result-card__label">Risiko Kredit</span>
          <span className="result-card__value">
            {RISK_LABEL_ID[result.predicted_risk_category] || result.predicted_risk_category}
          </span>
        </div>

        <div className="result-card">
          <span className="result-card__label">Probabilitas Risiko Rendah</span>
          <span className="result-card__value">{pct(result.low_risk_probability)}</span>
        </div>

        <div className="result-card">
          <span className="result-card__label">Probabilitas Risiko Sedang</span>
          <span className="result-card__value">{pct(result.medium_risk_probability)}</span>
        </div>

        <div className="result-card">
          <span className="result-card__label">Probabilitas Risiko Tinggi</span>
          <span className="result-card__value">{pct(result.high_risk_probability)}</span>
        </div>

        <div className={`result-card ${scoreColor(result.topsis_score)}`}>
          <span className="result-card__label">Skor Kelayakan TOPSIS</span>
          <span className="result-card__value">{result.topsis_score.toFixed(4)}</span>
        </div>

        <div className={`result-card ${scoreColor(result.topsis_score)}`}>
          <span className="result-card__label">Status Rekomendasi</span>
          <span className="result-card__value">{result.eligibility_status}</span>
        </div>

        <div className="result-card">
          <span className="result-card__label">Ranking Benchmark</span>
          <span className="result-card__value">
            #{result.ranking} dari {result.total_benchmark}
          </span>
        </div>
      </div>

      <div className="result-panel__reasons">
        <h3 className="result-panel__subtitle">Ringkasan Faktor</h3>
        <p className="result-panel__reason-text">{reasonSummary}</p>
      </div>

      <div className="result-panel__disclaimer">
        <strong>Disclaimer:</strong> Hasil ini adalah rekomendasi pendukung keputusan analis kredit,
        bukan persetujuan pinjaman otomatis. Validasi bisnis akhir tetap harus dilakukan oleh analis kredit.
      </div>

      <div className="result-panel__actions">
        <button type="button" className="btn btn--export" onClick={handleExport}>
          Ekspor ke PDF
        </button>
      </div>
    </div>
  );
}
