import { useState } from "react";
import ApplicantForm from "../components/ApplicantForm";
import ResultPanel from "../components/ResultPanel";
import { validateApplicant, validateIdentity } from "../ml/validation";
import { predictApplicant } from "../ml/predictApplicant";
import { buildReasonSummary } from "../ml/reasonSummary";
import "../styles/app.css";

function App() {
  const [result, setResult] = useState(null);
  const [reasonSummary, setReasonSummary] = useState("");
  const [identity, setIdentity] = useState(null);
  const [rawFormData, setRawFormData] = useState(null);

  function handleSubmit(formData, identityData, setErrors) {
    const idValidation = validateIdentity(identityData);
    const mlValidation = validateApplicant(formData);

    const allErrors = { ...idValidation.errors, ...mlValidation.errors };
    if (!idValidation.valid || !mlValidation.valid) {
      setErrors(allErrors);
      setResult(null);
      setReasonSummary("");
      return;
    }

    const prediction = predictApplicant(formData);
    const summary = buildReasonSummary(formData);

    setIdentity(identityData);
    setRawFormData(formData);
    setResult(prediction);
    setReasonSummary(summary);
  }

  function handleReset() {
    setResult(null);
    setReasonSummary("");
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

      <main className="app-main">
        <ApplicantForm onSubmit={handleSubmit} onReset={handleReset} />
        <ResultPanel result={result} reasonSummary={reasonSummary} identity={identity} formData={rawFormData} />
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
