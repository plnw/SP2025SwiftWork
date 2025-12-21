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
from app.api.mock_data import (
    get_dummy_product,
    get_dummy_analysis,
    get_all_dummy_products,
    get_all_dummy_analyses
)

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


# ==================== MOCK/DUMMY ENDPOINTS ====================

@router.get("/mock/products", tags=["mock"])
async def get_mock_products():
    """
    ดึงรายการ dummy products ทั้งหมดสำหรับการทดสอบ
    """
    return {"products": get_all_dummy_products()}


@router.get("/mock/products/{index}", response_model=ProductData, tags=["mock"])
async def get_mock_product(index: int = 0):
    """
    ดึง dummy product ตามลำดับ (index: 0, 1, 2, ...)
    """
    try:
        return get_dummy_product(index)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Product not found: {str(e)}")


@router.get("/mock/analyses", tags=["mock"])
async def get_mock_analyses():
    """
    ดึงรายการ dummy analyses ทั้งหมดสำหรับการทดสอบ
    """
    return {"analyses": get_all_dummy_analyses()}


@router.get("/mock/analyses/{index}", response_model=AnalysisResponse, tags=["mock"])
async def get_mock_analysis(index: int = 0):
    """
    ดึง dummy analysis result ตามลำดับ (index: 0, 1, ...)
    """
    try:
        return get_dummy_analysis(index)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Analysis not found: {str(e)}")


@router.post("/mock/analyze", response_model=AnalysisResponse, tags=["mock"])
async def mock_analyze_product_endpoint(product: ProductData):
    """
    POST dummy product และดึง mock analysis result แบบสุ่ม
    ใช้สำหรับทดสอบ API integration
    """
    import random
    try:
        # ส่งกลับ analysis result สุ่ม (0 หรือ 1)
        return get_dummy_analysis(random.randint(0, 1))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/mock/sample-product", response_model=ProductData, tags=["mock"])
async def get_sample_product():
    """
    ดึง sample product ตัวอย่างสำหรับการทดสอบ (โปรดักชันแรก)
    """
    return get_dummy_product(0)


@router.get("/mock/sample-analysis", response_model=AnalysisResponse, tags=["mock"])
async def get_sample_analysis():
    """
    ดึง sample analysis ตัวอย่างสำหรับการทดสอบ (ผลลัพธ์แรก)
    """
    return get_dummy_analysis(0)