import { useState } from "react";
import ApplicantForm from "../components/ApplicantForm";
import ResultPanel from "../components/ResultPanel";
import { validateApplicant } from "../ml/validation";
import { predictApplicant } from "../ml/predictApplicant";
import { buildReasonSummary } from "../ml/reasonSummary";
import "../styles/app.css";

function App() {
  const [result, setResult] = useState(null);
  const [reasonSummary, setReasonSummary] = useState("");

  function handleSubmit(formData, setErrors) {
    const validation = validateApplicant(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      setResult(null);
      setReasonSummary("");
      return;
    }

    const prediction = predictApplicant(formData);
    const summary = buildReasonSummary(formData);

    setResult(prediction);
    setReasonSummary(summary);
  }

  function handleReset() {
    setResult(null);
    setReasonSummary("");
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

      <main className="app-main">
        <ApplicantForm onSubmit={handleSubmit} onReset={handleReset} />
        <ResultPanel result={result} reasonSummary={reasonSummary} />
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
