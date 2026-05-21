import logging
import os
from datetime import date
from typing import Optional
from google import genai

logger = logging.getLogger(__name__)


def detect_crop_algorithmic(spectral_data: dict, month: int) -> Optional[str]:
    """
    Expert-defined algorithmic classification using Sentinel-2 spectral signatures.
    Replaces AI entirely for speed and reliability.
    """
    indices = spectral_data.get('indices', {})
    bands = spectral_data.get('bands', {})
    
    ndvi = indices.get('ndvi', 0)
    ndwi = indices.get('ndwi', 0)
    
    # Raw bands (Scale: 0-10000 usually from Sentinel-2 SR)
    b2 = bands.get('B2', 0) # Blue
    b3 = bands.get('B3', 0) # Green
    b4 = bands.get('B4', 0) # Red
    b8 = bands.get('B8', 0) # NIR
    b11 = bands.get('B11', 0) # SWIR 1
    b12 = bands.get('B12', 0) # SWIR 2

    # 1. RICE (Sholi) - Flooded fields have high water index and specific NIR signature
    # In Nukus, rice is flooded from June to August.
    if ndwi > 0.0 or (b8 > 1500 and ndwi > -0.1 and b11 < 1500):
        if 5 <= month <= 9:
            return "rice"

    # 2. WHEAT (Bug'doy) - Winter wheat cycle
    # April-May: Peak greenness. June: Harvest/Yellow.
    if month in (4, 5):
        if ndvi > 0.6: return "wheat"
    if month == 6:
        if ndvi < 0.3 and b11 > 3000: return "wheat" # Dry stubble/Harvested

    # 3. CORN (Makkajo'xori) - Very high biomass in late summer
    if month >= 7 and ndvi > 0.7 and b8 > 3500:
        return "corn"

    # 4. COTTON (Paxta) - Default for the region if it's green and not rice/corn
    if 6 <= month <= 10:
        if ndvi > 0.25:
            # Cotton has moderate moisture, so SWIR is mid-range
            if b11 > 1500:
                return "cotton"

    # 5. VEGETABLES - Usually smaller NDVI and specific Visible spectrum
    if 0.2 <= ndvi <= 0.5 and b3 > b4: # Greener than red
        return "vegetables"

    # Default fallback for Nukus region
    return "cotton"

def detect_crop_type(spectral_data: dict, region_context: str = "Nukus, Uzbekistan") -> Optional[str]:
    """
    100% Algorithmic detection. No AI/API calls.
    Instant performance.
    """
    try:
        if not spectral_data or 'bands' not in spectral_data:
            logger.warning("No spectral data available, falling back to cotton.")
            return "cotton"

        current_month = date.today().month
        
        result = detect_crop_algorithmic(spectral_data, current_month)
        
        # Logging for transparency
        indices = spectral_data.get('indices', {})
        print(f"[CROP-DETECTOR] Result: {result.upper()} (NDVI: {indices.get('ndvi',0):.2f}, NDWI: {indices.get('ndwi',0):.2f})")
        
        return result or "cotton"

    except Exception as exc:
        logger.error(f"Error in algorithmic detection: {exc}")
        return "cotton"

def generate_field_report(field_data: dict, region: str = "Nukus") -> str:
    """
    Field ma'lumotlari asosida to'liq tushunarli Markdown hisobot yaratadi.
    """
    api_key = os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        return "AI xizmati vaqtincha mavjud emas. API kalitni tekshiring."

    try:
        client = genai.Client(api_key=api_key)
        current_date_str = date.today().strftime("%d.%m.%Y")
        
        prompt = f"""
        You are an expert Agricultural Data Analyst for the Aral Sea region.
        Task: Create a beautiful, structured, and easy-to-understand Field Analysis Report in Russian.
        
        Field Data:
        - Crop: {field_data.get('crop_type')}
        - NDVI (Vegetation): {field_data.get('ndvi')}
        - NDWI (Moisture): {field_data.get('ndwi')}
        - Soil Moisture: {field_data.get('soil_moisture')}%
        - Weather: {field_data.get('weather_temp')}°C, {field_data.get('weather_humidity')}% humidity
        - Region: {region}
        - Current Date: {current_date_str}
        
        Structure:
        1. # 🛰️ Состояние поля ({field_data.get('crop_type').capitalize()} — {current_date_str})
        2. ## 🌿 Анализ растительности
        3. ## 💧 Рекомендации по поливу
        4. ## ⚠️ Риски и советы
        
        IMPORTANT:
        - USE REAL DATA provided above. 
        - DO NOT use placeholders like [Текущая дата] or [Data].
        - Translate {field_data.get('crop_type')} to Russian (e.g., Paxta -> Хлопок).
        - Use professional yet simple Russian language.
        - Use emojis and Markdown.
        """

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt]
        )
        return response.text.strip()

    except Exception as e:
        logger.error(f"Report generation error: {e}")
        return "Hisobot tayyorlashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
