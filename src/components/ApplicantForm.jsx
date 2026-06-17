import { useState } from "react";
import FieldGroup from "./FieldGroup";
import {
  INCOME_STABILITY_OPTIONS,
  EMPLOYER_CATEGORY_OPTIONS,
  CREDIT_EXPOSURE_OPTIONS,
  YES_NO_OPTIONS,
} from "../ml/mappings";

const INITIAL = {
  income_stability: "",
  average_eligible_emi: "",
  average_usable_salary: "",
  average_monthly_credit: "",
  employer_category: "",
  employment_tenure_years: "",
  average_month_end_balance: "",
  bounce_count: "",
  gambling_transaction_count: "",
  active_loans_count: "",
  has_credit_card: "",
  has_personal_loan: "",
  has_home_loan: "",
  credit_exposure_intensity: "",
  average_obligation_to_income_ratio: "",
  credit_score: "",
};

function formatCurrency(value) {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

function parseCurrency(str) {
  return str.replace(/\D/g, "");
}

export default function ApplicantForm({ onSubmit, onReset }) {
  const [data, setData] = useState({ ...INITIAL });
  const [errors, setErrors] = useState({});

  const currencyFields = new Set([
    "average_eligible_emi",
    "average_usable_salary",
    "average_monthly_credit",
    "average_month_end_balance",
  ]);

  function handleChange(field, rawValue) {
    let value = rawValue;
    if (currencyFields.has(field)) {
      value = parseCurrency(rawValue);
    }
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = {};
    for (const [key, val] of Object.entries(data)) {
      if (key === "income_stability" || key === "employer_category") {
        parsed[key] = val;
      } else if (key === "has_credit_card" || key === "has_personal_loan" || key === "has_home_loan" || key === "credit_exposure_intensity") {
        parsed[key] = val === "" ? "" : Number(val);
      } else {
        parsed[key] = val === "" ? "" : Number(val);
      }
    }
    onSubmit(parsed, setErrors);
  }

  function handleReset() {
    setData({ ...INITIAL });
    setErrors({});
    if (onReset) onReset();
  }

  function renderInput(field, label, type, opts) {
    const hasError = errors[field];
    const isDropdown = opts && opts.type === "dropdown";
    const isCurrency = currencyFields.has(field);
    const isPercent = opts && opts.type === "percent";

    return (
      <div className={`form-field ${hasError ? "form-field--error" : ""}`}>
        <label htmlFor={field} className="form-field__label">
          {label}
        </label>
        {isDropdown ? (
          <select
            id={field}
            className="form-field__input"
            value={data[field]}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            <option value="">-- Pilih --</option>
            {opts.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="form-field__input-wrapper">
            {isCurrency && <span className="form-field__prefix">Rp</span>}
            <input
              id={field}
              type="text"
              inputMode={isCurrency ? "numeric" : "decimal"}
              className="form-field__input"
              value={
                isCurrency
                  ? data[field]
                    ? formatCurrency(data[field])
                    : ""
                  : data[field]
              }
              onChange={(e) => handleChange(field, e.target.value)}
              placeholder={opts?.placeholder || ""}
            />
            {isPercent && <span className="form-field__suffix">%</span>}
          </div>
        )}
        {hasError && <span className="form-field__error">{hasError}</span>}
        {opts?.hint && <span className="form-field__hint">{opts.hint}</span>}
      </div>
    );
  }

  return (
    <form className="applicant-form" onSubmit={handleSubmit} noValidate>
      <FieldGroup title="Data Pekerjaan dan Pendapatan">
        {renderInput("income_stability", "Stabilitas pendapatan", "text", {
          type: "dropdown",
          options: INCOME_STABILITY_OPTIONS,
          hint: "Apakah penghasilan pemohon stabil tiap bulan, naik-turun, atau tidak menentu",
        })}
        {renderInput("average_eligible_emi", "Sisa kemampuan bayar cicilan per bulan", "text", {
          placeholder: "2.000.000",
          hint: "Dana tersisa per bulan setelah dikurangi kebutuhan hidup",
        })}
        {renderInput("average_usable_salary", "Rata-rata gaji bersih per bulan", "text", {
          placeholder: "8.000.000",
          hint: "Gaji setelah potongan pajak dan BPJS",
        })}
        {renderInput("average_monthly_credit", "Total pemasukan bulanan yang masuk rekening", "text", {
          placeholder: "10.000.000",
          hint: "Semua uang masuk ke rekening: gaji, bonus, transfer, dll",
        })}
        {renderInput("employer_category", "Jenis tempat bekerja", "text", {
          type: "dropdown",
          options: EMPLOYER_CATEGORY_OPTIONS,
          hint: "Berdasarkan jenis perusahaan tempat pemohon bekerja saat ini",
        })}
        {renderInput("employment_tenure_years", "Lama bekerja (tahun)", "text", {
          placeholder: "4",
          hint: "Di tempat sekarang, boleh desimal (contoh: 2.5 = 2 tahun 6 bulan)",
        })}
      </FieldGroup>

      <FieldGroup title="Kondisi Rekening">
        {renderInput("average_month_end_balance", "Rata-rata saldo akhir bulan", "text", {
          placeholder: "1.500.000",
          hint: "Rata-rata saldo di akhir bulan selama beberapa bulan terakhir",
        })}
        {renderInput("bounce_count", "Jumlah transaksi gagal/autodebet gagal", "text", {
          placeholder: "0",
          hint: "Transaksi ditolak karena saldo tidak cukup",
        })}
        {renderInput("gambling_transaction_count", "Jumlah transaksi berisiko seperti gambling", "text", {
          placeholder: "0",
          hint: "Transaksi ke situs judi, taruhan, atau aktivitas spekulatif",
        })}
      </FieldGroup>

      <FieldGroup title="Kondisi Kredit Saat Ini">
        {renderInput("active_loans_count", "Jumlah pinjaman aktif saat ini", "text", {
          placeholder: "2",
          hint: "Hitung semua pinjaman berjalan: KPR, kredit kendaraan, KTA, pinjol",
        })}
        {renderInput("has_credit_card", "Memiliki kartu kredit", "text", {
          type: "dropdown",
          options: YES_NO_OPTIONS,
          hint: "Kartu kredit yang masih aktif, bukan yang sudah ditutup",
        })}
        {renderInput("has_personal_loan", "Memiliki pinjaman pribadi", "text", {
          type: "dropdown",
          options: YES_NO_OPTIONS,
          hint: "Kredit tanpa agunan (KTA) atau pinjaman online pribadi",
        })}
        {renderInput("has_home_loan", "Memiliki pinjaman rumah/KPR", "text", {
          type: "dropdown",
          options: YES_NO_OPTIONS,
        })}
        {renderInput("credit_exposure_intensity", "Tingkat beban kredit pemohon", "text", {
          type: "dropdown",
          options: CREDIT_EXPOSURE_OPTIONS,
          hint: "Perkiraan seberapa berat beban cicilan pemohon secara keseluruhan",
        })}
        {renderInput("average_obligation_to_income_ratio", "Rasio cicilan terhadap pendapatan", "text", {
          type: "percent",
          placeholder: "35",
          hint: "Total cicilan bulanan dibagi gaji bulanan, dikali 100",
        })}
        {renderInput("credit_score", "Skor kredit", "text", {
          placeholder: "681",
          hint: "Skor SLIK / BI Checking, rentang 300-900",
        })}
      </FieldGroup>

      <div className="applicant-form__actions">
        <button type="submit" className="btn btn--primary">
          Analisis Pemohon
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  );
}
