from app.api.schemas import ProductData, AnalysisResponse, TopicAnalysis, TopicDetails
from typing import List
import re
import json

def serialize_ai_fix(ai_fix_data):
    """Convert ai_fix objects/lists to JSON string for frontend compatibility"""
    if ai_fix_data is None:
        return None
    if isinstance(ai_fix_data, str):
        return ai_fix_data
    return json.dumps(ai_fix_data, ensure_ascii=False)

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
    
    # 5. เพิ่มการมองเห็นของการ์ดงาน (Visibility/SEO)
    visibility_analysis = analyze_visibility(product.tags, product.description)
    topics.append(visibility_analysis)
    
    # 6. ข้อมูลแพ็กเกจ (Package Info)
    packages = getattr(product, 'packages', None)
    package_analysis = analyze_package(packages)
    topics.append(package_analysis)
    
    # 7. อัลบั้มผลงาน (Portfolio/Album)
    album_images = getattr(product, 'album_images', None)
    album_analysis = analyze_album(album_images)
    topics.append(album_analysis)
    
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
        "label & packaging": (5000, 15000)
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

def analyze_visibility(tags: list | None, description: str | None) -> TopicAnalysis:
    """วิเคราะห์การมองเห็นและ SEO (Tags + Description Quality)"""
    tags_count = len(tags) if tags else 0
    desc_len = len(description.strip()) if description else 0

    # scoring logic: consider both tags and description
    if tags_count >= 5 and desc_len >= 200:
        score = 85
    elif tags_count >= 5 or desc_len >= 200:
        score = 80
    elif tags_count > 0 or desc_len > 0:
        score = 70
    else:
        score = 50

    status = "pass" if score >= 75 else ("suggest" if score >= 50 else "fail")

    # ai_analysis message more informative
    if tags_count == 0 and desc_len == 0:
        ai_analysis = "ไม่มี tags และคำอธิบาย ทำให้ลูกค้าค้นหาบริการยาก"
    elif tags_count == 0:
        ai_analysis = "ไม่มี tags — คำอธิบายมีอยู่แต่การค้นหาอาจไม่แม่นยำเพียงพอ"
    elif desc_len == 0:
        ai_analysis = "มี tags แต่คำอธิบายสั้นหรือไม่มี — เพิ่มคำอธิบายเพื่อช่วยแสดงรายละเอียด"
    else:
        ai_analysis = "มีข้อมูลเพื่อเพิ่มการมองเห็น แต่ยังสามารถปรับปรุงให้ดีกว่าได้"

    # ai_fix: generate concrete suggestions - ส่งเป็น string แทน dict
    suggested_tags_text = None
    if not tags:
        if description:
            words = [w.strip(".,/()[]") for w in description.split() if len(w) > 2]
            suggested_list = list(dict.fromkeys(words))[:5] if words else ["ออกแบบ","งาน","บริการ"]
            suggested_tags_text = ", ".join(suggested_list)
        else:
            suggested_tags_text = "ออกแบบ, โลโก้, แบรนด์, กราฟิก, illustration"
    else:
        suggested_tags_text = ", ".join(tags[:8])

    ai_fix_text = None
    if desc_len < 100:
        ai_fix_text = (
            f"Tags แนะนำ: {suggested_tags_text}\n\n"
            "คำอธิบายแนะนำ: เพิ่มรายละเอียดสินค้า เช่น กระบวนการทำงาน สิ่งที่จะได้ ระยะเวลา "
            "และตัวอย่างผลงาน ตัวอย่าง: 'ให้บริการวาดรูปการ์ตูนคุณภาพสูง มีไฟล์ต้นฉบับ (AI, PSD) "
            "ส่งงานภายใน 3 วัน แก้ไข 2 ครั้ง'"
        )
    elif tags_count == 0:
        ai_fix_text = f"Tags แนะนำ: {suggested_tags_text}"
    
    return TopicAnalysis(
        name="เพิ่มการมองเห็นของการ์ดงาน",
        emoji="👁️",
        score=int(score),
        status=status,
        details=TopicDetails(
            current=f"Tags: {tags_count} คำ, คำอธิบาย: {desc_len} ตัวอักษร",
            ai_analysis=ai_analysis,
            suggestion="เพิ่ม tags 5-8 คำและคำอธิบายอย่างน้อย 100-200 ตัวอักษร" if score < 80 else "ข้อมูลมองเห็นดี แต่ตรวจสอบคำค้นหลัก",
            ai_fix=ai_fix_text,
            fail_steps=[
                "- เพิ่ม tags สำคัญ ๆ 5-8 คำ",
                "- ขยายคำอธิบายให้มีรายละเอียด (กระบวนการ ผลลัพธ์ ระยะเวลา)",
                "- ใช้คำที่ลูกค้าจะค้นหา เช่น: โลโก้, ออกแบบ, แบรนด์"
            ] if score < 50 else None,
            pass_tips=["ใช้คำค้นหลักในชื่อและคำอธิบาย", "เพิ่มแท็กที่เกี่ยวข้อง 5-8 คำ"] if score >= 75 else None
        )
    )

def analyze_package(packages: list | None) -> TopicAnalysis:
    """วิเคราะห์ข้อมูลแพ็กเกจ"""
    if not packages:
        return TopicAnalysis(
            name="ข้อมูลแพ็กเกจ",
            emoji="📦",
            score=0,
            status="fail",
            details=TopicDetails(
                current="ไม่มีแพ็กเกจ",
                ai_analysis="ยังไม่มีข้อมูลแพ็กเกจ",
                suggestion="เพิ่มอย่างน้อย 2 แพ็กเกจ (basic, standard, premium)",
                ai_fix=(
                    "แพ็กเกจแนะนำ:\n\n"
                    "1. Basic - 500 บาท (5 วัน)\n"
                    "   ไฟล์คุณภาพต่ำสำหรับใช้งานทั่วไป\n\n"
                    "2. Standard - 1,500 บาท (3 วัน)\n"
                    "   ไฟล์คุณภาพสูง + 2 ครั้งแก้ไข\n\n"
                    "3. Premium - 4,000 บาท (1-2 วัน)\n"
                    "   ไฟล์พร้อมใช้งาน + ลิขสิทธิ์เต็มรูปแบบ"
                ),
                fail_steps=["สร้างแพ็กเกจอย่างน้อย 2 ระดับ", "ระบุราคาและระยะเวลาให้ชัดเจน"],
                pass_tips=None
            )
        )
    
    count = len(packages)
    required_fields_missing = 0
    for p in packages:
        if not p.get("name") or p.get("price") is None or not p.get("delivery_time"):
            required_fields_missing += 1
    
    if count == 1:
        score = 60
    elif 2 <= count <= 3:
        score = 90
    else:
        score = 80
    score -= min(required_fields_missing * 10, 30)
    status = "pass" if score >= 80 else ("suggest" if score >= 50 else "fail")
    
    ai_fix_text = None
    if required_fields_missing or count < 2:
        ai_fix_text = (
            "แพ็กเกจแนะนำ:\n\n"
            "1. Basic - 500 บาท (5 วัน)\n"
            "   งานพื้นฐาน ส่งงานไฟล์ JPG/PNG\n\n"
            "2. Standard - 1,500 บาท (3 วัน)\n"
            "   รวมไฟล์ต้นฉบับและแก้ไข 2 ครั้ง\n\n"
            "3. Premium - 4,000 บาท (1-2 วัน)\n"
            "   งานด่วน พร้อมสิทธิ์เชิงพาณิชย์"
        )
    
    return TopicAnalysis(
        name="ข้อมูลแพ็กเกจ",
        emoji="📦",
        score=max(0, int(score)),
        status=status,
        details=TopicDetails(
            current=f"{count} แพ็กเกจ" + (f" (ข้อมูลไม่ครบ {required_fields_missing} แพ็กเกจ)" if required_fields_missing else ""),
            ai_analysis="จำนวนแพ็กเกจและความสมบูรณ์ของข้อมูลถูกตรวจสอบ",
            suggestion="เพิ่มอย่างน้อย 2-3 แพ็กเกจ พร้อมชื่อ ราคา และระยะเวลา",
            ai_fix=ai_fix_text,
            fail_steps=None,
            pass_tips=["มีแพ็กเกจ 2-3 ระดับ", "ระบุเวลาและความแตกต่างของแต่ละแพ็กเกจ"] if status == "pass" else None
        )
    )

def analyze_album(album_images: list | None) -> TopicAnalysis:
    """วิเคราะห์อัลบั้มผลงาน"""
    if not album_images or len(album_images) == 0:
        return TopicAnalysis(
            name="อัลบั้มผลงาน",
            emoji="📚",
            score=0,
            status="fail",
            details=TopicDetails(
                current="0 รูปภาพ",
                ai_analysis="ไม่มีผลงานตัวอย่าง",
                suggestion="อัปโหลดผลงานอย่างน้อย 5 รูปภาพ",
                ai_fix=(
                    "แนะนำอัปโหลดภาพผลงาน 5-10 รูป:\n\n"
                    "- อัปโหลดภาพผลงานที่มีมุมมองหลากหลายและคำบรรยายสั้นๆ\n"
                    "- อัปโหลดภาพขนาดคุณภาพสูง (1280x720px) และตัวอย่างไฟล์ต้นฉบับหากเป็นไปได้\n"
                    "- แสดงขั้นตอนการทำงาน (Before/After) เพื่อสร้างความน่าเชื่อถือ"
                ),
                fail_steps=["เพิ่มภาพผลงานอย่างน้อย 5 รูปภาพ", "ใส่คำอธิบายสั้น ๆ ในแต่ละผลงาน"],
                pass_tips=None
            )
        )
    
    count = len(album_images)
    if count < 5:
        score = 60
    elif 5 <= count <= 15:
        score = 90
    else:
        score = 85
    status = "pass" if score >= 80 else ("suggest" if score >= 50 else "fail")
    
    ai_fix_text = None
    if count < 5:
        ai_fix_text = (
            "คำแนะนำในการเพิ่มภาพผลงาน:\n\n"
            "- เพิ่มภาพผลงานอย่างน้อย 5 รูป ครอบคลุมสไตล์ต่าง ๆ\n"
            "- ใส่คำบรรยายสั้น ๆ (1-2 บรรทัด) ให้แต่ละภาพ เช่น ขั้นตอน ผลลัพธ์ ลูกค้นที่เหมาะสม\n"
            "- จัดเรียงภาพจากงานที่ดีที่สุดไปหางานรอง"
        )
    else:
        ai_fix_text = (
            "ปรับปรุงอัลบั้มผลงาน:\n\n"
            "- เพิ่มคำบรรยายสั้น ๆ ใต้ภาพแต่ละภาพเพื่ออธิบายงานและผลลัพธ์\n"
            "- จัดเรียงภาพจากงานที่ดีที่สุดไปหางานรอง\n"
            "- ลบภาพที่คุณภาพต่ำหรือไม่เกี่ยวข้อง"
        )
    
    return TopicAnalysis(
        name="อัลบั้มผลงาน",
        emoji="📚",
        score=int(score),
        status=status,
        details=TopicDetails(
            current=f"{count} รูปภาพ",
            ai_analysis=f"มีผลงาน {count} รายการ" + (" - ควรเพิ่มเติมเพื่อสร้างความน่าเชื่อถือ" if count < 5 else ""),
            suggestion="อัพโหลดผลงานเพิ่มเติม" if count < 5 else "เพิ่มคำอธิบายในแต่ละภาพ",
            ai_fix=ai_fix_text,
            fail_steps=None,
            pass_tips=["เพิ่มตัวอย่างผลงาน 5-15 รูป", "แสดงงานหลากหลายสไตล์"] if status == "pass" else None
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