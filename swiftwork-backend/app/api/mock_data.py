"""
Mock data and dummy responses for testing
"""
from app.api.schemas import (
    ProductData,
    AnalysisResponse,
    TopicAnalysis,
    TopicDetails
)
from typing import List

# Dummy product data
DUMMY_PRODUCTS = [
    ProductData(
        title="ออกแบบโลโก้ระดับมืออาชีพ โดยนักออกแบบมี 5 ปี ประสบการณ์",
        description="บริการออกแบบโลโก้พรีเมียม ฟรี 3 ครั้งแก้ไข รบกวนแก้ไขได้เรื่อย ๆ",
        category="ออกแบบกราฟิก",
        subcategory="Logo",
        price=3500.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["logo", "professional", "brand"]
    ),
    ProductData(
        title="ออกแบบแบนเนอร์โฆษณา สูงสุด 5 แบบแก้ไขฟรี",
        description="บริการออกแบบแบนเนอร์โฆษณาคุณภาพสูง เหมาะสำหรับโซเชียลมีเดีย",
        category="ออกแบบกราฟิก",
        subcategory="Banner โฆษณา",
        price=2500.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["banner", "advertising", "design"]
    ),
    ProductData(
        title="ออกแบบป้ายหรือสติกเกอร์ สูงสุด 3 ไอเดีย",
        description="ออกแบบป้ายและสติกเกอร์สำหรับธุรกิจของคุณ",
        category="ออกแบบกราฟิก",
        subcategory="Label & Packaging",
        price=2200.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["label", "packaging", "sticker"]
    ),
    ProductData(
        title="ออกแบบ CI และสิ่งพิมพ์ระบบประจำตัวบริษัท",
        description="ออกแบบตัวอักษร โลโก้ สีประจำตัว และสิ่งพิมพ์ CI ที่สมบูรณ์",
        category="ออกแบบกราฟิก",
        subcategory="ดีไซน์พิมพ์และสามารถ",
        price=5000.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["ci", "identity", "branding"]
    ),
    ProductData(
        title="สกรีนเสื้อผ้าผลงาน และเครื่องแบบ",
        description="ออกแบบและจัดพิมพ์บนเสื้อผ้า",
        category="ออกแบบกราฟิก",
        subcategory="สกรีนเสื้อผ้า",
        price=1500.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["t-shirt", "screen", "apparel"]
    ),
    ProductData(
        title="ออกแบบและพิมพ์ป้ายโฆษณา",
        description="ออกแบบป้ายโฆษณาขนาดใหญ่พร้อมพิมพ์",
        category="ออกแบบกราฟิก",
        subcategory="ผลิตป้าย",
        price=4000.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["sign", "advertising", "large-format"]
    ),
    ProductData(
        title="ออกแบบนำเสนอ PowerPoint และ Keynote",
        description="ออกแบบสไลด์นำเสนออย่างมืออาชีพ",
        category="ออกแบบกราฟิก",
        subcategory="Presentation",
        price=3000.0,
        cover_image="https://via.placeholder.com/1280x720",
        tags=["presentation", "powerpoint", "keynote"]
    ),
    ProductData(
        title="ร",
        description=None,
        category=None,
        subcategory=None,
        price=None,
        cover_image=None,
        tags=[]
    )
]

# Dummy analysis responses
DUMMY_ANALYSIS_RESPONSES = [
    AnalysisResponse(
        overall_score=82,
        topics=[
            TopicAnalysis(
                name="ภาพปกงาน",
                emoji="🖼️",
                score=85,
                status="pass",
                details=TopicDetails(
                    pass_tips=[
                        "- ภาพปกของคุณมีคุณภาพดี",
                        "- พิจารณาเพิ่ม branding elements"
                    ]
                )
            ),
            TopicAnalysis(
                name="ชื่องาน",
                emoji="📝",
                score=80,
                status="pass",
                details=TopicDetails(
                    current="ออกแบบโลโก้ระดับมืออาชีพ โดยนักออกแบบมี 5 ปี ประสบการณ์",
                    pass_tips=[
                        "- ชื่องานชัดเจนและมีคีย์เวิร์ดหลัก",
                        "- ความยาวเหมาะสม (60 ตัวอักษร)"
                    ]
                )
            ),
            TopicAnalysis(
                name="หมวดหมู่",
                emoji="🏷️",
                score=85,
                status="pass",
                details=TopicDetails(
                    current="ออกแบบกราฟิก > Logo Design",
                    pass_tips=["- หมวดหมู่สอดคล้องกับประเภทงาน"]
                )
            ),
            TopicAnalysis(
                name="ราคาเริ่มต้น",
                emoji="💲",
                score=80,
                status="pass",
                details=TopicDetails(
                    current="3,500 บาท",
                    pass_tips=["- ราคาอยู่ในช่วงที่เหมาะสม"]
                )
            ),
            TopicAnalysis(
                name="เพิ่มการมองเห็นของการ์ดงาน",
                emoji="👁️",
                score=75,
                status="suggest",
                details=TopicDetails(
                    ai_analysis="การ์ดงานของคุณสามารถมองเห็นได้มากขึ้น",
                    suggestion="เพิ่มรูปภาพตัวอย่างผลงาน 3-5 รูป"
                )
            ),
            TopicAnalysis(
                name="ข้อมูลแพ็กเกจ",
                emoji="📦",
                score=65,
                status="suggest",
                details=TopicDetails(
                    ai_analysis="ข้อมูลแพ็กเกจยังไม่ชัดเจน",
                    suggestion="ระบุ 3 ระดับบริการ พื้นฐาน มาตรฐาน และพรีเมียม"
                )
            ),
            TopicAnalysis(
                name="อัลบั้มผลงาน",
                emoji="📚",
                score=90,
                status="pass",
                details=TopicDetails(
                    pass_tips=[
                        "- อัลบั้มผลงานของคุณสวยงาม",
                        "- มีตัวอย่างผลงาน 8 รายการ"
                    ]
                )
            )
        ],
        recommendations=[
            "ปรับปรุงข้อมูลแพ็กเกจเพื่อให้ลูกค้าเข้าใจตัวเลือกบริการ",
            "เพิ่มรูปภาพตัวอย่างผลงานเพื่อเพิ่มความน่าสนใจ",
            "ควรได้อย่างน้อย 80 คะแนนในแต่ละหมวด"
        ]
    ),
    AnalysisResponse(
        overall_score=75,
        topics=[
            TopicAnalysis(
                name="ภาพปกงาน",
                emoji="🖼️",
                score=70,
                status="suggest",
                details=TopicDetails(
                    ai_analysis="ภาพปกอาจไม่น่าสนใจเพียงพอ",
                    suggestion="ใช้ภาพที่สื่อถึงแบรนด์ของคุณมากขึ้น"
                )
            ),
            TopicAnalysis(
                name="ชื่องาน",
                emoji="📝",
                score=75,
                status="suggest",
                details=TopicDetails(
                    current="เว็บไซต์ WordPress ประสิทธิภาพสูง SEO ปรับแต่ง",
                    ai_analysis="ชื่องานดีแต่สามารถเพิ่มเติมได้",
                    suggestion="เพิ่มคีย์เวิร์ดเช่น ฟรีปรึกษา หรือ ดีไซน์ฟรี"
                )
            ),
            TopicAnalysis(
                name="หมวดหมู่",
                emoji="🏷️",
                score=80,
                status="pass",
                details=TopicDetails(
                    current="พัฒนาเว็บ > Website Development"
                )
            ),
            TopicAnalysis(
                name="ราคาเริ่มต้น",
                emoji="💲",
                score=75,
                status="suggest",
                details=TopicDetails(
                    current="8,500 บาท",
                    ai_analysis="ราคาดีแต่อาจต้องปรับตามคู่แข่ง",
                    suggestion="ตรวจสอบราคาคู่แข่งในหมวดเดียวกัน"
                )
            ),
            TopicAnalysis(
                name="เพิ่มการมองเห็นของการ์ดงาน",
                emoji="👁️",
                score=70,
                status="suggest",
                details=TopicDetails(
                    suggestion="อัปเดตภาพตัวอย่างเว็บไซต์ที่ทำงาน"
                )
            ),
            TopicAnalysis(
                name="ข้อมูลแพ็กเกจ",
                emoji="📦",
                score=75,
                status="suggest",
                details=TopicDetails(
                    suggestion="เพิ่มรายการเช็คลิสต์สิ่งที่รวมอยู่ในแพ็กเกจ"
                )
            ),
            TopicAnalysis(
                name="อัลบั้มผลงาน",
                emoji="📚",
                score=75,
                status="suggest",
                details=TopicDetails(
                    suggestion="เพิ่มรายละเอียด case study ของแต่ละโปรเจค"
                )
            )
        ],
        recommendations=[
            "ปรับปรุงภาพปกงานให้มีสีสัน",
            "เพิ่มคีย์เวิร์ดในชื่องาน",
            "ทำให้ข้อมูลแพ็กเกจชัดเจนขึ้น"
        ]
    )
]


def get_dummy_product(index: int = 0) -> ProductData:
    """ดึง dummy product ตามลำดับ"""
    if 0 <= index < len(DUMMY_PRODUCTS):
        return DUMMY_PRODUCTS[index]
    return DUMMY_PRODUCTS[0]


def get_dummy_analysis(index: int = 0) -> AnalysisResponse:
    """ดึง dummy analysis ตามลำดับ"""
    if 0 <= index < len(DUMMY_ANALYSIS_RESPONSES):
        return DUMMY_ANALYSIS_RESPONSES[index]
    return DUMMY_ANALYSIS_RESPONSES[0]


def get_all_dummy_products() -> List[ProductData]:
    """ดึง dummy products ทั้งหมด"""
    return DUMMY_PRODUCTS


def get_all_dummy_analyses() -> List[AnalysisResponse]:
    """ดึง dummy analyses ทั้งหมด"""
    return DUMMY_ANALYSIS_RESPONSES
