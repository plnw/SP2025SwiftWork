from typing import Dict, Optional

async def generate_suggestion(
    topic: str, 
    current_value: str, 
    context: Optional[Dict] = None
) -> str:
    """
    สร้างคำแนะนำเฉพาะหัวข้อ
    ในอนาคตจะใช้ OpenAI API
    """
    
    suggestions = {
        "ชื่องาน": generate_title_suggestion(current_value, context),
        "หมวดหมู่": "พิจารณาเปลี่ยนหมวดหมู่ให้ตรงกับประเภทงาน",
        "ราคาเริ่มต้น": "ปรับราคาให้อยู่ในช่วง 2,000-3,000 บาท",
        "ภาพปกงาน": "อัปโหลดภาพขนาด 1280x720px เพื่อคุณภาพที่ดีที่สุด"
    }
    
    return suggestions.get(topic, "ไม่มีคำแนะนำสำหรับหัวข้อนี้")

def generate_title_suggestion(title: str, context: Optional[Dict]) -> str:
    """สร้างคำแนะนำสำหรับชื่องาน"""
    if len(title) > 70:
        return f"ลดความยาวของชื่อให้อยู่ที่ 50-70 ตัวอักษร (ปัจจุบัน: {len(title)} ตัวอักษร)"
    elif len(title) < 20:
        return "เพิ่มรายละเอียดและคีย์เวิร์ดที่เกี่ยวข้องเพื่อให้ลูกค้าเข้าใจชัดเจนขึ้น"
    else:
        return "ชื่องานของคุณมีความยาวที่เหมาะสม"