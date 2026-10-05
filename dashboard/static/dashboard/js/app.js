/**
 * Verdanté — Enterprise Agricultural Water Management Platform
 * ==============================================================
 * Satellite Telemetry (Sentinel-2 L2A), Soil Moisture & Weather Intelligence
 */

(function () {
    'use strict';

    // ── Multi-Language Dictionaries (RU Primary / Default) ──────
    const i18n = {
        ru: {
            appName: 'Verdanté',
            brandSubtitle: 'Интеллектуальный агро-мониторинг',
            totalFields: 'Полей',
            irrigationNeed: 'Полив',
            criticalAlerts: 'Критично',
            fieldsTab: 'Поля',
            alertsTab: 'Уведомления',
            searchPlaceholder: 'Поиск контура или культуры...',
            legendNorm: 'Норма',
            legendLow: 'Низкий',
            legendMed: 'Средний',
            legendHigh: 'Высокий',
            addFieldBtn: 'Добавить контур',
            loadingFields: 'Загрузка агро-контуров...',
            loadingAlerts: 'Загрузка оперативных сводок...',
            noAlerts: 'Активных агрономических предупреждений нет',
            railMap: 'Карта',
            railLayers: 'Слои',
            railAnalytics: 'Аналитика',
            railDraw: 'Создать контур',
            railSettings: 'Настройки',
            geeOnline: 'GEE Активен',
            geeFallback: 'GEE Ожидание',
            mm: 'мм',
            liters: 'л',
            hours: 'ч',
            ha: 'га',
            currency: 'сум',
            irrigationRequired: 'Полив требуется',
            noIrrigationNeeded: 'Полив не требуется',
            irrigationNorm: 'Норма полива',
            optimalWindow: 'Оптимальное окно',
            durationLabel: 'Длительность',
            soilMoisture: 'Влажность почвы',
            weatherTelemetry: 'Метеосводка',
            rainLabel: 'Осадки',
            windLabel: 'Ветер',
            spectralIndices: 'Спектральные индексы Sentinel-2',
            ndviTitle: 'Вегетационный индекс NDVI',
            ndwiTitle: 'Индекс влажности NDWI',
            ndsiTitle: 'Индекс засоления NDSI',
            agroParams: 'Агротехнические параметры',
            cropLabel: 'Культура',
            stageLabel: 'Фаза вегетации',
            areaLabel: 'Площадь',
            systemLabel: 'Система полива',
            savedWater: 'Экономия воды',
            savedCost: 'Экономический эффект',
            imageryDate: 'Дата снимка',
            expertAnalysisBtn: 'Агрономическая экспертиза',
            expertReportTitle: 'Агрономическое заключение',
            collapseBtn: 'Свернуть',
            analyzingTelemetry: 'Обработка спектральных каналов Sentinel-2 и расчет водного баланса...',
            footerNote: 'Расчет выполнен по стандарту FAO-56 Penman-Monteith и данным Sentinel-2',
            deleteConfirm: 'Удалить выбранный контур из системы мониторинга?',
            drawPrompt: 'Очертите границы поля на карте',
            centeredNukus: 'Карта центрирована по Нукусскому району',
            allFieldsShown: 'Все контуры отображены на карте',
            fieldCreated: 'Контур успешно сохранен и проанализирован',
            fieldDeleted: 'Контур удален',
            createTitle: 'Контур поля',
            createSubtitle: 'Автоматический расчет площади и спектральных индексов Sentinel-2',
            createFieldName: 'Название контура',
            createRegion: 'Район / Область',
            createSystem: 'Система орошения',
            createSubmit: 'Запустить спутниковый анализ',
            processing: 'Обработка...',
            refreshing: 'Обновление...',
            deleting: 'Удаление...',
            noData: 'Нет данных для этого контура',
            baseMapSelected: 'Базовая карта активирована',
            layerAdded: 'Слой добавлен на карту',
            layerRemoved: 'Слой отключен',
            layersModalTitle: 'Слои карты и Sentinel-2',
            baseLayersTitle: 'Базовые картографические подложки',
            sentinelLayersTitle: 'Спектральные агро-слои Sentinel-2',
            analyticsTitle: 'Региональная агро-аналитика',
            analyticsMonitoredFields: 'Мониторинг контуров',
            analyticsAvgDemand: 'Средняя потребность в воде',
            analyticsSavings: 'Экономия ресурсов',
            analyticsCriticalNeed: 'Критический статус',
            analyticsStressDist: 'Распределение водного стресса почв',
            analyticsCropDist: 'Распределение площадей по культурам',
            analyticsHighDemand: 'Наибольшая потребность в орошении',
            settingsTitle: 'Системные параметры',
            settingsLangLabel: 'Язык интерфейса',
            langSubRu: 'Основной язык',
            langSubUz: 'Lotin yozuvi',
            langSubEn: 'Global mode',
            settingsRegionLabel: 'Регион мониторинга',
            settingsMoistureLabel: 'Критический порог влажности почвы (%)',
            settingsSalinityLabel: 'Порог засоления почв (EC, dS/m)',
            settingsIntervalLabel: 'Интервал обновления Sentinel-2',
            settingsStatusHeader: 'Состояние подключения Sentinel-2 Hub',
            settingsStatusSubtitle: 'Канал данных активен',
            settingsBtnRefreshText: 'Проверить',
            detectCropBtn: 'Определить по Sentinel-2',
            detectingCrop: 'Анализ спектра Sentinel-2...',
            cropIdentifiedToast: 'Культура определена: ',
            cropConfidence: 'точность'
        },
        uz: {
            appName: 'Verdanté',
            brandSubtitle: 'Aqlli agronomik suv monitoringi',
            totalFields: 'Dalalar',
            irrigationNeed: 'Sug\'orish',
            criticalAlerts: 'Kritik',
            fieldsTab: 'Dalalar',
            alertsTab: 'Xabarnomalar',
            searchPlaceholder: 'Dala yoki ekin qidirish...',
            legendNorm: 'Norma',
            legendLow: 'Past',
            legendMed: 'O\'rta',
            legendHigh: 'Yuqori',
            addFieldBtn: 'Yangi dala qo\'shish',
            loadingFields: 'Dala ma\'lumotlari yuklanmoqda...',
            loadingAlerts: 'Xabarnomalar yuklanmoqda...',
            noAlerts: 'Faol agronomik xabarnomalar mavjud emas',
            mm: 'mm',
            liters: 'l',
            hours: 'soat',
            ha: 'ga',
            currency: 'so\'m',
            irrigationRequired: 'Sug\'orish talab etiladi',
            noIrrigationNeeded: 'Sug\'orish talab etilmaydi',
            irrigationNorm: 'Sug\'orish me\'yori',
            optimalWindow: 'Optimal vaqt oralig\'i',
            durationLabel: 'Davomiyligi',
            soilMoisture: 'Tuproq namligi',
            weatherTelemetry: 'Ob-havo ma\'lumotlari',
            rainLabel: 'Yog\'ingarchilik',
            windLabel: 'Shamol',
            spectralIndices: 'Sentinel-2 spektral ko\'rsatkichlari',
            ndviTitle: 'Vegetatsiya ko\'rsatkichi NDVI',
            ndwiTitle: 'Namlik ko\'rsatkichi NDWI',
            ndsiTitle: 'Sho\'rlanish ko\'rsatkichi NDSI',
            agroParams: 'Agrotexnik parametrlar',
            cropLabel: 'Ekin turi',
            stageLabel: 'Vegetatsiya fazasi',
            areaLabel: 'Maydon o\'lchami',
            systemLabel: 'Sug\'orish tizimi',
            savedWater: 'Suv tejamkorligi',
            savedCost: 'Iqtisodiy samara',
            imageryDate: 'Surat sanasi',
            expertAnalysisBtn: 'Agronomik ekspertiza',
            expertReportTitle: 'Agronomik ekspert xulosasi',
            collapseBtn: 'Yopish',
            analyzingTelemetry: 'Sentinel-2 spektral kanallari va suv balansi tahlil qilinmoqda...',
            footerNote: 'Hisob-kitoblar FAO-56 Penman-Monteith standarti va Sentinel-2 ma\'lumotlariga asoslangan',
            deleteConfirm: 'Ushbu dalani monitoring tizimidan o\'chirishni tasdiqlaysizmi?',
            drawPrompt: 'Dala chegarasini xaritada belgilang',
            centeredNukus: 'Xarita Nukus tumaniga markazlashtirildi',
            allFieldsShown: 'Barcha dalalar xaritada ko\'rsatildi',
            fieldCreated: 'Dala muvaffaqiyatli saqlandi va tahlil qilindi',
            fieldDeleted: 'Dala o\'chirildi',
            createTitle: 'Dala chegarasi',
            createSubtitle: 'Maydon o\'lchami va Sentinel-2 spektral indekslari avtomatik hisoblanadi',
            createFieldName: 'Dala nomi',
            createRegion: 'Hudud / Viloyat',
            createSystem: 'Sug\'orish usuli',
            createSubmit: 'Tahlilni boshlash',
            processing: 'Ishlanmoqda...',
            refreshing: 'Yangilanmoqda...',
            deleting: 'O\'chirilmoqda...',
            noData: 'Bu dala uchun ma\'lumot topilmadi',
            baseMapSelected: 'Xarita foni o\'zgartirildi',
            layerAdded: 'Qatlam xaritaga qo\'shildi',
            layerRemoved: 'Qatlam o\'chirildi',
            layersModalTitle: 'Xarita va Sentinel-2 qatlamlari',
            baseLayersTitle: 'Asosiy xarita fonlari',
            sentinelLayersTitle: 'Sentinel-2 agro-qatlamlari',
            analyticsTitle: 'Hududiy agronomik analitika',
            analyticsMonitoredFields: 'Monitoring dalalari',
            analyticsAvgDemand: 'O\'rtacha suv talabi',
            analyticsSavings: 'Iqtisodiy tejash',
            analyticsCriticalNeed: 'Kritik ehtiyoj',
            analyticsStressDist: 'Ekinlar va tuproq stressi taqsimoti',
            analyticsCropDist: 'Ekin turlari maydonlari',
            analyticsHighDemand: 'Eng yuqori suv talabi',
            settingsTitle: 'Tizim sozlamalari',
            settingsLangLabel: 'Tizim tili',
            langSubRu: 'Rus tili',
            langSubUz: 'Lotin yozuvi',
            langSubEn: 'Ingliz tili',
            settingsRegionLabel: 'Asosiy monitoring hududi',
            settingsMoistureLabel: 'Kritik tuproq namligi chegarasi (%)',
            settingsSalinityLabel: 'Sho\'rlanish xavfi chegarasi (EC, dS/m)',
            settingsIntervalLabel: 'Sentinel-2 yangilanish davri',
            settingsStatusHeader: 'Sentinel-2 Hub ulanish holati',
            settingsStatusSubtitle: 'Ma\'lumotlar kanali faol',
            settingsBtnRefreshText: 'Tekshirish',
            detectCropBtn: 'Sentinel-2 orqali aniqlash',
            detectingCrop: 'Sentinel-2 spektral tahlili...',
            cropIdentifiedToast: 'Ekin turi aniqlandi: ',
            cropConfidence: 'aniqlik'
        },
        en: {
            appName: 'Verdanté',
            brandSubtitle: 'Smart Agronomic Water Intelligence',
            totalFields: 'Fields',
            irrigationNeed: 'Irrigation',
            criticalAlerts: 'Critical',
            fieldsTab: 'Fields',
            alertsTab: 'Alerts',
            searchPlaceholder: 'Search fields or crops...',
            legendNorm: 'Normal',
            legendLow: 'Low',
            legendMed: 'Medium',
            legendHigh: 'High',
            addFieldBtn: 'Add Field',
            loadingFields: 'Loading field telemetry...',
            loadingAlerts: 'Loading active alerts...',
            noAlerts: 'No active agronomic alerts',
            mm: 'mm',
            liters: 'L',
            hours: 'hrs',
            ha: 'ha',
            currency: 'UZS',
            irrigationRequired: 'Irrigation Required',
            noIrrigationNeeded: 'No Irrigation Needed',
            irrigationNorm: 'Irrigation Depth',
            optimalWindow: 'Optimal Window',
            durationLabel: 'Duration',
            soilMoisture: 'Soil Moisture',
            weatherTelemetry: 'Weather Telemetry',
            rainLabel: 'Rain',
            windLabel: 'Wind',
            spectralIndices: 'Sentinel-2 Spectral Indices',
            ndviTitle: 'Vegetation Index NDVI',
            ndwiTitle: 'Moisture Index NDWI',
            ndsiTitle: 'Salinity Index NDSI',
            agroParams: 'Agronomic Parameters',
            cropLabel: 'Crop Type',
            stageLabel: 'Growth Stage',
            areaLabel: 'Field Area',
            systemLabel: 'Irrigation System',
            savedWater: 'Water Conservation',
            savedCost: 'Economic Impact',
            imageryDate: 'Telemetry Date',
            expertAnalysisBtn: 'Agronomic Assessment',
            expertReportTitle: 'Agronomic Assessment Report',
            collapseBtn: 'Collapse',
            analyzingTelemetry: 'Processing Sentinel-2 spectral bands and FAO-56 water balance...',
            footerNote: 'Calculated using FAO-56 Penman-Monteith methodology and Sentinel-2 telemetry',
            deleteConfirm: 'Are you sure you want to remove this field from monitoring?',
            drawPrompt: 'Draw field boundary polygon on the map',
            centeredNukus: 'Map centered on Nukus district',
            allFieldsShown: 'All fields fitted to view',
            fieldCreated: 'Field successfully saved and analyzed',
            fieldDeleted: 'Field deleted',
            createTitle: 'Field Boundary',
            createSubtitle: 'Automatic area calculation and Sentinel-2 multispectral processing',
            createFieldName: 'Field Name',
            createRegion: 'Region / District',
            createSystem: 'Irrigation Method',
            createSubmit: 'Launch Telemetry Analysis',
            processing: 'Processing...',
            refreshing: 'Refreshing...',
            deleting: 'Deleting...',
            noData: 'No telemetry data for this field',
            baseMapSelected: 'Base map updated',
            layerAdded: 'Layer added to map',
            layerRemoved: 'Layer disabled',
            layersModalTitle: 'Map Layers and Sentinel-2',
            baseLayersTitle: 'Base Maps',
            sentinelLayersTitle: 'Sentinel-2 Agro-Layers',
            analyticsTitle: 'Regional Agro Analytics',
            analyticsMonitoredFields: 'Monitored Fields',
            analyticsAvgDemand: 'Average Water Demand',
            analyticsSavings: 'Resource Savings',
            analyticsCriticalNeed: 'Critical Status',
            analyticsStressDist: 'Soil & Crop Stress Distribution',
            analyticsCropDist: 'Crop Area Distribution',
            analyticsHighDemand: 'Highest Irrigation Demand',
            settingsTitle: 'System Settings',
            settingsLangLabel: 'Interface Language',
            langSubRu: 'Russian (Primary)',
            langSubUz: 'Uzbek (Latin)',
            langSubEn: 'English (Global)',
            settingsRegionLabel: 'Primary Monitoring Region',
            settingsMoistureLabel: 'Critical Soil Moisture Threshold (%)',
            settingsSalinityLabel: 'Soil Salinity Threshold (EC, dS/m)',
            settingsIntervalLabel: 'Sentinel-2 Refresh Cycle',
            settingsStatusHeader: 'Sentinel-2 Hub Connectivity',
            settingsStatusSubtitle: 'Data channel active',
            settingsBtnRefreshText: 'Verify',
            detectCropBtn: 'Detect via Sentinel-2',
            detectingCrop: 'Analyzing Sentinel-2...',
            cropIdentifiedToast: 'Crop identified: ',
            cropConfidence: 'confidence'
        }
    };

    const cropMap = {
        ru: { cotton: 'Хлопок', wheat: 'Пшеница', corn: 'Кукуруза', rice: 'Рис', vegetables: 'Овощи', other: 'Агрокультура' },
        uz: { cotton: 'Paxta', wheat: 'Bug\'doy', corn: 'Makkajo\'xori', rice: 'Sholi', vegetables: 'Sabzavotlar', other: 'Ekin' },
        en: { cotton: 'Cotton', wheat: 'Wheat', corn: 'Corn', rice: 'Rice', vegetables: 'Vegetables', other: 'Crop' }
    };

    const stageMap = {
        ru: { seedling: 'Всходы', vegetative: 'Вегетация', flowering: 'Цветение', ripening: 'Созревание', harvest: 'Уборка' },
        uz: { seedling: 'Nihol', vegetative: 'Vegetatsiya', flowering: 'Gullash', ripening: 'Pishish', harvest: 'Hosil' },
        en: { seedling: 'Seedling', vegetative: 'Vegetative', flowering: 'Flowering', ripening: 'Ripening', harvest: 'Harvest' }
    };

    const systemMap = {
        ru: { drip: 'Капельное орошение', furrow: 'Бороздковый полив', sprinkler: 'Дождевание', flood: 'Затопление' },
        uz: { drip: 'Tomchilatib sug\'orish', furrow: 'Borozdali sug\'orish', sprinkler: 'Yomg\'irlatish', flood: 'To\'ldirish usuli' },
        en: { drip: 'Drip Irrigation', furrow: 'Furrow Irrigation', sprinkler: 'Sprinkler Irrigation', flood: 'Flood Irrigation' }
    };

    const statusMap = {
        ru: {
            healthy: 'В норме', moderate_stress: 'Умеренный стресс', severe_stress: 'Высокий стресс',
            good: 'Хорошее', needs_attention: 'Требует внимания', critical: 'Критическое',
            wet: 'Влажно', moist: 'Умеренно влажно', dry: 'Сухо', very_dry: 'Засуха',
            optimal: 'Оптимально', critical_tag: 'Критично', warning_tag: 'Внимание', info_tag: 'Информация'
        },
        uz: {
            healthy: 'Me\'yorda', moderate_stress: 'O\'rtacha stress', severe_stress: 'Yuqori stress',
            good: 'Yaxshi', needs_attention: 'E\'tibor talab', critical: 'Kritik',
            wet: 'Serob', moist: 'Mo\'tadil nam', dry: 'Quruq', very_dry: 'Qurg\'oqchil',
            optimal: 'Optimal', critical_tag: 'Kritik', warning_tag: 'Diqqat', info_tag: 'Axborot'
        },
        en: {
            healthy: 'Normal', moderate_stress: 'Moderate Stress', severe_stress: 'High Stress',
            good: 'Good', needs_attention: 'Needs Attention', critical: 'Critical',
            wet: 'Wet', moist: 'Moderately Moist', dry: 'Dry', very_dry: 'Severe Drought',
            optimal: 'Optimal', critical_tag: 'Critical', warning_tag: 'Warning', info_tag: 'Info'
        }
    };

    const regionsDict = {
        ru: {
            Nukus: 'Нукусский район, Каракалпакстан',
            Karakalpakstan: 'Республика Каракалпакстан',
            Khorezm: 'Хорезмская область',
            Tashkent: 'Ташкентская область',
            Navoiy: 'Навоийская область',
            Samarkand: 'Самаркандская область',
            Bukhara: 'Бухарская область',
            Fergana: 'Ферганская область',
            Andijan: 'Андижанская область',
            Namangan: 'Наманганская область',
            Kashkadarya: 'Кашкадарьинская область',
            Surkhandarya: 'Сурхандарьинская область',
            Syrdarya: 'Сырдарьинская область',
            Jizzakh: 'Джизакская область'
        },
        uz: {
            Nukus: 'Nukus tumani, Qoraqalpog\'iston',
            Karakalpakstan: 'Qoraqalpog\'iston Respublikasi',
            Khorezm: 'Xorazm viloyati',
            Tashkent: 'Toshkent viloyati',
            Navoiy: 'Navoiy viloyati',
            Samarkand: 'Samarqand viloyati',
            Bukhara: 'Buxoro viloyati',
            Fergana: 'Farg\'ona viloyati',
            Andijan: 'Andijon viloyati',
            Namangan: 'Namangan viloyati',
            Kashkadarya: 'Qashqadaryo viloyati',
            Surkhandarya: 'Surxondaryo viloyati',
            Syrdarya: 'Sirdaryo viloyati',
            Jizzakh: 'Jizzax viloyati'
        },
        en: {
            Nukus: 'Nukus District, Karakalpakstan',
            Karakalpakstan: 'Republic of Karakalpakstan',
            Khorezm: 'Khorezm Region',
            Tashkent: 'Tashkent Region',
            Navoiy: 'Navoiy Region',
            Samarkand: 'Samarkand Region',
            Bukhara: 'Bukhara Region',
            Fergana: 'Fergana Region',
            Andijan: 'Andijan Region',
            Namangan: 'Namangan Region',
            Kashkadarya: 'Kashkadarya Region',
            Surkhandarya: 'Surkhandarya Region',
            Syrdarya: 'Syrdarya Region',
            Jizzakh: 'Jizzakh Region'
        }
    };

    const layersData = {
        ru: {
            baseEsri: { title: 'ArcGIS Satellite', desc: 'Спутниковая съемка высокого разрешения' },
            baseGoogle: { title: 'Google Hybrid', desc: 'Спутник с контурной разметкой' },
            baseOsm: { title: 'OpenStreetMap', desc: 'Топографическая векторная карта дорог' },
            ndvi: { title: 'Индекс вегетации NDVI', desc: 'Плотность фотосинтетической биомассы' },
            ndwi: { title: 'Индекс влажности NDWI', desc: 'Влагосодержание растительного покрова' },
            ndsi: { title: 'Индекс засоления NDSI', desc: 'Степень засоления пахотного горизонта' },
            evi: { title: 'Улучшенный индекс EVI', desc: 'Коррекция атмосферных искажений' },
            savi: { title: 'Почвенный индекс SAVI', desc: 'Калибровка для разреженного покрова' },
            rededge: { title: 'Хлорофилл Red-Edge', desc: 'Концентрация хлорофилла и стресс' },
            swir: { title: 'Коротковолновый спектр SWIR', desc: 'Оценка дефицита почвенной влаги' },
            borders: { title: 'Административные границы', desc: 'Районное деление и ориентиры' }
        },
        uz: {
            baseEsri: { title: 'ArcGIS Satellite', desc: 'Yuqori aniqlikdagi sun\'iy yo\'ldosh tasviri' },
            baseGoogle: { title: 'Google Hybrid', desc: 'Sun\'iy yo\'ldosh va chegaralar' },
            baseOsm: { title: 'OpenStreetMap', desc: 'Topografik ko\'chalar xaritasi' },
            ndvi: { title: 'Vegetatsiya ko\'rsatkichi NDVI', desc: 'Fotosintez faolligi va biomassa zichligi' },
            ndwi: { title: 'Namlik ko\'rsatkichi NDWI', desc: 'O\'simlik to\'qimalaridagi suv miqdori' },
            ndsi: { title: 'Sho\'rlanish ko\'rsatkichi NDSI', desc: 'Tuproq haydalma qatlami sho\'rlanishi' },
            evi: { title: 'Kengaytirilgan indeks EVI', desc: 'Atmosfera xatoliklari hisobga olingan ko\'rsatkich' },
            savi: { title: 'Tuproq indeksi SAVI', desc: 'Siyrak ekin maydonlari uchun aniqlashtirilgan' },
            rededge: { title: 'Xlorofill Red-Edge', desc: 'Xlorofill konsentratsiyasi va o\'simlik stressi' },
            swir: { title: 'Qisqa to\'lqinli SWIR spektri', desc: 'Tuproq namligi taqchilligi tahlili' },
            borders: { title: 'Ma\'muriy chegaralar', desc: 'Tuman chegaralari va hudud nomlari' }
        },
        en: {
            baseEsri: { title: 'ArcGIS Satellite', desc: 'High-resolution satellite imagery' },
            baseGoogle: { title: 'Google Hybrid', desc: 'Satellite imagery with boundary overlay' },
            baseOsm: { title: 'OpenStreetMap', desc: 'Topographic road and terrain map' },
            ndvi: { title: 'Vegetation Index NDVI', desc: 'Photosynthetic biomass density' },
            ndwi: { title: 'Moisture Index NDWI', desc: 'Canopy water content and turgor' },
            ndsi: { title: 'Salinity Index NDSI', desc: 'Topsoil salinity and mineral deposit risk' },
            evi: { title: 'Enhanced Vegetation Index EVI', desc: 'Atmospheric correction adjusted' },
            savi: { title: 'Soil Adjusted Index SAVI', desc: 'Calibrated for sparse canopy cover' },
            rededge: { title: 'Chlorophyll Red-Edge', desc: 'Chlorophyll absorption and vigor' },
            swir: { title: 'Shortwave SWIR Spectrum', desc: 'Soil moisture deficit detection' },
            borders: { title: 'Administrative Boundaries', desc: 'District lines and geographical markers' }
        }
    };

    const intervalData = {
        ru: {
            '5': 'Каждые 5 дней, орбитальный виток Sentinel-2',
            '1': 'Ежедневно, интерполяция метеомодели'
        },
        uz: {
            '5': 'Har 5 kunda, Sentinel-2 orbital parvozi',
            '1': 'Har kuni, meteo-model interpolyatsiyasi'
        },
        en: {
            '5': 'Every 5 days, Sentinel-2 orbital pass',
            '1': 'Daily, weather model interpolation'
        }
    };

    // ── Global Application State ─────────────────────────────
    let currentLang = localStorage.getItem('enki_lang') || 'ru';
    let dashboardData = null;
    let map = null;
    let fieldMarkers = [];
    let currentSelectedFieldId = null;
    let currentSelectedFieldObj = null;

    let baseLayers = {};
    let currentBaseKey = 'esri';
    let bordersLayer = null;
    let sentinelOverlays = {
        ndvi: null,
        ndwi: null,
        ndsi: null,
        evi: null,
        savi: null,
        rededge: null,
        swir: null,
        borders: null
    };

    let drawControl = null;
    let tempDrawnLayer = null;
    let currentDrawingCoords = null;

    // ── Init ─────────────────────────────────────────────────
    function initApp() {
        initMap();
        initLanguage();
        updateClock();
        setInterval(updateClock, 30000);
        fetchDashboardData();
        fetchGeeStatus();
        setInterval(fetchGeeStatus, 120000);

        const searchEl = document.getElementById('fieldSearch');
        if (searchEl) {
            searchEl.addEventListener('input', (e) => {
                filterFieldList(e.target.value.toLowerCase());
            });
        }

        // Dual Stage Modal Listeners
        const stageCloseBtn = document.getElementById('stageCloseBtn');
        if (stageCloseBtn) stageCloseBtn.addEventListener('click', closeFieldStage);
        
        const stageOverlay = document.getElementById('fieldStageOverlay');
        if (stageOverlay) {
            stageOverlay.addEventListener('click', (e) => {
                if (e.target === stageOverlay) closeFieldStage();
            });
        }

        const stageRefreshBtn = document.getElementById('stageRefreshBtn');
        if (stageRefreshBtn) stageRefreshBtn.addEventListener('click', handleFieldRefresh);

        const stageDeleteBtn = document.getElementById('stageDeleteBtn');
        if (stageDeleteBtn) stageDeleteBtn.addEventListener('click', handleFieldDelete);

        const stageAnalyzeBtn = document.getElementById('stageAnalyzeTriggerBtn');
        if (stageAnalyzeBtn) stageAnalyzeBtn.addEventListener('click', handleSideBySideAnalysis);

        const stageCollapseBtn = document.getElementById('stageCollapseBtn');
        if (stageCollapseBtn) stageCollapseBtn.addEventListener('click', collapseSideBySideAnalysis);

        const stageDetectCropBtn = document.getElementById('stageDetectCropBtn');
        if (stageDetectCropBtn) stageDetectCropBtn.addEventListener('click', handleDetectCrop);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeFieldStage();
                if (window.enki) window.enki.closeAllModals();
            }
        });

        // Create Panel
        const cpClose = document.getElementById('createPanelClose');
        if (cpClose) cpClose.addEventListener('click', closeCreatePanel);
        const addBtn = document.getElementById('add-field-btn');
        if (addBtn) addBtn.addEventListener('click', enableDrawingMode);

        const cForm = document.getElementById('createFieldForm');
        if (cForm) cForm.addEventListener('submit', handleFieldCreate);

        setupRailControls();
        setupSettingsLanguageControls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    // ── Language Controller ──────────────────────────────────
    function initLanguage() {
        applyLanguage(currentLang);
    }

    function setupSettingsLanguageControls() {
        document.querySelectorAll('#settingsLangGrid .settings-lang-card').forEach(card => {
            card.addEventListener('click', () => {
                const lang = card.dataset.lang;
                if (lang && lang !== currentLang) {
                    setLanguage(lang);
                }
            });
        });
    }

    function setLanguage(lang) {
        if (!i18n[lang]) return;
        currentLang = lang;
        localStorage.setItem('enki_lang', lang);
        applyLanguage(lang);
        
        // Re-render dynamic lists with new language
        if (dashboardData && dashboardData.fields) {
            renderFieldList(dashboardData.fields);
            renderAlertFeed(dashboardData.fields);
            renderMapMarkers(dashboardData.fields);
        }
        if (currentSelectedFieldObj) {
            populateFieldStage(currentSelectedFieldObj);
        }
    }

    function applyLanguage(lang) {
        const dict = i18n[lang] || i18n.ru;

        // Settings cards active state
        document.querySelectorAll('#settingsLangGrid .settings-lang-card').forEach(card => {
            card.classList.toggle('active', card.dataset.lang === lang);
        });

        // Brand Subtitle / Header
        setElText('chipTotalFieldsLabel', dict.totalFields);
        setElText('chipFieldsNeedingLabel', dict.irrigationNeed);
        setElText('chipCriticalAlertsLabel', dict.criticalAlerts);
        setElText('tabFieldsText', dict.fieldsTab);
        setElText('tabAlertsText', dict.alertsTab);
        
        const searchInput = document.getElementById('fieldSearch');
        if (searchInput) searchInput.placeholder = dict.searchPlaceholder;

        // Legend
        setElText('legendNormText', dict.legendNorm);
        setElText('legendLowText', dict.legendLow);
        setElText('legendMedText', dict.legendMed);
        setElText('legendHighText', dict.legendHigh);
        setElText('addFieldBtnText', dict.addFieldBtn);

        // Rail Tooltips
        setElText('railMapTip', dict.railMap);
        setElText('railLayersTip', dict.railLayers);
        setElText('railAnalyticsTip', dict.railAnalytics);
        setElText('railDrawTip', dict.railDraw);
        setElText('railSettingsTip', dict.railSettings);

        // Create Panel
        setElText('createPanelTitle', dict.createTitle);
        setElText('createPanelSubtitle', dict.createSubtitle);
        setElText('lblNewFieldName', dict.createFieldName);
        setElText('lblNewFieldRegion', dict.createRegion);
        setElText('lblNewFieldSystem', dict.createSystem);
        setElText('createSubmitText', dict.createSubmit);

        // Update Select dropdowns in Create Panel
        updateSelectOptions('newFieldRegion', regionsDict[lang] || regionsDict.ru);
        updateSelectOptions('newFieldSystem', systemMap[lang] || systemMap.ru);

        // Dual Stage Modal Labels
        setElText('kpiNormLabel', dict.irrigationNorm);
        setElText('kpiNormUnit', dict.mm);
        setElText('kpiTimeLabel', dict.optimalWindow);
        setElText('kpiSoilLabel', dict.soilMoisture);
        setElText('kpiWeatherLabel', dict.weatherTelemetry);
        setElText('secSpectralTitle', dict.spectralIndices);
        setElText('meterNdviName', dict.ndviTitle);
        setElText('meterNdwiName', dict.ndwiTitle);
        setElText('meterNdsiName', dict.ndsiTitle);
        setElText('secAgroTitle', dict.agroParams);
        setElText('pairCropKey', dict.cropLabel);
        setElText('detectCropBtnText', dict.detectCropBtn);
        setElText('pairStageKey', dict.stageLabel);
        setElText('pairAreaKey', dict.areaLabel);
        setElText('pairSystemKey', dict.systemLabel);
        setElText('savWaterLbl', dict.savedWater);
        setElText('savCostLbl', dict.savedCost);
        setElText('savDateLbl', dict.imageryDate);
        setElText('stageAnalyzeBtnText', dict.expertAnalysisBtn);
        setElText('analysisPanelTitle', dict.expertReportTitle);
        setElText('collapseBtnText', dict.collapseBtn);
        setElText('analysisLoadingText', dict.analyzingTelemetry);
        setElText('analysisFooterNote', dict.footerNote);

        // Layers Modal
        setElText('layersModalTitle', dict.layersModalTitle);
        setElText('baseLayersTitle', dict.baseLayersTitle);
        setElText('sentinelLayersTitle', dict.sentinelLayersTitle);
        updateLayersModalCards(lang);

        // Settings Modal
        setElText('settingsModalTitle', dict.settingsTitle);
        setElText('settingLangLabel', dict.settingsLangLabel);
        setElText('langSubRu', dict.langSubRu);
        setElText('langSubUz', dict.langSubUz);
        setElText('langSubEn', dict.langSubEn);
        setElText('settingRegionLabel', dict.settingsRegionLabel);
        setElText('settingMoistureLabel', dict.settingsMoistureLabel);
        setElText('settingSalinityLabel', dict.settingsSalinityLabel);
        setElText('settingIntervalLabel', dict.settingsIntervalLabel);
        setElText('settingStatusHeader', dict.settingsStatusHeader);
        setElText('settingStatusSubtitle', dict.settingsStatusSubtitle);
        setElText('settingBtnRefreshText', dict.settingsBtnRefreshText);
        updateSelectOptions('settingRegionSelect', regionsDict[lang] || regionsDict.ru);
        updateSelectOptions('settingGeeInterval', intervalData[lang] || intervalData.ru);

        // Analytics Modal Title
        setElText('analyticsModalTitle', dict.analyticsTitle);
    }

    function setElText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function updateSelectOptions(selectId, optionsMap) {
        const select = document.getElementById(selectId);
        if (!select || !optionsMap) return;
        const currentVal = select.value;
        Array.from(select.options).forEach(opt => {
            if (optionsMap[opt.value]) {
                opt.textContent = optionsMap[opt.value];
            }
        });
        if (currentVal) select.value = currentVal;
    }

    function updateLayersModalCards(lang) {
        const ldata = layersData[lang] || layersData.ru;
        
        // Base maps
        const esriCard = document.querySelector('#baseLayersGrid .layer-card[data-base="esri"]');
        if (esriCard && ldata.baseEsri) {
            const t = esriCard.querySelector('.layer-card-title');
            const d = esriCard.querySelector('.layer-card-desc');
            if (t) t.textContent = ldata.baseEsri.title;
            if (d) d.textContent = ldata.baseEsri.desc;
        }
        const googleCard = document.querySelector('#baseLayersGrid .layer-card[data-base="google"]');
        if (googleCard && ldata.baseGoogle) {
            const t = googleCard.querySelector('.layer-card-title');
            const d = googleCard.querySelector('.layer-card-desc');
            if (t) t.textContent = ldata.baseGoogle.title;
            if (d) d.textContent = ldata.baseGoogle.desc;
        }
        const osmCard = document.querySelector('#baseLayersGrid .layer-card[data-base="osm"]');
        if (osmCard && ldata.baseOsm) {
            const t = osmCard.querySelector('.layer-card-title');
            const d = osmCard.querySelector('.layer-card-desc');
            if (t) t.textContent = ldata.baseOsm.title;
            if (d) d.textContent = ldata.baseOsm.desc;
        }

        // Sentinel overlays
        Object.keys(ldata).forEach(key => {
            const card = document.querySelector(`#sentinelLayersGrid .layer-card[data-overlay="${key}"]`);
            if (card) {
                const t = card.querySelector('.layer-card-title');
                const d = card.querySelector('.layer-card-desc');
                if (t) t.textContent = ldata[key].title;
                if (d) d.textContent = ldata[key].desc;
            }
        });
    }

    // ── Clock ────────────────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' };
        const el = document.getElementById('navTime');
        if (el) el.textContent = now.toLocaleTimeString('ru-RU', opts) + ' UZT';
    }

    // ── Toast Notification ──────────────────────────────────
    function showToast(message, icon = 'fa-circle-info') {
        const toast = document.getElementById('appToast');
        const msg = document.getElementById('toastMsg');
        const ic = document.getElementById('toastIcon');
        if (!toast || !msg || !ic) return;
        msg.textContent = message;
        ic.className = `fa-solid ${icon}`;
        toast.classList.add('visible');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 3200);
    }

    // ── Leaflet Map & Multiple Layers ────────────────────────
    function initMap() {
        const nukusBounds = L.latLngBounds([42.25, 59.35], [42.65, 59.85]);

        map = L.map('map', {
            center: [42.4531, 59.6104],
            zoom: 11,
            minZoom: 10,
            maxBounds: nukusBounds,
            maxBoundsViscosity: 1.0,
            zoomControl: false,
            attributionControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Base maps
        baseLayers.esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
        baseLayers.google = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20 });
        baseLayers.osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 });

        // Default base layer
        baseLayers.esri.addTo(map);

        // Borders overlay
        bordersLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 });
        sentinelOverlays.borders = bordersLayer;
        bordersLayer.addTo(map);

        drawControl = new L.Control.Draw({
            position: 'bottomright',
            draw: {
                polyline: false, circle: false, rectangle: true, marker: false, circlemarker: false,
                polygon: {
                    allowIntersection: false, showArea: true,
                    shapeOptions: { color: '#6e6cfe', weight: 3 }
                }
            },
            edit: false
        });

        map.on(L.Draw.Event.CREATED, function (e) {
            const layer = e.layer;
            tempDrawnLayer = layer;
            map.addLayer(layer);
            if (e.layerType === 'polygon' || e.layerType === 'rectangle') {
                const latlngs = layer.getLatLngs()[0];
                currentDrawingCoords = latlngs.map(ll => [ll.lat, ll.lng]);
            }
            openCreatePanel();
        });

        fetchGEELayers();
    }

    function switchBaseLayer(key) {
        if (!baseLayers[key]) return;
        if (baseLayers[currentBaseKey]) {
            map.removeLayer(baseLayers[currentBaseKey]);
        }
        baseLayers[key].addTo(map);
        currentBaseKey = key;

        if (sentinelOverlays.borders && map.hasLayer(sentinelOverlays.borders)) {
            sentinelOverlays.borders.bringToFront();
        }

        document.querySelectorAll('#baseLayersGrid .layer-card').forEach(card => {
            card.classList.toggle('active', card.dataset.base === key);
        });

        const names = { esri: 'ArcGIS Satellite', google: 'Google Hybrid', osm: 'OpenStreetMap' };
        showToast(`${names[key] || key}`, 'fa-map');
    }

    function toggleSentinelOverlay(key, cardEl) {
        const layer = sentinelOverlays[key];
        const card = cardEl || document.querySelector(`#sentinelLayersGrid .layer-card[data-overlay="${key}"]`);
        const dict = i18n[currentLang] || i18n.ru;
        const ldata = layersData[currentLang] || layersData.ru;
        const title = (ldata[key] && ldata[key].title) ? ldata[key].title : key;

        if (!layer) {
            showToast(`${title} — Sentinel-2 L2A`, 'fa-satellite-dish');
            return;
        }

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            if (card) card.classList.remove('active');
            showToast(`${title} — ${dict.layerRemoved}`, 'fa-eye-slash');
        } else {
            map.addLayer(layer);
            if (card) card.classList.add('active');
            showToast(`${title} — ${dict.layerAdded}`, 'fa-layer-group');
        }
    }

    function fetchGEELayers() {
        fetch('/api/gee/layers/')
            .then(r => r.json())
            .then(data => {
                if (data.ndvi) sentinelOverlays.ndvi = L.tileLayer(data.ndvi, { maxZoom: 19, opacity: 0.85 });
                if (data.ndwi) sentinelOverlays.ndwi = L.tileLayer(data.ndwi, { maxZoom: 19, opacity: 0.85 });
                if (data.ndsi) sentinelOverlays.ndsi = L.tileLayer(data.ndsi, { maxZoom: 19, opacity: 0.85 });
                if (data.evi)  sentinelOverlays.evi  = L.tileLayer(data.evi,  { maxZoom: 19, opacity: 0.85 });
                if (data.savi) sentinelOverlays.savi = L.tileLayer(data.savi, { maxZoom: 19, opacity: 0.85 });
                if (data.rededge) sentinelOverlays.rededge = L.tileLayer(data.rededge, { maxZoom: 19, opacity: 0.85 });
                if (data.swir) sentinelOverlays.swir = L.tileLayer(data.swir, { maxZoom: 19, opacity: 0.85 });

                // CRITICAL REQUIREMENT: NDVI IS OFF BY DEFAULT!
            })
            .catch(err => console.log('GEE layers fallback active', err));
    }

    // ── Rail Icon Controls & Global Enki API ────────────────
    function closeAllRailModals() {
        ['layersModal', 'analyticsModal', 'settingsModal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('active');
            }
        });
    }

    function setRailActive(btnId) {
        document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(btnId);
        if (btn) btn.classList.add('active');
    }

    window.enki = {
        resetMap: function() {
            if (map) map.setView([42.4531, 59.6104], 11);
            setRailActive('railMapBtn');
            closeAllRailModals();
            const dict = i18n[currentLang] || i18n.ru;
            showToast(dict.centeredNukus, 'fa-location-dot');
        },
        showAllFields: function() {
            setRailActive('railMapBtn');
            closeAllRailModals();
            const dict = i18n[currentLang] || i18n.ru;
            if (fieldMarkers && fieldMarkers.length > 0 && map) {
                const group = L.featureGroup(fieldMarkers);
                map.fitBounds(group.getBounds().pad(0.08));
                showToast(dict.allFieldsShown, 'fa-map');
            } else if (map) {
                map.setView([42.4531, 59.6104], 11);
            }
        },
        openLayers: function() {
            setRailActive('railLayersBtn');
            closeAllRailModals();
            const el = document.getElementById('layersModal');
            if (el) {
                el.style.display = 'flex';
                el.classList.add('active');
            }
        },
        openAnalytics: function() {
            setRailActive('railAnalyticsBtn');
            closeAllRailModals();
            renderAndOpenAnalytics();
            const el = document.getElementById('analyticsModal');
            if (el) {
                el.style.display = 'flex';
                el.classList.add('active');
            }
        },
        startDraw: function() {
            setRailActive('railDrawBtn');
            closeAllRailModals();
            enableDrawingMode();
            openCreatePanel();
            const dict = i18n[currentLang] || i18n.ru;
            showToast(dict.drawPrompt, 'fa-draw-polygon');
        },
        openSettings: function() {
            setRailActive('railSettingsBtn');
            closeAllRailModals();
            const el = document.getElementById('settingsModal');
            if (el) {
                el.style.display = 'flex';
                el.classList.add('active');
            }
        },
        closeModal: function(id) {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = 'none';
                el.classList.remove('active');
            }
            setRailActive('railMapBtn');
        },
        closeAllModals: closeAllRailModals,
        switchBase: switchBaseLayer,
        toggleOverlay: toggleSentinelOverlay
    };

    function setupRailControls() {
        const railLogoBtn = document.getElementById('railLogoBtn');
        const railMapBtn = document.getElementById('railMapBtn');
        const railLayersBtn = document.getElementById('railLayersBtn');
        const railAnalyticsBtn = document.getElementById('railAnalyticsBtn');
        const railDrawBtn = document.getElementById('railDrawBtn');
        const railSettingsBtn = document.getElementById('railSettingsBtn');

        if (railLogoBtn) railLogoBtn.addEventListener('click', window.enki.resetMap);
        if (railMapBtn) railMapBtn.addEventListener('click', window.enki.showAllFields);
        if (railLayersBtn) railLayersBtn.addEventListener('click', window.enki.openLayers);
        if (railAnalyticsBtn) railAnalyticsBtn.addEventListener('click', window.enki.openAnalytics);
        if (railDrawBtn) railDrawBtn.addEventListener('click', window.enki.startDraw);
        if (railSettingsBtn) railSettingsBtn.addEventListener('click', window.enki.openSettings);

        // Layers modal cards
        document.querySelectorAll('#baseLayersGrid .layer-card').forEach(card => {
            card.addEventListener('click', () => switchBaseLayer(card.dataset.base));
        });

        document.querySelectorAll('#sentinelLayersGrid .layer-card').forEach(card => {
            card.addEventListener('click', () => toggleSentinelOverlay(card.dataset.overlay, card));
        });

        ['layersModal', 'analyticsModal', 'settingsModal'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('click', (e) => {
                    if (e.target === el) window.enki.closeModal(id);
                });
            }
        });

        const testGeeBtn = document.getElementById('settingTestGeeBtn');
        if (testGeeBtn) {
            testGeeBtn.addEventListener('click', () => {
                fetchGeeStatus();
                fetchGEELayers();
                showToast('Sentinel-2 Hub API', 'fa-rotate');
            });
        }
    }

    // ── Drawing & Creation ──────────────────────────────────
    function enableDrawingMode() {
        if (!drawControl) return;
        if (window.innerWidth <= 768) {
            const sb = document.querySelector('.floating-sidebar');
            if (sb) sb.classList.add('collapsed');
        }
        map.addControl(drawControl);
        new L.Draw.Polygon(map, drawControl.options.draw.polygon).enable();
    }

    function openCreatePanel() {
        const cp = document.getElementById('createPanel');
        if (cp) cp.classList.add('active');
    }

    function closeCreatePanel() {
        const cp = document.getElementById('createPanel');
        if (cp) cp.classList.remove('active');
        if (tempDrawnLayer) {
            map.removeLayer(tempDrawnLayer);
            tempDrawnLayer = null;
        }
        currentDrawingCoords = null;
        if (drawControl && map) {
            map.removeControl(drawControl);
        }
    }

    function getHeatmapColor(value) {
        if (value >= 0.8) return '#a63d33';
        if (value >= 0.6) return '#c26a3f';
        if (value >= 0.4) return '#c2923f';
        if (value >= 0.2) return '#8aa63d';
        return '#4a7c44';
    }

    // ── Field Markers on Map ────────────────────────────────
    function renderMapMarkers(fields) {
        fieldMarkers.forEach((m) => map.removeLayer(m));
        fieldMarkers = [];
        const langCrops = cropMap[currentLang] || cropMap.ru;

        fields.forEach((f) => {
            const color = getHeatmapColor(f.heatmap_value || 0);
            let mapFeature;

            if (f.polygon_coords && f.polygon_coords.length > 0) {
                mapFeature = L.polygon(f.polygon_coords, {
                    color: color, fillColor: color, fillOpacity: 0.32, weight: 3,
                }).addTo(map);
            } else {
                const radius = 12 + (f.heatmap_value || 0) * 12;
                mapFeature = L.circleMarker([f.latitude, f.longitude], {
                    radius: radius, fillColor: color, fillOpacity: 0.7, color: color, weight: 2, opacity: 0.9,
                }).addTo(map);
            }

            const cropName = langCrops[f.crop_type] || f.crop_type;
            const dict = i18n[currentLang] || i18n.ru;

            mapFeature.bindTooltip(
                `<strong>${f.field_id}</strong><br>${f.name}<br>` +
                `${cropName} · ${f.region}<br>` +
                `${dict.irrigationNorm}: ${(f.heatmap_value * 100).toFixed(0)}%`,
                { className: 'custom-tooltip' }
            );

            mapFeature.on('click', () => {
                openFieldModal(f);
                if (window.innerWidth <= 768) {
                    const sb = document.querySelector('.floating-sidebar');
                    if (sb) sb.classList.add('collapsed');
                }
            });
            fieldMarkers.push(mapFeature);
        });

        if (fields.length > 0) {
            const group = L.featureGroup(fieldMarkers);
            const isMobile = window.innerWidth <= 768;
            map.fitBounds(group.getBounds(), {
                paddingTopLeft: isMobile ? [20, 20] : [450, 50],
                paddingBottomRight: [20, 20]
            });
        }
    }

    // ── GEE Status ──────────────────────────────────────────
    function fetchGeeStatus() {
        fetch('/api/gee/status/')
            .then(r => r.json())
            .then(data => {
                const badge = document.getElementById('geeStatusBadge');
                const icon = document.getElementById('geeStatusIcon');
                const text = document.getElementById('geeStatusText');
                const dict = i18n[currentLang] || i18n.ru;
                if (!badge) return;
                icon.className = data.connected ? 'fa-solid fa-satellite-dish' : 'fa-solid fa-circle-xmark';
                text.textContent = data.connected ? dict.geeOnline : dict.geeFallback;
                badge.style.color = data.connected ? '#22c55e' : '#eab308';
                badge.title = data.mode || 'Sentinel-2 L2A Mode';
            })
            .catch(() => {
                const text = document.getElementById('geeStatusText');
                if (text) text.textContent = 'GEE';
            });
    }

    // ── Fetch Dashboard Data ────────────────────────────────
    function fetchDashboardData() {
        fetch('/api/dashboard/')
            .then((r) => r.json())
            .then((data) => {
                if (!data) return;
                dashboardData = data;
                if (data.summary) renderSummaryCards(data.summary);
                if (data.fields) {
                    renderFieldList(data.fields);
                    renderMapMarkers(data.fields);
                    renderAlertFeed(data.fields);
                }
            })
            .catch((err) => {
                console.error('Failed to load dashboard data:', err);
            });
    }

    function renderSummaryCards(summary) {
        if (!summary) return;
        animateNumber('totalFields', summary.total_fields || 0);
        animateNumber('fieldsNeeding', summary.fields_needing_irrigation || 0);
        animateNumber('criticalAlerts', summary.critical_alerts || 0);

        if (summary.total_savings_liters > 0) {
            document.getElementById('totalSavings').textContent = formatLiters(summary.total_savings_liters);
        } else {
            document.getElementById('totalSavings').textContent = '0';
        }

        const ndviVal = (summary.avg_ndvi || 0) * 100;
        document.getElementById('avgNDVI').textContent = ndviVal.toFixed(0) + '%';

        const critEl = document.getElementById('criticalAlerts');
        if (summary.critical_alerts > 0) {
            critEl.style.color = '#a63d33';
        }
    }

    function animateNumber(id, target) {
        const el = document.getElementById(id);
        if (!el) return;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 20));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 35);
    }

    // ── Field List & Feed ───────────────────────────────────
    function renderFieldList(fields) {
        const container = document.getElementById('fieldList');
        if (!container) return;
        container.innerHTML = '';
        const langCrops = cropMap[currentLang] || cropMap.ru;
        const langSystems = systemMap[currentLang] || systemMap.ru;
        const dict = i18n[currentLang] || i18n.ru;

        fields
            .sort((a, b) => (b.heatmap_value || 0) - (a.heatmap_value || 0))
            .forEach((f) => {
                const rec = f.recommendation;
                const amount = rec ? rec.water_recommendation.amount_mm : 0;
                const color = getHeatmapColor(f.heatmap_value || 0);

                const item = document.createElement('div');
                item.className = 'field-card field-item';
                item.dataset.name = (f.name + ' ' + f.field_id + ' ' + f.crop_type + ' ' + f.region).toLowerCase();
                item.innerHTML = `
                    <div class="field-urgency-dot" style="background:${color};box-shadow:0 0 6px ${color}40"></div>
                    <div class="field-card-info">
                        <div class="field-name">${f.name}</div>
                        <div class="field-meta">${langCrops[f.crop_type] || f.crop_type} · ${f.region} · ${langSystems[f.irrigation_system] || f.irrigation_system}</div>
                    </div>
                    <div class="field-amount" style="color:${color}">
                        ${amount > 0 ? amount + ' ' + dict.mm : '✓ OK'}
                    </div>
                `;
                item.addEventListener('click', () => {
                    openFieldModal(f);
                    if (window.innerWidth <= 768) {
                        const sb = document.querySelector('.floating-sidebar');
                        if (sb) sb.classList.add('collapsed');
                    }
                });
                container.appendChild(item);
            });
    }

    function filterFieldList(query) {
        document.querySelectorAll('.field-card, .field-item').forEach((item) => {
            const match = item.dataset.name.includes(query);
            item.style.display = match ? '' : 'none';
        });
    }

    function renderAlertFeed(fields) {
        const container = document.getElementById('alertFeed');
        if (!container) return;
        container.innerHTML = '';
        const dict = i18n[currentLang] || i18n.ru;
        const statusDict = statusMap[currentLang] || statusMap.ru;

        let allAlerts = [];
        fields.forEach((f) => {
            if (f.recommendation && f.recommendation.alerts) {
                f.recommendation.alerts.forEach((a) => {
                    allAlerts.push({ ...a, field_id: f.field_id, field_name: f.name });
                });
            }
        });

        const seen = new Set();
        allAlerts = allAlerts.filter((a) => {
            const key = a.field_id + a.message;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        const severityOrder = { critical: 0, warning: 1, info: 2 };
        allAlerts.sort((a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9));

        if (allAlerts.length === 0) {
            container.innerHTML = `<div class="loading-placeholder"><i class="fa-solid fa-leaf"></i> ${dict.noAlerts}</div>`;
            return;
        }

        allAlerts.slice(0, 12).forEach((a) => {
            const el = document.createElement('div');
            el.className = `alert-card severity-${a.severity}`;
            const cleanMessage = a.message.replace(/(\d+\.\d{3,})/g, (match) => parseFloat(match).toFixed(1));
            const badgeLabel = a.severity === 'critical' ? statusDict.critical_tag : (a.severity === 'warning' ? statusDict.warning_tag : statusDict.info_tag);
            
            el.innerHTML = `
                <span class="alert-badge">${badgeLabel || a.severity}</span>
                <div>
                    <div class="alert-msg">${cleanMessage}</div>
                    <div class="alert-tag">${a.field_id} — ${a.field_name}</div>
                </div>
            `;
            container.appendChild(el);
        });
    }

    // ── Dual-Stage Field Detail & Side-By-Side Analysis ─────
    function openFieldModal(field) {
        currentSelectedFieldId = field.field_id;
        currentSelectedFieldObj = field;
        populateFieldStage(field);

        const overlay = document.getElementById('fieldStageOverlay');
        const container = document.getElementById('fieldStageContainer');
        if (container) container.classList.remove('expanded-analysis');
        if (overlay) overlay.style.display = 'flex';
    }

    function populateFieldStage(field) {
        const dict = i18n[currentLang] || i18n.ru;
        const cropDict = cropMap[currentLang] || cropMap.ru;
        const stageDict = stageMap[currentLang] || stageMap.ru;
        const sysDict = systemMap[currentLang] || systemMap.ru;
        const statDict = statusMap[currentLang] || statusMap.ru;

        const rec = field.recommendation || {};
        const wr = rec.water_recommendation || { irrigate_today: false, amount_mm: 0, best_irrigation_time: '--:--', total_liters_field: 0, irrigation_duration_hours: 0, savings: { liters_total: 0, uzs_total: 0 } };
        const fh = rec.field_health || {};
        const ndvi = parseFloat(fh.ndvi || field.satellite_ndvi || 0.65);
        const ndwi = parseFloat(fh.ndwi || field.satellite_ndwi || -0.05);
        const imgDate = rec.satellite_image_date || '';
        const soilMoistureVal = parseFloat(rec.soil_moisture_percent || field.soil_moisture || 32);
        const tempVal = rec.weather ? rec.weather.temperature_max_c : 31;
        const ndsiScore = Math.max(0.05, Math.min(0.95, (1 - ndvi) * 0.7 + (Math.abs(ndwi) * 0.3)));

        // Header info
        setElText('stageFieldId', field.field_id);
        setElText('stageFieldName', field.name);
        setElText('stageFieldMeta', `${cropDict[field.crop_type] || field.crop_type} • ${field.region} • ${sysDict[field.irrigation_system] || field.irrigation_system}`);

        const statusBadge = document.getElementById('stageStatusBadge');
        if (statusBadge) {
            statusBadge.textContent = wr.irrigate_today ? dict.irrigationRequired : dict.noIrrigationNeeded;
            statusBadge.className = `stage-badge-status ${wr.irrigate_today ? 'required' : 'normal'}`;
        }

        // KPI values
        setElText('stageNormVal', wr.irrigate_today ? wr.amount_mm : '0');
        setElText('stageNormSub', wr.irrigate_today ? dict.irrigationRequired : dict.noIrrigationNeeded);
        setElText('stageTimeVal', wr.irrigate_today ? wr.best_irrigation_time : '--:--');
        setElText('stageDurationVal', `${dict.durationLabel}: ${wr.irrigation_duration_hours || 0} ${dict.hours}`);
        setElText('stageSoilVal', soilMoistureVal.toFixed(0));
        setElText('stageSoilStatus', statDict[fh.soil_moisture_status] || statDict.optimal);
        setElText('stageTempVal', `${tempVal}`);
        setElText('stageWeatherSub', `${dict.rainLabel}: ${rec.weather ? rec.weather.rainfall_mm : 0} ${dict.mm} • ${dict.windLabel}: ${rec.weather ? (rec.weather.wind_speed_kmh / 3.6).toFixed(1) : 3.0} м/с`);

        // Spectral meters
        setElText('stageNdviVal', ndvi.toFixed(2));
        const ndviBar = document.getElementById('stageNdviBar');
        if (ndviBar) ndviBar.style.width = `${Math.max(5, Math.min(100, ndvi * 100))}%`;

        setElText('stageNdwiVal', ndwi.toFixed(2));
        const ndwiBar = document.getElementById('stageNdwiBar');
        if (ndwiBar) ndwiBar.style.width = `${Math.max(5, Math.min(100, (ndwi + 1) * 50))}%`;

        setElText('stageNdsiVal', ndsiScore.toFixed(2));
        const ndsiBar = document.getElementById('stageNdsiBar');
        if (ndsiBar) ndsiBar.style.width = `${Math.max(5, Math.min(100, ndsiScore * 100))}%`;

        // Agronomic pairs
        setElText('stageCropVal', cropDict[field.crop_type] || field.crop_type);
        const confTag = document.getElementById('stageCropConfidenceTag');
        if (confTag) confTag.style.display = 'none';
        setElText('stageGrowthVal', stageDict[field.crop_growth_stage] || stageDict.vegetative);
        setElText('stageAreaVal', `${field.area_hectares} ${dict.ha}`);
        setElText('stageSystemVal', sysDict[field.irrigation_system] || field.irrigation_system);

        // Savings
        const savedLiters = wr.savings ? wr.savings.liters_total : 0;
        const savedCost = wr.savings ? wr.savings.uzs_total : 0;
        setElText('stageSavWaterVal', `${formatLiters(savedLiters)} ${dict.liters}`);
        setElText('stageSavCostVal', `~${Math.round(savedCost).toLocaleString()} ${dict.currency}`);
        setElText('stageImageDateVal', imgDate || 'Sentinel-2 Live');
    }

    function closeFieldStage() {
        const overlay = document.getElementById('fieldStageOverlay');
        const container = document.getElementById('fieldStageContainer');
        if (container) container.classList.remove('expanded-analysis');
        if (overlay) overlay.style.display = 'none';
        currentSelectedFieldId = null;
        currentSelectedFieldObj = null;
    }

    // ── Side-By-Side AI Analysis Action ──────────────────────
    function handleSideBySideAnalysis() {
        if (!currentSelectedFieldId) return;

        const container = document.getElementById('fieldStageContainer');
        const loadBox = document.getElementById('analysisLoadingBox');
        const markdownBox = document.getElementById('analysisRenderedMarkdown');

        // Smoothly expand container side-by-side!
        container.classList.add('expanded-analysis');
        loadBox.style.display = 'flex';
        markdownBox.style.display = 'none';

        fetch(`/api/fields/${currentSelectedFieldId}/analyze-ai/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lang: currentLang })
        })
            .then(r => r.json())
            .then(data => {
                loadBox.style.display = 'none';
                markdownBox.style.display = 'block';
                if (data.report_markdown) {
                    markdownBox.innerHTML = marked.parse(data.report_markdown);
                } else {
                    markdownBox.innerHTML = `<p>${i18n[currentLang].noData}</p>`;
                }
            })
            .catch(err => {
                loadBox.style.display = 'none';
                markdownBox.style.display = 'block';
                markdownBox.innerHTML = `<p>${i18n[currentLang].noData}</p>`;
                console.error(err);
            });
    }

    function collapseSideBySideAnalysis() {
        const container = document.getElementById('fieldStageContainer');
        if (container) container.classList.remove('expanded-analysis');
    }

    // ── Field CRUD Actions ──────────────────────────────────
    function handleFieldCreate(e) {
        e.preventDefault();
        const dict = i18n[currentLang] || i18n.ru;
        const btn = document.getElementById('createFieldSubmitBtn');
        const origText = btn.innerHTML;
        btn.textContent = dict.processing;
        btn.disabled = true;

        const payload = {
            name: document.getElementById('newFieldName').value,
            irrigation_system: document.getElementById('newFieldSystem').value,
            region: document.getElementById('newFieldRegion').value,
            polygon_coords: currentDrawingCoords,
            auto_detect_crop: true
        };

        fetch('/api/fields/create-with-analysis/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(r => {
                if (!r.ok) throw new Error('API Error');
                return r.json();
            })
            .then(() => {
                closeCreatePanel();
                fetchDashboardData();
                showToast(dict.fieldCreated, 'fa-check');
            })
            .catch(err => {
                alert("Failed to create field.");
                console.error(err);
            })
            .finally(() => {
                btn.innerHTML = origText;
                btn.disabled = false;
            });
    }

    async function handleDetectCrop() {
        if (!currentSelectedFieldId) return;
        const dict = i18n[currentLang] || i18n.ru;
        const btn = document.getElementById('stageDetectCropBtn');
        if (btn) {
            btn.disabled = true;
            btn.classList.add('loading');
            btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${dict.detectingCrop || 'Анализ спектра...'}</span>`;
        }

        try {
            const resp = await fetch(`/api/fields/${currentSelectedFieldId}/detect-crop/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: currentLang })
            });
            const res = await resp.json();

            if (res && res.success) {
                const cropDict = cropMap[currentLang] || cropMap.ru;
                const cropName = res.crop_name || cropDict[res.crop_type] || res.crop_type;
                setElText('stageCropVal', cropName);

                const confTag = document.getElementById('stageCropConfidenceTag');
                if (confTag) {
                    confTag.style.display = 'inline-flex';
                    confTag.innerHTML = `<i class="fa-solid fa-satellite"></i> ${res.confidence}% ${dict.cropConfidence || 'точность'}`;
                }

                if (res.irrigation_norm_mm !== undefined) {
                    setElText('stageNormVal', res.irrigation_recommended ? res.irrigation_norm_mm : '0');
                    setElText('stageNormSub', res.irrigation_recommended ? dict.irrigationRequired : dict.noIrrigationNeeded);
                    const statusBadge = document.getElementById('stageStatusBadge');
                    if (statusBadge) {
                        statusBadge.textContent = res.irrigation_recommended ? dict.irrigationRequired : dict.noIrrigationNeeded;
                        statusBadge.className = `stage-badge-status ${res.irrigation_recommended ? 'required' : 'normal'}`;
                    }
                }
                if (res.optimal_time_window) setElText('stageTimeVal', res.optimal_time_window);
                if (res.duration_hours !== undefined) setElText('stageDurationVal', `${dict.durationLabel}: ${res.duration_hours} ${dict.hours}`);
                if (res.water_savings_liters !== undefined) setElText('stageSavWaterVal', `${formatLiters(res.water_savings_liters)} ${dict.liters}`);
                if (res.savings_uzs !== undefined) setElText('stageSavCostVal', `~${Math.round(res.savings_uzs).toLocaleString()} ${dict.currency}`);

                if (currentSelectedFieldObj) {
                    currentSelectedFieldObj.crop_type = res.crop_type;
                }
                const idx = allFields.findIndex(f => f.field_id === currentSelectedFieldId);
                if (idx !== -1) {
                    allFields[idx].crop_type = res.crop_type;
                }
                renderFieldList();

                showToast(`${dict.cropIdentifiedToast || 'Культура определена: '}${cropName} (${res.confidence}%)`, 'fa-satellite-dish');
            } else {
                showToast(res.error || 'Ошибка анализа Sentinel-2', 'fa-circle-exclamation');
            }
        } catch (err) {
            console.error('Crop detection error:', err);
            showToast('Сбой спутникового анализа культуры', 'fa-circle-exclamation');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.classList.remove('loading');
                btn.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> <span id="detectCropBtnText">${dict.detectCropBtn || 'Определить культуру'}</span>`;
            }
        }
    }

    function handleFieldRefresh() {
        if (!currentSelectedFieldId) return;
        const dict = i18n[currentLang] || i18n.ru;
        showToast(dict.refreshing, 'fa-rotate');

        fetch(`/api/fields/${currentSelectedFieldId}/refresh/`, { method: 'POST' })
            .then(r => r.json())
            .then(() => {
                closeFieldStage();
                fetchDashboardData();
            })
            .catch(err => alert("Failed to refresh field."));
    }

    function handleFieldDelete() {
        if (!currentSelectedFieldId) return;
        const dict = i18n[currentLang] || i18n.ru;
        if (!confirm(dict.deleteConfirm)) return;

        fetch(`/api/fields/${currentSelectedFieldId}/delete/`, { method: 'DELETE' })
            .then(() => {
                closeFieldStage();
                fetchDashboardData();
                showToast(dict.fieldDeleted, 'fa-trash-can');
            })
            .catch(err => alert("Failed to delete field."));
    }

    // ── Analytics Renderer ───────────────────────────────────
    function renderAndOpenAnalytics() {
        const modal = document.getElementById('analyticsModal');
        const body = document.getElementById('analyticsModalBody');
        if (!modal || !body) return;

        const dict = i18n[currentLang] || i18n.ru;
        const cropDict = cropMap[currentLang] || cropMap.ru;
        const fields = (dashboardData && dashboardData.fields) ? dashboardData.fields : [];
        const totalFieldsCount = fields.length;
        let totalAreaHa = 0;
        let totalWaterMm = 0;
        let totalSavingsUZS = 0;
        let normalCount = 0;
        let warningCount = 0;
        let criticalCount = 0;
        const cropCounts = {};

        fields.forEach(f => {
            const area = parseFloat(f.area_hectares) || 1.0;
            totalAreaHa += area;
            const crop = f.crop_type || 'other';
            cropCounts[crop] = (cropCounts[crop] || 0) + area;

            const rec = f.recommendation;
            if (rec) {
                const wm = rec.water_recommendation || {};
                totalWaterMm += (wm.amount_mm || 0);
                if (wm.savings && wm.savings.uzs_total) {
                    totalSavingsUZS += wm.savings.uzs_total;
                }
                const status = f.heatmap_value;
                if (status === 0) normalCount++;
                else if (status <= 0.5) warningCount++;
                else criticalCount++;
            }
        });

        const avgWaterMm = totalFieldsCount > 0 ? (totalWaterMm / totalFieldsCount).toFixed(1) : 0;
        const normalPct = totalFieldsCount > 0 ? Math.round((normalCount / totalFieldsCount) * 100) : 0;
        const warningPct = totalFieldsCount > 0 ? Math.round((warningCount / totalFieldsCount) * 100) : 0;
        const criticalPct = totalFieldsCount > 0 ? Math.round((criticalCount / totalFieldsCount) * 100) : 0;

        let html = `
            <div class="analytics-kpi-grid">
                <div class="analytics-kpi">
                    <span class="analytics-kpi-label"><i class="fa-solid fa-layer-group"></i> ${dict.analyticsMonitoredFields}</span>
                    <span class="analytics-kpi-val">${totalFieldsCount}</span>
                    <span class="analytics-kpi-sub">${dict.areaLabel}: ${totalAreaHa.toFixed(1)} ${dict.ha}</span>
                </div>
                <div class="analytics-kpi">
                    <span class="analytics-kpi-label"><i class="fa-solid fa-droplet" style="color:var(--info);"></i> ${dict.analyticsAvgDemand}</span>
                    <span class="analytics-kpi-val" style="color:var(--info);">${avgWaterMm} ${dict.mm}</span>
                    <span class="analytics-kpi-sub">FAO-56 Penman-Monteith</span>
                </div>
                <div class="analytics-kpi">
                    <span class="analytics-kpi-label"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--ok);"></i> ${dict.analyticsSavings}</span>
                    <span class="analytics-kpi-val" style="color:var(--ok);">${(totalSavingsUZS / 1000000).toFixed(1)} млн</span>
                    <span class="analytics-kpi-sub">${dict.currency}</span>
                </div>
                <div class="analytics-kpi">
                    <span class="analytics-kpi-label"><i class="fa-solid fa-triangle-exclamation" style="color:var(--danger);"></i> ${dict.analyticsCriticalNeed}</span>
                    <span class="analytics-kpi-val" style="color:var(--danger);">${criticalCount}</span>
                    <span class="analytics-kpi-sub">${dict.irrigationRequired}</span>
                </div>
            </div>

            <div class="chart-bars-wrap">
                <div style="font-weight:800;font-size:0.92rem;text-transform:uppercase;margin-bottom:12px;color:var(--txt);">
                    <i class="fa-solid fa-heart-pulse" style="color:var(--p);margin-right:6px;"></i> ${dict.analyticsStressDist}
                </div>
                <div class="chart-bar-item">
                    <div class="chart-bar-header">
                        <span><i class="fa-solid fa-circle" style="color:var(--ok);font-size:0.65rem;margin-right:6px;"></i> ${dict.legendNorm} • ${normalCount}</span>
                        <span style="font-weight:800;color:var(--ok);">${normalPct}%</span>
                    </div>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width:${normalPct}%;background:var(--ok);"></div>
                    </div>
                </div>
                <div class="chart-bar-item">
                    <div class="chart-bar-header">
                        <span><i class="fa-solid fa-circle" style="color:var(--warn);font-size:0.65rem;margin-right:6px;"></i> ${dict.legendMed} • ${warningCount}</span>
                        <span style="font-weight:800;color:var(--warn);">${warningPct}%</span>
                    </div>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width:${warningPct}%;background:var(--warn);"></div>
                    </div>
                </div>
                <div class="chart-bar-item">
                    <div class="chart-bar-header">
                        <span><i class="fa-solid fa-circle" style="color:var(--danger);font-size:0.65rem;margin-right:6px;"></i> ${dict.legendHigh} • ${criticalCount}</span>
                        <span style="font-weight:800;color:var(--danger);">${criticalPct}%</span>
                    </div>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width:${criticalPct}%;background:var(--danger);"></div>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div class="chart-bars-wrap" style="margin-bottom:0;">
                    <div style="font-weight:800;font-size:0.88rem;text-transform:uppercase;margin-bottom:12px;color:var(--txt);">
                        <i class="fa-solid fa-wheat-awn" style="color:var(--warn);margin-right:6px;"></i> ${dict.analyticsCropDist}
                    </div>
        `;

        for (const [crop, area] of Object.entries(cropCounts)) {
            const cropName = cropDict[crop] || crop;
            const pct = totalAreaHa > 0 ? Math.round((area / totalAreaHa) * 100) : 0;
            html += `
                <div class="chart-bar-item">
                    <div class="chart-bar-header">
                        <span style="font-size:0.82rem;">${cropName} • ${area.toFixed(1)} ${dict.ha}</span>
                        <span style="font-size:0.82rem;font-weight:800;color:var(--p);">${pct}%</span>
                    </div>
                    <div class="chart-bar-track">
                        <div class="chart-bar-fill" style="width:${pct}%;background:var(--p);"></div>
                    </div>
                </div>
            `;
        }

        html += `
                </div>
                <div class="chart-bars-wrap" style="margin-bottom:0;">
                    <div style="font-weight:800;font-size:0.88rem;text-transform:uppercase;margin-bottom:12px;color:var(--txt);">
                        <i class="fa-solid fa-fire-flame-curved" style="color:var(--danger);margin-right:6px;"></i> ${dict.analyticsHighDemand}
                    </div>
        `;

        const sortedFields = [...fields].sort((a,b) => {
            const aAmt = (a.recommendation && a.recommendation.water_recommendation) ? a.recommendation.water_recommendation.amount_mm : 0;
            const bAmt = (b.recommendation && b.recommendation.water_recommendation) ? b.recommendation.water_recommendation.amount_mm : 0;
            return bAmt - aAmt;
        }).slice(0, 4);

        sortedFields.forEach(f => {
            const amt = (f.recommendation && f.recommendation.water_recommendation) ? f.recommendation.water_recommendation.amount_mm : 0;
            html += `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--s2);">
                    <div>
                        <strong style="font-size:0.92rem;color:var(--txt);">${f.name}</strong>
                        <div style="font-size:0.76rem;color:var(--txt-f);">${cropDict[f.crop_type] || f.crop_type} · ${f.region}</div>
                    </div>
                    <span style="font-size:1.05rem;font-weight:900;color:var(--danger);">${amt} ${dict.mm}</span>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        body.innerHTML = html;
        modal.style.display = 'flex';
    }

    // ── Helper ──────────────────────────────────────────────
    function formatLiters(n) {
        if (!n) return '0';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return n;
    }

})();
