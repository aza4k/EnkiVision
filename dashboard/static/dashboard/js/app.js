/**
 * AgroWater Dashboard — Frontend Application
 * ============================================
 * Fetches data from /api/dashboard/, renders Leaflet heatmap,
 * populates stat cards, field list, alert feed, and field detail modal.
 */

(function () {
    'use strict';

    // ── Translation Map ────────────────────────────────────
    const i18n = {
        totalFields: 'Полей',
        fieldsNeeding: 'Нужен полив',
        criticalAlerts: 'Критично',
        geeOnline: 'GEE Онлайн',
        geeFallback: 'GEE Режим ожидания',
        loadingData: 'Загрузка данных...',
        loadError: 'Ошибка загрузки данных. Проверьте соединение.',
        searchPlaceholder: 'Поиск по названию или культуре...',
        noAlerts: 'Активных уведомлений нет — все в норме',
        attentionNeeded: 'Требуется внимание: критических уведомлений - ',
        testMode: 'Все системы работают в штатном режиме',
        urgency: 'Срочность',
        mm: 'мм',
        liters: 'литров',
        hours: 'часов',
        notNeeded: 'Полив не требуется',
        sufficientMoisture: 'Влажность достаточная',
        bestTime: 'Лучшее время',
        vsNorm: 'от нормы',
        satIndices: 'Спутниковые индексы',
        imgDate: 'Дата снимка',
        fieldCondition: 'Состояние поля',
        soil: 'Почва',
        yieldRisk: 'Риск урожая',
        fieldInfo: 'Информация о поле',
        crop: 'Культура',
        area: 'Площадь',
        ha: 'га',
        system: 'Система',
        region: 'Район',
        aiAnalysis: 'Анализ ИИ',
        smsFarmer: 'SMS для фермера',
        forecast3Days: 'Прогноз на 3 дня',
        date: 'Дата',
        waterNeed: 'Нужда (мм)',
        confidence: 'Точность',
        calculationProcess: 'Процесс расчета',
        refreshing: 'Обновление...',
        deleting: 'Удаление...',
        deleteConfirm: 'Вы уверены, что хотите навсегда удалить это поле? Все связанные данные будут удалены.',
        processing: 'Обработка...',
        noData: 'Нет данных для этого поля.'
    };

    const cropMap = {
        'cotton': 'Хлопок',
        'wheat': 'Пшеница',
        'corn': 'Кукуруза',
        'vegetables': 'Овощи',
        'rice': 'Рис',
        'other': 'Прочее'
    };

    const stageMap = {
        'seedling': 'Рассада',
        'vegetative': 'Вегетация',
        'flowering': 'Цветение',
        'ripening': 'Созревание',
        'harvest': 'Урожай'
    };

    const systemMap = {
        'drip': 'Капельный',
        'furrow': 'Арычный',
        'sprinkler': 'Дождевание',
        'flood': 'Напуском'
    };

    const statusMap = {
        'healthy': 'Здорово',
        'moderate_stress': 'Умеренный стресс',
        'severe_stress': 'Сильный стресс',
        'good': 'Хорошее',
        'needs_attention': 'Нужно внимание',
        'critical': 'Критическое',
        'wet': 'Влажно',
        'moist': 'Умеренно',
        'dry': 'Сухо',
        'very_dry': 'Очень сухо',
        'optimal': 'Оптимально',
        'saturated': 'Насыщено',
        'low': 'Низкий',
        'medium': 'Средний',
        'high': 'Высокий'
    };

    // ── State ──────────────────────────────────────────────
    let dashboardData = null;
    let map = null;
    let fieldMarkers = [];

    // ── Init ───────────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        initMap();
        updateClock();
        setInterval(updateClock, 30000);
        fetchDashboardData();
        fetchGeeStatus();
        setInterval(fetchGeeStatus, 120000);

        document.getElementById('fieldSearch').addEventListener('input', (e) => {
            filterFieldList(e.target.value.toLowerCase());
        });

        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        document.getElementById('createPanelClose').addEventListener('click', closeCreatePanel);
        document.getElementById('add-field-btn').addEventListener('click', enableDrawingMode);
        document.getElementById('createFieldForm').addEventListener('submit', handleFieldCreate);
        document.getElementById('refreshFieldBtn').addEventListener('click', handleFieldRefresh);
        document.getElementById('deleteFieldBtn').addEventListener('click', handleFieldDelete);
    });

    // ── Clock ──────────────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' };
        document.getElementById('navTime').textContent = now.toLocaleTimeString('ru-RU', opts) + ' UZT';
    }

    // ── Leaflet Map ────────────────────────────────────────
    let ndviLayer = null;
    let ndwiLayer = null;
    let mapLayersControl = null;

    function initMap() {
        const nukusBounds = L.latLngBounds([42.25, 59.35], [42.65, 59.85]);

        map = L.map('map', {
            center: [42.4531, 59.6104],
            zoom: 11,
            minZoom: 10,
            maxBounds: nukusBounds,
            maxBoundsViscosity: 1.0,
            zoomControl: true,
            attributionControl: false,
        });

        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
        }).addTo(map);

        const bordersLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
        }).addTo(map);

        const baseMaps = { "Спутник": satelliteLayer };
        const overlayMaps = { "Границы и названия": bordersLayer };
        mapLayersControl = L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map);

        drawControl = new L.Control.Draw({
            draw: {
                polyline: false, circle: false, rectangle: true, marker: false, circlemarker: false,
                polygon: {
                    allowIntersection: false, showArea: true,
                    shapeOptions: { color: '#00ff88', weight: 3 }
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

    function fetchGEELayers() {
        fetch('/api/gee/layers/')
            .then(r => r.json())
            .then(data => {
                if (data.ndvi && data.ndwi) {
                    ndviLayer = L.tileLayer(data.ndvi, { maxZoom: 19, opacity: 0.8 });
                    ndwiLayer = L.tileLayer(data.ndwi, { maxZoom: 19, opacity: 0.8 });
                    mapLayersControl.addOverlay(ndviLayer, "🛰️ NDVI (Растительность)");
                    mapLayersControl.addOverlay(ndwiLayer, "💧 NDWI (Влажность)");
                }
            })
            .catch(err => console.log('GEE layers failed', err));
    }

    let drawControl = null;
    let tempDrawnLayer = null;
    let currentDrawingCoords = null;
    let currentSelectedFieldId = null;

    function enableDrawingMode() {
        if (!drawControl) return;
        map.addControl(drawControl);
        new L.Draw.Polygon(map, drawControl.options.draw.polygon).enable();
    }

    function openCreatePanel() {
        document.getElementById('createPanel').classList.add('active');
    }

    function closeCreatePanel() {
        document.getElementById('createPanel').classList.remove('active');
        if (tempDrawnLayer) {
            map.removeLayer(tempDrawnLayer);
            tempDrawnLayer = null;
        }
        currentDrawingCoords = null;
        map.removeControl(drawControl);
    }

    function getHeatmapColor(value) {
        if (value >= 0.8) return '#dc2626';
        if (value >= 0.6) return '#ef4444';
        if (value >= 0.4) return '#f97316';
        if (value >= 0.2) return '#eab308';
        return '#22c55e';
    }

    function renderMapMarkers(fields) {
        fieldMarkers.forEach((m) => map.removeLayer(m));
        fieldMarkers = [];

        fields.forEach((f) => {
            const color = getHeatmapColor(f.heatmap_value || 0);
            let mapFeature;

            if (f.polygon_coords && f.polygon_coords.length > 0) {
                mapFeature = L.polygon(f.polygon_coords, {
                    color: color, fillColor: color, fillOpacity: 0.3, weight: 3,
                }).addTo(map);
            } else {
                const radius = 12 + (f.heatmap_value || 0) * 12;
                mapFeature = L.circleMarker([f.latitude, f.longitude], {
                    radius: radius, fillColor: color, fillOpacity: 0.7, color: color, weight: 2, opacity: 0.9,
                }).addTo(map);
            }

            mapFeature.bindTooltip(
                `<strong>${f.field_id}</strong><br>${f.name}<br>` +
                `${cropMap[f.crop_type] || f.crop_type} · ${f.region}<br>` +
                `${i18n.urgency}: ${(f.heatmap_value * 100).toFixed(0)}%`,
                { className: 'custom-tooltip' }
            );

            mapFeature.on('click', () => openFieldModal(f));
            fieldMarkers.push(mapFeature);
        });

        if (fields.length > 0) {
            const group = L.featureGroup(fieldMarkers);
            map.fitBounds(group.getBounds(), { 
                paddingTopLeft: [450, 50],
                paddingBottomRight: [50, 50]
            });
        }
    }

    // ── GEE Status ──────────────────────────────────────────
    function fetchGeeStatus() {
        fetch('/api/gee/status/')
            .then(r => r.json())
            .then(data => {
                const badge = document.getElementById('geeStatusBadge');
                const icon  = document.getElementById('geeStatusIcon');
                const text  = document.getElementById('geeStatusText');
                if (!badge) return;
                icon.className = data.connected ? 'fa-solid fa-satellite-dish' : 'fa-solid fa-circle-xmark';
                text.textContent = data.connected ? i18n.geeOnline : i18n.geeFallback;
                badge.style.color = data.connected ? '#22c55e' : '#eab308';
                badge.title = data.mode || 'Статус GEE';
            })
            .catch(() => {
                const text = document.getElementById('geeStatusText');
                if (text) text.textContent = 'GEE —';
            });
    }

    // ── Fetch Data ─────────────────────────────────────────
    function fetchDashboardData() {
        fetch('/api/dashboard/')
            .then((r) => r.json())
            .then((data) => {
                dashboardData = data;
                renderSummaryCards(data.summary);
                renderFieldList(data.fields);
                renderMapMarkers(data.fields);
                renderAlertFeed(data.fields);
                renderAlertTicker(data.fields);
            })
            .catch((err) => {
                console.error('Failed to load dashboard data:', err);
                document.getElementById('tickerText').textContent = i18n.loadError;
            });
    }

    // ── Summary Cards ──────────────────────────────────────
    function renderSummaryCards(summary) {
        animateNumber('totalFields', summary.total_fields);
        animateNumber('fieldsNeeding', summary.fields_needing_irrigation);
        animateNumber('criticalAlerts', summary.critical_alerts);
        document.getElementById('avgNDVI').textContent = summary.avg_ndvi.toFixed(2);

        const critEl = document.getElementById('criticalAlerts');
        if (summary.critical_alerts > 0) {
            critEl.style.color = '#ef4444';
        }
    }

    function animateNumber(id, target) {
        const el = document.getElementById(id);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 20));
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = current;
        }, 40);
    }

    // ── Field List ─────────────────────────────────────────
    function renderFieldList(fields) {
        const container = document.getElementById('fieldList');
        container.innerHTML = '';

        fields
            .sort((a, b) => (b.heatmap_value || 0) - (a.heatmap_value || 0))
            .forEach((f) => {
                const rec = f.recommendation;
                const amount = rec ? rec.water_recommendation.amount_mm : 0;
                const color = getHeatmapColor(f.heatmap_value || 0);

                const item = document.createElement('div');
                item.className = 'field-item';
                item.dataset.name = (f.name + ' ' + f.field_id + ' ' + f.crop_type + ' ' + f.region).toLowerCase();
                item.innerHTML = `
                    <div class="field-urgency-dot" style="background:${color};box-shadow:0 0 6px ${color}40"></div>
                    <div class="field-item-info">
                        <div class="field-item-name">${f.name}</div>
                        <div class="field-item-meta">${cropMap[f.crop_type] || f.crop_type} · ${f.region} · ${systemMap[f.irrigation_system] || f.irrigation_system}</div>
                    </div>
                    <div class="field-item-amount" style="color:${color}">
                        ${amount > 0 ? amount + ' ' + i18n.mm : '✓ OK'}
                    </div>
                `;
                item.addEventListener('click', () => openFieldModal(f));
                container.appendChild(item);
            });
    }

    function filterFieldList(query) {
        document.querySelectorAll('.field-item').forEach((item) => {
            const match = item.dataset.name.includes(query);
            item.style.display = match ? '' : 'none';
        });
    }

    // ── Alert Feed ─────────────────────────────────────────
    function renderAlertFeed(fields) {
        const container = document.getElementById('alertFeed');
        container.innerHTML = '';

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
            container.innerHTML = `<div class="loading-placeholder"><i class="fa-solid fa-leaf"></i> ${i18n.noAlerts}</div>`;
            return;
        }

        allAlerts.slice(0, 12).forEach((a) => {
            const el = document.createElement('div');
            el.className = `alert-item severity-${a.severity}`;
            el.innerHTML = `
                <span class="alert-severity-badge">${statusMap[a.severity] || a.severity}</span>
                <div>
                    <div class="alert-message">${a.message}</div>
                    <div class="alert-field-tag">${a.field_id} — ${a.field_name}</div>
                </div>
            `;
            container.appendChild(el);
        });
    }

    // ── Alert Ticker ───────────────────────────────────────
    function renderAlertTicker(fields) {
        let critCount = 0;
        fields.forEach((f) => {
            if (f.recommendation && f.recommendation.alerts) {
                critCount += f.recommendation.alerts.filter((a) => a.severity === 'critical').length;
            }
        });

        const ticker = document.getElementById('tickerText');
        const tickerIcon = document.querySelector('.ticker-icon');
        if (critCount > 0) {
            ticker.textContent = `${i18n.attentionNeeded}${critCount}`;
            ticker.parentElement.style.borderColor = 'rgba(239,68,68,0.4)';
            ticker.parentElement.style.background = 'rgba(239,68,68,0.1)';
            if (tickerIcon) tickerIcon.className = 'fa-solid fa-triangle-exclamation ticker-icon';
        } else {
            ticker.textContent = i18n.testMode;
            ticker.parentElement.style.borderColor = 'rgba(34,197,94,0.2)';
            ticker.parentElement.style.background = 'rgba(34,197,94,0.05)';
            if (tickerIcon) tickerIcon.className = 'fa-solid fa-circle-check ticker-icon';
            if (tickerIcon) tickerIcon.style.color = '#22c55e';
        }
    }

    // ── Field Detail Modal ─────────────────────────────────
    function openFieldModal(field) {
        const rec = field.recommendation;
        if (!rec) {
            alert(i18n.noData);
            return;
        }

        const wr = rec.water_recommendation;
        const fh = rec.field_health;
        const ndvi = fh.ndvi || field.satellite_ndvi || 0;
        const ndwi = fh.ndwi || field.satellite_ndwi || -0.1;
        const geeSource = rec.gee_source || 'fallback';
        const imgDate = rec.satellite_image_date || '';

        document.getElementById('modalTitle').textContent = `${field.field_id} — ${field.name}`;

        const body = document.getElementById('modalBody');
        body.innerHTML = `
            <div class="detail-grid">
                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-solid fa-droplet"></i> ${i18n.system}</div>
                    <div class="detail-box-value" style="color:${wr.irrigate_today ? 'var(--accent)' : 'var(--text-primary)'}">
                        ${wr.irrigate_today ? wr.amount_mm + ' ' + i18n.mm : i18n.notNeeded}
                    </div>
                    <div class="detail-box-sub">
                        ${wr.irrigate_today
                            ? `${i18n.liters}: ${formatLiters(wr.total_liters_field)} · ${wr.irrigation_duration_hours} ${i18n.hours}`
                            : i18n.sufficientMoisture
                        }
                    </div>
                </div>

                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-regular fa-clock"></i> ${i18n.bestTime}</div>
                    <div class="detail-box-value">${wr.best_irrigation_time}</div>
                    <div class="detail-box-sub">
                        ${wr.compared_to_yesterday_percent > 0 ? '↑' : wr.compared_to_yesterday_percent < 0 ? '↓' : '→'}
                        ${Math.abs(wr.compared_to_yesterday_percent)}% ${i18n.vsNorm}
                    </div>
                </div>

                <div class="detail-box">
                    <div class="detail-box-title">
                        <i class="fa-solid fa-satellite"></i> ${i18n.satIndices}
                        <span class="gee-source-tag ${geeSource === 'GEE' ? 'gee-live' : 'gee-fallback'}">
                            ${geeSource === 'GEE' ? '🛰 GEE' : '📊 Fallback'}
                        </span>
                    </div>
                    <div class="ndvi-ndwi-bars">
                        <div class="index-bar-row">
                            <span class="index-label">NDVI</span>
                            <div class="index-track">
                                <div class="index-fill ndvi-fill" style="width:${Math.max(0,ndvi)*100}%"></div>
                            </div>
                            <span class="index-val">${ndvi.toFixed(3)}</span>
                            <span class="status-badge ${getStatusClass('ndvi', fh.ndvi_status)}">${statusMap[fh.ndvi_status] || fh.ndvi_status}</span>
                        </div>
                        <div class="index-bar-row">
                            <span class="index-label">NDWI</span>
                            <div class="index-track">
                                <div class="index-fill ndwi-fill" style="width:${Math.max(0,(ndwi+1)/2)*100}%"></div>
                            </div>
                            <span class="index-val">${ndwi.toFixed(3)}</span>
                            <span class="status-badge ${getNdwiClass(fh.ndwi_status || getNdwiStatusLocal(ndwi))}">${statusMap[fh.ndwi_status || getNdwiStatusLocal(ndwi)]}</span>
                        </div>
                    </div>
                    ${imgDate ? `<div class="detail-box-sub" style="margin-top:0.5rem">📅 ${i18n.imgDate}: ${imgDate}</div>` : ''}
                </div>

                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-solid fa-leaf"></i> ${i18n.fieldCondition}</div>
                    <div>
                        <span class="status-badge ${getStatusClass('crop', fh.crop_condition)}">${statusMap[fh.crop_condition] || fh.crop_condition}</span>
                    </div>
                    <div class="detail-box-sub" style="margin-top:0.5rem">
                        ${i18n.soil}: ${statusMap[fh.soil_moisture_status] || fh.soil_moisture_status} · ${i18n.yieldRisk}: ${statusMap[fh.estimated_yield_risk] || fh.estimated_yield_risk}
                    </div>
                </div>

                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-solid fa-clipboard-list"></i> ${i18n.fieldInfo}</div>
                    <div class="detail-box-sub">
                        <strong>${i18n.crop}:</strong> ${cropMap[field.crop_type] || field.crop_type} (${stageMap[field.crop_growth_stage] || field.crop_growth_stage})<br>
                        <strong>${i18n.area}:</strong> ${field.area_hectares} ${i18n.ha}<br>
                        <strong>${i18n.system}:</strong> ${systemMap[field.irrigation_system] || field.irrigation_system}<br>
                        <strong>${i18n.region}:</strong> ${field.region}
                    </div>
                </div>

                <div class="detail-box full-width">
                    <div class="detail-box-title"><i class="fa-solid fa-brain"></i> ${i18n.aiAnalysis}</div>
                    <div class="detail-box-sub">${rec.admin_insight}</div>
                </div>

                <div class="detail-box full-width">
                    <div class="detail-box-title"><i class="fa-solid fa-mobile-screen"></i> ${i18n.smsFarmer}</div>
                    <div class="detail-box-sub">
                        <strong>RU:</strong> ${rec.farmer_sms_message.ru}<br>
                        <strong>UZ:</strong> ${rec.farmer_sms_message.uz}
                    </div>
                </div>

                <div class="detail-box full-width">
                    <div class="detail-box-title"><i class="fa-solid fa-chart-line"></i> ${i18n.forecast3Days}</div>
                    <table class="forecast-table">
                        <thead><tr><th>${i18n.date}</th><th>${i18n.waterNeed}</th><th>${i18n.confidence}</th></tr></thead>
                        <tbody>
                            ${rec.next_irrigation_forecast.map(f => `
                                <tr>
                                    <td>${f.date}</td>
                                    <td>${f.predicted_need_mm} ${i18n.mm}</td>
                                    <td><span class="status-badge ${f.confidence === 'high' ? 'status-good' : f.confidence === 'medium' ? 'status-moderate' : 'status-severe'}">${statusMap[f.confidence] || f.confidence}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="detail-box full-width">
                    <div class="detail-box-title">🔍 ${i18n.calculationProcess}</div>
                    <div class="reasoning-trace">${rec.reasoning_trace}</div>
                </div>
            </div>
        `;

        document.getElementById('modalOverlay').style.display = 'flex';
        currentSelectedFieldId = field.field_id;
    }

    function closeModal() {
        document.getElementById('modalOverlay').style.display = 'none';
        currentSelectedFieldId = null;
    }

    // ── Actions ─────────────────────────────────────────────

    function handleFieldCreate(e) {
        e.preventDefault();
        const btn = document.getElementById('createFieldSubmitBtn');
        const origText = btn.textContent;
        btn.textContent = i18n.processing;
        btn.disabled = true;

        const payload = {
            name: document.getElementById('newFieldName').value,
            irrigation_system: document.getElementById('newFieldSystem').value,
            region: document.getElementById('newFieldRegion').value,
            polygon_coords: currentDrawingCoords
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
        .then(data => {
            closeCreatePanel();
            fetchDashboardData();
        })
        .catch(err => {
            alert("Failed to create field.");
            console.error(err);
        })
        .finally(() => {
            btn.textContent = origText;
            btn.disabled = false;
        });
    }

    function handleFieldRefresh() {
        if (!currentSelectedFieldId) return;
        const btn = document.getElementById('refreshFieldBtn');
        const origText = btn.textContent;
        btn.textContent = i18n.refreshing;
        btn.disabled = true;

        fetch(`/api/fields/${currentSelectedFieldId}/refresh/`, { method: 'POST' })
        .then(r => r.json())
        .then(() => {
            closeModal();
            fetchDashboardData();
        })
        .catch(err => alert("Failed to refresh field."))
        .finally(() => {
            btn.textContent = origText;
            btn.disabled = false;
        });
    }

    function handleFieldDelete() {
        if (!currentSelectedFieldId) return;
        if (!confirm(i18n.deleteConfirm)) return;

        const btn = document.getElementById('deleteFieldBtn');
        btn.textContent = i18n.deleting;
        btn.disabled = true;

        fetch(`/api/fields/${currentSelectedFieldId}/delete/`, { method: 'DELETE' })
        .then(() => {
            closeModal();
            fetchDashboardData();
        })
        .catch(err => alert("Failed to delete field."))
        .finally(() => {
            btn.textContent = '🗑️ Удалить';
            btn.disabled = false;
        });
    }

    // ── Helpers ─────────────────────────────────────────────
    function formatLiters(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return n;
    }

    function getStatusClass(type, value) {
        if (type === 'ndvi') {
            if (value === 'healthy') return 'status-healthy';
            if (value === 'moderate_stress') return 'status-moderate';
            return 'status-severe';
        }
        if (type === 'crop') {
            if (value === 'good') return 'status-good';
            if (value === 'needs_attention') return 'status-attention';
            return 'status-critical';
        }
        return '';
    }

    function getNdwiClass(status) {
        if (status === 'wet') return 'status-healthy';
        if (status === 'moist') return 'status-good';
        if (status === 'dry') return 'status-moderate';
        return 'status-severe';
    }

    function getNdwiStatusLocal(ndwi) {
        if (ndwi >= 0.1) return 'wet';
        if (ndwi >= -0.1) return 'moist';
        if (ndwi >= -0.3) return 'dry';
        return 'very_dry';
    }

})();
