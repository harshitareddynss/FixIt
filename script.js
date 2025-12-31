
// 📌 Import Firebase
import { db, storage } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// 📌 UI Elements
const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const imageUpload = document.getElementById("imageUpload");

// 📌 BOT + USER message display
function bot(msg) {
  messages.innerHTML += `<div class="bot-msg">${msg}</div>`;
  messages.scrollTop = messages.scrollHeight;
}
function user(msg) {
  messages.innerHTML += `<div class="user-msg">${msg}</div>`;
  messages.scrollTop = messages.scrollHeight;
}

// ------------------------------------------------------------
// 📌 MASTER MAP (This guarantees Firestore match)
// ------------------------------------------------------------
const applianceMap = {
  "fan": "fan",
  "ceiling fan": "ceiling fan",
  "ac": "air conditioner",
  "air conditioner": "air conditioner",
  "tv": "television",
  "television": "television",
  "remote": "tv remote",
  "tv remote": "tv remote",
  "smart remote": "tv remote",
  "router": "router",
  "wifi router": "router",
  "modem": "router",
  "mixer": "mixer",
  "mixi": "mixer",
  "blender": "mixer",
  "microwave": "microwave",
  "microwave oven": "microwave",
  "geyser": "geyser",
  "water heater": "geyser",
  "induction": "induction stove",
  "induction stove": "induction stove",
  "light bulb": "light bulb",
  "bulb": "light bulb",
  "refrigerator": "refrigerator",
  "fridge": "refrigerator",
  "washing machine": "washing machine",
  "washer": "washing machine",
  "iron": "electrical iron box",
  "electrical iron box": "electrical iron box",
  "iron box": "electrical iron box",
  "water purifier": "water purifier"
};

// 📌 ISSUES MAP
const issueMap = {
  "noise": "noise",
  "noisy": "noise",
  "sparks": "sparks",
  "spark": "sparks",
  "sparks inside": "sparks inside",
  "not working": "not working",
  "dead": "not working",
  "won't start": "not working",
  "no power": "not working",
  "water leakage": "water leakage",
  "leaking": "water leakage",
  "overheating": "overheating",
  "too hot": "overheating",
  "low cooling": "low cooling",
  "not cooling": "low cooling",
  "cooling problem": "low cooling",
  "burning smell": "burning smell",
  "smoke": "smoke coming out",
  "smoke coming out": "smoke coming out",
  "water flow low": "water flow low",
  "bulb not glowing": "bulb not glowing",
  "internet disconnected": "internet disconnected",
  "not heating properly": "not heating properly",
  "water near power socket": "water near power socket",
  "wobbing": "wobbing"
};

// ------------------------------------------------------------
// 📌 MAIN SEND FUNCTION
// ------------------------------------------------------------
export async function sendMessage() {

  // 🧽 Clean text
  let text = input.value.toLowerCase().trim();
  text = text.replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ");
  if (!text) return;

  user(text);
  input.value = "";

  // 🧠 Match appliance
  const foundA = Object.keys(applianceMap)
    .sort((a,b)=>b.length-a.length)
    .find(key => text.includes(key));

  if (!foundA) {
    return bot("🔎 Please mention the appliance (ex: fan, ac, mixer, router, tv remote...)");
  }

  const applianceKey = applianceMap[foundA];

  // 🧠 Match issue
  const foundI = Object.keys(issueMap)
    .sort((a,b)=>b.length-a.length)
    .find(key => text.includes(key));

  if (!foundI) {
    return bot("⚠️ Mention the problem (ex: noise, low cooling, water leakage, sparks...)");
  }

  const issueKey = issueMap[foundI];

  // 🚀 Show checking
  bot(`⏳ Checking FIXIT Knowledge Base for: <b>${applianceKey} → ${issueKey}</b>`);

  // 📌 Firestore fetch
  const docRef = doc(db, "appliances", applianceKey, "issues", issueKey);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return bot(`❌ Data missing for this issue.\n👉 Add it in Firestore:\nappliances/${applianceKey}/issues/${issueKey}`);
  }

  const data = docSnap.data();

  // ------------------------------------------------------------
  //  UI OUTPUT
  // ------------------------------------------------------------

  // ⚠️ RISK
  bot(`
    <div class="result-block">
    <h3>⚠️ Risk Level: ${(data.risk || "unknown").toUpperCase()}</h3>
    </div>
  `);

  // 🛠 STEPS
  if (Array.isArray(data.steps)) {
    let stepsHTML = data.steps.map((s,i)=>`${i+1}. ${s}`).join("<br>");
    bot(`
      <div class="result-block">
      <h3>🛠 Try these steps:</h3>
      <p>${stepsHTML}</p>
      </div>
    `);
  }

  // 🎬 IMAGE SUPPORT (if exists)
  if (Array.isArray(data.images)) {
    data.images.forEach((img,i)=>{
      bot(`<h4>📸 Step ${i+1} Visual:</h4><img src="${img}" class="guide-img"/>`);
    });
  }

  // ⚡ PRECAUTIONS
  if (Array.isArray(data.precautions)) {
    let pHTML = data.precautions.map(p=>`⚡ ${p}`).join("<br>");
    bot(`
      <div class="result-block">
      <h3>⚡ Safety Precautions:</h3>
      ${pHTML}
      </div>
    `);
  }

  // 👨‍🔧 TECHNICIAN
  bot(`
    <div class="result-block">
    <h3>👨‍🔧 If not solved:</h3>
    <p>${data["technician message"] || data.technician || "Consult a professional."}</p>
    </div>
  `);
}

// ------------------------------------------------------------
// 📌 Send button
// ------------------------------------------------------------
window.sendMessage = sendMessage;

// ------------------------------------------------------------
// 📸 IMAGE UPLOAD (for future AI image analysis)
// ------------------------------------------------------------
imageUpload?.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return bot("🚫 No image selected");

  bot("📸 Uploading image...");

  const fileRef = ref(storage, "uploads/" + file.name);
  await uploadBytes(fileRef, file);
  const link = await getDownloadURL(fileRef);

  bot(`🖼️ Uploaded → <a href="${link}" target="_blank">${link}</a>`);
});