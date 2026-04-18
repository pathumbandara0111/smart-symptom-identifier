# 🩺 SmartSymptom AI

**SmartSymptom AI** is a premium, full-stack medical assistance platform that combines custom-trained Deep Learning models with Large Language Models (LLMs) to provide instant symptom analysis and first-aid guidance.

![Front Page](Images/UI%20-%20Front%20Page.png)

## 🚀 Features

-   **🧠 Dual-Engine AI Analysis**: 
    -   **Custom Models**: Uses custom-trained DistilBERT (Text) and MobileNetV2 (Image) models hosted on Kaggle for primary diagnosis.
    -   **Gemini Refinement**: Automatically uses Google Gemini to refine diagnoses with professional first-aid steps and specialist recommendations.
-   **📷 Image Symptom Analyzer**: Upload photos of skin conditions or visible symptoms for instant identification.
-   **📝 Text Symptom Checker**: Describe symptoms in plain English for a detailed analysis.
-   **🗺️ Doctor & Hospital Locator**: Integrated Google Maps to find the nearest medical help.
-   **🚑 Emergency System**: One-click access to emergency contacts and critical care instructions.
-   **🛡️ Secure Admin Panel**: Full management of doctors, hospitals, and medical guidelines.

## 📸 Screenshots

### AI Symptom Checkers
| Symptom Checker | Image Analyzer |
| :---: | :---: |
| ![Symptom Checker](Images/UI%20-%20Symptom%20Checker%20Page.png) | ![Image Analyzer](Images/UI%20-%20Image%20Symptom%20Analyzer%20Page.png) |

### Healthcare Services
| Doctors & Maps | First Aid Guides |
| :---: | :---: |
| ![Maps](Images/UI%20-%20Doctors%20+%20Map%20Page.png) | ![First Aid](Images/UI%20-%20First%20Aid%20Guid%20Page.png) |

### Admin Dashboard
![Admin Panel](Images/UI%20-%20Admin%20Panel.png)

## 🛠️ Technology Stack

-   **Frontend**: Next.js 15+, TypeScript, Tailwind CSS
-   **Backend**: Next.js API Routes, Prisma ORM
-   **Database**: PostgreSQL (Supabase)
-   **AI Integration**: 
    -   **Custom Models**: Python (Flask + Ngrok + Kaggle T4 GPU)
    -   **LLM**: Google Gemini API
-   **Maps**: Google Maps Platform API
-   **Auth**: NextAuth.js

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/pathumbandara0111/smart-symptom-identifier.git
cd SmartSymptomAI/webapp
```

### 2. Environment Variables
Create a `.env` file in the `webapp` directory (see `.env.example`).

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

## 🧠 AI Connectivity
To use the custom models, ensure your Kaggle Notebook is running with the Ngrok tunnel active, and update the `NEXT_PUBLIC_KAGGLE_API_URL` in your `.env`.

---
⚠️ **Disclaimer**: This application is for informational purposes only and is not a substitute for professional medical advice.
