// ===== UTILITY FUNCTIONS =====
function animateCounter(element, target, duration = 2000) {
  let start = 0
  const increment = target / (duration / 16)

  const timer = setInterval(() => {
    start += increment
    if (start >= target) {
      element.textContent = target.toLocaleString()
      clearInterval(timer)
    } else {
      element.textContent = Math.floor(start).toLocaleString()
    }
  }, 16)
}

// Animate all stat numbers on page load
document.addEventListener("DOMContentLoaded", () => {
  const statNumbers = document.querySelectorAll(".stat-number")
  statNumbers.forEach((element) => {
    const target = Number.parseInt(element.getAttribute("data-target"))
    animateCounter(element, target)
  })
  initMap()
  // initialize hover-to-select behavior for triage option buttons
  try { initHoverSelect() } catch (e) { /* fail silently if not present */ }
})
// Init hover-to-select behavior for triage option buttons
function initHoverSelect() {
  document.querySelectorAll('.options').forEach((options) => {
    options.querySelectorAll('.option-btn').forEach((btn) => {
      // use mouseenter/mouseleave per button for broader compatibility
      btn.addEventListener('mouseenter', () => {
        options.classList.add('hovering')
        btn.classList.add('hovered')
      })
      btn.addEventListener('mouseleave', () => {
        btn.classList.remove('hovered')
        // if no button is hovered, remove hovering state
        if (!options.querySelector('.option-btn.hovered')) {
          options.classList.remove('hovering')
        }
      })
    })
  })
}

// Initialize hover select immediately (DOMContentLoaded listener below will call this)


// ===== PAINEL FUNCTIONS =====
// Cidades principais do Brasil com coordenadas reais
const riskData = {
  regions: [
    { id: 1, name: "São Paulo", lat: -23.5505, lng: -46.6333, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 2, name: "Rio de Janeiro", lat: -22.9068, lng: -43.1729, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 3, name: "Salvador", lat: -12.9714, lng: -38.5104, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 4, name: "Fortaleza", lat: -3.7319, lng: -38.5267, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 5, name: "Brasília", lat: -15.7942, lng: -47.8822, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 6, name: "Manaus", lat: -3.1190, lng: -60.0217, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 7, name: "Belém", lat: -1.4554, lng: -48.4939, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
    { id: 8, name: "Recife", lat: -8.0476, lng: -34.8770, risk: Math.floor(Math.random() * 3), forecast: Math.floor(Math.random() * 100), mosquitoIndex: Math.floor(Math.random() * 100), trend: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)) },
  ]
}

let map = null
let markers = {}

function initMap() {
  const mapElement = document.getElementById("map")
  if (!mapElement) return

  if (!map) {
    map = L.map("map").setView([-10, -55], 5)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map)
  }

  updateLeafletMarkers()
  updateKPICards()
}

function getColorForRisk(risk) {
  return ["#00ff88", "#ffd700", "#ff4444"][risk] || "#00ff88"
}

function updateLeafletMarkers() {
  // Limpar marcadores antigos
  Object.values(markers).forEach((marker) => {
    if (marker) map.removeLayer(marker)
  })
  markers = {}

  riskData.regions.forEach((region) => {
    const color = getColorForRisk(region.risk)
    const riskLabel = ["Baixo", "Moderado", "Alto"][region.risk]
    
    const marker = L.circleMarker([region.lat, region.lng], {
      radius: 15,
      fillColor: color,
      color: color,
      weight: 3,
      opacity: 0.9,
      fillOpacity: 0.8,
    })
      .bindPopup(`<strong style="color: ${color};">${region.name}</strong><br><small>Risco: ${riskLabel}<br>Previsão: ${region.forecast}%</small>`)
      .addTo(map)

    marker.on("click", () => showRegionDetail(region))
    markers[region.id] = marker
  })
}

function updateKPICards() {
  const highRiskCount = riskData.regions.filter(r => r.risk === 2).length
  const totalInRisk = riskData.regions.filter(r => r.risk > 0).length
  const avgMosquito = Math.round(riskData.regions.reduce((sum, r) => sum + r.mosquitoIndex, 0) / riskData.regions.length)
  const avgForecast = Math.round(riskData.regions.reduce((sum, r) => sum + r.forecast, 0) / riskData.regions.length)

  const el1 = document.getElementById("totalRiskCount")
  const el2 = document.getElementById("avgMosquito")
  const el3 = document.getElementById("highRiskCount")
  const el4 = document.getElementById("avgForecast")

  if (el1) el1.textContent = totalInRisk
  if (el2) el2.textContent = avgMosquito + "%"
  if (el3) el3.textContent = highRiskCount
  if (el4) el4.textContent = avgForecast + "%"
}

function getRiskClass(risk) {
  return ["low", "medium", "high"][risk] || "low"
}

function showRegionDetail(region) {
  const modal = document.getElementById("detailModal")
  if (!modal) return

  document.getElementById("regionName").textContent = region.name
  document.getElementById("riskLevel").textContent = ["Baixo", "Moderado", "Alto"][region.risk]
  document.getElementById("forecast").textContent = region.forecast + "%"
  document.getElementById("mosquitoIndex").textContent = region.mosquitoIndex + "%"

  drawChart(region.trend)
  modal.classList.add("active")
}

function closeDetail() {
  const modal = document.getElementById("detailModal")
  if (modal) modal.classList.remove("active")
}

function drawChart(data) {
  const canvas = document.getElementById("riskChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")
  const width = canvas.width
  const height = canvas.height

  ctx.clearRect(0, 0, width, height)

  const barWidth = width / data.length
  const maxValue = Math.max(...data)

  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * (height - 20)
    const x = index * barWidth + 5
    const y = height - barHeight - 10

    const gradient = ctx.createLinearGradient(0, y, 0, height)
    gradient.addColorStop(0, "#00D4FF")
    gradient.addColorStop(1, "#0080FF")

    ctx.fillStyle = gradient
    ctx.fillRect(x, y, barWidth - 10, barHeight)
  })
}

function simulateDengue() {
  riskData.regions.forEach((region) => {
    region.risk = 2 // High risk
    region.forecast = (80 + Math.random() * 20) | 0
  })
  updateLeafletMarkers()
  updateKPICards()
  alert("⚠️ Surto de Dengue Simulado! Risco aumentado em todas as regiões.")
}

function reduceRisk() {
  riskData.regions.forEach((region) => {
    region.risk = (Math.random() * 2) | 0
    region.forecast = (Math.random() * 50) | 0
  })
  updateLeafletMarkers()
  updateKPICards()
  alert("✓ Risco reduzido! Medidas de controle foram implementadas.")
}

// ===== TRIAGEM FUNCTIONS =====
let triageScore = 0
let answers = {}

function selectAnswer(button, questionId, answer, points) {
  // Remove selected class from siblings
  const options = button.parentElement.querySelectorAll(".option-btn")
  options.forEach((opt) => opt.classList.remove("selected"))

  // Add selected class to clicked button
  button.classList.add("selected")

  // Store answer and score
  answers[questionId] = { answer, points }
  triageScore = Object.values(answers).reduce((sum, a) => sum + a.points, 0)
}

function submitTriage() {
  if (Object.keys(answers).length < 5) {
    alert("Por favor, responda todas as perguntas.")
    return
  }

  const form = document.getElementById("triageForm")
  const resultCard = document.getElementById("resultCard")

  if (!form || !resultCard) return

  form.style.display = "none"
  resultCard.style.display = "block"

  let resultLevel, title, description, recommendation, emoji

  if (triageScore >= 8) {
    resultLevel = "high"
    title = "🔴 Alta Prioridade"
    description = "Resultado indica alto risco epidemiológico."
    recommendation = "⚠️ Procure atendimento médico imediatamente. Você será encaminhado para avaliação prioritária."
    emoji = "🔴"
  } else if (triageScore >= 4) {
    resultLevel = "medium"
    title = "🟡 Prioridade Moderada"
    description = "Resultado indica risco moderado que requer atenção."
    recommendation = "📋 Recomenda-se agendar consulta médica nos próximos 2-3 dias para avaliação completa."
    emoji = "🟡"
  } else {
    resultLevel = "low"
    title = "🟢 Caso Leve"
    description = "Resultado indica baixo risco epidemiológico."
    recommendation = "💚 Continue monitorando seus sintomas. Procure atendimento se pioras ocorrerem."
    emoji = "🟢"
  }

  const badge = document.getElementById("resultBadge")
  const titleEl = document.getElementById("resultTitle")
  const descEl = document.getElementById("resultDescription")
  const recEl = document.getElementById("resultRecommendation")

  if (badge) {
    badge.className = `result-badge ${resultLevel}`
    badge.textContent = emoji
  }
  if (titleEl) titleEl.textContent = title
  if (descEl) descEl.textContent = description
  if (recEl) recEl.textContent = recommendation
}

function resetTriage() {
  triageScore = 0
  answers = {}

  // Reset all buttons
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.classList.remove("selected")
  })

  // Show form again
  const form = document.getElementById("triageForm")
  const resultCard = document.getElementById("resultCard")

  if (form) form.style.display = "block"
  if (resultCard) resultCard.style.display = "none"
}

// Close modal on background click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("detailModal")
  if (modal && e.target === modal) {
    closeDetail()
  }
})

// Logo click behavior: only navigate to `index.html` when the user
// is currently on `triagem.html` or `painel.html`. Otherwise prevent navigation.
document.addEventListener("DOMContentLoaded", () => {
  const logoLink = document.querySelector(".logo-link")
  if (!logoLink) return

  logoLink.addEventListener("click", (e) => {
    const href = window.location.href.toLowerCase()
    const fromTriageOrPanel = href.includes("triagem.html") || href.includes("painel.html")
    if (!fromTriageOrPanel) {
      // Prevent navigation on other pages (including index.html itself)
      e.preventDefault()
    }
    // If fromTriageOrPanel is true, allow default navigation to `index.html`.
  })
})
