import os
import sys

# Project path
path = '/home/YOUR_USERNAME/AgroWater'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'agrowater.settings'

# GEE Project ID (PythonAnywhere dashboardda ENV orqali o'rnatsa ham bo'ladi)
# os.environ['GEE_PROJECT'] = 'your-project-id'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
