import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import {
  Sprout, Home, MessageCircle, Camera, CloudSun, MapPin, Bell, Landmark,
  IndianRupee, CalendarDays, FlaskConical, Mic, Settings, FileClock, User,
  Lock, Mail, Eye, EyeOff, Phone, ChevronRight, ChevronLeft, LogOut, Sun,
  Moon, Globe, Check, X, Upload, Send, Volume2, MicOff, ShieldCheck, Wind,
  Droplets, Gauge, AlertTriangle, TrendingUp, TrendingDown, Navigation,
  Star, Loader2, Leaf, Wheat, Menu, ArrowRight, RefreshCw, BadgeCheck,
  ClipboardList, Tractor, Bug, Info
} from "lucide-react";
import { identifyCropDisease } from "./cropHealthApi.js";
import { sendRealOtp, confirmOtp, saveFarmerProfile } from "./authService.js";
import { firebaseReady } from "./firebase.js";
import { askRealAI } from "./aiService.js";
import { searchNearbyShops, directionsUrl, placesApiReady } from "./placesApi.js";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

/* ============================================================
   i18n — small dictionary covering chrome / nav / labels
   ============================================================ */
const STR = {
  en: {
    appName: "AgriMitra", tagline: "Your farm, your friend, your AI",
    dashboard: "Dashboard", assistant: "AI Assistant", disease: "Disease Scan",
    weather: "Weather", shops: "Shop Locator", notifications: "Notifications",
    schemes: "Govt Schemes", market: "Market Prices", advisory: "Crop Advisory",
    soil: "Soil Info", settings: "Settings", reports: "Reports & History",
    profile: "Profile", logout: "Log out", welcome: "Welcome back",
    login: "Log in", register: "Create account", forgot: "Forgot password",
    verify: "Verify email", name: "Full name", phone: "Phone number",
    village: "Village", district: "District", state: "State",
    landSize: "Land size (acres)", mainCrops: "Main crops", soilType: "Soil type",
    preferredLang: "Preferred language", password: "Password", mandal: "Mandal",
    confirmPassword: "Confirm password", email: "Email address",
    dontHaveAccount: "New here?", haveAccount: "Already have an account?",
    createOne: "Create an account", signIn: "Sign in",
    forgotQ: "Forgot your password?", sendReset: "Send reset link",
    backToLogin: "Back to login", checkInbox: "Check your inbox",
    quickAccess: "Quick access", recentActivity: "Recent activity",
    cropHealth: "Crop health overview", weatherSummary: "Weather summary",
    sowing: "Sowing", harvestLabel: "Harvest", irrigationLabel: "Irrigation", fertilizerLabel: "Fertilizer",
    temperature: "Temperature", humidity: "Humidity", windSpeed: "Wind speed", uvIndex: "UV index",
    feelsLike: "Feels like", sevenDayForecast: "7-day forecast", yourRegion: "Your region",
    findingLocation: "Finding your location…", locationNeeded: "Location access needed for local weather",
    locationDeniedBody: "Showing default data — allow location access for your exact area's forecast.",
    tryAgain: "Try again", aiWeatherAdvice: "AI farming advice for this week",
    suitableCrops: "Suitable crops", tip: "Tip", applyBtn: "Apply", benefit: "Benefit",
    eligibility: "Eligibility", documents: "Documents", allLevel: "All", centralLevel: "Central", stateLevel: "State",
    alertTypes: "Alert types", noActivity: "No activity recorded yet this session.",
    allActivity: "All activity", weatherHistory: "Weather history", notificationHistory: "Notification history",
    appearance: "Appearance", darkMode: "Dark mode", notifVoice: "Notifications & voice",
    pushNotif: "Push notifications", voiceResponses: "Voice responses", security: "Security",
    captureUpload: "Capture or upload a crop photo", bestAngle: "Leaf, stem, fruit or whole-plant close-up works best",
    uploadBtn: "Upload", analyzeBtn: "Analyze", analyzing: "Analyzing…", resultsHere: "Results will appear here after analysis",
    runningDiagnosis: "Running AI diagnosis…", symptomsLabel: "Symptoms", causesLabel: "Causes",
    treatmentLabel: "Treatment", medicinesLabel: "Recommended medicines", preventionLabel: "Prevention",
    diseaseHistoryLabel: "Disease history", aiAccuracyNote: "AI results are a first opinion, not a lab-confirmed diagnosis — for valuable crops, confirm with your local agriculture officer before spraying.",
    selectCrop: "Which crop is this?", captureBtn: "Capture", autoDetect: "Auto-detect", confidenceLabel: "confidence",
    sendOtp: "Send OTP", otpSentTo: "Enter the 4-digit code sent to", otpError: "Incorrect OTP — please try again",
    verifyContinue: "Verify & continue", resendOtp: "Resend OTP",
    homeTagline: "One app for every question your farm asks.",
    homeSubtitle: "Crop advice, disease scans, weather, mandi prices and government schemes — in your language, on your phone.",
    getStarted: "Get started", exploreFeatures: "Everything inside AgriMitra", loginToContinue: "Log in to continue",
    homeCta: "Log in with your mobile number",
  },
  te: {
    appName: "అగ్రిమిత్ర", tagline: "మీ పొలం, మీ నేస్తం, మీ AI",
    dashboard: "డాష్‌బోర్డ్", assistant: "AI సహాయకుడు", disease: "వ్యాధి పరీక్ష",
    weather: "వాతావరణం", shops: "దుకాణాలు", notifications: "నోటిఫికేషన్లు",
    schemes: "ప్రభుత్వ పథకాలు", market: "మార్కెట్ ధరలు", advisory: "పంట సలహా",
    soil: "నేల సమాచారం", settings: "సెట్టింగ్‌లు", reports: "చరిత్ర",
    profile: "ప్రొఫైల్", logout: "లాగ్ అవుట్", welcome: "తిరిగి స్వాగతం",
    login: "లాగిన్", register: "ఖాతా సృష్టించండి", forgot: "పాస్‌వర్డ్ మర్చిపోయారా",
    verify: "ఇమెయిల్ ధృవీకరణ", name: "పూర్తి పేరు", phone: "ఫోన్ నంబర్",
    village: "గ్రామం", district: "జిల్లా", state: "రాష్ట్రం",
    landSize: "భూమి పరిమాణం (ఎకరాలు)", mainCrops: "ప్రధాన పంటలు", soilType: "నేల రకం",
    preferredLang: "భాష", password: "పాస్‌వర్డ్", mandal: "మండలం",
    confirmPassword: "పాస్‌వర్డ్ నిర్ధారించండి", email: "ఇమెయిల్",
    dontHaveAccount: "కొత్తగా వచ్చారా?", haveAccount: "ఖాతా ఉందా?",
    createOne: "ఖాతా సృష్టించండి", signIn: "సైన్ ఇన్",
    forgotQ: "పాస్‌వర్డ్ మర్చిపోయారా?", sendReset: "రీసెట్ లింక్ పంపండి",
    backToLogin: "లాగిన్‌కు తిరిగి వెళ్ళండి", checkInbox: "మీ ఇమెయిల్ చూడండి",
    quickAccess: "త్వరిత ప్రాప్యత", recentActivity: "ఇటీవలి కార్యకలాపం",
    cropHealth: "పంట ఆరోగ్యం", weatherSummary: "వాతావరణ సారాంశం",
    sowing: "విత్తడం", harvestLabel: "కోత", irrigationLabel: "నీటిపారుదల", fertilizerLabel: "ఎరువు",
    temperature: "ఉష్ణోగ్రత", humidity: "తేమ", windSpeed: "గాలి వేగం", uvIndex: "UV సూచిక",
    feelsLike: "అనిపిస్తుంది", sevenDayForecast: "7-రోజుల సూచన", yourRegion: "మీ ప్రాంతం",
    findingLocation: "మీ లొకేషన్ కనుగొంటోంది…", locationNeeded: "స్థానిక వాతావరణం కోసం లొకేషన్ అనుమతి అవసరం",
    locationDeniedBody: "డిఫాల్ట్ డేటా చూపిస్తోంది — మీ ఖచ్చితమైన ప్రాంత సూచన కోసం లొకేషన్ అనుమతించండి.",
    tryAgain: "మళ్ళీ ప్రయత్నించండి", aiWeatherAdvice: "ఈ వారం కోసం AI వ్యవసాయ సలహా",
    suitableCrops: "అనువైన పంటలు", tip: "సలహా", applyBtn: "దరఖాస్తు చేయండి", benefit: "ప్రయోజనం",
    eligibility: "అర్హత", documents: "పత్రాలు", allLevel: "అన్నీ", centralLevel: "కేంద్రం", stateLevel: "రాష్ట్రం",
    alertTypes: "హెచ్చరిక రకాలు", noActivity: "ఈ సెషన్‌లో ఇంకా కార్యకలాపం లేదు.",
    allActivity: "అన్ని కార్యకలాపాలు", weatherHistory: "వాతావరణ చరిత్ర", notificationHistory: "నోటిఫికేషన్ చరిత్ర",
    appearance: "రూపం", darkMode: "డార్క్ మోడ్", notifVoice: "నోటిఫికేషన్లు & వాయిస్",
    pushNotif: "పుష్ నోటిఫికేషన్లు", voiceResponses: "వాయిస్ ప్రతిస్పందనలు", security: "భద్రత",
    captureUpload: "పంట ఫోటో తీయండి లేదా అప్‌లోడ్ చేయండి", bestAngle: "ఆకు, కాండం, పండు లేదా మొక్క క్లోజప్ ఉత్తమం",
    uploadBtn: "అప్‌లోడ్", analyzeBtn: "విశ్లేషించండి", analyzing: "విశ్లేషిస్తోంది…", resultsHere: "విశ్లేషణ తర్వాత ఫలితాలు ఇక్కడ కనిపిస్తాయి",
    runningDiagnosis: "AI నిర్ధారణ జరుగుతోంది…", symptomsLabel: "లక్షణాలు", causesLabel: "కారణాలు",
    treatmentLabel: "చికిత్స", medicinesLabel: "సిఫార్సు చేసిన మందులు", preventionLabel: "నివారణ",
    diseaseHistoryLabel: "వ్యాధి చరిత్ర", aiAccuracyNote: "AI ఫలితాలు ప్రాథమిక అభిప్రాయం మాత్రమే, ల్యాబ్ నిర్ధారిత నిర్ధారణ కాదు — విలువైన పంటలకు స్ప్రే చేసే ముందు స్థానిక వ్యవసాయ అధికారిని సంప్రదించండి.",
    selectCrop: "ఇది ఏ పంట?", captureBtn: "ఫోటో తీయండి", autoDetect: "ఆటో-డిటెక్ట్", confidenceLabel: "నమ్మకం",
    sendOtp: "OTP పంపండి", otpSentTo: "4-అంకెల కోడ్ పంపబడింది", otpError: "తప్పు OTP — మళ్ళీ ప్రయత్నించండి",
    verifyContinue: "నిర్ధారించి కొనసాగండి", resendOtp: "OTP మళ్ళీ పంపండి",
    homeTagline: "మీ పొలం అడిగే ప్రతి ప్రశ్నకు ఒకే యాప్.",
    homeSubtitle: "పంట సలహా, వ్యాధి పరీక్ష, వాతావరణం, మార్కెట్ ధరలు, ప్రభుత్వ పథకాలు — మీ భాషలో, మీ ఫోన్‌లో.",
    getStarted: "ప్రారంభించండి", exploreFeatures: "అగ్రిమిత్రలో ఉన్నవన్నీ", loginToContinue: "కొనసాగించడానికి లాగిన్ అవ్వండి",
    homeCta: "మీ మొబైల్ నంబర్‌తో లాగిన్ అవ్వండి",
  },
  hi: {
    appName: "एग्रीमित्र", tagline: "आपका खेत, आपका दोस्त, आपका AI",
    dashboard: "डैशबोर्ड", assistant: "AI सहायक", disease: "रोग जांच",
    weather: "मौसम", shops: "दुकानें", notifications: "सूचनाएं",
    schemes: "सरकारी योजनाएं", market: "बाज़ार भाव", advisory: "फसल सलाह",
    soil: "मिट्टी की जानकारी", settings: "सेटिंग्स", reports: "इतिहास",
    profile: "प्रोफ़ाइल", logout: "लॉग आउट", welcome: "वापसी पर स्वागत है",
    login: "लॉगिन", register: "खाता बनाएं", forgot: "पासवर्ड भूल गए",
    verify: "ईमेल सत्यापन", name: "पूरा नाम", phone: "फ़ोन नंबर",
    village: "गांव", district: "ज़िला", state: "राज्य",
    landSize: "भूमि (एकड़)", mainCrops: "मुख्य फसलें", soilType: "मिट्टी का प्रकार",
    preferredLang: "भाषा", password: "पासवर्ड", mandal: "मंडल",
    confirmPassword: "पासवर्ड की पुष्टि करें", email: "ईमेल पता",
    dontHaveAccount: "नए हैं?", haveAccount: "पहले से खाता है?",
    createOne: "खाता बनाएं", signIn: "साइन इन करें",
    forgotQ: "पासवर्ड भूल गए?", sendReset: "रीसेट लिंक भेजें",
    backToLogin: "लॉगिन पर वापस जाएं", checkInbox: "अपना ईमेल जांचें",
    quickAccess: "त्वरित पहुंच", recentActivity: "हाल की गतिविधि",
    cropHealth: "फसल स्वास्थ्य", weatherSummary: "मौसम सारांश",
    sowing: "बुवाई", harvestLabel: "कटाई", irrigationLabel: "सिंचाई", fertilizerLabel: "उर्वरक",
    temperature: "तापमान", humidity: "नमी", windSpeed: "हवा की गति", uvIndex: "UV सूचकांक",
    feelsLike: "महसूस होता है", sevenDayForecast: "7-दिन का पूर्वानुमान", yourRegion: "आपका क्षेत्र",
    findingLocation: "आपका स्थान खोजा जा रहा है…", locationNeeded: "स्थानीय मौसम के लिए लोकेशन अनुमति चाहिए",
    locationDeniedBody: "डिफ़ॉल्ट डेटा दिखा रहे हैं — अपने सटीक क्षेत्र के पूर्वानुमान के लिए लोकेशन अनुमति दें।",
    tryAgain: "फिर कोशिश करें", aiWeatherAdvice: "इस सप्ताह के लिए AI कृषि सलाह",
    suitableCrops: "उपयुक्त फसलें", tip: "सुझाव", applyBtn: "आवेदन करें", benefit: "लाभ",
    eligibility: "पात्रता", documents: "दस्तावेज़", allLevel: "सभी", centralLevel: "केंद्र", stateLevel: "राज्य",
    alertTypes: "अलर्ट प्रकार", noActivity: "इस सत्र में अभी तक कोई गतिविधि दर्ज नहीं हुई।",
    allActivity: "सभी गतिविधि", weatherHistory: "मौसम इतिहास", notificationHistory: "सूचना इतिहास",
    appearance: "रूप", darkMode: "डार्क मोड", notifVoice: "सूचनाएं व आवाज़",
    pushNotif: "पुश सूचनाएं", voiceResponses: "आवाज़ प्रतिक्रियाएं", security: "सुरक्षा",
    captureUpload: "फसल की फोटो लें या अपलोड करें", bestAngle: "पत्ती, तना, फल या पूरे पौधे का क्लोज़-अप सबसे बेहतर",
    uploadBtn: "अपलोड करें", analyzeBtn: "विश्लेषण करें", analyzing: "विश्लेषण हो रहा है…", resultsHere: "विश्लेषण के बाद परिणाम यहां दिखेंगे",
    runningDiagnosis: "AI जांच चल रही है…", symptomsLabel: "लक्षण", causesLabel: "कारण",
    treatmentLabel: "उपचार", medicinesLabel: "अनुशंसित दवाएं", preventionLabel: "रोकथाम",
    diseaseHistoryLabel: "रोग इतिहास", aiAccuracyNote: "AI परिणाम केवल प्रारंभिक राय है, प्रयोगशाला-पुष्ट निदान नहीं — कीमती फसलों पर छिड़काव से पहले स्थानीय कृषि अधिकारी से पुष्टि करें।",
    selectCrop: "यह कौन सी फसल है?", captureBtn: "फोटो लें", autoDetect: "ऑटो-डिटेक्ट", confidenceLabel: "विश्वास स्तर",
    sendOtp: "OTP भेजें", otpSentTo: "4-अंकों का कोड भेजा गया", otpError: "गलत OTP — फिर से कोशिश करें",
    verifyContinue: "पुष्टि करें और जारी रखें", resendOtp: "OTP फिर से भेजें",
    homeTagline: "आपके खेत के हर सवाल के लिए एक ऐप।",
    homeSubtitle: "फसल सलाह, रोग जांच, मौसम, बाज़ार भाव और सरकारी योजनाएं — आपकी भाषा में, आपके फ़ोन पर।",
    getStarted: "शुरू करें", exploreFeatures: "एग्रीमित्र में सब कुछ", loginToContinue: "जारी रखने के लिए लॉगिन करें",
    homeCta: "अपने मोबाइल नंबर से लॉगिन करें",
  },
};

const NAV = [
  { key: "dashboard", icon: Home },
  { key: "assistant", icon: MessageCircle },
  { key: "disease", icon: Camera },
  { key: "weather", icon: CloudSun },
  { key: "shops", icon: MapPin },
  { key: "market", icon: IndianRupee },
  { key: "advisory", icon: CalendarDays },
  { key: "soil", icon: FlaskConical },
  { key: "schemes", icon: Landmark },
  { key: "notifications", icon: Bell },
  { key: "reports", icon: FileClock },
  { key: "settings", icon: Settings },
];

/* ============================================================
   MOCK DATA
   ============================================================ */
const WEATHER_FORECAST = [
  { day: "Mon", temp: 31, rain: 10, humidity: 58 },
  { day: "Tue", temp: 33, rain: 5, humidity: 52 },
  { day: "Wed", temp: 29, rain: 65, humidity: 78 },
  { day: "Thu", temp: 27, rain: 80, humidity: 84 },
  { day: "Fri", temp: 30, rain: 20, humidity: 60 },
  { day: "Sat", temp: 32, rain: 8, humidity: 50 },
  { day: "Sun", temp: 34, rain: 2, humidity: 45 },
];

const MARKET_PRICES = [
  { crop: "Paddy (Rice)", price: 2210, unit: "per quintal", trend: 3.2, up: true, history: [2050,2080,2110,2150,2180,2210] },
  { crop: "Cotton", price: 7150, unit: "per quintal", trend: -1.8, up: false, history: [7400,7350,7300,7250,7200,7150] },
  { crop: "Turmeric", price: 15800, unit: "per quintal", trend: 5.4, up: true, history: [14200,14600,15000,15300,15600,15800] },
  { crop: "Chilli", price: 19200, unit: "per quintal", trend: -2.6, up: false, history: [19800,19700,19600,19500,19300,19200] },
  { crop: "Maize", price: 1980, unit: "per quintal", trend: 1.1, up: true, history: [1900,1920,1940,1955,1970,1980] },
  { crop: "Groundnut", price: 6420, unit: "per quintal", trend: 0.6, up: true, history: [6300,6340,6360,6390,6400,6420] },
];

const SHOPS = [
  { name: "Sri Venkateswara Seeds", type: "Seeds", distance: "1.2 km", phone: "+91 90000 11122", rating: 4.6, lat: 17.385, lng: 78.4867 },
  { name: "Kisan Fertilizer Depot", type: "Fertilizer", distance: "2.4 km", phone: "+91 90000 22233", rating: 4.3, lat: 17.39, lng: 78.49 },
  { name: "Green Field Agro Chemicals", type: "Pesticides", distance: "3.1 km", phone: "+91 90000 33344", rating: 4.1, lat: 17.4, lng: 78.47 },
  { name: "Annadata Farm Equipments", type: "Equipment", distance: "4.5 km", phone: "+91 90000 44455", rating: 4.7, lat: 17.37, lng: 78.5 },
  { name: "Rythu Bazaar Agri Store", type: "Seeds & Fertilizer", distance: "5.0 km", phone: "+91 90000 55566", rating: 4.4, lat: 17.41, lng: 78.46 },
];

const SCHEMES = {
  en: [
    { levelKey: "central", name: "PM-KISAN", level: "Central", benefit: "₹6,000/year income support in 3 installments", eligibility: "All landholding farmer families", docs: "Aadhaar, land records, bank passbook", link: "https://pmkisan.gov.in" },
    { levelKey: "central", name: "Pradhan Mantri Fasal Bima Yojana", level: "Central", benefit: "Crop insurance against natural calamities", eligibility: "Farmers growing notified crops", docs: "Land records, sowing certificate, bank details", link: "https://pmfby.gov.in" },
    { levelKey: "central", name: "Soil Health Card Scheme", level: "Central", benefit: "Free soil testing & nutrient advice every 2 years", eligibility: "All farmers", docs: "Land ownership proof", link: "https://soilhealth.dac.gov.in" },
    { levelKey: "state", name: "Rythu Bandhu", level: "State", benefit: "Investment support per acre per season", eligibility: "Land-owning farmers in the state", docs: "Passbook, land title deed", link: "#" },
    { levelKey: "central", name: "Kisan Credit Card (KCC)", level: "Central", benefit: "Low-interest crop & farm loans", eligibility: "Farmers, tenant farmers, sharecroppers", docs: "ID proof, land/lease documents", link: "https://www.myscheme.gov.in" },
  ],
  te: [
    { levelKey: "central", name: "PM-KISAN", level: "కేంద్రం", benefit: "సంవత్సరానికి ₹6,000, 3 వాయిదాలలో", eligibility: "భూమి ఉన్న అన్ని రైతు కుటుంబాలు", docs: "ఆధార్, భూమి రికార్డులు, బ్యాంక్ పాస్‌బుక్", link: "https://pmkisan.gov.in" },
    { levelKey: "central", name: "ప్రధాన మంత్రి ఫసల్ బీమా యోజన", level: "కేంద్రం", benefit: "ప్రకృతి వైపరీత్యాల నుండి పంట బీమా", eligibility: "నోటిఫై చేసిన పంటలు పండించే రైతులు", docs: "భూమి రికార్డులు, విత్తన ధృవీకరణ పత్రం, బ్యాంక్ వివరాలు", link: "https://pmfby.gov.in" },
    { levelKey: "central", name: "సాయిల్ హెల్త్ కార్డ్ పథకం", level: "కేంద్రం", benefit: "ప్రతి 2 సంవత్సరాలకు ఉచిత నేల పరీక్ష & సలహా", eligibility: "అందరు రైతులు", docs: "భూమి యాజమాన్య ధృవీకరణ", link: "https://soilhealth.dac.gov.in" },
    { levelKey: "state", name: "రైతు బంధు", level: "రాష్ట్రం", benefit: "సీజన్‌కు ఎకరాకు పెట్టుబడి సాయం", eligibility: "రాష్ట్రంలో భూమి ఉన్న రైతులు", docs: "పాస్‌బుక్, భూమి పట్టా", link: "#" },
    { levelKey: "central", name: "కిసాన్ క్రెడిట్ కార్డ్ (KCC)", level: "కేంద్రం", benefit: "తక్కువ వడ్డీ పంట & వ్యవసాయ రుణాలు", eligibility: "రైతులు, కౌలు రైతులు, వాటాదారులు", docs: "గుర్తింపు రుజువు, భూమి/లీజు పత్రాలు", link: "https://www.myscheme.gov.in" },
  ],
  hi: [
    { levelKey: "central", name: "PM-KISAN", level: "केंद्र", benefit: "₹6,000/वर्ष, 3 किस्तों में", eligibility: "सभी भूमिधारक किसान परिवार", docs: "आधार, भूमि रिकॉर्ड, बैंक पासबुक", link: "https://pmkisan.gov.in" },
    { levelKey: "central", name: "प्रधानमंत्री फसल बीमा योजना", level: "केंद्र", benefit: "प्राकृतिक आपदाओं से फसल बीमा", eligibility: "अधिसूचित फसल उगाने वाले किसान", docs: "भूमि रिकॉर्ड, बुवाई प्रमाणपत्र, बैंक विवरण", link: "https://pmfby.gov.in" },
    { levelKey: "central", name: "मृदा स्वास्थ्य कार्ड योजना", level: "केंद्र", benefit: "हर 2 साल में मुफ़्त मिट्टी जांच व सलाह", eligibility: "सभी किसान", docs: "भूमि स्वामित्व प्रमाण", link: "https://soilhealth.dac.gov.in" },
    { levelKey: "state", name: "रायथु बंधु", level: "राज्य", benefit: "प्रति सीजन प्रति एकड़ निवेश सहायता", eligibility: "राज्य में भूमिधारक किसान", docs: "पासबुक, भूमि पट्टा", link: "#" },
    { levelKey: "central", name: "किसान क्रेडिट कार्ड (KCC)", level: "केंद्र", benefit: "कम ब्याज पर फसल व कृषि ऋण", eligibility: "किसान, बटाईदार, काश्तकार", docs: "पहचान प्रमाण, भूमि/पट्टा दस्तावेज़", link: "https://www.myscheme.gov.in" },
  ],
};

const CROP_CALENDAR = {
  en: [
    { crop: "Paddy", season: "Kharif", sow: "June – July", harvest: "Nov – Dec", irrigation: "Standing water, 5–7 day cycle", fertilizer: "N-P-K split at tillering & panicle stage" },
    { crop: "Cotton", season: "Kharif", sow: "May – June", harvest: "Oct – Jan", irrigation: "Every 10–12 days, drip preferred", fertilizer: "Basal DAP + top-dress urea at 45 & 75 days" },
    { crop: "Groundnut", season: "Kharif/Rabi", sow: "June or Jan", harvest: "Sept or Apr", irrigation: "Light, frequent — avoid waterlogging", fertilizer: "Gypsum at flowering, low nitrogen" },
    { crop: "Wheat", season: "Rabi", sow: "Nov – Dec", harvest: "Mar – Apr", irrigation: "4–6 irrigations, critical at CRI stage", fertilizer: "Urea in 2–3 splits" },
  ],
  te: [
    { crop: "వరి", season: "ఖరీఫ్", sow: "జూన్ – జూలై", harvest: "నవం – డిసెం", irrigation: "నిలిచిన నీరు, 5–7 రోజుల చక్రం", fertilizer: "పిలకల దశ & వెన్ను దశలో N-P-K విభజన" },
    { crop: "పత్తి", season: "ఖరీఫ్", sow: "మే – జూన్", harvest: "అక్టో – జన", irrigation: "ప్రతి 10–12 రోజులకు, బిందు సేద్యం మేలు", fertilizer: "బేసల్ DAP + 45, 75 రోజులకు యూరియా టాప్-డ్రెస్" },
    { crop: "వేరుశనగ", season: "ఖరీఫ్/రబీ", sow: "జూన్ లేదా జనవరి", harvest: "సెప్టెం లేదా ఏప్రిల్", irrigation: "తేలికపాటి, తరచుగా — నీరు నిలవకుండా చూడాలి", fertilizer: "పూత దశలో జిప్సం, తక్కువ నత్రజని" },
    { crop: "గోధుమ", season: "రబీ", sow: "నవం – డిసెం", harvest: "మార్చి – ఏప్రిల్", irrigation: "4–6 సార్లు నీరు, CRI దశలో కీలకం", fertilizer: "2–3 దఫాలుగా యూరియా" },
  ],
  hi: [
    { crop: "धान", season: "खरीफ", sow: "जून – जुलाई", harvest: "नवं – दिसं", irrigation: "खड़ा पानी, 5–7 दिन का चक्र", fertilizer: "कल्ले व बाली अवस्था में N-P-K विभाजन" },
    { crop: "कपास", season: "खरीफ", sow: "मई – जून", harvest: "अक्टू – जन", irrigation: "हर 10–12 दिन में, ड्रिप बेहतर", fertilizer: "बेसल DAP + 45 व 75 दिन पर यूरिया टॉप-ड्रेस" },
    { crop: "मूंगफली", season: "खरीफ/रबी", sow: "जून या जनवरी", harvest: "सितं या अप्रैल", irrigation: "हल्की, बार-बार — जलभराव से बचें", fertilizer: "फूल अवस्था में जिप्सम, कम नाइट्रोजन" },
    { crop: "गेहूं", season: "रबी", sow: "नवं – दिसं", harvest: "मार्च – अप्रैल", irrigation: "4–6 सिंचाई, CRI अवस्था में सबसे ज़रूरी", fertilizer: "यूरिया 2–3 भागों में" },
  ],
};

const SOIL_TYPES = {
  en: [
    { type: "Black (Regur) Soil", crops: "Cotton, soybean, sugarcane, wheat", tip: "Retains moisture well — avoid over-irrigation; deep ploughing after monsoon improves aeration.", fertilizer: "Needs added phosphorus & organic matter." },
    { type: "Red Soil", crops: "Groundnut, millets, pulses, cotton", tip: "Low in nitrogen & humus — mix in farmyard manure and legume rotation.", fertilizer: "Boost with nitrogen and organic compost." },
    { type: "Alluvial Soil", crops: "Paddy, wheat, sugarcane, vegetables", tip: "Highly fertile — ideal for intensive, multi-crop cultivation.", fertilizer: "Balanced NPK, responds well to all fertilizers." },
    { type: "Sandy / Loamy Soil", crops: "Groundnut, potato, watermelon", tip: "Drains fast — use mulching and frequent light irrigation.", fertilizer: "Split doses of nitrogen to reduce leaching loss." },
  ],
  te: [
    { type: "నల్ల (రేగడి) నేల", crops: "పత్తి, సోయాబీన్, చెరకు, గోధుమ", tip: "తేమను బాగా నిలుపుతుంది — అధిక నీటిపారుదల మానండి; వర్షాకాలం తర్వాత లోతు దుక్కి గాలి ప్రసరణ మెరుగుపరుస్తుంది.", fertilizer: "అదనపు భాస్వరం & సేంద్రియ పదార్థం అవసరం." },
    { type: "ఎర్ర నేల", crops: "వేరుశనగ, చిరుధాన్యాలు, పప్పులు, పత్తి", tip: "నత్రజని & హ్యూమస్ తక్కువ — పశువుల ఎరువు, పప్పుధాన్య పంట మార్పిడి చేయండి.", fertilizer: "నత్రజని మరియు సేంద్రియ కంపోస్ట్‌తో పెంచండి." },
    { type: "ఒండ్రు నేల", crops: "వరి, గోధుమ, చెరకు, కూరగాయలు", tip: "అత్యంత సారవంతమైనది — ఇంటెన్సివ్, బహుళ పంటలకు అనువైనది.", fertilizer: "సమతుల్య NPK, అన్ని ఎరువులకు బాగా స్పందిస్తుంది." },
    { type: "ఇసుక / గరప నేల", crops: "వేరుశనగ, బంగాళదుంప, పుచ్చకాయ", tip: "వేగంగా నీరు ఇంకిపోతుంది — మల్చింగ్ మరియు తరచుగా తేలికపాటి నీరు వాడండి.", fertilizer: "లీచింగ్ నష్టం తగ్గించడానికి నత్రజనిని దఫాలుగా వేయండి." },
  ],
  hi: [
    { type: "काली (रेगड़) मिट्टी", crops: "कपास, सोयाबीन, गन्ना, गेहूं", tip: "नमी अच्छी तरह बनाए रखती है — अधिक सिंचाई से बचें; मानसून के बाद गहरी जुताई से वायु संचार बेहतर होता है।", fertilizer: "अतिरिक्त फॉस्फोरस और जैविक पदार्थ चाहिए।" },
    { type: "लाल मिट्टी", crops: "मूंगफली, मोटे अनाज, दालें, कपास", tip: "नाइट्रोजन व ह्यूमस कम — गोबर खाद और दलहनी फसल चक्र मिलाएं।", fertilizer: "नाइट्रोजन और जैविक खाद से बढ़ाएं।" },
    { type: "जलोढ़ मिट्टी", crops: "धान, गेहूं, गन्ना, सब्ज़ियां", tip: "अत्यंत उपजाऊ — गहन, बहु-फसल खेती के लिए आदर्श।", fertilizer: "संतुलित NPK, सभी उर्वरकों पर अच्छी प्रतिक्रिया।" },
    { type: "बलुई / दोमट मिट्टी", crops: "मूंगफली, आलू, तरबूज़", tip: "तेज़ी से पानी निकलता है — मल्चिंग और बार-बार हल्की सिंचाई करें।", fertilizer: "रिसाव कम करने हेतु नाइट्रोजन को भागों में दें।" },
  ],
};

const DISEASE_DB = {
  en: [
    { name: "Leaf Blast", crop: "Paddy", confidence: 92, symptoms: "Spindle-shaped grey-centered spots on leaves", causes: "Fungus Magnaporthe oryzae, favoured by high humidity & N-excess", treatment: "Spray Tricyclazole 75% WP @ 0.6g/L", medicines: "Tricyclazole, Isoprothiolane", prevention: "Avoid excess nitrogen, use resistant varieties, ensure field drainage" },
    { name: "Bollworm Damage", crop: "Cotton", confidence: 88, symptoms: "Holes in bolls, frass near entry points, wilting squares", causes: "Pink/American bollworm larvae feeding inside bolls", treatment: "Spray Emamectin Benzoate 5% SG @ 0.4g/L", medicines: "Emamectin Benzoate, Spinosad", prevention: "Pheromone traps, timely sowing, avoid ratoon cotton" },
    { name: "Early Blight", crop: "Tomato / Vegetables", confidence: 85, symptoms: "Concentric brown rings on older leaves, yellowing", causes: "Fungus Alternaria solani, warm humid weather", treatment: "Spray Mancozeb 75% WP @ 2.5g/L, repeat in 10 days", medicines: "Mancozeb, Chlorothalonil", prevention: "Crop rotation, remove infected debris, avoid overhead irrigation" },
  ],
  te: [
    { name: "లీఫ్ బ్లాస్ట్", crop: "వరి", confidence: 92, symptoms: "ఆకులపై బూడిద రంగు మధ్యభాగంతో కుదురు ఆకారపు మచ్చలు", causes: "మాగ్నపోర్తీ ఒరైజే శిలీంధ్రం, అధిక తేమ & నత్రజని ఎక్కువగా ఉంటే వ్యాపిస్తుంది", treatment: "ట్రైసైక్లజోల్ 75% WP @ 0.6g/L స్ప్రే చేయండి", medicines: "ట్రైసైక్లజోల్, ఐసోప్రోథియోలేన్", prevention: "అధిక నత్రజని మానండి, తట్టుకునే రకాలు వాడండి, పొలంలో నీరు నిలవకుండా చూడండి" },
    { name: "కాయతొలుచు పురుగు నష్టం", crop: "పత్తి", confidence: 88, symptoms: "కాయల్లో రంధ్రాలు, ప్రవేశ ద్వారం వద్ద రెట్ట, వాడిపోయిన మొగ్గలు", causes: "పింక్/అమెరికన్ కాయతొలుచు పురుగు లార్వాలు కాయల లోపల తినడం", treatment: "ఎమామెక్టిన్ బెంజోయేట్ 5% SG @ 0.4g/L స్ప్రే చేయండి", medicines: "ఎమామెక్టిన్ బెంజోయేట్, స్పైనోసాడ్", prevention: "ఫెరోమోన్ ట్రాప్‌లు, సకాలంలో విత్తడం, రెటూన్ పత్తి మానండి" },
    { name: "ఎర్లీ బ్లైట్", crop: "టమాటా / కూరగాయలు", confidence: 85, symptoms: "పాత ఆకులపై కేంద్రీకృత గోధుమ రంగు వలయాలు, పసుపు రంగు మారడం", causes: "అల్టర్నేరియా సొలానై శిలీంధ్రం, వెచ్చని తేమ వాతావరణం", treatment: "మాంకోజెబ్ 75% WP @ 2.5g/L స్ప్రే చేయండి, 10 రోజులకు మళ్ళీ చేయండి", medicines: "మాంకోజెబ్, క్లోరోథలోనిల్", prevention: "పంట మార్పిడి, వ్యాధిగ్రస్త అవశేషాలు తొలగించండి, పైనుంచి నీరు పెట్టడం మానండి" },
  ],
  hi: [
    { name: "लीफ ब्लास्ट", crop: "धान", confidence: 92, symptoms: "पत्तियों पर धुरी आकार के धूसर-केंद्र धब्बे", causes: "मैग्नापोर्थी ओराइज़ी फफूंद, अधिक नमी व अतिरिक्त नाइट्रोजन से बढ़ता है", treatment: "ट्राइसाइक्लाज़ोल 75% WP @ 0.6g/L स्प्रे करें", medicines: "ट्राइसाइक्लाज़ोल, आइसोप्रोथियोलेन", prevention: "अधिक नाइट्रोजन से बचें, प्रतिरोधी किस्में लगाएं, खेत में जल निकासी सुनिश्चित करें" },
    { name: "बॉलवर्म क्षति", crop: "कपास", confidence: 88, symptoms: "गोलों में छेद, प्रवेश बिंदु के पास मल, मुरझाई कलियां", causes: "पिंक/अमेरिकन बॉलवर्म की सूंडी गोलों के अंदर खाना खाती है", treatment: "एमामेक्टिन बेंज़ोएट 5% SG @ 0.4g/L स्प्रे करें", medicines: "एमामेक्टिन बेंज़ोएट, स्पिनोसैड", prevention: "फेरोमोन ट्रैप, समय पर बुवाई, रैटून कपास से बचें" },
    { name: "अगेती झुलसा रोग", crop: "टमाटर / सब्ज़ियां", confidence: 85, symptoms: "पुरानी पत्तियों पर संकेंद्रित भूरे छल्ले, पीलापन", causes: "अल्टरनेरिया सोलानी फफूंद, गर्म नम मौसम", treatment: "मैंकोज़ेब 75% WP @ 2.5g/L स्प्रे करें, 10 दिन बाद दोहराएं", medicines: "मैंकोज़ेब, क्लोरोथैलोनिल", prevention: "फसल चक्र अपनाएं, संक्रमित अवशेष हटाएं, ऊपर से सिंचाई न करें" },
  ],
};

const NOTIF_TYPES = {
  en: [
    { key: "rain", label: "Rain alerts", icon: CloudSun, enabled: true },
    { key: "irrigation", label: "Irrigation reminders", icon: Droplets, enabled: true },
    { key: "fertilizer", label: "Fertilizer reminders", icon: Sprout, enabled: true },
    { key: "disease", label: "Disease risk alerts", icon: Bug, enabled: true },
    { key: "harvest", label: "Harvest reminders", icon: Wheat, enabled: false },
    { key: "spray", label: "Pesticide spray reminders", icon: FlaskConical, enabled: true },
  ],
  te: [
    { key: "rain", label: "వర్ష హెచ్చరికలు", icon: CloudSun, enabled: true },
    { key: "irrigation", label: "నీటిపారుదల రిమైండర్లు", icon: Droplets, enabled: true },
    { key: "fertilizer", label: "ఎరువు రిమైండర్లు", icon: Sprout, enabled: true },
    { key: "disease", label: "వ్యాధి ప్రమాద హెచ్చరికలు", icon: Bug, enabled: true },
    { key: "harvest", label: "కోత రిమైండర్లు", icon: Wheat, enabled: false },
    { key: "spray", label: "పురుగుమందు స్ప్రే రిమైండర్లు", icon: FlaskConical, enabled: true },
  ],
  hi: [
    { key: "rain", label: "बारिश अलर्ट", icon: CloudSun, enabled: true },
    { key: "irrigation", label: "सिंचाई रिमाइंडर", icon: Droplets, enabled: true },
    { key: "fertilizer", label: "उर्वरक रिमाइंडर", icon: Sprout, enabled: true },
    { key: "disease", label: "रोग जोखिम अलर्ट", icon: Bug, enabled: true },
    { key: "harvest", label: "कटाई रिमाइंडर", icon: Wheat, enabled: false },
    { key: "spray", label: "कीटनाशक छिड़काव रिमाइंडर", icon: FlaskConical, enabled: true },
  ],
};

const NOTIF_FEED = {
  en: [
    { icon: CloudSun, title: "Heavy rain expected Wednesday", body: "62mm rainfall predicted in your area — delay pesticide spraying.", time: "2h ago", tone: "warn" },
    { icon: Droplets, title: "Irrigation due for Field 2 (Paddy)", body: "Soil moisture below threshold. Irrigate within 24 hours.", time: "5h ago", tone: "info" },
    { icon: Bug, title: "Blast risk rising in your district", body: "Humidity + temperature match blast-favourable conditions.", time: "1d ago", tone: "danger" },
    { icon: Sprout, title: "Top-dress urea for Cotton — Field 1", body: "45 days after sowing reached. Apply as per crop calendar.", time: "2d ago", tone: "info" },
  ],
  te: [
    { icon: CloudSun, title: "బుధవారం భారీ వర్షం అవకాశం", body: "మీ ప్రాంతంలో 62mm వర్షం అంచనా — పురుగుమందు స్ప్రేను వాయిదా వేయండి.", time: "2గం క్రితం", tone: "warn" },
    { icon: Droplets, title: "పొలం 2 (వరి)కి నీరు అవసరం", body: "నేల తేమ పరిమితి కంటే తక్కువగా ఉంది. 24 గంటల్లో నీరు పెట్టండి.", time: "5గం క్రితం", tone: "info" },
    { icon: Bug, title: "మీ జిల్లాలో బ్లాస్ట్ ప్రమాదం పెరుగుతోంది", body: "తేమ + ఉష్ణోగ్రత బ్లాస్ట్‌కు అనుకూల పరిస్థితులతో సరిపోతున్నాయి.", time: "1రో క్రితం", tone: "danger" },
    { icon: Sprout, title: "పత్తి కోసం యూరియా టాప్-డ్రెస్ — పొలం 1", body: "విత్తిన 45 రోజులు పూర్తయింది. పంట క్యాలెండర్ ప్రకారం వేయండి.", time: "2రో క్రితం", tone: "info" },
  ],
  hi: [
    { icon: CloudSun, title: "बुधवार को भारी बारिश की संभावना", body: "आपके क्षेत्र में 62mm बारिश का अनुमान — कीटनाशक छिड़काव टालें।", time: "2घं पहले", tone: "warn" },
    { icon: Droplets, title: "खेत 2 (धान) में सिंचाई आवश्यक", body: "मिट्टी की नमी सीमा से कम है। 24 घंटे में सिंचाई करें।", time: "5घं पहले", tone: "info" },
    { icon: Bug, title: "आपके ज़िले में ब्लास्ट का खतरा बढ़ रहा है", body: "नमी + तापमान ब्लास्ट के अनुकूल स्थिति बना रहे हैं।", time: "1दि पहले", tone: "danger" },
    { icon: Sprout, title: "कपास के लिए यूरिया टॉप-ड्रेस — खेत 1", body: "बुवाई के 45 दिन पूरे हुए। फसल कैलेंडर अनुसार डालें।", time: "2दि पहले", tone: "info" },
  ],
};

/* AI assistant canned knowledge base (keyword matched), with replies in EN / TE / HI */
const AI_KB = [
  {
    kws: ["fertilizer", "urea", "dap", "npk", "ఎరువు", "यूरिया", "खाद"],
    reply: {
      en: "For most Kharif crops, apply a basal dose of DAP at sowing, then split urea into two top-dressings — around 25–30 days and again at flowering/panicle stage. Avoid applying nitrogen right before heavy rain, since it washes away and can raise disease risk.",
      te: "చాలా ఖరీఫ్ పంటలకు, విత్తే సమయంలో DAP వేసి, యూరియాను రెండు దఫాలుగా వేయండి — 25–30 రోజుల తర్వాత మరియు పూత/వెన్ను దశలో. భారీ వర్షానికి ముందు నత్రజని వేయవద్దు, అది కొట్టుకుపోయి వ్యాధి ప్రమాదాన్ని పెంచుతుంది.",
      hi: "अधिकतर खरीफ फसलों में बुवाई के समय DAP डालें, फिर यूरिया को दो बार में दें — बुवाई के 25–30 दिन बाद और फूल/बाली अवस्था में। भारी बारिश से ठीक पहले नाइट्रोजन न डालें, यह बह जाता है और रोग का खतरा बढ़ाता है।",
    },
  },
  {
    kws: ["disease", "fungus", "spots", "blight", "blast", "వ్యాధి", "फफूंद", "रोग"],
    reply: {
      en: "Leaf spots and blight usually spread faster in humid, low-airflow fields. Remove infected leaves, avoid overhead irrigation in the evening, and consider a protective fungicide spray. You can also use the Disease Scan tab to photograph the leaf for a specific diagnosis.",
      te: "ఆకు మచ్చలు మరియు తెగులు తేమ, గాలి తక్కువగా ఉన్న పొలాల్లో వేగంగా వ్యాపిస్తాయి. వ్యాధిగ్రస్త ఆకులను తొలగించండి, సాయంత్రం పైనుంచి నీరు పెట్టడం మానండి, రక్షణ ఫంగిసైడ్ స్ప్రే చేయండి. ఖచ్చితమైన నిర్ధారణ కోసం డిసీజ్ స్కాన్ ట్యాబ్‌లో ఆకు ఫోటో తీయండి.",
      hi: "पत्तों के धब्बे और झुलसा रोग नमी और कम हवा वाले खेतों में तेज़ी से फैलते हैं। संक्रमित पत्तियां हटाएं, शाम को ऊपर से सिंचाई न करें, और सुरक्षात्मक फफूंदनाशक स्प्रे करें। सटीक जांच के लिए डिसीज़ स्कैन टैब में पत्ती की फोटो लें।",
    },
  },
  {
    kws: ["pest", "insect", "worm", "bollworm", "పురుగు", "कीट", "इल्ली"],
    reply: {
      en: "For bollworm and similar pests, pheromone traps (5 per acre) help with early detection. If damage crosses threshold, spray Emamectin Benzoate or a recommended biopesticide like Bt in the early evening for best effect.",
      te: "కాయతొలుచు పురుగు వంటి వాటికి, ఎకరాకు 5 ఫెరోమోన్ ట్రాప్‌లు ముందుగా గుర్తించడంలో సహాయపడతాయి. నష్టం మించితే, సాయంత్రం Emamectin Benzoate లేదా Bt వంటి బయోపెస్టిసైడ్ స్ప్రే చేయండి.",
      hi: "बॉलवर्म जैसे कीटों के लिए, प्रति एकड़ 5 फेरोमोन ट्रैप जल्दी पहचान में मदद करते हैं। नुकसान सीमा से अधिक हो तो शाम को Emamectin Benzoate या Bt जैसा जैव-कीटनाशक स्प्रे करें।",
    },
  },
  {
    kws: ["irrigation", "water", "drip", "నీరు", "सिंचाई", "पानी"],
    reply: {
      en: "Drip irrigation can cut water use by 30–40% versus flood irrigation, and works especially well for cotton and vegetables. Irrigate early morning or evening to reduce evaporation loss.",
      te: "బిందు సేద్యం వరద నీటిపారుదల కంటే 30–40% నీటిని ఆదా చేస్తుంది, ముఖ్యంగా పత్తి మరియు కూరగాయలకు బాగా పనిచేస్తుంది. ఆవిరి నష్టం తగ్గించడానికి తెల్లవారుజామున లేదా సాయంత్రం నీరు పెట్టండి.",
      hi: "ड्रिप सिंचाई बाढ़ सिंचाई की तुलना में 30–40% पानी बचाती है, और कपास व सब्ज़ियों के लिए खासकर अच्छी है। वाष्पीकरण कम करने के लिए सुबह जल्दी या शाम को सिंचाई करें।",
    },
  },
  {
    kws: ["scheme", "subsidy", "loan", "kcc", "insurance", "పథకం", "योजना", "सब्सिडी"],
    reply: {
      en: "You may be eligible for PM-KISAN (₹6,000/year), Kisan Credit Card for low-interest loans, and Pradhan Mantri Fasal Bima Yojana for crop insurance. Check the Govt Schemes tab for eligibility and document requirements.",
      te: "మీరు PM-KISAN (సంవత్సరానికి ₹6,000), తక్కువ వడ్డీ రుణాల కోసం కిసాన్ క్రెడిట్ కార్డ్, పంట బీమా కోసం ప్రధాన మంత్రి ఫసల్ బీమా యోజనకు అర్హులు కావచ్చు. అర్హత, పత్రాల కోసం గవర్నమెంట్ స్కీమ్స్ ట్యాబ్ చూడండి.",
      hi: "आप PM-KISAN (₹6,000/वर्ष), कम ब्याज ऋण के लिए किसान क्रेडिट कार्ड, और फसल बीमा के लिए प्रधानमंत्री फसल बीमा योजना के पात्र हो सकते हैं। पात्रता और दस्तावेज़ों के लिए सरकारी योजनाएं टैब देखें।",
    },
  },
  {
    kws: ["organic", "compost", "natural", "సేంద్రియ", "जैविक", "खाद"],
    reply: {
      en: "For organic farming, build soil health with farmyard manure, vermicompost, and green manure crops like dhaincha. Neem-based sprays and Trichoderma work well as organic pest and disease control.",
      te: "సేంద్రియ వ్యవసాయం కోసం, పశువుల ఎరువు, వర్మీకంపోస్ట్, దైంచా వంటి పచ్చిరొట్ట పంటలతో నేల ఆరోగ్యాన్ని పెంచండి. వేప స్ప్రేలు మరియు ట్రైకోడెర్మా సేంద్రియ చీడపీడల నియంత్రణకు బాగా పనిచేస్తాయి.",
      hi: "जैविक खेती के लिए, गोबर खाद, वर्मीकम्पोस्ट और ढैंचा जैसी हरी खाद फसलों से मिट्टी को स्वस्थ बनाएं। नीम आधारित स्प्रे और ट्राइकोडर्मा जैविक कीट व रोग नियंत्रण में अच्छे से काम करते हैं।",
    },
  },
  {
    kws: ["soil", "ph", "health", "నేల", "मिट्टी"],
    reply: {
      en: "A soil health card test every 2 years is free under a central scheme — it tells you N-P-K levels and pH. Black soils generally need added phosphorus; red soils benefit from organic matter and nitrogen.",
      te: "కేంద్ర పథకం కింద ప్రతి 2 సంవత్సరాలకు సాయిల్ హెల్త్ కార్డ్ పరీక్ష ఉచితం — ఇది N-P-K స్థాయిలు మరియు pH చెబుతుంది. నల్ల నేలలకు ఎక్కువ భాస్వరం అవసరం; ఎర్ర నేలలకు సేంద్రియ పదార్థం, నత్రజని మేలు చేస్తాయి.",
      hi: "केंद्र सरकार की योजना के तहत हर 2 साल में मुफ़्त सॉइल हेल्थ कार्ड जांच होती है — यह N-P-K स्तर और pH बताती है। काली मिट्टी को अधिक फॉस्फोरस चाहिए; लाल मिट्टी को जैविक पदार्थ और नाइट्रोजन से फ़ायदा होता है।",
    },
  },
  {
    kws: ["price", "market", "sell", "rate", "ధర", "भाव", "कीमत"],
    reply: {
      en: "Check the Market Prices tab for today's rates — paddy and turmeric are trending up this week, so if storage allows, it may be worth holding a few more days before selling.",
      te: "నేటి ధరల కోసం మార్కెట్ ప్రైసెస్ ట్యాబ్ చూడండి — వరి, పసుపు ఈ వారం పెరుగుతున్నాయి, నిల్వ చేయగలిగితే కొన్ని రోజులు ఆగి అమ్మడం మంచిది.",
      hi: "आज के भाव के लिए मार्केट प्राइसेस टैब देखें — इस हफ्ते धान और हल्दी के दाम बढ़ रहे हैं, अगर भंडारण संभव है तो कुछ दिन रुककर बेचना फायदेमंद हो सकता है।",
    },
  },
  {
    kws: ["livestock", "cattle", "cow", "poultry", "పశువులు", "पशु", "गाय"],
    reply: {
      en: "For dairy cattle, ensure a balanced ration of green fodder, dry fodder, and concentrate in roughly 3:2:1 proportion, plus mineral mixture. Deworm every 3–4 months and vaccinate against FMD as per the local schedule.",
      te: "పాడి పశువులకు, పచ్చి మేత, ఎండు మేత, దాణా 3:2:1 నిష్పత్తిలో మరియు మినరల్ మిక్స్చర్ ఇవ్వండి. ప్రతి 3–4 నెలలకు నట్టల మందు, స్థానిక షెడ్యూల్ ప్రకారం FMD టీకా వేయించండి.",
      hi: "दुधारू पशुओं के लिए हरा चारा, सूखा चारा और दाना लगभग 3:2:1 अनुपात में दें, साथ में मिनरल मिक्सचर। हर 3–4 महीने में कृमिनाशक दवा दें और स्थानीय शेड्यूल अनुसार FMD का टीका लगवाएं।",
    },
  },
  {
    kws: ["weather", "rain", "forecast", "వాతావరణం", "मौसम", "बारिश"],
    reply: {
      en: "This week shows a wet spell around Wednesday–Thursday with up to 80% rain chance. Good time to hold off on spraying and instead plan for drainage in low-lying fields.",
      te: "ఈ వారం బుధ–గురువారం చుట్టూ వర్షం అవకాశం 80% వరకు ఉంది. స్ప్రే చేయడం ఆపి, పల్లపు పొలాల్లో నీటి పారుదల ఏర్పాటు చేసుకోండి.",
      hi: "इस सप्ताह बुधवार–गुरुवार के आसपास 80% तक बारिश की संभावना है। छिड़काव रोकना और निचले खेतों में जल निकासी की योजना बनाना बेहतर होगा।",
    },
  },
  {
    kws: ["brown planthopper", "bph", "hopper burn", "planthopper"],
    reply: {
      en: "Brown planthopper causes yellowing and \"hopper burn\" patches in paddy, worse in dense, over-fertilized fields. Drain the field periodically, avoid excess nitrogen, and spray Pymetrozine or Imidacloprid at the base of the plant if numbers are high.",
      te: "గోధుమరంగు దాదురుపురుగు వరిలో పసుపు రంగు, \"హాపర్ బర్న్\" మచ్చలు కలిగిస్తుంది, దట్టమైన, ఎక్కువ ఎరువు వేసిన పొలాల్లో ఎక్కువ. అప్పుడప్పుడు నీరు తీసివేయండి, అధిక నత్రజని మానండి, ఎక్కువగా ఉంటే మొక్క అడుగుభాగంలో పైమెట్రోజిన్ లేదా ఇమిడాక్లోప్రిడ్ స్ప్రే చేయండి.",
      hi: "भूरा फुदका धान में पीलापन और \"हॉपर बर्न\" धब्बे बनाता है, घने व अधिक उर्वरक वाले खेतों में ज़्यादा। समय-समय पर पानी निकालें, अधिक नाइट्रोजन से बचें, संख्या ज़्यादा हो तो पौधे के आधार पर पायमेट्रोज़िन या इमिडाक्लोप्रिड स्प्रे करें।",
    },
  },
  {
    kws: ["bacterial leaf blight", "bacterial blight", "kresek"],
    reply: {
      en: "Bacterial leaf blight shows yellow-to-white streaks along leaf veins, common after strong wind and rain. Use resistant varieties, avoid clipping leaf tips during transplanting, and apply copper-based bactericides like Copper Oxychloride.",
      te: "బాక్టీరియా ఆకు ఎండు తెగులులో ఆకు ఈనెల వెంబడి పసుపు నుండి తెలుపు చారలు కనిపిస్తాయి, బలమైన గాలి, వర్షం తర్వాత సాధారణం. తట్టుకునే రకాలు వాడండి, నాటేటప్పుడు ఆకు కొనలు కత్తిరించడం మానండి, కాపర్ ఆక్సీక్లోరైడ్ వంటి కాపర్ బాక్టీరిసైడ్ వాడండి.",
      hi: "जीवाणु झुलसा में पत्ती की शिराओं के साथ पीली से सफ़ेद धारियां दिखती हैं, तेज़ हवा-बारिश के बाद आम। प्रतिरोधी किस्में लगाएं, रोपाई के समय पत्ती की नोक न काटें, कॉपर ऑक्सीक्लोराइड जैसे कॉपर बैक्टीरिसाइड का प्रयोग करें।",
    },
  },
  {
    kws: ["wheat rust", "yellow rust", "rust disease", "stripe rust"],
    reply: {
      en: "Wheat rust shows as orange-yellow powdery pustules on leaves, spreading fast in cool, humid weather. Spray Propiconazole 25% EC at first sign, and avoid late sowing which increases risk.",
      te: "గోధుమ తుప్పు ఆకులపై నారింజ-పసుపు పొడి పొక్కులుగా కనిపిస్తుంది, చల్లని, తేమ వాతావరణంలో వేగంగా వ్యాపిస్తుంది. మొదటి సంకేతం కనిపించగానే ప్రొపికొనజోల్ 25% EC స్ప్రే చేయండి, ఆలస్యంగా విత్తడం మానండి.",
      hi: "गेहूं का रतुआ पत्तियों पर नारंगी-पीले पाउडर जैसे फफोलों के रूप में दिखता है, ठंडे नम मौसम में तेज़ी से फैलता है। पहला संकेत दिखते ही प्रोपिकोनाज़ोल 25% EC स्प्रे करें, देर से बुवाई से बचें।",
    },
  },
  {
    kws: ["whitefly", "leaf curl virus", "yellow mosaic"],
    reply: {
      en: "Whitefly spreads leaf curl and yellow mosaic viruses in cotton, chilli and tomato. Use yellow sticky traps, avoid excess nitrogen, and spray Neem oil early — for heavy infestation use Diafenthiuron.",
      te: "తెల్లదోమ పత్తి, మిరప, టమాటాలో ఆకు ముడత, పసుపు మొజాయిక్ వైరస్‌లను వ్యాపింపజేస్తుంది. పసుపు జిగురు ఉచ్చులు వాడండి, అధిక నత్రజని మానండి, ముందుగా వేప నూనె స్ప్రే చేయండి — ఎక్కువగా ఉంటే డయాఫెంథియురాన్ వాడండి.",
      hi: "सफ़ेद मक्खी कपास, मिर्च और टमाटर में पत्ती मरोड़ और पीला मोज़ेक वायरस फैलाती है। पीले चिपचिपे ट्रैप लगाएं, अधिक नाइट्रोजन से बचें, शुरुआत में नीम तेल स्प्रे करें — ज़्यादा प्रकोप में डायफेंथियूरॉन का प्रयोग करें।",
    },
  },
  {
    kws: ["fall armyworm", "army worm", "stem borer", "maize pest"],
    reply: {
      en: "Fall armyworm in maize eats a distinctive \"window pane\" pattern in whorl leaves. Check whorls early morning, hand-pick egg masses, and spray Emamectin Benzoate or Spinetoram directly into the whorl for control.",
      te: "మొక్కజొన్నలో ఫాల్ ఆర్మీవార్మ్ ఆకుల నడిమి భాగంలో ప్రత్యేకమైన \"కిటికీ\" మాదిరి రంధ్రాలు చేస్తుంది. తెల్లవారుజామున మొగ్గలు పరిశీలించండి, గుడ్ల సమూహాలు తీసివేయండి, నియంత్రణకు ఎమామెక్టిన్ బెంజోయేట్ లేదా స్పైనెటోరమ్‌ను నేరుగా మొగ్గలో స్ప్రే చేయండి.",
      hi: "मक्का में फॉल आर्मीवर्म पत्तियों की गोफ में विशिष्ट \"खिड़की\" जैसे छेद बनाता है। सुबह जल्दी गोफ जांचें, अंडों के समूह हाथ से हटाएं, नियंत्रण हेतु एमामेक्टिन बेंज़ोएट या स्पिनेटोरम सीधे गोफ में स्प्रे करें।",
    },
  },
  {
    kws: ["red rot", "sugarcane disease"],
    reply: {
      en: "Red rot in sugarcane shows reddened internal stalk tissue with a sour smell, spread through infected setts. Use disease-free setts, treat with Carbendazim before planting, and remove and burn infected clumps.",
      te: "చెరకులో ఎర్రకుళ్ళు వ్యాధిలో లోపలి కాండం ఎరుపు రంగుకు మారి పుల్లని వాసన వస్తుంది, వ్యాధిగ్రస్త కణుపుల ద్వారా వ్యాపిస్తుంది. వ్యాధిలేని కణుపులు వాడండి, నాటడానికి ముందు కార్బెండాజిమ్‌తో శుద్ధి చేయండి, వ్యాధిగ్రస్త మొక్కలు తొలగించి కాల్చండి.",
      hi: "गन्ने में लाल सड़न में अंदरूनी तने का हिस्सा लाल होकर खट्टी गंध देता है, संक्रमित सेट्स से फैलता है। रोगमुक्त सेट्स उपयोग करें, रोपाई से पहले कार्बेन्डाज़िम से उपचारित करें, संक्रमित पौधे हटाकर जला दें।",
    },
  },
  {
    kws: ["tikka disease", "groundnut leaf spot", "collar rot"],
    reply: {
      en: "Tikka leaf spot in groundnut shows dark brown-to-black circular spots with a yellow halo. Spray Chlorothalonil or Mancozeb at 15-day intervals starting 30 days after sowing, and rotate with non-legume crops.",
      te: "వేరుశనగలో టిక్కా ఆకుమచ్చ వ్యాధిలో ముదురు గోధుమ నుండి నలుపు గుండ్రని మచ్చలు పసుపు వలయంతో కనిపిస్తాయి. విత్తిన 30 రోజుల నుండి 15 రోజుల వ్యవధిలో క్లోరోథలోనిల్ లేదా మాంకోజెబ్ స్ప్రే చేయండి, పప్పుధాన్యేతర పంటలతో మార్పిడి చేయండి.",
      hi: "मूंगफली में टिक्का पत्ती धब्बा रोग में गहरे भूरे से काले गोल धब्बे पीले घेरे के साथ दिखते हैं। बुवाई के 30 दिन बाद से 15 दिन के अंतराल पर क्लोरोथैलोनिल या मैंकोज़ेब स्प्रे करें, गैर-दलहनी फसलों से चक्र अपनाएं।",
    },
  },
  {
    kws: ["thrips", "anthracnose", "fruit rot", "chilli disease"],
    reply: {
      en: "Thrips cause upward leaf curling in chilli, while anthracnose causes sunken dark fruit-rot spots. For thrips spray Fipronil; for anthracnose spray Carbendazim + Mancozeb and avoid overhead irrigation near harvest.",
      te: "త్రిప్స్ మిరపలో ఆకులు పైకి ముడుచుకునేలా చేస్తాయి, ఆంత్రాక్నోస్ కాయలపై లోతైన నల్లని కుళ్ళు మచ్చలు కలిగిస్తుంది. త్రిప్స్‌కు ఫిప్రోనిల్ స్ప్రే చేయండి; ఆంత్రాక్నోస్‌కు కార్బెండాజిమ్ + మాంకోజెబ్ స్ప్రే చేయండి, కోత దగ్గర పైనుంచి నీరు పెట్టడం మానండి.",
      hi: "थ्रिप्स मिर्च में पत्तियां ऊपर की ओर मुड़वाते हैं, वहीं एन्थ्रैक्नोज़ फलों पर धंसे काले सड़न धब्बे बनाता है। थ्रिप्स के लिए फिप्रोनिल स्प्रे करें; एन्थ्रैक्नोज़ के लिए कार्बेन्डाज़िम + मैंकोज़ेब स्प्रे करें, कटाई के पास ऊपर से सिंचाई न करें।",
    },
  },
  {
    kws: ["wilt", "root rot", "yellowing plant", "plant dying"],
    reply: {
      en: "Sudden wilting with healthy-looking roots usually means a fungal wilt (Fusarium) blocking water flow — pull one plant and check for browning inside the stem. Improve drainage, avoid waterlogging, and use Trichoderma-based soil treatment at planting to prevent it next season.",
      te: "వేర్లు ఆరోగ్యంగా కనిపిస్తున్నా అకస్మాత్తుగా వాడిపోతే సాధారణంగా శిలీంధ్ర వాడు తెగులు (ఫ్యూసేరియం) నీటి ప్రవాహాన్ని అడ్డుకుంటోందని అర్థం — ఒక మొక్క పీకి కాండం లోపల గోధుమ రంగు మారిందేమో చూడండి. నీటి పారుదల మెరుగుపరచండి, నీరు నిలవకుండా చూడండి, వచ్చే సీజన్‌లో నివారించడానికి నాటేటప్పుడు ట్రైకోడెర్మా ఆధారిత మట్టి శుద్ధి వాడండి.",
      hi: "जड़ें स्वस्थ दिखने पर भी अचानक मुरझाना आमतौर पर फफूंद जनित उकठा रोग (फ्यूज़ेरियम) होता है जो पानी के प्रवाह को रोकता है — एक पौधा उखाड़कर तने के अंदर भूरापन जांचें। जल निकासी बेहतर करें, जलभराव से बचें, अगले सीज़न रोकथाम हेतु रोपाई के समय ट्राइकोडर्मा आधारित मिट्टी उपचार करें।",
    },
  },
  {
    kws: ["yellow leaves", "nitrogen deficiency", "nutrient deficiency", "leaves turning yellow"],
    reply: {
      en: "Uniform yellowing starting from older/lower leaves usually points to nitrogen deficiency — apply a split urea dose. If yellowing appears between leaf veins on younger leaves instead, it's more likely iron or magnesium deficiency, which needs a foliar micronutrient spray rather than more urea.",
      te: "పాత/దిగువ ఆకుల నుండి మొదలై సమానంగా పసుపు మారడం సాధారణంగా నత్రజని లోపాన్ని సూచిస్తుంది — యూరియా విభజించి వేయండి. కొత్త ఆకుల ఈనెల మధ్య పసుపు కనిపిస్తే, ఇనుము లేదా మెగ్నీషియం లోపం కావచ్చు, దీనికి మరింత యూరియా కాకుండా ఆకులపై సూక్ష్మపోషక స్ప్రే అవసరం.",
      hi: "पुरानी/निचली पत्तियों से शुरू होकर एक समान पीलापन आमतौर पर नाइट्रोजन की कमी दर्शाता है — यूरिया को भागों में डालें। यदि नई पत्तियों में शिराओं के बीच पीलापन दिखे, तो यह लोहे या मैग्नीशियम की कमी हो सकती है, जिसके लिए अधिक यूरिया की बजाय पत्तियों पर सूक्ष्म पोषक तत्व स्प्रे चाहिए।",
    },
  },
  {
    kws: ["seed treatment", "sowing tips", "germination"],
    reply: {
      en: "Treating seed before sowing with a fungicide like Thiram or a biocontrol agent like Trichoderma protects against soil-borne disease from day one, and typically improves germination percentage. Always treat seed in shade, not direct sun, and sow within a day of treating.",
      te: "విత్తడానికి ముందు థైరమ్ వంటి ఫంగిసైడ్ లేదా ట్రైకోడెర్మా వంటి బయోకంట్రోల్‌తో విత్తనశుద్ధి చేయడం మొదటి రోజు నుండే నేల ద్వారా వచ్చే వ్యాధుల నుండి రక్షిస్తుంది, మొలక శాతం కూడా మెరుగుపడుతుంది. విత్తనశుద్ధి ఎండలో కాకుండా నీడలో చేయండి, శుద్ధి చేసిన ఒక రోజులోపు విత్తండి.",
      hi: "बुवाई से पहले थीरम जैसे फफूंदनाशक या ट्राइकोडर्मा जैसे जैव-नियंत्रण से बीज उपचार पहले दिन से मिट्टी-जनित रोगों से बचाता है, और अंकुरण प्रतिशत भी बेहतर करता है। बीज उपचार छाया में करें, सीधी धूप में नहीं, और उपचार के एक दिन के भीतर बुवाई करें।",
    },
  },
];
const AI_FALLBACK = {
  en: "I can help with crop cultivation, diseases, fertilizers, irrigation, government schemes, market prices, soil health and livestock. Could you tell me a bit more — which crop or issue are you asking about?",
  te: "పంటల సాగు, వ్యాధులు, ఎరువులు, నీటిపారుదల, ప్రభుత్వ పథకాలు, మార్కెట్ ధరలు, నేల ఆరోగ్యం మరియు పశువుల గురించి నేను సహాయం చేయగలను. దయచేసి మీ పంట లేదా సమస్య గురించి కొంచెం చెప్పండి.",
  hi: "मैं फसल की खेती, रोग, उर्वरक, सिंचाई, सरकारी योजनाएं, बाज़ार भाव, मिट्टी स्वास्थ्य और पशुपालन में मदद कर सकता हूं। कृपया बताएं कि आप किस फसल या समस्या के बारे में पूछ रहे हैं।",
};
function aiReply(msg, lang = "en") {
  const lower = msg.toLowerCase();
  const hit = AI_KB.find((k) => k.kws.some((w) => lower.includes(w.toLowerCase())));
  if (hit) return hit.reply[lang] || hit.reply.en;
  return AI_FALLBACK[lang] || AI_FALLBACK.en;
}

/* ============================================================
   3D HERO — three.js rotating growth orb (signature element)
   ============================================================ */
function GrowthOrb3D({ className = "" }) {
  const mountRef = useRef(null);
  useEffect(() => {
    let raf, renderer, scene, camera, core, ring1, ring2, particles, w, h;
    let disposed = false;
    (() => {
      if (disposed || !mountRef.current) return;
      w = mountRef.current.clientWidth;
      h = mountRef.current.clientHeight;
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 7);
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current.appendChild(renderer.domElement);

      const coreGeo = new THREE.IcosahedronGeometry(1.6, 1);
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xe8a33d, wireframe: true, transparent: true, opacity: 0.9 });
      core = new THREE.Mesh(coreGeo, coreMat);
      scene.add(core);

      const ringGeo1 = new THREE.TorusGeometry(2.4, 0.015, 8, 100);
      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x8fd694, transparent: true, opacity: 0.55 });
      ring1 = new THREE.Mesh(ringGeo1, ringMat1);
      ring1.rotation.x = Math.PI / 2.4;
      scene.add(ring1);

      const ringGeo2 = new THREE.TorusGeometry(2.9, 0.01, 8, 100);
      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x4c7a3d, transparent: true, opacity: 0.5 });
      ring2 = new THREE.Mesh(ringGeo2, ringMat2);
      ring2.rotation.x = Math.PI / 1.7;
      ring2.rotation.y = Math.PI / 5;
      scene.add(ring2);

      const pCount = 90;
      const positions = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount; i++) {
        const r = 3.3 + Math.random() * 1.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xffe1a8, size: 0.045 });
      particles = new THREE.Points(pGeo, pMat);
      scene.add(particles);

      const clock = new THREE.Clock();
      const animate = () => {
        const t = clock.getElapsedTime();
        core.rotation.y = t * 0.35;
        core.rotation.x = t * 0.18;
        ring1.rotation.z = t * 0.25;
        ring2.rotation.z = -t * 0.2;
        particles.rotation.y = t * 0.08;
        core.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      const onResize = () => {
        if (!mountRef.current) return;
        w = mountRef.current.clientWidth;
        h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);
      mountRef.current._cleanup = () => window.removeEventListener("resize", onResize);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (mountRef.current) {
        mountRef.current._cleanup?.();
        while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
      }
      renderer?.dispose();
    };
  }, []);
  return <div ref={mountRef} className={className} />;
}

/* ============================================================
   Small reusable UI atoms
   ============================================================ */
function Card({ children, className = "", ...rest }) {
  return (
    <div className={`rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#182b20] shadow-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}
function BigTile({ icon: Icon, label, onClick, accent = "bg-[#4C7A3D]" }) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center gap-2.5 rounded-2xl bg-white dark:bg-[#182b20] border border-black/5 dark:border-white/10 p-4 sm:p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 [perspective:800px]"
    >
      <span className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${accent} text-white shadow-md group-hover:[transform:rotateY(180deg)] transition-transform duration-500`}>
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 group-hover:[transform:rotateY(180deg)]" strokeWidth={2.2} />
      </span>
      <span className="text-xs sm:text-sm font-semibold text-[#1F3D2B] dark:text-[#EFE7D6] text-center leading-tight">{label}</span>
    </button>
  );
}
function SectionHeader({ eyebrow, title, right }) {
  return (
    <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
      <div>
        {eyebrow && <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#E8A33D] mb-1">{eyebrow}</p>}
        <h2 className="text-xl sm:text-2xl font-bold text-[#1F3D2B] dark:text-[#F4F1EA]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}
function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#3c4a3f] dark:text-[#c9d6cc] mb-1.5 block">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-3 text-[15px] text-[#1F3D2B] dark:text-[#F4F1EA] placeholder:text-black/30 dark:placeholder:text-white/30 outline-none focus:ring-2 focus:ring-[#4C7A3D] transition"
      />
    </label>
  );
}
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.35s_ease]">
      <div className="flex items-center gap-2 rounded-full bg-[#1F3D2B] text-white px-5 py-2.5 shadow-xl text-sm font-medium">
        <BadgeCheck className="h-4 w-4 text-[#8fd694]" /> {toast}
      </div>
    </div>
  );
}

/* ============================================================
   AUTH SCREENS
   ============================================================ */
function AuthShell({ children, lang }) {
  return (
    <div className="min-h-screen w-full flex bg-[#FAF6EE] dark:bg-[#0f1c14] transition-colors max-h-screen overflow-y-auto">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1F3D2B] via-[#25462f] to-[#173322] items-center justify-center">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #4C7A3D 0, transparent 45%), radial-gradient(circle at 80% 70%, #E8A33D 0, transparent 40%)" }} />
        <GrowthOrb3D className="w-[420px] h-[420px] relative z-10" />
        <div className="absolute bottom-14 left-14 right-14 z-10">
          <p className="text-[#E8A33D] text-xs font-bold tracking-[0.2em] uppercase mb-2">{STR[lang].appName}</p>
          <h1 className="text-white text-3xl font-bold leading-tight mb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            Smarter farming starts with one photo, one question, one tap.
          </h1>
          <p className="text-[#cfe3d1] text-sm leading-relaxed">AI crop advice, disease scans, weather, mandi prices and government schemes — built for the field, in your language.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-4">{children}</div>
      </div>
    </div>
  );
}

function LoginScreen({ lang, setLang, goTo, onSendOtp }) {
  const t = STR[lang];
  const [form, setForm] = useState({ username: "", mobile: "", district: "", mandal: "" });
  return (
    <AuthShell lang={lang}>
      <div className="flex items-center gap-2 mb-8">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4C7A3D] text-white"><Sprout className="h-5 w-5" /></span>
        <span className="font-bold text-lg text-[#1F3D2B] dark:text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.appName}</span>
        <div className="ml-auto"><LangPicker lang={lang} setLang={setLang} compact /></div>
      </div>
      <h1 className="text-2xl font-bold text-[#1F3D2B] dark:text-white mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.welcome} 🌾</h1>
      <p className="text-sm text-black/50 dark:text-white/50 mb-7">{t.signIn} to continue to your farm dashboard.</p>
      <form onSubmit={(e) => { e.preventDefault(); onSendOtp(form); }} className="space-y-4">
        <Field label={t.name} required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Ramesh Kumar" />
        <Field label={t.phone} required type="tel" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="+91 98765 43210" />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.district} required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Rangareddy" />
          <Field label={t.mandal} required value={form.mandal} onChange={(e) => setForm({ ...form, mandal: e.target.value })} placeholder="e.g. Shamshabad" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-[#1F3D2B] hover:bg-[#173322] text-white font-semibold py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-[#1F3D2B]/20 transition">
          {t.sendOtp} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="text-center text-sm text-black/50 dark:text-white/50 mt-6">
        {t.dontHaveAccount} <button onClick={() => goTo("register")} className="font-semibold text-[#4C7A3D]">{t.createOne}</button>
      </p>
    </AuthShell>
  );
}

function RegisterScreen({ lang, setLang, goTo, onSendOtp }) {
  const t = STR[lang];
  const [form, setForm] = useState({ name: "", phone: "", district: "", mandal: "", email: "", password: "" });
  return (
    <AuthShell lang={lang}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => goTo("login")} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeft className="h-5 w-5 text-[#1F3D2B] dark:text-white" /></button>
        <span className="font-bold text-lg text-[#1F3D2B] dark:text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.register}</span>
        <div className="ml-auto"><LangPicker lang={lang} setLang={setLang} compact /></div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSendOtp({ username: form.name, mobile: form.phone, district: form.district, mandal: form.mandal }); }} className="space-y-4">
        <Field label={t.name} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ramesh Kumar" />
        <Field label={t.phone} required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.district} required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Rangareddy" />
          <Field label={t.mandal} required value={form.mandal} onChange={(e) => setForm({ ...form, mandal: e.target.value })} placeholder="e.g. Shamshabad" />
        </div>
        <Field label={t.email} required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        <Field label={t.password} required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
        <button type="submit" className="w-full rounded-xl bg-[#1F3D2B] hover:bg-[#173322] text-white font-semibold py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-[#1F3D2B]/20 transition mt-2">
          {t.createOne} <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="text-center text-sm text-black/50 dark:text-white/50 mt-6">
        {t.haveAccount} <button onClick={() => goTo("login")} className="font-semibold text-[#4C7A3D]">{t.signIn}</button>
      </p>
    </AuthShell>
  );
}

function ForgotScreen({ lang, setLang, goTo }) {
  const t = STR[lang];
  const [sent, setSent] = useState(false);
  return (
    <AuthShell lang={lang}>
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => goTo("login")} className="rounded-lg p-1.5 hover:bg-black/5 dark:hover:bg-white/10"><ChevronLeft className="h-5 w-5 text-[#1F3D2B] dark:text-white" /></button>
        <span className="font-bold text-lg text-[#1F3D2B] dark:text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.forgotQ}</span>
        <div className="ml-auto"><LangPicker lang={lang} setLang={setLang} compact /></div>
      </div>
      {!sent ? (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <p className="text-sm text-black/50 dark:text-white/50">Enter the email linked to your account and we'll send a reset link.</p>
          <Field label={t.email} type="email" required placeholder="you@example.com" />
          <button type="submit" className="w-full rounded-xl bg-[#1F3D2B] hover:bg-[#173322] text-white font-semibold py-3.5 transition">{t.sendReset}</button>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#4C7A3D]/10 text-[#4C7A3D]"><Mail className="h-7 w-7" /></div>
          <h3 className="font-bold text-lg text-[#1F3D2B] dark:text-white mb-1">{t.checkInbox}</h3>
          <p className="text-sm text-black/50 dark:text-white/50 mb-6">We've sent a password reset link to your email.</p>
          <button onClick={() => goTo("login")} className="text-[#4C7A3D] font-semibold text-sm">{t.backToLogin}</button>
        </div>
      )}
    </AuthShell>
  );
}

function VerifyScreen({ lang, goTo, mobile, onSubmitCode, onResend }) {
  const t = STR[lang];
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef()];
  const submit = async () => {
    const entered = code.join("");
    if (entered.length !== 4) { setError(true); return; }
    setVerifying(true);
    try {
      await onSubmitCode(entered);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setVerifying(false);
    }
  };
  return (
    <AuthShell lang={lang}>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8A33D]/15 text-[#E8A33D]"><ShieldCheck className="h-8 w-8" /></div>
        <h1 className="text-2xl font-bold text-[#1F3D2B] dark:text-white mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.verify}</h1>
        <p className="text-sm text-black/50 dark:text-white/50 mb-8">{t.otpSentTo} {mobile || ""}</p>
        <div className="flex justify-center gap-3 mb-3">
          {code.map((c, i) => (
            <input key={i} ref={refs[i]} maxLength={1} value={c}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                const next = [...code]; next[i] = v; setCode(next);
                setError(false);
                if (v && i < 3) refs[i + 1].current?.focus();
              }}
              className={`h-14 w-12 text-center text-xl font-bold rounded-xl border bg-[#FAF6EE] dark:bg-[#0f1c14] text-[#1F3D2B] dark:text-white outline-none focus:ring-2 focus:ring-[#4C7A3D] ${error ? "border-red-400" : "border-black/10 dark:border-white/15"}`} />
          ))}
        </div>
        {error && <p className="text-xs font-semibold text-red-500 mb-5">{t.otpError}</p>}
        {!error && <div className="mb-5" />}
        <button onClick={submit} disabled={verifying} className="w-full rounded-xl bg-[#1F3D2B] hover:bg-[#173322] text-white font-semibold py-3.5 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {verifying && <Loader2 className="h-4 w-4 animate-spin" />} {t.verifyContinue}
        </button>
        <button onClick={onResend} className="text-xs font-semibold text-[#4C7A3D] mt-4">{t.resendOtp}</button>
      </div>
    </AuthShell>
  );
}

function LangPicker({ lang, setLang, compact }) {
  const langs = [{ k: "en", l: "EN" }, { k: "te", l: "తె" }, { k: "hi", l: "हि" }];
  return (
    <div className={`flex items-center rounded-full bg-black/5 dark:bg-white/10 p-1 ${compact ? "" : ""}`}>
      {langs.map((l) => (
        <button key={l.k} onClick={() => setLang(l.k)}
          className={`px-2.5 py-1 rounded-full text-xs font-bold transition ${lang === l.k ? "bg-[#4C7A3D] text-white" : "text-black/50 dark:text-white/50"}`}>
          {l.l}
        </button>
      ))}
    </div>
  );
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function Dashboard({ t, lang, user, setScreen, history }) {
  return (
    <div className="space-y-6 pb-10">
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(115deg, rgba(20,40,28,0.92), rgba(31,61,43,0.75) 55%, rgba(31,61,43,0.4)), url('https://images.pexels.com/photos/5458354/pexels-photo-5458354.jpeg?auto=compress&cs=tinysrgb&w=1600')" }}
      >
        <div className="absolute -right-6 -top-10 opacity-70 pointer-events-none"><GrowthOrb3D className="w-56 h-56" /></div>
        <p className="text-[#E8A33D] text-xs font-bold tracking-[0.18em] uppercase mb-2">{t.welcome}</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 max-w-sm" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{user?.name || "Farmer"} 👋</h1>
        <p className="text-[#cfe3d1] text-sm max-w-xs mb-5">Here's what's happening on your farm today.</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2.5">
            <CloudSun className="h-5 w-5 text-[#E8A33D]" />
            <div><p className="text-sm font-bold leading-none">31°C</p><p className="text-[11px] text-[#cfe3d1]">Partly cloudy</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2.5">
            <Leaf className="h-5 w-5 text-[#8fd694]" />
            <div><p className="text-sm font-bold leading-none">Good</p><p className="text-[11px] text-[#cfe3d1]">Crop health</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur px-4 py-2.5">
            <AlertTriangle className="h-5 w-5 text-[#f2b84b]" />
            <div><p className="text-sm font-bold leading-none">1 alert</p><p className="text-[11px] text-[#cfe3d1]">Blast risk rising</p></div>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title={t.quickAccess} />
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <BigTile icon={MessageCircle} label={t.assistant} onClick={() => setScreen("assistant")} accent="bg-[#4C7A3D]" />
          <BigTile icon={Camera} label={t.disease} onClick={() => setScreen("disease")} accent="bg-[#E8A33D]" />
          <BigTile icon={CloudSun} label={t.weather} onClick={() => setScreen("weather")} accent="bg-[#3E8FB0]" />
          <BigTile icon={MapPin} label={t.shops} onClick={() => setScreen("shops")} accent="bg-[#B0553E]" />
          <BigTile icon={IndianRupee} label={t.market} onClick={() => setScreen("market")} accent="bg-[#8B5E34]" />
          <BigTile icon={Landmark} label={t.schemes} onClick={() => setScreen("schemes")} accent="bg-[#6B4C9A]" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <SectionHeader title={t.weatherSummary} eyebrow="This week" />
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEATHER_FORECAST}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E8A33D" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#E8A33D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
              <Tooltip />
              <Area type="monotone" dataKey="temp" stroke="#E8A33D" fill="url(#tempFill)" strokeWidth={2.5} name="Temp °C" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5">
          <SectionHeader title={t.cropHealth} eyebrow="Field 1 · Paddy" />
          <div className="space-y-3">
            {[{ l: "Growth stage", v: "Tillering", c: "text-[#4C7A3D]" }, { l: "Soil moisture", v: "68% · Good", c: "text-[#3E8FB0]" }, { l: "Disease risk", v: "Moderate", c: "text-[#E8A33D]" }].map((r) => (
              <div key={r.l} className="flex items-center justify-between rounded-xl bg-[#FAF6EE] dark:bg-[#0f1c14] px-3.5 py-2.5">
                <span className="text-sm text-black/60 dark:text-white/60">{r.l}</span>
                <span className={`text-sm font-bold ${r.c}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader title={t.recentActivity} />
        <div className="space-y-2">
          {(history.length ? history : [{ icon: Info, title: "No recent activity yet", body: "Start by scanning a crop or asking the AI assistant.", time: "" }]).slice(0, 5).map((h, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[#FAF6EE] dark:hover:bg-[#0f1c14] transition">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4C7A3D]/10 text-[#4C7A3D]"><h.icon className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1F3D2B] dark:text-white truncate">{h.title}</p>
                <p className="text-xs text-black/45 dark:text-white/45 truncate">{h.body}</p>
              </div>
              <span className="ml-auto text-[11px] text-black/35 dark:text-white/35 shrink-0">{h.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   AI ASSISTANT (text + voice)
   ============================================================ */
const AI_GREETING = {
  en: "Namaste! I'm your AI farm assistant. Ask me about crops, diseases, fertilizers, irrigation, schemes or market prices.",
  te: "నమస్తే! నేను మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, వ్యాధులు, ఎరువులు, నీటిపారుదల, పథకాలు లేదా మార్కెట్ ధరల గురించి అడగండి.",
  hi: "नमस्ते! मैं आपका AI कृषि सहायक हूं। फसलों, रोगों, उर्वरकों, सिंचाई, योजनाओं या बाज़ार भाव के बारे में पूछें।",
};
function AIAssistant({ t, lang, addHistory }) {
  const [messages, setMessages] = useState([{ role: "ai", text: AI_GREETING[lang] || AI_GREETING.en }]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [realAiWorking, setRealAiWorking] = useState(false); // flips true after the first real reply succeeds
  const recogRef = useRef(null);
  const endRef = useRef(null);
  const voiceSupported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Reset the greeting (and keep future replies) in the newly selected language
  useEffect(() => {
    setMessages([{ role: "ai", text: AI_GREETING[lang] || AI_GREETING.en }]);
  }, [lang]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = useCallback(async (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((m) => [...m, { role: "user", text: clean }]);
    setInput("");
    setTyping(true);
    addHistory({ icon: MessageCircle, title: "Asked the AI assistant", body: clean, time: "now" });

    // Always try the real backend first (it's just a relative Netlify
    // Function URL — nothing to check ahead of time). If it's not deployed
    // yet, or the call fails for any reason, this throws and we fall back
    // to the built-in keyword-matched reply below automatically.
    try {
      const reply = await askRealAI(clean, lang);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setTyping(false);
      setRealAiWorking(true);
      return;
    } catch {
      // fall through to the simulated reply
    }
    setTimeout(() => {
      const reply = aiReply(clean, lang);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
      setTyping(false);
    }, 700 + Math.random() * 500);
  }, [addHistory, lang]);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-IN";
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const toggleListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e) => { const text = e.results[0][0].transcript; send(text); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-11rem)] sm:h-[calc(100vh-8rem)]">
      <SectionHeader title={t.assistant} eyebrow="EN · తెలుగు · हिंदी" right={
        realAiWorking ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4C7A3D] bg-[#4C7A3D]/10 px-3 py-1.5 rounded-full"><BadgeCheck className="h-3.5 w-3.5" /> Real AI</span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#3E8FB0] bg-[#3E8FB0]/10 px-3 py-1.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-[#3E8FB0] animate-pulse" />Rule-based demo</span>
        )
      } />
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-[fadeUp_0.3s_ease]`}>
              <div className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-[#1F3D2B] text-white rounded-br-md" : "bg-[#FAF6EE] dark:bg-[#0f1c14] text-[#1F3D2B] dark:text-white rounded-bl-md"}`}>
                {m.text}
                {m.role === "ai" && (
                  <button onClick={() => speak(m.text)} className="ml-2 inline-flex align-middle text-[#4C7A3D] hover:text-[#E8A33D]">
                    <Volume2 className={`h-3.5 w-3.5 inline ${speaking ? "animate-pulse" : ""}`} />
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start"><div className="bg-[#FAF6EE] dark:bg-[#0f1c14] rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              {[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 rounded-full bg-[#4C7A3D]/50 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div></div>
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t border-black/5 dark:border-white/10 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <button onClick={toggleListen} disabled={!voiceSupported}
              title={voiceSupported ? "Voice input" : "Voice input not supported in this browser"}
              className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl transition ${listening ? "bg-red-500 text-white animate-pulse" : "bg-[#4C7A3D]/10 text-[#4C7A3D] hover:bg-[#4C7A3D]/20"} disabled:opacity-40`}>
              {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={listening ? "Listening…" : "Ask about crops, disease, fertilizer, schemes…"}
              className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-3 text-sm text-[#1F3D2B] dark:text-white outline-none focus:ring-2 focus:ring-[#4C7A3D]" />
            <button onClick={() => send(input)} className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-[#1F3D2B] text-white hover:bg-[#173322] transition"><Send className="h-4.5 w-4.5" /></button>
          </div>
          {!voiceSupported && <p className="text-[11px] text-black/35 dark:text-white/35 mt-2">Voice input isn't supported in this browser — try Chrome on Android/desktop.</p>}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   DISEASE DETECTION
   ============================================================ */
function hashKey(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 37) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function DiseaseDetection({ t, lang, addHistory }) {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resultIndex, setResultIndex] = useState(null); // canonical index into DISEASE_DB.* (simulated path)
  const [apiResult, setApiResult] = useState(null); // real crop.health result, when the call succeeds
  const [apiError, setApiError] = useState(null);
  const [realWorking, setRealWorking] = useState(false); // flips true after the first real result succeeds
  const [history, setHistory] = useState([]); // { real, index?, name?, crop?, confidence?, img, date }
  const [cropChoice, setCropChoice] = useState("auto"); // canonical (English) crop name, or "auto"
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const previewImgRef = useRef(null);
  const [validationError, setValidationError] = useState(null);
  const db = DISEASE_DB[lang] || DISEASE_DB.en;
  const canonical = DISEASE_DB.en;
  const cropOptions = ["auto", ...canonical.map((d) => d.crop)];
  const result = apiResult || (resultIndex != null ? db[resultIndex] : null);

  // Basic image validation — the original spec calls for this and there
  // wasn't any: reject non-image files and anything unreasonably large
  // before it's ever sent anywhere (local check, and the actual crop.health/
  // custom-model calls would just fail confusingly on a bad file otherwise).
  const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setValidationError(null);
    if (!f.type.startsWith("image/")) {
      setValidationError("That file isn't an image — please choose a photo (JPG, PNG, etc.).");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      setValidationError("That image is too large (over 8MB) — try a smaller photo or a screenshot of it.");
      e.target.value = "";
      return;
    }
    setResultIndex(null);
    setApiResult(null);
    setApiError(null);
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.onerror = () => setValidationError("Couldn't read that file — please try a different photo.");
    reader.readAsDataURL(f);
    e.target.value = ""; // allow re-selecting the same file
  };

  const runSimulatedMatch = () => {
    // Deterministic, not random: the same photo + same crop always returns
    // the same result, so re-checking doesn't flip the diagnosis. This is
    // the fallback used when the real crop.health function isn't deployed
    // yet, or if a live call fails, so the feature keeps working either way.
    let poolIdx = cropChoice === "auto" ? canonical.map((_, i) => i) : canonical.map((d, i) => (d.crop === cropChoice ? i : -1)).filter((i) => i >= 0);
    if (!poolIdx.length) poolIdx = canonical.map((_, i) => i);
    const pick = poolIdx[hashKey(image + cropChoice) % poolIdx.length];
    setResultIndex(pick);
    const r = db[pick];
    setHistory((h) => [{ real: false, index: pick, img: image, date: new Date().toLocaleDateString() }, ...h]);
    addHistory({ icon: Bug, title: `Disease scan: ${r.name}`, body: `${r.crop} · ${r.confidence}% confidence (simulated)`, time: "now" });
  };

  const analyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setApiError(null);

    // The Netlify Function now proxies to the trained FastAPI backend.
    // Do not show a simulated diagnosis when the real service is unavailable.
    try {
      const r = await identifyCropDisease(image, lang);
      setApiResult(r);
      setRealWorking(true);
      setHistory((h) => [{ real: true, name: r.name, crop: r.crop, confidence: r.confidence, img: image, date: new Date().toLocaleDateString() }, ...h]);
      addHistory({ icon: Bug, title: `Disease scan: ${r.name}`, body: `${r.crop} · ${r.confidence}% confidence`, time: "now" });
    } catch (err) {
      setApiError(String(err.message || err));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title={t.disease} eyebrow="AI vision" />
      {realWorking ? (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-[#4C7A3D]">
          <BadgeCheck className="h-5 w-5 text-[#4C7A3D] shrink-0 mt-0.5" />
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">Connected to a real crop disease identification service. Results reflect an actual trained model, not a demo.</p>
        </Card>
      ) : (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-[#3E8FB0]">
          <Info className="h-5 w-5 text-[#3E8FB0] shrink-0 mt-0.5" />
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">{t.aiAccuracyNote}</p>
        </Card>
      )}
      {validationError && (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-red-400">
          <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">{validationError}</p>
        </Card>
      )}
      {apiError && (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-[#E8A33D]">
          <AlertTriangle className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">Real identification service didn't respond ({apiError}) — no diagnosis was generated. Check the backend connection and try again.</p>
        </Card>
      )}
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <div
            onClick={() => galleryRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-[#4C7A3D]/30 hover:border-[#4C7A3D] transition-colors bg-[#FAF6EE] dark:bg-[#0f1c14] aspect-square flex items-center justify-center overflow-hidden relative group"
          >
            {image ? (
              <img ref={previewImgRef} src={image} alt="crop" className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <div className="text-center px-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4C7A3D]/10 text-[#4C7A3D] group-hover:scale-110 transition-transform"><Camera className="h-7 w-7" /></div>
                <p className="text-sm font-semibold text-[#1F3D2B] dark:text-white">{t.captureUpload}</p>
                <p className="text-xs text-black/40 dark:text-white/40 mt-1">{t.bestAngle}</p>
              </div>
            )}
            {/* Gallery picker: no `capture` attribute, so mobile browsers show the
                normal photo-library / file chooser instead of forcing the camera. */}
            <input ref={galleryRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
            {/* Camera picker: `capture` attribute intentionally forces the camera,
                only used by the dedicated Capture button below. */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={onFile} className="hidden" />
          </div>
          <label className="block mt-4">
            <span className="text-xs font-semibold text-[#1F3D2B] dark:text-white mb-1.5 block">{t.selectCrop}</span>
            <select value={cropChoice} onChange={(e) => { setCropChoice(e.target.value); setResultIndex(null); }}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-2.5 text-sm text-[#1F3D2B] dark:text-white outline-none focus:ring-2 focus:ring-[#4C7A3D]">
              {cropOptions.map((c, i) => <option key={c} value={c}>{c === "auto" ? t.autoDetect : db[canonical.findIndex((d) => d.crop === c)]?.crop || c}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button onClick={() => cameraRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#4C7A3D]/30 text-[#4C7A3D] font-semibold py-3 hover:bg-[#4C7A3D]/5 transition text-sm"><Camera className="h-4 w-4" /> {t.captureBtn}</button>
            <button onClick={() => galleryRef.current?.click()} className="flex items-center justify-center gap-1.5 rounded-xl border border-[#4C7A3D]/30 text-[#4C7A3D] font-semibold py-3 hover:bg-[#4C7A3D]/5 transition text-sm"><Upload className="h-4 w-4" /> {t.uploadBtn}</button>
            <button onClick={analyze} disabled={!image || analyzing} className="flex items-center justify-center gap-1.5 rounded-xl bg-[#1F3D2B] text-white font-semibold py-3 hover:bg-[#173322] transition disabled:opacity-40 text-sm">
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t.analyzeBtn}</>}
            </button>
          </div>
        </Card>

        <Card className="p-5">
          {!result && !analyzing && <div className="h-full flex flex-col items-center justify-center text-center py-12 text-black/35 dark:text-white/35"><FlaskConical className="h-10 w-10 mb-3" /><p className="text-sm">{t.resultsHere}</p></div>}
          {analyzing && <div className="h-full flex flex-col items-center justify-center text-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#4C7A3D] mb-3" /><p className="text-sm text-black/50 dark:text-white/50">{t.runningDiagnosis}</p></div>}
          {result && !analyzing && (
            <div className="animate-[fadeUp_0.4s_ease]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs font-bold text-[#E8A33D] uppercase tracking-wide mb-1">{result.crop}</p>
                  <h3 className="text-xl font-bold text-[#1F3D2B] dark:text-white">{result.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#4C7A3D]">{result.confidence}%</p>
                  <p className="text-[11px] text-black/40 dark:text-white/40">{t.confidenceLabel}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { l: t.symptomsLabel, v: result.symptoms, icon: Info },
                  { l: t.causesLabel, v: result.causes, icon: Bug },
                  { l: t.treatmentLabel, v: result.treatment, icon: FlaskConical },
                  { l: t.medicinesLabel, v: result.medicines, icon: ClipboardList },
                  { l: t.preventionLabel, v: result.prevention, icon: ShieldCheck },
                ].map((row) => (
                  <div key={row.l} className="flex gap-3 rounded-xl bg-[#FAF6EE] dark:bg-[#0f1c14] p-3.5">
                    <row.icon className="h-4.5 w-4.5 text-[#4C7A3D] shrink-0 mt-0.5" />
                    <div><p className="text-xs font-bold text-[#1F3D2B] dark:text-white mb-0.5">{row.l}</p><p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">{row.v}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {history.length > 0 && (
        <Card className="p-5">
          <SectionHeader title={t.diseaseHistoryLabel} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {history.map((h, i) => {
              const item = h.real ? h : db[h.index];
              return (
                <div key={i} className="rounded-xl overflow-hidden border border-black/5 dark:border-white/10">
                  <img src={h.img} className="w-full h-24 object-cover" />
                  <div className="p-2.5"><p className="text-xs font-bold text-[#1F3D2B] dark:text-white truncate">{item.name}</p><p className="text-[10px] text-black/40 dark:text-white/40">{h.date} · {item.confidence}%</p></div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================
   WEATHER
   ============================================================ */
const WEATHER_ADVICE = {
  rain: {
    en: "Rain is expected in the next few days — finish any urea top-dressing before it arrives so nutrients aren't washed away, and hold off on pesticide spraying until conditions clear.",
    te: "వచ్చే కొద్ది రోజుల్లో వర్షం అవకాశం ఉంది — నీటిపారుదల ముందు యూరియా టాప్-డ్రెస్ పూర్తి చేయండి, పురుగుమందు స్ప్రేను వాతావరణం క్లియర్ అయ్యేవరకు వాయిదా వేయండి.",
    hi: "अगले कुछ दिनों में बारिश की संभावना है — इससे पहले यूरिया टॉप-ड्रेस पूरा कर लें ताकि पोषक तत्व बह न जाएं, और मौसम साफ़ होने तक कीटनाशक छिड़काव टालें।",
  },
  clear: {
    en: "No major rain expected this week — a good window for irrigation scheduling, spraying, or any field operations that need dry conditions.",
    te: "ఈ వారం పెద్ద వర్షం అవకాశం లేదు — నీటిపారుదల ప్రణాళిక, స్ప్రే చేయడం లేదా ఎండిన పరిస్థితులు అవసరమైన పనులకు మంచి సమయం.",
    hi: "इस सप्ताह बड़ी बारिश की संभावना नहीं है — सिंचाई योजना, छिड़काव या सूखी स्थिति चाहने वाले कार्यों के लिए अच्छा समय है।",
  },
};
const HUMIDITY_LABEL = {
  low: { en: "Low", te: "తక్కువ", hi: "कम" },
  moderate: { en: "Moderate", te: "మధ్యస్థం", hi: "मध्यम" },
  high: { en: "High", te: "అధికం", hi: "अधिक" },
};
const UV_LABEL = {
  low: { en: "Low", te: "తక్కువ", hi: "कम" },
  moderate: { en: "Moderate", te: "మధ్యస్థం", hi: "मध्यम" },
  high: { en: "High · wear protection", te: "అధికం · రక్షణ వేసుకోండి", hi: "अधिक · सुरक्षा पहनें" },
  veryHigh: { en: "Very High · wear protection", te: "చాలా అధికం · రక్షణ వేసుకోండి", hi: "बहुत अधिक · सुरक्षा पहनें" },
};
const compassDir = (deg) => {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
};

function Weather({ t, lang, addHistory }) {
  const [status, setStatus] = useState("loading"); // loading | ok | denied | error
  const [region, setRegion] = useState("");
  const [current, setCurrent] = useState(null); // { temp, feels, humidity, wind, windDir, uv }
  const [forecast, setForecast] = useState(WEATHER_FORECAST);

  useEffect(() => {
    addHistory({ icon: CloudSun, title: "Checked weather forecast", body: "7-day outlook viewed", time: "now" });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!navigator.geolocation) { setStatus("error"); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const [weatherRes, geoRes] = await Promise.all([
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,precipitation_probability_max,relative_humidity_2m_max,uv_index_max&timezone=auto&forecast_days=7`),
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`),
          ]);
          const weather = await weatherRes.json();
          const geo = await geoRes.json().catch(() => null);

          if (geo) {
            const place = geo.city || geo.locality || geo.principalSubdivision || "";
            const region2 = geo.principalSubdivision && geo.principalSubdivision !== place ? geo.principalSubdivision : geo.countryName;
            setRegion([place, region2].filter(Boolean).join(", "));
          }

          if (weather?.current) {
            setCurrent({
              temp: Math.round(weather.current.temperature_2m),
              feels: Math.round(weather.current.apparent_temperature),
              humidity: Math.round(weather.current.relative_humidity_2m),
              wind: Math.round(weather.current.wind_speed_10m),
              windDir: compassDir(weather.current.wind_direction_10m),
              uv: weather.daily?.uv_index_max?.[0] != null ? Math.round(weather.daily.uv_index_max[0]) : null,
            });
          }
          if (weather?.daily?.time) {
            const days = weather.daily.time.map((d, i) => ({
              day: new Date(d).toLocaleDateString(undefined, { weekday: "short" }),
              temp: Math.round(weather.daily.temperature_2m_max[i]),
              rain: Math.round(weather.daily.precipitation_probability_max[i] ?? 0),
              humidity: Math.round(weather.daily.relative_humidity_2m_max?.[i] ?? 0),
            }));
            setForecast(days);
          }
          setStatus("ok");
        } catch {
          setStatus("error");
        }
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const humidityLevel = (h) => (h < 40 ? "low" : h < 70 ? "moderate" : "high");
  const uvLevel = (u) => (u == null ? "moderate" : u < 3 ? "low" : u < 6 ? "moderate" : u < 8 ? "high" : "veryHigh");
  const rainySoon = forecast.some((d) => d.rain >= 60);

  const cards = current
    ? [
        { icon: Gauge, label: t.temperature, value: `${current.temp}°C`, sub: `${t.feelsLike} ${current.feels}°C`, color: "text-[#E8A33D]" },
        { icon: Droplets, label: t.humidity, value: `${current.humidity}%`, sub: HUMIDITY_LABEL[humidityLevel(current.humidity)][lang], color: "text-[#3E8FB0]" },
        { icon: Wind, label: t.windSpeed, value: `${current.wind} km/h`, sub: `${current.windDir} direction`, color: "text-[#4C7A3D]" },
        { icon: Sun, label: t.uvIndex, value: current.uv != null ? `${current.uv}` : "—", sub: UV_LABEL[uvLevel(current.uv)][lang], color: "text-[#B0553E]" },
      ]
    : [
        { icon: Gauge, label: t.temperature, value: "31°C", sub: `${t.feelsLike} 34°C`, color: "text-[#E8A33D]" },
        { icon: Droplets, label: t.humidity, value: "58%", sub: HUMIDITY_LABEL.moderate[lang], color: "text-[#3E8FB0]" },
        { icon: Wind, label: t.windSpeed, value: "14 km/h", sub: "NE direction", color: "text-[#4C7A3D]" },
        { icon: Sun, label: t.uvIndex, value: "7", sub: UV_LABEL.high[lang], color: "text-[#B0553E]" },
      ];

  return (
    <div className="space-y-5">
      <SectionHeader title={t.weather} eyebrow={region || t.yourRegion} />

      {status !== "ok" && (
        <Card className="p-4 flex items-center gap-3 border-l-4 !border-l-[#3E8FB0]">
          <MapPin className="h-5 w-5 text-[#3E8FB0] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#1F3D2B] dark:text-white">
              {status === "loading" ? t.findingLocation : t.locationNeeded}
            </p>
            {status !== "loading" && <p className="text-xs text-black/50 dark:text-white/50">{t.locationDeniedBody}</p>}
          </div>
          {status === "denied" && (
            <button onClick={() => window.location.reload()} className="shrink-0 text-xs font-semibold text-white bg-[#3E8FB0] px-3 py-2 rounded-lg">{t.tryAgain}</button>
          )}
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-4 flex items-center gap-3">
            <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5 ${c.color}`}><c.icon className="h-5.5 w-5.5" /></span>
            <div><p className="text-xs text-black/45 dark:text-white/45">{c.label}</p><p className="font-bold text-[#1F3D2B] dark:text-white">{c.value}</p><p className="text-[11px] text-black/35 dark:text-white/35">{c.sub}</p></div>
          </Card>
        ))}
      </div>

      {rainySoon && (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-[#E8A33D]">
          <AlertTriangle className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
          <div><p className="text-sm font-bold text-[#1F3D2B] dark:text-white">Weather alert: rain likely this week</p><p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Up to {Math.max(...forecast.map((d) => d.rain))}% rain chance on some days — delay spraying and check drainage in low fields.</p></div>
        </Card>
      )}

      <Card className="p-5">
        <SectionHeader title={t.sevenDayForecast} />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="rain" name="Rain %" fill="#3E8FB0" radius={[6, 6, 0, 0]} />
            <Bar dataKey="temp" name="Temp °C" fill="#E8A33D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-5 flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4C7A3D]/10 text-[#4C7A3D]"><Sprout className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-bold text-[#1F3D2B] dark:text-white mb-1">{t.aiWeatherAdvice}</p>
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">{rainySoon ? WEATHER_ADVICE.rain[lang] : WEATHER_ADVICE.clear[lang]}</p>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   SHOP LOCATOR
   ============================================================ */
// Offsets a lat/lng by a distance (km) and bearing (degrees) — used to place
// each shop at a real, navigable point near the farmer's actual location.
const SHOP_QUERY_MAP = { All: "agricultural supply shop", Seeds: "seed shop", Fertilizer: "fertilizer shop", Pesticides: "pesticide shop", Equipment: "agricultural equipment shop" };

// Straight-line distance between two coordinates, in km — used to show
// "X km away" on real shop listings, which the app was missing entirely
// (it's in the original spec: distance is expected alongside every shop).
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function ShopLocator({ t }) {
  const [filter, setFilter] = useState("All");
  const [coords, setCoords] = useState(null);
  const [locStatus, setLocStatus] = useState("idle"); // idle | asking | granted | denied
  const [realShops, setRealShops] = useState(null); // null = not fetched, [] = fetched empty
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const types = ["All", "Seeds", "Fertilizer", "Pesticides", "Equipment"];
  const filtered = SHOPS.filter((s) => filter === "All" || s.type.includes(filter));

  const requestLocation = () => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    setLocStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocStatus("granted"); },
      () => setLocStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };
  useEffect(() => { requestLocation(); }, []);

  // Fetch real, exact nearby shops from Google Places whenever we have the
  // farmer's location and a category — this is what makes Navigate point to
  // an actual business instead of a generic search.
  useEffect(() => {
    if (!placesApiReady || !coords) return;
    let cancelled = false;
    setFetching(true);
    setFetchError(null);
    searchNearbyShops(SHOP_QUERY_MAP[filter], coords.lat, coords.lng)
      .then((results) => { if (!cancelled) setRealShops(results); })
      .catch((err) => { if (!cancelled) { setFetchError(String(err.message || err)); setRealShops(null); } })
      .finally(() => { if (!cancelled) setFetching(false); });
    return () => { cancelled = true; };
  }, [filter, coords]);

  // Fallback for when Places isn't configured (or the location prompt was
  // denied): Google Maps' free "directions" URL scheme — no API key or
  // billing needed — that resolves a plain-text destination to the nearest
  // real match and opens actual turn-by-turn directions to it, routed from
  // the farmer's real location.
  //
  // NOTE: deliberately no `dir_action=navigate` here — that parameter only
  // works reliably with an exact resolved destination (coordinates/place
  // ID). With a plain text search term like "fertilizer shop", it was
  // causing Maps to show a search/results screen instead of an actual
  // route — exactly the "Navigate doesn't show directions" bug.
  const fallbackDirectionsUrl = (shop) => {
    const destination = encodeURIComponent(`${shop.type} shop`);
    if (coords) {
      return `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${destination}&travelmode=driving`;
    }
    // No location permission at all — Maps will still ask for/use the
    // device's location as the starting point once it opens.
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  };

  const usingRealData = placesApiReady && coords && realShops;

  return (
    <div className="space-y-5">
      <SectionHeader title={t.shops} eyebrow="Nearby" right={
        usingRealData ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#4C7A3D] bg-[#4C7A3D]/10 px-3 py-1.5 rounded-full"><BadgeCheck className="h-3.5 w-3.5" /> Real listings</span>
        ) : null
      } />
      {locStatus !== "granted" && (
        <Card className="p-4 flex items-center gap-3 border-l-4 !border-l-[#3E8FB0]">
          <Navigation className="h-5 w-5 text-[#3E8FB0] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-[#1F3D2B] dark:text-white">
              {locStatus === "denied" ? "Location access needed for accurate navigation" : "Finding your location…"}
            </p>
            <p className="text-xs text-black/50 dark:text-white/50">
              {locStatus === "denied"
                ? "Without it, Navigate will search generally instead of routing from where you are."
                : "Allow the location prompt so Navigate routes from where you actually are."}
            </p>
          </div>
          {locStatus === "denied" && (
            <button onClick={requestLocation} className="shrink-0 text-xs font-semibold text-white bg-[#3E8FB0] px-3 py-2 rounded-lg">Try again</button>
          )}
        </Card>
      )}
      {!placesApiReady && locStatus === "granted" && (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-[#E8A33D]">
          <Info className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">Showing sample shop cards, but Navigate opens real turn-by-turn directions to the nearest matching real business. Connect the Google Places API (see placesApi.js) to also show real business names and ratings directly in the app.</p>
        </Card>
      )}
      {fetchError && (
        <Card className="p-4 flex items-start gap-3 border-l-4 !border-l-[#E8A33D]">
          <AlertTriangle className="h-5 w-5 text-[#E8A33D] shrink-0 mt-0.5" />
          <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed">Couldn't load real listings ({fetchError}) — showing sample shops instead.</p>
        </Card>
      )}
      <div className="flex gap-2 flex-wrap">
        {types.map((tp) => (
          <button key={tp} onClick={() => setFilter(tp)} className={`px-4 py-2 rounded-full text-xs font-semibold transition ${filter === tp ? "bg-[#1F3D2B] text-white" : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60"}`}>{tp}</button>
        ))}
      </div>

      {fetching && (
        <div className="flex items-center justify-center py-10 text-black/40 dark:text-white/40 gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Finding real shops near you…</div>
      )}

      {!fetching && usingRealData && (
        <div className="grid sm:grid-cols-2 gap-4">
          {realShops.length === 0 && <p className="text-sm text-black/40 dark:text-white/40 col-span-2 text-center py-6">No real listings found nearby for this category.</p>}
          {realShops.map((s) => (
            <Card key={s.id} className="p-4 flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B0553E]/10 text-[#B0553E]"><MapPin className="h-5.5 w-5.5" /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-[#1F3D2B] dark:text-white leading-tight">{s.name}</p>
                  {s.rating && <span className="flex items-center gap-0.5 text-xs font-bold text-[#E8A33D] shrink-0"><Star className="h-3.5 w-3.5 fill-[#E8A33D]" />{s.rating}</span>}
                </div>
                <p className="text-xs text-black/45 dark:text-white/45 mb-2 truncate">
                  {s.address}{coords && s.lat != null && ` · ${haversineKm(coords.lat, coords.lng, s.lat, s.lng).toFixed(1)} km away`}
                </p>
                <div className="flex gap-2">
                  {s.phone && <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs font-semibold text-[#4C7A3D] bg-[#4C7A3D]/10 px-3 py-1.5 rounded-lg"><Phone className="h-3.5 w-3.5" /> Call</a>}
                  <a href={directionsUrl(s, coords.lat, coords.lng)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[#3E8FB0] bg-[#3E8FB0]/10 px-3 py-1.5 rounded-lg"><Navigation className="h-3.5 w-3.5" /> Navigate</a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!fetching && !usingRealData && (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <Card key={s.name} className="p-4 flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#B0553E]/10 text-[#B0553E]"><MapPin className="h-5.5 w-5.5" /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold text-sm text-[#1F3D2B] dark:text-white leading-tight">{s.name}</p>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-[#E8A33D] shrink-0"><Star className="h-3.5 w-3.5 fill-[#E8A33D]" />{s.rating}</span>
                </div>
                <p className="text-xs text-black/45 dark:text-white/45 mb-2">{s.type} · {s.distance} away</p>
                <div className="flex gap-2">
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 text-xs font-semibold text-[#4C7A3D] bg-[#4C7A3D]/10 px-3 py-1.5 rounded-lg"><Phone className="h-3.5 w-3.5" /> Call</a>
                  <a href={fallbackDirectionsUrl(s)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-[#3E8FB0] bg-[#3E8FB0]/10 px-3 py-1.5 rounded-lg"><Navigation className="h-3.5 w-3.5" /> Navigate</a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MARKET PRICES
   ============================================================ */
function MarketPrices({ t }) {
  const [sel, setSel] = useState(MARKET_PRICES[0]);
  const chartData = sel.history.map((v, i) => ({ day: `D${i + 1}`, price: v }));
  return (
    <div className="space-y-5">
      <SectionHeader title={t.market} eyebrow="Daily mandi rates" />
      <Card className="p-5">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} width={45} />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#4C7A3D" strokeWidth={3} dot={{ r: 3 }} name={sel.crop} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-center text-xs text-black/40 dark:text-white/40 mt-1">{sel.crop} price trend — last 6 weeks</p>
      </Card>
      <div className="space-y-2.5">
        {MARKET_PRICES.map((m) => (
          <button key={m.crop} onClick={() => setSel(m)} className={`w-full text-left flex items-center gap-4 rounded-xl border p-4 transition ${sel.crop === m.crop ? "border-[#4C7A3D] bg-[#4C7A3D]/5" : "border-black/5 dark:border-white/10 bg-white dark:bg-[#182b20]"}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B5E34]/10 text-[#8B5E34]"><Wheat className="h-5 w-5" /></span>
            <div className="flex-1">
              <p className="font-bold text-sm text-[#1F3D2B] dark:text-white">{m.crop}</p>
              <p className="text-xs text-black/40 dark:text-white/40">{m.unit}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1F3D2B] dark:text-white">₹{m.price.toLocaleString("en-IN")}</p>
              <p className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${m.up ? "text-[#4C7A3D]" : "text-red-500"}`}>
                {m.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}{Math.abs(m.trend)}%
              </p>
            </div>
          </button>
        ))}
      </div>
      <Card className="p-4 flex gap-3 border-l-4 !border-l-[#4C7A3D]">
        <TrendingUp className="h-5 w-5 text-[#4C7A3D] shrink-0 mt-0.5" />
        <p className="text-xs text-black/55 dark:text-white/55 leading-relaxed"><span className="font-bold text-[#1F3D2B] dark:text-white">Best-selling suggestion: </span>Turmeric and paddy are trending upward this week — if storage allows, holding a few more days could fetch a better price.</p>
      </Card>
    </div>
  );
}

/* ============================================================
   CROP ADVISORY
   ============================================================ */
function CropAdvisory({ t, lang }) {
  const calendar = CROP_CALENDAR[lang] || CROP_CALENDAR.en;
  return (
    <div className="space-y-5">
      <SectionHeader title={t.advisory} eyebrow="Crop calendar" />
      <div className="grid sm:grid-cols-2 gap-4">
        {calendar.map((c) => (
          <Card key={c.crop} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#1F3D2B] dark:text-white">{c.crop}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wide bg-[#4C7A3D]/10 text-[#4C7A3D] px-2.5 py-1 rounded-full">{c.season}</span>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex gap-2"><CalendarDays className="h-4 w-4 text-[#E8A33D] shrink-0" /><span><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.sowing}:</span> <span className="text-black/55 dark:text-white/55">{c.sow}</span></span></div>
              <div className="flex gap-2"><Tractor className="h-4 w-4 text-[#8B5E34] shrink-0" /><span><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.harvestLabel}:</span> <span className="text-black/55 dark:text-white/55">{c.harvest}</span></span></div>
              <div className="flex gap-2"><Droplets className="h-4 w-4 text-[#3E8FB0] shrink-0" /><span><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.irrigationLabel}:</span> <span className="text-black/55 dark:text-white/55">{c.irrigation}</span></span></div>
              <div className="flex gap-2"><Sprout className="h-4 w-4 text-[#4C7A3D] shrink-0" /><span><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.fertilizerLabel}:</span> <span className="text-black/55 dark:text-white/55">{c.fertilizer}</span></span></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SOIL INFO
   ============================================================ */
function SoilInfo({ t, lang }) {
  const soils = SOIL_TYPES[lang] || SOIL_TYPES.en;
  return (
    <div className="space-y-5">
      <SectionHeader title={t.soil} eyebrow="Know your land" />
      <div className="grid sm:grid-cols-2 gap-4">
        {soils.map((s) => (
          <Card key={s.type} className="p-5 [perspective:1000px] group">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8B5E34]/10 text-[#8B5E34] group-hover:rotate-[8deg] transition-transform"><FlaskConical className="h-5 w-5" /></span>
              <h3 className="font-bold text-[#1F3D2B] dark:text-white">{s.type}</h3>
            </div>
            <p className="text-xs text-black/55 dark:text-white/55 mb-2"><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.suitableCrops}: </span>{s.crops}</p>
            <p className="text-xs text-black/55 dark:text-white/55 mb-2"><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.tip}: </span>{s.tip}</p>
            <p className="text-xs text-black/55 dark:text-white/55"><span className="font-semibold text-[#1F3D2B] dark:text-white">{t.fertilizerLabel}: </span>{s.fertilizer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   GOVT SCHEMES
   ============================================================ */
function Schemes({ t, lang }) {
  const [level, setLevel] = useState("All");
  const schemes = SCHEMES[lang] || SCHEMES.en;
  const filtered = schemes.filter((s) => level === "All" || s.levelKey === level);
  const levels = [{ k: "All", l: t.allLevel }, { k: "central", l: t.centralLevel }, { k: "state", l: t.stateLevel }];
  return (
    <div className="space-y-5">
      <SectionHeader title={t.schemes} eyebrow="Central & state" />
      <div className="flex gap-2">
        {levels.map((lv) => (
          <button key={lv.k} onClick={() => setLevel(lv.k)} className={`px-4 py-2 rounded-full text-xs font-semibold transition ${level === lv.k ? "bg-[#1F3D2B] text-white" : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60"}`}>{lv.l}</button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map((s) => (
          <Card key={s.name} className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6B4C9A]/10 text-[#6B4C9A]"><Landmark className="h-5 w-5" /></span>
                <div><h3 className="font-bold text-[#1F3D2B] dark:text-white">{s.name}</h3><span className="text-[10px] font-bold uppercase tracking-wide text-[#6B4C9A]">{s.level}</span></div>
              </div>
              <a href={s.link} target="_blank" rel="noreferrer" className="shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-[#4C7A3D] px-3.5 py-2 rounded-lg hover:bg-[#3d6531] transition">{t.applyBtn} <ArrowRight className="h-3.5 w-3.5" /></a>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-[#FAF6EE] dark:bg-[#0f1c14] p-3"><p className="font-semibold text-[#1F3D2B] dark:text-white mb-1">{t.benefit}</p><p className="text-black/55 dark:text-white/55">{s.benefit}</p></div>
              <div className="rounded-lg bg-[#FAF6EE] dark:bg-[#0f1c14] p-3"><p className="font-semibold text-[#1F3D2B] dark:text-white mb-1">{t.eligibility}</p><p className="text-black/55 dark:text-white/55">{s.eligibility}</p></div>
              <div className="rounded-lg bg-[#FAF6EE] dark:bg-[#0f1c14] p-3"><p className="font-semibold text-[#1F3D2B] dark:text-white mb-1">{t.documents}</p><p className="text-black/55 dark:text-white/55">{s.docs}</p></div>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-[11px] text-black/35 dark:text-white/35 text-center">Scheme details are for guidance only — always confirm current terms on the official portal before applying.</p>
    </div>
  );
}

/* ============================================================
   NOTIFICATIONS
   ============================================================ */
function Notifications({ t, lang }) {
  const [types, setTypes] = useState(NOTIF_TYPES[lang] || NOTIF_TYPES.en);
  useEffect(() => { setTypes(NOTIF_TYPES[lang] || NOTIF_TYPES.en); }, [lang]);
  const toggle = (key) => setTypes((ts) => ts.map((x) => (x.key === key ? { ...x, enabled: !x.enabled } : x)));
  const toneColor = { warn: "text-[#E8A33D] bg-[#E8A33D]/10", info: "text-[#3E8FB0] bg-[#3E8FB0]/10", danger: "text-red-500 bg-red-500/10" };
  const feed = NOTIF_FEED[lang] || NOTIF_FEED.en;
  return (
    <div className="space-y-5">
      <SectionHeader title={t.notifications} eyebrow="Stay ahead" />
      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-3">{t.alertTypes}</p>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {types.map((n) => (
            <div key={n.key} className="flex items-center justify-between rounded-xl bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-3">
              <div className="flex items-center gap-2.5"><n.icon className="h-4.5 w-4.5 text-[#4C7A3D]" /><span className="text-sm font-medium text-[#1F3D2B] dark:text-white">{n.label}</span></div>
              <button onClick={() => toggle(n.key)} className={`relative h-6 w-11 rounded-full transition-colors ${n.enabled ? "bg-[#4C7A3D]" : "bg-black/15 dark:bg-white/15"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${n.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>
      <div className="space-y-2.5">
        {feed.map((n, i) => (
          <Card key={i} className="p-4 flex gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneColor[n.tone]}`}><n.icon className="h-5 w-5" /></span>
            <div className="flex-1"><p className="text-sm font-bold text-[#1F3D2B] dark:text-white">{n.title}</p><p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{n.body}</p></div>
            <span className="text-[11px] text-black/35 dark:text-white/35 shrink-0">{n.time}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   REPORTS & HISTORY
   ============================================================ */
function Reports({ t, lang, history }) {
  const [tab, setTab] = useState("activity");
  const tabs = [{ k: "activity", l: t.allActivity }, { k: "weather", l: t.weatherHistory }, { k: "notifications", l: t.notificationHistory }];
  const feed = NOTIF_FEED[lang] || NOTIF_FEED.en;
  return (
    <div className="space-y-5">
      <SectionHeader title={t.reports} />
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tb) => (
          <button key={tb.k} onClick={() => setTab(tb.k)} className={`px-4 py-2 rounded-full text-xs font-semibold transition ${tab === tb.k ? "bg-[#1F3D2B] text-white" : "bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60"}`}>{tb.l}</button>
        ))}
      </div>
      <Card className="p-5">
        {tab === "activity" && (
          <div className="space-y-2">
            {history.length === 0 && <p className="text-sm text-black/40 dark:text-white/40 text-center py-8">{t.noActivity}</p>}
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-[#FAF6EE] dark:hover:bg-[#0f1c14] transition">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4C7A3D]/10 text-[#4C7A3D]"><h.icon className="h-4 w-4" /></span>
                <div className="min-w-0"><p className="text-sm font-semibold text-[#1F3D2B] dark:text-white truncate">{h.title}</p><p className="text-xs text-black/45 dark:text-white/45 truncate">{h.body}</p></div>
                <span className="ml-auto text-[11px] text-black/35 dark:text-white/35 shrink-0">{h.time}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "weather" && (
          <div className="space-y-2">
            {WEATHER_FORECAST.map((w) => (
              <div key={w.day} className="flex items-center justify-between rounded-xl bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-3 text-sm">
                <span className="font-semibold text-[#1F3D2B] dark:text-white">{w.day}</span>
                <span className="text-black/50 dark:text-white/50">{w.temp}°C · {w.humidity}% {t.humidity.toLowerCase()} · {w.rain}% rain</span>
              </div>
            ))}
          </div>
        )}
        {tab === "notifications" && (
          <div className="space-y-2">
            {feed.map((n, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-3 text-sm">
                <span className="font-semibold text-[#1F3D2B] dark:text-white">{n.title}</span>
                <span className="text-black/40 dark:text-white/40 text-xs">{n.time}</span>
              </div>
            ))}

          </div>
        )}
      </Card>
    </div>
  );
}

/* ============================================================
   PROFILE
   ============================================================ */
function Profile({ t, lang, user, setUser }) {
  const [form, setForm] = useState({
    name: user?.name || "Ramesh Kumar", phone: "+91 98765 43210", village: "Kondapur",
    district: "Rangareddy", state: "Telangana", landSize: "4.5", mainCrops: "Paddy, Cotton",
    soilType: "Black (Regur) Soil", photo: null,
  });
  const fileRef = useRef(null);
  const [saved, setSaved] = useState(false);
  const onPhoto = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setForm((s) => ({ ...s, photo: r.result })); r.readAsDataURL(f);
  };
  return (
    <div className="space-y-5 max-w-2xl">
      <SectionHeader title={t.profile} />
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => fileRef.current?.click()} className="relative h-20 w-20 rounded-2xl bg-[#4C7A3D]/10 flex items-center justify-center overflow-hidden shrink-0 group">
            {form.photo ? <img src={form.photo} className="h-full w-full object-cover" /> : <User className="h-8 w-8 text-[#4C7A3D]" />}
            <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-semibold">Change</span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          <div><p className="font-bold text-lg text-[#1F3D2B] dark:text-white">{form.name}</p><p className="text-sm text-black/45 dark:text-white/45">{form.village}, {form.district}</p></div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setUser((u) => ({ ...u, name: form.name })); setSaved(true); setTimeout(() => setSaved(false), 2000); }} className="grid sm:grid-cols-2 gap-4">
          <Field label={t.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Field label={t.phone} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label={t.village} value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} />
          <Field label={t.district} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <Field label={t.state} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Field label={t.landSize} value={form.landSize} onChange={(e) => setForm({ ...form, landSize: e.target.value })} />
          <Field label={t.mainCrops} value={form.mainCrops} onChange={(e) => setForm({ ...form, mainCrops: e.target.value })} />
          <label className="block">
            <span className="text-sm font-medium text-[#3c4a3f] dark:text-[#c9d6cc] mb-1.5 block">{t.soilType}</span>
            <select value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })}
              className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-3 text-[15px] text-[#1F3D2B] dark:text-white outline-none focus:ring-2 focus:ring-[#4C7A3D]">
              {(SOIL_TYPES[lang] || SOIL_TYPES.en).map((s) => <option key={s.type}>{s.type}</option>)}
            </select>
          </label>
          <div className="sm:col-span-2 flex items-center gap-3 mt-2">
            <button type="submit" className="rounded-xl bg-[#1F3D2B] hover:bg-[#173322] text-white font-semibold px-6 py-3 transition">Save profile</button>
            {saved && <span className="text-sm text-[#4C7A3D] font-semibold flex items-center gap-1"><Check className="h-4 w-4" /> Saved</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}

/* ============================================================
   SETTINGS
   ============================================================ */
function SettingsScreen({ t, lang, setLang, dark, setDark, onLogout }) {
  const [notifOn, setNotifOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  return (
    <div className="space-y-5 max-w-2xl">
      <SectionHeader title={t.settings} />
      <Card className="p-5 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-2 px-1">{t.appearance}</p>
        <div className="flex items-center justify-between px-1 py-3">
          <div className="flex items-center gap-3">{dark ? <Moon className="h-5 w-5 text-[#4C7A3D]" /> : <Sun className="h-5 w-5 text-[#E8A33D]" />}<span className="text-sm font-medium text-[#1F3D2B] dark:text-white">{t.darkMode}</span></div>
          <button onClick={() => setDark((d) => !d)} className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-[#4C7A3D]" : "bg-black/15"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between px-1 py-3 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3"><Globe className="h-5 w-5 text-[#3E8FB0]" /><span className="text-sm font-medium text-[#1F3D2B] dark:text-white">{t.preferredLang}</span></div>
          <LangPicker lang={lang} setLang={setLang} />
        </div>
      </Card>

      <Card className="p-5 space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-2 px-1">{t.notifVoice}</p>
        <div className="flex items-center justify-between px-1 py-3">
          <div className="flex items-center gap-3"><Bell className="h-5 w-5 text-[#E8A33D]" /><span className="text-sm font-medium text-[#1F3D2B] dark:text-white">{t.pushNotif}</span></div>
          <button onClick={() => setNotifOn((v) => !v)} className={`relative h-6 w-11 rounded-full transition-colors ${notifOn ? "bg-[#4C7A3D]" : "bg-black/15"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${notifOn ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between px-1 py-3 border-t border-black/5 dark:border-white/10">
          <div className="flex items-center gap-3"><Mic className="h-5 w-5 text-[#8B5E34]" /><span className="text-sm font-medium text-[#1F3D2B] dark:text-white">{t.voiceResponses}</span></div>
          <button onClick={() => setVoiceOn((v) => !v)} className={`relative h-6 w-11 rounded-full transition-colors ${voiceOn ? "bg-[#4C7A3D]" : "bg-black/15"}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${voiceOn ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-black/40 dark:text-white/40 mb-2 px-1">{t.security}</p>
        <div className="space-y-2">
          {[
            { i: ShieldCheck, l: "Firebase Authentication", s: firebaseReady ? "Connected" : "Not connected yet", ok: firebaseReady },
            // Honest, not a blanket "Enforced" claim — this project's setup
            // guide starts Firestore in test mode (open access) so it's
            // easy to develop against; that must be tightened to real
            // security rules before handling real farmer data in public.
            { i: FlaskConical, l: "Firestore security rules", s: firebaseReady ? "Test mode — tighten before launch" : "Not connected yet", ok: false },
            { i: Check, l: "HTTPS encryption", s: "Enabled (via Netlify)", ok: true },
          ].map((r) => (
            <div key={r.l} className="flex items-center justify-between rounded-xl bg-[#FAF6EE] dark:bg-[#0f1c14] px-4 py-2.5">
              <div className="flex items-center gap-2.5"><r.i className="h-4 w-4 text-[#4C7A3D]" /><span className="text-sm text-[#1F3D2B] dark:text-white">{r.l}</span></div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${r.ok ? "text-[#4C7A3D] bg-[#4C7A3D]/10" : "text-[#E8A33D] bg-[#E8A33D]/10"}`}>{r.s}</span>
            </div>
          ))}
        </div>
      </Card>

      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 font-semibold py-3.5 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
        <LogOut className="h-4 w-4" /> {t.logout}
      </button>
    </div>
  );
}

/* ============================================================
   APP SHELL
   ============================================================ */
function AppShell({ lang, setLang, dark, setDark, user, setUser, onLogout }) {
  const t = STR[lang];
  const [screen, setScreen] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState([
    { icon: CloudSun, title: "Weather forecast updated", body: "7-day outlook refreshed for your district", time: "1h ago" },
  ]);
  const addHistory = useCallback((item) => setHistory((h) => [item, ...h].slice(0, 30)), []);

  const screens = {
    dashboard: <Dashboard t={t} lang={lang} user={user} setScreen={setScreen} history={history} />,
    assistant: <AIAssistant t={t} lang={lang} addHistory={addHistory} />,
    disease: <DiseaseDetection t={t} lang={lang} addHistory={addHistory} />,
    weather: <Weather t={t} lang={lang} addHistory={addHistory} />,
    shops: <ShopLocator t={t} />,
    market: <MarketPrices t={t} />,
    advisory: <CropAdvisory t={t} lang={lang} />,
    soil: <SoilInfo t={t} lang={lang} />,
    schemes: <Schemes t={t} lang={lang} />,
    notifications: <Notifications t={t} lang={lang} />,
    reports: <Reports t={t} lang={lang} history={history} />,
    settings: <SettingsScreen t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark} onLogout={onLogout} />,
    profile: <Profile t={t} lang={lang} user={user} setUser={setUser} />,
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0f1c14] transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-black/5 dark:border-white/10 bg-[#FAF6EE]/90 dark:bg-[#0f1c14]/90 backdrop-blur px-4 sm:px-6 py-3">
        <button onClick={() => setSidebarOpen((s) => !s)} className="lg:hidden rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"><Menu className="h-5 w-5 text-[#1F3D2B] dark:text-white" /></button>
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4C7A3D] text-white"><Sprout className="h-4.5 w-4.5" /></span>
          <span className="font-bold text-[#1F3D2B] dark:text-white hidden sm:block" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.appName}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark((d) => !d)} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10 text-[#1F3D2B] dark:text-white">{dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}</button>
          <LangPicker lang={lang} setLang={setLang} compact />
          <button onClick={() => setScreen("profile")} className="flex items-center gap-2 rounded-full bg-black/5 dark:bg-white/10 pl-1 pr-3 py-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4C7A3D] text-white text-xs font-bold">{(user?.name || "F")[0]}</span>
            <span className="text-xs font-semibold text-[#1F3D2B] dark:text-white hidden sm:block">{user?.name?.split(" ")[0] || "Farmer"}</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r border-black/5 dark:border-white/10 min-h-[calc(100vh-57px)] p-3 gap-1">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setScreen(n.key)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${screen === n.key ? "bg-[#1F3D2B] text-white shadow-md" : "text-[#3c4a3f] dark:text-[#c9d6cc] hover:bg-black/5 dark:hover:bg-white/5"}`}>
              <n.icon className="h-4.5 w-4.5" /> {t[n.key]}
            </button>
          ))}
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-72 bg-[#FAF6EE] dark:bg-[#0f1c14] p-3 gap-1 flex flex-col animate-[slideRight_0.25s_ease]">
              <div className="flex items-center justify-between p-2 mb-2">
                <span className="font-bold text-[#1F3D2B] dark:text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.appName}</span>
                <button onClick={() => setSidebarOpen(false)}><X className="h-5 w-5 text-[#1F3D2B] dark:text-white" /></button>
              </div>
              {NAV.map((n) => (
                <button key={n.key} onClick={() => { setScreen(n.key); setSidebarOpen(false); }}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${screen === n.key ? "bg-[#1F3D2B] text-white" : "text-[#3c4a3f] dark:text-[#c9d6cc]"}`}>
                  <n.icon className="h-4.5 w-4.5" /> {t[n.key]}
                </button>
              ))}
            </aside>
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">{screens[screen]}</main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF6EE]/95 dark:bg-[#0f1c14]/95 backdrop-blur border-t border-black/5 dark:border-white/10 flex justify-around py-2">
        {NAV.slice(0, 5).map((n) => (
          <button key={n.key} onClick={() => setScreen(n.key)} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg ${screen === n.key ? "text-[#4C7A3D]" : "text-black/40 dark:text-white/40"}`}>
            <n.icon className="h-5 w-5" /><span className="text-[10px] font-semibold">{t[n.key]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ============================================================
   ROOT
   ============================================================ */
/* ============================================================
   HOME / LANDING PAGE (public — shown before login)
   ============================================================ */
function HomePage({ lang, setLang, dark, setDark, goTo }) {
  const t = STR[lang];
  const rowAccents = ["#4C7A3D", "#E8A33D", "#3E8FB0", "#B0553E", "#8B5E34", "#6B4C9A"];
  const rows = NAV.map((n, i) => ({ ...n, accent: rowAccents[i % rowAccents.length] }));

  return (
    <div className="min-h-screen bg-[#FAF6EE] dark:bg-[#0f1c14] transition-colors">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-black/5 dark:border-white/10 bg-[#FAF6EE]/90 dark:bg-[#0f1c14]/90 backdrop-blur px-4 sm:px-8 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4C7A3D] text-white"><Sprout className="h-4.5 w-4.5" /></span>
        <span className="font-bold text-[#1F3D2B] dark:text-white" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.appName}</span>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark((d) => !d)} className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10 text-[#1F3D2B] dark:text-white">{dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}</button>
          <LangPicker lang={lang} setLang={setLang} compact />
          <button onClick={() => goTo("login")} className="rounded-full bg-[#1F3D2B] hover:bg-[#173322] text-white text-sm font-semibold px-4 sm:px-5 py-2 transition">{t.login}</button>
        </div>
      </header>

      {/* Hero — full-bleed field photo, the single bold moment on the page */}
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "linear-gradient(115deg, rgba(20,40,28,0.92), rgba(31,61,43,0.72) 55%, rgba(31,61,43,0.35)), url('https://images.pexels.com/photos/5458354/pexels-photo-5458354.jpeg?auto=compress&cs=tinysrgb&w=1920')" }}
      >
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 sm:py-28 text-center relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-80 pointer-events-none"><GrowthOrb3D className="w-64 h-64" /></div>
          <p className="text-[#E8A33D] text-xs font-bold tracking-[0.22em] uppercase mb-4 relative">{t.appName}</p>
          <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight mb-4 relative" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.homeTagline}</h1>
          <p className="text-[#dcead9] text-base sm:text-lg leading-relaxed mb-9 max-w-xl mx-auto relative">{t.homeSubtitle}</p>
          <button onClick={() => goTo("login")} className="relative inline-flex items-center gap-2 rounded-full bg-[#E8A33D] hover:bg-[#d6912e] text-[#1F3D2B] font-bold px-7 py-3.5 shadow-xl shadow-black/20 transition">
            {t.getStarted} <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </section>

      {/* Feature "rows" — laid out like furrows in a field, each one a way in.
          Clicking any row (the app's real content) prompts login. */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-14 sm:py-20">
        <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#E8A33D] mb-2 text-center">{t.exploreFeatures}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1F3D2B] dark:text-white text-center mb-10" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{t.loginToContinue}</h2>
        <div className="rounded-3xl overflow-hidden border border-black/5 dark:border-white/10 shadow-sm">
          {rows.map((r, i) => (
            <button
              key={r.key}
              onClick={() => goTo("login")}
              className="w-full flex items-center gap-4 sm:gap-5 px-5 sm:px-7 py-4 sm:py-5 text-left transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
              style={{
                backgroundColor: i % 2 === 0 ? "transparent" : "rgba(76,122,61,0.045)",
                borderTop: i === 0 ? "none" : "1px solid rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${r.accent}`,
              }}
            >
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl text-white" style={{ backgroundColor: r.accent }}>
                <r.icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
              </span>
              <span className="flex-1 font-semibold text-[#1F3D2B] dark:text-white text-[15px] sm:text-base">{t[r.key]}</span>
              <ChevronRight className="h-4.5 w-4.5 text-black/25 dark:text-white/25 shrink-0" />
            </button>
          ))}
        </div>
      </section>

      <footer className="border-t border-black/5 dark:border-white/10 py-8 text-center">
        <p className="text-xs text-black/40 dark:text-white/40">{t.appName} · {t.tagline}</p>
      </footer>
    </div>
  );
}

export default function AgriMitraApp() {
  const [authScreen, setAuthScreen] = useState("home");
  const [authed, setAuthed] = useState(false);
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [pendingLogin, setPendingLogin] = useState(null); // { username, mobile, district, mandal }
  const [otp, setOtp] = useState(null); // demo-mode fallback code
  const [confirmationResult, setConfirmationResult] = useState(null); // real Firebase phone-auth handle

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3800); };

  const sendOtp = async (form) => {
    setPendingLogin(form);
    if (firebaseReady) {
      try {
        const conf = await sendRealOtp(form.mobile);
        setConfirmationResult(conf);
        notify(`OTP sent via SMS to ${form.mobile}`);
        setAuthScreen("verify");
        return;
      } catch (err) {
        notify(`Couldn't send a real SMS OTP (${err.message || err}) — using demo mode instead`);
        // falls through to the simulated code below so login still works
      }
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setOtp(code);
    notify(`OTP sent to ${form.mobile}: ${code} (demo — connect Firebase for real SMS, see firebase.js)`);
    setAuthScreen("verify");
  };

  // Verifies the code the user typed, using real Firebase phone-auth when
  // configured, or comparing against the demo code otherwise. Throws on a
  // wrong code so VerifyScreen can show an inline error.
  const submitOtp = async (code) => {
    if (firebaseReady && confirmationResult) {
      const fbUser = await confirmOtp(confirmationResult, code); // throws if wrong
      const profile = { name: pendingLogin?.username || "Farmer", mobile: fbUser.phoneNumber, district: pendingLogin?.district, mandal: pendingLogin?.mandal };
      await saveFarmerProfile(fbUser.uid, profile);
      setUser({ uid: fbUser.uid, ...profile });
      setAuthed(true);
      notify("Logged in successfully");
    } else {
      if (code !== otp) throw new Error("wrong_code");
      setUser({ name: pendingLogin?.username || "Farmer", mobile: pendingLogin?.mobile, district: pendingLogin?.district, mandal: pendingLogin?.mandal });
      setAuthed(true);
      notify("Logged in successfully");
    }
  };

  return (
    <div className={dark ? "dark" : ""} style={{ height: "100%", overflowY: "auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%,-12px);} to { opacity: 1; transform: translate(-50%,0);} }
        @keyframes slideRight { from { transform: translateX(-100%);} to { transform: translateX(0);} }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #4C7A3D55; border-radius: 8px; }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }
      `}</style>
      <Toast toast={toast} />
      {/* Required, always-mounted anchor for Firebase's invisible reCAPTCHA
          when real phone auth is configured. Safe to leave in place even
          when Firebase isn't set up yet — it just sits unused. */}
      <div id="recaptcha-container" />
      {!authed ? (
        <>
          {authScreen === "home" && <HomePage lang={lang} setLang={setLang} dark={dark} setDark={setDark} goTo={setAuthScreen} />}
          {authScreen === "login" && <LoginScreen lang={lang} setLang={setLang} goTo={setAuthScreen} onSendOtp={sendOtp} />}
          {authScreen === "register" && <RegisterScreen lang={lang} setLang={setLang} goTo={setAuthScreen} onSendOtp={sendOtp} />}
          {authScreen === "forgot" && <ForgotScreen lang={lang} setLang={setLang} goTo={setAuthScreen} />}
          {authScreen === "verify" && (
            <VerifyScreen
              lang={lang}
              goTo={setAuthScreen}
              mobile={pendingLogin?.mobile}
              onResend={() => sendOtp(pendingLogin)}
              onSubmitCode={submitOtp}
            />
          )}
        </>
      ) : (
        <AppShell
          lang={lang} setLang={setLang} dark={dark} setDark={setDark}
          user={user} setUser={setUser}
          onLogout={() => { setAuthed(false); setAuthScreen("home"); setPendingLogin(null); setOtp(null); setConfirmationResult(null); notify("Logged out"); }}
        />
      )}
    </div>
  );
}
