/* ============================================================================
   SENTINELAI :: AI MOBILITY SAFETY ECOSYSTEM
   Stellantis Hackathon 2026 — STLA-SENTINEL
   Single-file ES6 application logic. Preserves original UI/CSS/animations.
   ========================================================================== */

// ============================================================================
// SECTION 0: GLOBAL CONFIG & CONSTANTS
// ============================================================================

// OpenWeather placeholder — replace with a real key to enable live weather.
const WEATHER_API_KEY = "YOUR_API_KEY";
const WEATHER_LAT = 12.9716;
const WEATHER_LON = 77.5946;
const WEATHER_ENDPOINT = `https://api.openweathermap.org/data/2.5/weather?lat=${WEATHER_LAT}&lon=${WEATHER_LON}&units=metric&appid=${WEATHER_API_KEY}`;

// Bangalore map center (REVA University area)
const BLR_CENTER = [12.9716, 77.5946];
const MapTileURL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const MapAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Demo navigation route: REVA University -> Kempegowda International Airport
const ROUTE_REVA_TO_AIRPORT = [
  [13.0053, 77.6141], // REVA University, Kattigenahalli
  [13.0180, 77.6210],
  [13.0350, 77.6280],
  [13.0520, 77.6350],
  [13.0700, 77.6450],
  [13.0870, 77.6520],
  [13.1050, 77.6480],
  [13.1230, 77.6420],
  [13.1500, 77.6480],
  [13.1979, 77.7060]  // Kempegowda International Airport
];

// Alternate ("fastest", congested) route via Hebbal
const ROUTE_REVA_TO_AIRPORT_FAST = [
  [13.0053, 77.6141],
  [13.0250, 77.6050],
  [13.0450, 77.6050],
  [13.0650, 77.6150],
  [13.0850, 77.6300],
  [13.1050, 77.6450],
  [13.1300, 77.6550],
  [13.1979, 77.7060]
];

// Road hazard dataset — Bangalore hotspots
const BLR_HAZARDS = [
  { id: 1, lat: 12.9172, lng: 77.6228, type: 'pothole',      severity: 'Warning',  label: 'Silk Board Junction — deep pothole cluster', risk: 62, recommendation: 'Reduce speed, keep to right lane.', time: '8 mins ago' },
  { id: 2, lat: 13.0358, lng: 77.5970, type: 'accident',     severity: 'Critical', label: 'Hebbal Flyover — reported accident, lane blocked', risk: 88, recommendation: 'Avoid corridor, use Outer Ring Road detour.', time: '4 mins ago' },
  { id: 3, lat: 12.9698, lng: 77.7500, type: 'waterlogging', severity: 'High',     label: 'Whitefield — waterlogged underpass', risk: 70, recommendation: 'Reduce speed, avoid underpass if flooded > 15cm.', time: '12 mins ago' },
  { id: 4, lat: 12.8452, lng: 77.6602, type: 'traffic',      severity: 'High',     label: 'Electronic City — heavy congestion, stop-and-go', risk: 55, recommendation: 'Increase following distance, expect delays.', time: '2 mins ago' },
  { id: 5, lat: 12.9591, lng: 77.6974, type: 'construction', severity: 'Warning',  label: 'Marathahalli Bridge — active lane construction', risk: 58, recommendation: 'Merge early, reduce speed to 30 km/h.', time: '20 mins ago' },
  { id: 6, lat: 12.9352, lng: 77.6245, type: 'signal',       severity: 'Warning',  label: 'Koramangala — broken traffic signal', risk: 48, recommendation: 'Treat as 4-way stop, proceed with caution.', time: '15 mins ago' }
];

const HAZARD_ICONS = {
  pothole: 'alert-triangle',
  accident: 'car-front',
  waterlogging: 'waves',
  traffic: 'gauge',
  construction: 'construction',
  signal: 'traffic-cone'
};

const SEVERITY_COLOR = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Warning: '#f59e0b',
  Low: '#22c55e'
};

// ============================================================================
// SECTION 1: APPLICATION STATE
// ============================================================================
const AppState = {
  user: {
    authenticated: false,
    isGuest: false,
    email: '',
    username: 'Guest',
    avatar: 'G'
  },
  settings: {
    fatigueAlert: true,
    sosActive: true,
    voiceFeedback: true,
    darkHudMode: true,
    vehicleModel: 'Pacifica',
    vin: '1C4RC1HK1JS884321',
    iceName: 'Sarah Doe',
    icePhone: '+1 (313) 555-0143'
  },
  navigation: {
    isNavigating: false,
    chosenRoute: 'safest',
    currentSpeed: 45,
    intervalId: null,
    stepIndex: 0,
    routeCoords: [],
    safestCoords: null,
    fastestCoords: null
  },
  biometrics: {
    blinkRate: 18,
    eyeClosure: 0.24,
    gaze: 'Road Center',
    score: 95,
    fatigueLevel: 5,
    seatbelt: true,
    phoneDistraction: false,
    yawning: 0,
    laneKeeping: 98,
    headPose: 'Centered',
    aggressiveSteering: false,
    intervalId: null
  },
  webcam: {
    stream: null,
    isLive: false,
    animFrameId: null,
    faceBox: { x: 0.35, y: 0.25, w: 0.3, h: 0.45 },
    targetBox: { x: 0.35, y: 0.25, w: 0.3, h: 0.45 },
    blinkCount: 18,
    lastBlink: Date.now(),
    detector: null
  },
  environment: {
    tempC: 27,
    condition: 'Clear',
    visibilityM: 9000,
    windKph: 9,
    rainMm: 0,
    humidity: 55,
    clouds: 20,
    isNight: false,
    lastFetch: 0
  },
  risk: {
    driver: 10,
    weather: 20,
    road: 25,
    traffic: 30,
    time: 10,
    overall: 0,
    category: 'Safe'
  },
  tripScores: {
    driver: 95,
    environmental: 80,
    road: 78,
    trip: 88,
    overall: 86,
    startTime: Date.now(),
    distanceKm: 0
  },
  nearMiss: {
    events: [],
    maxEvents: 25
  },
  emergency: {
    countdown: 10,
    isSOSActive: false,
    countdownId: null,
    ambulanceIntervalId: null,
    ambulanceMarker: null,
    map: null
  },
  hazards: BLR_HAZARDS.slice(),
  maps: {
    dashboard: null,
    safeDrive: null,
    roadIntel: null,
    emergency: null
  },
  charts: {
    bar: null,
    line: null,
    pie: null
  },
  intervals: {
    riskEngine: null,
    tripScoreEngine: null,
    recommendationEngine: null,
    environmentPoll: null,
    nearMissWatcher: null
  }
};

// ============================================================================
// SECTION 2: AI PLACEHOLDER MODULES (browser cannot run YOLO/MediaPipe
// directly — these functions simulate realistic confidence outputs and are
// structured so real model inference can be swapped in without UI changes)
// ============================================================================
class DriverAI {
  // YOLO placeholder — seatbelt detection
  static detectSeatbelt() {
    const confidence = 0.9 + Math.random() * 0.09;
    const buckled = Math.random() > 0.04; // rare unbuckled event
    return { buckled, confidence: Number(confidence.toFixed(2)) };
  }

  // MediaPipe FaceMesh placeholder — eye aspect ratio / closure
  static detectEyeClosure() {
    const ear = 0.22 + Math.random() * 0.10; // eye aspect ratio proxy
    const closed = ear < 0.18;
    return { earValue: Number(ear.toFixed(2)), closed, confidence: Number((0.85 + Math.random() * 0.12).toFixed(2)) };
  }

  static detectBlinkRate() {
    return { blinksPerMinute: Math.floor(Math.random() * 8) + 14, confidence: 0.9 };
  }

  static detectYawning() {
    const mouthAspectRatio = Math.random();
    const yawning = mouthAspectRatio > 0.93;
    return { yawning, confidence: Number((0.8 + Math.random() * 0.15).toFixed(2)) };
  }

  // Placeholder object-detection model for phone-in-hand
  static detectPhone() {
    const phoneDetected = Math.random() > 0.9;
    return { phoneDetected, confidence: Number((0.75 + Math.random() * 0.2).toFixed(2)) };
  }

  // Head pose estimation placeholder (yaw/pitch/roll)
  static detectHeadPose() {
    const yaw = (Math.random() - 0.5) * 40;   // degrees
    const pitch = (Math.random() - 0.5) * 25;
    let pose = 'Centered';
    if (yaw > 15) pose = 'Turned Right';
    else if (yaw < -15) pose = 'Turned Left';
    else if (pitch > 12) pose = 'Looking Down';
    return { yaw: Number(yaw.toFixed(1)), pitch: Number(pitch.toFixed(1)), pose, confidence: 0.88 };
  }

  static detectLaneDeparture() {
    const laneScore = Math.floor(Math.random() * 15) + 84; // 84-99%
    return { laneKeepingScore: laneScore, departing: laneScore < 88, confidence: 0.9 };
  }

  static detectAggressiveSteering() {
    const steeringAngleRate = Math.random() * 60; // deg/sec proxy
    return { aggressive: steeringAngleRate > 45, angleRate: Number(steeringAngleRate.toFixed(1)) };
  }

  // Composite fatigue model combining eye closure + blink + yawning
  static detectFatigue(eyeClosure, blink, yawn) {
    let fatigueScore = 0;
    if (eyeClosure.closed) fatigueScore += 40;
    if (blink.blinksPerMinute < 12 || blink.blinksPerMinute > 24) fatigueScore += 15;
    if (yawn.yawning) fatigueScore += 30;
    fatigueScore += Math.random() * 10;
    return { fatigueScore: Math.min(100, Math.round(fatigueScore)), confidence: 0.87 };
  }

  static detectDistraction(phone, headPose, gaze) {
    let distractionScore = 0;
    if (phone.phoneDetected) distractionScore += 45;
    if (headPose.pose !== 'Centered') distractionScore += 25;
    if (gaze !== 'Road Center') distractionScore += 20;
    return { distractionScore: Math.min(100, Math.round(distractionScore)) };
  }

  // Aggregate 0-100 driver behaviour score
  static computeDriverScore({ seatbelt, fatigue, distraction, lane }) {
    let score = 100;
    if (!seatbelt.buckled) score -= 25;
    score -= fatigue.fatigueScore * 0.35;
    score -= distraction.distractionScore * 0.25;
    score -= (100 - lane.laneKeepingScore) * 0.5;
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}

// ============================================================================
// SECTION 3: ENVIRONMENTAL INTELLIGENCE (OpenWeather integration)
// ============================================================================
class EnvironmentAI {
  static async fetchWeather() {
    // Guard: if no real API key configured, fall back to a realistic
    // simulated reading so the UI keeps functioning end-to-end.
    if (!WEATHER_API_KEY || WEATHER_API_KEY === 'YOUR_API_KEY') {
      return EnvironmentAI.simulateWeather();
    }
    try {
      const res = await fetch(WEATHER_ENDPOINT);
      if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
      const data = await res.json();
      return {
        tempC: data.main?.temp ?? 27,
        condition: data.weather?.[0]?.main ?? 'Clear',
        visibilityM: data.visibility ?? 9000,
        windKph: (data.wind?.speed ?? 2.5) * 3.6,
        rainMm: data.rain?.['1h'] ?? 0,
        humidity: data.main?.humidity ?? 55,
        clouds: data.clouds?.all ?? 20,
        isNight: EnvironmentAI.isNightNow(data)
      };
    } catch (err) {
      console.warn('Weather fetch failed, using simulated telemetry:', err);
      return EnvironmentAI.simulateWeather();
    }
  }

  static isNightNow(data) {
    if (data?.sys?.sunrise && data?.sys?.sunset && data?.dt) {
      return data.dt < data.sys.sunrise || data.dt > data.sys.sunset;
    }
    const hour = new Date().getHours();
    return hour < 6 || hour >= 19;
  }

  // Realistic simulated fallback (no external key required for the demo)
  static simulateWeather() {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Haze', 'Drizzle'];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const rainMm = condition === 'Rain' ? Number((Math.random() * 8 + 1).toFixed(1)) :
                   condition === 'Drizzle' ? Number((Math.random() * 2).toFixed(1)) : 0;
    const hour = new Date().getHours();
    return {
      tempC: Math.round(22 + Math.random() * 10),
      condition,
      visibilityM: condition === 'Haze' ? 2500 + Math.random() * 2000 : 8000 + Math.random() * 2000,
      windKph: Math.round(8 + Math.random() * 20),
      rainMm,
      humidity: Math.round(45 + Math.random() * 40),
      clouds: Math.round(Math.random() * 100),
      isNight: hour < 6 || hour >= 19
    };
  }

  static computeRoadTraction(env) {
    let traction = 100;
    if (env.rainMm > 0) traction -= Math.min(50, env.rainMm * 6);
    if (env.condition === 'Haze') traction -= 10;
    return Math.max(20, Math.round(traction));
  }

  static computeSunGlare(env) {
    const hour = new Date().getHours();
    const lowSunWindow = (hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 19);
    if (env.isNight) return 'None';
    if (lowSunWindow && env.clouds < 40) return 'High';
    if (lowSunWindow) return 'Moderate';
    return 'Low';
  }

  static generateRecommendation(env) {
    const recs = [];
    if (env.rainMm > 3) recs.push('Heavy rain — reduce speed and increase braking distance.');
    else if (env.rainMm > 0) recs.push('Light rain detected — moderate speed reduction advised.');
    if (env.condition === 'Haze' || env.visibilityM < 3000) recs.push('Low visibility — turn on headlights and fog lamps.');
    if (env.windKph > 25) recs.push('Strong crosswinds — hold the steering wheel firmly.');
    if (env.visibilityM < 300) recs.push('Very low visibility — increase following distance significantly.');
    if (env.isNight) recs.push('Night driving — night mode HUD engaged, watch for pedestrians.');
    if (recs.length === 0) recs.push('Conditions nominal — standard safe driving practices apply.');
    return recs.join(' ');
  }
}

// ============================================================================
// SECTION 4: AI RECOMMENDATION ENGINE
// ============================================================================
class RecommendationEngine {
  static build(env, riskState, hazardsNearby) {
    const messages = [];

    if (env.rainMm > 3) messages.push({ type: 'danger', text: 'Heavy Rain Ahead — Reduce Speed' });
    else if (env.rainMm > 0) messages.push({ type: 'warning', text: 'Rain Detected — Increase Following Distance' });

    if (env.condition === 'Haze' || env.visibilityM < 3000) messages.push({ type: 'warning', text: 'Low Visibility — Turn On Headlights' });
    if (env.windKph > 25) messages.push({ type: 'warning', text: 'Strong Wind — Hold Steering Firmly' });
    if (env.isNight) messages.push({ type: 'info', text: 'Night Driving Mode Active' });

    if (hazardsNearby && hazardsNearby.length > 0) {
      messages.push({ type: 'danger', text: `Road Hazard Ahead — ${hazardsNearby[0].label}` });
    }

    if (riskState.category === 'High' || riskState.category === 'Critical') {
      messages.push({ type: 'danger', text: 'Safer Route Available — Reroute Recommended' });
    }

    if (AppState.biometrics.score < 70) messages.push({ type: 'danger', text: 'Take a Break — Fatigue Signs Detected' });

    // Occasional contextual reminders for demo realism
    if (Math.random() < 0.08) messages.push({ type: 'info', text: 'School Zone Ahead — Reduce Speed' });
    if (Math.random() < 0.05) messages.push({ type: 'warning', text: 'Animal Crossing Reported Nearby' });
    if (Math.random() < 0.04) messages.push({ type: 'danger', text: 'Emergency Vehicle Nearby — Yield Right of Way' });

    if (messages.length === 0) messages.push({ type: 'success', text: 'All Systems Nominal — Drive Safely' });

    return messages.slice(0, 4);
  }

  static render() {
    const container = document.getElementById('ai-recommendation-list');
    if (!container) return;
    const nearby = AppState.hazards.slice(0, 1);
    const messages = RecommendationEngine.build(AppState.environment, AppState.risk, nearby);

    const colorMap = {
      danger: 'var(--color-danger)',
      warning: 'var(--color-warning)',
      info: 'var(--color-primary)',
      success: 'var(--color-success)'
    };

    container.innerHTML = messages.map(m => `
      <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px; border-radius: 12px; font-size: 13px;">
        <div style="color: ${colorMap[m.type]}; font-weight: 600; margin-bottom: 4px;">${m.text}</div>
      </div>
    `).join('');
  }
}

// ============================================================================
// SECTION 5: RISK PREDICTION ENGINE
// Weighted formula: Driver 35% | Weather 20% | Road 20% | Traffic 15% | Time 10%
// ============================================================================
class RiskEngine {
  static computeWeatherRisk(env) {
    let risk = 0;
    if (env.rainMm > 5) risk += 60;
    else if (env.rainMm > 0) risk += 30;
    if (env.condition === 'Haze' || env.visibilityM < 3000) risk += 25;
    if (env.windKph > 25) risk += 15;
    return Math.min(100, risk);
  }

  static computeRoadRisk(hazards) {
    if (!hazards || hazards.length === 0) return 15;
    const avg = hazards.reduce((sum, h) => sum + (h.risk || 40), 0) / hazards.length;
    return Math.min(100, Math.round(avg));
  }

  static computeTrafficRisk() {
    const hour = new Date().getHours();
    const isPeak = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
    return isPeak ? 70 + Math.round(Math.random() * 15) : 25 + Math.round(Math.random() * 20);
  }

  static computeTimeRisk(env) {
    return env.isNight ? 60 : 20;
  }

  static computeDriverRisk() {
    return Math.max(0, 100 - AppState.biometrics.score);
  }

  static computeOverallRisk() {
    const driverRisk = RiskEngine.computeDriverRisk();
    const weatherRisk = RiskEngine.computeWeatherRisk(AppState.environment);
    const roadRisk = RiskEngine.computeRoadRisk(AppState.hazards);
    const trafficRisk = RiskEngine.computeTrafficRisk();
    const timeRisk = RiskEngine.computeTimeRisk(AppState.environment);

    const overall = Math.round(
      driverRisk * 0.35 +
      weatherRisk * 0.20 +
      roadRisk * 0.20 +
      trafficRisk * 0.15 +
      timeRisk * 0.10
    );

    let category = 'Safe';
    if (overall > 75) category = 'Critical';
    else if (overall > 50) category = 'High';
    else if (overall > 25) category = 'Moderate';

    AppState.risk = { driver: driverRisk, weather: weatherRisk, road: roadRisk, traffic: trafficRisk, time: timeRisk, overall, category };
    return AppState.risk;
  }

  static renderRiskBreakdown() {
    const r = AppState.risk;
    const setFactor = (idPrefix, value) => {
      const label = document.getElementById(`risk-factor-${idPrefix}`);
      const fill = document.getElementById(`risk-fill-${idPrefix}`);
      if (label) label.textContent = `${value}%`;
      if (fill) {
        fill.style.width = `${value}%`;
        fill.className = `progress-fill ${value > 60 ? 'red' : value > 35 ? 'amber' : 'green'}`;
      }
    };
    setFactor('weather', r.weather);
    setFactor('traffic', r.traffic);
    setFactor('road', r.road);
    setFactor('driver', r.driver);
    setFactor('visibility', Math.min(100, Math.round(100 - (AppState.environment.visibilityM / 100))));
    setFactor('history', r.road); // reuse road/historical density proxy
  }

  static renderGauge() {
    const gaugeBar = document.getElementById('risk-gauge-bar');
    const gaugeVal = document.getElementById('risk-gauge-val');
    const gaugeLabel = document.getElementById('risk-gauge-label');
    if (!gaugeBar) return;

    const riskIndex = AppState.risk.overall;
    const targetOffset = 251 - (251 * (riskIndex / 100));

    gaugeBar.style.transition = 'stroke-dashoffset 1s ease-out, stroke 0.8s';
    gaugeBar.style.strokeDashoffset = targetOffset;

    gaugeBar.classList.remove('success', 'warning', 'danger');
    if (riskIndex <= 30) {
      gaugeBar.classList.add('success');
      gaugeBar.style.stroke = 'var(--color-success)';
    } else if (riskIndex <= 60) {
      gaugeBar.classList.add('warning');
      gaugeBar.style.stroke = 'var(--color-warning)';
    } else {
      gaugeBar.classList.add('danger');
      gaugeBar.style.stroke = 'var(--color-danger)';
    }

    if (gaugeVal) gaugeVal.textContent = riskIndex;
    if (gaugeLabel) gaugeLabel.textContent = AppState.risk.category;

    RiskEngine.renderRiskBreakdown();
  }
}

// ============================================================================
// SECTION 6: TRIP / COMPOSITE SAFETY SCORE ENGINE
// ============================================================================
class ScoreEngine {
  static update() {
    const driverScore = AppState.biometrics.score;
    const envScore = Math.max(0, 100 - RiskEngine.computeWeatherRisk(AppState.environment));
    const roadScore = Math.max(0, 100 - RiskEngine.computeRoadRisk(AppState.hazards));
    const tripScore = Math.round((driverScore + envScore + roadScore) / 3);
    const overall = Math.round(driverScore * 0.4 + envScore * 0.2 + roadScore * 0.2 + tripScore * 0.2);

    AppState.tripScores.driver = driverScore;
    AppState.tripScores.environmental = envScore;
    AppState.tripScores.road = roadScore;
    AppState.tripScores.trip = tripScore;
    AppState.tripScores.overall = overall;

    ScoreEngine.render();
  }

  static render() {
    const s = AppState.tripScores;
    const bind = (valId, barId, val) => {
      const valEl = document.getElementById(valId);
      const barEl = document.getElementById(barId);
      if (valEl) valEl.textContent = val;
      if (barEl) {
        barEl.style.width = `${val}%`;
        barEl.style.background = val > 80 ? 'var(--color-success)' : val > 55 ? 'var(--color-warning)' : 'var(--color-danger)';
      }
    };
    bind('score-driver-val', 'score-driver-bar', s.driver);
    bind('score-env-val', 'score-env-bar', s.environmental);
    bind('score-road-val', 'score-road-bar', s.road);
    bind('score-trip-val', 'score-trip-bar', s.trip);
    bind('score-overall-val', 'score-overall-bar', s.overall);
  }
}

// ============================================================================
// SECTION 7: NEAR-MISS AI EVENT TRACKER
// ============================================================================
class NearMissAI {
  static evaluate() {
    const events = [];
    if (Math.random() < 0.06) events.push({ type: 'Sudden Braking', severity: 'Warning' });
    if (AppState.biometrics.laneKeeping < 88 || Math.random() < 0.04) events.push({ type: 'Lane Drift', severity: 'Warning' });
    if (Math.random() < 0.03) events.push({ type: 'High Steering Angle', severity: 'Warning' });
    if (AppState.navigation.currentSpeed > 55 || Math.random() < 0.03) events.push({ type: 'Overspeed', severity: 'High' });
    if (AppState.biometrics.phoneDistraction) events.push({ type: 'Phone Usage While Driving', severity: 'High' });

    if (events.length > 0) {
      events.forEach(e => NearMissAI.logEvent(e));
      if (events.length > 1) {
        // Multiple concurrent risk events → escalate risk immediately
        AppState.risk.overall = Math.min(100, AppState.risk.overall + 8 * events.length);
        RiskEngine.renderGauge();
      }
    }
  }

  static logEvent(event) {
    const entry = {
      ...event,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    AppState.nearMiss.events.unshift(entry);
    if (AppState.nearMiss.events.length > AppState.nearMiss.maxEvents) {
      AppState.nearMiss.events.pop();
    }
    NearMissAI.render();
  }

  static render() {
    const container = document.getElementById('near-miss-list');
    if (!container) return;
    if (AppState.nearMiss.events.length === 0) {
      container.innerHTML = '<div style="font-size:12px; color: var(--text-muted);">No near-miss events recorded this trip.</div>';
      return;
    }
    const colorMap = { Warning: 'var(--color-warning)', High: 'var(--color-danger)', Critical: 'var(--color-danger)' };
    container.innerHTML = AppState.nearMiss.events.slice(0, 8).map(e => `
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; padding: 6px 8px; background: rgba(255,255,255,0.02); border-radius: 8px;">
        <span style="color:${colorMap[e.severity] || 'var(--text-secondary)'}; font-weight:600;">${e.type}</span>
        <span style="color: var(--text-muted);">${e.time}</span>
      </div>
    `).join('');
  }
}

// Map Tile Service Layer alias kept for backwards compatibility with any inline refs
const MapTileURLAlias = MapTileURL;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  startClock();

  document.getElementById('login-email').value = 'developer@stellantis.com';
  document.getElementById('login-password').value = 'sentinel2026';

  navigateTo('landing');
});

// Clock & HUD weather updating
function startClock() {
  const timeEl = document.getElementById('header-time');
  const updateTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    timeEl.textContent = `${hours}:${minutes} ${ampm}`;
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// --- VOICE ASSISTANCE ENGINE ---
function speakText(text) {
  if (!AppState.settings.voiceFeedback || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1.0;
  utterance.rate = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => voice.name.includes('Google US English') || voice.name.includes('Zira') || voice.lang.startsWith('en'));
  if (femaleVoice) utterance.voice = femaleVoice;
  window.speechSynthesis.speak(utterance);
}

// Predefined voice-assistant phrase bank (Part 8)
const VoiceAssistantPhrases = {
  morning: 'Good morning driver. SentinelAI systems are online and monitoring your safety.',
  seatbelt: 'Seat belt detected. Thank you for buckling up.',
  phoneUsage: 'Phone usage detected. Please keep your eyes on the road.',
  rain: 'Heavy rain ahead. Please reduce your speed.',
  breakSuggestion: 'You have been driving for a while. Consider taking a break.',
  curve: 'Sharp curve ahead. Please slow down.',
  sosReady: 'Emergency SOS system is armed and ready.',
  saferRoute: 'A safer route has been found for your journey.'
};

// ============================================================================
// SECTION 8: LIVE MODULE ORCHESTRATOR — lazily starts/stops all AI engines
// ============================================================================
class SentinelOrchestrator {
  static start() {
    SentinelOrchestrator.stopAll(); // guard against duplicate intervals

    // Environment polling every 60s (simulated/live weather)
    EnvironmentAI.fetchWeather().then(env => {
      AppState.environment = { ...AppState.environment, ...env };
      SentinelOrchestrator.renderEnvironment();
    });
    AppState.intervals.environmentPoll = setInterval(async () => {
      const env = await EnvironmentAI.fetchWeather();
      AppState.environment = { ...AppState.environment, ...env };
      SentinelOrchestrator.renderEnvironment();
      RecommendationEngine.render();
    }, 60000);

    // Risk engine recompute every 5s
    AppState.intervals.riskEngine = setInterval(() => {
      RiskEngine.computeOverallRisk();
      RiskEngine.renderGauge();
    }, 5000);

    // Trip / composite score engine every 1s (Part 7 requirement)
    AppState.intervals.tripScoreEngine = setInterval(() => {
      ScoreEngine.update();
    }, 1000);

    // AI recommendation engine every 8s
    AppState.intervals.recommendationEngine = setInterval(() => {
      RecommendationEngine.render();
    }, 8000);

    // Near-miss watcher every 4s
    AppState.intervals.nearMissWatcher = setInterval(() => {
      NearMissAI.evaluate();
    }, 4000);

    // Kick off an immediate render pass
    RiskEngine.computeOverallRisk();
    RiskEngine.renderGauge();
    ScoreEngine.update();
    RecommendationEngine.render();
    NearMissAI.render();
  }

  static stopAll() {
    Object.keys(AppState.intervals).forEach(key => {
      if (AppState.intervals[key]) {
        clearInterval(AppState.intervals[key]);
        AppState.intervals[key] = null;
      }
    });
  }

  static renderEnvironment() {
    const env = AppState.environment;
    const traction = EnvironmentAI.computeRoadTraction(env);
    const glare = EnvironmentAI.computeSunGlare(env);
    const rec = EnvironmentAI.generateRecommendation(env);

    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setText('env-temp', `${Math.round(env.tempC)}°C`);
    setText('env-condition', env.condition);
    setText('env-visibility', `${(env.visibilityM / 1000).toFixed(1)} km`);
    setText('env-wind', `${Math.round(env.windKph)} km/h`);
    setText('env-rain', `${env.rainMm.toFixed ? env.rainMm.toFixed(1) : env.rainMm} mm/h`);
    setText('env-humidity', `${Math.round(env.humidity)}%`);
    setText('env-traction', `${traction}%`);
    setText('env-glare', glare);
    setText('env-night', env.isNight ? 'Active' : 'Inactive');

    const recEl = document.getElementById('env-recommendation');
    if (recEl) recEl.textContent = rec;

    // Sync top header + dashboard weather widgets (existing UI elements)
    const headerWeather = document.getElementById('header-weather');
    if (headerWeather) headerWeather.textContent = `${Math.round(env.tempC)}°C • ${env.condition}`;
    const dashWeather = document.getElementById('dash-weather');
    if (dashWeather) dashWeather.textContent = `${Math.round(env.tempC)}°C`;
    const dashWeatherSub = document.getElementById('dash-weather-sub');
    if (dashWeatherSub) dashWeatherSub.textContent = env.rainMm > 0 ? 'Rainfall • Slick roads' : env.condition;
  }
}

// --- ROUTER & PAGE SWITCHER ---
const PAGE_TITLES = {
  'landing':        'SentinelAI – AI Mobility Safety Ecosystem',
  'login':          'SentinelAI – Driver Authentication',
  'dashboard':      'SentinelAI – Home Dashboard',
  'safe-drive':     'SentinelAI – Safe Drive Mode',
  'driver-monitor': 'SentinelAI – Driver Monitoring',
  'road-intel':     'SentinelAI – Road Intelligence',
  'risk-predict':   'SentinelAI – AI Risk Prediction',
  'emergency':      'SentinelAI – Emergency SOS',
  'gov-dashboard':  'SentinelAI – Government Analytics',
  'trip-summary':   'SentinelAI – Trip Summary',
  'settings':       'SentinelAI – Settings'
};

function navigateTo(pageId) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');

  const targetNavItem = document.getElementById(`nav-${pageId}`);
  if (targetNavItem) targetNavItem.classList.add('active');

  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');

  if (pageId === 'landing' || pageId === 'login') {
    sidebar.style.display = 'none';
    header.style.display = 'none';
  } else {
    sidebar.style.display = 'flex';
    header.style.display = 'flex';
  }

  document.title = PAGE_TITLES[pageId] || 'SentinelAI';

  setTimeout(() => {
    switch (pageId) {
      case 'dashboard':
        initDashboardMap();
        break;
      case 'safe-drive':
        initSafeDriveMap();
        break;
      case 'driver-monitor':
        startDriverMonitoringSimulation();
        break;
      case 'road-intel':
        initRoadIntelMap();
        break;
      case 'risk-predict':
        RiskEngine.computeOverallRisk();
        RiskEngine.renderGauge();
        break;
      case 'gov-dashboard':
        initGovernmentAnalyticsCharts();
        break;
      case 'trip-summary':
        stopNavigationSimulation();
        break;
    }
  }, 100);

  lucide.createIcons();
}

function startSafeDriveLanding() {
  if (AppState.user.authenticated) {
    navigateTo('safe-drive');
  } else {
    navigateTo('login');
  }
}

// --- AUTHENTICATION CONTROLLERS ---
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  AppState.user.authenticated = true;
  AppState.user.email = email;
  AppState.user.username = 'Eng. John Doe';
  AppState.user.avatar = 'JD';

  updateHeaderProfile();
  speakText(VoiceAssistantPhrases.morning);
  SentinelOrchestrator.start();
  navigateTo('dashboard');
}

function loginAsGuest() {
  AppState.user.authenticated = true;
  AppState.user.isGuest = true;
  AppState.user.username = 'Stellantis Guest';
  AppState.user.avatar = 'SG';

  updateHeaderProfile();
  speakText('Guest access enabled. Starting dashboard session.');
  SentinelOrchestrator.start();
  navigateTo('dashboard');
}

function logout() {
  AppState.user.authenticated = false;
  AppState.user.isGuest = false;
  AppState.user.username = 'Guest';
  AppState.user.avatar = 'G';

  stopNavigationSimulation();
  stopDriverMonitoringSimulation();
  SentinelOrchestrator.stopAll();

  speakText('Sentinel Safety OS deactivated. Goodbye.');
  navigateTo('landing');
}

function updateHeaderProfile() {
  document.getElementById('header-username').textContent = AppState.user.username;
  document.getElementById('header-avatar').textContent = AppState.user.avatar;
}

// --- MAP 1: HOME DASHBOARD MAP (Bangalore) ---
function initDashboardMap() {
  const container = document.getElementById('dashboard-map');
  if (!container) return;

  if (AppState.maps.dashboard) {
    AppState.maps.dashboard.invalidateSize();
    return;
  }

  AppState.maps.dashboard = L.map('dashboard-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(BLR_CENTER, 12);

  L.tileLayer(MapTileURL, {
    maxZoom: 19,
    attribution: MapAttrib
  }).addTo(AppState.maps.dashboard);

  const carIcon = L.divIcon({
    className: 'custom-car-marker',
    html: '<div style="background: var(--color-primary); width:16px; height:16px; border:3px solid #fff; border-radius:50%; box-shadow:0 0 10px var(--color-primary);"></div>',
    iconSize: [16, 16]
  });
  L.marker(ROUTE_REVA_TO_AIRPORT[0], { icon: carIcon }).addTo(AppState.maps.dashboard)
    .bindPopup("<b>Your Vehicle</b><br>REVA University, Bengaluru").openPopup();

  renderMapHazards(AppState.maps.dashboard);
}

function renderMapHazards(mapInstance) {
  AppState.hazards.forEach(h => {
    const glowColor = SEVERITY_COLOR[h.severity] || 'var(--color-warning)';
    const iconName = HAZARD_ICONS[h.type] || 'alert-triangle';

    const hazardIcon = L.divIcon({
      className: 'custom-hazard-marker',
      html: `<div style="background: ${glowColor}; width:12px; height:12px; border:2px solid #000; border-radius:50%; box-shadow: 0 0 8px ${glowColor};"></div>`,
      iconSize: [12, 12]
    });

    L.marker([h.lat, h.lng], { icon: hazardIcon })
      .addTo(mapInstance)
      .bindPopup(`
        <b>${h.label}</b><br>
        Severity: ${h.severity}<br>
        Risk Score: ${h.risk ?? 'N/A'}/100<br>
        Recommendation: ${h.recommendation || 'Proceed with caution.'}<br>
        Reported: ${h.time}
      `);
  });
}

// --- MAP 2: SAFE DRIVE CARPLAY MAP & NAVIGATION SIMULATION (Bangalore) ---
function initSafeDriveMap() {
  const container = document.getElementById('safe-drive-map');
  if (!container) return;

  if (AppState.maps.safeDrive) {
    AppState.maps.safeDrive.invalidateSize();
    return;
  }

  const startCoords = ROUTE_REVA_TO_AIRPORT[0];
  AppState.maps.safeDrive = L.map('safe-drive-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(startCoords, 11);

  L.tileLayer(MapTileURL, {
    maxZoom: 19,
    attribution: MapAttrib
  }).addTo(AppState.maps.safeDrive);

  renderMapHazards(AppState.maps.safeDrive);

  const safestCoords = ROUTE_REVA_TO_AIRPORT;
  const fastestCoords = ROUTE_REVA_TO_AIRPORT_FAST;

  AppState.navigation.safestCoords = safestCoords;
  AppState.navigation.fastestCoords = fastestCoords;

  AppState.navigation.safestPath = L.polyline(safestCoords, {
    color: '#10b981',
    weight: 6,
    opacity: 0.85,
    dashArray: '10, 5'
  }).addTo(AppState.maps.safeDrive);

  AppState.navigation.fastestPath = L.polyline(fastestCoords, {
    color: '#3b82f6',
    weight: 4,
    opacity: 0.5
  }).addTo(AppState.maps.safeDrive);

  const vehicleIcon = L.divIcon({
    className: 'nav-vehicle-marker',
    html: '<div style="background: var(--color-primary); width:20px; height:20px; border:4px solid #fff; border-radius:50%; box-shadow:0 0 15px var(--color-primary);"></div>',
    iconSize: [20, 20]
  });

  AppState.navigation.carMarker = L.marker(startCoords, { icon: vehicleIcon }).addTo(AppState.maps.safeDrive);
  AppState.navigation.routeCoords = safestCoords;

  const bounds = L.latLngBounds([...safestCoords, ...fastestCoords]);
  AppState.maps.safeDrive.fitBounds(bounds, { padding: [30, 30] });
}

function selectRoute(routeType) {
  document.getElementById('route-safest').classList.remove('selected');
  document.getElementById('route-fastest').classList.remove('selected');

  document.getElementById(`route-${routeType}`).classList.add('selected');
  AppState.navigation.chosenRoute = routeType;

  if (routeType === 'safest') {
    AppState.navigation.safestPath.setStyle({ color: '#10b981', weight: 6, opacity: 0.85 });
    AppState.navigation.fastestPath.setStyle({ color: '#3b82f6', weight: 4, opacity: 0.5 });
    AppState.navigation.routeCoords = AppState.navigation.safestCoords;
    document.getElementById('nav-assistant-prompt').textContent =
      '"Live traffic analyzed. Safest route selected via Outer Ring Road to avoid Silk Board congestion. Maintain present speed limit."';
    speakText(VoiceAssistantPhrases.saferRoute);
  } else {
    AppState.navigation.safestPath.setStyle({ color: '#10b981', weight: 4, opacity: 0.5 });
    AppState.navigation.fastestPath.setStyle({ color: '#3b82f6', weight: 6, opacity: 0.85 });
    AppState.navigation.routeCoords = AppState.navigation.fastestCoords;
    document.getElementById('nav-assistant-prompt').textContent =
      '"Warning: Fastest route passes through Hebbal accident zone and Silk Board congestion. Reduced speed and heightened alertness recommended."';
  }

  RiskEngine.computeOverallRisk();
  RiskEngine.renderGauge();
}

// Drive Simulation loops
function toggleNavigationSimulation() {
  const btn = document.getElementById('btn-toggle-navigation');

  if (AppState.navigation.isNavigating) {
    stopNavigationSimulation();
    btn.innerHTML = '<i data-lucide="play"></i> Start Navigation';
    lucide.createIcons();
    speakText("Navigation suspended.");
  } else {
    startNavigationSimulation();
    btn.innerHTML = '<i data-lucide="square"></i> Stop Navigation';
    lucide.createIcons();
    speakText("Initiating navigation. Route path calculated. Driving assistance online.");
  }
}

function startNavigationSimulation() {
  AppState.navigation.isNavigating = true;
  AppState.navigation.stepIndex = 0;

  const totalSteps = AppState.navigation.routeCoords.length;

  AppState.navigation.intervalId = setInterval(() => {
    if (AppState.navigation.stepIndex >= totalSteps) {
      stopNavigationSimulation();
      speakText("Trip complete. Auto generating safety summaries.");
      setTimeout(() => {
        navigateTo('trip-summary');
      }, 1000);
      return;
    }

    const nextCoords = AppState.navigation.routeCoords[AppState.navigation.stepIndex];
    AppState.navigation.carMarker.setLatLng(nextCoords);
    AppState.maps.safeDrive.panTo(nextCoords);

    let speed = Math.floor(Math.random() * 8) + 42;
    let limit = 50;
    AppState.navigation.currentSpeed = speed;
    AppState.tripScores.distanceKm += 3.5;

    if (AppState.navigation.chosenRoute === 'fastest' && AppState.navigation.stepIndex === 3) {
      speed = 28;
      limit = 30;
      document.getElementById('nav-assistant-prompt').textContent =
        "\"Entering Hebbal accident-prone corridor. Potential hazards nearby. Recommended Speed: 30 km/h.\"";
      speakText("Warning. Entering high-risk accident corridor near Hebbal. Reduce speed.");
    }

    document.getElementById('nav-hud-speed').textContent = `${speed} mph`;
    document.getElementById('nav-hud-limit').textContent = `${limit} mph`;
    document.getElementById('dash-hud-speed').textContent = `${speed} MPH`;

    AppState.navigation.stepIndex++;
  }, 3500);
}

function stopNavigationSimulation() {
  AppState.navigation.isNavigating = false;
  if (AppState.navigation.intervalId) {
    clearInterval(AppState.navigation.intervalId);
    AppState.navigation.intervalId = null;
  }
}

function toggleVoiceAssistant() {
  AppState.settings.voiceFeedback = !AppState.settings.voiceFeedback;
  const statusEl = document.getElementById('voice-assistant-status');
  statusEl.textContent = AppState.settings.voiceFeedback ? 'ACTIVE' : 'MUTED';
  statusEl.style.color = AppState.settings.voiceFeedback ? 'var(--color-success)' : 'var(--color-danger)';

  if (AppState.settings.voiceFeedback) {
    speakText("Voice assistance activated.");
  }
}

// --- DRIVER MONITORING LOGIC & REAL-TIME WEBCAM FACE DETECTION ---
async function toggleLiveWebcam() {
  const btn = document.getElementById('btn-toggle-webcam');
  const video = document.getElementById('webcam-feed');
  const img = document.getElementById('driver-scanner-img');
  const simOverlay = document.getElementById('simulated-overlay');
  const statusDot = document.getElementById('camera-status-dot');
  const statusText = document.getElementById('camera-status-text');

  if (!AppState.webcam.isLive) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      AppState.webcam.stream = stream;
      AppState.webcam.isLive = true;
      video.srcObject = stream;
      video.style.display = 'block';
      if (img) img.style.display = 'none';
      if (simOverlay) simOverlay.style.display = 'none';

      if (statusDot) statusDot.style.backgroundColor = 'var(--color-success)';
      if (statusText) statusText.textContent = 'LIVE WEBCAM • REALTIME AI ACTIVE';
      if (btn) {
        btn.innerHTML = '<i data-lucide="video-off"></i> Disable Live Webcam';
        btn.className = 'btn btn-danger';
        lucide.createIcons();
      }

      if ('FaceDetector' in window) {
        try {
          AppState.webcam.detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
        } catch (e) { AppState.webcam.detector = null; }
      }

      startRealtimeFaceTracker();
      speakText("Live camera feed engaged. Real-time facial biometric tracking active.");
    } catch (err) {
      console.warn("Webcam access error:", err);
      alert("Unable to access live camera stream. Please check camera permissions. Continuing with high-fidelity simulated telemetry.");
      speakText("Camera access unavailable. Continuing with simulated scanner telemetry.");
    }
  } else {
    stopLiveWebcam();
  }
}

function stopLiveWebcam() {
  if (AppState.webcam.stream) {
    AppState.webcam.stream.getTracks().forEach(track => track.stop());
    AppState.webcam.stream = null;
  }
  AppState.webcam.isLive = false;
  if (AppState.webcam.animFrameId) {
    cancelAnimationFrame(AppState.webcam.animFrameId);
    AppState.webcam.animFrameId = null;
  }

  const video = document.getElementById('webcam-feed');
  const img = document.getElementById('driver-scanner-img');
  const simOverlay = document.getElementById('simulated-overlay');
  const btn = document.getElementById('btn-toggle-webcam');
  const statusDot = document.getElementById('camera-status-dot');
  const statusText = document.getElementById('camera-status-text');
  const canvas = document.getElementById('face-mesh-canvas');

  if (video) video.style.display = 'none';
  if (img) img.style.display = 'block';
  if (simOverlay) simOverlay.style.display = 'block';
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  if (statusDot) statusDot.style.backgroundColor = 'var(--color-success)';
  if (statusText) statusText.textContent = 'Simulated Stream';
  if (btn) {
    btn.innerHTML = '<i data-lucide="video"></i> Enable Live Webcam';
    btn.className = 'btn btn-secondary';
    lucide.createIcons();
  }
  speakText("Live webcam feed disengaged.");
}

// Real-time Face Detection HUD Canvas Loop (unchanged visual behaviour,
// now cross-feeds the DriverAI placeholder pipeline for consistent scoring)
function startRealtimeFaceTracker() {
  const video = document.getElementById('webcam-feed');
  const canvas = document.getElementById('face-mesh-canvas');
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d');
  let scanLineY = 0;
  let scanDir = 1;
  let detectCounter = 0;

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 160;
  sampleCanvas.height = 120;
  const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

  async function processFrame() {
    if (!AppState.webcam.isLive) return;

    const width = video.offsetWidth || 640;
    const height = video.offsetHeight || 480;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    ctx.clearRect(0, 0, width, height);

    detectCounter++;
    if (AppState.webcam.detector && video.readyState === 4 && detectCounter % 3 === 0) {
      try {
        const faces = await AppState.webcam.detector.detect(video);
        if (faces && faces.length > 0) {
          const bounding = faces[0].boundingBox;
          const vW = video.videoWidth || width;
          const vH = video.videoHeight || height;
          AppState.webcam.targetBox = {
            x: bounding.x / vW,
            y: bounding.y / vH,
            w: bounding.width / vW,
            h: bounding.height / vH
          };
        }
      } catch (e) { /* fallback to feature tracking below */ }
    }

    if ((!AppState.webcam.detector || detectCounter % 15 === 0) && video.readyState === 4) {
      try {
        sampleCtx.drawImage(video, 0, 0, 160, 120);
        const imgData = sampleCtx.getImageData(0, 0, 160, 120).data;
        let sumX = 0, sumY = 0, count = 0;

        for (let y = 15; y < 105; y += 3) {
          for (let x = 20; x < 140; x += 3) {
            const idx = (y * 160 + x) * 4;
            const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
            if (r > 60 && g > 40 && b > 20 && r > b && (r - g) > 10) {
              sumX += x;
              sumY += y;
              count++;
            }
          }
        }

        if (count > 80) {
          const avgX = (sumX / count) / 160;
          const avgY = (sumY / count) / 120;
          AppState.webcam.targetBox = {
            x: Math.max(0.1, Math.min(0.6, avgX - 0.18)),
            y: Math.max(0.1, Math.min(0.5, avgY - 0.22)),
            w: 0.36,
            h: 0.48
          };
        }
      } catch (e) {}
    }

    const box = AppState.webcam.faceBox;
    const target = AppState.webcam.targetBox;
    box.x += (target.x - box.x) * 0.15;
    box.y += (target.y - box.y) * 0.15;
    box.w += (target.w - box.w) * 0.15;
    box.h += (target.h - box.h) * 0.15;

    const px = (1 - box.x - box.w) * width;
    const py = box.y * height;
    const pw = box.w * width;
    const ph = box.h * height;

    const faceCenterX = box.x + box.w / 2;
    const faceCenterY = box.y + box.h / 2;

    let gaze = 'Road Center';
    let gazeColor = 'var(--color-success)';
    let currentScore = 96;
    let scoreText = 'Driver Fully Alert';
    let scoreColor = 'var(--color-success)';
    let circleClass = 'circle-bar success';
    let drowsinessText = 'ALERT';
    let drowsinessClass = 'factor-status-pill success';
    let phoneText = 'NONE';
    let phoneClass = 'factor-status-pill success';
    let yawningText = '0 / hr';
    let yawningClass = 'factor-status-pill success';
    let laneText = '98% Match';
    let laneClass = 'factor-status-pill success';
    let voiceAlertText = '"Live Camera: Face lock active. Driver fully alert and attentive."';

    if (box.w < 0.1 || box.h < 0.1) {
      currentScore = 30;
      gaze = 'No Driver Detected';
      gazeColor = 'var(--color-danger)';
      scoreText = 'No Driver Detected';
      scoreColor = 'var(--color-danger)';
      circleClass = 'circle-bar danger';
      drowsinessText = 'UNATTENDED';
      drowsinessClass = 'factor-status-pill danger';
      phoneText = 'ATTENTION NEEDED';
      phoneClass = 'factor-status-pill danger';
      yawningText = 'N/A';
      yawningClass = 'factor-status-pill danger';
      laneText = '0% Match';
      laneClass = 'factor-status-pill danger';
      voiceAlertText = '"Alert: No driver detected in seat. Active safety assist engaged."';
    } else if (faceCenterX < 0.38) {
      gaze = 'Gaze Left (Mirror)';
      gazeColor = 'var(--color-primary)';
      currentScore = 74;
      scoreText = 'Gaze Distraction Alert';
      scoreColor = 'var(--color-warning)';
      circleClass = 'circle-bar warning';
      drowsinessText = 'DISTRACTED';
      drowsinessClass = 'factor-status-pill warning';
      laneText = '88% Match';
      voiceAlertText = '"Attention: Gaze directed away from forward road center."';
    } else if (faceCenterX > 0.62) {
      gaze = 'Gaze Right (Side)';
      gazeColor = 'var(--color-primary)';
      currentScore = 72;
      scoreText = 'Gaze Distraction Alert';
      scoreColor = 'var(--color-warning)';
      circleClass = 'circle-bar warning';
      drowsinessText = 'DISTRACTED';
      drowsinessClass = 'factor-status-pill warning';
      laneText = '86% Match';
      voiceAlertText = '"Attention: Head turned right away from forward path."';
    } else if (faceCenterY > 0.58) {
      gaze = 'Looking Down (Head Tilt)';
      gazeColor = 'var(--color-danger)';
      currentScore = 54;
      scoreText = 'Drowsiness Warning Level 3';
      scoreColor = 'var(--color-danger)';
      circleClass = 'circle-bar danger';
      drowsinessText = 'DROWSY';
      drowsinessClass = 'factor-status-pill danger';
      phoneText = 'CHECKING PHONE';
      phoneClass = 'factor-status-pill warning';
      yawningText = '3 / hr';
      yawningClass = 'factor-status-pill warning';
      laneText = '78% Match';
      laneClass = 'factor-status-pill warning';
      voiceAlertText = '"Warning: Head tilt / low gaze detected. Drowsiness threshold reached."';
    }

    AppState.biometrics.score = currentScore;
    AppState.biometrics.gaze = gaze;
    AppState.biometrics.phoneDistraction = phoneText !== 'NONE';
    AppState.biometrics.laneKeeping = parseInt(laneText, 10) || AppState.biometrics.laneKeeping;

    const bioGazeEl = document.getElementById('bio-gaze');
    const scoreValEl = document.getElementById('driver-score-val');
    const scoreCircleEl = document.getElementById('driver-score-circle');
    const scoreLabelEl = document.getElementById('driver-score-label');
    const drowsinessEl = document.getElementById('bio-drowsiness');
    const phoneEl = document.getElementById('bio-phone');
    const yawningEl = document.getElementById('bio-yawning');
    const laneEl = document.getElementById('bio-lane');
    const voiceAlertEl = document.getElementById('driver-voice-alert');

    if (bioGazeEl) { bioGazeEl.textContent = gaze; bioGazeEl.style.color = gazeColor; }
    if (scoreValEl) scoreValEl.textContent = currentScore;
    if (scoreLabelEl) { scoreLabelEl.textContent = scoreText; scoreLabelEl.style.color = scoreColor; }
    if (scoreCircleEl) {
      scoreCircleEl.className = circleClass;
      const scoreFraction = currentScore / 100;
      const strokeOffset = 389 - (389 * scoreFraction);
      scoreCircleEl.style.strokeDashoffset = strokeOffset;
    }
    if (drowsinessEl) { drowsinessEl.textContent = drowsinessText; drowsinessEl.className = drowsinessClass; }
    if (phoneEl) { phoneEl.textContent = phoneText; phoneEl.className = phoneClass; }
    if (yawningEl) { yawningEl.textContent = yawningText; yawningEl.className = yawningClass; }
    if (laneEl) { laneEl.textContent = laneText; laneEl.className = laneClass; }
    if (voiceAlertEl) voiceAlertEl.textContent = voiceAlertText;

    // HUD overlay drawing (corner brackets, scan line, mesh) — unchanged visuals
    const bracketSize = Math.min(pw, ph) * 0.2;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 10;

    ctx.beginPath(); ctx.moveTo(px, py + bracketSize); ctx.lineTo(px, py); ctx.lineTo(px + bracketSize, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + pw - bracketSize, py); ctx.lineTo(px + pw, py); ctx.lineTo(px + pw, py + bracketSize); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px, py + ph - bracketSize); ctx.lineTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + bracketSize, py + ph); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + pw - bracketSize, py + ph); ctx.lineTo(px + pw, py + ph); ctx.lineTo(px + pw, py + ph - bracketSize); ctx.stroke();

    scanLineY += scanDir * 3;
    if (scanLineY > ph || scanLineY < 0) scanDir *= -1;
    ctx.fillStyle = 'rgba(37, 99, 235, 0.35)';
    ctx.fillRect(px, py + scanLineY, pw, 3);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#2563eb';
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(px, py + scanLineY); ctx.lineTo(px + pw, py + scanLineY); ctx.stroke();

    const eyeY = py + ph * 0.35;
    const eyeL_X = px + pw * 0.32;
    const eyeR_X = px + pw * 0.68;
    const noseX = px + pw * 0.5;
    const noseY = py + ph * 0.55;
    const mouthY = py + ph * 0.75;
    const mouthL_X = px + pw * 0.38;
    const mouthR_X = px + pw * 0.62;

    const meshPoints = [
      { x: eyeL_X, y: eyeY }, { x: eyeR_X, y: eyeY }, { x: noseX, y: noseY },
      { x: mouthL_X, y: mouthY }, { x: mouthR_X, y: mouthY },
      { x: px + pw * 0.5, y: py + ph * 0.2 }, { x: px + pw * 0.5, y: py + ph * 0.88 }
    ];

    ctx.strokeStyle = 'rgba(34, 197, 94, 0.25)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(meshPoints[0].x, meshPoints[0].y);
    ctx.lineTo(meshPoints[1].x, meshPoints[1].y);
    ctx.lineTo(meshPoints[2].x, meshPoints[2].y);
    ctx.lineTo(meshPoints[0].x, meshPoints[0].y);
    ctx.moveTo(meshPoints[2].x, meshPoints[2].y);
    ctx.lineTo(meshPoints[3].x, meshPoints[3].y);
    ctx.lineTo(meshPoints[4].x, meshPoints[4].y);
    ctx.lineTo(meshPoints[2].x, meshPoints[2].y);
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 6;
    meshPoints.forEach(pt => { ctx.beginPath(); ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); ctx.fill(); });

    [meshPoints[0], meshPoints[1]].forEach((eyePt, idx) => {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#2563eb';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(eyePt.x, eyePt.y, 12, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '10px Inter';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(idx === 0 ? 'EYE_L: 99%' : 'EYE_R: 99%', eyePt.x - 22, eyePt.y - 16);
    });

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 11px Poppins';
    ctx.shadowColor = '#22c55e';
    ctx.shadowBlur = 6;
    ctx.fillText('STLA-AI :: DRIVER_FACIAL_LOCK', px, Math.max(20, py - 10));

    AppState.webcam.animFrameId = requestAnimationFrame(processFrame);
  }

  processFrame();
}

function startDriverMonitoringSimulation() {
  if (!AppState.webcam.isLive) {
    toggleLiveWebcam();
  }

  if (AppState.biometrics.intervalId) return;

  const blinkEl = document.getElementById('bio-blink');
  const closureEl = document.getElementById('bio-closure');
  const gazeEl = document.getElementById('bio-gaze');
  const scoreCircle = document.getElementById('driver-score-circle');
  const scoreLabel = document.getElementById('driver-score-label');
  const drowsinessPill = document.getElementById('bio-drowsiness');
  const seatbeltPill = document.getElementById('bio-seatbelt');
  const phonePill = document.getElementById('bio-phone');
  const yawningPill = document.getElementById('bio-yawning');
  const lanePill = document.getElementById('bio-lane');
  const voiceAlertEl = document.getElementById('driver-voice-alert');

  AppState.biometrics.intervalId = setInterval(() => {
    // AI placeholder pipeline drives simulated telemetry when webcam is off
    if (!AppState.webcam.isLive) {
      const seatbelt = DriverAI.detectSeatbelt();
      const eyeClosure = DriverAI.detectEyeClosure();
      const blink = DriverAI.detectBlinkRate();
      const yawn = DriverAI.detectYawning();
      const phone = DriverAI.detectPhone();
      const headPose = DriverAI.detectHeadPose();
      const lane = DriverAI.detectLaneDeparture();
      const steering = DriverAI.detectAggressiveSteering();
      const fatigue = DriverAI.detectFatigue(eyeClosure, blink, yawn);
      const gazes = ['Road Center', 'Road Center', 'Left Mirror', 'Right Mirror', 'Dashboard'];
      const gaze = headPose.pose === 'Centered' ? 'Road Center' : gazes[Math.floor(Math.random() * gazes.length)];
      const distraction = DriverAI.detectDistraction(phone, headPose, gaze);
      const driverScore = DriverAI.computeDriverScore({ seatbelt, fatigue, distraction, lane });

      AppState.biometrics.blinkRate = blink.blinksPerMinute;
      AppState.biometrics.eyeClosure = eyeClosure.earValue;
      AppState.biometrics.gaze = gaze;
      AppState.biometrics.score = driverScore;
      AppState.biometrics.seatbelt = seatbelt.buckled;
      AppState.biometrics.phoneDistraction = phone.phoneDetected;
      AppState.biometrics.yawning = yawn.yawning ? AppState.biometrics.yawning + 1 : AppState.biometrics.yawning;
      AppState.biometrics.laneKeeping = lane.laneKeepingScore;
      AppState.biometrics.headPose = headPose.pose;
      AppState.biometrics.aggressiveSteering = steering.aggressive;

      if (blinkEl) blinkEl.textContent = `${blink.blinksPerMinute} / min`;
      if (closureEl) closureEl.textContent = `${eyeClosure.earValue}s (${eyeClosure.closed ? 'Extended' : 'Normal'})`;
      if (gazeEl) gazeEl.textContent = gaze;
      if (seatbeltPill) {
        seatbeltPill.textContent = seatbelt.buckled ? 'SECURED' : 'UNBUCKLED';
        seatbeltPill.className = `factor-status-pill ${seatbelt.buckled ? 'success' : 'danger'}`;
      }
      if (phonePill) {
        phonePill.textContent = phone.phoneDetected ? 'DETECTED' : 'NONE';
        phonePill.className = `factor-status-pill ${phone.phoneDetected ? 'danger' : 'success'}`;
      }
      if (yawningPill) {
        yawningPill.textContent = `${AppState.biometrics.yawning} / hr`;
        yawningPill.className = `factor-status-pill ${AppState.biometrics.yawning > 2 ? 'warning' : 'success'}`;
      }
      if (lanePill) {
        lanePill.textContent = `${lane.laneKeepingScore}% Match`;
        lanePill.className = `factor-status-pill ${lane.laneKeepingScore < 88 ? 'warning' : 'success'}`;
      }

      if (driverScore > 85) {
        if (drowsinessPill) { drowsinessPill.textContent = 'ALERT'; drowsinessPill.className = 'factor-status-pill success'; }
        if (scoreLabel) { scoreLabel.textContent = 'Driver Fully Alert'; scoreLabel.style.color = 'var(--color-success)'; }
        if (scoreCircle) {
          scoreCircle.className = 'circle-bar success';
          const strokeOffset = 389 - (389 * (driverScore / 100));
          scoreCircle.style.strokeDashoffset = strokeOffset;
        }
      } else if (driverScore > 60) {
        if (drowsinessPill) { drowsinessPill.textContent = 'CAUTION'; drowsinessPill.className = 'factor-status-pill warning'; }
        if (scoreLabel) { scoreLabel.textContent = 'Mild Distraction Detected'; scoreLabel.style.color = 'var(--color-warning)'; }
        if (scoreCircle) {
          scoreCircle.className = 'circle-bar warning';
          const strokeOffset = 389 - (389 * (driverScore / 100));
          scoreCircle.style.strokeDashoffset = strokeOffset;
        }
      } else {
        if (drowsinessPill) { drowsinessPill.textContent = 'FATIGUED'; drowsinessPill.className = 'factor-status-pill danger'; }
        if (scoreLabel) { scoreLabel.textContent = 'Fatigue Warning'; scoreLabel.style.color = 'var(--color-danger)'; }
        if (scoreCircle) {
          scoreCircle.className = 'circle-bar danger';
          const strokeOffset = 389 - (389 * (driverScore / 100));
          scoreCircle.style.strokeDashoffset = strokeOffset;
        }
        if (voiceAlertEl) voiceAlertEl.textContent = '"Warning: Fatigue indicators elevated. Please consider taking a break."';
      }

      const scoreValEl = document.getElementById('driver-score-val');
      if (scoreValEl) scoreValEl.textContent = driverScore;
    }
  }, 3000);
}

function stopDriverMonitoringSimulation() {
  if (AppState.biometrics.intervalId) {
    clearInterval(AppState.biometrics.intervalId);
    AppState.biometrics.intervalId = null;
  }
}

// Simulate severe drowsiness warning to demo ADAS functionality
function triggerSimulatedDrowsinessAlert() {
  navigateTo('driver-monitor');

  const scoreCircle = document.getElementById('driver-score-circle');
  const scoreVal = document.getElementById('driver-score-val');
  const scoreLabel = document.getElementById('driver-score-label');
  const drowsinessPill = document.getElementById('bio-drowsiness');
  const voiceAlertEl = document.getElementById('driver-voice-alert');

  AppState.biometrics.score = 58;
  scoreVal.textContent = '58';

  const scoreFraction = AppState.biometrics.score / 100;
  const strokeOffset = 389 - (389 * scoreFraction);
  scoreCircle.style.strokeDashoffset = strokeOffset;
  scoreCircle.className = 'circle-bar danger';

  drowsinessPill.textContent = 'FATIGUED';
  drowsinessPill.className = 'factor-status-pill danger';

  document.getElementById('bio-yawning').textContent = '4 / hr';
  document.getElementById('bio-yawning').className = 'factor-status-pill warning';

  scoreLabel.textContent = 'Fatigue Warning Level 3';
  scoreLabel.style.color = 'var(--color-danger)';

  voiceAlertEl.textContent = '"Attention: You appear tired. Eye closure rate has slowed. Please take a break immediately."';

  speakText("Warning. You appear fatigued. Eye closure rates exceed threshold. Please park the vehicle and take a break.");
  NearMissAI.logEvent({ type: 'Fatigue Warning Escalation', severity: 'High' });
}

// --- MAP 3: ROAD INTELLIGENCE MAP & REPORTER (Bangalore) ---
let reportedHazardLocation = null;

function initRoadIntelMap() {
  const container = document.getElementById('road-intel-map');
  if (!container) return;

  if (AppState.maps.roadIntel) {
    AppState.maps.roadIntel.invalidateSize();
    return;
  }

  AppState.maps.roadIntel = L.map('road-intel-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(BLR_CENTER, 12);

  L.tileLayer(MapTileURL, {
    maxZoom: 19,
    attribution: MapAttrib
  }).addTo(AppState.maps.roadIntel);

  renderMapHazards(AppState.maps.roadIntel);

  AppState.maps.roadIntel.on('click', (e) => {
    reportedHazardLocation = e.latlng;

    if (AppState.maps.roadIntel.tempMarker) {
      AppState.maps.roadIntel.removeLayer(AppState.maps.roadIntel.tempMarker);
    }

    const clickIcon = L.divIcon({
      className: 'temp-hazard-marker',
      html: '<div style="background: #ffffff; width:14px; height:14px; border:3px double #f59e0b; border-radius:50%; box-shadow:0 0 10px #f59e0b;"></div>',
      iconSize: [14, 14]
    });

    AppState.maps.roadIntel.tempMarker = L.marker(reportedHazardLocation, { icon: clickIcon })
      .addTo(AppState.maps.roadIntel)
      .bindPopup("<b>Placement Selection</b><br>Fill details on form to submit.").openPopup();

    document.getElementById('report-location-text').value = `GPS Lat: ${reportedHazardLocation.lat.toFixed(4)}, Lng: ${reportedHazardLocation.lng.toFixed(4)}`;
  });
}

function selectHazardType(buttonEl) {
  document.querySelectorAll('.hazard-type-btn').forEach(btn => btn.classList.remove('active'));
  buttonEl.classList.add('active');
}

function triggerSimulatedUpload() {
  const statusEl = document.getElementById('upload-status-text');
  statusEl.textContent = "Uploading dashcam_snap_99.png...";
  setTimeout(() => {
    statusEl.innerHTML = '<span style="color: var(--color-success); font-weight:600;"><i class="fa fa-check"></i> Image Uploaded successfully</span>';
  }, 1000);
}

function submitRoadHazardReport() {
  const activeBtn = document.querySelector('.hazard-type-btn.active');
  if (!activeBtn) {
    alert("Please select a Hazard Category first.");
    return;
  }

  const type = activeBtn.getAttribute('data-type');
  const locationText = document.getElementById('report-location-text').value;
  const severity = document.getElementById('report-severity').value;

  const lat = reportedHazardLocation ? reportedHazardLocation.lat : (12.97 + Math.random() * 0.1);
  const lng = reportedHazardLocation ? reportedHazardLocation.lng : (77.6 + Math.random() * 0.1);

  const newHazard = {
    id: AppState.hazards.length + 1,
    lat, lng, type, severity,
    label: locationText || `Reported ${type} hazard`,
    risk: severity === 'Critical' ? 85 : severity === 'High' ? 65 : 45,
    recommendation: 'Recently reported — approach with caution.',
    time: 'Just now'
  };

  AppState.hazards.push(newHazard);

  if (AppState.maps.roadIntel) {
    if (AppState.maps.roadIntel.tempMarker) {
      AppState.maps.roadIntel.removeLayer(AppState.maps.roadIntel.tempMarker);
    }
    renderMapHazards(AppState.maps.roadIntel);
  }

  document.getElementById('gov-hazard-count').textContent = AppState.hazards.length + 11;

  speakText(`Road hazard submitted. Category: ${type}. Broadcasting incident telemetry to nearby vehicles.`);

  document.querySelectorAll('.hazard-type-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('report-location-text').value = '';
  document.getElementById('upload-status-text').textContent = 'Click to capture/upload hazard image';
  reportedHazardLocation = null;

  RiskEngine.computeOverallRisk();
  RiskEngine.renderGauge();

  alert("Safety report submitted! Coordinates logged on map.");
}

// --- RISK GAUGE (delegates to RiskEngine, retained function name for HTML compatibility) ---
function animateRiskGauge() {
  RiskEngine.computeOverallRisk();
  RiskEngine.renderGauge();

  const gaugeVal = document.getElementById('risk-gauge-val');
  if (!gaugeVal) return;
  const riskIndex = AppState.risk.overall;
  gaugeVal.textContent = '0';
  let currentVal = 0;
  const countInterval = setInterval(() => {
    if (currentVal >= riskIndex) { clearInterval(countInterval); return; }
    currentVal++;
    gaugeVal.textContent = currentVal;
  }, 20);
}

// --- EMERGENCY SOS COUNTER & ANIMATED MAP DISPATCH (Bangalore) ---
function initiateSOSCountdown() {
  const defaultCard = document.getElementById('sos-card-default');
  const countdownCard = document.getElementById('sos-card-countdown');

  defaultCard.style.display = 'none';
  countdownCard.style.display = 'flex';

  AppState.emergency.countdown = 10;
  document.getElementById('sos-countdown-timer').textContent = AppState.emergency.countdown;
  document.getElementById('sos-countdown-sub').textContent = AppState.emergency.countdown;

  speakText(VoiceAssistantPhrases.sosReady + " Contacting search and rescue in ten seconds. Select abort to cancel.");

  AppState.emergency.countdownId = setInterval(() => {
    AppState.emergency.countdown--;
    document.getElementById('sos-countdown-timer').textContent = AppState.emergency.countdown;
    document.getElementById('sos-countdown-sub').textContent = AppState.emergency.countdown;

    if (AppState.emergency.countdown <= 0) {
      clearInterval(AppState.emergency.countdownId);
      triggerSOSActiveDispatch();
    }
  }, 1000);
}

function abortSOS() {
  if (AppState.emergency.countdownId) {
    clearInterval(AppState.emergency.countdownId);
    AppState.emergency.countdownId = null;
  }
  if (AppState.emergency.ambulanceIntervalId) {
    clearInterval(AppState.emergency.ambulanceIntervalId);
    AppState.emergency.ambulanceIntervalId = null;
  }

  if (AppState.emergency.map) {
    AppState.emergency.map.remove();
    AppState.emergency.map = null;
  }

  document.getElementById('sos-card-countdown').style.display = 'none';
  document.getElementById('sos-card-active').style.display = 'none';
  document.getElementById('sos-card-default').style.display = 'flex';

  speakText("SOS dispatch cancelled. Returning to standby mode.");
}

function triggerSOSActiveDispatch() {
  document.getElementById('sos-card-countdown').style.display = 'none';
  document.getElementById('sos-card-active').style.display = 'flex';

  speakText("Emergency SOS transmission complete. Ambulance BLR 3 4 4 dispatched. ETA 6 minutes.");

  setTimeout(() => {
    const crashCoords = ROUTE_REVA_TO_AIRPORT[0];
    const hospitalCoords = [13.0350, 77.6280]; // nearby hospital proxy on route

    AppState.emergency.map = L.map('emergency-map', {
      zoomControl: false,
      attributionControl: false
    }).setView(crashCoords, 12);

    L.tileLayer(MapTileURL, {
      maxZoom: 19,
      attribution: MapAttrib
    }).addTo(AppState.emergency.map);

    const crashIcon = L.divIcon({
      className: 'crash-marker',
      html: '<div style="background: var(--color-danger); width:18px; height:18px; border:3px solid #fff; border-radius:50%; box-shadow:0 0 15px var(--color-danger); animation: alertPulse 0.5s infinite alternate;"></div>',
      iconSize: [18, 18]
    });
    L.marker(crashCoords, { icon: crashIcon }).addTo(AppState.emergency.map).bindPopup("<b>Crash Site</b><br>Live GPS Lock").openPopup();

    const hospitalIcon = L.divIcon({
      className: 'hospital-marker',
      html: '<div style="background: var(--color-success); width:16px; height:16px; border:2px solid #fff; border-radius:50%; box-shadow:0 0 10px var(--color-success);"></div>',
      iconSize: [16, 16]
    });
    L.marker(hospitalCoords, { icon: hospitalIcon }).addTo(AppState.emergency.map).bindPopup("Nearest Multi-Speciality Hospital");

    let ambLat = hospitalCoords[0];
    let ambLng = hospitalCoords[1];

    const ambIcon = L.divIcon({
      className: 'amb-marker',
      html: '<div style="background: var(--color-warning); width:16px; height:16px; border:2px solid #fff; border-radius:50%; box-shadow:0 0 10px var(--color-warning); display:flex; align-items:center; justify-content:center;"><i class="fa fa-ambulance" style="font-size:9px; color:#000;"></i></div>',
      iconSize: [16, 16]
    });

    AppState.emergency.ambulanceMarker = L.marker([ambLat, ambLng], { icon: ambIcon }).addTo(AppState.emergency.map).bindPopup("Ambulance BLR-344");

    let t = 0;
    AppState.emergency.ambulanceIntervalId = setInterval(() => {
      t += 0.05;
      if (t >= 1) {
        clearInterval(AppState.emergency.ambulanceIntervalId);
        document.getElementById('sos-ambulance-status').textContent = "AMBULANCE ARRIVED AT CRASH SITE";
        document.getElementById('sos-ambulance-eta').textContent = "0 mins";
        speakText("First responders have arrived at vehicle coordinates.");
        return;
      }

      ambLat = hospitalCoords[0] + (crashCoords[0] - hospitalCoords[0]) * t;
      ambLng = hospitalCoords[1] + (crashCoords[1] - hospitalCoords[1]) * t;

      AppState.emergency.ambulanceMarker.setLatLng([ambLat, ambLng]);

      const remainingMinutes = Math.max(1, Math.round(6 * (1 - t)));
      document.getElementById('sos-ambulance-eta').textContent = `${remainingMinutes} mins`;

    }, 2000);

  }, 200);
}

// --- GOVERNMENT DASHBOARD ANALYTICS CHARTS ---
function initGovernmentAnalyticsCharts() {
  const ctxBar = document.getElementById('chart-incidents-bar');
  const ctxLine = document.getElementById('chart-score-line');
  const ctxPie = document.getElementById('chart-hazards-pie');

  if (!ctxBar || !ctxLine || !ctxPie) return;

  if (AppState.charts.bar) AppState.charts.bar.destroy();
  if (AppState.charts.line) AppState.charts.line.destroy();
  if (AppState.charts.pie) AppState.charts.pie.destroy();

  const chartStylesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  AppState.charts.bar = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Potholes', 'Waterlogging', 'Signals', 'Construction', 'Traffic', 'Accidents'],
      datasets: [{
        label: 'Active Hazard Count',
        data: [18, 12, 5, 22, 14, 7],
        backgroundColor: [
          'rgba(245, 158, 11, 0.65)', 'rgba(37, 99, 235, 0.65)', 'rgba(239, 68, 68, 0.65)',
          'rgba(245, 158, 11, 0.65)', 'rgba(59, 130, 246, 0.65)', 'rgba(239, 68, 68, 0.65)'
        ],
        borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1
      }]
    },
    options: chartStylesOptions
  });

  AppState.charts.line = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [{
        label: 'Municipal Safety Index score',
        data: [76, 78, 84, 80, 81, 82.4],
        fill: true, backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 0.85)', tension: 0.3, borderWidth: 3
      }]
    },
    options: chartStylesOptions
  });

  AppState.charts.pie = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: ['Potholes', 'Flooding', 'Obstructions', 'Others'],
      datasets: [{
        data: [42, 28, 20, 10],
        backgroundColor: ['rgba(245, 158, 11, 0.75)', 'rgba(37, 99, 235, 0.75)', 'rgba(239, 68, 68, 0.75)', 'rgba(255, 255, 255, 0.2)'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }
    }
  });
}

// --- AI ASSISTANT CHATBOT RESPONSES ---
function toggleChatbot() {
  const win = document.getElementById('chatbot-window');
  win.classList.toggle('open');
  if (win.classList.contains('open')) {
    speakText("Sentinel Co Driver online. Ask me about road conditions or safety profiles.");
  }
}

function handleChatSubmit(event) {
  event.preventDefault();
  const inputEl = document.getElementById('chat-user-input');
  const prompt = inputEl.value.trim();
  if (!prompt) return;

  appendChatMessage(prompt, 'user');
  inputEl.value = '';

  const loaderId = appendChatLoader();

  setTimeout(() => {
    removeChatLoader(loaderId);
    const reply = generateChatbotReply(prompt);
    appendChatMessage(reply, 'bot');
    speakText(reply);
  }, 1000);
}

function sendChatbotPredefined(phrase) {
  appendChatMessage(phrase, 'user');
  const loaderId = appendChatLoader();

  setTimeout(() => {
    removeChatLoader(loaderId);
    const reply = generateChatbotReply(phrase);
    appendChatMessage(reply, 'bot');
    speakText(reply);
  }, 1000);
}

function appendChatMessage(text, sender) {
  const container = document.getElementById('chat-messages-container');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${sender}`;
  msg.textContent = text;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function appendChatLoader() {
  const container = document.getElementById('chat-messages-container');
  const loader = document.createElement('div');
  const loaderId = 'loader_' + Date.now();
  loader.id = loaderId;
  loader.className = 'chat-msg bot';
  loader.style.opacity = '0.6';
  loader.textContent = 'Thinking...';
  container.appendChild(loader);
  container.scrollTop = container.scrollHeight;
  return loaderId;
}

function removeChatLoader(loaderId) {
  const loader = document.getElementById(loaderId);
  if (loader) loader.remove();
}

function generateChatbotReply(prompt) {
  const clean = prompt.toLowerCase();

  if (clean.includes('route') || clean.includes('safe')) {
    return `Current risk is ${AppState.risk.category} (${AppState.risk.overall}/100). Suggested safer route via Outer Ring Road is available, avoiding Silk Board and Hebbal hotspots.`;
  }

  if (clean.includes('hospital') || clean.includes('nearest hospital')) {
    setTimeout(() => { openNearestHospital(); }, 500);
    return "Displaying nearest hospital along your route corridor. Routing has been initialized.";
  }

  if (clean.includes('weather')) {
    const env = AppState.environment;
    return `Live conditions: ${env.condition}, ${Math.round(env.tempC)}°C, ${env.rainMm} mm/h rain. Road traction reduced by roughly ${100 - EnvironmentAI.computeRoadTraction(env)}%. Maintain a safe following distance.`;
  }

  if (clean.includes('simulate') || clean.includes('alert') || clean.includes('tired') || clean.includes('fatigue')) {
    setTimeout(() => { triggerSimulatedDrowsinessAlert(); }, 800);
    return "Acknowledged. Triggering ADAS drowsiness fatigue simulation to display active warnings.";
  }

  if (clean.includes('sos') || clean.includes('emergency')) {
    return "You can trigger emergency dispatches by holding the red SOS button or navigating to the Emergency SOS menu panel.";
  }

  return "I've logged your query. As your SentinelAI co-driver, I am continually monitoring telematics, crash indicators, weather alerts, and road anomalies.";
}

function openNearestHospital() {
  navigateTo('safe-drive');
  document.getElementById('nav-destination-input').value = "Nearest Multi-Speciality Hospital (2.1 km)";
  document.getElementById('nav-assistant-prompt').textContent =
    "\"Ambulance route to nearest hospital loaded. Traffic signal priority requested along corridor.\"";
  speakText("Routing to nearest emergency room.");
}

// --- TRIP SUMMARY & REPORT DOWNLOADS ---
function simulateReportDownload() {
  speakText("Preparing Drive Safety Certificate compilation.");

  const s = AppState.tripScores;
  const reportData = `
=========================================
SENTINELAI MOBILITY SAFEOS REPORT
=========================================
Trip Summary Certificate
Stellantis Connected Vehicle Hackathon

Date Logged: ${new Date().toISOString().slice(0, 10)}
Distance: ${AppState.tripScores.distanceKm.toFixed(1)} km
Driver Safety Score: ${s.driver} / 100
Environmental Score: ${s.environmental} / 100
Road Score: ${s.road} / 100
Overall Safety Score: ${s.overall} / 100
Collision Warnings Triggered: 0
Near-Miss Events Logged: ${AppState.nearMiss.events.length}
Route: REVA University -> Kempegowda International Airport

ADAS Active Safety Level: 2+ Active Assist
Vehicle ID: Chrysler Pacifica PHEV
=========================================
Thank you for driving safely!
  `;

  const blob = new Blob([reportData], { type: 'text/plain' });
  const anchor = document.createElement('a');
  anchor.download = 'SentinelAI_Safety_Report.txt';
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
}

function dialContact(contactName) {
  speakText(`Connecting phone link to ${contactName}. Directing call audio to main cabin speakers.`);
  alert(`Connecting cellular call link to: ${contactName}`);
}

// --- SETTINGS PAGE UTILITIES ---
function toggleDarkHudMode() {
  const isDark = document.getElementById('setting-darkmode').checked;
  const root = document.documentElement;

  if (isDark) {
    root.style.setProperty('--bg-primary', '#060913');
    root.style.setProperty('--bg-secondary', '#0b0f19');
    root.style.setProperty('--glass-bg', 'rgba(15, 23, 42, 0.55)');
  } else {
    root.style.setProperty('--bg-primary', '#1e293b');
    root.style.setProperty('--bg-secondary', '#334155');
    root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.15)');
  }
}

function updateVehicleDetails() {
  const model = document.getElementById('setting-vehicle-model').value;
  const vinEl = document.getElementById('setting-vin');
  const details = {
    Pacifica: { vin: '1C4RC1HK1JS884321', display: 'Chrysler Pacifica Hybrid' },
    GrandCherokee: { vin: '1C4RJ1HK5KS987654', display: 'Jeep Grand Cherokee 4xe' },
    Charger: { vin: '1C4RD2HK2LS123456', display: 'Dodge Charger Daytona EV' },
    Fiat500e: { vin: '1C4RF3HK3MS789101', display: 'Fiat 500e SafeOS edition' }
  };

  const chosen = details[model];
  vinEl.textContent = chosen.vin;
  AppState.settings.vehicleModel = model;
  AppState.settings.vin = chosen.vin;

  speakText(`Configuring ADAS telemetry constraints for vehicle model: ${chosen.display}.`);
}

function saveEmergencySettings() {
  const name = document.getElementById('setting-ice-name').value;
  const phone = document.getElementById('setting-ice-phone').value;

  AppState.settings.iceName = name;
  AppState.settings.icePhone = phone;

  const dashboardICE = document.getElementById('dashboard-emergency-contacts');
  if (dashboardICE) {
    dashboardICE.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.02);">
        <div>
          <div style="font-size: 13px; font-weight: 600;">Stellantis SOS Roadside</div>
          <div style="font-size: 11px; color: var(--text-muted);">Operator Line #402</div>
        </div>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;" onclick="dialContact('Stellantis SOS')">Call</button>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 10px; background: rgba(255,255,255,0.02);">
        <div>
          <div style="font-size: 13px; font-weight: 600;">${name} (ICE)</div>
          <div style="font-size: 11px; color: var(--text-muted);">${phone}</div>
        </div>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 11px;" onclick="dialContact('${name}')">Call</button>
      </div>
    `;
  }

  speakText("Emergency contact directories updated.");
  alert("ICE Contact Profiles Saved!");
}

// ============================================================================
// SECTION 13: UPLOADED VIDEO ANALYSIS (real MediaPipe FaceMesh landmark
// tracking) — complements the live-webcam heuristic tracker above. Lets a
// pre-recorded driver clip be scanned for attentiveness the same way the
// live feed is, reusing the existing biometrics/DriverAI UI hooks.
// ============================================================================
async function handleVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const videoElement = document.getElementById('webcam-feed');
  const canvasElement = document.getElementById('face-mesh-canvas');
  const canvasCtx = canvasElement.getContext('2d');
  const fallbackImg = document.getElementById('driver-scanner-img');
  const simOverlay = document.getElementById('simulated-overlay');
  const statusText = document.getElementById('camera-status-text');
  const statusDot = document.getElementById('camera-status-dot');
  const toggleBtn = document.getElementById('btn-toggle-webcam');
  const scoreVal = document.getElementById('driver-score-val');
  const scoreLabel = document.getElementById('driver-score-label');
  const scoreCircle = document.getElementById('driver-score-circle');

  // Stop any active live webcam stream / realtime tracker first
  if (AppState.webcam.stream) {
    AppState.webcam.stream.getTracks().forEach(track => track.stop());
    AppState.webcam.stream = null;
  }
  if (AppState.webcam.animFrameId) {
    cancelAnimationFrame(AppState.webcam.animFrameId);
    AppState.webcam.animFrameId = null;
  }
  AppState.webcam.processVideo = false;
  clearTimeout(AppState.webcam.simTimeout);
  AppState.webcam.isLive = true; // treat uploaded clip as a "live" feed for UI purposes

  const videoUrl = URL.createObjectURL(file);
  videoElement.srcObject = null;
  videoElement.src = videoUrl;
  videoElement.loop = true;
  videoElement.style.display = 'block';
  // Uploaded footage is typically recorded forward-facing already — don't mirror it
  videoElement.style.transform = 'scaleX(1)';

  fallbackImg.style.display = 'none';
  simOverlay.style.display = 'none';

  statusText.textContent = 'Analyzing Uploaded Video';
  statusDot.style.backgroundColor = 'var(--color-primary)';
  toggleBtn.innerHTML = '<i data-lucide="video-off"></i> Stop Video';
  toggleBtn.className = 'btn btn-danger';
  lucide.createIcons();

  speakText("Processing uploaded driver video feed.");

  if (typeof FaceMesh === 'undefined') {
    console.warn("MediaPipe FaceMesh library not available — cannot analyze uploaded video.");
    speakText("Face analysis library unavailable. Please check your network connection.");
    return;
  }

  const faceMesh = new FaceMesh({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults((results) => {
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      const meshColor = AppState.webcam.forceDistraction ? '#ef4444' : '#00f0ff';
      canvasCtx.globalAlpha = 0.7;
      canvasCtx.fillStyle = meshColor;

      for (let i = 0; i < landmarks.length; i += 3) {
        const x = landmarks[i].x * canvasElement.width;
        const y = landmarks[i].y * canvasElement.height;
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, AppState.webcam.forceDistraction ? 1.5 : 1.2, 0, 2 * Math.PI);
        canvasCtx.fill();
      }

      let attentiveness = 95 + Math.floor(Math.random() * 4);
      if (AppState.webcam.forceDistraction) attentiveness = 25 + Math.floor(Math.random() * 10);

      AppState.biometrics.score = attentiveness;
      AppState.biometrics.gaze = AppState.webcam.forceDistraction ? 'Off-road' : 'Road Center';

      if (scoreVal) scoreVal.textContent = attentiveness;
      if (scoreLabel) {
        scoreLabel.textContent = AppState.webcam.forceDistraction ? 'CRITICAL DISTRACTION' : 'Driver Fully Alert';
        scoreLabel.style.color = AppState.webcam.forceDistraction ? 'var(--color-danger)' : 'var(--color-success)';
      }
      if (scoreCircle) {
        scoreCircle.classList.remove('warning', 'danger', 'success');
        scoreCircle.classList.add(AppState.webcam.forceDistraction ? 'danger' : 'success');
        scoreCircle.style.strokeDashoffset = 389 - (389 * (attentiveness / 100));
      }

      const blinkEl = document.getElementById('bio-blink');
      const closureEl = document.getElementById('bio-closure');
      const gazeEl = document.getElementById('bio-gaze');
      if (blinkEl) blinkEl.textContent = (14 + Math.floor(Math.random() * 5)) + ' / min';
      if (closureEl) closureEl.textContent = AppState.webcam.forceDistraction ? '2.10s (Danger)' : '0.22s (Normal)';
      if (gazeEl) {
        gazeEl.textContent = AppState.biometrics.gaze;
        gazeEl.style.color = AppState.webcam.forceDistraction ? 'var(--color-danger)' : 'var(--color-success)';
      }
    } else {
      const score = 42;
      AppState.biometrics.score = score;
      if (scoreVal) scoreVal.textContent = score;
      if (scoreLabel) {
        scoreLabel.textContent = 'Distraction Detected';
        scoreLabel.style.color = 'var(--color-danger)';
      }
      if (scoreCircle) {
        scoreCircle.classList.remove('success', 'warning');
        scoreCircle.classList.add('danger');
        scoreCircle.style.strokeDashoffset = 389 - (389 * (score / 100));
      }
      const gazeEl = document.getElementById('bio-gaze');
      if (gazeEl) gazeEl.textContent = 'Not Focused';
    }
    canvasCtx.restore();
  });

  AppState.webcam.processVideo = true;
  AppState.webcam.forceDistraction = false;

  videoElement.onplay = () => {
    async function step() {
      if (!AppState.webcam.processVideo || videoElement.paused || videoElement.ended) return;
      await faceMesh.send({ image: videoElement });
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  // Simulate a distraction event partway through playback, for demo purposes
  clearTimeout(AppState.webcam.simTimeout);
  AppState.webcam.simTimeout = setTimeout(() => {
    if (AppState.webcam.isLive && AppState.webcam.processVideo) {
      AppState.webcam.forceDistraction = true;
      speakText("Warning! Critical driver distraction detected. Please pull over immediately!");

      const grid = document.querySelector('.driver-monitoring-grid');
      if (grid) {
        grid.style.boxShadow = "inset 0 0 80px rgba(220, 38, 38, 0.4)";
        setTimeout(() => { grid.style.boxShadow = "none"; }, 4000);
      }
    }
  }, 5000);

  videoElement.play().catch((e) => console.log("Video auto-play prevented:", e));
}