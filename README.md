# SP2025SwiftWork

This project consists of **two separate folders** that must be run **independently** to use the full system:

1. **swiftwork-extension** – Chrome Extension (Frontend)
2. **swiftwork-backend** – AI Optimizer API (Backend)

> ⚠️ **Important:** You must start the backend API **before** using the Chrome extension.

---

##  Project Structure

```text
root/
├── swiftwork-extension/   # Chrome Extension (Frontend)
└── swiftwork-backend/     # FastAPI Backend (API)
```

---

## 1️ swiftwork-extension (Chrome Extension)

Detailed documentation: 👉 [`swiftwork-backend/README.md`](./swiftwork-extension/README.md)


### Features

* AI-powered product optimization
* Chrome Extension (popup, content scripts, background scripts)
* Built with modern frontend stack
  

### Installation & Run

```bash
cd swiftwork-extension
npm install
npm run dev
npm run watch
```

###  Build Extension

```bash
npm run build
```

### Load Extension in Chrome

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder inside `swiftwork-extension`

---

## 2️ swiftwork-backend (AI Optimizer API)

Detailed documentation: 👉 [`swiftwork-backend/README.md`](./swiftwork-backend/README.md)

### Features

* Product quality analysis
* Smart improvement suggestions
* API-first design

###  Tech Stack

* FastAPI
* Python 3.8+
* MongoDB
* Uvicorn

### Installation & Run

```bash
cd swiftwork-backend
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

###  Start Backend Server

```bash
python -m uvicorn app.main:app --reload --port 8000
```

Backend will be available at:

```
http://localhost:8000
```

### API Documentation

* Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
* ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

###  How It Works Together

1. Chrome Extension collects product data from Fastwork
2. Extension sends data to Backend API
3. Backend analyzes data using AI logic
4. Results are returned to the Extension
5. User sees scores & suggestions in Chrome

---

###  Important Notes

* Run **backend first**, then use the extension
* Frontend and backend run separately
* Do not mix dependencies between folders

---
