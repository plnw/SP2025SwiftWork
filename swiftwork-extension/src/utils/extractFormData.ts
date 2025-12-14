// ฟังก์ชันดึงข้อมูลจากฟอร์ม Fastwork
export interface FastworkFormData {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  cover_image?: string;
  tags?: string[];
}

export function extractFormData(): FastworkFormData {
  const data: FastworkFormData = {};

  // ดึงชื่องาน
  const titleInput = document.querySelector<HTMLInputElement>('input[name="title"]');
  if (titleInput) {
    data.title = titleInput.value;
  }

  // ดึงคำอธิบาย
  const descriptionTextarea = document.querySelector<HTMLTextAreaElement>('textarea[name="description"]');
  if (descriptionTextarea) {
    data.description = descriptionTextarea.value;
  }

  // ดึงราคา
  const priceInput = document.querySelector<HTMLInputElement>('input[name="price"]');
  if (priceInput) {
    const priceValue = priceInput.value.replace(/,/g, '');
    data.price = parseFloat(priceValue) || 0;
  }

  // ดึงหมวดหมู่
  const categoryElement = document.querySelector('.css-1dimb5e-singleValue');
  if (categoryElement) {
    const categoryText = categoryElement.textContent || '';
    // แยก category และ subcategory
    const parts = categoryText.split('>').map(s => s.trim());
    if (parts.length >= 2) {
      data.category = parts[0];
      data.subcategory = parts[1];
    } else {
      data.category = categoryText;
    }
  }

  // ดึง cover image (ถ้ามี)
  const coverImageInput = document.querySelector<HTMLInputElement>('input[id="cover-image"]');
  if (coverImageInput && coverImageInput.files && coverImageInput.files.length > 0) {
    data.cover_image = 'uploaded'; // บอกว่ามีรูป
  }

  // ดึง tags (ถ้ามี)
  const tagElements = document.querySelectorAll('.tag-item');
  if (tagElements.length > 0) {
    data.tags = Array.from(tagElements).map(el => el.textContent || '');
  }

  console.log('📊 Extracted form data:', data);
  return data;
}

// ฟังก์ชันสำหรับ watch การเปลี่ยนแปลงของฟอร์ม
export function watchFormChanges(callback: (data: FastworkFormData) => void) {
  const inputs = document.querySelectorAll('input, textarea, select');
  
  const handleChange = () => {
    const data = extractFormData();
    callback(data);
  };

  inputs.forEach(input => {
    input.addEventListener('input', handleChange);
    input.addEventListener('change', handleChange);
  });

  // Initial extraction
  handleChange();
}