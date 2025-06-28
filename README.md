# 🃏 Kartu Bicara

**Kartu Bicara** adalah aplikasi permainan kartu percakapan interaktif untuk mempererat hubungan antar teman atau pasangan. Pemain saling menjawab pertanyaan dari kartu secara bergantian dalam sesi multiplayer real-time.

---

## 🚀 Teknologi yang Digunakan

* **Frontend**: [React + Vite](https://github.com/ikhsanheriyawan2404/kartu-bicara-ui)
* **Backend**: [Node.js + Express + Colyseus](https://github.com/ikhsanheriyawan2404/kartu-bicara-server)
* **Realtime Multiplayer**: WebSocket via Colyseus
* **Database**: PostgreSQL

---

## 🎮 Fitur Utama

* 🎲 **Permainan Kartu Percakapan**: Sesi permainan interaktif antar pemain.
* 🔄 **Rotasi Giliran Otomatis**: Pemain mendapat giliran secara bergantian.
* 📦 **Kategori Pertanyaan**: Tersedia kategori seperti *Teman* dan *Pasangan*.
* ✍️ **Tambah Pertanyaan Sendiri**: Pengguna dapat mengirimkan ide pertanyaan baru.
* 🖥️ **Antarmuka Sederhana dan Ringan**: Dirancang untuk performa maksimal dan UX menyenangkan.

---

## 🧑‍💻 Jalankan Secara Lokal

### 🔹 1. Clone Repository

```bash
git clone https://github.com/ikhsanheriyawan2404/kartu-bicara-server
cd kartu-bicara-server
```

### 🔹 2. Instalasi Dependensi

```bash
npm install
```

### 🔹 3. Jalankan Server

```bash
npm start
```

### 🔹 4. Jalankan Frontend

Clone repository frontend:

```bash
git clone https://github.com/ikhsanheriyawan2404/kartu-bicara-ui
cd kartu-bicara-ui
npm install
npm run dev
```

---

## 🐳 Jalankan dengan Docker Compose

Sebagai alternatif, kamu dapat menjalankan proyek ini menggunakan **Docker Compose**.

### 🔹 1. Siapkan Struktur Folder

Pastikan struktur project seperti berikut:

```
.
├── docker-compose.yml
├── kartu-bicara-ui/
│   ├── docker/
│   │   └── nginx.conf
│   └── (file frontend lainnya)
└── kartu-bicara-server/
    ├── Dockerfile
    ├── .env
    └── (file backend lainnya)
```

### 🔹 2. Contoh `docker-compose.yml`

```yaml
services:
  talk-ui:
    build:
      context: ./kartu-bicara-ui
      dockerfile: ./docker/Dockerfile
    container_name: kartu-bicara-ui
    restart: always
    volumes:
      - ./kartu-bicara-ui/docker/nginx.conf:/etc/nginx/conf.d/default.conf:ro,z
    ports:
      - "5173:80"
    depends_on:
      - talk-server
    networks:
      - talk-network

  talk-server:
    build:
      context: ./kartu-bicara-server
      dockerfile: Dockerfile
    container_name: kartu-bicara-server
    volumes:
      - ./kartu-bicara-server/.env:/app/.env:ro,z
    restart: always
    networks:
      - talk-network

networks:
  talk-network:
    driver: bridge
```

### 🔹 3. Jalankan dengan Compose

```bash
docker compose up --build -d
```

Frontend akan tersedia di `http://localhost:5173`.

### 🔹 4. Jangan Lupa .env
#### 📄 Contoh `.env` Backend (`kartu-bicara-server/.env`)

```env
# ================================
# 🌐 Aplikasi
NODE_ENV=production
PORT=2567

# ================================
# 🗄️ Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=kartu_bicara_db

# ================================
# 🔗 Redis
REDIS_HOST=localhost

# ================================
# 🤖 Large Language Model (LLM)
LLM_URL=https://api.openai.com/v1/chat/completions
LLM_API_KEY=your_openai_api_key
LLM_MODEL=gpt-4o
```

---

## 📄 Contoh `.env` Frontend (`kartu-bicara-ui/.env`)

```env
# ================================
# 🔗 API URL Backend
VITE_API_URL=http://localhost:5173/api
```

---

**Tips:**

* Ganti `localhost` jika dijalankan di server production.
* Pastikan `VITE_API_URL` mengarah ke domain atau IP publik backend jika di-deploy.

---

## 📌 Catatan

* Pertanyaan divalidasi otomatis oleh AI sebelum disimpan.
* Semua perubahan dilakukan melalui **Pull Request**.
* Kontribusi sangat terbuka – tambahkan ide pertanyaan, fitur, atau perbaikan bug.

---

## 📜 Lisensi

MIT – bebas digunakan, dimodifikasi, dan disebarluaskan.

---

## 🙌 Kontribusi

Kontribusi sangat kami apresiasi!
Silakan **fork** dan kirim **Pull Request** ke repository frontend/backend sesuai perubahanmu.

---
