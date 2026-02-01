/***********************
 * GLOBAL STATE
 ***********************/
let cpuSeries = [];
let memSeries = [];
let errSeries = [];
let netSeries = [];
const SPARK_POINTS = 25;
let consecutiveHighRisk = 0;
let incidentTimeline = [];
let lastRiskLevel = null;
let cpuHistory = [];
let memoryHistory = [];
let errorHistory = [];
let riskHistory = [];
const MAX_POINTS = 20;
const API_URL = "http://127.0.0.1:8000/predict";

/***********************
 * MAIN FETCH FUNCTION
 ***********************/
async function fetchPrediction() {
  try {
    /* =========================
       1️⃣ SELECT SERVICE
    ========================= */
    const serverSelect = document.getElementById("serverSelect");
    const server = serverSelect ? serverSelect.value : "default";
        const contextEl = document.getElementById("serviceContext");
    if (contextEl) {
      contextEl.innerText =
        "Monitoring: " + server.toUpperCase() + " SERVICE";
    }

    /* =========================
       2️⃣ BUILD PAYLOAD (FIRST!)
    ========================= */
    let payload;

    if (server === "db") {
      payload = {
        cpu: Math.random() * 40 + 50,
        memory: Math.random() * 30 + 60,
        disk: Math.random() * 30 + 65,
        network: Math.random() * 200 + 100,
        errors: Math.floor(Math.random() * 10)
      };
    } else if (server === "payment") {
      payload = {
        cpu: Math.random() * 50 + 40,
        memory: Math.random() * 40 + 45,
        disk: Math.random() * 40 + 40,
        network: Math.random() * 300 + 150,
        errors: Math.floor(Math.random() * 12)
      };
    } else {
      payload = {
        cpu: Math.random() * 60 + 30,
        memory: Math.random() * 50 + 40,
        disk: Math.random() * 55 + 30,
        network: Math.random() * 300 + 80,
        errors: Math.floor(Math.random() * 15)
      };
    }

    // ----------------------------
// METRIC CORRELATION SERIES
// ----------------------------
cpuSeries.push(payload.cpu);
memSeries.push(payload.memory);
errSeries.push(payload.errors);
netSeries.push(payload.network);

if (cpuSeries.length > SPARK_POINTS) cpuSeries.shift();
if (memSeries.length > SPARK_POINTS) memSeries.shift();
if (errSeries.length > SPARK_POINTS) errSeries.shift();
if (netSeries.length > SPARK_POINTS) netSeries.shift();


    /* =========================
       3️⃣ KPI HISTORY UPDATE
    ========================= */
    cpuHistory.push(payload.cpu);
    memoryHistory.push(payload.memory);
    errorHistory.push(payload.errors);

    if (cpuHistory.length > 20) cpuHistory.shift();
    if (memoryHistory.length > 20) memoryHistory.shift();
    if (errorHistory.length > 20) errorHistory.shift();

    const avgCpu =
      cpuHistory.reduce((a, b) => a + b, 0) / cpuHistory.length;

    const avgMemory =
      memoryHistory.reduce((a, b) => a + b, 0) / memoryHistory.length;

    const avgErrors =
      errorHistory.reduce((a, b) => a + b, 0) / errorHistory.length;

    document.getElementById("kpiCpu").innerText =
      avgCpu.toFixed(1) + "%";

    document.getElementById("kpiMemory").innerText =
      avgMemory.toFixed(1) + "%";

    document.getElementById("kpiErrors").innerText =
      avgErrors.toFixed(1);

    document.getElementById("kpiThroughput").innerText =
      Math.floor(Math.random() * 500 + 800) + "/min";

      document.getElementById("kpiCpu").style.color =
  avgCpu > 80 ? "#ef4444" : avgCpu > 60 ? "#facc15" : "#22c55e";

document.getElementById("kpiMemory").style.color =
  avgMemory > 80 ? "#ef4444" : avgMemory > 60 ? "#facc15" : "#22c55e";


    /* =========================
       4️⃣ SEND TO AI BACKEND
    ========================= */
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("API error:", response.status);
      return;
    }

    const data = await response.json();

    // ----------------------------
// INCIDENT TIMELINE LOGIC
// ----------------------------
if (data.risk_level !== lastRiskLevel) {
  const time = new Date().toLocaleTimeString();

  let reason = "Risk state changed";
  if (data.explanation && data.explanation.length > 0) {
    reason =
      data.explanation[0].feature.toUpperCase() +
      " anomaly detected";
  }

  incidentTimeline.unshift({
    time: time,
    risk: data.risk_level,
    reason: reason
  });

  if (incidentTimeline.length > 6) {
    incidentTimeline.pop();
  }

  lastRiskLevel = data.risk_level;
}

// ----------------------------
// RENDER TIMELINE
// ----------------------------
const timelineEl = document.getElementById("timeline");
timelineEl.innerHTML = "";

incidentTimeline.forEach(event => {
  const row = document.createElement("div");
  row.className = "event " + event.risk.toLowerCase();

  row.innerHTML = `
    <time>${event.time}</time>
    <div class="risk">${event.risk}</div>
    <div class="reason">${event.reason}</div>
  `;

  timelineEl.appendChild(row);
});



    /* =========================
       5️⃣ AI RISK DISPLAY
    ========================= */
    const riskEl = document.getElementById("risk");
    riskEl.innerText = data.risk_level;
    riskEl.className = "risk-value " + data.risk_level.toLowerCase();

    document.getElementById("prob").innerText =
      `Probability: ${(data.incident_probability * 100).toFixed(1)}%`;

    /* =========================
       6️⃣ RISK RING
    ========================= */
    const ring = document.getElementById("ring");
    const offset = 377 - (377 * data.incident_probability);
    ring.style.strokeDashoffset = offset;

    /* =========================
       7️⃣ EXPLANATION BARS
    ========================= */
    const reasonsDiv = document.getElementById("reasons");
    reasonsDiv.innerHTML = "";

    if (data.explanation && data.explanation.length > 0) {
      data.explanation.forEach(item => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.innerText = item.feature.toUpperCase();

        const fill = document.createElement("div");
        fill.className = "fill";
        fill.style.width = Math.min(item.impact * 300, 300) + "px";

        bar.appendChild(fill);
        reasonsDiv.appendChild(bar);
      });
    }

    /* =========================
       8️⃣ SUMMARY
    ========================= */
    const summaryEl = document.getElementById("summary");
    if (data.explanation && data.explanation.length > 0) {
      summaryEl.innerText =
        `Primary risk driver: ${data.explanation[0].feature.toUpperCase()} anomaly detected`;
    } else {
      summaryEl.innerText = "No dominant risk factor detected yet";
    }

    /* =========================
       9️⃣ TIME-SERIES CHART
    ========================= */
    riskHistory.push(data.incident_probability);
    if (riskHistory.length > MAX_POINTS) riskHistory.shift();
    drawChart();

    // ----------------------------
// DRAW METRIC CORRELATION
// ----------------------------
drawSparkline("cpuSpark", cpuSeries, "#38bdf8");
drawSparkline("memSpark", memSeries, "#a78bfa");
drawSparkline("errSpark", errSeries, "#ef4444");
drawSparkline("netSpark", netSeries, "#22c55e");

document.getElementById("lastUpdate").innerText =
  new Date().toLocaleTimeString();


  } catch (err) {
    console.error("Fetch failed:", err);
  }


// ----------------------------
// ALERT LOGIC (SMART)
// ----------------------------
if (data.risk_level === "HIGH") {
  consecutiveHighRisk += 1;
} else {
  consecutiveHighRisk = 0;
}

const alertEl = document.getElementById("alertStatus");

if (consecutiveHighRisk >= 3) {
  alertEl.innerText =
    "🚨 ACTIVE ALERT: Sustained HIGH risk detected";
  alertEl.className = "alert-critical";
} else if (consecutiveHighRisk === 2) {
  alertEl.innerText =
    "⚠️ Warning: Risk trending HIGH";
  alertEl.className = "alert-warn";
} else {
  alertEl.innerText =
    "✅ No active alerts";
  alertEl.className = "alert-ok";
}



}

function drawSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || data.length < 2) return;

  const ctx = canvas.getContext("2d");

  // 🔥 CRITICAL: set real drawing size
  canvas.width = 260;
  canvas.height = 26;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  data.forEach((value, i) => {
    const x = (i / (data.length - 1)) * canvas.width;
    const y =
      canvas.height -
      ((value - min) / range) * canvas.height;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();
}




/***********************
 * CHART DRAWING
 ***********************/
function drawChart() {
      const canvas = document.getElementById("riskChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  canvas.width = 360;
  canvas.height = 160;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(148,163,184,0.15)";
for (let i = 0; i <= 4; i++) {
  const y = (canvas.height / 4) * i;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(canvas.width, y);
  ctx.stroke();
}


  // -----------------------------
  // BACKGROUND ZONES (THRESHOLDS)
  // -----------------------------
  // LOW (0–40%)
  ctx.fillStyle = "rgba(34,197,94,0.12)";
  ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

  // MEDIUM (40–70%)
  ctx.fillStyle = "rgba(250,204,21,0.12)";
  ctx.fillRect(0, canvas.height * 0.3, canvas.width, canvas.height * 0.3);

  // HIGH (70–100%)
  ctx.fillStyle = "rgba(239,68,68,0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.3);

  // -----------------------------
  // AXIS LABELS
  // -----------------------------
  ctx.fillStyle = "#94a3b8";
  ctx.font = "10px Arial";
  ctx.fillText("100%", 4, 12);
  ctx.fillText("70%", 4, canvas.height * 0.3);
  ctx.fillText("40%", 4, canvas.height * 0.6);
  ctx.fillText("0%", 4, canvas.height - 4);

  // -----------------------------
  // RISK LINE
  // -----------------------------
  ctx.lineWidth = 2;
  ctx.beginPath();

  riskHistory.forEach((value, index) => {
    const x = (index / (MAX_POINTS - 1)) * canvas.width;
    const y = canvas.height - value * canvas.height;

    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  // Dynamic color based on last value
  const last = riskHistory[riskHistory.length - 1] || 0;

  if (last > 0.7) ctx.strokeStyle = "#ef4444";
  else if (last > 0.4) ctx.strokeStyle = "#facc15";
  else ctx.strokeStyle = "#22c55e";

  ctx.stroke();

  // -----------------------------
  // LAST POINT MARKER
  // -----------------------------
  if (riskHistory.length > 0) {
    const x = ((riskHistory.length - 1) / (MAX_POINTS - 1)) * canvas.width;
    const y = canvas.height - last * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }
  
}

/***********************
 * START LIVE LOOP
 ***********************/
fetchPrediction();
setInterval(fetchPrediction, 3000);
