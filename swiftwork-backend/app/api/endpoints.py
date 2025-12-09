from fastapi import APIRouter, HTTPException
from app.api.schemas import (
    ProductData, 
    AnalysisResponse, 
    SuggestionRequest,
    TopicAnalysis,
    TopicDetails
)
from app.services.analyzer import analyze_product
from app.services.suggestions import generate_suggestion

router = APIRouter()

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_product_endpoint(product: ProductData):
    """
    วิเคราะห์ข้อมูลสินค้าและให้คะแนน + คำแนะนำ
    """
    try:
        result = await analyze_product(product)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggest")
async def get_suggestion(request: SuggestionRequest):
    """
    ขอคำแนะนำสำหรับหัวข้อเฉพาะ
    """
    try:
        suggestion = await generate_suggestion(
            topic=request.topic,
            current_value=request.current_value,
            context=request.context
        )
        return {"suggestion": suggestion}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics")
async def get_all_topics():
    """
    ดึงรายการหัวข้อทั้งหมดที่ใช้วิเคราะห์
    """
    topics = [
        {"name": "ภาพปกงาน", "emoji": "🖼️"},
        {"name": "ชื่องาน", "emoji": "📝"},
        {"name": "หมวดหมู่", "emoji": "🏷️"},
        {"name": "ราคาเริ่มต้น", "emoji": "💲"},
        {"name": "เพิ่มการมองเห็นของการ์ดงาน", "emoji": "👁️"},
        {"name": "ข้อมูลแพ็กเกจ", "emoji": "📦"},
        {"name": "อัลบั้มผลงาน", "emoji": "📚"}
    ]
    return {"topics": topics}

@router.post("/regenerate")
async def regenerate_analysis(product: ProductData):
    """
    วิเคราะห์ใหม่ (เหมือน /analyze แต่อาจมี cache clearing)
    """
    try:
        result = await analyze_product(product, force_refresh=True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))