from app.api.schemas import ProductData, AnalysisResponse, TopicAnalysis, TopicDetails
from typing import List
import re

async def analyze_product(product: ProductData, force_refresh: bool = False) -> AnalysisResponse:
    """
    วิเคราะห์ข้อมูลสินค้าและให้คะแนนแต่ละหัวข้อ
    """
    topics = []
    
    # 1. ภาพปกงาน
    cover_analysis = analyze_cover_image(product.cover_image)
    topics.append(cover_analysis)
    
    # 2. ชื่องาน
    title_analysis = analyze_title(product.title)
    topics.append(title_analysis)
    
    # 3. หมวดหมู่
    category_analysis = analyze_category(product.category, product.subcategory, product.title)
    topics.append(category_analysis)
    
    # 4. ราคาเริ่มต้น
    price_analysis = analyze_price(product.price, product.category)
    topics.append(price_analysis)
    
    # 5-7. หัวข้ออื่นๆ (ยังไม่มีข้อมูล จาก Extension)
    topics.extend([
        TopicAnalysis(
            name="เพิ่มการมองเห็นของการ์ดงาน",
            emoji="👁️",
            score=70,
            status="suggest",
            details=TopicDetails()
        ),
        TopicAnalysis(
            name="ข้อมูลแพ็กเกจ",
            emoji="📦",
            score=65,
            status="suggest",
            details=TopicDetails()
        ),
        TopicAnalysis(
            name="อัลบั้มผลงาน",
            emoji="📚",
            score=80,
            status="pass",
            details=TopicDetails()
        )
    ])
    
    # คำนวณคะแนนรวม
    overall_score = sum(t.score for t in topics) // len(topics)
    
    # สร้างคำแนะนำรวม
    recommendations = generate_recommendations(topics)
    
    return AnalysisResponse(
        overall_score=overall_score,
        topics=topics,
        recommendations=recommendations
    )

def analyze_cover_image(cover_image: str | None) -> TopicAnalysis:
    """วิเคราะห์ภาพปก"""
    if not cover_image:
        return TopicAnalysis(
            name="ภาพปกงาน",
            emoji="🖼️",
            score=0,
            status="fail",
            details=TopicDetails(
                fail_steps=[
                    "- อัปโหลดภาพคุณภาพสูง (1280x720px หรือ 16:9)",
                    "- ใช้ภาพที่สื่อถึงแบรนด์หรือสไตล์ที่เป็นตัวตนของคุณ",
                    "- หลีกเลี่ยงการใส่ข้อความมากเกินไปในรูปภาพ"
                ]
            )
        )
    
    return TopicAnalysis(
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
    )

def analyze_title(title: str | None) -> TopicAnalysis:
    """วิเคราะห์ชื่องาน"""
    if not title:
        return TopicAnalysis(
            name="ชื่องาน",
            emoji="📝",
            score=0,
            status="fail",
            details=TopicDetails(
                fail_steps=["- กรุณาใส่ชื่องาน"]
            )
        )
    
    title_length = len(title)
    
    if title_length > 70:
        score = 60
        status = "suggest"
        details = TopicDetails(
            current=title,
            ai_analysis=f"ชื่องานยาวเกินไป ({title_length} ตัวอักษร) อาจทำให้แสดงผลไม่สวย",
            suggestion="ลดความยาวของชื่อให้อยู่ที่ 50-70 ตัวอักษร และใส่คีย์เวิร์ดหลักไว้ต้นชื่อ",
            ai_fix=title[:70] + "..." if title_length > 70 else title
        )
    elif title_length < 20:
        score = 65
        status = "suggest"
        details = TopicDetails(
            current=title,
            ai_analysis="ชื่องานสั้นเกินไป อาจไม่ได้ให้ข้อมูลที่เพียงพอกับลูกค้า",
            suggestion="เพิ่มรายละเอียดและคีย์เวิร์ดที่เกี่ยวข้องเพื่อให้ลูกค้าเข้าใจชัดเจนขึ้น",
            ai_fix=f"{title} - บริการคุณภาพ ราคาเป็นกันเอง"
        )
    else:
        score = 80
        status = "pass"
        details = TopicDetails(
            pass_tips=[
                "- ทำให้ชื่อไม่เกิน 70 ตัวอักษร",
                "- ใส่คีย์เวิร์ดหลักไว้ต้นชื่อ"
            ]
        )
    
    return TopicAnalysis(
        name="ชื่องาน",
        emoji="📝",
        score=score,
        status=status,
        details=details
    )

def analyze_category(category: str | None, subcategory: str | None, title: str | None) -> TopicAnalysis:
    """วิเคราะห์หมวดหมู่"""
    if not category or not subcategory:
        return TopicAnalysis(
            name="หมวดหมู่",
            emoji="🏷️",
            score=0,
            status="fail",
            details=TopicDetails(
                fail_steps=["- กรุณาเลือกหมวดหมู่และหมวดหมู่ย่อย"]
            )
        )
    
    # ตรวจสอบความสอดคล้องระหว่างหมวดหมู่และชื่องาน
    current = f"{category} > {subcategory}"
    
    # ตัวอย่าง: ถ้าชื่องานมี "โลโก้" แต่หมวดหมู่ไม่ใช่ Logo
    if title and "โลโก้" in title.lower() and "logo" not in subcategory.lower():
        return TopicAnalysis(
            name="หมวดหมู่",
            emoji="🏷️",
            score=60,
            status="suggest",
            details=TopicDetails(
                current=current,
                ai_analysis="หมวดหมู่ที่คุณเลือกไม่สอดคล้องกับประเภทงานบริการ รับจ้างทำโลโก้ อาจทำให้ลูกค้าค้นหาบริการของคุณไม่เจอ",
                suggestion="ตรวจสอบและปรับหมวดหมู่ให้ตรงกับประเภทของงานคุณ",
                ai_fix="ออกแบบกราฟิก > Logo"
            )
        )
    
    return TopicAnalysis(
        name="หมวดหมู่",
        emoji="🏷️",
        score=85,
        status="pass",
        details=TopicDetails(
            current=current,
            pass_tips=["- หมวดหมู่สอดคล้องกับประเภทงาน"]
        )
    )

def analyze_price(price: float | None, category: str | None) -> TopicAnalysis:
    """วิเคราะห์ราคา"""
    if not price:
        return TopicAnalysis(
            name="ราคาเริ่มต้น",
            emoji="💲",
            score=0,
            status="fail",
            details=TopicDetails(
                fail_steps=["- กรุณาระบุราคาเริ่มต้น"]
            )
        )
    
    # เกณฑ์ราคาตามหมวดหมู่ (ตัวอย่าง)
    price_ranges = {
        "logo": (2000, 5000),
        "graphic": (1500, 4000),
        "web": (5000, 15000)
    }
    
    # ตัวอย่าง: ถ้าราคาต่ำเกินไป
    if price < 500:
        return TopicAnalysis(
            name="ราคาเริ่มต้น",
            emoji="💲",
            score=70,
            status="suggest",
            details=TopicDetails(
                current=f"{price:,.0f} บาท",
                ai_analysis="ราคาตั้งต้นอาจต่ำกว่าเรทตลาดเมื่อเทียบกับบริการในหมวดเดียวกัน",
                suggestion="ปรับราคาเริ่มต้นให้อยู่ในช่วง 2,000-3,000 บาท หรือตั้งให้ใกล้เคียงกับคู่แข่ง",
                ai_fix="2,500 บาท"
            )
        )
    
    return TopicAnalysis(
        name="ราคาเริ่มต้น",
        emoji="💲",
        score=85,
        status="pass",
        details=TopicDetails(
            current=f"{price:,.0f} บาท",
            pass_tips=["- ราคาอยู่ในช่วงที่เหมาะสม"]
        )
    )

def generate_recommendations(topics: List[TopicAnalysis]) -> List[str]:
    """สร้างคำแนะนำรวม"""
    recommendations = []
    
    fail_topics = [t for t in topics if t.status == "fail"]
    suggest_topics = [t for t in topics if t.status == "suggest"]
    
    if fail_topics:
        recommendations.append(
            f"ปรับปรุงหัวข้อที่ยังไม่สมบูรณ์: {', '.join([t.name for t in fail_topics])}"
        )
    
    if suggest_topics:
        recommendations.append(
            f"พิจารณาปรับปรุง: {', '.join([t.name for t in suggest_topics])}"
        )
    
    recommendations.append("ควรได้อย่างน้อย 80 คะแนนในแต่ละหมวด")
    
    return recommendations