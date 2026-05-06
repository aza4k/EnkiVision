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

        # 1-usul: Service Account (production)
        key_file = os.environ.get('GEE_KEY_FILE', '')
        service_account = os.environ.get('GEE_SERVICE_ACCOUNT', '')
        if key_file and service_account and os.path.exists(key_file):
            credentials = ee.ServiceAccountCredentials(service_account, key_file)
            ee.Initialize(credentials)
            _GEE_AVAILABLE = True
            logger.info("GEE: Service Account bilan ulandi.")

        else:
            # 2-usul: Application Default Credentials (gcloud auth)
            # Yangi ee versiyalarida project ko'rsatilishi shart
            project_id = os.environ.get('GEE_PROJECT')
            if project_id:
                ee.Initialize(project=project_id)
            else:
                ee.Initialize()
            
            _GEE_AVAILABLE = True
            logger.info("GEE: Default credentials bilan ulandi.")

    except Exception as exc:
        logger.warning(f"GEE ulanmadi (fallback ishlatiladi): {exc}")
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
def get_satellite_indices(
    polygon_coords: list,
    lat: float = 42.45,
    lng: float = 59.60,
    days_back: int = 30,
) -> dict:
    """
    Polygon yoki koordinatalar uchun NDVI va NDWI hisoblaydi.

    Returns:
        {
            'ndvi': float,
            'ndwi': float,
            'source': 'GEE' | 'fallback',
            'image_date': str,
            'cloud_cover': float,
        }
    """
    today = date.today()
    month = today.month
    end_date = today.isoformat()
    start_date = (today - timedelta(days=days_back)).isoformat()

    gee_ok = _init_gee()

    if gee_ok:
        try:
            return _compute_gee_indices(polygon_coords, lat, lng, start_date, end_date)
        except Exception as exc:
            logger.warning(f"GEE hisoblash xatosi: {exc}. Fallback ishlatiladi.")

    # ── Fallback ──
    ndvi = _ndvi_fallback(lat, lng, month)
    ndwi = _ndwi_fallback(lat, lng, ndvi)
    return {
        'ndvi': ndvi,
        'ndwi': ndwi,
        'source': 'fallback',
        'image_date': today.isoformat(),
        'cloud_cover': None,
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
