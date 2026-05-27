// =============================================
//   MISCAJITASDAILY — app.js
//   Firebase + Full App Logic
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDropsWithPrices, saveCustomPrice, saveCustomWeapon, deleteCustomWeapon, getCustomWeapons }
  from "./drops-data.js";

// ============================================
// 🔥 FIREBASE CONFIG
// ============================================
const firebaseConfig = {
  apiKey: "AIzaSyC0r0DHrLBJEraeQbdLEyVf7TFRrCmO3pk",
  authDomain: "cstraker-f83f0.firebaseapp.com",
  projectId: "cstraker-f83f0",
  storageBucket: "cstraker-f83f0.firebasestorage.app",
  messagingSenderId: "929272497397",
  appId: "1:929272497397:web:f12e74a08442709b42b1bc"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ---- State ----
let allRecords = [];
let selectedDrops = [];
let pendingPriceEdit = null;

const $ = id => document.getElementById(id);

// ====================
//  NAVIGATION
// ====================
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    $(`view-${btn.dataset.view}`).classList.add('active');
    if (btn.dataset.view === 'historial') renderHistorial();
  });
});

// ====================
//  DROP TABS
// ====================
document.querySelectorAll('.drop-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.drop-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.drop-category').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    $(`cat-${tab.dataset.cat}`).classList.add('active');
  });
});

// ====================
//  RENDER DROP LISTS
// ====================
function renderDropLists(filter = { cajas: '', armas: '' }) {
  const drops = getDropsWithPrices();

  // --- CAJAS ---
  const cajasContainer = $('drops-cajas');
  const filtCajas = filter.cajas.toLowerCase();
  const filteredCajas = drops.cajas.filter(i => i.name.toLowerCase().includes(filtCajas));
  cajasContainer.innerHTML = filteredCajas.map(item => {
    const isSelected = selectedDrops.some(s => s.id === item.id);
    return `
      <div class="drop-item ${isSelected ? 'selected' : ''}" data-id="${item.id}" data-type="caja">
        <span class="di-name">${item.name}</span>
        <span class="di-price" data-id="${item.id}" title="Click para editar precio">$${item.price.toFixed(2)}</span>
      </div>`;
  }).join('') || '<div class="empty-state small">Sin resultados</div>';

  cajasContainer.querySelectorAll('.drop-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('di-price')) return;
      const item = drops.cajas.find(i => i.id === el.dataset.id);
      if (item) toggleDropSelection(item, 'caja');
    });
  });
  cajasContainer.querySelectorAll('.di-price').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const item = drops.cajas.find(i => i.id === el.dataset.id);
      if (item) openPriceModal(item, 'caja');
    });
  });

  // --- ARMAS (custom) ---
  renderArmasList(filter.armas);
}

function renderArmasList(filter = '') {
  const weapons = getCustomWeapons();
  const container = $('drops-armas');
  const filt = filter.toLowerCase();
  const filtered = weapons.filter(w => w.name.toLowerCase().includes(filt));

  container.innerHTML = `
    <div class="add-weapon-row">
      <input type="text" class="form-input" id="new-weapon-name" placeholder="Ej: AK-47 | Redline" style="flex:1" />
      <input type="number" step="0.01" min="0" class="form-input" id="new-weapon-price" placeholder="Precio USD" style="width:130px" />
      <button class="btn-primary" id="btn-add-weapon" style="white-space:nowrap">+ AGREGAR</button>
    </div>
    ${filtered.length === 0 ? '<div class="empty-state small">No hay armas guardadas. ¡Agregá la primera arriba!</div>' :
      filtered.map(w => {
        const isSelected = selectedDrops.some(s => s.id === w.id);
        return `
          <div class="drop-item ${isSelected ? 'selected' : ''}" data-id="${w.id}" data-type="arma">
            <span class="di-name">${w.name}</span>
            <div style="display:flex;align-items:center;gap:.5rem">
              <span class="di-price" data-id="${w.id}" title="Click para editar precio">$${w.price.toFixed(2)}</span>
              <button class="btn-delete-weapon" data-id="${w.id}" title="Eliminar arma">🗑</button>
            </div>
          </div>`;
      }).join('')
    }`;

  // Add weapon
  $('btn-add-weapon').addEventListener('click', () => {
    const name = $('new-weapon-name').value.trim();
    const price = parseFloat($('new-weapon-price').value);
    if (!name) { showToast('Escribí el nombre del arma', 'error'); return; }
    if (isNaN(price) || price < 0) { showToast('Precio inválido', 'error'); return; }
    const newWeapon = { id: `weapon_${Date.now()}`, name, price, type: 'arma' };
    saveCustomWeapon(newWeapon);
    $('new-weapon-name').value = '';
    $('new-weapon-price').value = '';
    renderArmasList($('search-armas').value);
    showToast(`✅ "${name}" agregada`, 'success');
  });

  // Select weapon
  container.querySelectorAll('.drop-item').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.classList.contains('di-price') || e.target.classList.contains('btn-delete-weapon')) return;
      const weapons2 = getCustomWeapons();
      const item = weapons2.find(w => w.id === el.dataset.id);
      if (item) toggleDropSelection(item, 'arma');
    });
  });

  // Edit price
  container.querySelectorAll('.di-price').forEach(el => {
    el.addEventListener('click', e => {
      e.stopPropagation();
      const weapons2 = getCustomWeapons();
      const item = weapons2.find(w => w.id === el.dataset.id);
      if (item) openPriceModal(item, 'arma');
    });
  });

  // Delete weapon
  container.querySelectorAll('.btn-delete-weapon').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      // Remove from selected too
      selectedDrops = selectedDrops.filter(s => s.id !== id);
      deleteCustomWeapon(id);
      renderArmasList($('search-armas').value);
      renderSelectedDrops();
      showToast('Arma eliminada', 'success');
    });
  });
}

function toggleDropSelection(item, type) {
  const existing = selectedDrops.findIndex(s => s.id === item.id);
  if (existing > -1) {
    selectedDrops.splice(existing, 1);
  } else {
    selectedDrops.push({ id: item.id, name: item.name, type, price: item.price });
  }
  renderDropLists({ cajas: $('search-cajas').value, armas: $('search-armas').value });
  renderSelectedDrops();
}

function renderSelectedDrops() {
  const list = $('selected-drops-list');
  $('selected-count').textContent = `(${selectedDrops.length})`;
  if (selectedDrops.length === 0) {
    list.innerHTML = '<div class="empty-state small">Seleccioná items de arriba para agregarlos</div>';
    $('week-total-preview').textContent = '$0.00';
    return;
  }
  const total = selectedDrops.reduce((s, d) => s + d.price, 0);
  list.innerHTML = selectedDrops.map(d => `
    <div class="selected-drop-row" data-id="${d.id}">
      <span class="sdr-name">${d.name}</span>
      <span class="sdr-type">${d.type === 'caja' ? '📦 CAJA' : '🔫 ARMA'}</span>
      <span class="sdr-price">$${d.price.toFixed(2)}</span>
      <button class="sdr-remove" data-id="${d.id}">✕</button>
    </div>`).join('');
  $('week-total-preview').textContent = `$${total.toFixed(2)}`;

  list.querySelectorAll('.sdr-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDrops = selectedDrops.filter(d => d.id !== btn.dataset.id);
      renderDropLists({ cajas: $('search-cajas').value, armas: $('search-armas').value });
      renderSelectedDrops();
    });
  });
}

// Search
$('search-cajas').addEventListener('input', e => {
  renderDropLists({ cajas: e.target.value, armas: $('search-armas').value });
});
$('search-armas').addEventListener('input', e => {
  renderArmasList(e.target.value);
});

// ====================
//  PRICE MODAL
// ====================
function openPriceModal(item, type) {
  $('modal-item-name').textContent = item.name;
  $('modal-price-input').value = item.price.toFixed(2);
  $('modal-overlay').classList.remove('hidden');
  $('modal-price-input').focus();
  pendingPriceEdit = { id: item.id, type };
}
$('modal-cancel').addEventListener('click', () => {
  $('modal-overlay').classList.add('hidden');
  pendingPriceEdit = null;
});
$('modal-confirm').addEventListener('click', () => {
  if (!pendingPriceEdit) return;
  const price = parseFloat($('modal-price-input').value);
  if (isNaN(price) || price < 0) { showToast('Precio inválido', 'error'); return; }
  saveCustomPrice(pendingPriceEdit.id, price);
  const sel = selectedDrops.find(s => s.id === pendingPriceEdit.id);
  if (sel) sel.price = price;
  $('modal-overlay').classList.add('hidden');
  pendingPriceEdit = null;
  renderDropLists({ cajas: $('search-cajas').value, armas: $('search-armas').value });
  renderSelectedDrops();
  showToast('✅ Precio actualizado', 'success');
});
$('modal-price-input').addEventListener('keydown', e => { if (e.key === 'Enter') $('modal-confirm').click(); });

// ====================
//  SAVE RECORD
// ====================
$('btn-save-drop').addEventListener('click', async () => {
  const week = $('input-week').value;
  const account = $('input-account').value;
  if (!week) { showToast('Seleccioná una semana', 'error'); return; }
  if (selectedDrops.length === 0) { showToast('No hay drops seleccionados', 'error'); return; }

  const total = selectedDrops.reduce((s, d) => s + d.price, 0);
  const record = {
    week, account,
    drops: [...selectedDrops],
    total: parseFloat(total.toFixed(2)),
    createdAt: new Date().toISOString()
  };

  try {
    $('btn-save-drop').textContent = 'Guardando...';
    $('btn-save-drop').disabled = true;
    await addDoc(collection(db, 'drops'), record);
    selectedDrops = [];
    renderDropLists({ cajas: '', armas: '' });
    renderSelectedDrops();
    $('input-week').value = '';
    setDefaultWeek();
    showToast('✅ Registro guardado!', 'success');
    await loadAllRecords();
  } catch (e) {
    showToast('❌ Error: ' + e.message, 'error');
  } finally {
    $('btn-save-drop').textContent = '💾 GUARDAR REGISTRO';
    $('btn-save-drop').disabled = false;
  }
});

// ====================
//  LOAD ALL RECORDS
// ====================
async function loadAllRecords() {
  try {
    const q = query(collection(db, 'drops'), orderBy('week', 'desc'));
    const snap = await getDocs(q);
    allRecords = snap.docs.map(d => ({ ...d.data(), id: d.id }));
    renderDashboard();
    renderHistorial();
  } catch (e) {
    showToast('Error cargando datos: ' + e.message, 'error');
  }
}

// ====================
//  DASHBOARD
// ====================
function renderDashboard() {
  const totalUSD = allRecords.reduce((s, r) => s + (r.total || 0), 0);
  const totalCajas = allRecords.reduce((s, r) => s + r.drops.filter(d => d.type === 'caja').length, 0);
  const totalArmas = allRecords.reduce((s, r) => s + r.drops.filter(d => d.type === 'arma').length, 0);
  const semanas = new Set(allRecords.map(r => r.week)).size;

  $('stat-total-usd').textContent = `$${totalUSD.toFixed(2)}`;
  $('stat-total-cajas').textContent = totalCajas;
  $('stat-total-armas').textContent = totalArmas;
  $('stat-total-semanas').textContent = semanas;
  $('header-total').textContent = `$${totalUSD.toFixed(2)}`;

  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now - jan1) / 86400000) + jan1.getDay() + 1) / 7);
  $('current-week').textContent = `${now.getFullYear()}-W${String(week).padStart(2,'0')}`;

  // Per account
  const accounts = ['Cuenta 1','Cuenta 2','Cuenta 3','Cuenta 4','Cuenta 5'];
  const accountTotals = {};
  const accountDrops = {};
  accounts.forEach(a => { accountTotals[a] = 0; accountDrops[a] = 0; });
  allRecords.forEach(r => {
    if (accountTotals[r.account] !== undefined) {
      accountTotals[r.account] += r.total || 0;
      accountDrops[r.account] += r.drops.length;
    }
  });

  const maxTotal = Math.max(...Object.values(accountTotals), 0.01);
  $('accounts-grid').innerHTML = accounts.map(a => `
    <div class="account-card">
      <div class="ac-name">${a}</div>
      <div class="ac-usd">$${accountTotals[a].toFixed(2)}</div>
      <div class="ac-drops">${accountDrops[a]} drops en total</div>
      <div class="ac-bar"><div class="ac-bar-fill" style="width:${(accountTotals[a]/maxTotal*100).toFixed(1)}%"></div></div>
    </div>`).join('');

  // Last week
  if (allRecords.length === 0) {
    $('last-week-table').innerHTML = '<div class="empty-state">No hay registros todavía. ¡Registrá tu primer drop!</div>';
    return;
  }
  const lastWeek = allRecords[0].week;
  const lastWeekRecords = allRecords.filter(r => r.week === lastWeek);
  const rows = lastWeekRecords.flatMap(r =>
    r.drops.map(d => `
      <tr>
        <td class="td-account">${r.account}</td>
        <td class="td-item">${d.name}</td>
        <td class="${d.type === 'caja' ? 'td-type-box' : 'td-type-weapon'}">${d.type === 'caja' ? '📦 CAJA' : '🔫 ARMA'}</td>
        <td class="td-price">$${d.price.toFixed(2)}</td>
      </tr>`)
  ).join('');
  const weekTotal = lastWeekRecords.reduce((s, r) => s + r.total, 0);
  $('last-week-table').innerHTML = `
    <table class="lw-table">
      <thead><tr><th>CUENTA</th><th>ITEM</th><th>TIPO</th><th>PRECIO</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr>
        <td colspan="3" style="padding:.7rem 1rem;font-family:var(--font-mono);font-size:.7rem;color:var(--text-secondary);letter-spacing:.1em">SEMANA ${lastWeek} — TOTAL</td>
        <td style="padding:.7rem 1rem;font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--accent)">$${weekTotal.toFixed(2)}</td>
      </tr></tfoot>
    </table>`;
}

// ====================
//  HISTORIAL
// ====================
function renderHistorial() {
  const filterAccount = $('filter-account').value;
  let records = allRecords;
  if (filterAccount) records = records.filter(r => r.account === filterAccount);

  if (records.length === 0) {
    $('historial-list').innerHTML = '<div class="empty-state">No hay registros todavía.</div>';
    return;
  }

  $('historial-list').innerHTML = records.map(r => `
    <div class="historial-week" data-id="${r.id}">
      <div class="hw-header" data-id="${r.id}">
        <div>
          <div class="hw-week">Semana ${r.week}</div>
          <div class="hw-account">${r.account}</div>
        </div>
        <div style="display:flex;align-items:center;gap:1rem">
          <div class="hw-total">$${(r.total||0).toFixed(2)}</div>
          <button class="hw-delete" data-id="${r.id}">🗑 ELIMINAR</button>
          <span class="hw-toggle">▼</span>
        </div>
      </div>
      <div class="hw-body" data-id="${r.id}">
        <div class="hw-items">
          ${r.drops.map(d => `
            <div class="hw-item">
              <span class="hw-item-name">${d.name}</span>
              <span class="hw-item-type">${d.type === 'caja' ? '📦 CAJA' : '🔫 ARMA'}</span>
              <span class="hw-item-price">$${d.price.toFixed(2)}</span>
            </div>`).join('')}
        </div>
      </div>
    </div>`).join('');

  document.querySelectorAll('.hw-header').forEach(header => {
    header.addEventListener('click', e => {
      if (e.target.classList.contains('hw-delete')) return;
      const id = header.dataset.id;
      const body = document.querySelector(`.hw-body[data-id="${id}"]`);
      const toggle = header.querySelector('.hw-toggle');
      body.classList.toggle('open');
      toggle.classList.toggle('open');
    });
  });

  document.querySelectorAll('.hw-delete').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
      try {
        await deleteDoc(doc(db, 'drops', btn.dataset.id));
        showToast('🗑 Registro eliminado', 'success');
        await loadAllRecords();
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
      }
    });
  });
}

$('filter-account').addEventListener('change', renderHistorial);

// ====================
//  TOAST
// ====================
function showToast(msg, type = '') {
  const t = $('toast');
  t.textContent = msg;
  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ====================
//  DEFAULT WEEK
// ====================
function setDefaultWeek() {
  const now = new Date();
  const year = now.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const week = Math.ceil((((now - jan1) / 86400000) + jan1.getDay() + 1) / 7);
  $('input-week').value = `${year}-W${String(week).padStart(2,'0')}`;
}

// ====================
//  INIT
// ====================
setDefaultWeek();
renderDropLists({ cajas: '', armas: '' });
loadAllRecords();
