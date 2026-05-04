# AgroWater Platform

AgroWater is a comprehensive Django-based GIS platform designed for advanced agricultural monitoring and irrigation management. Specifically optimized for the Nukus district, it integrates real-time satellite imagery and environmental data to provide actionable insights for precise field management.

## Features

* **Interactive GIS Dashboard:** A professional, full-screen map interface providing high-fidelity satellite imagery and floating sidebars for intuitive data visualization and real-time field analysis.
* **Google Earth Engine (GEE) Integration:** Automated retrieval and analysis of critical remote sensing metrics, including NDVI (Normalized Difference Vegetation Index), NDWI (Normalized Difference Water Index), and evapotranspiration data.
* **Smart Irrigation Engine:** An advanced calculation engine that determines precise water requirements and irrigation deficits by combining location-specific GEE satellite data with real-time weather information. Includes a resilient fallback mechanism if satellite data is temporarily unavailable.
* **Field Management:** Tools to manage agricultural fields using polygon coordinates, seamlessly linking physical boundaries to real-time remote sensing analytics.
* **Weather Services:** Integration with weather APIs to provide accurate meteorological context for the irrigation models.
* **Notification System:** Automated alerts to keep users informed about critical field conditions and urgent irrigation needs.

## Technology Stack

* **Backend:** Python, Django, Django REST Framework
* **Remote Sensing:** Google Earth Engine (GEE) Python API
* **Database:** SQLite (default for development)
* **Frontend:** HTML, CSS, Vanilla JavaScript (integrated with GIS mapping libraries)

## Project Modules

* `agrowater/` - Core Django project configuration and settings.
* `dashboard/` - Frontend views, templates, and the main GIS dashboard application.
* `fields/` - Management of field boundaries (polygons), metadata, and GEE data synchronization.
* `gee/` - Dedicated service layer for interacting with the Google Earth Engine API.
* `irrigation/` - The core engine for processing data and calculating irrigation deficits.
* `notifications/` - System for generating and handling user alerts.
* `weather/` - Services for fetching and processing meteorological data.

## Setup and Installation

### Prerequisites
* Python 3.8+
* A valid Google Earth Engine account and authentication credentials.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd AgroWater
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Google Earth Engine:**
   Ensure your environment is authenticated with Google Earth Engine. You may need to run `earthengine authenticate` or configure a service account JSON key depending on your setup.

5. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Seed demo data (Optional but recommended for testing):**
   ```bash
   python manage.py seed_demo
   ```

7. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

8. **Access the application:**
   Open a web browser and navigate to `http://127.0.0.1:8000/`.

## Development Notes
* Ensure that the `earthengine-api` is correctly authenticated before attempting to load field data that relies on GEE metrics.
* The application features a robust fallback mechanism for the irrigation engine to ensure calculations can still be made even if GEE requests time out or fail.

## License

[Add your license information here]
