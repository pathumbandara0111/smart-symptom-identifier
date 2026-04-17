# 🩺 Smart Symptom Identifier

An advanced AI-powered health platform designed to help users identify potential illnesses, access verified first-aid guidance, and locate medical professional—instantly.

## 🚀 Key Features

### 1. AI Symptom Checker (Text & Image)
- **Natural Language Analysis**: Describe your symptoms in plain text and get instant predictions powered by **Google Gemini 2.5 Flash AI**.
- **Visual Analysis**: Upload photos of visible symptoms (rashes, redness, etc.) for AI-driven visual condition identification.
- **Risk Assessment**: Automatically identifies critical symptoms and provides emergency warnings.

### 2. Medical Directories
- **Doctor Locator**: Real-time map integration to find nearby hospitals and clinics.
- **Specialist Recommendations**: AI suggests the specific type of doctor you should consult based on your symptoms.
- **Contact Details**: One-tap calling for hospitals and direct navigation links.

### 3. First Aid Guides
- **Verified Instructions**: Step-by-step guides for 20+ common medical situations (Allergies, Respiratory issues, Injuries, etc.).
- **Responsive View**: Desktop side-by-side view and mobile bottom-sheet modal for quick access in urgent moments.

### 4. Admin Portal (Secure)
- **Separate Management System**: Dedicated admin login and database table for system security.
- **Full CRUD Operations**: Manage Doctors, Hospitals, and First Aid guides through a professional glassmorphism dashboard.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15+ (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Styling**: Vanilla CSS & Styled-JSX (Glassmorphism design system).
- **Backend**: Next.js API Routes, Prisma ORM.
- **Database**: PostgreSQL (Neon.tech).
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash).
- **Maps**: Google Maps JavaScript API.
- **Authentication**: NextAuth.js.

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd webapp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="your-postgresql-url"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the app**:
   ```bash
   npm run dev
   ```

## 🔐 Admin Access
- **URL**: `/admin/login`
- **Default Username**: `admin`
- **Default Password**: `admin123`

---
*⚠️ **Disclaimer**: This application is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.*

