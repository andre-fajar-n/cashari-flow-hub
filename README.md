# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/14b842f8-4f57-4fe7-8597-6753ba865be7

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/14b842f8-4f57-4fe7-8597-6753ba865be7) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/14b842f8-4f57-4fe7-8597-6753ba865be7) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Structure Menu

## Dashboard
## Pengaturan
## Riwayat Transaksi
## Budget
## Proyek Bisnis
## Hutang/Piutang
## Target
## Instrumen
## Aset
## Laporan & Analitik
### Ringkasan
Tujuan: memberikan snapshot performa keuangan dari berbagai aspek.
Isi / Komponen:
- 📊 Grafik tren total kekayaan dari waktu ke waktu (line chart)

### Analisis Arus Kas
Tujuan: memberikan gambaran jelas mengenai pergerakan uang masuk dan keluar.
Isi / Komponen:
- 📊 Grafik tren arus kas masuk vs keluar (line chart)
- 💰 Distribusi arus kas per kategori (pie chart)
- 💸 Arus kas masuk vs keluar (bar chart per bulan)
- 📆 Perbandingan bulan ini vs bulan lalu
- Rata - rata pengeluaran per hari/minggu/bulan
- 🔎 Insight otomatis (misal: “pengeluaran meningkat 12% bulan ini”)

### Analisis Investasi
Tujuan: memberikan gambaran mengenai performa investasi.
Isi / Komponen:
- 📊 Grafik tren nilai investasi dari waktu ke waktu (line chart)
- 💰 Distribusi investasi per instrumen, per aset (pie chart)
- ROI (Return on Investment) total, per instrumen, per aset
- Persentase Realisasi dan Unrealisasi total, per instrumen, per aset

### Analisis Hutang/Piutang
Tujuan: memberikan gambaran mengenai performa hutang dan piutang.
Isi / Komponen:
- 📊 Total hutang vs piutang
- 💰 Rasio hutang terhadap aset
- 💸 Grafik timeline pelunasan
- 📆 Reminder atau aging hutang (mana yang mendekati jatuh tempo)

### Insight & Rekomendasi
Tujuan: memberikan insight dan rekomendasi mengenai performa keuangan.
Jika mau tambah fitur semi-AI/logic-based suggestion, bisa diimplementasikan di sini.
Isi / Komponen:
- “Pengeluaran kamu bulan ini lebih besar 15% dibanding rata-rata.”
- “Investasi kamu di emas naik signifikan 8% bulan ini.”
- “Kamu sudah mencapai 90% dari target tabungan tahun ini.”
