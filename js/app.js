/*
  js/app.js
  Core logic for TCFV Resource Dashboard:
  - Loads full modal JSON data from TCFV_resources_full.json
  - Populates filter dropdowns
  - Renders resource cards dynamically
  - Handles search, filtering, and clear
  - Opens/closes detailed modals with summary, bullets, reminders, related, actions
*/

// DOM references
const audienceFilter = document.getElementById('audience-filter');
const topicFilter   = document.getElementById('topic-filter');
const searchBox     = document.getElementById('search-box');
const clearBtn      = document.getElementById('clear-btn');
const grid          = document.getElementById('resource-grid');
const modalOverlay  = document.getElementById('modal-overlay');
const modalContent  = document.getElementById('modal-content');
const modalClose    = document.getElementById('modal-close');

let resources = [];

// Load data from full JSON file
fetch('data/resources_full.json')
  .then(response => response.json())
  .then(data => {
    resources = data;
    populateFilters();
    renderResources();
  })
  .catch(err => console.error('Error loading resources:', err));

// Populate Audience and Topic dropdowns
function populateFilters() {
  const audSet = new Set();
  const topSet = new Set();
  resources.forEach(r => {
    (r.audience || []).forEach(a => audSet.add(a));
    (r.topics   || []).forEach(t => topSet.add(t));
  });
  [...audSet].sort().forEach(a => {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    audienceFilter.appendChild(opt);
  });
  [...topSet].sort().forEach(t => {
    const opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t;
    topicFilter.appendChild(opt);
  });
}

// Render resource cards
function renderResources() {
  const audVal = audienceFilter.value;
  const topVal = topicFilter.value;
  const q      = searchBox.value.trim().toLowerCase();
  grid.innerHTML = '';

  resources.forEach(r => {
    const matchAud = !audVal || (r.audience || []).includes(audVal);
    const matchTop = !topVal || (r.topics   || []).includes(topVal);
    const matchQ   = !q || r.name.toLowerCase().includes(q) || (r.summary && r.summary.toLowerCase().includes(q));
    if (matchAud && matchTop && matchQ) {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl shadow p-5 flex flex-col';
      card.innerHTML = `
        <h4 class="font-baskerville text-lg mb-2">${r.icon} ${r.name}</h4>
        <p class="text-sm text-[#45375a] mb-3"><strong>Topics:</strong> ${(r.topics||[]).join(', ')}</p>
        <p class="text-sm text-[#45375a] flex-grow">${r.summary || ''}</p>
        <button class="mt-4 bg-[#624B78] text-white px-4 py-2 rounded read-more-btn" data-name="${r.name}">Read More</button>
      `;
      grid.appendChild(card);
    }
  });
}

// Event listeners
[audienceFilter, topicFilter].forEach(el => el.addEventListener('change', renderResources));
searchBox.addEventListener('input', renderResources);
clearBtn.addEventListener('click', () => {
  audienceFilter.value = '';
  topicFilter.value    = '';
  searchBox.value      = '';
  renderResources();
});

// Modal logic
grid.addEventListener('click', e => {
  if (e.target.classList.contains('read-more-btn')) {
    const name = e.target.dataset.name;
    const res  = resources.find(r => r.name === name);
    if (!res) return;

    let html = `
      <h2 class="font-baskerville text-2xl mb-3">${res.icon} ${res.name}</h2>
      <p class="mb-2"><strong>Audience:</strong> ${(res.audience||[]).join(', ')}</p>
      <p class="mb-4"><strong>Topics:</strong> ${(res.topics||[]).join(', ')}</p>
      <p class="mb-4">${res.summary}</p>
      <ul class="list-disc list-inside mb-4">
        ${(res.bullets||[]).map(b => `<li>${b}</li>`).join('')}
      </ul>
    `;
    if (res.reminder) html += `<p class="mb-4 italic">${res.reminder}</p>`;
    if (res.related && res.related.length) html += `<p class="mb-4"><strong>Related:</strong> ${res.related.join(', ')}</p>`;

    html += '<div class="space-x-2 mb-4">';
    (res.actions||[]).forEach(a => {
      html += `<button class="px-4 py-1 bg-[#AC95C1] text-white rounded">${a}</button>`;
    });
    html += '</div>';
    html += `<a href="${res.link}" target="_blank" class="underline font-semibold">Open Resource</a>`;

    modalContent.innerHTML = html;
    modalOverlay.classList.remove('pointer-events-none','opacity-0');
    modalOverlay.classList.add('opacity-100');
  }
});

modalClose.addEventListener('click', () => modalOverlay.classList.add('opacity-0','pointer-events-none'));
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) modalClose.click(); });
