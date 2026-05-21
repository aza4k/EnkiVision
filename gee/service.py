"""
GEE Service — Google Earth Engine Integration
==============================================
Sentinel-2 va Landsat orqali haqiqiy NDVI va NDWI qiymatlarini oladi.
GEE ishlamasa, intelligentli fallback ishlatiladi.
"""

import os
import math
import logging
from datetime import date, timedelta

logger = logging.getLogger(__name__)

# ── GEE Initialization ─────────────────────────────────────────────
_GEE_INITIALIZED = False
_GEE_AVAILABLE = False

def _init_gee():
    """GEE ni bir marta ishga tushiradi."""
    global _GEE_INITIALIZED, _GEE_AVAILABLE
    if _GEE_INITIALIZED:
        return _GEE_AVAILABLE

    try:
        import ee
        project_id = os.environ.get('GEE_PROJECT')

        # Simply initialize (ee.Initialize handles checks)
        ee.Initialize(project=project_id)

        _GEE_AVAILABLE = True
        logger.info(f"GEE: Successfully initialized with project {project_id}")
    except Exception as e:
        logger.error(f"GEE: Failed to initialize: {e}")
        _GEE_AVAILABLE = False

    
    _GEE_INITIALIZED = True
    return _GEE_AVAILABLE


# ── NDVI / NDWI Fallback ───────────────────────────────────────────
def _ndvi_fallback(lat: float, lng: float, month: int) -> float:
    """
    Nukus/O'rta Osiyo iqlimiga asoslangan NDVI taxmini.
    Vegetatsiya kalendari: apr–jun o'sish, iyul–avg cho'qqisi, sep–okt pasayish.
    """
    seasonal = {
        1: 0.12, 2: 0.14, 3: 0.22, 4: 0.35, 5: 0.48,
        6: 0.55, 7: 0.58, 8: 0.54, 9: 0.42, 10: 0.28,
        11: 0.16, 12: 0.12,
    }
    base = seasonal.get(month, 0.35)
    # Nukus atrofidagi cho'l koeffitsienti (pastroq NDVI)
    if 58.0 <= lng <= 61.5 and 41.5 <= lat <= 43.0:
        base *= 0.85
    return round(max(0.05, min(0.95, base)), 3)


def _ndwi_fallback(lat: float, lng: float, ndvi: float) -> float:
    """
    NDWI taxmini: Nukus atrofida yuqori aridlik → past NDWI.
    NDWI = (Green - NIR) / (Green + NIR)
    """
    # Cho'l hududida NDWI odatda -0.3 dan -0.1 orasida
    if 58.0 <= lng <= 61.5 and 41.5 <= lat <= 43.0:
        # NDVI past → dala nam emas
        ndwi = -0.3 + ndvi * 0.5
    else:
        ndwi = -0.1 + ndvi * 0.4
    return round(max(-1.0, min(1.0, ndwi)), 3)


# ── Main GEE Functions ─────────────────────────────────────────────
def get_full_spectral_analysis(
    polygon_coords: list,
    lat: float = 42.45,
    lng: float = 59.60,
    days_back: int = 30,
) -> dict:
    """
    Bitta GEE so'rovida barcha spektral ma'lumotlarni oladi.
    Tizimni tezlashtirish uchun optimallashtirilgan.
    """
    today = date.today()
    end_date = today.isoformat()
    start_date = (today - timedelta(days=days_back)).isoformat()

    if not _init_gee():
        # Fallback mantiqi (mavjud koddan foydalanamiz)
        ndvi = _ndvi_fallback(lat, lng, today.month)
        ndwi = _ndwi_fallback(lat, lng, ndvi)
        return {
            'indices': {'ndvi': ndvi, 'ndwi': ndwi},
            'bands': {},
            'source': 'fallback',
            'image_date': end_date,
            'cloud_cover': None
        }

    import ee
    try:
        if polygon_coords and len(polygon_coords) >= 3:
            ring = [[c[1], c[0]] for c in polygon_coords]
            geometry = ee.Geometry.Polygon([ring])
        else:
            geometry = ee.Geometry.Point([lng, lat]).buffer(500)

        # Sentinel-2 Collection
        collection = (
            ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterBounds(geometry)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 25))
            .sort('CLOUDY_PIXEL_PERCENTAGE')
        )

        # Agar Sentinel bo'lmasa Landsat ga o'tish (zaxira)
        if collection.size().getInfo() == 0:
             # Sodda bo'lishi uchun Landsat qismini bu yerda qoldirmaymiz yoki keyinroq qo'shamiz
             # Hozircha bo'sh qaytaramiz yoki Sentinelga ishonamiz
             pass

        image = collection.first()
        
        # Barcha kerakli indekslar va bandlarni bitta rasmga yig'amiz
        # NDVI va NDWI
        ndvi_img = image.normalizedDifference(['B8', 'B4']).rename('ndvi')
        ndwi_img = image.normalizedDifference(['B3', 'B8']).rename('ndwi')
        
        # Bandlar
        spectral_bands = image.select(['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12'])
        
        # Hammasini birlashtirish
        combined = image.addBands([ndvi_img, ndwi_img])
        
        # Region bo'yicha o'rtacha hisoblash (BITTA .getInfo()!)
        stats = combined.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=geometry,
            scale=20,
            maxPixels=1e8
        ).getInfo()

        img_date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd').getInfo()
        cloud_pct = image.get('CLOUDY_PIXEL_PERCENTAGE').getInfo()

        return {
            'indices': {
                'ndvi': round(stats.get('ndvi', 0), 4),
                'ndwi': round(stats.get('ndwi', 0), 4)
            },
            'bands': {k: stats.get(k) for k in ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12']},
            'source': 'GEE',
            'image_date': img_date,
            'cloud_cover': round(float(cloud_pct), 1) if cloud_pct else 0
        }

    except Exception as e:
        logger.warning(f"GEE Optimallashtirilgan hisoblash xatosi: {e}")
        ndvi = _ndvi_fallback(lat, lng, today.month)
        return {
            'indices': {'ndvi': ndvi, 'ndwi': _ndwi_fallback(lat, lng, ndvi)},
            'bands': {},
            'source': 'fallback',
            'image_date': end_date,
            'cloud_cover': None
        }


def get_satellite_indices(
    polygon_coords: list,
    lat: float = 42.45,
    lng: float = 59.60,
    days_back: int = 30,
) -> dict:
    """
    Eski funksiya - endi yangi optimallashtirilgan funksiyadan foydalanadi.
    """
    res = get_full_spectral_analysis(polygon_coords, lat, lng, days_back)
    return {
        'ndvi': res['indices']['ndvi'],
        'ndwi': res['indices']['ndwi'],
        'source': res['source'],
        'image_date': res['image_date'],
        'cloud_cover': res['cloud_cover'],
    }


def _compute_gee_indices(
    polygon_coords: list,
    lat: float,
    lng: float,
    start_date: str,
    end_date: str,
) -> dict:
    """Haqiqiy GEE hisoblash (Sentinel-2 L2A)."""
    import ee

    # Geometriya — polygon yoki point
    if polygon_coords and len(polygon_coords) >= 3:
        # polygon_coords = [[lat,lng], [lat,lng], ...]
        ring = [[c[1], c[0]] for c in polygon_coords]  # GEE: [lng, lat]
        geometry = ee.Geometry.Polygon([ring])
    else:
        geometry = ee.Geometry.Point([lng, lat]).buffer(500)  # 500m radius

    # Sentinel-2 Surface Reflectance
    collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(geometry)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
        .sort('CLOUDY_PIXEL_PERCENTAGE')
    )

    size = collection.size().getInfo()

    if size == 0:
        # Landsat 8 ga urinib ko'rish
        collection = (
            ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
            .filterBounds(geometry)
            .filterDate(start_date, end_date)
            .filter(ee.Filter.lt('CLOUD_COVER', 30))
            .sort('CLOUD_COVER')
        )
        size = collection.size().getInfo()

        if size == 0:
            raise RuntimeError("Hech qanday mos tasvirlar topilmadi.")

        image = collection.first()
        # Landsat 8 bandlari: B4=Red, B5=NIR, B3=Green
        red = image.select('SR_B4').multiply(0.0000275).add(-0.2)
        nir = image.select('SR_B5').multiply(0.0000275).add(-0.2)
        green = image.select('SR_B3').multiply(0.0000275).add(-0.2)
        cloud_pct = image.get('CLOUD_COVER').getInfo() or 0
        img_date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd').getInfo()

    else:
        image = collection.first()
        # Sentinel-2 bandlari: B4=Red, B8=NIR, B3=Green (0–10000 scale)
        red = image.select('B4').divide(10000)
        nir = image.select('B8').divide(10000)
        green = image.select('B3').divide(10000)
        cloud_pct = image.get('CLOUDY_PIXEL_PERCENTAGE').getInfo() or 0
        img_date = ee.Date(image.get('system:time_start')).format('YYYY-MM-dd').getInfo()

    # NDVI = (NIR - Red) / (NIR + Red)
    ndvi_img = nir.subtract(red).divide(nir.add(red)).rename('NDVI')
    # NDWI = (Green - NIR) / (Green + NIR)
    ndwi_img = green.subtract(nir).divide(green.add(nir)).rename('NDWI')

    # O'rtacha qiymatlarni hisoblash
    stats = ndvi_img.addBands(ndwi_img).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=geometry,
        scale=10,
        maxPixels=1e8,
    ).getInfo()

    ndvi_val = stats.get('NDVI')
    ndwi_val = stats.get('NDWI')

    if ndvi_val is None:
        raise RuntimeError("NDVI qiymat olinmadi.")

    return {
        'ndvi': round(float(ndvi_val), 4),
        'ndwi': round(float(ndwi_val), 4) if ndwi_val is not None else _ndwi_fallback(lat, lng, float(ndvi_val)),
        'source': 'GEE',
        'image_date': img_date,
        'cloud_cover': round(float(cloud_pct), 1),
    }


def get_field_thumbnail_url(polygon_coords: list, lat: float, lng: float) -> str:
    """
    Field uchun True Color (RGB) thumbnail URL'ini qaytaradi.
    Gemini API ga yuborish uchun ishlatiladi.
    """
    if not _init_gee():
        return ""

    import ee
    
    if polygon_coords and len(polygon_coords) >= 3:
        ring = [[c[1], c[0]] for c in polygon_coords]
        geometry = ee.Geometry.Polygon([ring])
    else:
        geometry = ee.Geometry.Point([lng, lat]).buffer(500).bounds()

    # Sentinel-2 True Color
    end_date = date.today().isoformat()
    start_date = (date.today() - timedelta(days=90)).isoformat()
    
    collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(geometry)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
        .sort('CLOUDY_PIXEL_PERCENTAGE')
    )

    if collection.size().getInfo() == 0:
        return ""

    image = collection.first().visualize(
        bands=['B4', 'B3', 'B2'],
        min=0,
        max=3000
    )

    return image.getThumbURL({
        'region': geometry,
        'dimensions': 512,
        'format': 'jpg'
    })


def get_field_spectral_profile(polygon_coords: list, lat: float, lng: float) -> dict:
    """
    Field uchun spektral profilni (band qiymatlari) qaytaradi.
    Tekstli AI tahlili uchun ishlatiladi (rasm yubormaslik uchun).
    """
    if not _init_gee():
        return {}

    import ee
    
    if polygon_coords and len(polygon_coords) >= 3:
        ring = [[c[1], c[0]] for c in polygon_coords]
        geometry = ee.Geometry.Polygon([ring])
    else:
        geometry = ee.Geometry.Point([lng, lat]).buffer(300)

    # Sentinel-2 Bands: B2, B3, B4 (Visible), B5, B6, B7 (Red Edge), B8, B8A (NIR), B11, B12 (SWIR)
    collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(geometry)
        .filterDate((date.today() - timedelta(days=45)).isoformat(), date.today().isoformat())
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
        .sort('CLOUDY_PIXEL_PERCENTAGE')
    )

    if collection.size().getInfo() == 0:
        return {}

    image = collection.first()
    
    # Kengaytirilgan bandlar to'plami
    selected_bands = ['B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B11', 'B12']
    stats = image.select(selected_bands).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=geometry,
        scale=20
    ).getInfo()

    # NDVI va NDWI ni ham qo'shamiz
    ndvi = image.normalizedDifference(['B8', 'B4']).reduceRegion(ee.Reducer.mean(), geometry, 20).getInfo().get('nd', 0)
    ndwi = image.normalizedDifference(['B3', 'B8']).reduceRegion(ee.Reducer.mean(), geometry, 20).getInfo().get('nd', 0)

    return {
        'bands': stats,
        'indices': {'ndvi': ndvi, 'ndwi': ndwi},
        'date': image.get('system:time_start').getInfo(),
        'cloud_cover': image.get('CLOUDY_PIXEL_PERCENTAGE').getInfo()
    }


def get_gee_status() -> dict:
    """GEE ulanish holatini qaytaradi."""
    available = _init_gee()
    return {
        'connected': available,
        'status': 'online' if available else 'offline',
        'mode': 'GEE Sentinel-2/Landsat' if available else 'Seasonal Fallback',
    }

def get_layer_tile_urls() -> dict:
    """Xarita uchun NDVI va NDWI qatlamlarining URL manzilini qaytaradi."""
    if not _init_gee():
        raise RuntimeError("GEE ulanmagan")

    import ee
    today = date.today()
    start_date = (today - timedelta(days=30)).isoformat()
    end_date = today.isoformat()

    geometry = ee.Geometry.Rectangle([59.3, 42.2, 59.9, 42.7])

    collection = (
        ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
        .filterBounds(geometry)
        .filterDate(start_date, end_date)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
        .median()
    )

    ndvi = collection.normalizedDifference(['B8', 'B4'])
    ndwi = collection.normalizedDifference(['B3', 'B8'])

    ndvi_vis = {'min': 0, 'max': 0.8, 'palette': ['white', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2', '#006837', '#004000']}
    ndwi_vis = {'min': -0.3, 'max': 0.3, 'palette': ['#d73027', '#f46d43', '#fdae61', '#fee08b', 'white', '#74add1', '#4575b4', '#313695']}

    ndvi_mapid = ndvi.getMapId(ndvi_vis)
    ndwi_mapid = ndwi.getMapId(ndwi_vis)

    return {
        'ndvi': ndvi_mapid['tile_fetcher'].url_format,
        'ndwi': ndwi_mapid['tile_fetcher'].url_format,
    }
