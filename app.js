// --- STATE MANAGEMENT ---
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
    routeCoords: []
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
    intervalId: null
  },
  emergency: {
    countdown: 10,
    isSOSActive: false,
    countdownId: null,
    ambulanceIntervalId: null,
    ambulanceMarker: null,
    map: null
  },
  hazards: [
    { id: 1, lat: 42.3414, lng: -83.0558, type: 'pothole', severity: 'Warning', label: 'Woodward Ave deep pothole, left lane', time: '10 mins ago', img: 'assets/road_hazard.png' },
    { id: 2, lat: 42.3250, lng: -83.0300, type: 'waterlogging', severity: 'Critical', label: 'Jefferson Ave flooded intersection', time: '5 mins ago', img: 'assets/road_hazard.png' },
    { id: 3, lat: 42.3550, lng: -83.0600, type: 'construction', severity: 'High', label: 'I-75 lane closure for bridge work', time: '30 mins ago', img: 'assets/road_hazard.png' }
  ],
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
  }
};

// Map Tile Service Layer (CartoDB Dark Matter for futuristic UI)
const MapTileURL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const MapAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Vector Icons
  lucide.createIcons();
  
  // Set real-time clock update loop
  startClock();
  
  // Pre-load guest credentials if testing
  document.getElementById('login-email').value = 'developer@stellantis.com';
  document.getElementById('login-password').value = 'sentinel2026';
  
  // Initial page layout setup
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
    hours = hours ? hours : 12; // the hour '0' should be '12'
    timeEl.textContent = `${hours}:${minutes} ${ampm}`;
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// --- VOICE ASSISTANCE ENGINE (WOW Hackathon Feature) ---
function speakText(text) {
  if (!AppState.settings.voiceFeedback || !('speechSynthesis' in window)) return;
  // Cancel previous speak tasks to avoid queue overlays
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 1.0;
  utterance.rate = 1.0;
  // Try to find a pleasant English voice
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(voice => voice.name.includes('Google US English') || voice.name.includes('Zira') || voice.lang.startsWith('en'));
  if (femaleVoice) utterance.voice = femaleVoice;
  window.speechSynthesis.speak(utterance);
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
  // Hide all screens, strip nav active styling
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  
  // Set specific page active
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');
  
  // Sidebar styling mapping
  const targetNavItem = document.getElementById(`nav-${pageId}`);
  if (targetNavItem) targetNavItem.classList.add('active');
  
  // Route guard / navigation panel controls
  const sidebar = document.getElementById('sidebar');
  const header = document.getElementById('header');
  
  if (pageId === 'landing' || pageId === 'login') {
    sidebar.style.display = 'none';
    header.style.display = 'none';
  } else {
    sidebar.style.display = 'flex';
    header.style.display = 'flex';
  }
  
  // Update browser tab title dynamically
  document.title = PAGE_TITLES[pageId] || 'SentinelAI';
  
  // Trigger screen-specific initializations
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
        animateRiskGauge();
        break;
      case 'gov-dashboard':
        initGovernmentAnalyticsCharts();
        break;
      case 'trip-summary':
        // If navigating to trip summary, stop previous drives
        stopNavigationSimulation();
        break;
    }
  }, 100);
  
  // Refresh Lucide Icons (in case new items loaded dynamically)
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
  speakText("Biometrics validated. Welcome back, Engineer John Doe. Sentinel Safety OS activated.");
  navigateTo('dashboard');
}

function loginAsGuest() {
  AppState.user.authenticated = true;
  AppState.user.isGuest = true;
  AppState.user.username = 'Stellantis Guest';
  AppState.user.avatar = 'SG';
  
  updateHeaderProfile();
  speakText("Guest access enabled. Starting dashboard session.");
  navigateTo('dashboard');
}

function logout() {
  AppState.user.authenticated = false;
  AppState.user.isGuest = false;
  AppState.user.username = 'Guest';
  AppState.user.avatar = 'G';
  
  // Reset maps and simulations
  stopNavigationSimulation();
  stopDriverMonitoringSimulation();
  
  speakText("Sentinel Safety OS deactivated. Goodbye.");
  navigateTo('landing');
}

function updateHeaderProfile() {
  document.getElementById('header-username').textContent = AppState.user.username;
  document.getElementById('header-avatar').textContent = AppState.user.avatar;
}

// --- MAP 1: HOME DASHBOARD MAP ---
function initDashboardMap() {
  const container = document.getElementById('dashboard-map');
  if (!container) return;
  
  if (AppState.maps.dashboard) {
    AppState.maps.dashboard.invalidateSize();
    return;
  }
  
  // Detroit Coordinates
  const detroitCoords = [42.3314, -83.0458];
  AppState.maps.dashboard = L.map('dashboard-map', {
    zoomControl: false,
    attributionControl: false
  }).setView(detroitCoords, 13);
  
  L.tileLayer(MapTileURL, {
    maxZoom: 19,
    attribution: MapAttrib
  }).addTo(AppState.maps.dashboard);
  
  // Add Current Vehicle Indicator
  const carIcon = L.divIcon({
    className: 'custom-car-marker',
    html: '<div style="background: var(--color-primary); width:16px; height:16px; border:3px solid #fff; border-radius:50%; box-shadow:0 0 10px var(--color-primary);"></div>',
    iconSize: [16, 16]
  });
  L.marker(detroitCoords, { icon: carIcon }).addTo(AppState.maps.dashboard)
    .bindPopup("<b>Your Vehicle</b><br>Woodward Ave, Detroit").openPopup();
    
  // Render current hazards from database
  renderMapHazards(AppState.maps.dashboard);
}

function renderMapHazards(mapInstance) {
  AppState.hazards.forEach(h => {
    let glowColor = 'var(--color-warning)';
    if (h.severity === 'Critical') glowColor = 'var(--color-danger)';
    if (h.severity === 'Low') glowColor = 'var(--color-success)';
    
    const hazardIcon = L.divIcon({
      className: 'custom-hazard-marker',
      html: `<div style="background: ${glowColor}; width:12px; height:12px; border:2px solid #000; border-radius:50%; box-shadow: 0 0 8px ${glowColor};"></div>`,
      iconSize: [12, 12]
    });
    
    L.marker([h.lat, h.lng], { icon: hazardIcon })
      .addTo(mapInstance)
      .bindPopup(`<b>${h.label}</b><br>Severity: ${h.severity}<br>Reported: ${h.time}`);
  });
}

// --- MAP 2: SAFE DRIVE CARPLAY MAP & NAVIGATION SIMULATION ---
function initSafeDriveMap() {
  const container = document.getElementById('safe-drive-map');
  if (!container) return;
  
  if (AppState.maps.safeDrive) {
    AppState.maps.safeDrive.invalidateSize();
    return;
  }
  
  const startCoords = [42.3314, -83.0458]; // Woodward Ave
  AppState.maps.safeDrive = L.map('safe-drive-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(startCoords, 13);
  
  L.tileLayer(MapTileURL, {
    maxZoom: 19,
    attribution: MapAttrib
  }).addTo(AppState.maps.safeDrive);
  
  renderMapHazards(AppState.maps.safeDrive);
  
  // Define simulated route polylines
  // Safest Woodward Loop route
  const safestCoords = [
    [42.3314, -83.0458], // Start
    [42.3360, -83.0500],
    [42.3420, -83.0570],
    [42.3480, -83.0630],
    [42.3580, -83.0750], // Airport approach
    [42.3650, -83.0800]  // Airport
  ];
  
  // Fastest I-75 Highway route (passes near high construction zone)
  const fastestCoords = [
    [42.3314, -83.0458], // Start
    [42.3340, -83.0380],
    [42.3480, -83.0420],
    [42.3550, -83.0600], // Passes through construction
    [42.3610, -83.0720],
    [42.3650, -83.0800]  // Airport
  ];
  
  // Store raw coordinate arrays (not LatLng objects) for interpolation
  AppState.navigation.safestCoords = safestCoords;
  AppState.navigation.fastestCoords = fastestCoords;
  
  // Draw glowing paths
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
  
  // Vehicle navigation avatar marker
  const vehicleIcon = L.divIcon({
    className: 'nav-vehicle-marker',
    html: '<div style="background: var(--color-primary); width:20px; height:20px; border:4px solid #fff; border-radius:50%; box-shadow:0 0 15px var(--color-primary);"></div>',
    iconSize: [20, 20]
  });
  
  AppState.navigation.carMarker = L.marker(startCoords, { icon: vehicleIcon }).addTo(AppState.maps.safeDrive);
  // Initialize with safest route coords
  AppState.navigation.routeCoords = safestCoords;
}

function selectRoute(routeType) {
  document.getElementById('route-safest').classList.remove('selected');
  document.getElementById('route-fastest').classList.remove('selected');
  
  document.getElementById(`route-${routeType}`).classList.add('selected');
  AppState.navigation.chosenRoute = routeType;
  
  if (routeType === 'safest') {
    AppState.navigation.safestPath.setStyle({ color: '#10b981', weight: 6, opacity: 0.85 });
    AppState.navigation.fastestPath.setStyle({ color: '#3b82f6', weight: 4, opacity: 0.5 });
    // Use stored raw coordinate arrays
    AppState.navigation.routeCoords = AppState.navigation.safestCoords || AppState.navigation.safestPath.getLatLngs().map(ll => [ll.lat, ll.lng]);
    document.getElementById('nav-assistant-prompt').textContent = 
      '"Heavy rain detected. Safest route selected to avoid standing water on Jefferson Ave. Maintain present speed limit."';
  } else {
    AppState.navigation.safestPath.setStyle({ color: '#10b981', weight: 4, opacity: 0.5 });
    AppState.navigation.fastestPath.setStyle({ color: '#3b82f6', weight: 6, opacity: 0.85 });
    AppState.navigation.routeCoords = AppState.navigation.fastestCoords || AppState.navigation.fastestPath.getLatLngs().map(ll => [ll.lat, ll.lng]);
    document.getElementById('nav-assistant-prompt').textContent = 
      '"Warning: Fastest route leads through a high construction zone. Speed reduction and alertness recommended."';
  }
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
      // Trip completed!
      stopNavigationSimulation();
      speakText("Trip complete. Auto generating safety summaries.");
      setTimeout(() => {
        navigateTo('trip-summary');
      }, 1000);
      return;
    }
    
    // Update car coordinates
    const nextCoords = AppState.navigation.routeCoords[AppState.navigation.stepIndex];
    AppState.navigation.carMarker.setLatLng(nextCoords);
    AppState.maps.safeDrive.panTo(nextCoords);
    
    // Vary speeds dynamically
    let speed = Math.floor(Math.random() * 8) + 42;
    let limit = 50;
    
    // If approaching construction zone (in fastest route)
    if (AppState.navigation.chosenRoute === 'fastest' && AppState.navigation.stepIndex === 3) {
      speed = 28;
      limit = 30;
      document.getElementById('nav-assistant-prompt').textContent = 
        "\"Entering active Construction Zone. Potholes identified nearby. Recommended Speed: 30 MPH.\"";
      speakText("Warning. Entering active construction corridor. Reduce speed.");
    }
    
    document.getElementById('nav-hud-speed').textContent = `${speed} mph`;
    document.getElementById('nav-hud-limit').textContent = `${limit} mph`;
    
    // Update top header hud details dynamically
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

// --- 5. DRIVER MONITORING LOGIC ---
function startDriverMonitoringSimulation() {
  if (AppState.biometrics.intervalId) return;
  
  const blinkEl = document.getElementById('bio-blink');
  const closureEl = document.getElementById('bio-closure');
  const gazeEl = document.getElementById('bio-gaze');
  const scoreCircle = document.getElementById('driver-score-circle');
  const scoreVal = document.getElementById('driver-score-val');
  const scoreLabel = document.getElementById('driver-score-label');
  
  const seatbeltPill = document.getElementById('bio-seatbelt');
  const drowsinessPill = document.getElementById('bio-drowsiness');
  const phonePill = document.getElementById('bio-phone');
  const yawningPill = document.getElementById('bio-yawning');
  const lanePill = document.getElementById('bio-lane');
  const voiceAlertEl = document.getElementById('driver-voice-alert');
  
  let yawns = 0;
  
  AppState.biometrics.intervalId = setInterval(() => {
    // Generate slight normal fluctuations
    const blink = Math.floor(Math.random() * 6) + 15;
    const closure = (Math.random() * 0.1 + 0.18).toFixed(2);
    const gazes = ['Road Center', 'Road Center', 'Left Mirror', 'Right Mirror', 'Dashboard'];
    const gaze = gazes[Math.floor(Math.random() * gazes.length)];
    
    blinkEl.textContent = `${blink} / min`;
    closureEl.textContent = `${closure}s (Normal)`;
    gazeEl.textContent = gaze;
    
    // Standard status updating
    if (AppState.biometrics.score > 85) {
      drowsinessPill.textContent = 'ALERT';
      drowsinessPill.className = 'factor-status-pill success';
      scoreLabel.textContent = 'Driver Fully Alert';
      scoreLabel.style.color = 'var(--color-success)';
      scoreCircle.className = 'circle-bar success';
      
      // Keep SVG stroke-dashoffset (Max value is 389, represents 100)
      const scoreFraction = AppState.biometrics.score / 100;
      const strokeOffset = 389 - (389 * scoreFraction);
      scoreCircle.style.strokeDashoffset = strokeOffset;
    }
    
  }, 3000);
}

function stopDriverMonitoringSimulation() {
  if (AppState.biometrics.intervalId) {
    clearInterval(AppState.biometrics.intervalId);
    AppState.biometrics.intervalId = null;
  }
}

// Simulate severe drowsiness warning to show ADAS functionality
function triggerSimulatedDrowsinessAlert() {
  // Navigate to driver monitor if not there
  navigateTo('driver-monitor');
  
  const scoreCircle = document.getElementById('driver-score-circle');
  const scoreVal = document.getElementById('driver-score-val');
  const scoreLabel = document.getElementById('driver-score-label');
  const drowsinessPill = document.getElementById('bio-drowsiness');
  const voiceAlertEl = document.getElementById('driver-voice-alert');
  
  // Decrease safety stats
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
}

// --- MAP 3: ROAD INTELLIGENCE MAP & REPORTER ---
let reportedHazardLocation = null;

function initRoadIntelMap() {
  const container = document.getElementById('road-intel-map');
  if (!container) return;
  
  if (AppState.maps.roadIntel) {
    AppState.maps.roadIntel.invalidateSize();
    return;
  }
  
  const centerCoords = [42.3314, -83.0458];
  AppState.maps.roadIntel = L.map('road-intel-map', {
    zoomControl: true,
    attributionControl: false
  }).setView(centerCoords, 13);
  
  L.tileLayer(MapTileURL, {
    maxZoom: 19,
    attribution: MapAttrib
  }).addTo(AppState.maps.roadIntel);
  
  renderMapHazards(AppState.maps.roadIntel);
  
  // Setup click handler to place custom pins
  AppState.maps.roadIntel.on('click', (e) => {
    reportedHazardLocation = e.latlng;
    
    // Clear temporary marker if exists
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
  
  // Choose coordinates: use selection pin if clicked, otherwise mock random downtown Detroit location
  const lat = reportedHazardLocation ? reportedHazardLocation.lat : (42.33 + Math.random() * 0.02);
  const lng = reportedHazardLocation ? reportedHazardLocation.lng : (-83.04 - Math.random() * 0.02);
  
  const newHazard = {
    id: AppState.hazards.length + 1,
    lat: lat,
    lng: lng,
    type: type,
    severity: severity,
    label: locationText || `Reported ${type} hazard`,
    time: 'Just now',
    img: 'assets/road_hazard.png'
  };
  
  // Save in client state DB
  AppState.hazards.push(newHazard);
  
  // Re-draw on the active map
  if (AppState.maps.roadIntel) {
    if (AppState.maps.roadIntel.tempMarker) {
      AppState.maps.roadIntel.removeLayer(AppState.maps.roadIntel.tempMarker);
    }
    renderMapHazards(AppState.maps.roadIntel);
  }
  
  // Update Government Dashboard Hazard Count widget
  document.getElementById('gov-hazard-count').textContent = AppState.hazards.length + 11; // pad with realistic base
  
  speakText(`Road hazard submitted. Category: ${type}. Broadcasting incident telemetry to nearby vehicles.`);
  
  // Reset form
  document.querySelectorAll('.hazard-type-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('report-location-text').value = '';
  document.getElementById('upload-status-text').textContent = 'Click to capture/upload hazard image';
  reportedHazardLocation = null;
  
  alert("Safety report submitted! Coordinates logged on map.");
}

// --- 7. RISK GAUGE RADIUS ANIMATION ---
function animateRiskGauge() {
  const gaugeBar = document.getElementById('risk-gauge-bar');
  const gaugeVal = document.getElementById('risk-gauge-val');
  const gaugeLabel = document.getElementById('risk-gauge-label');
  
  if (!gaugeBar) return;
  
  const riskIndex = 42; // 0-100 scale
  
  // Half-circle: stroke-dasharray is 251 (half of 2*pi*80 ≈ 502)
  // At 0% risk → dashoffset = 251 (fully hidden)
  // At 100% risk → dashoffset = 0 (fully visible)
  const targetOffset = 251 - (251 * (riskIndex / 100));
  
  // Reset to start position for animation
  gaugeBar.style.transition = 'none';
  gaugeBar.style.strokeDashoffset = '251';
  
  // Force reflow then animate
  void gaugeBar.offsetWidth;
  gaugeBar.style.transition = 'stroke-dashoffset 1.2s ease-out, stroke 0.8s';
  gaugeBar.style.strokeDashoffset = targetOffset;
  
  // Set color class based on risk level
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
  
  // Animated counter
  gaugeVal.textContent = '0';
  let currentVal = 0;
  const countInterval = setInterval(() => {
    if (currentVal >= riskIndex) {
      clearInterval(countInterval);
      return;
    }
    currentVal++;
    gaugeVal.textContent = currentVal;
  }, 20);
}

// --- 8. EMERGENCY SOS COUNTER & ANIMATED MAP DISPATCH ---
function initiateSOSCountdown() {
  const defaultCard = document.getElementById('sos-card-default');
  const countdownCard = document.getElementById('sos-card-countdown');
  
  defaultCard.style.display = 'none';
  countdownCard.style.display = 'flex';
  
  AppState.emergency.countdown = 10;
  document.getElementById('sos-countdown-timer').textContent = AppState.emergency.countdown;
  document.getElementById('sos-countdown-sub').textContent = AppState.emergency.countdown;
  
  speakText("Critical Alert. SOS Emergency Triggered. Contacting search and rescue in ten seconds. Select abort to cancel.");
  
  AppState.emergency.countdownId = setInterval(() => {
    AppState.emergency.countdown--;
    document.getElementById('sos-countdown-timer').textContent = AppState.emergency.countdown;
    document.getElementById('sos-countdown-sub').textContent = AppState.emergency.countdown;
    
    // Play subtle beep sounds
    if ('speechSynthesis' in window) {
      // speakText(AppState.emergency.countdown.toString());
    }
    
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
  
  // Remove emergency map elements if any
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
  
  speakText("Emergency SOS transmission complete. Henry Ford Hospital Ambulance DET 3 4 4 dispatched. ETA 4 minutes.");
  
  // Initialize Emergency Dispatch Map
  setTimeout(() => {
    const crashCoords = [42.3314, -83.0458];
    const hospitalCoords = [42.3614, -83.0800];
    
    AppState.emergency.map = L.map('emergency-map', {
      zoomControl: false,
      attributionControl: false
    }).setView(crashCoords, 13);
    
    L.tileLayer(MapTileURL, {
      maxZoom: 19,
      attribution: MapAttrib
    }).addTo(AppState.emergency.map);
    
    // Crash site red marker
    const crashIcon = L.divIcon({
      className: 'crash-marker',
      html: '<div style="background: var(--color-danger); width:18px; height:18px; border:3px solid #fff; border-radius:50%; box-shadow:0 0 15px var(--color-danger); animation: alertPulse 0.5s infinite alternate;"></div>',
      iconSize: [18, 18]
    });
    L.marker(crashCoords, { icon: crashIcon }).addTo(AppState.emergency.map).bindPopup("<b>Crash Site</b><br>Live GPS Lock").openPopup();
    
    // Hospital green icon
    const hospitalIcon = L.divIcon({
      className: 'hospital-marker',
      html: '<div style="background: var(--color-success); width:16px; height:16px; border:2px solid #fff; border-radius:50%; box-shadow:0 0 10px var(--color-success);"></div>',
      iconSize: [16, 16]
    });
    L.marker(hospitalCoords, { icon: hospitalIcon }).addTo(AppState.emergency.map).bindPopup("Henry Ford Hospital");
    
    // Ambulance marker dispatch moving animation
    let ambLat = hospitalCoords[0];
    let ambLng = hospitalCoords[1];
    
    const ambIcon = L.divIcon({
      className: 'amb-marker',
      html: '<div style="background: var(--color-warning); width:16px; height:16px; border:2px solid #fff; border-radius:50%; box-shadow:0 0 10px var(--color-warning); display:flex; align-items:center; justify-content:center;"><i class="fa fa-ambulance" style="font-size:9px; color:#000;"></i></div>',
      iconSize: [16, 16]
    });
    
    AppState.emergency.ambulanceMarker = L.marker([ambLat, ambLng], { icon: ambIcon }).addTo(AppState.emergency.map).bindPopup("Ambulance DET-344");
    
    // Moving animation ticks
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
      
      // Linear interpolation
      ambLat = hospitalCoords[0] + (crashCoords[0] - hospitalCoords[0]) * t;
      ambLng = hospitalCoords[1] + (crashCoords[1] - hospitalCoords[1]) * t;
      
      AppState.emergency.ambulanceMarker.setLatLng([ambLat, ambLng]);
      
      const remainingMinutes = Math.max(1, Math.round(4 * (1 - t)));
      document.getElementById('sos-ambulance-eta').textContent = `${remainingMinutes} mins`;
      
    }, 2000);
    
  }, 200);
}

// --- 9. GOVERNMENT DASHBOARD ANALYTICS CHARTS ---
function initGovernmentAnalyticsCharts() {
  const ctxBar = document.getElementById('chart-incidents-bar');
  const ctxLine = document.getElementById('chart-score-line');
  const ctxPie = document.getElementById('chart-hazards-pie');
  
  if (!ctxBar || !ctxLine || !ctxPie) return;
  
  // Clean previous Chart instances to prevent canvas render warnings
  if (AppState.charts.bar) AppState.charts.bar.destroy();
  if (AppState.charts.line) AppState.charts.line.destroy();
  if (AppState.charts.pie) AppState.charts.pie.destroy();
  
  const chartStylesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Inter' } }
      }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
    }
  };

  // 1. Bar Chart: Incidents by Hazard type
  AppState.charts.bar = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: ['Potholes', 'Waterlogging', 'Broken Signals', 'Construction', 'Animal Cross', 'Accidents'],
      datasets: [{
        label: 'Active Hazard Count',
        data: [18, 12, 5, 22, 3, 7],
        backgroundColor: [
          'rgba(245, 158, 11, 0.65)',
          'rgba(37, 99, 235, 0.65)',
          'rgba(239, 68, 68, 0.65)',
          'rgba(245, 158, 11, 0.65)',
          'rgba(34, 197, 94, 0.65)',
          'rgba(239, 68, 68, 0.65)'
        ],
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      }]
    },
    options: chartStylesOptions
  });

  // 2. Line Chart: Weekly safety scores over time
  AppState.charts.line = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [{
        label: 'Municipal Safety Index score',
        data: [76, 78, 84, 80, 81, 82.4],
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 0.85)',
        tension: 0.3,
        borderWidth: 3
      }]
    },
    options: chartStylesOptions
  });

  // 3. Pie Chart: Hazard distribution shares
  AppState.charts.pie = new Chart(ctxPie, {
    type: 'doughnut',
    data: {
      labels: ['Potholes', 'Flooding', 'Obstructions', 'Others'],
      datasets: [{
        data: [42, 28, 20, 10],
        backgroundColor: [
          'rgba(245, 158, 11, 0.75)',
          'rgba(37, 99, 235, 0.75)',
          'rgba(239, 68, 68, 0.75)',
          'rgba(255, 255, 255, 0.2)'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#94a3b8' }
        }
      }
    }
  });
}

// --- 10. AI ASSISTANT CHATBOT RESPONSES ---
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
  
  // Show typing loader
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
    return "Current risk is Medium due to heavy traffic and rain. Suggested safer route 'Woodward Safe-Link' is available (Risk Level: 10% vs 65% on I-75 North due to construction zones).";
  }
  
  if (clean.includes('hospital') || clean.includes('nearest hospital')) {
    // Automatically trigger navigation highlight target
    setTimeout(() => {
      openNearestHospital();
    }, 500);
    return "Displaying nearest emergency ward. Henry Ford Hospital is 0.8 miles away on West Grand Boulevard. Routing has been initialized.";
  }
  
  if (clean.includes('weather')) {
    return "Active radar reports rain density is 1.4 inches per hour. Road friction factor is down by 30%. I recommend keeping a safe distance of 140 feet.";
  }
  
  if (clean.includes('simulate') || clean.includes('alert') || clean.includes('tired') || clean.includes('fatigue')) {
    setTimeout(() => {
      triggerSimulatedDrowsinessAlert();
    }, 800);
    return "Acknowledged. Triggering ADAS drowsiness fatigue simulation to display active warnings.";
  }
  
  if (clean.includes('sos') || clean.includes('emergency')) {
    return "You can trigger emergency dispatches by holding the red SOS button or navigating to the Emergency SOS menu panel.";
  }
  
  return "I've logged your query. As your SentinelAI co-driver, I am continually monitoring telematics, crash indicators, weather alerts, and road anomalies.";
}

function openNearestHospital() {
  navigateTo('safe-drive');
  document.getElementById('nav-destination-input').value = "Henry Ford Emergency Room (0.8 mi)";
  document.getElementById('nav-assistant-prompt').textContent = 
    "\"Ambulance route to Henry Ford ER loaded. Proceed down Grand Boulevard. All traffic lights will hold safety priority green signals.\"";
  speakText("Routing to nearest emergency room: Henry Ford Emergency Center.");
}

// --- 11. TRIP SUMMARY & PDF REPORT DOWNLOADS ---
function simulateReportDownload() {
  speakText("Preparing Drive Safety Certificate compilation.");
  
  const reportData = `
=========================================
SENTINELAI MOBILITY SAFEOS REPORT
=========================================
Trip Summary Certificate
Stellantis Connected Vehicle Hackathon

Date Logged: 2026-07-24
Distance: 14.2 miles
Overall Safety Index Score: 95 / 100
Collision Warnings Triggered: 0
Drowsiness Alert Score: 0 (Normal)
Potholes Avoided: 2
Waterlogged lane mitigations: 1 (Safe-Link Woodward Route used)

ADAS Active Safety Level: 2+ Active Assist
Vehcile ID: Chrysler Pacifica PHEV
=========================================
Thank you for driving safely!
  `;
  
  const blob = new Blob([reportData], { type: 'text/plain' });
  const anchor = document.createElement('a');
  anchor.download = 'SentinelAI_Safety_Report.txt';
  anchor.href = window.URL.createObjectURL(blob);
  anchor.click();
}

// Dial Emergency contact simulator
function dialContact(contactName) {
  speakText(`Connecting phone link to ${contactName}. Directing call audio to main cabin speakers.`);
  alert(`Connecting cellular call link to: ${contactName}`);
}

// --- 12. SETTINGS PAGE UTILITIES ---
function toggleDarkHudMode() {
  const isDark = document.getElementById('setting-darkmode').checked;
  const root = document.documentElement;
  
  if (isDark) {
    root.style.setProperty('--bg-primary', '#060913');
    root.style.setProperty('--bg-secondary', '#0b0f19');
    root.style.setProperty('--glass-bg', 'rgba(15, 23, 42, 0.55)');
  } else {
    // CarPlay Light Dashboard mode
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
  
  // Update dashboard ICE contact view
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
