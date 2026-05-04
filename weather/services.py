import requests
import datetime
from django.utils import timezone

def fetch_real_weather(lat: float, lng: float) -> dict:
    """
    Fetches real weather data from Open-Meteo free API for the given coordinates.
    Returns a dictionary suitable for the IrrigationEngine.
    """
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "Asia/Tashkent",
        "forecast_days": 3
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        current = data.get("current", {})
        daily = data.get("daily", {})

        # Default fallback values if missing
        temp_max = 30.0
        temp_min = 18.0
        humidity = 50.0
        wind = 10.0
        rain = 0.0
        forecast_rain = 0.0

        if current:
            humidity = current.get("relative_humidity_2m", 50.0)
            wind = current.get("wind_speed_10m", 10.0)
            # Use current precipitation as today's rain if available
            rain = current.get("precipitation", 0.0)

        if daily:
            temp_maxes = daily.get("temperature_2m_max", [])
            temp_mins = daily.get("temperature_2m_min", [])
            precip_sums = daily.get("precipitation_sum", [])

            if temp_maxes and len(temp_maxes) > 0:
                temp_max = temp_maxes[0]
            if temp_mins and len(temp_mins) > 0:
                temp_min = temp_mins[0]
            if precip_sums:
                # If current rain is 0, check today's daily sum
                if rain == 0.0 and len(precip_sums) > 0:
                    rain = precip_sums[0]
                # Forecast rain for next 3 days (sum of tomorrow and day after, plus today if not included in current)
                forecast_rain = sum(precip_sums) - rain

        return {
            "temperature_max_c": round(float(temp_max), 1),
            "temperature_min_c": round(float(temp_min), 1),
            "humidity_percent": round(float(humidity), 1),
            "wind_speed_kmh": round(float(wind), 1),
            "rainfall_mm": round(float(rain), 1),
            "forecast_rain_3days_mm": round(float(forecast_rain), 1)
        }

    except Exception:
        # Graceful fallback on network error
        return {
            "temperature_max_c": 30.0,
            "temperature_min_c": 18.0,
            "humidity_percent": 50.0,
            "wind_speed_kmh": 10.0,
            "rainfall_mm": 0.0,
            "forecast_rain_3days_mm": 0.0
        }
