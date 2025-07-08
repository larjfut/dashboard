/*
  js/app.js
  Core logic for TCFV Resource Dashboard:
  - Loads resource data from data/resources.json
  - Populates filter dropdowns
  - Renders resource cards dynamically
  - Handles search, filtering, and clear
  - Opens/closes detailed modals with summary, bullets, reminders, related, actions
*/

// DOM references
const audienceFilter = document.getElementById("audience-filter")
const topicFilter = document.getElementById("topic-filter")
const searchBox = document.getElementById("search-box")
const clearBtn = document.getElementById("clear-btn")
const grid = document.getElementById("resource-grid")
const modalOverlay = document.getElementById("modal-overlay")
const modalContent = document.getElementById("modal-content")
const modalClose = document.getElementById("modal-close")
const quickTopics = document.getElementById("quick-topics")

let resources = []

function toArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  return String(val)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function normalizeResource(raw) {
  return {
    name: raw.name ?? raw["Resource Name"] ?? "",
    icon: raw.icon ?? raw.Icon ?? "",
    summary: raw.summary ?? raw["Short Description"] ?? "",
    link: raw.link ?? raw["Full Link"] ?? "",
    date: raw.date ?? raw.Date ?? "",
    audience: toArray(raw.audience ?? raw.Audience),
    topics: toArray(raw.topics ?? raw.Topics),
    bullets: raw.bullets || [],
    reminder: raw.reminder || "",
    related: raw.related || [],
    actions: raw.actions || [],
  }
}

const predefinedAudiences = [
  "Survivors",
  "Advocates",
  "Campus Advocates",
  "Child Welfare Partners",
  "Data Administrators",
  "Executive Directors",
  "Educators",
  "Finance Professionals",
  "General Public",
  "Grants Professionals",
  "IT & Operations Staff",
  "Legislators",
  "Outreach Teams",
  "Policy Professionals",
  "Prevention Educators",
  "Program Managers",
  "Prosecutors",
  "System Partners",
  "Youth",
  "Youth Allies",
]

const predefinedTopics = [
  "Safety Planning",
  "Housing",
  "Legal",
  "Technology Safety",
  "Child Welfare",
  "Advocacy Skills",
  "Prevention",
  "Youth",
  "Data & Reporting",
  "Wellness & Self-Care",
  "Finance & Budgeting",
  "BIPP",
  "Elections & Voting",
]

// Load resource data
fetch("data/resources.json")
  .then((res) => res.json())
  .then((data) => {
    resources = data.map(normalizeResource)
    populateFilters()
    renderResources()
  })
  .catch((err) => console.error("Failed to load resources:", err))

// Populate audience and topic filters
function populateFilters() {
  const audSet = new Set(predefinedAudiences)
  const topSet = new Set(predefinedTopics)
  resources.forEach((r) => {
    ;(r.audience || []).forEach((a) => audSet.add(a))
    ;(r.topics || []).forEach((t) => topSet.add(t))
  })
  // Audience
  audSet.forEach((a) => {
    const opt = document.createElement("option")
    opt.value = a
    opt.textContent = a
    audienceFilter.appendChild(opt)
  })
  // Topics
  topSet.forEach((t) => {
    const opt = document.createElement("option")
    opt.value = t
    opt.textContent = t
    topicFilter.appendChild(opt)
  })
}

// Render cards based on filters and search
function renderResources() {
  const audVal = audienceFilter.value
  const topVal = topicFilter.value
  const query = searchBox.value.trim().toLowerCase()

  grid.innerHTML = ""
  resources.forEach((r) => {
    const matchesAud = !audVal || (r.audience || []).includes(audVal)
    const matchesTop = !topVal || (r.topics || []).includes(topVal)
    const matchesQuery =
      !query ||
      r.name.toLowerCase().includes(query) ||
      (r.summary && r.summary.toLowerCase().includes(query))
    if (matchesAud && matchesTop && matchesQuery) {
      const card = document.createElement("div")
      card.className = "bg-white rounded-2xl shadow p-5 flex flex-col"
      card.innerHTML = `
        <h4 class="font-baskerville text-lg mb-2">${r.icon} ${r.name}</h4>
        <p class="text-sm text-[#45375a] mb-2"><strong>Audience:</strong> ${(r.audience || []).join(", ")}</p>
        <p class="text-sm text-[#45375a] mb-3"><strong>Topics:</strong> ${(r.topics || []).join(", ")}</p>
        <p class="text-sm text-[#45375a] flex-grow">${r.summary || ""}</p>
        <button class="mt-4 bg-[#624B78] text-white px-4 py-2 rounded read-more-btn" data-name="${r.name}">Read More</button>
      `
      grid.appendChild(card)
    }
  })
}

// Event listeners for filters and search
;[audienceFilter, topicFilter].forEach((el) =>
  el.addEventListener("change", renderResources),
)
searchBox.addEventListener("input", renderResources)
clearBtn.addEventListener("click", () => {
  audienceFilter.value = ""
  topicFilter.value = ""
  searchBox.value = ""
  renderResources()
})

quickTopics.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-topic]")
  if (!btn) return
  e.preventDefault()
  topicFilter.value = btn.dataset.topic
  renderResources()
})

// Modal open/close logic
grid.addEventListener("click", (e) => {
  if (e.target.classList.contains("read-more-btn")) {
    const name = e.target.dataset.name
    const res = resources.find((item) => item.name === name)
    if (!res) return

    let content = `
      <h2 class="font-baskerville text-2xl mb-3">${res.icon} ${res.name}</h2>
      <p class="mb-2"><strong>Audience:</strong> ${(res.audience || []).join(", ")}</p>
      <p class="mb-4"><strong>Topics:</strong> ${(res.topics || []).join(", ")}</p>
      <p class="mb-4">${res.summary}</p>
      <ul class="list-disc list-inside mb-4">
        ${(res.bullets || []).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `
    if (res.reminder) content += `<p class="mb-4 italic">${res.reminder}</p>`
    if (res.related && res.related.length)
      content += `<p class="mb-4"><strong>Related:</strong> ${res.related.join(", ")}</p>`

    // Actions buttons
    content += '<div class="space-x-2 mb-4">'
    ;(res.actions || []).forEach((act) => {
      content += `<button class="px-4 py-1 bg-[#AC95C1] text-white rounded">${act}</button>`
    })
    content += "</div>"
    // Link to resource
    content += `<a href="${res.link}" target="_blank" class="underline font-semibold">Open Resource</a>`

    modalContent.innerHTML = content
    modalOverlay.classList.remove("pointer-events-none", "opacity-0")
    modalOverlay.classList.add("opacity-100")
  }
})

modalClose.addEventListener("click", () => {
  modalOverlay.classList.add("opacity-0", "pointer-events-none")
  modalOverlay.classList.remove("opacity-100")
})
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) modalClose.click()
})
