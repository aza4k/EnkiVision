/**
 * AgroWater Dashboard — Frontend Application
 * ============================================
 * Fetches data from /api/dashboard/, renders Leaflet heatmap,
 * populates stat cards, field list, alert feed, and field detail modal.
 */

(function () {
    'use strict';

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
        setInterval(fetchGeeStatus, 120000); // har 2 daqiqada

        // Search filter
        document.getElementById('fieldSearch').addEventListener('input', (e) => {
            filterFieldList(e.target.value.toLowerCase());
        });

        // Modal close
        document.getElementById('modalClose').addEventListener('click', closeModal);
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });

        // Create Panel close
        document.getElementById('createPanelClose').addEventListener('click', closeCreatePanel);

        // Add field button
        document.getElementById('add-field-btn').addEventListener('click', enableDrawingMode);

        // Submit new field
        document.getElementById('createFieldForm').addEventListener('submit', handleFieldCreate);

        // Refresh and Delete handlers
        document.getElementById('refreshFieldBtn').addEventListener('click', handleFieldRefresh);
        document.getElementById('deleteFieldBtn').addEventListener('click', handleFieldDelete);
    });

    // ── Clock ──────────────────────────────────────────────
    function updateClock() {
        const now = new Date();
        const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' };
        document.getElementById('navTime').textContent = now.toLocaleTimeString('en-GB', opts) + ' UZT';
    }

    // ── Leaflet Map ────────────────────────────────────────
    let ndviLayer = null;
    let ndwiLayer = null;
    let mapLayersControl = null;

    function initMap() {
        // Nukus hududi chegarasi
        const nukusBounds = L.latLngBounds(
            [42.25, 59.35], // SouthWest
            [42.65, 59.85]  // NorthEast
        );

        map = L.map('map', {
            center: [42.4531, 59.6104],
            zoom: 11,
            minZoom: 10,
            maxBounds: nukusBounds,
            maxBoundsViscosity: 1.0,
            zoomControl: true,
            attributionControl: false,
        });

        // Base Layers
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
        }).addTo(map);

        const bordersLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
        }).addTo(map);

        // Layer Control
        const baseMaps = {
            "Sun'iy yo'ldosh": satelliteLayer
        };
        const overlayMaps = {
            "Chegaralar & Joy nomlari": bordersLayer
        };
        mapLayersControl = L.control.layers(baseMaps, overlayMaps, { position: 'topleft' }).addTo(map);

        // Setup Draw tool
        drawControl = new L.Control.Draw({
            draw: {
                polyline: false,
                circle: false,
                rectangle: true,
                marker: false,
                circlemarker: false,
                polygon: {
                    allowIntersection: false,
                    showArea: true,
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
                    mapLayersControl.addOverlay(ndviLayer, "🛰️ NDVI (O'simlik qatlami)");
                    mapLayersControl.addOverlay(ndwiLayer, "💧 NDWI (Namlik qatlami)");
                }
            })
            .catch(err => console.log('GEE qatlamlari yuklanmadi', err));
    }

    let drawControl = null;
    let tempDrawnLayer = null;
    let currentDrawingCoords = null;
    let currentSelectedFieldId = null;

    function enableDrawingMode() {
        if (!drawControl) return;
        map.addControl(drawControl);
        // Automatically start polygon tool
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
        // Clear existing
        fieldMarkers.forEach((m) => map.removeLayer(m));
        fieldMarkers = [];

        fields.forEach((f) => {
            const color = getHeatmapColor(f.heatmap_value || 0);
            let mapFeature;

            if (f.polygon_coords && f.polygon_coords.length > 0) {
                // Render as polygon
                mapFeature = L.polygon(f.polygon_coords, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.3,
                    weight: 3,
                }).addTo(map);
            } else {
                // Fallback to circle marker
                const radius = 12 + (f.heatmap_value || 0) * 12;
                mapFeature = L.circleMarker([f.latitude, f.longitude], {
                    radius: radius,
                    fillColor: color,
                    fillOpacity: 0.7,
                    color: color,
                    weight: 2,
                    opacity: 0.9,
                }).addTo(map);
            }

            mapFeature.bindTooltip(
                `<strong>${f.field_id}</strong><br>${f.name}<br>` +
                `${f.crop_type} · ${f.region}<br>` +
                `Срочность: ${(f.heatmap_value * 100).toFixed(0)}%`,
                { className: 'custom-tooltip' }
            );

            mapFeature.on('click', () => openFieldModal(f));
            fieldMarkers.push(mapFeature);
        });

        // Fit map bounds
        if (fields.length > 0) {
            const group = L.featureGroup(fieldMarkers);
            // Offset for the left sidebar so fields don't load underneath it
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
                icon.className = data.connected
                    ? 'fa-solid fa-satellite-dish'
                    : 'fa-solid fa-circle-xmark';
                text.textContent = data.connected ? 'GEE Online' : 'GEE Fallback';
                badge.style.color = data.connected ? '#22c55e' : '#eab308';
                badge.title = data.mode || 'GEE holati';
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
                document.getElementById('tickerText').textContent =
                    'Не удалось загрузить данные. Проверьте соединение с сервером.';
            });
    }

    // ── Summary Cards ──────────────────────────────────────
    function renderSummaryCards(summary) {
        animateNumber('totalFields', summary.total_fields);
        animateNumber('fieldsNeeding', summary.fields_needing_irrigation);
        animateNumber('criticalAlerts', summary.critical_alerts);
        document.getElementById('avgNDVI').textContent = summary.avg_ndvi.toFixed(2);

        // Color coding
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
                const level = rec ? rec.recommendation_level : 'none';
                const color = getHeatmapColor(f.heatmap_value || 0);

                const item = document.createElement('div');
                item.className = 'field-item';
                item.dataset.name = (f.name + ' ' + f.field_id + ' ' + f.crop_type + ' ' + f.region).toLowerCase();
                item.innerHTML = `
                    <div class="field-urgency-dot" style="background:${color};box-shadow:0 0 6px ${color}40"></div>
                    <div class="field-item-info">
                        <div class="field-item-name">${f.name}</div>
                        <div class="field-item-meta">${f.crop_type} · ${f.region} · ${f.irrigation_system}</div>
                    </div>
                    <div class="field-item-amount" style="color:${color}">
                        ${amount > 0 ? amount + ' mm' : '✓ OK'}
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
            if (f.alerts) {
                f.alerts.forEach((a) => {
                    allAlerts.push({
                        type: a.alert_type,
                        severity: a.severity,
                        message: a.message,
                        field_id: f.field_id,
                        field_name: f.name,
                    });
                });
            }
        });

        // De-dup by message
        const seen = new Set();
        allAlerts = allAlerts.filter((a) => {
            const key = a.field_id + a.message;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Sort: critical first
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        allAlerts.sort((a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9));

        if (allAlerts.length === 0) {
            container.innerHTML = '<div class="loading-placeholder"><i class="fa-solid fa-leaf"></i> Нет активных уведомлений — все поля в норме</div>';
            return;
        }

        allAlerts.slice(0, 12).forEach((a) => {
            const el = document.createElement('div');
            el.className = `alert-item severity-${a.severity}`;
            el.innerHTML = `
                <span class="alert-severity-badge">${a.severity}</span>
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
            if (f.alerts) critCount += f.alerts.filter((a) => a.severity === 'critical').length;
        });

        const ticker = document.getElementById('tickerText');
        const tickerIcon = document.querySelector('.ticker-icon');
        if (critCount > 0) {
            ticker.textContent = `Требуется внимание: критических уведомлений - ${critCount}`;
            ticker.parentElement.style.borderColor = 'rgba(239,68,68,0.4)';
            ticker.parentElement.style.background = 'rgba(239,68,68,0.1)';
            if (tickerIcon) tickerIcon.className = 'fa-solid fa-triangle-exclamation ticker-icon';
        } else {
            ticker.textContent = 'ТЕСТОВЫЙ РЕЖИМ: Все системы работают в штатном режиме';
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
            alert('Bu dala uchun tavsiya ma\'lumotlari mavjud emas.');
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
                <!-- Water Recommendation -->
                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-solid fa-droplet"></i> Sug'orish tavsiyasi</div>
                    <div class="detail-box-value" style="color:${wr.irrigate_today ? 'var(--accent)' : 'var(--text-primary)'}">
                        ${wr.irrigate_today ? wr.amount_mm + ' mm' : 'Sug\'orish shart emas'}
                    </div>
                    <div class="detail-box-sub">
                        ${wr.irrigate_today
                            ? `Jami ${formatLiters(wr.total_liters_field)} litr · ${wr.irrigation_duration_hours} soat`
                            : 'Dala namligi yetarli'
                        }
                    </div>
                </div>

                <!-- Best Time -->
                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-regular fa-clock"></i> Sug'orish vaqti</div>
                    <div class="detail-box-value">${wr.best_irrigation_time}</div>
                    <div class="detail-box-sub">
                        ${wr.compared_to_yesterday_percent > 0 ? '↑' : wr.compared_to_yesterday_percent < 0 ? '↓' : '→'}
                        ${Math.abs(wr.compared_to_yesterday_percent)}% normadan
                    </div>
                </div>

                <!-- NDVI + NDWI Satellite -->
                <div class="detail-box">
                    <div class="detail-box-title">
                        <i class="fa-solid fa-satellite"></i> Yo'ldosh ko'rsatkichlari
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
                            <span class="status-badge ${getStatusClass('ndvi', fh.ndvi_status)}">${fh.ndvi_status}</span>
                        </div>
                        <div class="index-bar-row">
                            <span class="index-label">NDWI</span>
                            <div class="index-track">
                                <div class="index-fill ndwi-fill" style="width:${Math.max(0,(ndwi+1)/2)*100}%"></div>
                            </div>
                            <span class="index-val">${ndwi.toFixed(3)}</span>
                            <span class="status-badge ${getNdwiClass(fh.ndwi_status || getNdwiStatusLocal(ndwi))}">${fh.ndwi_status || getNdwiStatusLocal(ndwi)}</span>
                        </div>
                    </div>
                    ${imgDate ? `<div class="detail-box-sub" style="margin-top:0.5rem">📅 Tasvir sanasi: ${imgDate}</div>` : ''}
                </div>

                <!-- Crop Health -->
                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-solid fa-leaf"></i> Dala holati</div>
                    <div>
                        <span class="status-badge ${getStatusClass('crop', fh.crop_condition)}">${fh.crop_condition}</span>
                    </div>
                    <div class="detail-box-sub" style="margin-top:0.5rem">
                        Tuproq: ${fh.soil_moisture_status} · Hosil xavfi: ${fh.estimated_yield_risk}
                    </div>
                </div>

                <!-- Field Info -->
                <div class="detail-box">
                    <div class="detail-box-title"><i class="fa-solid fa-clipboard-list"></i> Dala ma'lumotlari</div>
                    <div class="detail-box-sub">
                        <strong>Ekin:</strong> ${field.crop_type} (${field.crop_growth_stage})<br>
                        <strong>Maydon:</strong> ${field.area_hectares} ga<br>
                        <strong>Tizim:</strong> ${field.irrigation_system}<br>
                        <strong>Hudud:</strong> ${field.region}
                    </div>
                </div>

                <!-- AI Insight -->
                <div class="detail-box full-width">
                    <div class="detail-box-title"><i class="fa-solid fa-brain"></i> Sun'iy intellekt tahlili</div>
                    <div class="detail-box-sub">${rec.admin_insight}</div>
                </div>

                <!-- SMS -->
                <div class="detail-box full-width">
                    <div class="detail-box-title"><i class="fa-solid fa-mobile-screen"></i> Fermer uchun SMS</div>
                    <div class="detail-box-sub">
                        <strong>UZ:</strong> ${rec.farmer_sms_message.uz}<br>
                        <strong>RU:</strong> ${rec.farmer_sms_message.ru}
                    </div>
                </div>

                <!-- Forecast -->
                <div class="detail-box full-width">
                    <div class="detail-box-title"><i class="fa-solid fa-chart-line"></i> 3 kunlik prognoz</div>
                    <table class="forecast-table">
                        <thead><tr><th>Sana</th><th>Suv talab (mm)</th><th>Ishonch</th></tr></thead>
                        <tbody>
                            ${rec.next_irrigation_forecast.map(f => `
                                <tr>
                                    <td>${f.date}</td>
                                    <td>${f.predicted_need_mm} mm</td>
                                    <td><span class="status-badge ${f.confidence === 'high' ? 'status-good' : f.confidence === 'medium' ? 'status-moderate' : 'status-severe'}">${f.confidence}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Reasoning -->
                <div class="detail-box full-width">
                    <div class="detail-box-title">🔍 Hisoblash jarayoni</div>
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
        btn.textContent = 'Processing...';
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
            alert("Failed to create field map data.");
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
        btn.textContent = 'Refreshing...';
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
        if (!confirm("Are you sure you want to delete this field permanently? This will remove all associated weather, sensor, and recommendation data.")) return;

        const btn = document.getElementById('deleteFieldBtn');
        btn.textContent = 'Deleting...';
        btn.disabled = true;

        fetch(`/api/fields/${currentSelectedFieldId}/delete/`, { method: 'DELETE' })
        .then(() => {
            closeModal();
            fetchDashboardData();
        })
        .catch(err => alert("Failed to delete field."))
        .finally(() => {
            btn.textContent = '🗑️ Delete';
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
