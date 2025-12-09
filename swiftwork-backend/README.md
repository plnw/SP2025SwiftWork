python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt

python -m uvicorn app.main:app --reload --port 8000
http://localhost:8000/ 
http://localhost:8000/docs
