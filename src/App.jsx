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
// DATA
// ============================================
const days = [
  { num: 1, date: "Tue · Jun 2", iso: "2026-06-02", title: "Arrival + Hydrafacial", type: "sem", badge: "Seminyak", anchor: "Land 10:35 · Signature Hydrafacial + IV Drip · Shelter dinner",
    schedule: [
      { time: "10:35", icon: "✈️", act: "Land DPS — Monolocale pre-arranged pickup" },
      { time: "12:00", icon: "🏨", act: "Check in · shower · decompress" },
      { time: "16:30", icon: "💆", act: "Bodylabs — Signature Hydrafacial + IV Drip" },
      { time: "19:00", icon: "🍽", act: "Dinner: Shelter Restaurant — modern Australian-Asian" },
      { time: "21:00", icon: "🌙", act: "Return · 750ml water + electrolytes · sleep" },
    ] },
  { num: 2, date: "Wed · Jun 3", iso: "2026-06-03", title: "Spa Day", type: "sem", badge: "Seminyak", anchor: "Svaha Spa: Ear Candle + Massage + Scrub · Merah Putih dinner",
    schedule: [
      { time: "09:00", icon: "☀️", act: "Slow morning at Monolocale · late breakfast · pool" },
      { time: "11:00", icon: "💆", act: "Svaha Spa — Ear Candle + Back Massage + Javanese Body Scrub (~2.5 hrs)" },
      { time: "14:00", icon: "🏊", act: "Hotel · pool · nap" },
      { time: "19:30", icon: "🍽", act: "Dinner: Merah Putih — modern Indonesian" },
    ] },
  { num: 3, date: "Thu · Jun 4", iso: "2026-06-04", title: "Svaha Bamboo + Potato Head Beach Club", type: "sem", badge: "Seminyak", anchor: "Svaha Bamboo · Local browsing · Potato Head Beach Club dinner",
    schedule: [
      { time: "11:00", icon: "💆", act: "Svaha Bamboo Massage — side-by-side (90 min)" },
      { time: "12:30", icon: "🛍", act: "Local browsing / markets · lunch · rest" },
      { time: "16:00", icon: "🏖", act: "Potato Head Beach Club — pools, sunset, stay till late" },
      { time: "19:30", icon: "🍽", act: "Dinner at Potato Head Beach Club" },
    ] },
  { num: 4, date: "Fri · Jun 5", iso: "2026-06-05", title: "Grooming + Ku De Ta Sunset", type: "sem", badge: "Seminyak", anchor: "Bali Barber · Shampoo Lounge · Ku De Ta · dinner there",
    schedule: [
      { time: "10:00", icon: "✂️", act: "Bali Barber + Shampoo Lounge — 4–5 hrs total" },
      { time: "16:00", icon: "🌅", act: "Ku De Ta (now Alias) — beachfront, pools, sunset" },
      { time: "19:30", icon: "🍽", act: "Dinner at Ku De Ta" },
    ] },
  { num: 5, date: "Sat · Jun 6", iso: "2026-06-06", title: "Transfer to Ubud + Kaveri", type: "trn", badge: "Transfer", anchor: "Seminyak → Ubud · Jungle Pool Suite · Kaveri 4 Hands",
    schedule: [
      { time: "09:00", icon: "☕️", act: "Slow last breakfast at Monolocale" },
      { time: "09:30", icon: "🚗", act: "Checkout · depart Seminyak → Ubud (~90 min)" },
      { time: "11:00", icon: "🌿", act: "Arrive The Udaya · Jungle Pool Suite walkthrough" },
      { time: "13:30", icon: "💆", act: "Kaveri Spa — 4 Hands Massage (60 min) + Scrub + Botanical Bath (2 hrs)" },
      { time: "19:00", icon: "🍽", act: "Room service or Deeva Restaurant in-suite" },
    ] },
  { num: 6, date: "Sun · Jun 7", iso: "2026-06-07", title: "DADI ATV + Tis Cafe + Kaveri", type: "ubu", badge: "Ubud", anchor: "Tandem ATV · Tis Cafe brunch · Kaveri 120 min",
    schedule: [
      { time: "08:30", icon: "🏍", act: "DADI BALI ADVENTURES — Tandem ATV (90 min)" },
      { time: "10:30", icon: "🚿", act: "Buffer · drive · freshen up" },
      { time: "11:30", icon: "🥐", act: "Tis Cafe — brunch, swings, infinity pool (arrive 11:30–11:45)" },
      { time: "14:00", icon: "🏊", act: "Return Udaya · shower · private pool buffer" },
      { time: "17:00", icon: "💆", act: "Kaveri Spa — Balinese + Energy Work (120 min)" },
      { time: "19:30", icon: "🍽", act: "Deeva Restaurant in-house dinner" },
    ] },
  { num: 7, date: "Mon · Jun 8", iso: "2026-06-08", title: "Elephant Ubud + INKA + Sayan House", type: "ubu", badge: "Ubud", anchor: "Elephant Ubud lunch · INKA Facial + Mani/Pedi · Sayan Gorge dinner",
    schedule: [
      { time: "12:30", icon: "🍽", act: "Lunch: Elephant Ubud — grilled seafood or chicken" },
      { time: "13:45", icon: "🛵", act: "Gojek to INKA Spa, Jl. Monkey Forest (12 min)" },
      { time: "14:00", icon: "💆", act: "INKA Anti-Aging Facial + Mani/Pedi (both)" },
      { time: "15:30", icon: "🏊", act: "Return Udaya · private pool · buffer" },
      { time: "18:00", icon: "🚗", act: "Depart to The Sayan House" },
      { time: "19:00", icon: "🌅", act: "Dinner: The Sayan House — Japanese-Latin fusion, gorge sunset" },
    ] },
  { num: 8, date: "Tue · Jun 9", iso: "2026-06-09", title: "Relax & Make Memories", type: "ubu", badge: "Ubud ✦", anchor: "Sound Healing · Kaveri Signature · ✦ Evening",
    schedule: [
      { time: "08:00", icon: "🎵", act: "Sound Healing at The Udaya — TBC: needs booking confirmation from Udaya" },
      { time: "13:30", icon: "🌸", act: "Kaveri Signature Couples — Royal Massage + Flower bath (2.5 hrs)" },
      { time: "16:00", icon: "🛁", act: "Return to Jungle Pool Suite · dress slowly together" },
      { time: "19:30", icon: "✦", act: "Dinner and relax at Udaya — the dinner of the trip" },
    ] },
  { num: 9, date: "Wed · Jun 10", iso: "2026-06-10", title: "Gentle Farewell", type: "ubu", badge: "Departure", anchor: "Final pool morning · fly home to Melbourne",
    schedule: [
      { time: "08:30", icon: "☕️", act: "Slow breakfast at Deeva or in bed" },
      { time: "09:30", icon: "🏊", act: "Final float in Jungle Pool Suite private pool" },
      { time: "10:30", icon: "🧳", act: "Pack · checkout" },
      { time: "11:00", icon: "🚗", act: "Udaya pre-arranged transfer → DPS Airport (~90 min)" },
      { time: "PM", icon: "✈️", act: "Fly home · Selamat jalan ✦" },
    ] },
];

const dining = [
  { day: 1, name: "Shelter Restaurant", type: "Modern Australian-Asian · calm", cost: "~$60–80", costMid: 70 },
  { day: 2, name: "Merah Putih", type: "Modern Indonesian · refined", cost: "~$80–120", costMid: 100 },
  { day: 3, name: "Potato Head Beach Club", type: "Pools + sunset + late dinner", cost: "~$80–120", costMid: 100 },
  { day: 4, name: "Ku De Ta (now Alias)", type: "Beachfront · sunset · premium dinner", cost: "~$100–150", costMid: 125 },
  { day: 5, name: "Deeva (in-suite)", type: "The Udaya · room service · recovery", cost: "Included", costMid: 0 },
  { day: 7, name: "Elephant Ubud (Lunch)", type: "Grilled seafood + chicken · jungle", cost: "~$40–60", costMid: 50 },
  { day: 7, name: "The Sayan House", type: "Japanese-Latin fusion · gorge sunset", cost: "~$90–100", costMid: 95 },
  { day: 8, name: "Evening at the Udaya", type: "In-suite · the dinner of the trip ✦", cost: "✦ Arranged", costMid: 200 },
];

const spas = [
  { day: "Jun 2", date: "Tue · Jun 2", name: "Signature Hydrafacial + IV Drip", loc: "Bodylabs, Seminyak", dur: "~90 min", mins: 90 },
  { day: "Jun 3", date: "Wed · Jun 3", name: "Ear Candle + Back Massage + Body Scrub", loc: "Svaha Spa, Seminyak", dur: "~2.5 hrs", mins: 150 },
  { day: "Jun 4", date: "Thu · Jun 4", name: "Svaha Bamboo Massage", loc: "Svaha Spa, Seminyak", dur: "90 min", mins: 90 },
  { day: "Jun 5", date: "Fri · Jun 5", name: "Bali Barber + Shampoo Lounge", loc: "Bali Barber / Shampoo Lounge", dur: "4–5 hrs", mins: 270 },
  { day: "Jun 6", date: "Sat · Jun 6", name: "4 Hands Massage + Scrub + Botanical Bath", loc: "Kaveri Spa, The Udaya", dur: "2 hrs", mins: 120 },
  { day: "Jun 7", date: "Sun · Jun 7", name: "Balinese + Energy Work", loc: "Kaveri Spa, The Udaya", dur: "120 min", mins: 120 },
  { day: "Jun 8", date: "Mon · Jun 8", name: "INKA Anti-Aging Facial + Mani/Pedi", loc: "INKA Spa, Jl. Monkey Forest", dur: "~2 hrs", mins: 120 },
  { day: "Jun 9", date: "Tue · Jun 9", name: "Sound Healing (TBC)", loc: "The Udaya · pending booking", dur: "~60 min", mins: 60 },
  { day: "Jun 9", date: "Tue · Jun 9", name: "Kaveri Signature · Flowers", loc: "Kaveri Spa, The Udaya", dur: "2.5 hrs", mins: 150 },
];

const bookings = [
  { section: "Flights & Accommodation" },
  { title: "Book Uber/Taxi: Home → MEL Airport — Jun 2", sub: "Flight departs 6:35 AM · book 2 days in advance · arrive airport by 4:30 AM", tag: "urgent" },
  { title: "Book flights MEL → DPS → MEL", sub: "Land DPS ~10:35 on Jun 2. Return Jun 10 PM.", tag: "urgent" },
  { title: "Confirm Monolocale Resort & Spa — Jun 2–6", sub: "Seminyak · 4 nights", tag: "urgent" },
  { title: "Confirm The Udaya — Jun 6–10", sub: "Jungle Pool Suite · 4 nights · daily fruit basket", tag: "urgent" },
  { title: "Arrange airport pickup with Monolocale — Jun 2", sub: "No Grab at DPS — hotel pre-arranged only", tag: "urgent" },
  { section: "Treatments & Spa" },
  { title: "Book Bodylabs — Jun 2, 16:30", sub: "Signature Hydrafacial + IV Drip · Seminyak", tag: "urgent" },
  { title: "Book Svaha Spa — Jun 3, 11:00", sub: "Ear Candle + Back Massage + Javanese Body Scrub (~2.5 hrs)", tag: "urgent" },
  { title: "Book Svaha Bamboo Massage — Jun 4, 11:00", sub: "Svaha Spa · individual side-by-side (90 min)", tag: "urgent" },
  { title: "WhatsApp Bali Barber — Jun 5, 10:00", sub: "President's Package · +62 853 3833 3338", tag: "urgent" },
  { title: "Book Shampoo Lounge — Jun 5, 10:00", sub: "Full Hair + Spa Package", tag: "urgent" },
  { title: "Book Kaveri 4 Hands Couples — Jun 6, 13:30", sub: "The Udaya · 60 min 4 Hands + Scrub + Botanical Bath", tag: "urgent" },
  { title: "Book Kaveri Balinese + Energy Work — Jun 7, 17:00", sub: "The Udaya · 120 min, both", tag: "urgent" },
  { title: "Book INKA Spa — Jun 8, 14:00", sub: "Anti-Aging Facial + Mani/Pedi · +62 813 5396 6547", tag: "urgent" },
  { title: "Book Sound Healing at Udaya — Jun 9, 08:00", sub: "TBC: confirm availability + booking with Udaya concierge", tag: "urgent" },
  { title: "Book Kaveri Signature Couples — Jun 9, 13:30", sub: "Royal Massage + Flowers · 2.5 hrs", tag: "urgent" },
  { section: "Dining Reservations" },
  { title: "Book Shelter — Jun 2, 19:00", sub: "Seminyak · 2 people", tag: "soon" },
  { title: "Book Merah Putih — Jun 3, 19:30", sub: "Seminyak · modern Indonesian · pre-book", tag: "soon" },
  { title: "Book Potato Head Beach Club dinner — Jun 4, 19:30", sub: "Arrive 16:00 for sunset", tag: "urgent" },
  { title: "Book Ku De Ta (now Alias) — Jun 5, 19:30", sub: "Seminyak · rebranded to Alias · verify booking name · arrive 16:00 for sunset", tag: "urgent" },
  { title: "Book Elephant Ubud — Jun 8, 12:30", sub: "Ubud · lunch for two", tag: "soon" },
  { title: "Book Sayan House — Jun 8, 19:00", sub: "No beef/pork/lamb · arrive 18:30 for sunset", tag: "soon" },
  { section: "Activities" },
  { title: "Book DADI BALI ADVENTURES — Jun 7, 08:30", sub: "Tandem ATV (90 min) · book night before", tag: "soon" },
  { title: "Book Tis Cafe — Jun 7, 11:30", sub: "Brunch · swings · infinity pool · reserve table", tag: "soon" },
  { title: "Potato Head Beach Club — Jun 4", sub: "Arrive 16:00 · stay till late · dinner there", tag: "anytime" },
  { title: "Ku De Ta — Jun 5", sub: "Arrive 16:00 · sunset · dinner there", tag: "anytime" },
  { section: "Concierge (Udaya)" },
  { title: "Brief concierge — Breakfast setup Jun 8", sub: "Tropical spread · discreet · book 1 week before", tag: "urgent" },
  { title: "Breakfast at Udaya — Jun 9, 07:00", sub: "✓ Booked & confirmed", tag: "anytime" },
  { title: "Brief concierge — Jun 9 evening", sub: "Suite ready 16:00 · candle path · privacy", tag: "urgent" },
  { section: "Pharmacy" },
  { title: "Travelan (Bali Belly defence)", sub: "1 tablet 30 min before each meal · daily from 2 days pre-landing", tag: "pharmacy" },
  { title: "Imodium (loperamide) + Gastrolyte ORS", sub: "Plus Flagyl/Metronidazole on prescription", tag: "pharmacy" },
  { title: "Hydralyte electrolyte sachets", sub: "Drink nightly · heat + activity depletes fast", tag: "pharmacy" },
  { title: "Picaridin insect repellent (20%)", sub: "Gentler than DEET · apply dawn/dusk", tag: "pharmacy" },
  { title: "DEET 30%+ backup", sub: "For high-mozzie zones · jungle + evening outdoor dining", tag: "pharmacy" },
  { title: "Antihistamines", sub: "Cetirizine or Loratadine", tag: "pharmacy" },
  { title: "Sunscreen SPF 50+ (face + body)", sub: "Reef-safe · reapply every 2 hrs", tag: "pharmacy" },
  { title: "Paracetamol + Ibuprofen", sub: "Heat headaches, muscle soreness", tag: "pharmacy" },
  { title: "Band-aids + antiseptic cream", sub: "Scooter scratches, waterfall rocks", tag: "pharmacy" },
  { title: "Blister plasters (Compeed)", sub: "For walking + day trips", tag: "pharmacy" },
  { title: "Travel sickness tablets", sub: "Windy mountain roads Seminyak → Ubud", tag: "pharmacy" },
  { title: "Prescription meds from GP", sub: "Carry in original packaging with letter", tag: "pharmacy" },
  { section: "Travel Admin" },
  { title: "Apply for e-VOA", sub: "14–30 days before · molina.imigrasi.go.id · IDR 500k/person · window open NOW", tag: "urgent" },
  { title: "Submit Indonesia Arrival Card (e-CD)", sub: "Within 72 hrs before landing · allindonesia.imigrasi.go.id", tag: "urgent" },
  { title: "Pay Bali Tourist Levy (IDR 150k/person)", sub: "lovebali.baliprov.go.id · keep QR receipt", tag: "urgent" },
  { title: "Buy eSIM for both", sub: "Airalo or Holafly · 5–10GB plan", tag: "soon" },
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
  { day: "Jun 2", title: "Uber/Taxi: Home → MEL Airport", sub: "Flight 6:35 AM · book 2 days in advance · arrive by 4:30 AM", type: "book", status: "todo", costMid: 60 },
  { section: "Seminyak" },
  { day: "Jun 2", title: "Airport pickup DPS → Monolocale", sub: "Pre-arranged via Monolocale · ~$35–50 AUD", type: "confirmed", status: "done", costMid: 42 },
  { day: "Jun 3", title: "No driver needed", sub: "Svaha Spa near Monolocale · Bluebird for Merah Putih dinner", type: "none", status: "na", costMid: 0 },
  { day: "Jun 4", title: "Half day driver", sub: "Local browsing → Potato Head Beach Club (dinner there) · ~$30–40", type: "book", status: "todo", costMid: 35 },
  { day: "Jun 5", title: "Short rides only (Bluebird)", sub: "Grooming + Ku De Ta (dinner there) · ~$25–35", type: "bluebird", status: "na", costMid: 30 },
  { section: "Transfer" },
  { day: "Jun 6", title: "Full day: Seminyak → Ubud", sub: "Concierge pre-arranged transfer · confirmed · ~$60–65", type: "confirmed", status: "done", costMid: 62 },
  { section: "Ubud" },
  { day: "Jun 7", title: "Full day: DADI + Tis Cafe", sub: "Driver waits at both locations · ~$60–65", type: "book", status: "todo", costMid: 62 },
  { day: "Jun 8", title: "Half day evening", sub: "Gojek to INKA at 13:45 · Sayan House at 18:00 · ~$35–40", type: "book", status: "todo", costMid: 37 },
  { day: "Jun 9", title: "No driver needed", sub: "Sound Healing + Kaveri at Udaya · all on-property · $0", type: "none", status: "na", costMid: 0 },
  { section: "Departure" },
  { day: "Jun 10", title: "Airport transfer Udaya → DPS", sub: "Udaya pre-arranged · ~$50–70 · depart 11:00", type: "confirmed", status: "todo", costMid: 60 },
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
    offline: { color: C.ember, label: "Offline · changes saved locally", dot: false },
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
// VIEWS
// ============================================
function JourneyView() {
  const [openDay, setOpenDay] = useState(null);
  const today = todayIso();
  return (
    <div>
      {days.map(day => {
        const color = typeColor[day.type] || C.ember;
        const bg = typeBg[day.type] || "rgba(196,99,58,0.1)";
        const isOpen = openDay === day.num;
        const isToday = day.iso === today;
        const isPast = day.iso < today;
        return (
          <div key={day.num} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 14, width: 36, flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: isPast ? C.riceDeep : color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 15, color: isPast ? C.textGhost : C.white, boxShadow: isOpen ? `0 0 0 3px ${bg}` : (isToday ? `0 0 0 3px rgba(184,136,42,0.4)` : "none"), fontWeight: 600 }}>{day.num}</div>
              <div style={{ width: 1, flex: 1, background: `${color}33`, minHeight: 10, marginTop: 4 }} />
            </div>
            <div onClick={() => setOpenDay(isOpen ? null : day.num)} style={{ flex: 1, background: isPast ? "rgba(122,170,124,0.06)" : C.white, border: `1px solid ${isToday ? C.gold : (isOpen ? color : C.riceDark)}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", boxShadow: isOpen ? `0 6px 24px ${color}22` : "0 1px 4px rgba(0,0,0,0.04)", transition: "all 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: C.textGhost, fontWeight: 400, fontFamily: SANS, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{day.date}</span>
                    {isToday && <span style={{ background: C.gold, color: C.white, padding: "1px 7px", borderRadius: 10, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em" }}>TODAY</span>}
                    {isPast && <span style={{ color: C.moss, fontSize: 11 }}>✓</span>}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 21, color: "#0f0a06", marginTop: 4, lineHeight: 1.25, fontWeight: 600 }}>{day.title}</div>
                  <div style={{ fontSize: 14, color: "#3a2a1a", marginTop: 6, lineHeight: 1.5, fontFamily: SANS }}>{day.anchor}</div>
                </div>
                <div style={{ fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", background: bg, color, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 600, fontFamily: SANS }}>{day.badge}</div>
              </div>
              {isOpen && (
                <div style={{ borderTop: `1px solid ${C.riceDeep}`, marginTop: 12, paddingTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  {day.schedule.map((s, i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "55px 22px 1fr", gap: 10, alignItems: "baseline" }}>
                      <div style={{ fontFamily: SERIF, fontSize: 15, color: C.gold, textAlign: "right", fontWeight: 600 }}>{s.time}</div>
                      <div style={{ fontSize: 15, textAlign: "center" }}>{s.icon}</div>
                      <div style={{ fontSize: 15, color: "#3a2a1a", lineHeight: 1.6, fontFamily: SANS }}>{s.act}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DiningView() {
  const total = dining.reduce((sum, d) => sum + (d.costMid || 0), 0);
  return (
    <div>
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, overflow: "hidden" }}>
        {dining.map((d, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", alignItems: "center", gap: 12, padding: "16px 16px", borderBottom: i < dining.length - 1 ? `1px solid ${C.riceDeep}` : "none" }}>
            <div style={{ fontFamily: SERIF, fontSize: 28, color: C.riceDark, textAlign: "center", fontWeight: 600 }}>{d.day}</div>
            <div>
              <div style={{ fontFamily: SERIF, fontSize: 18, color: "#0f0a06", fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 14, color: "#5a4a30", marginTop: 3, lineHeight: 1.5, fontFamily: SANS }}>{d.type}</div>
            </div>
            <div style={{ fontSize: 14, color: C.gold, textAlign: "right", fontWeight: 500, fontFamily: SANS }}>{d.cost}</div>
          </div>
        ))}
      </div>
      <Divider />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textGhost, fontFamily: SANS, fontWeight: 600 }}>Est. dining total</div>
          <div style={{ fontSize: 11, color: C.textGhost, marginTop: 3, fontFamily: SANS }}>Midpoint of ranges · AUD · for two</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.ember, fontWeight: 600 }}>~${total}</div>
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
  const prevComplete = useRef(false);

  useEffect(() => {
    if (isComplete && !prevComplete.current) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 4000);
      prevComplete.current = true;
      return () => clearTimeout(t);
    }
    if (!isComplete) prevComplete.current = false;
  }, [isComplete]);

  const barColor = pct < 33 ? C.ember : pct < 75 ? C.gold : C.moss;

  return (
    <div>
      <NotesSection notes={notes} setNotes={setNotes} />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
        <Confetti show={celebrate} />
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
          <span style={{ fontSize: 13, color: "#5a4a30", fontWeight: 500, fontFamily: SANS }}>{isComplete ? "✦ All done! Selamat jalan ✦" : "Progress"}</span>
          <span style={{ fontSize: 13, color: barColor, fontWeight: 700, fontFamily: SANS }}>{done} / {total}</span>
        </div>
        <div style={{ background: C.riceDeep, borderRadius: 4, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.ember}, ${barColor})`, height: "100%", transition: "width 0.4s, background 0.4s" }} />
        </div>
      </div>
      {bookings.map((item, i) => {
        if (item.section) return <SectionHead key={`s${i}`} label={item.section} />;
        const k = `i${i}`;
        const tag = tagConfig[item.tag] || tagConfig.anytime;
        const isChecked = !!(checked && checked[k]);
        return (
          <div key={k} onClick={() => setChecked(p => ({ ...(p || {}), [k]: !(p && p[k]) }))} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 14px", background: isChecked ? "rgba(45,74,46,0.04)" : C.white, border: `1px solid ${isChecked ? "#b0c9b0" : C.riceDark}`, borderRadius: 10, marginBottom: 6, cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid ${isChecked ? C.moss : C.riceDark}`, background: isChecked ? C.moss : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
              {isChecked && <span style={{ color: C.white, fontSize: 14 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, color: isChecked ? "#5a4a30" : "#0f0a06", textDecoration: isChecked ? "line-through" : "none", textDecorationColor: "#7aaa7c", lineHeight: 1.4, fontWeight: 500, fontFamily: SANS }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#7a6a50", marginTop: 3, lineHeight: 1.5, fontFamily: SANS }}>{item.sub}</div>
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", background: tag.bg, color: tag.color, padding: "3px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, marginTop: 3, fontFamily: SANS }}>{tag.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function DriversView({ notes, setNotes, checked, setChecked }) {
  const actionableItems = driverPlan.filter(b => !b.section && b.status === "todo");
  const total = actionableItems.length;
  const done = Object.values(checked || {}).filter(Boolean).length;
  const totalCost = driverPlan.reduce((sum, d) => sum + (d.costMid || 0), 0);
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
        const isCheckable = item.status === "todo";
        const isChecked = !!(checked && checked[k]);
        const onClick = isCheckable ? () => setChecked(p => ({ ...(p || {}), [k]: !(p && p[k]) })) : undefined;
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
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", background: cfg.bg, color: cfg.color, padding: "3px 7px", borderRadius: 8, whiteSpace: "nowrap", flexShrink: 0, fontWeight: 700, marginTop: 3, fontFamily: SANS }}>{cfg.label}</div>
          </div>
        );
      })}
      <Divider />
      <div style={{ background: C.white, border: `1px solid ${C.riceDark}`, borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.textGhost, fontFamily: SANS, fontWeight: 600 }}>Est. transport total</div>
          <div style={{ fontSize: 11, color: C.textGhost, marginTop: 3, fontFamily: SANS }}>Midpoint of all rides + transfers · AUD</div>
        </div>
        <div style={{ fontFamily: SERIF, fontSize: 26, color: C.ember, fontWeight: 600 }}>~${totalCost}</div>
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
  const [loaded, setLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState("syncing");

  const notesDebounce = useRef({ cln: null, drn: null });
  const tripStatus = useMemo(() => getTripStatus(), []);

  // Subscribe to Firebase on mount
  useEffect(() => {
    const subs = [];
    let loadedCount = 0;
    const totalSubs = 4;

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
          <div style={{ marginTop: 14, display: "inline-block", padding: "5px 14px", background: "rgba(184,136,42,0.18)", border: "1px solid rgba(212,170,80,0.4)", borderRadius: 20, fontSize: 11, letterSpacing: "0.12em", color: "#d4aa50", textTransform: "uppercase", fontFamily: SANS, fontWeight: 600 }}>
            {tripStatus.label}
          </div>
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
        {tab === "dining" && <DiningView />}
        {tab === "spa" && <SpaView />}
        {tab === "checklist" && <ChecklistView notes={checklistNotes} setNotes={setChecklistNotes} checked={checklistChecked} setChecked={setChecklistChecked} />}
        {tab === "drivers" && <DriversView notes={driverNotes} setNotes={setDriverNotes} checked={driversChecked} setChecked={setDriversChecked} />}
      </div>

      <div style={{ background: C.night, textAlign: "center", padding: "24px 16px" }}>
        <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: "#d4aa50", marginBottom: 4, fontWeight: 500 }}>Selamat jalan ✦</div>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", color: "rgba(253,250,245,0.3)", textTransform: "uppercase", fontFamily: SANS }}>Jun 2 – 10, 2026</div>
      </div>
    </div>
  );
}
