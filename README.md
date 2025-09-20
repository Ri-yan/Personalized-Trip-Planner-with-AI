# 🌍 Smart Travel Planner

An AI-powered **travel planning web application** built with **React + Vite + TailwindCSS**, designed to provide personalized trip suggestions, real-time weather insights, interactive maps, and seamless travel booking support.  

---

## ✨ Features

- **AI-Powered Suggestions**  
  - Uses **Gemini API** for smart trip recommendations based on user preferences.  
  - Interactive **chat widget** for personalized assistance.  

- **Trip Planning & Maps**  
  - View destinations with an interactive **map (TripMap & TripMapDirection components)**.  
  - Integrated **geocoding** for location lookup.  

- **Weather Insights**  
  - Real-time **weather forecast widget** for trip destinations.  

- **User Onboarding & Personalization**  
  - Simple onboarding flow (`Onboarding.jsx`) to capture travel interests.  
  - Smart **recommendations** displayed in the results page (`Results.jsx`).  

- **Booking & Confirmation**  
  - **Booking modal** for trip reservations.  
  - Confirmation modal for user actions.  

- **Document Generation**  
  - Export personalized itineraries as **PDF** using built-in utilities.  

- **Analytics & Engagement**  
  - Event tracking with a custom analytics module.  
  - Firebase integration for backend services (authentication, storage, etc.).  

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)  
- **Styling:** TailwindCSS, PostCSS  
- **State & Components:** React hooks, modular components  
- **Maps & Geocoding:** Custom geodecoding utility  
- **Weather API:** Integrated weather.js module  
- **AI Integration:** Gemini.js utility for trip suggestions  
- **Backend/Services:** Firebase integration (authentication & data storage)  
- **Other:** PDF generation, custom modals, chat widgets  

---

## 📂 Project Structure

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.cjs
├── postcss.config.cjs
├── .env.demo              # Example environment file
├── public/
│   └── logo.png
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/        # Core UI components
│   ├── pages/             # Page views (Onboarding, Results, etc.)
│   ├── styles/            # Global styles
│   ├── utils/             # API & helper utilities
│   └── widgets/           # Interactive widgets (Chat, Booking, Interests)
```

---

## ⚙️ Configuration

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project-folder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**  
   Create a `.env` file in the root (refer to `.env.demo`) and configure:  
   ```bash
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_WEATHER_API_KEY=your_weather_key
   ```

---

## 🚀 Usage

### Start Development Server
```bash
npm run dev
```
App will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 📖 How It Works

1. **User Onboarding:**  
   Users enter travel preferences (interests, dates, destinations).  

2. **AI Suggestions:**  
   Gemini API generates personalized recommendations.  

3. **Interactive Map & Weather:**  
   Maps show travel routes; weather widget gives live conditions.  

4. **Booking Flow:**  
   Users confirm trips via booking modal → Firebase stores details.  

5. **Export Itinerary:**  
   Generate and download a **PDF itinerary** of the planned trip.  

---

## 📌 Future Enhancements

- Multi-language support.  
- Social sharing of itineraries.  
- Advanced AI-based trip cost optimization.  

---

## 🧑‍💻 Contributors

Developed by **Developnators** 🚀  
