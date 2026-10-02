# 🚛 FMCSA HOS Smart Route & ELD Log Planner

[![FMCSA Part 395 Compliant](https://img.shields.io/badge/FMCSA-49_CFR_Part_395-emerald.svg)](https://www.fmcsa.dot.gov/regulations/hours-of-service)
[![Clean Architecture](https://img.shields.io/badge/Architecture-Clean_Architecture-blue.svg)](#-clean-architecture--system-design)
[![Django REST Framework](https://img.shields.io/badge/Backend-Django_5_+_DRF-092E20.svg?logo=django)](backend/)
[![React + Vite + Leaflet](https://img.shields.io/badge/Frontend-React_19_+_Vite_+_Tailwind_v4-61DAFB.svg?logo=react)](frontend/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, high-aesthetic web application designed for commercial motor vehicle (CMV) fleet operators and compliance officers. It simulates property-carrying driver trips under the federal **70-Hour / 8-Day** rule, calculates real-world highway routes via **OSRM**, enforces mandatory rest and fueling stops, and renders **pixel-perfect, 24-hour SVG electronic driver duty log sheets (Form MCS-59 / RODS)** that are print- and inspection-ready.

---

## 📑 Table of Contents
1. [Core Features & Compliance Rules](#-core-features--compliance-rules)
2. [Clean Architecture & System Design](#-clean-architecture--system-design)
3. [Quick Test Scenarios (1-Click Presets)](#-quick-test-scenarios-1-click-presets)
4. [Tech Stack](#-tech-stack)
5. [Local Development Setup](#-local-development-setup)
6. [Automated Verification & Unit Tests](#-automated-verification--unit-tests)
7. [API Contract & Schema](#-api-contract--schema)
8. [Production Deployment Guide](#-production-deployment-guide)
9. [Loom Video Presentation Script](#-loom-video-presentation-script-3-5-mins)

---

## 🛡️ Core Features & Compliance Rules

Strictly adheres to **49 CFR Part 395 (Hours of Service of Drivers)**:
- **11-Hour Driving Limit (§395.3(a)(3)(i)):** Max 11 hours cumulative driving following 10 consecutive hours off-duty.
- **14-Hour Duty Window (§395.3(a)(2)):** Prohibits driving beyond the 14th consecutive hour after coming on duty.
- **30-Minute Rest Break (§395.3(a)(3)(ii)):** Mandatory 30-minute off-duty break after 8 cumulative hours of driving.
- **10-Hour Daily Reset (§395.3(a)(1)):** Consecutive 10-hour sleeper berth/off-duty rest resetting the 11h driving and 14h window clocks.
- **70-Hour / 8-Day Weekly Limit & 34-Hour Restart (§395.3(b)(2) & §395.3(d)):** Triggers a 34-hour restart when cumulative duty hours reach 70.0h, resetting the weekly cycle.
- **Commercial Truck Speed & Operations:**
  * Average speed: 60.0 mph.
  * Pre-Trip Inspection: 15 minutes (0.25h) On-Duty at departure.
  * Shipper Loading (Pickup): 1.0 hour On-Duty.
  * Consignee Unloading (Dropoff): 1.0 hour On-Duty.
  * Mandatory Fueling Stop: 30 minutes (0.5h) On-Duty every 1,000 driving miles.
  * Post-Trip Inspection: 15 minutes (0.25h) On-Duty at destination.
- **Mathematical Log Invariant:** Every generated 24-hour log sheet (00:00 to 24:00) strictly satisfies:
  $$\text{Off Duty} + \text{Sleeper Berth} + \text{Driving} + \text{On Duty} = 24.0 \text{ Hours (Exact)}$$

---

## 🏗️ Clean Architecture & System Design

```
FMCSA-HOS-ELD/
├── backend/
│   ├── manage.py
│   ├── config/                          # Django Settings & URLconf
│   └── apps/
│       └── hos_planner/
│           ├── domain/                  # 1. PURE DOMAIN LAYER (Zero Framework Dependencies)
│           │   ├── entities.py          # Value Objects & Dataclasses (DutyStatus, DailyLog)
│           │   └── rules.py             # Pure HOS Simulation & 24h Midnight Split Algorithm
│           ├── infrastructure/          # 2. INFRASTRUCTURE LAYER (External Integrations)
│           │   ├── geocoding.py         # Nominatim Client with In-Memory Cache & US Fallbacks
│           │   └── routing.py           # OSRM Highway Client with Haversine Polyline Fallback
│           ├── use_cases/               # 3. APPLICATION LAYER (Business Logic Orchestrator)
│           │   └── plan_trip.py         # Coordinates Geocode -> Route -> HOS -> Output DTO
│           ├── presentation/            # 4. PRESENTATION LAYER (REST API Endpoints)
│           │   ├── serializers.py       # DRF Request/Response Serializers & Input Validation
│           │   └── views.py             # POST /api/plan-trip/ & GET /api/health/
│           └── tests/                   # 5. AUTOMATED TESTS
│               ├── test_domain_rules.py # Pure Domain Math & Invariant Tests
│               └── test_api_endpoints.py# REST API Integration Tests
└── frontend/
    ├── src/
    │   ├── domain/presets.js            # 1-Click Evaluation Presets
    │   ├── services/api.js              # Fetch Client & Backend Error Handler
    │   ├── components/
    │   │   ├── Navbar.jsx               # Header, Live API Badge & Print Button
    │   │   ├── TripForm.jsx             # Input Form & Interactive 70h Gauge
    │   │   ├── TripStats.jsx            # KPIs & Stop Categorization Cards
    │   │   ├── RouteMap.jsx             # Interactive Leaflet Map with Custom Stop Pins
    │   │   ├── EldLogSheet.jsx          # Pixel-Perfect FMCSA 24h SVG Grid & Stepped Path
    │   │   └── RemarksTable.jsx         # Duty Status Change Remarks (§395.8)
    │   ├── App.jsx
    │   └── index.css                    # Tailwind CSS v4 & @media print Styles
```

---

## 🚀 Quick Test Scenarios (1-Click Presets)

The application includes 3 built-in demo scenarios located right on top of the form for instant evaluation:

| Preset Name | Route | Cycle Used | Target Outcome |
|---|---|---|---|
| **Preset 1: Official FMCSA Guide** | Chicago, IL ➔ Indianapolis, IN ➔ Dallas, TX | 15.5h | ~1,080 mi, 10-Hour Overnight Sleeper Berth Rest, Fuel Stop, 2 Daily Logs (24h each). |
| **Preset 2: Cross-Country Long Haul** | Los Angeles, CA ➔ Phoenix, AZ ➔ Atlanta, GA | 25.0h | 2,200+ mi, Multi-day Overnight Resets, Multiple 30-min Breaks, 2+ Fuel Stops. |
| **Preset 3: Near Cycle Limit (34h Restart)** | Seattle, WA ➔ Boise, ID ➔ Salt Lake City, UT | 64.0h | Crosses 70.0h threshold ➔ Automatically injects a **34-Hour Restart** resetting weekly cycle. |

---

## 💻 Tech Stack

- **Backend:** Python 3.12, Django 5.x / 6.x, Django REST Framework, Django CORS Headers, Gunicorn, WhiteNoise.
- **Frontend:** React 19, Vite, Tailwind CSS v4, Leaflet & React-Leaflet, Lucide React.
- **Mapping & Routing:** OpenStreetMap Nominatim (Geocoding) + Project OSRM (Routing).
- **Deployment:** Render (Backend API) + Vercel (Frontend SPA).

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- Python 3.12+ (or `uv` installed)
- Node.js 18+ & npm

### 2. Backend Setup
```powershell
cd backend
# Create virtual environment and install packages
uv venv --python 3.12
.\.venv\Scripts\activate
uv pip install -r requirements.txt

# Run migrations and start server
python manage.py migrate
python manage.py runserver 8000
```
Backend API will be live at `http://localhost:8000`.  
Health check endpoint: `http://localhost:8000/api/health/`

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Frontend web application will be live at `http://localhost:5173`.

---

## 🧪 Automated Verification & Unit Tests

Run the full automated test suite (11 unit and integration tests):
```powershell
cd backend
python manage.py test apps.hos_planner
```
**Test Coverage Includes:**
- Strict validation that every Daily Log sums to **24.0 hours**.
- 11-Hour driving limit and 10-Hour sleeper berth reset verification.
- 14-Hour consecutive duty window limit verification.
- Mandatory 30-minute rest break after 8 hours driving.
- Commercial fueling stop scheduled every 1,000 driving miles.
- 70-Hour cycle limit triggering 34-Hour restart.
- Midnight boundary (00:00 - 24:00) interval slicing.
- API validation errors (negative cycle, cycle > 70, missing fields, identical locations).

---

## 📡 API Contract & Schema

### `POST /api/plan-trip/`
#### Request:
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Indianapolis, IN",
  "dropoff_location": "Dallas, TX",
  "current_cycle_used": 15.5
}
```

#### Response Structure:
```json
{
  "trip_summary": {
    "total_miles": 1080.3,
    "total_driving_hours": 19.46,
    "total_duration_hours": 32.21,
    "fuel_stops_count": 1,
    "mandatory_rest_stops_count": 1,
    "daily_reset_stops_count": 1,
    "cycle_reset_stops_count": 0,
    "pickup_location": "Indianapolis, Indiana, USA",
    "dropoff_location": "Dallas, Texas, USA",
    "initial_cycle_used": 15.5,
    "final_cycle_used": 37.7
  },
  "route_coordinates": [[41.8781, -87.6298], [39.7684, -86.1581], ...],
  "stops": [
    {
      "name": "Pre-Trip Inspection",
      "type": "START",
      "location": "Chicago, Illinois, USA",
      "duration_hours": 0.25,
      "duty_status": "ON_DUTY",
      "accumulated_miles": 0.0,
      "arrival_time_hrs": 0.0,
      "lat": 41.8781,
      "lng": -87.6298
    },
    ...
  ],
  "daily_logs": [
    {
      "day_number": 1,
      "date": "2026-10-02",
      "miles_today": 540.2,
      "hours_summary": {
        "OFF_DUTY": 0.5,
        "SLEEPER_BERTH": 10.0,
        "DRIVING": 11.0,
        "ON_DUTY": 2.5,
        "TOTAL": 24.0
      },
      "duty_intervals": [...],
      "remarks": [...]
    }
  ]
}
```

---

## 🌐 Production Deployment Guide

### Backend on [Render](https://render.com)
1. Fork or push this repository to GitHub.
2. Log in to Render ➔ **New Web Service** ➔ Connect your repository.
3. Configure the service:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
4. In Environment Variables, set:
   - `PYTHON_VERSION`: `3.12.15`
   - `ALLOWED_HOSTS`: `*`
   - `CORS_ALLOW_ALL_ORIGINS`: `True`

### Frontend on [Vercel](https://vercel.com)
1. In Vercel Dashboard ➔ **Add New Project** ➔ Import repository.
2. Configure settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. In Environment Variables, set:
   - `VITE_API_URL`: Your live Render backend URL (e.g., `https://fmcsa-hos-api.onrender.com`).
4. Click **Deploy**.

---

## 🎥 Loom Video Presentation Script (3 - 5 Mins)

### English Version:
> **[0:00 - 0:45] Introduction & Compliance Overview:**  
> "Hello everyone! Today I'm presenting the **FMCSA HOS Smart Route & ELD Log Planner**, a production-grade full-stack solution built with Django REST Framework and React. This system doesn't just calculate highway paths; it strictly enforces federal motor carrier safety regulations under **49 CFR Part 395 (Property-Carrying 70hr/8-Day Rule)**."
>
> **[0:45 - 2:00] Live Demo & Route Simulation:**  
> "Let's test our primary scenario using the 1-click preset on top: Chicago to Indianapolis to Dallas, starting with 15.5 hours already used in the cycle.  
> As we click Calculate:  
> 1. Our geocoding and OSRM routing engine renders the live interstate path on the interactive Leaflet map.  
> 2. The system automatically inserts a 15-minute pre-trip inspection, 1 hour loading at pickup, and 1 hour unloading at dropoff.  
> 3. Notice the stop pins: When driving exceeds the 11-hour daily limit or 14-hour duty window, the engine schedules a **10-hour consecutive sleeper berth rest**, plus a **fueling stop** every 1,000 miles."
>
> **[2:00 - 3:30] Official ELD 24-Hour Grid & Mathematical Invariant:**  
> "Now let's examine the crown jewel: the **Official ELD Log Sheets**.  
> Rendered directly in SVG, this matches the FMCSA Form MCS-59 paper log. Each sheet spans from midnight to midnight (00:00 to 24:00).  
> Notice the continuous stepped line across the 4 rows: Off Duty, Sleeper Berth, Driving, and On Duty. Look at the Total column on the right: **it sums up to exactly 24.0 hours**, mathematically verified with the green audit badge. Below it, the Remarks Table documents every change in duty status with precise timestamps and geographic locations. We also have a print button that generates inspection-ready physical reports."
>
> **[3:30 - 4:30] 34-Hour Restart & Clean Architecture:**  
> "If we switch to Preset 3—where the driver starts with 64 hours already consumed—the system detects that the weekly cycle would exceed 70 hours and immediately schedules a **34-Hour Restart**, resetting the cycle clock.  
> Architecturally, the HOS engine in `domain/rules.py` is written in pure Python with zero Django dependencies, backed by 11 automated unit and integration tests. Thank you!"

---

### النسخة العربية (Arabic Version):
> **[0:00 - 0:45] المقدمة والامتثال لقوانين FMCSA:**  
> "مرحباً بكم جميعاً. اليوم أستعرض معكم مشروع **FMCSA HOS Route & ELD Log Planner**، وهو تطبيق متكامل تم بناؤه باستخدام معمارية نظيفة (Clean Architecture) عبر Django REST Framework و React. التطبيق يطبق بصرامة لوائح السلامة الفيدرالية لنقل البضائع **49 CFR Part 395** وفق قاعدة الـ **70 ساعة / 8 أيام**."
>
> **[0:45 - 2:00] العرض الحي وحساب الرحلة:**  
> "دعونا نجرب السيناريو الرسمي المدمج بنقرة واحدة: الانطلاق من شيكاغو، التحميل في إنديانابوليس، والتفريغ في دالاس مع 15.5 ساعة مستهلكة مسبقاً.  
> بمجرد الضغط على زر الحساب:  
> 1. تقوم خريطة Leaflet التفاعلية برسم المسار السريع وتحديد كافة الوقفات بعلامات ملونة مخصصة.  
> 2. يحتسب النظام آلياً 15 دقيقة فحص أولي، وساعة تحميل، وساعة تفريغ.  
> 3. يقوم النظام بفرض استراحة 30 دقيقة بعد 8 ساعات قيادة، وفرض راحة يومية 10 ساعات متواصلة عند بلوغ سقف 11 ساعة قيادة أو نافذة 14 ساعة، بالإضافة إلى وقفة تزود بالوقود كل 1000 ميل."
>
> **[2:00 - 3:30] شبكة الـ ELD الرسمية والتحقق الرياضي الصارم:**  
> "الميزة الأهم هي **سجلات الـ ELD الإلكترونية الرسمية**:  
> قمنا ببناء شبكة SVG فائقة الدقة تحاكي نموذج FMCSA الورقي (Form MCS-59). السجل مقسم من منتصف الليل إلى منتصف الليل (00:00 إلى 24:00)، مع خط متدرج يوضح الانتقال بين الحالات الأربع. في عمود المجموع على اليمين، نرى أن **المجموع يطابق 24.0 ساعة بالضبط** مع علامة تدقيق خضراء، يليه جدول الملاحظات الرسمي مع زر مخصص لطباعة وتصدير التقارير التفتيشية."
>
> **[3:30 - 4:30] سيناريو الـ 34h Restart والمعمارية النظيفة:**  
> "عند اختيار السيناريو الثالث حيث يبدأ السائق بـ 64 ساعة مستهلكة، يكتشف النظام فوراً اقتراب سقف الـ 70 ساعة ويقوم تلقائياً بجدولة **استراحة 34 ساعة (34-Hour Restart)** لإعادة تصفير العداد.  
> برمجياً، تم فصل محرك القوانين بالكامل في طبقة Domain نقية خالية من أي تبعيات لإطار العمل، ومدعومة بـ 11 اختباراً مؤتمتاً ناجحاً 100%. شكراً لكم!"

---

## 📄 License
This project is licensed under the MIT License.
