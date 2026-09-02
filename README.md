# 🏥 AarogyaSetu AI — Healthcare Resource Intelligence

> AI-powered healthcare resource management system for India's Primary Health Centres (PHCs)

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)
![Chart.js](https://img.shields.io/badge/Chart.js-4-orange?logo=chartdotjs)
![Leaflet](https://img.shields.io/badge/Leaflet-Maps-green?logo=leaflet)

## ✨ Features

- **📊 Dashboard Overview** — Real-time KPI cards, patient footfall trends, risk distribution, and state-wise analytics
- **🗺️ Interactive Map** — Leaflet-based India map with color-coded PHC markers (Healthy/Warning/Critical)
- **💊 Medicine Stock Management** — Inventory tracking with stock levels, consumption trends, and stock-out predictions
- **📈 AI Predictions & Analytics** — ML-powered demand forecasting, seasonal patterns, and explainable AI insights
- **🔄 Resource Redistribution** — AI-recommended medicine/resource transfers between PHCs
- **🚨 Alerts & Notifications** — Real-time alert system with severity levels and resolution tracking
- **🤖 Gemini AI Assistant** — Natural language chat interface for healthcare resource queries
- **📋 PHC Detail View** — Deep-dive analytics for individual Primary Health Centres

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React 19 + Vite 6 |
| Styling | Vanilla CSS (Dark Mode, Glassmorphism) |
| Charts | Chart.js + react-chartjs-2 |
| Maps | Leaflet + react-leaflet |
| Icons | Lucide React |
| Routing | React Router DOM |
| Fonts | Inter (Google Fonts) |

## 📦 Data Sources

Synthetic datasets modeled after real Kaggle sources:
- [All India Health Centres Directory](https://www.kaggle.com/datasets/sudalairajkumar/all-india-health-centres-directory)
- [Health Infrastructure India](https://www.kaggle.com/datasets/anmolkumar/health-infrastructure-india)
- [India Primary Health Care Data](https://www.kaggle.com/datasets/sudalairajkumar/india-primary-health-care-data)

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/kp074070/AarogyaSetu-AI.git

# Navigate to project
cd AarogyaSetu-AI

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Header.jsx      # Top header bar
│   └── ChatAssistant.jsx # AI chat interface
├── pages/              # Page-level components
│   ├── Dashboard.jsx   # Main dashboard
│   ├── MapView.jsx     # Interactive map
│   ├── MedicineStock.jsx # Medicine inventory
│   ├── Predictions.jsx # AI predictions
│   ├── Redistribution.jsx # Resource transfers
│   ├── Alerts.jsx      # Alert management
│   └── PHCDetail.jsx   # PHC deep-dive
├── data/               # Synthetic datasets
│   ├── phcData.js      # 50+ PHC records
│   ├── medicineData.js # Medicine stock data
│   ├── patientData.js  # Patient footfall
│   ├── staffData.js    # Staff availability
│   └── alertsData.js   # System alerts
├── App.jsx             # Main app with routing
├── main.jsx            # Entry point
└── index.css           # Complete design system
```

## 🎨 Design

- **Dark mode** by default with premium glassmorphism
- **Gradient accents** and micro-animations
- **Responsive** — Desktop, tablet, and mobile
- **Inter** typography for professional readability

## 📄 License

MIT License — Built for India's healthcare future 🇮🇳
