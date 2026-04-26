# Playto Pay - KYC Onboarding Module

A high-integrity KYC (Know Your Customer) compliance pipeline. This project demonstrates a decoupled full-stack architecture, featuring a secure merchant onboarding flow, automated document validation logic, and a reviewer dashboard with dynamic SLA tracking.

## 🏗️ Architecture

- **Frontend:** React + Vite (Deployed on **Vercel**)
- **Backend:** Django + Django REST Framework (Deployed on **Render**)
- **Database:** SQLite (Relational state-tracking)

## 🚀 Key Features

- **State Machine Logic:** Backend-enforced status transitions to prevent data corruption.
- **Decoupled Deployment:** Optimized performance by hosting the UI and API on dedicated platforms.
- **Responsive Design:** Fully mobile-friendly interface built with Tailwind CSS.

## 🛠️ Local Development

1. **Backend:**
   - `cd backend`
   - `pip install -r requirements.txt`
   - `python manage.py migrate`
   - `python manage.py runserver`
2. **Frontend:**
   - `cd frontend`
   - `npm install`
   - `npm run dev`

## 📖 Technical Decisions

For a deep dive into the engineering choices, AI audit findings, and architecture, see the [EXPLAINER.md](./EXPLAINER.md).
