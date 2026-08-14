# 🌱 Gramodaya Youth Manch — Rasoolpur (ग्रामोदय यूथ मंच, रसूलपुर)

A modern, civic-tech digital community and governance platform for **Village Rasoolpur (रसूलपुर), Gram Panchayat Bahera (बहेरा)** built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Key Modules & Capabilities

- **📢 Grievance Redressal (Problems Portal):** Citizen complaint reporting with photo/video proof, categories, and real-time status tracking (`NEW` ➔ `IN PROGRESS` ➔ `RESOLVED`).
- **🪪 Official Member Directory & Digital ID Cards:** Official village member directory with print-ready Digital ID Card generator including QR code verification.
- **💬 Live Community Manch & Direct Messaging:** Real-time discussion forum for verified village members and leaders.
- **🤝 Social Work & Village Initiatives:** Moderated showcase of village welfare, plantation, and cleanliness projects.
- **👴 Elders Honor Board (बुजुर्ग सम्मान):** Registry and welfare support portal honoring village seniors.
- **📅 Notice Board, Events & Media Gallery:** Official panchayat announcements, upcoming meetings, and community photo archives.
- **🛡️ Admin Control Center:** Multi-admin security with OTP/password authentication, database backup/import/export/reset, audit logging, and third-party API integration controls.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4, Custom Civic Design Tokens
- **Icons & Motion:** Lucide React, Motion
- **Persistence:** Local JSON datastore (`data_store.json`) with optional Supabase PostgreSQL sync
- **Authentication:** Multi-admin OTP / Password auth & Member session management

---

## 💻 Getting Started Locally

1. **Install Dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Run the Development Server:**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

3. **Open the Application:**
   Visit [http://localhost:3000](http://localhost:3000) (or the active port assigned in the terminal).

4. **Production Build:**
   ```bash
   bun run build
   bun run start
   ```
