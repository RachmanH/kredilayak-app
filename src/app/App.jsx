import { useState, useEffect } from "react";
import ApplicantForm from "../components/ApplicantForm";
import ResultPanel from "../components/ResultPanel";
import { validateApplicant, validateIdentity } from "../ml/validation";
import { predictApplicant } from "../ml/predictApplicant";
import { buildReasonSummary, buildAnalysisNarrative } from "../ml/reasonSummary";
import { loadModel } from "../ml/mlpTfjs";
import "../styles/app.css";

function App() {
  const [modelReady, setModelReady] = useState(false);
  const [result, setResult] = useState(null);
  const [reasonSummary, setReasonSummary] = useState("");
  const [analysisNarrative, setAnalysisNarrative] = useState("");
  const [identity, setIdentity] = useState(null);
  const [rawFormData, setRawFormData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadModel()
      .then(() => setModelReady(true))
      .catch((err) => console.error("Gagal memuat model:", err));
  }, []);

  async function handleSubmit(formData, identityData, setErrors) {
    const idValidation = validateIdentity(identityData);
    const mlValidation = validateApplicant(formData);

    const allErrors = { ...idValidation.errors, ...mlValidation.errors };
    if (!idValidation.valid || !mlValidation.valid) {
      setErrors(allErrors);
      setResult(null);
      setReasonSummary("");
      setAnalysisNarrative("");
      return;
    }

    setAnalyzing(true);
    try {
      const prediction = await predictApplicant(formData);
      const summary = buildReasonSummary(formData);
      const narrative = buildAnalysisNarrative(prediction, summary);

      setIdentity(identityData);
      setRawFormData(formData);
      setResult(prediction);
      setReasonSummary(summary);
      setAnalysisNarrative(narrative);
    } catch (err) {
      console.error("Gagal menganalisis:", err);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleReset() {
    setResult(null);
    setReasonSummary("");
    setAnalysisNarrative("");
    setIdentity(null);
    setRawFormData(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-header__title">SPK Kelayakan Pinjaman</h1>
        <p className="app-header__subtitle">
          Sistem Pendukung Keputusan kelayakan pinjaman berbasis prediksi risiko kredit MLP
          dan perhitungan skor kelayakan TOPSIS. Alat bantu analis kredit, bukan persetujuan otomatis.
        </p>
      </header>

      {!modelReady && (
        <div className="model-loading">
          Memuat model machine learning...
        </div>
      )}

      <main className="app-main">
        <ApplicantForm
          onSubmit={handleSubmit}
          onReset={handleReset}
          disabled={!modelReady || analyzing}
          analyzing={analyzing}
        />
        <ResultPanel result={result} reasonSummary={reasonSummary} analysisNarrative={analysisNarrative} identity={identity} formData={rawFormData} />
      </main>

      <footer className="app-footer">
        <p>
          Aplikasi ini bersifat offline dan tidak mengirim data ke server manapun.
          Hasil analisis digunakan sebagai rekomendasi pendukung keputusan analis kredit.
        </p>
      </footer>
    </div>
  );
}

export default App;
