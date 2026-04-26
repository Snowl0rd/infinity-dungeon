const SCHOOLS = {
  '🔥': 'Пиромантия',
  '💧': 'Гидромантия / Криомантия',
  '🌪️': 'Аэромантия',
  '💎': 'Литомантия',
  '🌿': 'Природа',
  '🌒': 'Тенебромантия',
  '☀️': 'Люминомантия',
  '👻': 'Магия изнанки',
  '🌐': 'Магия астрала',
  '💠': 'Магия фрактала',
  '😈': 'Магия преисподней',
  '☸️': 'Магия хаоса',
  '⚫': 'Магия пустоты',
  '🩸': 'Сангвимантия',
  '🔱': 'Мематика',
  '✨': 'Астрокинез'
};

const MANA_TYPES = {
  '⚪': 'Общая',
  '🔥': 'Пиромантия',
  '💧': 'Гидромантия / Криомантия',
  '🌪️': 'Аэромантия',
  '💎': 'Литомантия',
  '🌿': 'Природа',
  '🌒': 'Тенебромантия',
  '☀️': 'Люминомантия',
  '👻': 'Магия изнанки',
  '🌐': 'Магия астрала',
  '💠': 'Магия фрактала',
  '😈': 'Магия преисподней',
  '☸️': 'Магия хаоса',
  '⚫': 'Магия пустоты',
  '🩸': 'Сангвимантия',
  '🔱': 'Мематика',
  '✨': 'Астрокинез'
};

let characters = [];
let editingId = null;
let viewFilter = 'all';
let searchQuery = '';
let unsubscribe = null; // For real-time updates

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── RENDER CARDS ──
function renderCards() {
  const grid = document.getElementById('cards-grid');
  let list = characters.filter(c => {
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery) || (c.nick||'').toLowerCase().includes(searchQuery);
    const matchSchool = viewFilter === 'all' || (c.abilities||[]).some(a => a.school === viewFilter);
    return matchSearch && matchSchool;
  });

  document.getElementById('char-count').textContent = characters.length;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><span>[ — ]</span>${characters.length ? 'Ничего не найдено.' : 'Анкет пока нет. Создайте первую.'}</div>`;
    return;
  }

  grid.innerHTML = list.map(c => {
    const aware = parseInt(c.aware) || 100;
    const awareClass = aware < 50 ? 'critical' : aware < 75 ? 'low' : '';
    const schools = [...new Set((c.abilities||[]).map(a=>a.school).filter(Boolean))];
    return `<div class="char-card" data-id="${c.id}">
      <div class="char-card-aware ${awareClass}">${aware}%</div>
      <div class="char-card-name">${c.name || '???'}</div>
      <div class="char-card-nick">${c.nick ? '"' + c.nick + '"' : '—'}</div>
      <div class="char-card-row"><span>Класс</span><span>${c.class || '—'}</span></div>
      <div class="char-card-row"><span>Возраст</span><span>${c.age || '—'}</span></div>
      <div class="char-card-row"><span>Мана</span><span>${Array.isArray(c.manaPool) && c.manaPool.length ? c.manaPool.map(m=>`${m.type||'⚪'} ${m.value||0}`).join(' · ') : (c.mana||'—')}</span></div>
      ${schools.length ? `<div class="char-card-schools">${schools.map(s=>`<span class="school-badge">${s} ${SCHOOLS[s]||''}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');

  grid.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => openView(card.dataset.id));
  });
}

// ── VIEW ──
function openView(id) {
  const c = characters.find(x => x.id === id);
  if (!c) return;
  const aware = parseInt(c.aware) || 100;
  const awareColor = aware < 50 ? 'var(--red)' : aware < 75 ? 'var(--amber)' : 'var(--green)';

  let abilitiesHtml = '';
  const abilities = c.abilities || [];
  const schoolKeys = [...new Set(abilities.map(a=>a.school).filter(Boolean))];

  const filterBtns = `<div class="abilities-filter">
    <button class="ability-filter-btn active" data-f="all">ВСЕ</button>
    ${schoolKeys.map(s=>`<button class="ability-filter-btn" data-f="${s}">${s} ${SCHOOLS[s]||''}</button>`).join('')}
  </div>`;

  const abList = abilities.map((a,i) => `
    <div class="ability-item" data-school="${a.school||''}">
      <div class="ability-header" data-idx="${i}">
        <span class="ability-school-icon">${a.school||'✦'}</span>
        <span class="ability-name">${a.name||'Без названия'}</span>
        <span class="ability-school-name">${SCHOOLS[a.school]||''}</span>
        <span class="ability-toggle">▾</span>
      </div>
      <div class="ability-body">${a.desc||'—'}</div>
    </div>`).join('');

  document.getElementById('view-content').innerHTML = `
    <div class="view-name">${c.name||'???'}</div>
    <div class="view-nick">${c.nick ? '"'+c.nick+'"' : ''}</div>

    <div class="view-aware-bar"><div class="view-aware-fill" style="width:${aware}%;background:${awareColor}"></div></div>
    <div style="font-family:var(--mono);font-size:11px;color:${awareColor};margin:4px 0 1rem;">ОСОЗНАННОСТЬ ${aware}%</div>

    <div class="view-grid">
      <div class="view-row"><span class="view-row-label">Возраст</span><span class="view-row-val">${c.age||'—'}</span></div>
      <div class="view-row"><span class="view-row-label">Рост / Вес</span><span class="view-row-val">${c.size||'—'}</span></div>
      <div class="view-row"><span class="view-row-label">Пол</span><span class="view-row-val">${c.gender||'—'}</span></div>
      <div class="view-row"><span class="view-row-label">Класс</span><span class="view-row-val">${c.class||'—'}</span></div>
    </div>

    <div class="view-section">
      <div class="view-section-label">МАНА</div>
      ${Array.isArray(c.manaPool) && c.manaPool.length
        ? c.manaPool.map(m=>`<div class="view-mana"><span class="view-mana-icon">${m.type||'⚪'}</span><span class="view-mana-label">${MANA_TYPES[m.type]||''}</span><span class="view-mana-val">${m.value||0}</span></div>`).join('')
        : `<div class="view-mana"><span class="view-mana-icon">⚪</span><span class="view-mana-val">${c.mana||'—'}</span></div>`
      }
    </div>

    <div class="view-section">
      <div class="view-section-label">ГЕНОМ</div>
      <div class="view-text">${c.genome||'—'}</div>
    </div>

    <div class="view-section">
      <div class="view-section-label">ШКОЛЫ МАГИИ</div>
      <div class="view-text">${c.schools||'—'}</div>
    </div>

    <div class="view-section">
      <div class="view-section-label">ИСТОЧНИКИ МАГИИ</div>
      <div class="view-text">${c.sources||'—'}</div>
    </div>

    <div class="view-section">
      <div class="view-section-label">МОДИФИКАЦИИ</div>
      <div class="view-text">${c.mods||'—'}</div>
    </div>

    <div class="view-section">
      <div class="view-section-label">СПОСОБНОСТИ</div>
      ${abilities.length ? filterBtns + abList : '<div class="view-text">—</div>'}
    </div>

    <div style="margin-top:1.5rem;display:flex;justify-content:flex-end;">
      <button class="btn-edit" id="btn-view-edit" data-id="${c.id}">РЕДАКТИРОВАТЬ</button>
    </div>
  `;

  document.getElementById('view-modal').classList.add('open');

  document.getElementById('view-content').querySelectorAll('.ability-header').forEach(h => {
    h.addEventListener('click', () => {
      const body = h.nextElementSibling;
      body.classList.toggle('open');
      h.querySelector('.ability-toggle').textContent = body.classList.contains('open') ? '▴' : '▾';
    });
  });

  document.getElementById('view-content').querySelectorAll('.ability-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('view-content').querySelectorAll('.ability-filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.f;
      document.getElementById('view-content').querySelectorAll('.ability-item').forEach(item => {
        item.style.display = (f === 'all' || item.dataset.school === f) ? '' : 'none';
      });
    });
  });

  document.getElementById('btn-view-edit').addEventListener('click', () => {
    document.getElementById('view-modal').classList.remove('open');
    openEdit(c.id);
  });
}

document.getElementById('view-close').addEventListener('click', () => {
  document.getElementById('view-modal').classList.remove('open');
});

// ── EDIT ──
let abilityRows = [];
let manaRows = [];

function renderManaEditor() {
  const list = document.getElementById('mana-editor-list');
  list.innerHTML = manaRows.map((m,i) => `
    <div class="mana-editor-item">
      <select class="form-select" data-mi="${i}" data-field="type">
        ${Object.entries(MANA_TYPES).map(([k,v])=>`<option value="${k}" ${m.type===k?'selected':''}>${k} ${v}</option>`).join('')}
      </select>
      <input class="form-input" data-mi="${i}" data-field="value" type="number" min="0" placeholder="0" value="${m.value||''}">
      <button class="btn-remove-mana" data-mi="${i}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('input', () => { manaRows[el.dataset.mi][el.dataset.field] = el.value; });
    el.addEventListener('change', () => { manaRows[el.dataset.mi][el.dataset.field] = el.value; });
  });
  list.querySelectorAll('.btn-remove-mana').forEach(btn => {
    btn.addEventListener('click', () => {
      manaRows.splice(parseInt(btn.dataset.mi), 1);
      renderManaEditor();
    });
  });
}

function renderAbilityEditor() {
  const list = document.getElementById('ability-editor-list');
  list.innerHTML = abilityRows.map((a,i) => `
    <div class="ability-editor-item">
      <div style="display:flex;flex-direction:column;gap:6px;">
        <input class="form-input" data-i="${i}" data-field="name" placeholder="Название способности" value="${a.name||''}">
        <textarea class="form-textarea" data-i="${i}" data-field="desc" placeholder="Описание...">${a.desc||''}</textarea>
      </div>
      <select class="form-select" data-i="${i}" data-field="school">
        <option value="">— школа —</option>
        ${Object.entries(SCHOOLS).map(([k,v])=>`<option value="${k}" ${a.school===k?'selected':''}>${k} ${v}</option>`).join('')}
      </select>
      <button class="btn-remove-ability" data-i="${i}">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('[data-field]').forEach(el => {
    el.addEventListener('input', () => {
      abilityRows[el.dataset.i][el.dataset.field] = el.value;
    });
    el.addEventListener('change', () => {
      abilityRows[el.dataset.i][el.dataset.field] = el.value;
    });
  });
  list.querySelectorAll('.btn-remove-ability').forEach(btn => {
    btn.addEventListener('click', () => {
      abilityRows.splice(parseInt(btn.dataset.i), 1);
      renderAbilityEditor();
    });
  });
}

function openEdit(id) {
  editingId = id || null;
  const c = id ? characters.find(x=>x.id===id) : null;
  document.getElementById('edit-modal-title').textContent = id ? '// РЕДАКТИРОВАТЬ АНКЕТУ' : '// СОЗДАТЬ АНКЕТУ';
  document.getElementById('btn-delete').style.display = id ? '' : 'none';

  document.getElementById('f-name').value = c?.name || '';
  document.getElementById('f-nick').value = c?.nick || '';
  document.getElementById('f-age').value = c?.age || '';
  document.getElementById('f-size').value = c?.size || '';
  document.getElementById('f-class').value = c?.class || '';
  document.getElementById('f-aware').value = c?.aware ?? 100;
  // пол
  document.querySelectorAll('input[name="f-gender"]').forEach(r => {
    r.checked = r.value === (c?.gender || '');
  });
  manaRows = JSON.parse(JSON.stringify(c?.manaPool || []));
  if (!manaRows.length && c?.mana) manaRows.push({ type: '⚪', value: c.mana });
  renderManaEditor();
  document.getElementById('f-genome').value = c?.genome || '';
  document.getElementById('f-schools').value = c?.schools || '';
  document.getElementById('f-sources').value = c?.sources || '';
  document.getElementById('f-mods').value = c?.mods || '';

  abilityRows = JSON.parse(JSON.stringify(c?.abilities || []));
  renderAbilityEditor();

  document.getElementById('edit-modal').classList.add('open');
}

// ── EVENT LISTENERS ──
function setupEventListeners() {
  // Edit modal controls
  document.getElementById('edit-close').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.remove('open');
  });
  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').classList.remove('open');
  });
  document.getElementById('btn-create').addEventListener('click', () => openEdit(null));
  document.getElementById('btn-add-mana').addEventListener('click', () => {
    manaRows.push({ type: '⚪', value: '' });
    renderManaEditor();
  });
  document.getElementById('btn-add-ability').addEventListener('click', () => {
    abilityRows.push({ name: '', school: '', desc: '' });
    renderAbilityEditor();
  });

  document.getElementById('btn-save').addEventListener('click', async () => {
    const c = {
      name: document.getElementById('f-name').value.trim(),
      nick: document.getElementById('f-nick').value.trim(),
      age: document.getElementById('f-age').value.trim(),
      size: document.getElementById('f-size').value.trim(),
      gender: document.querySelector('input[name="f-gender"]:checked')?.value || '',
      class: document.getElementById('f-class').value.trim(),
      aware: document.getElementById('f-aware').value,
      manaPool: manaRows.filter(m => m.value !== ''),
      mana: '',

      genome: document.getElementById('f-genome').value.trim(),
      schools: document.getElementById('f-schools').value.trim(),
      sources: document.getElementById('f-sources').value.trim(),
      mods: document.getElementById('f-mods').value.trim(),
      abilities: abilityRows.filter(a => a.name || a.desc)
    };
    if (!c.name) { alert('Введите имя персонажа.'); return; }

    try {
      if (editingId) {
        await updateDocument('characters', editingId, c);
      } else {
        const newChar = await addDocument('characters', c);
        editingId = newChar.id;
      }
      document.getElementById('edit-modal').classList.remove('open');
    } catch (error) {
      alert('Ошибка сохранения: ' + error.message);
    }
  });

  document.getElementById('btn-delete').addEventListener('click', async () => {
    if (!confirm('Удалить эту анкету?')) return;
    try {
      await deleteDocument('characters', editingId);
      document.getElementById('edit-modal').classList.remove('open');
    } catch (error) {
      alert('Ошибка удаления: ' + error.message);
    }
  });

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      viewFilter = btn.dataset.school;
      renderCards();
    });
  });

  document.getElementById('search-input').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderCards();
  });

  // Close modals on overlay click
  ['view-modal','edit-modal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
    });
  });
}

// ── FIREBASE REAL-TIME UPDATES ──
function initFirebase() {
  // Subscribe to real-time updates
  unsubscribe = subscribeCollection('characters', (docs) => {
    characters = docs;
    renderCards();
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  initFirebase();
});
