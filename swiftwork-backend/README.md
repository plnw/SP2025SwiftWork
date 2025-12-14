# SwiftWork AI Optimizer API

Backend service for the SwiftWork extension, designed to optimize Fastwork product listings using AI-powered analysis and suggestions.

## 🚀 Features

- **Product Analysis**: Analyzes product listings (Title, Image, Category, Price) and provides a quality score.
- **Smart Suggestions**: Generates actionable advice to improve listing visibility and conversion rates.
- **Topic Breakdown**: Detailed scoring and feedback for specific aspects of the product.
- **API-First**: Built with FastAPI for high performance and easy integration.

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: Python 3.8+
- **Database**: MongoDB (via Motor)
- **AI Integration**: OpenAI API (Planned/Integration ready)
- **Tools**: Uvicorn, Pydantic, Python-dotenv

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swiftwork-backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configuration**
   Create a `.env` file in the root directory (optional for current version, required for future AI features):
   ```env
   OPENAI_API_KEY=your_api_key_here
   MONGODB_URL=mongodb://localhost:27017
   ```

## 🏃‍♂️ Running the Application

Start the development server:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

## 📚 API Documentation

Interactive API documentation is automatically generated:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)