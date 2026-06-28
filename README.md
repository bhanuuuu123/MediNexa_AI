# MediNexa AI - Premium AI-Powered Healthcare Platform
MediNexa AI is a state-of-the-art, secure, and responsive full-stack healthcare ecosystem designed for modern patient journeys and intelligent clinical operations. The platform offers separate dashboards and authentication flows for Patients and Doctors, automated AI diagnosis suggestions, voice-enabled symptom checkers, real-time emergency dispatch trackers, and HIPAA-ready AES-256 encrypted health records.
---
## 🚀 Key Features
### 1. Separate Authentication & Role-Based Access Control (RBAC)
- **Patient Portal**: Individual registration and credentials checking. Access to appointments, medication logs, encrypted medical files, and SOS controls.
- **Doctor Portal**: Secure clinical workspace. Access to patient queues, assigned case directories, and automated EHR summarization tools.
- **Security**: JWT-based session security with httpOnly cookies and Zod input schemas to defend against injection and cross-site scripting (XSS).
### 2. AI Doctor Assistant (Landing Page)
- Publicly accessible, ChatGPT-style chat interface on the homepage.
- Diagnoses query strings (e.g., Fever, Headache, Cough, Cold, Fatigue) using a keyword-based symptom checker.
- Returns structured analysis: **Possible Conditions**, **Recommended Actions**, and **When to Contact a Doctor**.
- Supports browser speech-to-text input (Web Speech API) and suggestion pills for quick queries.
### 3. Emergency Module (SOS Dispatch)
- Instantly alerts local trauma dispatch and simulates an ambulance pickup.
- Tracks real-time ambulance ETA, vehicle ID, and dispatch status on a visual dashboard.
- Hosts an **Emergency Medical Profile** where patients can store blood group, drug allergies, chronic conditions, and notify emergency contacts.
- Automatically exposes a list of the closest trauma hospitals with direct call shortcuts.
### 4. Smart Clinical Conversation UI (Doctor Dashboard)
- Visual chat interface designed for exam rooms.
- Allows doctors to record patient symptoms using microphone transcription.
- Triggers AI-driven summaries that populate diagnosis suggestions and recommended prescriptions.
- Features a **Prescription Generator** to write, approve, and automatically encrypt treatment instructions to the patient's record in one click.
### 5. Secure Encrypted Health Records (EHR)
- Encrypts patient notes, reports, and summaries directly in MongoDB using military-grade **AES-256-CBC** cryptography.
- Protects patient privacy by only decrypting files on-the-fly for authorized physicians.
- Automatically writes logs to a dedicated, HIPAA-compliant **AuditLog** collection for every decryption request.
---
## 📂 Project Structure
```
medinexa-ai/
├── backend/                  # Node.js + Express API Backend
│   ├── src/
│   │   ├── controllers/      # Route logic (auth, emergency, ai, reports)
│   │   ├── middleware/       # JWT protection, role authorizers, input validators
│   │   ├── models/           # Mongoose schemas (Patient, Doctor, Report, etc.)
│   │   ├── routes/           # API router endpoints
│   │   └── utils/            # AES crypto, logger, audit helpers, validators
│   ├── seed.js                # Initial database seed script
│   └── server.js             # Main server entrypoint
│
└── frontend/                 # Vite + React + Tailwind Frontend Client
    ├── src/
    │   ├── components/       # Layouts, Doctor cards, error boundaries
    │   ├── context/          # State providers (AuthContext)
    │   ├── hooks/            # Tanstack React Query integrations
    │   └── pages/            # Views (patient & doctor dashboard split, SOS, Home)
```
---
## 🛠️ Setup & Installation
### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017`)
### 1. Set Up Environment Variables
Create a `.env` file in the `backend/` directory:
```env
MONGO_URI=mongodb://127.0.0.1:27017/medinexa-ai
JWT_SECRET=medinexa_secret_key
JWT_EXPIRES=7d
PORT=5000
```
### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install
# Install frontend dependencies
cd ../frontend
npm install
```
### 3. Initialize & Seed Database
Reset the database collections and seed sample records (3 doctors, 5 patients, active prescription schedules):
```bash
cd backend
node seed.js
```
---
## 🏃 Running the Application
### 1. Start the Backend API
```bash
cd backend
npm run dev
```
*The API server will listen on `http://localhost:5000`.*
### 2. Start the Frontend Dev Client
```bash
cd frontend
npm run dev
```
*The client app will launch on `http://localhost:5173`.*
---
## 🔐 Mock Credentials
Use these seeded credentials to test the portals:
- **Patient Portal**:
  - Email: `john@patient.com`
  - Password: `SecurePass123!`
  
- **Doctor Portal**:
  - Email: `arjun@medinexa.com`
  - Password: `SecurePass123!`
