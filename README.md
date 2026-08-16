# 📦 Sistem Informasi Persediaan & Peramalan Bahan Baku UMKM Gowa

Aplikasi manajemen persediaan (*inventory*) dan peramalan (*forecasting*) kebutuhan bahan baku berbasis web untuk UMKM Toko Kue di Kabupaten Gowa. Sistem ini dibangun dengan arsitektur **Full-Stack JavaScript** terpisah (*decoupled backend & frontend*).

---

## 🛠️ Teknologi yang Digunakan

### **Backend**
* **Node.js** & **Express.js** — RESTful API Framework
* **Prisma ORM** — Database ORM & Migrasi
* **MySQL** — Database Relasional
* **JWT (JSON Web Token)** & **Bcrypt.js** — Otentikasi & Keamanan Pasword

### **Frontend**
* **React.js (Vite)** — Library UI modern & super cepat
* **Tailwind CSS** — Framework Styling Utility-First
* **Lucide React & React Icons** — Ikonografi
* **Recharts** — Grafik & Visualisasi Data
* **SweetAlert2** — Notifikasi & Popup Interaktif
* **jsPDF & XLSX** — Ekspor Laporan ke PDF & Excel

---

## 📋 Prasyarat Sistem (*Prerequisites*)

Sebelum memulai instalasi, pastikan laptop Anda sudah terpasang perangkat lunak berikut:

1. **Node.js** (Versi 18.x atau yang lebih baru) & **npm**  
   👉 [Unduh Node.js di sini](https://nodejs.org/) *(Pilih versi LTS)*
2. **Database MySQL** (Bisa melalui **XAMPP**, **Laragon**, atau **MySQL Community Server**)  
   👉 [Unduh XAMPP](https://www.apachefriends.org/) atau [Unduh Laragon](https://laragon.org/)
3. **Git** *(Opsional, untuk clone repository)*  
   👉 [Unduh Git](https://git-scm.com/)
4. **Web Browser Modern** (Google Chrome, Microsoft Edge, atau Mozilla Firefox)

---

## 🚀 Panduan Instalasi Langkah demi Langkah (*Step-by-Step*)

Ikuti langkah-langkah mudah di bawah ini untuk menjalankan aplikasi secara lokal di laptop Anda:

### **Langkah 1: Download / Clone Repository**

Buka **Command Prompt (CMD)**, **PowerShell**, atau **Git Bash**, lalu jalankan perintah:

```bash
git clone https://github.com/AsrulHidayat/inventory_app.git
cd inventory_app
```

> 💡 *Jika mengunduh file berupa `.zip`, ekstrak folder project tersebut lalu buka terminal di dalam folder `inventory_app`.*

---

### **Langkah 2: Persiapan Database MySQL**

1. Jalankan aplikasi **XAMPP** atau **Laragon** di laptop Anda.
2. Aktifkan service **MySQL** (klik tombol **Start** pada MySQL).
3. Buka browser Anda dan masuk ke **phpMyAdmin**:  
   `http://localhost/phpmyadmin`
4. Buat database baru dengan nama:
   ```text
   inventory_gowa
   ```
   *(Pilih collation default: `utf8mb4_unicode_ci` atau `utf8mb4_general_ci`)*.

---

### **Langkah 3: Konfigurasi & Menjalankan Backend**

1. Buka terminal baru, lalu masuk ke folder `backend`:
   ```bash
   cd backend
   ```

2. **Install semua dependensi backend:**
   ```bash
   npm install
   ```

3. **Buat file Konfigurasi Environment (`.env`):**
   Salin file `.env.example` menjadi `.env`.
   
   *Di Windows (PowerShell):*
   ```powershell
   copy .env.example .env
   ```
   *Di Command Prompt (CMD):*
   ```cmd
   copy .env.example .env
   ```
   *Di Linux/Mac:*
   ```bash
   cp .env.example .env
   ```

4. **Sesuaikan isi file `.env` (jika diperlukan):**
   Buka file `.env` dengan editor teks (seperti VS Code atau Notepad). Pastikan `DATABASE_URL` sesuai dengan pengaturan MySQL laptop Anda:
   ```env
   PORT=5000
   JWT_SECRET=super_secret_jwt_key_umkm_gowa_2026

   # Format: mysql://username:password@localhost:3306/nama_database
   # Jika XAMPP default tanpa password:
   DATABASE_URL="mysql://root:@localhost:3306/inventory_gowa"

   # Jika MySQL Anda menggunakan password (contoh password: root):
   # DATABASE_URL="mysql://root:root@localhost:3306/inventory_gowa"
   ```

5. **Jalankan Migrasi Database & Seeder (Data Awal):**
   Jalankan perintah Prisma berikut untuk membuat struktur tabel dan mengisi data awal (dummy data UMKM, User, Bahan Baku, dan Supplier):
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

6. **Jalankan Server Backend:**
   ```bash
   npm run dev
   ```
   Jika berhasil, terminal akan menampilkan pesan:
   `🚀 Server running on port 5000`

---

### **Langkah 4: Konfigurasi & Menjalankan Frontend**

1. Buka **terminal/tab baru** di komputer Anda (biarkan terminal backend tetap berjalan).
2. Masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```

3. **Install semua dependensi frontend:**
   ```bash
   npm install
   ```

4. **Jalankan Frontend Dev Server:**
   ```bash
   npm run dev
   ```
   Jika berhasil, terminal akan menampilkan URL akses:
   `Local: http://localhost:5173/`

---

### **Langkah 5: Akses Aplikasi & Akun Login**

Buka browser Anda dan akses alamat berikut:
👉 **[http://localhost:5173](http://localhost:5173)**

Gunakan salah satu akun bawaan dari *Database Seeder* di bawah ini untuk mencoba sistem:

| Peran (Role) | Email | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin Utama** | `admin@gowa.com` | `admin123` | Akses penuh seluruh UMKM, User & Master Data |
| **Pemilik UMKM** | `hr@tokokue.com` | `user123` | Toko Kue HR |
| **Pemilik UMKM** | `helda@cireng.com` | `user123` | Cireng Helda |
| **Pemilik UMKM** | `nanda@risol.com` | `user123` | Risol Mayo Nanda |

---

## 📂 Struktur Folder Proyek

```text
inventory_app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Skema Tabel Database Prisma
│   │   └── seed.js         # Data Awal Seeder Database
│   ├── src/
│   │   ├── controllers/    # Logika Bisnis & Handlers API
│   │   ├── middleware/     # Auth & Validation Middleware
│   │   ├── routes/         # Routing API Endpoints
│   │   └── server.js       # Entry Point Express Server
│   ├── .env.example        # Contoh Konfigurasi Environment
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Komponen UI Reusable (Navbar, Sidebar, Modal, dll)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Halaman Aplikasi (Dashboard, Materials, Stock, dll)
│   │   ├── services/       # Integrasi Axios API
│   │   └── App.jsx         # Router & Main Component
│   ├── index.html
│   ├── tailwind.config.js  # Konfigurasi Tailwind CSS
│   └── package.json
└── README.md
```

---

## ❓ Kendala & Solusi (*Troubleshooting*)

### 1. **Error: `P1001: Can't reach database server`**
* **Penyebab:** Service MySQL belum dinyalakan atau port/password MySQL tidak cocok.
* **Solusi:** 
  1. Pastikan tombol **Start** pada MySQL di XAMPP / Laragon sudah berwarna hijau.
  2. Periksa kembali file `backend/.env`, pastikan username, password, port (3306), dan nama database (`inventory_gowa`) sudah benar.

### 2. **Port 5000 / 5173 Sudah Terpakai (*Address already in use*)**
* **Solusi:** Hentikan aplikasi lain yang menggunakan port tersebut, atau ubah `PORT=5000` di `backend/.env` dan sesuaikan URL API di frontend.

### 3. **Error Prisma Client Not Found**
* **Solusi:** Jalankan kembali perintah berikut di folder `backend`:
  ```bash
  npm run prisma:generate
  ```

---

## 📝 Lisensi & Hak Cipta

Pengembangan Sistem Informasi Persediaan & Peramalan Bahan Baku UMKM Toko Kue Gowa. All rights reserved.
