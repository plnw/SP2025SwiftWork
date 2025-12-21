// ฟังก์ชันดึงข้อมูลจากฟอร์ม Fastwork
export interface FastworkFormData {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  cover_image?: string;
  tags?: string[];
  duration?: string;
  album_images?: string[];
  video?: string;
  packageName?: string;
}

// Helper to check if an element is visible
function isVisible(el: HTMLElement): boolean {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

// Helper to find the first visible input matching a selector
function getVisibleInput(selector: string): HTMLInputElement | null {
  const elements = document.querySelectorAll<HTMLInputElement>(selector);
  for (const el of Array.from(elements)) {
    if (isVisible(el)) return el;
  }
  return null;
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

  // ดึงราคา (Visible Only)
  const priceInput = getVisibleInput('input[name="price"]');
  if (priceInput) {
    const priceValue = priceInput.value.replace(/,/g, '');
    data.price = parseFloat(priceValue) || 0;
  }

  // ดึงชื่อแพ็กเกจ (Visible Only)
  const packageNameInput = getVisibleInput('input[placeholder*="ชื่อแพ็กเกจ"]');
  if (packageNameInput) {
    data.packageName = packageNameInput.value;
  }

  // ดึงระยะเวลาทำงาน (Visible Only)
  let durationValue: string | undefined;

  // 1. Try by specific name (from user provided HTML) or placeholder
  // HTML: <input type="text" value="9" name="delivery_times" inputmode="numeric">
  const durationInputByName = getVisibleInput('input[name="delivery_times"], input[name="delivery_time"], input[name="delivery_days"]');
  if (durationInputByName && durationInputByName.value) {
    durationValue = durationInputByName.value;
    console.log('✅ Found duration by name:', durationInputByName.name);
  }

  // 2. Try by placeholder (Fuzzy Match on Visible Inputs)
  if (!durationValue) {
    const allInputs = Array.from(document.querySelectorAll('input'));
    const visibleInputs = allInputs.filter(isVisible);

    const durationInputByPlaceholder = visibleInputs.find(input => {
      const ph = input.placeholder || '';
      return ph.includes('ระยะเวลา');
    });

    if (durationInputByPlaceholder && durationInputByPlaceholder.value) {
      durationValue = durationInputByPlaceholder.value;
      console.log('✅ Found duration by placeholder:', durationInputByPlaceholder.placeholder);
    }
  }

  // 3. Try by label fallback (Structure: Label -> Sibling Div -> Input)
  if (!durationValue) {
    const labels = Array.from(document.querySelectorAll('label'));
    const durationLabel = labels.find(el => el.textContent?.includes('ระยะเวลาในการทำงาน'));

    if (durationLabel) {
      // Case A: Input is inside the label (rare but possible)
      const inputInside = durationLabel.querySelector('input');
      if (inputInside && inputInside.value) {
        durationValue = inputInside.value;
      } else {
        // Case B: Input is in a sibling container (e.g., div.trb-input)
        // <div class="trb-field"> <label>...</label> <div class="trb-input"> <input> ... </div> </div>
        let next = durationLabel.nextElementSibling;
        if (next) {
          const inputInNext = next.querySelector('input');
          if (inputInNext && isVisible(inputInNext as HTMLElement)) {
            durationValue = (inputInNext as HTMLInputElement).value;
            console.log('✅ Found duration by label sibling:', durationLabel.textContent);
          }
        }
      }
    }
  }

  // 2. Try by label fallback (if needed, but user seems to prefer placeholder)
  // ... (Keeping simple for now as placeholder seems to be the key)

  if (durationValue) {
    // Remove non-numeric characters except dot (if needed, but usually it's integer days)
    const numericValue = parseInt(durationValue.replace(/[^0-9]/g, ''));
    if (!isNaN(numericValue) && numericValue > 0) {
      data.duration = numericValue.toString();
    }
  }

  // ดึงอัลบั้มรูป
  // Enhanced detection: Look for all images and filter by reasonable criteria
  let albumImages: string[] = [];

  // Method 1: Look for images with CDN URLs (fastwork, cloudfront, storage) - best for already-uploaded images
  const cdnAlbumImages = document.querySelectorAll<HTMLImageElement>(
    'img[src*="fastwork"], img[src*="cloudfront"], img[src*="storage"]'
  );
  const coverInput = document.querySelector("input[id='cover-image']");

  for (const img of cdnAlbumImages) {
    const style = window.getComputedStyle(img);
    const imgWidth = img.clientWidth || img.width || 0;
    const imgHeight = img.clientHeight || img.height || 0;

    // Check if it's a content image (reasonable size, visible, and not a cover image)
    const isCoverImage = coverInput && coverInput.parentElement?.contains(img);

    if (imgWidth > 40 && imgHeight > 40 && style.display !== 'none' && !isCoverImage) {
      albumImages.push(img.src);
    }
  }

  // Method 2: Look for any img with data/blob URLs (newly uploaded images)
  if (albumImages.length === 0) {
    const previewImages = document.querySelectorAll<HTMLImageElement>('img[src^="blob:"], img[src^="data:image"]');
    for (const img of previewImages) {
      const style = window.getComputedStyle(img);
      const imgWidth = img.clientWidth || img.width || 0;
      const imgHeight = img.clientHeight || img.height || 0;

      if (imgWidth > 40 && imgHeight > 40 && style.display !== 'none' && style.visibility !== 'hidden') {
        albumImages.push(img.src);
      }
    }
  }

  // Method 3: Fallback - look for images in gallery/album/upload containers
  if (albumImages.length === 0) {
    const containerSelectors = [
      'div[class*="gallery"] img',
      'div[class*="album"] img',
      'div[class*="upload"] img',
      'div[class*="preview"] img',
      'div[class*="card"] img',
      'div[role="group"] img',
      'section img',
      'article img'
    ];
    const containerImages = document.querySelectorAll<HTMLImageElement>(containerSelectors.join(', '));

    for (const img of containerImages) {
      const style = window.getComputedStyle(img);
      const imgWidth = img.clientWidth || img.width || 0;
      const imgHeight = img.clientHeight || img.height || 0;

      // Less restrictive filtering - just check it's not tiny and is visible
      if (imgWidth > 40 && imgHeight > 40 && style.display !== 'none' && style.visibility !== 'hidden') {
        albumImages.push(img.src);
      }
    }
  }

  // Method 4: Final fallback - get ANY image that's reasonably sized and not hidden
  // This catches images that might be in unusual containers
  if (albumImages.length === 0) {
    const allImages = document.querySelectorAll<HTMLImageElement>('img');
    for (const img of allImages) {
      const style = window.getComputedStyle(img);
      const imgWidth = img.clientWidth || img.width || 0;
      const imgHeight = img.clientHeight || img.height || 0;
      const src = img.src || '';

      // Look for images that are:
      // 1. At least 40x40 pixels
      // 2. Visible (not hidden)
      // 3. Have a valid src (not empty)
      // 4. Not icons/logos (avoid very small images)
      // 5. Not the favicon or extension assets
      if (imgWidth > 40 && imgHeight > 40 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        src &&
        src.length > 0 &&
        !src.includes('chrome-extension://') &&
        !src.includes('data:image/x-icon')) {
        albumImages.push(src);
      }
    }
  }

  // Remove duplicates and filter out empty strings
  if (albumImages.length > 0) {
    data.album_images = [...new Set(albumImages.filter(src => src.length > 0))];
  }


  // ดึงวิดีโอ
  let videoValue: string | undefined;

  // 1. Try to find ANY input that contains a YouTube link (Strongest signal)
  const allInputsForVideo = document.querySelectorAll('input');
  const youtubeInput = Array.from(allInputsForVideo).find(input =>
    input.value.includes('youtube.com') || input.value.includes('youtu.be')
  );

  if (youtubeInput) {
    videoValue = youtubeInput.value;
    console.log('Found YouTube link in input:', youtubeInput);
  }

  // 2. If not found, try specific selectors (including user's hint and common ones)
  if (!videoValue) {
    const videoInput = document.querySelector<HTMLInputElement>('input[name="video_url"], input[name="video"], input[placeholder*="YouTube"], input[placeholder*="youtube"], input[placeholder*="ลิ้งค์"], input[placeholder*="Link"]');
    if (videoInput && videoInput.value) {
      videoValue = videoInput.value;
    }
  }

  // 3. Try by label fallback
  if (!videoValue) {
    const labels = Array.from(document.querySelectorAll('label, div, span, p'));
    const videoLabel = labels.find(el => el.textContent?.includes('วิดีโอ') || el.textContent?.includes('Video'));

    if (videoLabel) {
      // Look for input inside
      const inputInside = videoLabel.querySelector('input');
      if (inputInside && inputInside.value) {
        videoValue = inputInside.value;
      } else {
        // Look for input in following siblings
        let next = videoLabel.nextElementSibling;
        for (let i = 0; i < 3; i++) {
          if (!next) break;
          if (next.tagName === 'INPUT') {
            videoValue = (next as HTMLInputElement).value;
            break;
          }
          const inputInNext = next.querySelector('input');
          if (inputInNext) {
            videoValue = inputInNext.value;
            break;
          }
          next = next.nextElementSibling;
        }
      }
    }
  }

  if (videoValue) {
    data.video = videoValue;
  }

  // ดึงหมวดหมู่
  // Try multiple selectors for different modes (create vs edit)
  let categoryElement = document.querySelector('.css-1dimb5e-singleValue');

  // If not found, try other possible selectors for edit mode or alternative styles
  if (!categoryElement) {
    categoryElement = document.querySelector('[class*="singleValue"]');
  }

  // If still not found, try to find by looking for input or select elements
  if (!categoryElement) {
    const categoryInput = document.querySelector<HTMLInputElement>('input[name="category"], input[placeholder*="หมวดหมู่"]');
    if (categoryInput && categoryInput.value) {
      const categoryText = categoryInput.value || '';
      const parts = categoryText.split('>').map(s => s.trim());
      if (parts.length >= 2) {
        data.category = parts[0];
        data.subcategory = parts[1];
      } else {
        data.category = categoryText;
      }
    }
  } else {
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

  // ดึง cover image จาก preview (Fastwork ใช้ preview)
  // Try multiple methods to detect cover image in both create and edit modes
  let hasCoverImage = false;

  // Method 1: Look for preview image near cover-image input
  const coverPreviewImg = document.querySelector(
    "div:has(> input[id='cover-image']) img"
  );
  if (coverPreviewImg) {
    hasCoverImage = true;
  }

  // Method 2: Look for any img with data/blob URLs (uploaded preview)
  if (!hasCoverImage) {
    const previewImages = document.querySelectorAll('img[src^="blob:"], img[src^="data:image"]');
    for (const img of previewImages) {
      const style = window.getComputedStyle(img);
      // Check if image is visible and not tiny (likely a real cover, not icon)
      if (img.clientWidth > 50 && img.clientHeight > 50 && style.display !== 'none') {
        hasCoverImage = true;
        break;
      }
    }
  }

  // Method 3: Look for images with common CDN URLs (fastwork, cloudfront, storage)
  if (!hasCoverImage) {
    const cdnImages = document.querySelectorAll(
      'img[src*="fastwork"], img[src*="cloudfront"], img[src*="storage"]'
    );
    for (const img of cdnImages) {
      const style = window.getComputedStyle(img);
      // Check if it looks like a cover image (reasonable size and visible)
      if (img.clientWidth > 50 && img.clientHeight > 50 && style.display !== 'none') {
        hasCoverImage = true;
        break;
      }
    }
  }

  if (hasCoverImage) {
    data.cover_image = 'uploaded';
  }

  // ดึง tags (ถ้ามี)
  const tagElements = document.querySelectorAll('.tag-item, div[class*="multiValue"], .css-1rhbuit-multiValue, span.tag, div.tag');
  if (tagElements.length > 0) {
    data.tags = Array.from(tagElements).map(el => el.textContent || '');
  } else {
    // Try finding tags via hidden input if visual elements are not found
    const tagsInput = document.querySelector<HTMLInputElement>('input[name="tags"]');
    if (tagsInput && tagsInput.value) {
      try {
        // Sometimes tags are stored as JSON string or comma separated
        if (tagsInput.value.startsWith('[')) {
          data.tags = JSON.parse(tagsInput.value);
        } else {
          data.tags = tagsInput.value.split(',').map(t => t.trim());
        }
      } catch (e) {
        data.tags = [tagsInput.value];
      }
    }
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