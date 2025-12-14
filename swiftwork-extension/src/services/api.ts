// API Service สำหรับเรียก Backend
const API_BASE_URL = 'http://localhost:8000/api';

export interface ProductData {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number;
  cover_image?: string;
  tags?: string[];
}

export interface AnalysisResponse {
  overall_score: number;
  topics: Array<{
    name: string;
    emoji: string;
    score: number;
    status: 'pass' | 'suggest' | 'fail';
    details: {
      current?: string;
      ai_analysis?: string;
      suggestion?: string;
      ai_fix?: string;
      fail_steps?: string[];
      pass_tips?: string[];
    };
  }>;
  recommendations: string[];
}

export const analyzeProduct = async (data: ProductData): Promise<AnalysisResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to analyze product:', error);
    throw error;
  }
};

export const regenerateAnalysis = async (data: ProductData): Promise<AnalysisResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/regenerate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to regenerate analysis:', error);
    throw error;
  }
};

export const getSuggestion = async (
  topic: string,
  currentValue: string,
  context?: Record<string, any>
): Promise<{ suggestion: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, current_value: currentValue, context }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get suggestion:', error);
    throw error;
  }
};