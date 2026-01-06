from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class ProductData(BaseModel):
    """ข้อมูลสินค้าที่ส่งมาจาก Extension"""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    price: Optional[float] = None
    cover_image: Optional[str] = None
    tags: Optional[List[str]] = []
    packages: Optional[List[Dict]] = None
    album_images: Optional[List[str]] = None
    
class TopicScore(BaseModel):
    """คะแนนของแต่ละหัวข้อ"""
    name: str
    score: int = Field(ge=0, le=100)
    status: str  # 'pass', 'suggest', 'fail'
    
class TopicDetails(BaseModel):
    """รายละเอียดของหัวข้อ"""
    current: Optional[Any] = None
    ai_analysis: Optional[str] = None
    suggestion: Optional[str] = None
    ai_fix: Optional[Any] = None
    fail_steps: Optional[List[str]] = None
    pass_tips: Optional[List[str]] = None

class TopicAnalysis(BaseModel):
    """การวิเคราะห์แต่ละหัวข้อ"""
    name: str
    emoji: str
    score: int
    status: str
    details: TopicDetails

class AnalysisResponse(BaseModel):
    """Response จาก API"""
    overall_score: int
    topics: List[TopicAnalysis]
    recommendations: List[str]

class SuggestionRequest(BaseModel):
    """Request สำหรับขอคำแนะนำเฉพาะหัวข้อ"""
    topic: str
    current_value: str
    context: Optional[Dict] = None