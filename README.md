
# AI-Driven Intelligent Ransomware Detection System

An AI-powered ransomware detection system that monitors file-system activities, analyzes suspicious behavior using Machine Learning, and provides real-time detection alerts through a web-based dashboard.

The project combines a Python-based detection engine, Random Forest classification, FastAPI backend, SQLite database, JWT authentication, and React frontend.

## Features

- **Real-Time File Monitoring:** Uses Watchdog to monitor file creation, modification, and renaming activities.
- **Behavioral Analysis:** Extracts features such as file entropy, file modification frequency, rename count, CPU usage, memory usage, file size, and suspicious file extensions.
- **Machine Learning Detection:** Uses a trained Random Forest classifier to identify normal and ransomware-related activities.
- **Prediction Probability:** Calculates Normal and Ransomware prediction probabilities.
- **Detection Alerts:** Generates alerts when ransomware probability reaches the configured 60% threshold.
- **REST API:** FastAPI backend for communication between the detection engine and dashboard.
- **Authentication:** JWT-based authentication with password hashing.
- **Detection History:** Stores detection records and statistics using SQLite.
- **Interactive Dashboard:** React-based frontend for monitoring detection results and viewing analytics.

## Technology Stack

| Component | Technologies |
|---|---|
| Programming Language | Python, JavaScript |
| Machine Learning | Scikit-learn, Random Forest |
| Detection | Watchdog, NumPy, Pandas, Joblib, Psutil |
| Backend | FastAPI, Uvicorn |
| Frontend | React.js, Vite, Axios |
| Database | SQLite |
| Authentication | JWT, PBKDF2 Password Hashing |
| Version Control | Git, GitHub |

## Project Structure

```text
Ransomeware_detection_system/
│
├── README.md
├── .gitignore
├── requirements.txt
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── schemas.py
│   └── main_before_auth.py
│
├── detection-engine/
│   ├── monitor.py
│   ├── ai_detector.py
│   ├── predictor.py
│   ├── feature_extractor.py
│   ├── feature_engineering.py
│   ├── train_model.py
│   ├── train_production_model.py
│   ├── ransomware_model.pkl
│   ├── ransomware_production_model.pkl
│   │
│   ├── dataset.csv
│   ├── dataset_augmented.csv
│   ├── dataset_clean.csv
│   ├── dataset_features.csv
│   ├── session_dataset.csv
│   │
│   ├── simulation/
│   │   ├── simulate_normal.py
│   │   └── simulate_ransomware.py
│   │
│   ├── training/
│   │   ├── collect_data.py
│   │   ├── train_model.py
│   │   └── evaluate_model.py
│   │
│   ├── demo_folder/
│   │   ├── normal_simulation/
│   │   └── ransomware_simulation/
│   │
│   └── models/
│
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── index.html
    ├── vite.config.js
    │
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── App.css
        ├── index.css
        │
        ├── components/
        │   ├── AppShell.jsx
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   └── NotificationBell.jsx
        │
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Detection.jsx
        │   ├── History.jsx
        │   ├── Analytics.jsx
        │   └── Settings.jsx
        │
        ├── services/
        │   ├── api.js
        │   └── auth.js
        │
        └── assets/
```

## How the System Works

1. The detection engine monitors file-system activities using Watchdog.
2. Behavioral features are extracted from monitored file activities.
3. The trained Random Forest model analyzes the extracted features.
4. The model calculates the probability of normal and ransomware behavior.
5. If ransomware probability reaches the configured 60% threshold, a detection alert is generated.
6. Detection information is sent to the FastAPI backend.
7. The backend stores detection records in SQLite.
8. The React dashboard displays detection information, alerts, history, and statistics.

## Installation and Setup

### Prerequisites

- Python 3.10 or above
- Node.js and npm
- Git
- VS Code

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
cd Ransomeware_detection_system
```

### 2. Create a Virtual Environment

For Windows PowerShell:

```powershell
py -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If activation is blocked:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

### 3. Install Python Dependencies

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Start the Backend

Open a terminal at the project root:

```powershell
cd backend
python -m uvicorn main:app --reload
```

Backend URL:

http://127.0.0.1:8000

API documentation:

http://127.0.0.1:8000/docs

### 5. Start the Frontend

Open another terminal at the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173

### 6. Start the Detection Engine

Open a third terminal at the project root:

```powershell
cd detection-engine
python monitor.py
```

The detection engine loads the trained production model and monitors the configured demo folder.

**Important:** Start the backend before starting the detection engine.

## Demo Login Credentials

Use the following default credentials to access the dashboard:

| Field | Credentials |
|---|---|
| User ID / Username | admin |
| Password | admin123 |

These are public demonstration credentials. The application initializes the default administrator account in its local authentication database.

**Security Notice:** Change the default credentials and configure a strong JWT secret before deployment. Never use these demo credentials for a publicly accessible application.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | / | API status |
| GET | /health | Health check |
| POST | /auth/login | User authentication |
| GET | /auth/me | Current user information |
| GET | /detection/latest | Latest detection |
| GET | /detection/history | Detection history |
| GET | /detection/statistics | Detection statistics |
| POST | /detection/update | Submit detection results |
| DELETE | /detection/history | Clear detection history |

## Machine Learning Model

The project uses a trained Random Forest classifier to identify ransomware-related behavioral patterns.

Behavioral features include:

- File entropy
- File modification frequency
- File rename count
- CPU utilization
- Memory utilization
- File size
- Suspicious file extension
- Time-window activity

The production detection engine uses the model:

`ransomware_production_model.pkl`

The configured ransomware detection probability threshold is 0.60 (60%).

## Limitations and Safety

- This is an academic and demonstration project, not a production endpoint-protection solution.
- Detection accuracy depends on the training dataset and behavioral features.
- The current system generates alerts for suspicious activities; it does not guarantee ransomware prevention or automatic process termination.
- Use only disposable test files and the provided demo directory when testing.
- Never run actual ransomware samples.
- Do not expose the development backend directly to the public internet.

## Future Enhancements

- Advanced behavioral anomaly detection.
- Improved detection accuracy using larger datasets.
- Automated incident response.
- Process-level threat investigation.
- Enhanced monitoring and reporting.

## Author

**Sidra Rahman**

GitHub: https://github.com/sid1r

---

If you find this project useful, consider giving the repository a star!
