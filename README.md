# KrediLayak

Sistem Pendukung Keputusan (SPK) kelayakan pinjaman berbasis prediksi risiko kredit MLP dan perhitungan skor kelayakan TOPSIS. Aplikasi ini dirancang sebagai alat bantu analis kredit, bukan alat persetujuan pinjaman otomatis.

![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-blue)
![React](https://img.shields.io/badge/react-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

## Fitur

- Input data pemohon dengan label bahasa bisnis yang mudah dipahami analis
- Validasi input otomatis sesuai aturan bisnis
- Prediksi risiko kredit menggunakan MLP Neural Network (4 layer)
- Perhitungan skor kelayakan menggunakan metode TOPSIS
- Ranking pemohon terhadap 10.000 data benchmark
- Ringkasan faktor risiko dalam bahasa natural
- Berjalan 100% offline, tidak mengirim data ke server manapun
- UI bertema Neo-Brutalisme, responsif untuk desktop, tablet, dan mobile
- Siap diekspor ke Android via Capacitor

## Arsitektur

```
Input Pemohon
    │
    ▼
Validasi Input
    │
    ▼
Mapping Label → Kolom Teknis
    │
    ▼
Preprocessing (StandardScaler + OneHotEncoding)
    │  16 fitur → 21 vektor
    ▼
MLP Inference (Dense 64 → 32 → 16 → 3, Softmax)
    │  Output: Low / Medium / High Risk
    ▼
TOPSIS (10 kriteria, benchmark 10.000 pemohon)
    │  Output: Skor 0-1 + Ranking
    ▼
Rekomendasi Kelayakan + Ringkasan Faktor
```

## Struktur Proyek

```
src/
  app/
    App.jsx                  # Komponen utama aplikasi
  components/
    ApplicantForm.jsx        # Form input data pemohon (16 field)
    ResultPanel.jsx          # Panel tampilan hasil analisis
    FieldGroup.jsx           # Wrapper fieldset per bagian
  data/
    creditModel.json         # Bobot MLP, scaler, encoder
    topsisConfig.json        # Kriteria dan bobot TOPSIS
    topsisBenchmark.json     # 10.000 data benchmark ranking
  ml/
    mappings.js              # Mapping label UI ↔ nilai backend
    validation.js            # Aturan validasi input
    preprocess.js            # Scaling + One-Hot Encoding (JS)
    mlp.js                   # Forward pass MLP manual
    topsis.js                # Perhitungan TOPSIS
    predictApplicant.js      # Orchestrator prediksi + TOPSIS
    reasonSummary.js         # Pembuat ringkasan faktor risiko
  styles/
    app.css                  # Tema Neo-Brutalisme
  main.jsx                   # Entry point React
scripts/
  exportModelArtifacts.py    # Konversi artefak Python → JSON (dev only)
```

## Prasyarat

- Node.js >= 18
- npm >= 9

## Instalasi

```bash
git clone https://github.com/RachmanH/kredilayak-app.git
cd kredilayak-app
npm install
```

## Penggunaan

### Development

```bash
npm run dev
```

Buka browser ke alamat yang ditampilkan terminal (biasanya `http://localhost:5173`).

### Build Production

```bash
npm run build
```

Output berada di folder `dist/`, siap di-deploy ke web server manapun.

### Preview Build

```bash
npm run preview
```

## Input Pemohon

Form dibagi menjadi 3 bagian:

### Data Pekerjaan dan Pendapatan

| Field | Tipe | Keterangan |
|---|---|---|
| Stabilitas pendapatan | Dropdown | Stabil / Naik-turun / Tidak stabil |
| Sisa kemampuan bayar cicilan | Angka (Rp) | Dana tersisa setelah kebutuhan hidup |
| Rata-rata gaji bersih | Angka (Rp) | Gaji setelah potongan pajak dan BPJS |
| Total pemasukan bulanan | Angka (Rp) | Semua uang masuk ke rekening |
| Jenis tempat bekerja | Dropdown | Kategori perusahaan |
| Lama bekerja | Angka (tahun) | Boleh desimal |

### Kondisi Rekening

| Field | Tipe | Keterangan |
|---|---|---|
| Rata-rata saldo akhir bulan | Angka (Rp) | Rata-rata beberapa bulan terakhir |
| Jumlah transaksi gagal | Angka bulat | Autodebet ditolak karena saldo kurang |
| Jumlah transaksi berisiko | Angka bulat | Transaksi gambling/spekulatif |

### Kondisi Kredit Saat Ini

| Field | Tipe | Keterangan |
|---|---|---|
| Jumlah pinjaman aktif | Angka bulat | Semua pinjaman berjalan |
| Memiliki kartu kredit | Ya/Tidak | Kartu kredit aktif |
| Memiliki pinjaman pribadi | Ya/Tidak | KTA atau pinjaman online |
| Memiliki pinjaman rumah/KPR | Ya/Tidak | - |
| Tingkat beban kredit | Dropdown (0-6) | Skala ringan sampai sangat berat |
| Rasio cicilan vs pendapatan | Persentase | Total cicilan / gaji x 100 |
| Skor kredit | Angka (300-900) | Skor SLIK / BI Checking |

## Output Aplikasi

| Output | Deskripsi |
|---|---|
| Risiko Kredit | Low Risk / Medium Risk / High Risk |
| Probabilitas per kelas | Persentase masing-masing kelas risiko |
| Skor Kelayakan TOPSIS | Angka 0-1 |
| Status Rekomendasi | Sangat Layak / Layak / Dipertimbangkan / Berisiko / Tidak Layak |
| Ranking Benchmark | Posisi di antara 10.000 pemohon |
| Ringkasan Faktor | Penjelasan natural faktor risiko utama |

### Threshold Skor Kelayakan

| Skor | Status |
|---|---|
| >= 0.80 | Sangat Layak |
| >= 0.60 | Layak |
| >= 0.40 | Dipertimbangkan |
| >= 0.20 | Berisiko |
| < 0.20 | Tidak Layak |

## Model ML

### MLP Neural Network

Arsitektur:

```
Input (21 fitur) → Dense 64 (ReLU) → Dense 32 (ReLU) → Dense 16 (ReLU) → Dense 3 (Softmax)
```

Output:
- Index 0: Low Risk
- Index 1: Medium Risk
- Index 2: High Risk

Preprocessing menghasilkan 21 fitur:
- 14 fitur numerik (StandardScaler)
- 3 one-hot encoding income_stability
- 4 one-hot encoding employer_category

### TOPSIS

10 kriteria dengan bobot normalisasi:

| Kriteria | Tipe | Bobot |
|---|---|---|
| credit_score | Benefit | 0.182 |
| average_usable_salary | Benefit | 0.136 |
| average_eligible_emi | Benefit | 0.091 |
| employment_tenure_years | Benefit | 0.091 |
| average_month_end_balance | Benefit | 0.091 |
| average_obligation_to_income_ratio | Cost | 0.136 |
| active_loans_count | Cost | 0.045 |
| credit_exposure_intensity | Cost | 0.045 |
| bounce_count | Cost | 0.045 |
| high_risk_probability | Cost | 0.136 |

## Export Android

```bash
# Build web
npm run build

# Tambah platform Android
npx cap add android

# Sync asset web ke Android
npx cap sync android

# Buka di Android Studio
npx cap open android

# Atau build APK langsung
cd android
export ANDROID_HOME=$HOME/Android/Sdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Artefak Model

Artefak model disimpan sebagai JSON static di `src/data/` dan di-compile langsung ke JavaScript bundle saat build. Tidak ada runtime Python di aplikasi.

| File | Isi |
|---|---|
| `creditModel.json` | Bobot MLP, parameter StandardScaler, kategori OneHotEncoder |
| `topsisConfig.json` | Kriteria, tipe (benefit/cost), dan bobot TOPSIS |
| `topsisBenchmark.json` | 10.000 data pembanding untuk ranking TOPSIS |

File `scripts/exportModelArtifacts.py` hanya digunakan saat development untuk mengkonversi artefak Python (keras, pkl, csv) menjadi JSON.

## Batasan Sistem

- Dataset tidak memiliki label gagal bayar aktual; target risiko dibuat rule-based
- Model mempelajari pola dari label rule-based, bukan prediksi default historis
- TOPSIS bersifat comparative ranking, skor pemohon bermakna relatif terhadap benchmark
- Hasil aplikasi adalah rekomendasi, bukan keputusan final persetujuan pinjaman
- Validasi bisnis akhir tetap harus dilakukan oleh analis kredit

## Teknologi

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite |
| Styling | CSS (Neo-Brutalisme) |
| ML Inference | JavaScript murni (manual forward pass) |
| TOPSIS | JavaScript murni |
| Android | Capacitor |
| Data Model | JSON static assets |

## Lisensi

MIT
