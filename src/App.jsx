import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

// ============================================
// FIREBASE
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyBpiRCisXPpLaXLtxEA47WCLka71q4csC4",
  authDomain: "bali-trip-a058c.firebaseapp.com",
  databaseURL: "https://bali-trip-a058c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bali-trip-a058c",
  storageBucket: "bali-trip-a058c.firebasestorage.app",
  messagingSenderId: "4339070083",
  appId: "1:4339070083:web:9f49d4c5d99c9181b297b6"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// ============================================
// DESIGN TOKENS
// ============================================
const C = {
  ember: "#c4633a", moss: "#2d4a2e", gold: "#b8882a",
  rice: "#f7f2e8", night: "#0f1a10", white: "#fdfaf5",
  text: "#1a1208", textSoft: "#5a4a30", textGhost: "#9a8a6a",
  riceDark: "#d4c5a9", riceDeep: "#ede4d0",
};
const SERIF = "'Raleway', system-ui, sans-serif";
const SANS = "'DM Sans', system-ui, sans-serif";
const TRIP_START_ISO = "2026-06-02";
const TRIP_END_ISO = "2026-06-10";

// ============================================
// WEATHER
// ============================================
const WMO = { 0:"☀️",1:"🌤",2:"⛅",3:"☁️",45:"🌫",48:"🌫",51:"🌦",53:"🌦",55:"🌦",61:"🌧",63:"🌧",65:"🌧",80:"🌦",81:"🌦",82:"🌦",95:"⛈",96:"⛈",99:"⛈" };
const WMO_LABEL = { 0:"Sunny",1:"Mostly sunny",2:"Partly cloudy",3:"Overcast",45:"Foggy",51:"Light drizzle",61:"Rain",80:"Showers",95:"Thunderstorm" };
const BALI_AVG = { icon:"⛅", high:30, low:24, rain:40, label:"Partly cloudy · afternoon showers" };

function useWeather() {
  const [wx, setWx] = useState({});
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=-8.34&longitude=115.09&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,weathercode&timezone=Asia%2FMakassar&forecast_days=16")
      .then(r => r.json()).then(d => {
        if (!d.daily) return;
        const m = {};
        d.daily.time.forEach((dt, i) => { m[dt] = { icon: WMO[d.daily.weathercode[i]] || "⛅", label: WMO_LABEL[d.daily.weathercode[i]] || "Partly cloudy", high: Math.round(d.daily.temperature_2m_max[i]), low: Math.round(d.daily.temperature_2m_min[i]), rain: Math.round(d.daily.precipitation_probability_mean[i]) }; });
        setWx(m);
      }).catch(() => {});
  }, []);
  return wx;
}

// Activity icon → color
const ACT_COLORS = {
  "✈️":"#b8882a","🚗":"#b8882a","🛵":"#b8882a","🏍":"#b8882a","🧳":"#b8882a","🧾":"#b8882a",
  "💆":"#9b6dbf","🌸":"#9b6dbf","🧘":"#9b6dbf",
  "🍽":"#c4633a","🥐":"#c4633a",
  "🏊":"#3b82b8","🏖":"#3b82b8","🌅":"#3b82b8","💧":"#3b82b8","🏨":"#5a7a8a",
  "📸":"#d4aa50","🎡":"#d4aa50",
  "💉":"#c0444a","💊":"#c0444a",
  "☀️":"#d4aa50","🌿":"#2d4a2e","🌙":"#2d4a2e",
};

// Tipping guide
const tipping = [
  { venue:"Casual restaurants & warungs", amount:"10,000–20,000 IDR", note:"Round up or leave on table" },
  { venue:"Merah Putih · Sayan House · Potato Head", amount:"50,000–100,000 IDR", note:"10% often included — check bill first" },
  { venue:"Deeva Restaurant (Udaya)", amount:"30,000–50,000 IDR", note:"In-house — discretionary" },
  { venue:"Kaveri Spa therapists", amount:"50,000–100,000 IDR / person", note:"Hand directly to therapist, not reception" },
  { venue:"INKA Spa therapists", amount:"50,000–100,000 IDR / person", note:"Hand directly to therapist" },
  { venue:"Svaha Spa therapists", amount:"30,000–50,000 IDR / person", note:"Hand directly to therapist" },
  { venue:"Full day driver ($60)", amount:"50,000–100,000 IDR", note:"Give at end of day" },
  { venue:"Half day driver ($40)", amount:"30,000–50,000 IDR", note:"Give at end of booking" },
  { venue:"Bluebird / Gojek", amount:"Not required", note:"Metered fare is fair" },
  { venue:"Hotel porter / valet", amount:"10,000–20,000 IDR per bag", note:"" },
];

// ============================================
// DATA
// ============================================
const days = [
  { num: 1, date: "Tue · Jun 2", iso: "2026-06-02", title: "Arrival + PRF Liquid Full Face + Eyes", type: "sem", badge: "Seminyak", anchor: "Land 10:35 · PRF Liquid Full Face + Eyes · Shelter dinner", budgetAUD: 300,
    packingList: ["Passport + e-VOA confirmation ready", "Comfortable travel clothes", "Electrolytes + hydration for flight", "AUD cash to exchange at airport", "Download Bluebird + Gojek before landing"],
    venues: [{ name: "Bodylabs Skin & Wellness", phone: "62361736969", maps: "Bodylabs+Skin+Wellness+Seminyak+Bali" }, { name: "Shelter Restaurant", phone: "62361735368", maps: "Shelter+Restaurant+Seminyak+Bali" }],
    schedule: [
      { time: "10:35", icon: "✈️", act: "Land DPS — Klook pickup · meet at Klook kiosk" },
      { time: "12:00", icon: "🏨", act: "Check in · shower · decompress" },
      { time: "16:30", icon: "💆", act: "Bodylabs — PRF Liquid Full Face + Eyes" },
      { time: "19:00", icon: "🍽", act: "Dinner: Shelter Restaurant — modern Australian-Asian" },
      { time: "21:00", icon: "🌙", act: "Return · 750ml water + electrolytes · sleep" },
    ] },
  { num: 2, date: "Wed · Jun 3", iso: "2026-06-03", title: "Spa Day", type: "sem", badge: "Seminyak", anchor: "Svaha Spa: Ear Candle + Massage + Scrub · Merah Putih dinner", budgetAUD: 210,
    packingList: ["Loose comfortable clothing (post-spa)", "Cash IDR for spa tips (50–100k IDR per therapist)", "Light hydration bottle", "No tight clothing — you'll be in robes most of the day"],
    venues: [{ name: "Svaha Spa Seminyak", phone: "62361738009", maps: "Svaha+Spa+Seminyak+Bali" }, { name: "Merah Putih Restaurant", phone: "62361846 5950", maps: "Merah+Putih+Restaurant+Seminyak" }],
    schedule: [
      { time: "09:00", icon: "☀️", act: "Slow morning at Monolocale · late breakfast · pool" },
      { time: "11:00", icon: "💆", act: "Svaha Spa — Ear Candle + Back Massage + Javanese Body Scrub (~2.5 hrs)" },
      { time: "14:00", icon: "🏊", act: "Hotel · pool · nap" },
      { time: "19:30", icon: "🍽", act: "Dinner: Merah Putih — modern Indonesian" },
    ] },
  { num: 3, date: "Thu · Jun 4", iso: "2026-06-04", title: "Svaha Bamboo + Potato Head Beach Club", type: "sem", badge: "Seminyak", anchor: "Svaha Bamboo · Local browsing · Potato Head Beach Club dinner", budgetAUD: 230,
    packingList: ["Swimwear (Potato Head has amazing pools)", "Reef-safe sunscreen", "Evening outfit for Potato Head dinner", "Bluebird app ready on phone", "Cash IDR for local markets"],
    venues: [{ name: "Svaha Spa Seminyak", phone: "62361738009", maps: "Svaha+Spa+Seminyak+Bali" }, { name: "Potato Head Beach Club", phone: "62361473719", maps: "Potato+Head+Beach+Club+Seminyak" }],
    schedule: [
      { time: "11:00", icon: "💆", act: "Svaha Bamboo Massage — side-by-side (90 min)" },
      { time: "12:30", icon: "🛍", act: "Local browsing / markets · lunch · rest" },
      { time: "16:00", icon: "🏖", act: "Potato Head Beach Club — pools, sunset, stay till late" },
      { time: "19:30", icon: "🍽", act: "Dinner at Potato Head Beach Club" },
    ] },
  { num: 4, date: "Fri · Jun 5", iso: "2026-06-05", title: "Grooming + Ku De Ta Sunset", type: "sem", badge: "Seminyak", anchor: "Bali Barber · Shampoo Lounge · Ku De Ta · dinner there", budgetAUD: 350,
    packingList: ["Camera / phone fully charged", "Comfortable walking shoes for browsing", "Smart-casual evening outfit for Ku De Ta", "Arrive Ku De Ta at 16:00 for golden sunset light"],
    venues: [{ name: "Bali Barber", phone: "6285338333338", maps: "Bali+Barber+Seminyak" }, { name: "Ku De Ta (now Alias)", phone: "62361736969", maps: "Ku+De+Ta+Alias+Seminyak+Bali" }],
    schedule: [
      { time: "10:00", icon: "✂️", act: "Bali Barber + Shampoo Lounge — 4–5 hrs total" },
      { time: "16:00", icon: "🌅", act: "Ku De Ta (now Alias) — beachfront, pools, sunset" },
      { time: "19:30", icon: "🍽", act: "Dinner at Ku De Ta" },
    ] },
  { num: 5, date: "Sat · Jun 6", iso: "2026-06-06", title: "Transfer to Ubud + Kaveri", type: "trn", badge: "Transfer", anchor: "Seminyak → Ubud · Jungle Pool Suite · Kaveri 4 Hands", budgetAUD: 270,
    packingList: ["All luggage packed + ready by 09:00", "Swimwear accessible (Kaveri spa on arrival)", "Snacks + water for 90-min mountain transfer", "Say goodbye to Seminyak + Monolocale"],
    venues: [{ name: "The Udaya Resort & Spa", phone: "62361975668", maps: "The+Udaya+Resort+Ubud+Bali" }, { name: "Kaveri Spa", phone: "62361975668", maps: "Kaveri+Spa+Udaya+Ubud" }],
    schedule: [
      { time: "09:00", icon: "☕️", act: "Slow last breakfast at Monolocale" },
      { time: "09:30", icon: "🚗", act: "Checkout · depart Seminyak → Ubud (~90 min)" },
      { time: "11:00", icon: "🌿", act: "Arrive The Udaya · Jungle Pool Suite walkthrough" },
      { time: "13:30", icon: "💆", act: "Kaveri Spa — 4 Hands Massage (60 min) + Scrub + Botanical Bath (2 hrs)" },
      { time: "19:00", icon: "🍽", act: "Room service or Deeva Restaurant in-suite" },
    ] },
  { num: 6, date: "Sun · Jun 7", iso: "2026-06-07", title: "Tis Cafe + Ulu Petanu Waterfall", type: "ubu", badge: "Ubud", anchor: "Tis Cafe 08:30 · Ulu Petanu Waterfall · relax afternoon · Deeva dinner", budgetAUD: 175,
    summary: "3 locations · 5.25 hrs active · 6 hrs rest · ~600k IDR / couple",
    venues: [{ name: "Tis Cafe", phone: "628214733966", maps: "Tis+Cafe+Ubud+Bali" }, { name: "Ulu Petanu Waterfall", maps: "Ulu+Petanu+Waterfall+Ubud+Bali" }, { name: "Deeva Restaurant (Udaya)", phone: "62361975668", maps: "Deeva+Restaurant+Udaya+Ubud" }],
    costs: [
      { item: "Standard Pool Daybed (Tis Cafe)", note: "150k IDR / person · book ahead" },
      { item: "Bali Swing (Tis Cafe)", note: "Included in daybed" },
      { item: "Flying Dress Rental (optional)", note: "250k IDR / person · paid on-site" },
      { item: "Ulu Petanu Waterfall Entry", note: "~50k IDR / person" },
    ],
    packingList: [
      "Swimsuit on underneath your clothes",
      "Dry change of clothes (for waterfall changing rooms)",
      "Reef-safe sunscreen",
      "Light cover-up or shirt",
      "Waterproof phone case / underwater camera",
      "Light cash IDR (entry + swing + optional dress rental)",
    ],
    photoMoments: [
      { time: "08:30", desc: "Bamboo bridges, hanging nests + viewing decks — dry, morning light, zero crowds" },
      { time: "10:30", desc: "Bali Swing over the valley — queue gone, lighting still golden" },
      { time: "11:45–12:30", desc: "Ulu Petanu Waterfall — gorge shadows, dramatic natural framing" },
    ],
    tips: [
      "Arrive at 08:25 (not 08:30) — swing queue forms by 10:45",
      "Do the photo circuit first while you are completely dry and looking fresh",
      "Waterfall gorge acts like natural A/C — arrive at midday for peak shade + cool",
      "Use on-site changing rooms at waterfall before the 27-min drive back",
      "Driver logistics (wait or return): leave it to them",
    ],
    schedule: [
      { time: "08:10", icon: "🏨", act: "Depart Udaya — swimsuits on under clothes, dry change in bag" },
      { time: "08:30", icon: "📸", act: "Arrive Tis Cafe — photo circuit first: bamboo bridges, hanging nests, viewing decks (while dry + fresh)" },
      { time: "09:00", icon: "🏊", act: "Settle into pool daybed — soak up the views, enjoy the sun" },
      { time: "10:30", icon: "🎡", act: "Bali Swing over the valley — queue empty, lighting perfect · optional flying dress rental on-site" },
      { time: "11:15", icon: "🧾", act: "Settle bill, dry off, meet driver" },
      { time: "11:30", icon: "🚗", act: "14-min A/C drive to Ulu Petanu Waterfall" },
      { time: "11:45", icon: "💧", act: "Ulu Petanu Waterfall — 90 steps down past koi pond · wade in sandy shallow pool inside deep jungle gorge" },
      { time: "13:00", icon: "👗", act: "On-site changing rooms — slip into dry clothes before the drive back" },
      { time: "13:15", icon: "🚗", act: "27-min drive back to The Udaya" },
      { time: "13:45", icon: "🌿", act: "Back at Udaya — long shower, private pool, rest · light lunch if needed" },
      { time: "19:30", icon: "🍽", act: "Deeva Restaurant — in-house dinner" },
    ] },
  { num: 7, date: "Mon · Jun 8", iso: "2026-06-08", title: "Gorilla Adventures ATV + INKA + Sayan House (Meena & Vishal)", type: "ubu", badge: "Ubud", anchor: "Gorilla ATV 08:30 · INKA 14:00 · Sayan House 19:00 · friends joining", budgetAUD: 390,
    packingList: ["Old activewear / clothes you don't mind getting muddy (ATV)", "Change of clothes + smart-casual for Sayan House (friends dinner)", "Swimwear for Udaya pool buffer", "Cash IDR for Gorilla (1.2M for quad bike) + lunch if eating independently"],
    venues: [{ name: "Gorilla Adventures ATV", phone: "628786225655", maps: "Gorilla+Adventures+ATV+Ubud+Bali" }, { name: "INKA Spa", phone: "6281353966547", maps: "INKA+Spa+Monkey+Forest+Ubud" }, { name: "The Sayan House", phone: "62361978769", maps: "The+Sayan+House+Ubud+Bali" }],
    schedule: [
      { time: "08:30", icon: "🏍", act: "Gorilla Adventures — 450CC Tandem Quad Bike (90 min) · 1.2M IDR" },
      { time: "10:00", icon: "🚿", act: "Return Udaya · shower · freshen up" },
      { time: "10:30", icon: "🏊", act: "Udaya pool + free time · lunch independently if needed" },
      { time: "13:45", icon: "🚗", act: "Private driver → INKA Spa, Jl. Monkey Forest (12 min)" },
      { time: "14:00", icon: "💆", act: "INKA Ultra Calm Facial + Mani/Pedi — advise therapist: no deep extraction, gentle pressure only" },
      { time: "15:30", icon: "🚗", act: "Private driver → The Sayan House (gorge views, 15 min)" },
      { time: "16:30", icon: "🌿", act: "Arrive Sayan House early · explore · settle in · sunset views" },
      { time: "19:00", icon: "🍽", act: "Dinner: The Sayan House — Japanese-Latin fusion · Meena & Vishal joining!" },
    ] },
  { num: 8, date: "Tue · Jun 9", iso: "2026-06-09", title: "Relax & Make Memories", type: "ubu", badge: "Ubud ✦", anchor: "Yoga 7:30 · Breakfast in room · IV Drip BSI · Kaveri Signature · ✦ Evening", budgetAUD: 410,
    packingList: ["Yoga clothes (07:30 session)", "Comfortable clothes for BSI IV Drip trip", "Cash IDR for BSI + tips", "Kaveri Signature booking confirmation"],
    venues: [{ name: "Kaveri Spa (Kaveri Signature)", phone: "62361975668", maps: "Kaveri+Spa+Udaya+Ubud" }, { name: "BSI Clinic Ubud", maps: "BSI+Clinic+Ubud+Bali" }],
    schedule: [
      { time: "07:30", icon: "🧘", act: "Yoga Session (07:30 – 08:30) at The Udaya" },
      { time: "08:30", icon: "🥐", act: "Breakfast in room at Udaya" },
      { time: "10:00", icon: "💉", act: "IV Drip at BSI — need to drive · Order Bluebird or Gojek" },
      { time: "13:30", icon: "🌸", act: "Kaveri Signature Couples — Royal Massage + Flower bath (2.5 hrs)" },
      { time: "16:00", icon: "🛁", act: "Return to Jungle Pool Suite · dress slowly together" },
      { time: "19:30", icon: "✦", act: "Dinner and relax at Udaya — the dinner of the trip" },
    ] },
  { num: 9, date: "Wed · Jun 10", iso: "2026-06-10", title: "Gentle Farewell", type: "ubu", badge: "Departure", anchor: "Final pool morning · fly home to Melbourne", budgetAUD: 85,
    packingList: ["All luggage packed (checkout before 07:00)", "Download boarding passes the night before", "Klook transfer booked · depart 7:00 AM from Udaya", "Leave tips for Udaya staff + thank housekeeping"],
    schedule: [
      { time: "08:30", icon: "☕️", act: "Slow breakfast at Deeva or in bed" },
      { time: "09:30", icon: "🏊", act: "Final float in Jungle Pool Suite private pool" },
      { time: "10:30", icon: "🧳", act: "Pack · checkout" },
      { time: "07:00", icon: "🚗", act: "Udaya → DPS Airport via Klook (BOOKED · ~90 min)" },
      { time: "PM", icon: "✈️", act: "Fly home · Selamat jalan ✦" },
    ] },
];

const dining = [
  { day: 1, name: "Shelter Restaurant", type: "Modern Australian-Asian · calm", cost: "~$60–80", costMid: 70 },
  { day: 2, name: "Merah Putih", type: "Modern Indonesian · refined", cost: "~$80–120", costMid: 100 },
  { day: 3, name: "Potato Head Beach Club", type: "Pools + sunset + late dinner", cost: "~$80–120", costMid: 100 },
  { day: 4, name: "Ku De Ta (now Alias)", type: "Beachfront · sunset · premium dinner", cost: "~$100–150", costMid: 125 },
  { day: 5, name: "Deeva (in-suite)", type: "The Udaya · room service · recovery", cost: "Included", costMid: 0 },
  { day: 7, name: "The Sayan House", type: "Japanese-Latin fusion · gorge sunset", cost: "~$90–100", costMid: 95 },
  { day: 8, name: "Evening at the Udaya", type: "In-suite · the dinner of the trip ✦", cost: "✦ Arranged", costMid: 200 },
];

const spas = [
  { day: "Jun 2", date: "Tue · Jun 2", name: "PRF Liquid Full Face + Eyes", loc: "Bodylabs, Seminyak", dur: "~90 min", mins: 90 },
  { day: "Jun 3", date: "Wed · Jun 3", name: "Ear Candle + Back Massage + Body Scrub", loc: "Svaha Spa, Seminyak", dur: "~2.5 hrs", mins: 150 },
  { day: "Jun 4", date: "Thu · Jun 4", name: "Svaha Bamboo Massage", loc: "Svaha Spa, Seminyak", dur: "90 min", mins: 90 },
  { day: "Jun 5", date: "Fri · Jun 5", name: "Bali Barber + Shampoo Lounge", loc: "Bali Barber / Shampoo Lounge", dur: "4–5 hrs", mins: 270 },
  { day: "Jun 6", date: "Sat · Jun 6", name: "4 Hands Massage + Scrub + Botanical Bath", loc: "Kaveri Spa, The Udaya", dur: "2 hrs", mins: 120 },
  { day: "Jun 8", date: "Mon · Jun 8", name: "INKA Ultra Calm Facial + Mani/Pedi", loc: "INKA Spa, Jl. Monkey Forest", dur: "~2 hrs", mins: 120 },
  { day: "Jun 9", date: "Tue · Jun 9", name: "Yoga Session", loc: "The Udaya", dur: "60 min", mins: 60 },
  { day: "Jun 9", date: "Tue · Jun 9", name: "Kaveri Signature · Flowers", loc: "Kaveri Spa, The Udaya", dur: "2.5 hrs", mins: 150 },
];

const bookings = [
  { section: "Flights & Accommodation" },
  { title: "Uber: Home → MEL Airport — BOOKED ✓", sub: "Pickup 3:00 AM Jun 2 · arrive by 4:30 AM · Flight 6:35 AM", tag: "done" },
  { title: "Book flights MEL → DPS → MEL", sub: "Land DPS ~10:35 on Jun 2. Return Jun 10 PM.", tag: "urgent" },
  { title: "Confirm Monolocale Resort & Spa — Jun 2–6", sub: "Seminyak · 4 nights", tag: "urgent" },
  { title: "Confirm The Udaya — Jun 6–10", sub: "Jungle Pool Suite · 4 nights · daily fruit basket", tag: "urgent" },
  { title: "Book airport pickup via Klook — Jun 2", sub: "Meet at Klook kiosk at DPS · no Grab at airport", tag: "urgent" },
  { section: "Treatments & Spa" },
  { title: "Book Bodylabs — Jun 2, 16:30", sub: "PRF Liquid Full Face + Eyes · Seminyak", tag: "urgent" },
  { title: "Book Svaha Spa — Jun 3, 11:00", sub: "Ear Candle + Back Massage + Javanese Body Scrub (~2.5 hrs)", tag: "urgent" },
  { title: "Book Svaha Bamboo Massage — Jun 4, 11:00", sub: "Svaha Spa · individual side-by-side (90 min)", tag: "urgent" },
  { title: "WhatsApp Bali Barber — Jun 5, 10:00", sub: "President's Package · +62 853 3833 3338", tag: "urgent" },
  { title: "Book Shampoo Lounge — Jun 5, 10:00", sub: "Full Hair + Spa Package", tag: "urgent" },
  { title: "Book Kaveri 4 Hands Couples — Jun 6, 13:30", sub: "The Udaya · 60 min 4 Hands + Scrub + Botanical Bath", tag: "urgent" },
  { title: "Book INKA Spa — Jun 8, 14:00", sub: "Ultra Calm Facial + Mani/Pedi · clearly advise: no deep extraction, gentle pressure only · +62 813 5396 6547", tag: "urgent" },
  { title: "Book Yoga Session — Jun 9, 07:30", sub: "The Udaya · 60 min · book with concierge", tag: "urgent" },
  { title: "Book IV Drip at BSI — Jun 9, 10:00", sub: "Need to drive · Order Bluebird or Gojek to get there", tag: "urgent" },
  { title: "Book Kaveri Signature Couples — Jun 9, 13:30", sub: "Royal Massage + Flowers · 2.5 hrs", tag: "urgent" },
  { section: "Dining Reservations" },
  { title: "Book Shelter — Jun 2, 19:00", sub: "Seminyak · 2 people", tag: "soon" },
  { title: "Book Merah Putih — Jun 3, 19:30", sub: "Seminyak · modern Indonesian · pre-book", tag: "soon" },
  { title: "Book Potato Head Beach Club dinner — Jun 4, 19:30", sub: "Arrive 16:00 for sunset", tag: "urgent" },
  { title: "Book Ku De Ta (now Alias) — Jun 5, 19:30", sub: "Seminyak · rebranded to Alias · verify booking name · arrive 16:00 for sunset", tag: "urgent" },
  { title: "Book Sayan House — Jun 8, 19:00", sub: "No beef/pork/lamb · arrive 18:30 for sunset", tag: "soon" },
  { section: "Activities" },
  { title: "Book Gorilla Adventures ATV — Jun 8, 08:30", sub: "450CC Tandem Quad Bike · 1.2M IDR · book night before", tag: "urgent" },
  { title: "Book Tis Cafe — Jun 7, 08:30", sub: "Standard Pool Daybed (150k IDR/person) · Bali Swing incl · book ahead", tag: "soon" },
  { title: "Potato Head Beach Club — Jun 4", sub: "Arrive 16:00 · stay till late · dinner there", tag: "anytime" },
  { title: "Ku De Ta — Jun 5", sub: "Dinner 19:30 · arrive earlier for sunset", tag: "anytime" },
  { section: "Concierge (Udaya)" },
  { title: "Breakfast at Udaya — Jun 9, 07:00", sub: "Breakfast · confirmed", tag: "anytime" },
  { title: "Brief concierge — Jun 9 evening", sub: "Suite ready 16:00", tag: "urgent" },
  { section: "Pharmacy — Buy in Australia 🇦🇺" },
  { title: "Travelan (Bali Belly defence)", sub: "1 tablet 30 min before each meal · daily from 2 days pre-landing · NOT sold in Bali", tag: "pharmacy" },
  { title: "DEET 30%+ backup", sub: "For high-mozzie zones · jungle + evening outdoor dining · local Bali brands too weak", tag: "pharmacy" },
  { title: "Sunscreen SPF 50+ (face + body)", sub: "Reef-safe · reapply every 2 hrs · more expensive in Bali", tag: "pharmacy" },
  { title: "Blister plasters (Compeed)", sub: "For walking + day trips · brand not reliably available in Bali", tag: "pharmacy" },
  { title: "Prescription meds from GP", sub: "Flagyl/Metronidazole + any scripts · original packaging + doctor's letter", tag: "pharmacy" },
  { section: "Pharmacy — Buy in Bali 🏝️" },
  { title: "Loperamide (Lodia) + Oralit ORS sachets", sub: "Bali belly kit · Lodia ~IDR 25k · Oralit ~IDR 2–3k/sachet · at any apotek", tag: "pharmacy" },
  { title: "Electrolyte sachets (Oralit / Pocari Sweat)", sub: "Drink nightly · IDR 3–8k per sachet · at Indomaret, Alfamart, apotek", tag: "pharmacy" },
  { title: "Picaridin insect repellent — Autan / Soffell", sub: "Gentler than DEET · apply dawn/dusk · IDR 35–55k at Guardian or Kimia Farma", tag: "pharmacy" },
  { title: "Antihistamines (Cetirizine or Loratadine)", sub: "Ask by generic name at any apotek · strip of 10 ~IDR 5–15k", tag: "pharmacy" },
  { title: "Paracetamol (Panadol/Sanmol) + Ibuprofen (Brufen)", sub: "Heat headaches, muscle soreness · combined ~IDR 15–30k · apotek or minimart", tag: "pharmacy" },
  { title: "Band-aids (Plester) + Betadine antiseptic", sub: "Scooter scratches, waterfall rocks · Betadine 30mL ~IDR 25–35k · everywhere", tag: "pharmacy" },
  { title: "Antimo (travel sickness / dimenhydrinate)", sub: "Windy mountain roads Seminyak → Ubud · IDR 8–15k · even at Indomaret", tag: "pharmacy" },
  { section: "Travel Admin" },
  { title: "Apply for e-VOA", sub: "14–30 days before · molina.imigrasi.go.id · IDR 500k/person · window open NOW", tag: "urgent" },
  { title: "Submit Indonesia Arrival Card (e-CD)", sub: "Within 72 hrs before landing · allindonesia.imigrasi.go.id", tag: "urgent" },
  { title: "Bali Tourist Levy — PAID ✓", sub: "IDR 150k/person · keep QR code receipt on phone", tag: "done" },
  { title: "eSIM — DONE ✓", sub: "Purchased · wife to install before departure", tag: "done" },
  { title: "Set up travel debit card (Wise or Macquarie)", sub: "Order 2 weeks before flying", tag: "urgent" },
  { title: "Carry IDR cash", sub: "IDR 2–3M for tips, warungs, taxis", tag: "soon" },
  { section: "Pre-Departure" },
  { title: "Download Bluebird app", sub: "Set up AUD card · essential for Seminyak", tag: "anytime" },
  { title: "Download Gojek app", sub: "For Ubud rides", tag: "anytime" },
  { title: "Pre-download Bali offline maps", sub: "Seminyak + Ubud areas", tag: "anytime" },
  { title: "Notify bank of Bali travel dates", sub: "Avoid card blocks", tag: "anytime" },
];

const driverPlan = [
  { section: "Pre-Trip (Australia)" },
  { day: "Jun 2", title: "Uber: Home → MEL Airport (BOOKED)", sub: "Pickup 3:00 AM Jun 2 · arrive airport by 4:30 AM · Flight 6:35 AM", type: "confirmed", status: "done", costMid: 60 },
  { section: "Seminyak" },
  { day: "Jun 2", title: "Airport pickup DPS → Monolocale", sub: "Pre-arranged via Klook · Meet at Klook kiosk", type: "confirmed", status: "done", costMid: 42 },
  { day: "Jun 3", title: "No driver needed", sub: "Svaha Spa near Monolocale · Bluebird for Merah Putih dinner", type: "none", status: "na", costMid: 0 },
  { day: "Jun 4", title: "Bluebird · Svaha + Potato Head", sub: "No driver · order Bluebird for both rides · ~$15–20", type: "bluebird", status: "na", costMid: 17 },
  { day: "Jun 5", title: "Short rides only (Bluebird)", sub: "Grooming + Ku De Ta (dinner there) · ~$25–35", type: "bluebird", status: "na", costMid: 30 },
  { section: "Transfer" },
  { day: "Jun 6", title: "Full day: Seminyak → Ubud", sub: "Concierge pre-arranged transfer · confirmed · ~$60–65", type: "confirmed", status: "done", costMid: 62 },
  { section: "Ubud" },
  { day: "Jun 7", title: "Half day driver", sub: "Tis Cafe 08:10 → Waterfall 11:30 → Udaya 13:45 · Deeva pickup 19:30 · $40 flat", type: "book", status: "todo", costMid: 40 },
  { day: "Jun 8", title: "Full day driver (KEEP)", sub: "Gorilla ATV 08:30 → Udaya rest → INKA 13:45 pickup → Sayan House 15:30 · full day · $60 flat", type: "confirmed", status: "done", costMid: 60 },
  { day: "Jun 9", title: "Short ride to BSI for IV Drip", sub: "Order Bluebird or Gojek · ~10:00 AM · Kaveri at Udaya · $0 driver needed rest of day", type: "bluebird", status: "na", costMid: 0 },
  { section: "Departure" },
  { day: "Jun 10", title: "Airport transfer Udaya → DPS (BOOKED)", sub: "Via Klook · 7:00 AM departure · ~90 min · early checkout", type: "confirmed", status: "done", costMid: 60 },
];

const typeColor = { sem: C.ember, ubu: C.moss, trn: C.gold };
const typeBg = { sem: "rgba(196,99,58,0.1)", ubu: "rgba(45,74,46,0.1)", trn: "rgba(184,136,42,0.1)" };
const tagConfig = {
  urgent: { bg: "rgba(196,99,58,0.12)", color: C.ember, label: "Book" },
  soon: { bg: "rgba(184,136,42,0.12)", color: C.gold, label: "Soon" },
  anytime: { bg: "rgba(45,74,46,0.1)", color: C.moss, label: "Todo" },
  pharmacy: { bg: "rgba(122,170,124,0.15)", color: "#4a7a4c", label: "Pharm" },
};
const driverTypeConfig = {
  book: { bg: "rgba(196,99,58,0.12)", color: C.ember, label: "Book" },
  confirmed: { bg: "rgba(45,74,46,0.12)", color: C.moss, label: "Confirmed" },
  bluebird: { bg: "rgba(184,136,42,0.12)", color: C.gold, label: "Taxi" },
  none: { bg: C.riceDeep, color: C.textGhost, label: "None" },
};
const tabs = [
  { id: "journey", label: "Days" },
  { id: "dining", label: "Dining" },
  { id: "spa", label: "Spa" },
  { id: "checklist", label: "Tasks" },
  { id: "drivers", label: "Cars" },
];

// ============================================
// HELPERS
// ============================================
function todayIso() { return new Date().toISOString().slice(0, 10); }
function getTripStatus() {
  const t = todayIso();
  if (t < TRIP_START_ISO) {
    const ms = new Date(TRIP_START_ISO).getTime() - new Date(t).getTime();
    const dd = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return { phase: "pre", label: dd === 1 ? "1 day to go" : `${dd} days to go` };
  }
  if (t > TRIP_END_ISO) return { phase: "post", label: "Trip complete ✦" };
  const startMs = new Date(TRIP_START_ISO).getTime();
  const todayMs = new Date(t).getTime();
  const dayNum = Math.floor((todayMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
  return { phase: "during", label: `Day ${dayNum} of 9` };
}

// Live ticking clock — used for countdowns and overdue checks
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function getCountdown(now) {
  const todayStr = now.toISOString().slice(0, 10);
  // Flight departs Melbourne 6:35am Jun 2 (AEST = UTC+10)
  const startMs = new Date(TRIP_START_ISO + "T06:35:00+10:00").getTime();
  if (todayStr < TRIP_START_ISO) {
    const diff = startMs - now.getTime();
    return {
      phase: "pre",
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
    };
  }
  if (todayStr > TRIP_END_ISO) return { phase: "post" };
  const dayNum = Math.floor((new Date(todayStr).getTime() - new Date(TRIP_START_ISO).getTime()) / 86400000) + 1;
  const todayObj = days.find(d => d.iso === todayStr);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const next = todayObj ? todayObj.schedule.find(s => {
    const p = (s.time || "").split(":");
    if (p.length !== 2) return false;
    const m = parseInt(p[0]) * 60 + parseInt(p[1]);
    return !isNaN(m) && m > nowMins;
  }) : null;
  return { phase: "during", dayNum, location: todayObj?.badge, next };
}

// Parse "Jun 2, 16:30" / "Jun 9" patterns from titles & subs
const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
function parseDateInText(text, year = 2026) {
  if (!text) return null;
  const m = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:[,\s]+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const month = MONTHS[m[1]];
  if (month === undefined) return null;
  const day = parseInt(m[2]);
  const hour = m[3] ? parseInt(m[3]) : null;
  const min = m[4] ? parseInt(m[4]) : null;
  return {
    monthName: m[1], day, hour, min,
    hasTime: hour !== null,
    iso: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    // Bali is UTC+8 — express the event in UTC
    utc: hour !== null ? new Date(Date.UTC(year, month, day, hour - 8, min || 0)) : new Date(Date.UTC(year, month, day, 0, 0)),
  };
}

function parsePhone(text) {
  if (!text) return null;
  const m = text.match(/\+?62[\d\s-]{7,15}/);
  if (!m) return null;
  return m[0].replace(/[\s\-+]/g, "");
}

// Build an .ics file string for a single event
function pad2(n) { return String(n).padStart(2, "0"); }
function toIcsUtc(d) {
  return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}00Z`;
}
function buildIcs({ uid, title, description, location, startUtc, durationMins = 90 }) {
  const endUtc = new Date(startUtc.getTime() + durationMins * 60000);
  const clean = (s) => (s || "").replace(/[\r\n,;]/g, " ").slice(0, 200);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bali Trip//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}@bali-trip.app`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(startUtc)}`,
    `DTEND:${toIcsUtc(endUtc)}`,
    `SUMMARY:${clean(title)}`,
    description ? `DESCRIPTION:${clean(description)}` : "",
    location ? `LOCATION:${clean(location)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}
function downloadIcs(filename, content) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// Live AUD↔IDR rate
function useCurrencyRate() {
  const [rate, setRate] = useState(12500);
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/aud.json")
      .then(r => r.json())
      .then(d => { if (d?.aud?.idr) setRate(d.aud.idr); })
      .catch(() => {});
  }, []);
  return rate;
}

// Task filter config — for Tasks tab pills
const TASK_FILTERS = [
  { id: "all", label: "All" },
  { id: "todo", label: "To-do" },
  { id: "urgent", label: "Book", tag: "urgent" },
  { id: "soon", label: "Soon", tag: "soon" },
  { id: "pharm-au", label: "Pharm AU", section: "Pharmacy — Buy in Australia 🇦🇺" },
  { id: "pharm-bali", label: "Pharm Bali", section: "Pharmacy — Buy in Bali 🏝️" },
];

// ============================================
// UI ATOMS
// ============================================
function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "20px 0 14px", opacity: 0.6 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.riceDark}, transparent)` }} />
      <svg width="38" height="14" viewBox="0 0 38 14" style={{ margin: "0 10px" }}>
        <path d="M2 7 Q 8 2, 14 7 T 26 7 T 36 7" stroke={C.gold} strokeWidth="1.2" fill="none" />
        <circle cx="19" cy="7" r="1.8" fill={C.gold} />
      </svg>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.riceDark}, transparent)` }} />
    </div>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  const pieces = Array.from({ length: 30 });
  const colors = [C.ember, C.gold, C.moss, "#d9845e", "#d4aa50"];
  return (
    <>
      <style>{`@keyframes fall { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(400px) rotate(540deg); opacity: 0; } }`}</style>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {pieces.map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 1.5;
          const dur = 2 + Math.random() * 1.5;
          const color = colors[i % colors.length];
          const size = 6 + Math.random() * 5;
          return <div key={i} style={{ position: "absolute", left: `${left}%`, top: 0, width: size, height: size, background: color, borderRadius: i % 3 === 0 ? "50%" : 2, animation: `fall ${dur}s ${delay}s ease-in forwards` }} />;
        })}
      </div>
    </>
  );
}

function SyncIndicator({ status }) {
  const map = {
    syncing: { color: C.gold, label: "Syncing…", dot: true },
    synced: { color: C.moss, label: "Synced", dot: false },
    offline: { color: "#4a7a4c", label: "✓ Working offline · cached", dot: false },
    error: { color: C.ember, label: "Sync error · retrying", dot: true },
  };
  const cfg = map[status] || map.synced;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: cfg.color, fontFamily: SANS, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.color, animation: cfg.dot ? "pulse 1s infinite" : "none" }} />
      <span>{cfg.label}</span>
      <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}

function NotesSection({ notes, setNotes }) {
  return (
    <div style={{ background: C.white, border: `2px solid ${C.gold}`, borderRadius: 12, padding: "14px 14px", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>📝</span>
        <span style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: C.gold, fontWeight: 700, fontFamily: SANS }}>Notes</span>
      </div>
      <textarea
        value={notes || ""}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Tap here to add notes…"
        style={{ width: "100%", minHeight: 100, border: `1px solid ${C.riceDeep}`, borderRadius: 8, padding: "12px 14px", fontSize: 15, fontFamily: SANS, color: "#0f0a06", background: C.rice, resize: "vertical", outline: "none", lineHeight: 1.6, boxSizing: "border-box", display: "block" }}
      />
    </div>
  );
}

function SectionHead({ label }) {
  return (
    <div style={{ padding: "16px 4px 8px", fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: C.textGhost, fontWeight: 600, marginTop: 8, fontFamily: SANS, display: "flex", alignItems: "center", gap: 10 }}>
      <span>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.riceDark}, transparent)` }} />
    </div>
  );
}

// ============================================
// NEW: COUNTDOWN BANNER (header)
// ============================================
function CountdownBanner() {
  const now = useNow(30000);
  const cd = getCountdown(now);

  if (cd.phase === "post") {
    return (
      <div style={{ marginTop: 14, display: "inline-block", padding: "5px 14px", background: "rgba(184,136,42,0.18)", border: "1px solid rgba(212,170,80,0.4)", borderRadius: 20, fontSize: 11, letterSpacing: "0.12em", color: "#d4aa50", textTransform: "uppercase", fontFamily: SANS, fontWeight: 600 }}>
        Trip complete ✦
      </div>
    );
  }

  if (cd.phase === "pre") {
    return (
      <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 12, padding: "9px 20px", background: "rgba(184,136,42,0.18)", border: "1px solid rgba(212,170,80,0.4)", borderRadius: 22, fontFamily: SANS }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 24, fontFamily: SERIF, color: "#d4aa50", fontWeight: 700, lineHeight: 1 }}>{cd.days}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(212,170,80,0.8)", textTransform: "uppercase" }}>d</span>
        </div>
        <span style={{ width: 1, height: 18, background: "rgba(212,170,80,0.3)" }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 18, fontFamily: SERIF, color: "#d4aa50", fontWeight: 700, lineHeight: 1 }}>{cd.hours}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(212,170,80,0.8)", textTransform: "uppercase" }}>h</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 18, fontFamily: SERIF, color: "rgba(212,170,80,0.75)", fontWeight: 600, lineHeight: 1 }}>{cd.mins}</span>
          <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(212,170,80,0.6)", textTransform: "uppercase" }}>m</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 14, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "9px 20px", background: "rgba(184,136,42,0.18)", border: "1px solid rgba(212,170,80,0.4)", borderRadius: 22, fontFamily: SANS, maxWidth: 340 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.18em", color: "#d4aa50", textTransform: "uppercase", fontWeight: 700 }}>Day {cd.dayNum} of 9</span>
        {cd.location && <><span style={{ color: "rgba(212,170,80,0.4)" }}>·</span><span style={{ fontSize: 11, letterSpacing: "0.1em", color: "#d4aa50", textTransform: "uppercase", fontWeight: 600 }}>{cd.location}</span></>}
      </div>
      {cd.next && (
        <div style={{ fontSize: 11, color: "rgba(212,170,80,0.9)", textAlign: "center", fontFamily: SANS, marginTop: 2, lineHeight: 1.4 }}>
          Up next: <span style={{ fontWeight: 700 }}>{cd.next.time}</span> · {cd.next.icon} {cd.next.act.length > 38 ? cd.next.act.slice(0, 38) + "…" : cd.next.act}
        </div>
      )}
    </div>
  );
}

// ============================================
// NEW: PROGRESS RING (Tasks tab)
// ============================================
function ProgressRing({ value, max, label, color }) {
  const pct = max > 0 ? value / max : 0;
  const size = 96, stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - pct * c;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.riceDeep} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{value}<span style={{ color: C.textGhost, fontSize: 14, fontWeight: 500 }}>/{max}</span></div>
        <div style={{ fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textGhost, fontFamily: SANS, marginTop: 4, fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  );
}

// ============================================
// NEW: FILTER PILLS (Tasks tab)
// ============================================
function FilterPills({ filters, active, setActive }) {
  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12, paddingBottom: 4, scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
      {filters.map(f => {
        const on = active === f.id;
        return (
          <button key={f.id} onClick={() => setActive(f.id)} style={{ flexShrink: 0, padding: "6px 13px", border: `1px solid ${on ? C.ember : C.riceDark}`, borderRadius: 16, background: on ? C.ember : C.white, color: on ? C.white : C.textSoft, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: SANS, transition: "all 0.15s", whiteSpace: "nowrap" }}>
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================
// NEW: CURRENCY WIDGET (floating)
// ============================================
function CurrencyWidget() {
  const rate = useCurrencyRate();
  const [open, setOpen] = useState(false);
  const [aud, setAud] = useState("1");
  const [idr, setIdr] = useState("");

  useEffect(() => {
    const n = parseFloat(aud.replace(/,/g, ""));
    if (!isNaN(n)) setIdr(Math.round(n * rate).toLocaleString("en-AU"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate]);

  const onAud = (v) => {
    setAud(v);
    const n = parseFloat(v.replace(/,/g, ""));
    if (!isNaN(n)) setIdr(Math.round(n * rate).toLocaleString("en-AU"));
    else setIdr("");
  };
  const onIdr = (v) => {
    setIdr(v);
    const n = parseFloat(v.replace(/[^\d.]/g, ""));
    if (!isNaN(n)) setAud((n / rate).toFixed(2));
    else setAud("");
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Open currency converter" style={{ position: "fixed", bottom: 18, right: 18, width: 54, height: 54, borderRadius: 27, background: C.gold, color: C.white, border: "none", boxShadow: "0 4px 18px rgba(0,0,0,0.25)", cursor: "pointer", fontSize: 16, fontWeight: 800, zIndex: 50, fontFamily: SANS }}>
        $↔
      </button>
    );
  }
  return (
    <div style={{ position: "fixed", bottom: 18, right: 18, background: C.white, border: `2px solid ${C.gold}`, borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 50, width: 240, fontFamily: SANS }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.gold, fontWeight: 700 }}>Currency</span>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", fontSize: 20, color: C.textGhost, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.rice, border: `1px solid ${C.riceDeep}`, borderRadius: 8, padding: "7px 10px" }}>
          <span style={{ fontSize: 11, color: C.textGhost, fontWeight: 700, width: 30 }}>AUD</span>
          <input value={aud} onChange={e => onAud(e.target.value)} inputMode="decimal" style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontSize: 15, fontFamily: SANS, fontWeight: 600, color: C.text }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.rice, border: `1px solid ${C.riceDeep}`, borderRadius: 8, padding: "7px 10px" }}>
          <span style={{ fontSize: 11, color: C.textGhost, fontWeight: 700, width: 30 }}>IDR</span>
          <input value={idr} onChange={e => onIdr(e.target.value)} inputMode="numeric" style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontSize: 15, fontFamily: SANS, fontWeight: 600, color: C.text }} />
        </div>
      </div>
      <div style={{ fontSize: 10, color: C.textGhost, marginTop: 8, textAlign: "center" }}>1 AUD ≈ {Math.round(rate).toLocaleString("en-AU")} IDR</div>
    </div>
  );
}

// ============================================
// NEW: ACTUAL PAID INPUT (Dining / Cars)
// ============================================
function ActualPaidInput({ k, expected, actuals, setActuals }) {
  const val = actuals && actuals[k] != null ? String(actuals[k]) : "";
  const onChange = (v) => {
    const clean = v.replace(/[^\d.]/g, "");
    setActuals(prev => {
      const next = { ...(prev || {}) };
      if (clean === "") delete next[k];
      else next[k] = parseFloat(clean) || 0;
      return next;
    });
  };
  return (
    <div onClick={e => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 5, background: C.rice, border: `1px solid ${val ? C.moss : C.riceDeep}`, borderRadius: 6, padding: "3px 7px", marginTop: 4 }}>
      <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS }}>Paid</span>
      <span style={{ fontSize: 11, color: C.textSoft, fontFamily: SANS, fontWeight: 700 }}>$</span>
      <input value={val} onChange={e => onChange(e.target.value)} inputMode="decimal" placeholder={String(expected)} style={{ flex: 1, minWidth: 0, width: 50, border: "none", background: "transparent", outline: "none", fontSize: 12, fontFamily: SANS, fontWeight: 600, color: val ? C.moss : C.textSoft, padding: 0 }} />
    </div>
  );
}

// ============================================
// NEW: CALENDAR EXPORT BUTTON
// ============================================
function CalButton({ uid, title, description, location, dateInfo, durationMins = 90 }) {
  if (!dateInfo || !dateInfo.hasTime) return null;
  const onClick = (e) => {
    e.stopPropagation();
    const ics = buildIcs({ uid, title, description, location, startUtc: dateInfo.utc, durationMins });
    const slug = uid.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 30);
    downloadIcs(`bali-${slug}.ics`, ics);
  };
  return (
    <button onClick={onClick} title="Add to calendar" style={{ fontSize: 11, background: "rgba(45,74,46,0.1)", color: C.moss, border: `1px solid ${C.moss}33`, padding: "3px 8px", borderRadius: 6, fontFamily: SANS, fontWeight: 700, cursor: "pointer" }}>📅</button>
  );
}

// ============================================
// NEW: CONTACT BUTTONS (WhatsApp inline)
// ============================================
function ContactButtons({ phone }) {
  if (!phone) return null;
  return (
    <a href={`https://wa.me/${phone}`} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" title="WhatsApp" style={{ fontSize: 11, background: "#25d366", color: "#fff", padding: "3px 8px", borderRadius: 6, textDecoration: "none", fontFamily: SANS, fontWeight: 700, display: "inline-block" }}>💬</a>
  );
}

// ============================================
// NEW: PRE-FLIGHT CARD (24h before)
// ============================================
function PreFlightCard() {
  const now = useNow(60000);
  const startMs = new Date(TRIP_START_ISO + "T06:35:00+10:00").getTime();
  const diff = startMs - now.getTime();
  // Show only in the 24h before departure
  if (diff <= 0 || diff > 86400000) return null;
  const hours = Math.floor(diff / 3600000);
  const items = [
    "Passport + e-VOA QR saved offline",
    "Indonesia Arrival Card e-CD submitted",
    "Bali Tourist Levy paid · QR saved",
    "AUD cash to exchange at airport",
    "Phone eSIM ready · activate on landing",
    "Bluebird + Gojek apps installed + cards added",
    "Bali offline Google Maps downloaded",
    "Travelan started (48 hr before each meal)",
    "Charger + adapter (Type C/F) packed",
    "Sunscreen + DEET + Compeed in carry-on",
  ];
  return (
    <div style={{ background: "linear-gradient(135deg, rgba(196,99,58,0.08), rgba(184,136,42,0.06))", border: `2px solid ${C.ember}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ember, fontWeight: 700, fontFamily: SANS }}>✈️ Pre-Flight · {hours}h to go</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} style={{ fontSize: 13, color: "#3a2a1a", fontFamily: SANS, display: "flex", gap: 8, alignItems: "flex-start", lineHeight: 1.5 }}>
            <span style={{ color: C.ember, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>◯</span>
            <span>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// VIEWS
// ============================================
function DayTimeline({ schedule, color }) {
  const parseTime = (t) => {
    if (!t || t === "PM") return null;
    const parts = t.split(":");
    if (parts.length < 2) return null;
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };
  const events = schedule.map(s => ({ ...s, mins: parseTime(s.time) })).filter(s => s.mins !== null);
  if (events.length < 2) return null;
  const start = events[0].mins;
  const end = events[events.length - 1].mins;
  const total = end - start;
  if (total <= 0) return null;
  const segments = events.slice(0, -1).map((ev, i) => {
    const dur = events[i + 1].mins - ev.mins;
    return { icon: ev.icon, time: ev.time, act: ev.act, pct: Math.max((dur / total) * 100, 3) };
  });
  const totalDisplay = total >= 60 ? `${Math.floor(total / 60)}h${total % 60 ? ` ${total % 60}m` : ""}` : `${total}m`;
  return (
    <div style={{ margin: "2px 0 10px" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS, marginBottom: 8 }}>⏱ Day Flow</div>
      <div style={{ display: "flex", gap: 2, height: 36, borderRadius: 8, overflow: "hidden" }}>
        {segments.map((seg, i) => {
          const lightnessHex = Math.round((0.3 + (i / segments.length) * 0.7) * 255).toString(16).padStart(2, "0");
          return (
            <div key={i} title={`${seg.time} · ${seg.act}`} style={{ flex: `${seg.pct} 0 0`, background: `${color}${lightnessHex}`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: i === 0 ? "8px 0 0 8px" : i === segments.length - 1 ? "0 8px 8px 0" : 0, fontSize: seg.pct > 7 ? 14 : 9, cursor: "default" }}>
              {seg.pct > 5 && <span>{seg.icon}</span>}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, alignItems: "center" }}>
        <span style={{ fontSize: 10, color: C.textGhost, fontFamily: SANS, fontWeight: 500 }}>{events[0].time}</span>
        <span style={{ fontSize: 10, color: C.gold, fontFamily: SANS, fontWeight: 700 }}>{totalDisplay}</span>
        <span style={{ fontSize: 10, color: C.textGhost, fontFamily: SANS, fontWeight: 500 }}>{events[events.length - 1].time}</span>
      </div>
    </div>
  );
}

function JourneyView() {
  const today = todayIso();
  // Auto-open today's card if we're in the trip; else open nothing
  const initialOpen = useMemo(() => {
    const t = days.find(d => d.iso === today);
    return t ? t.num : null;
  }, [today]);
  const [openDay, setOpenDay] = useState(initialOpen);
  const [showPast, setShowPast] = useState(false);
  const wx = useWeather();
  const now = useNow(60000);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  const upcomingDays = days.filter(d => d.iso >= today);
  const pastDays = days.filter(d => d.iso < today);

  const renderDay = (day) => {
    const color = typeColor[day.type] || C.ember;
    const bg = typeBg[day.type] || "rgba(196,99,58,0.1)";
    const isOpen = openDay === day.num;
    const isToday = day.iso === today;
    const isPast = day.iso < today;
    const dayWx = wx[day.iso] || null;
    // Compute "next up" schedule item for today
    let nextUpIdx = -1;
    if (isToday) {
      nextUpIdx = day.schedule.findIndex(s => {
        const p = (s.time || "").split(":");
        if (p.length !== 2) return false;
        const m = parseInt(p[0]) * 60 + parseInt(p[1]);
        return !isNaN(m) && m > nowMins;
      });
    }
    return (
          <div key={day.num} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, width: 36, flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: isPast ? C.riceDeep : color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 15, color: isPast ? C.textGhost : C.white, boxShadow: isOpen ? `0 0 0 3px ${bg}` : (isToday ? `0 0 0 3px rgba(184,136,42,0.4)` : "none"), fontWeight: 600 }}>{day.num}</div>
              <div style={{ width: 1, flex: 1, background: `${color}33`, minHeight: 10, marginTop: 4 }} />
            </div>
            <div onClick={() => setOpenDay(isOpen ? null : day.num)} style={{ flex: 1, background: isPast ? "rgba(122,170,124,0.06)" : C.white, border: `1px solid ${isToday ? C.gold : (isOpen ? color : C.riceDark)}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", boxShadow: isOpen ? `0 6px 24px ${color}22` : "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textGhost, fontWeight: 400, fontFamily: SANS, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span>{day.date}</span>
                    {isToday && <span style={{ background: C.gold, color: C.white, padding: "1px 7px", borderRadius: 10, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>TODAY</span>}
                    {isPast && <span style={{ color: C.moss, fontSize: 11 }}>✓</span>}
                    {dayWx ? <span style={{ fontSize: 11 }}>{dayWx.icon} {dayWx.high}°<span style={{ color: C.textGhost, fontSize: 10 }}>/{dayWx.low}°</span></span> : <span style={{ fontSize: 10 }}>{BALI_AVG.icon} ~{BALI_AVG.high}°</span>}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 21, color: "#0f0a06", marginTop: 4, lineHeight: 1.25, fontWeight: 600 }}>{day.title}</div>
                  <div style={{ fontSize: 14, color: "#3a2a1a", marginTop: 6, lineHeight: 1.5, fontFamily: SANS }}>{day.anchor}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: bg, color, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", fontWeight: 600, fontFamily: SANS }}>{day.badge}</div>
                  {day.budgetAUD && <div style={{ fontSize: 10, color: C.textSoft, fontFamily: SANS, fontWeight: 600, background: C.riceDeep, padding: "2px 7px", borderRadius: 10 }}>~${day.budgetAUD}</div>}
                </div>
              </div>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${C.riceDeep}`, marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {day.summary && (
                    <div style={{ background: "rgba(184,136,42,0.08)", border: `1px solid ${C.gold}44`, borderRadius: 8, padding: "8px 12px", fontSize: 12, color: C.gold, fontFamily: SANS, fontWeight: 600 }}>
                      ✦ {day.summary}
                    </div>
                  )}
                  {dayWx && (
                    <div style={{ background: "rgba(59,130,184,0.07)", border: "1px solid rgba(59,130,184,0.2)", borderRadius: 8, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontFamily: SANS, color: "#3a2a1a" }}>{dayWx.icon} {dayWx.label} · 💧 {dayWx.rain}% rain</span>
                      <span style={{ fontSize: 13, color: "#3b82b8", fontFamily: SANS, fontWeight: 700 }}>{dayWx.high}° / {dayWx.low}°</span>
                    </div>
                  )}
                  <DayTimeline schedule={day.schedule} color={color} />
                  {day.schedule.map((s, i) => {
                    const isNext = isToday && i === nextUpIdx;
                    const isDone = isToday && nextUpIdx >= 0 && i < nextUpIdx;
                    return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "55px 22px 1fr", gap: 10, alignItems: "baseline", padding: isNext ? "6px 8px" : "0", background: isNext ? "rgba(184,136,42,0.12)" : "transparent", border: isNext ? `1px solid ${C.gold}66` : "1px solid transparent", borderRadius: 8, opacity: isDone ? 0.5 : 1, transition: "all 0.2s" }}>
                      <div style={{ fontFamily: SERIF, fontSize: 15, color: isNext ? C.ember : C.gold, textAlign: "right", fontWeight: isNext ? 700 : 600 }}>{s.time}</div>
                      <div style={{ fontSize: 15, textAlign: "center" }}>{s.icon}</div>
                      <div style={{ fontSize: 15, color: ACT_COLORS[s.icon] || "#3a2a1a", lineHeight: 1.6, fontFamily: SANS, fontWeight: isNext ? 700 : (ACT_COLORS[s.icon] ? 500 : 400), textDecoration: isDone ? "line-through" : "none", textDecorationColor: "#7aaa7c" }}>
                        {isNext && <span style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ember, fontWeight: 800, marginRight: 6 }}>Up Next ▸</span>}
                        {s.act}
                      </div>
                    </div>
                  );})}
                  {day.photoMoments && (<>
                    <div style={{ marginTop: 6, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS }}>📸 Photo Moments</div>
                    {day.photoMoments.map((p, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "70px 1fr", gap: 10, alignItems: "baseline" }}>
                        <div style={{ fontFamily: SERIF, fontSize: 12, color: C.ember, textAlign: "right", fontWeight: 600 }}>{p.time}</div>
                        <div style={{ fontSize: 13, color: "#3a2a1a", lineHeight: 1.5, fontFamily: SANS }}>{p.desc}</div>
                      </div>
                    ))}
                  </>)}
                  {day.packingList && (<>
                    <div style={{ marginTop: 6, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS }}>🎒 What to Pack</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {day.packingList.map((item, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#3a2a1a", fontFamily: SANS, display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: C.moss, fontWeight: 700, marginTop: 1, flexShrink: 0 }}>✓</span>
                          <span style={{ lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </>)}
                  {day.costs && (<>
                    <div style={{ marginTop: 6, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS }}>💰 Costs</div>
                    <div style={{ background: "rgba(45,74,46,0.05)", border: `1px solid ${C.moss}33`, borderRadius: 8, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                      {day.costs.map((c, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <span style={{ fontSize: 13, color: "#3a2a1a", fontFamily: SANS }}>{c.item}</span>
                          <span style={{ fontSize: 12, color: C.moss, fontFamily: SANS, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>{c.note}</span>
                        </div>
                      ))}
                    </div>
                  </>)}
                  {day.tips && (<>
                    <div style={{ marginTop: 6, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS }}>💡 Pro Tips</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {day.tips.map((tip, i) => (
                        <div key={i} style={{ fontSize: 13, color: "#3a2a1a", fontFamily: SANS, lineHeight: 1.5, background: "rgba(196,99,58,0.05)", borderLeft: `3px solid ${C.ember}55`, paddingLeft: 10, paddingTop: 5, paddingBottom: 5, borderRadius: "0 6px 6px 0" }}>
                          💡 {tip}
                        </div>
                      ))}
                    </div>
                  </>)}
                  {day.venues && day.venues.length > 0 && (<>
                    <div style={{ marginTop: 6, fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: C.textGhost, fontWeight: 700, fontFamily: SANS }}>📞 Quick Contacts</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {day.venues.map((v, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, background: C.rice, borderRadius: 8, padding: "8px 10px" }}>
                          <span style={{ fontSize: 13, color: "#3a2a1a", fontFamily: SANS, fontWeight: 500, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                            {v.phone && <a href={`https://wa.me/${v.phone}`} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ fontSize: 11, background: "#25d366", color: "#fff", padding: "4px 9px", borderRadius: 6, textDecoration: "none", fontFamily: SANS, fontWeight: 700 }}>💬</a>}
                            {v.maps && <a href={`https://www.google.com/maps/search/?api=1&query=${v.maps}`} onClick={e => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ fontSize: 11, background: "#4285f4", color: "#fff", padding: "4px 9px", borderRadius: 6, textDecoration: "none", fontFamily: SANS, fontWeight: 700 }}>📍</a>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>)}
                </div>
              )}
            </div>
          </div>
        );
  };

  return (
    <div>
      {upcomingDays.map(renderDay)}
      {pastDays.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div onClick={() => setShowPast(p => !p)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(122,170,124,0.08)", border: `1px solid ${C.riceDark}`, borderRadius: 10, cursor: "pointer", userSelect: "none", marginBottom: showPast ? 10 : 0 }}>
            <span style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.moss, fontWeight: 700, fontFamily: SANS, flex: 1 }}>✓ Past · {pastDays.length} {pastDays.length === 1 ? "day" : "days"}</span>
            <span style={{ fontSize: 12, color: C.textGhost, fontFamily: SANS }}>{showPast ? "▲ Hide" : "▼ Show"}</span>
          </div>
          {showPast && pastDays.map(renderDay)}
        </div>
      )}
    </div>
  );
}

function DiningView({ actuals, setActuals }) {
  const [showTipping, setShowTipping] = useState(false);
  // Total: actual where present, expected otherwise
  const total = dining.reduce((sum, d, i) => {
    const k = `dn${i}`;
    const a = actuals && actuals[k];
    return sum + (a != null ? a : (d.costMid || 0));
  }, 0);
  const expectedTotal = dining.reduce((sum, d) => sum + (d.costMid || 0), 0);
  const anyActuals = actuals && Object.keys(actuals).some(k => k.startsWith("dn"));
  return (
    <div>
      <div style={{ background: "rgba(184,136,42,0.08)", border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: C.gold, fontFamily: SANS, fontWeight: 600, lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>ⓘ</span>
        <span><b>Tax & tip</b> in Bali: most restaurants add <b>+11% PB1 tax</b> and many include <b>5–10% service</b>. Always check the bill before tipping again. Cash tip to the server if service isn't included.</span>
      </div>
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, overflow: "hidden" }}>
        {dining.map((d, i) => {
          const k = `dn${i}`;
          return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: i < dining.length - 1 ? `1px solid ${C.riceDeep}` : "none" }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: C.riceDark, textAlign: "center", fontWeight: 600 }}>{d.day}</div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: "#0f0a06", fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 14, color: "#5a4a30", marginTop: 3, lineHeight: 1.5, fontFamily: SANS }}>{d.type}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, minWidth: 90 }}>
              <div style={{ fontSize: 13, color: C.gold, fontWeight: 500, fontFamily: SANS, whiteSpace: "nowrap" }}>{d.cost}</div>
              {d.costMid > 0 && <ActualPaidInput k={k} expected={d.costMid} actuals={actuals} setActuals={setActuals} />}
            </div>
          </div>
        );})}
      </div>
      <Divider />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textGhost, fontFamily: SANS, fontWeight: 600 }}>{anyActuals ? "Running total" : "Est. dining total"}</div>
          <div style={{ fontSize: 11, color: C.textGhost, marginTop: 3, fontFamily: SANS }}>{anyActuals ? `Actuals + estimates · was ~$${expectedTotal}` : "Midpoint of ranges · AUD · for two"}</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.ember, fontWeight: 600 }}>{anyActuals ? "$" : "~$"}{Math.round(total)}</div>
      </div>
      <div onClick={() => setShowTipping(p => !p)} style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "#3a2a1a", fontFamily: SANS, fontWeight: 600 }}>💰 Tipping Guide</div>
          <span style={{ fontSize: 12, color: C.textGhost, fontFamily: SANS }}>{showTipping ? "▲ Hide" : "▼ Show"}</span>
        </div>
        {showTipping && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${C.riceDeep}`, paddingTop: 12 }}>
            {tipping.map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#3a2a1a", fontFamily: SANS, fontWeight: 500 }}>{t.venue}</div>
                  {t.note && <div style={{ fontSize: 12, color: C.textGhost, fontFamily: SANS, marginTop: 2 }}>{t.note}</div>}
                </div>
                <div style={{ fontSize: 12, color: C.moss, fontFamily: SANS, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>{t.amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SpaView() {
  const totalMins = spas.reduce((sum, s) => sum + s.mins, 0);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return (
    <div>
      <div style={{ background: "linear-gradient(135deg, rgba(45,74,46,0.08), rgba(184,136,42,0.06))", border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "16px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.moss, fontWeight: 700, fontFamily: SANS }}>Total spa time</div>
          <div style={{ fontSize: 12, color: C.textSoft, marginTop: 3, fontFamily: SANS }}>{spas.length} treatments across 8 days</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 28, color: C.moss, fontWeight: 600 }}>{hrs}h {mins > 0 ? `${mins}m` : ""}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {spas.map((s, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "16px 16px", position: "relative" }}>
            <div style={{ position: "absolute", top: 12, right: 12, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", background: "rgba(196,99,58,0.1)", color: C.ember, padding: "3px 9px", borderRadius: 10, fontWeight: 600, fontFamily: SANS }}>{s.day}</div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textGhost, marginBottom: 5, fontFamily: SANS }}>{s.date}</div>
            <div style={{ fontFamily: SERIF, fontSize: 19, color: "#0f0a06", lineHeight: 1.3, marginBottom: 4, paddingRight: 60, fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 14, color: "#5a4a30", marginBottom: 2, lineHeight: 1.5, fontFamily: SANS }}>{s.loc}</div>
            <div style={{ fontSize: 13, color: C.moss, marginTop: 8, fontWeight: 500, fontFamily: SANS }}>◷ {s.dur}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistView({ notes, setNotes, checked, setChecked }) {
  const total = bookings.filter(b => !b.section).length;
  const done = Object.values(checked || {}).filter(Boolean).length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const isComplete = done === total && total > 0;
  const [celebrate, setCelebrate] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const prevComplete = useRef(false);
  const now = useNow(60000);

  useEffect(() => {
    if (isComplete && !prevComplete.current) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 4000);
      prevComplete.current = true;
      return () => clearTimeout(t);
    }
    if (!isComplete) prevComplete.current = false;
  }, [isComplete]);

  const ringColor = pct < 33 ? C.ember : pct < 75 ? C.gold : C.moss;

  // Pre-compute section context for each item (for filter + iso parsing)
  const itemContext = useMemo(() => {
    let currentSection = "";
    return bookings.map(b => {
      if (b.section) { currentSection = b.section; return { section: currentSection }; }
      const dateInfo = parseDateInText(b.title) || parseDateInText(b.sub);
      return { section: currentSection, dateInfo };
    });
  }, []);

  // Filter
  const filterCfg = TASK_FILTERS.find(f => f.id === filter) || TASK_FILTERS[0];
  const passesFilter = (item, i) => {
    if (item.section) return false; // handled at section render
    if (filter === "all") return true;
    if (filter === "todo") return !(checked && checked[`i${i}`]);
    if (filterCfg.tag) return item.tag === filterCfg.tag;
    if (filterCfg.section) return itemContext[i].section === filterCfg.section;
    return true;
  };

  // Build the visible items list grouped by section
  const sectionMap = useMemo(() => {
    const map = {};
    let currentSection = "";
    bookings.forEach((b, i) => {
      if (b.section) { currentSection = b.section; map[currentSection] = []; return; }
      if (!map[currentSection]) map[currentSection] = [];
      map[currentSection].push({ item: b, idx: i });
    });
    return map;
  }, []);

  // For "auto-archive done items" — when filter is "all", group checked items at the bottom
  return (
    <div>
      <PreFlightCard />
      <NotesSection notes={notes} setNotes={setNotes} />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 14 }}>
        <Confetti show={celebrate} />
        <ProgressRing value={done} max={total} label="Booked" color={ringColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, color: "#3a2a1a", fontWeight: 600, fontFamily: SANS, lineHeight: 1.4 }}>
            {isComplete ? "✦ All done! Selamat jalan ✦" : `${total - done} ${total - done === 1 ? "task" : "tasks"} to go`}
          </div>
          <div style={{ fontSize: 12, color: C.textGhost, marginTop: 2, fontFamily: SANS }}>
            {isComplete ? "Everything's booked." : "Tap the chips below to filter."}
          </div>
          <div style={{ background: C.riceDeep, borderRadius: 4, height: 6, overflow: "hidden", marginTop: 10 }}>
            <div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.ember}, ${ringColor})`, height: "100%", transition: "width 0.4s, background 0.4s" }} />
          </div>
        </div>
      </div>
      <FilterPills filters={TASK_FILTERS} active={filter} setActive={setFilter} />
      {Object.entries(sectionMap).map(([section, entries]) => {
        const visible = entries.filter(({ item, idx }) => passesFilter(item, idx));
        if (visible.length === 0) return null;
        // Split into pending + done (only when filter is "all")
        const pending = filter === "all" ? visible.filter(({ idx }) => !(checked && checked[`i${idx}`])) : visible;
        const doneList = filter === "all" ? visible.filter(({ idx }) => checked && checked[`i${idx}`]) : [];
        return (
          <div key={section}>
            <SectionHead label={section} />
            {pending.map(({ item, idx }) => renderTaskRow(item, idx, itemContext[idx], checked, setChecked, now))}
            {doneList.length > 0 && (
              <div onClick={() => setShowDone(p => !p)} style={{ fontSize: 11, color: C.textGhost, fontFamily: SANS, fontWeight: 600, cursor: "pointer", padding: "6px 4px", marginBottom: 4, userSelect: "none" }}>
                {showDone ? "▲" : "▼"} {doneList.length} done
              </div>
            )}
            {showDone && doneList.map(({ item, idx }) => renderTaskRow(item, idx, itemContext[idx], checked, setChecked, now))}
          </div>
        );
      })}
    </div>
  );
}

function renderTaskRow(item, idx, ctx, checked, setChecked, now) {
  const k = `i${idx}`;
  const tag = tagConfig[item.tag] || tagConfig.anytime;
  const isChecked = !!(checked && checked[k]);
  const dateInfo = ctx?.dateInfo;
  // Overdue = has date, date passed, NOT checked
  const isOverdue = !isChecked && dateInfo && dateInfo.utc.getTime() < now.getTime();
  const phone = parsePhone(item.sub) || parsePhone(item.title);
  const borderColor = isChecked ? "#b0c9b0" : (isOverdue ? C.ember : C.riceDark);
  const bgColor = isChecked ? "rgba(45,74,46,0.04)" : (isOverdue ? "rgba(196,99,58,0.05)" : C.white);
  return (
    <div key={k} onClick={() => setChecked(p => ({ ...(p || {}), [k]: !(p && p[k]) }))} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", background: bgColor, border: `1px solid ${borderColor}`, borderLeft: isOverdue ? `4px solid ${C.ember}` : `1px solid ${borderColor}`, borderRadius: 10, marginBottom: 6, cursor: "pointer", transition: "all 0.15s" }}>
      <div style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${isChecked ? C.moss : C.riceDark}`, background: isChecked ? C.moss : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
        {isChecked && <span style={{ color: C.white, fontSize: 14 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: isChecked ? "#5a4a30" : "#0f0a06", textDecoration: isChecked ? "line-through" : "none", textDecorationColor: "#7aaa7c", lineHeight: 1.4, fontWeight: 500, fontFamily: SANS }}>
          {isOverdue && <span style={{ fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", color: C.ember, fontWeight: 800, marginRight: 6, background: "rgba(196,99,58,0.12)", padding: "2px 6px", borderRadius: 4 }}>⚠ Overdue</span>}
          {item.title}
        </div>
        <div style={{ fontSize: 13, color: "#7a6a50", marginTop: 3, lineHeight: 1.5, fontFamily: SANS }}>{item.sub}</div>
        {(phone || (dateInfo && dateInfo.hasTime)) && (
          <div style={{ display: "flex", gap: 5, marginTop: 7 }}>
            <ContactButtons phone={phone} />
            <CalButton uid={`task-${idx}`} title={item.title} description={item.sub} dateInfo={dateInfo} />
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", background: tag.bg, color: tag.color, padding: "3px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, marginTop: 3, fontFamily: SANS }}>{tag.label}</div>
    </div>
  );
}

function DriversView({ notes, setNotes, checked, setChecked, actuals, setActuals }) {
  const actionableItems = driverPlan.filter(b => !b.section && b.status === "todo");
  const total = actionableItems.length;
  const done = Object.values(checked || {}).filter(Boolean).length;
  const expectedTotal = driverPlan.reduce((sum, d) => sum + (d.costMid || 0), 0);
  const totalCost = driverPlan.reduce((sum, d, i) => {
    const k = `dr${i}`;
    const a = actuals && actuals[k];
    return sum + (a != null ? a : (d.costMid || 0));
  }, 0);
  const anyActuals = actuals && Object.keys(actuals).some(k => k.startsWith("dr"));
  return (
    <div>
      <NotesSection notes={notes} setNotes={setNotes} />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 13, color: "#5a4a30", fontWeight: 500, fontFamily: SANS }}>Bookings to confirm</span>
          <span style={{ fontSize: 13, color: C.moss, fontWeight: 700, fontFamily: SANS }}>{done} / {total}</span>
        </div>
        <div style={{ background: C.riceDeep, borderRadius: 4, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${total > 0 ? (done / total) * 100 : 0}%`, background: C.moss, height: "100%", transition: "width 0.3s" }} />
        </div>
      </div>
      {driverPlan.map((item, i) => {
        if (item.section) return <SectionHead key={`s${i}`} label={item.section} />;
        const cfg = driverTypeConfig[item.type] || driverTypeConfig.none;
        const k = `d${i}`;
        const actualK = `dr${i}`;
        const isCheckable = item.status === "todo";
        const isChecked = !!(checked && checked[k]);
        const onClick = isCheckable ? () => setChecked(p => ({ ...(p || {}), [k]: !(p && p[k]) })) : undefined;
        const dateInfo = parseDateInText(item.day + " 08:00");
        return (
          <div key={k} onClick={onClick} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", background: isChecked ? "rgba(45,74,46,0.04)" : C.white, border: `1px solid ${isChecked ? "#b0c9b0" : C.riceDark}`, borderRadius: 10, marginBottom: 6, cursor: isCheckable ? "pointer" : "default", opacity: item.status === "na" ? 0.7 : 1 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${isChecked ? C.moss : (isCheckable ? C.riceDark : "transparent")}`, background: isChecked ? C.moss : (isCheckable ? "transparent" : C.riceDeep), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              {isChecked && <span style={{ color: C.white, fontSize: 14 }}>✓</span>}
              {!isCheckable && item.status === "na" && <span style={{ color: C.textGhost, fontSize: 12 }}>—</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: SERIF, fontSize: 14, color: C.gold, fontWeight: 600 }}>{item.day}</span>
                <span style={{ fontSize: 15, color: isChecked ? "#5a4a30" : "#0f0a06", textDecoration: isChecked ? "line-through" : "none", textDecorationColor: "#7aaa7c", lineHeight: 1.4, fontWeight: 500, fontFamily: SANS }}>{item.title}</span>
              </div>
              <div style={{ fontSize: 13, color: "#7a6a50", marginTop: 4, lineHeight: 1.5, fontFamily: SANS }}>{item.sub}</div>
              {item.costMid > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: "0 0 auto", maxWidth: 130 }}>
                    <ActualPaidInput k={actualK} expected={item.costMid} actuals={actuals} setActuals={setActuals} />
                  </div>
                  {isCheckable && dateInfo && <CalButton uid={`drive-${i}`} title={item.title} description={item.sub} dateInfo={{ ...dateInfo, hasTime: true }} durationMins={120} />}
                </div>
              )}
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", background: cfg.bg, color: cfg.color, padding: "3px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, marginTop: 3, fontFamily: SANS }}>{cfg.label}</div>
          </div>
        );
      })}
      <Divider />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textGhost, fontFamily: SANS, fontWeight: 600 }}>{anyActuals ? "Running total" : "Est. transport total"}</div>
          <div style={{ fontSize: 11, color: C.textGhost, marginTop: 3, fontFamily: SANS }}>{anyActuals ? `Actuals + estimates · was ~$${expectedTotal}` : "Midpoint of all rides + transfers · AUD"}</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.ember, fontWeight: 600 }}>{anyActuals ? "$" : "~$"}{Math.round(totalCost)}</div>
      </div>
    </div>
  );
}

// ============================================
// APP
// ============================================
export default function App() {
  const [tab, setTab] = useState("journey");
  const [checklistChecked, setChecklistCheckedState] = useState({});
  const [driversChecked, setDriversCheckedState] = useState({});
  const [checklistNotes, setChecklistNotesState] = useState("");
  const [driverNotes, setDriverNotesState] = useState("");
  const [actuals, setActualsState] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("syncing");

  const notesDebounce = useRef({ cln: null, drn: null });

  // Register service worker for offline caching (T4-1)
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Subscribe to Firebase on mount
  useEffect(() => {
    const subs = [];
    let loadedCount = 0;
    const totalSubs = 5;

    const onReady = () => {
      loadedCount++;
      if (loadedCount === totalSubs) {
        setLoaded(true);
        setSyncStatus("synced");
      }
    };

    const subscribe = (path, setter, isObject) => {
      const r = ref(db, path);
      const unsub = onValue(r, (snap) => {
        const val = snap.val();
        if (isObject) {
          setter(val || {});
        } else {
          setter(val || "");
        }
        if (loadedCount < totalSubs) onReady();
        else setSyncStatus("synced");
      }, (err) => {
        console.error(`Firebase error on ${path}:`, err);
        setSyncStatus("error");
        if (loadedCount < totalSubs) onReady();
      });
      subs.push(unsub);
    };

    subscribe("checklist-checked", setChecklistCheckedState, true);
    subscribe("drivers-checked", setDriversCheckedState, true);
    subscribe("checklist-notes", setChecklistNotesState, false);
    subscribe("drivers-notes", setDriverNotesState, false);
    subscribe("actuals", setActualsState, true);

    // Safety: mark loaded after 5 seconds even if Firebase is slow
    const timeout = setTimeout(() => {
      if (!loaded) {
        setLoaded(true);
        if (loadedCount === 0) setSyncStatus("offline");
      }
    }, 5000);

    return () => {
      subs.forEach(u => u && u());
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const writeToFirebase = useCallback((path, value) => {
    setSyncStatus("syncing");
    set(ref(db, path), value)
      .then(() => setSyncStatus("synced"))
      .catch((e) => {
        console.error(`Firebase write error on ${path}:`, e);
        setSyncStatus("error");
      });
  }, []);

  const setChecklistChecked = useCallback((updater) => {
    setChecklistCheckedState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeToFirebase("checklist-checked", next);
      return next;
    });
  }, [writeToFirebase]);

  const setDriversChecked = useCallback((updater) => {
    setDriversCheckedState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeToFirebase("drivers-checked", next);
      return next;
    });
  }, [writeToFirebase]);

  const setChecklistNotes = useCallback((val) => {
    setChecklistNotesState(val);
    if (notesDebounce.current.cln) clearTimeout(notesDebounce.current.cln);
    notesDebounce.current.cln = setTimeout(() => writeToFirebase("checklist-notes", val), 500);
  }, [writeToFirebase]);

  const setDriverNotes = useCallback((val) => {
    setDriverNotesState(val);
    if (notesDebounce.current.drn) clearTimeout(notesDebounce.current.drn);
    notesDebounce.current.drn = setTimeout(() => writeToFirebase("drivers-notes", val), 500);
  }, [writeToFirebase]);

  const setActuals = useCallback((updater) => {
    setActualsState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      writeToFirebase("actuals", next);
      return next;
    });
  }, [writeToFirebase]);

  if (!loaded) {
    return (
      <div style={{ background: C.rice, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.gold, fontStyle: "italic", marginBottom: 8, fontWeight: 500 }}>Loading your trip…</div>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: C.textGhost, fontFamily: SANS, fontWeight: 600 }}>Syncing with cloud</div>
      </div>
    );
  }

  return (
    <div style={{ background: C.rice, minHeight: "100vh", fontFamily: SANS, color: "#0f0a06", fontSize: 17, lineHeight: 1.7 }}>
      <div style={{ background: C.night, padding: "28px 16px 22px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 30% 70%, rgba(196,99,58,0.3) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 75% 25%, rgba(45,74,46,0.35) 0%, transparent 55%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: "#d4aa50", marginBottom: 10, fontFamily: SANS }}>Relaxed Luxe · Two</div>
          <div style={{ fontFamily: SERIF, fontSize: 56, color: C.white, lineHeight: 0.9, letterSpacing: "-0.01em", fontWeight: 600 }}>
            Ba<span style={{ color: "#d9845e", fontStyle: "italic" }}>li</span>
          </div>
          <div style={{ fontSize: 10, letterSpacing: "0.18em", color: "rgba(253,250,245,0.5)", marginTop: 12, textTransform: "uppercase", fontFamily: SANS }}>Namit & Wife · 8 Nights</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: 10 }}>
            <span style={{ fontFamily: SERIF, fontSize: 14, color: "#d4aa50" }}>2 June</span>
            <div style={{ width: 36, height: 1, background: "linear-gradient(90deg, transparent, #c4633a, transparent)" }} />
            <span style={{ fontFamily: SERIF, fontSize: 14, color: "#d4aa50" }}>10 June 2026</span>
          </div>
          <CountdownBanner />
        </div>
      </div>

      <div style={{ background: C.white, borderBottom: `1px solid ${C.riceDeep}`, padding: "10px 8px 8px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "9px 0", border: "none", borderRadius: 8, background: tab === t.id ? C.ember : "transparent", color: tab === t.id ? C.white : C.textSoft, fontSize: 12, fontWeight: tab === t.id ? 600 : 500, cursor: "pointer", letterSpacing: "0.03em", transition: "all 0.15s", fontFamily: SANS }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 6 }}>
          <SyncIndicator status={syncStatus} />
        </div>
      </div>

      <div style={{ padding: "16px 12px 32px" }}>
        {tab === "journey" && <JourneyView />}
        {tab === "dining" && <DiningView actuals={actuals} setActuals={setActuals} />}
        {tab === "spa" && <SpaView />}
        {tab === "checklist" && <ChecklistView notes={checklistNotes} setNotes={setChecklistNotes} checked={checklistChecked} setChecked={setChecklistChecked} />}
        {tab === "drivers" && <DriversView notes={driverNotes} setNotes={setDriverNotes} checked={driversChecked} setChecked={setDriversChecked} actuals={actuals} setActuals={setActuals} />}
      </div>

      <div style={{ background: C.night, textAlign: "center", padding: "24px 16px" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: "#d4aa50", marginBottom: 4, fontWeight: 500 }}>Selamat jalan ✦</div>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(253,250,245,0.3)", textTransform: "uppercase", fontFamily: SANS }}>Jun 2 – 10, 2026</div>
      </div>

      <CurrencyWidget />
    </div>
  );
}
