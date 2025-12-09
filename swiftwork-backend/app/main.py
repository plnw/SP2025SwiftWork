from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router

app = FastAPI(
    title="SwiftWork AI Optimizer API",
    description="AI-powered API for optimizing Fastwork product listings",
    version="1.0.0"
)

# CORS middleware - อนุญาตให้ Extension เรียก API ได้
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ในโปรดักชันควรระบุ origin ที่ชัดเจน
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router, prefix="/api", tags=["analysis"])

@app.get("/")
async def root():
    return {
        "message": "SwiftWork AI Optimizer API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)