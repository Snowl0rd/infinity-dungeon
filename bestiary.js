// Monster Types
const MONSTER_TYPES = {
  '☣️': 'Плоть',
  '☯️': 'Дух',
  '✴️': 'Магия',
  '⚫️': 'Пустота',
  '☸️': 'Хаос',
  '👿': 'Преисподняя',
  '⚖️': 'Порядок',
  '🪩': 'Астрал',
  '⚡️': 'Энергия',
  '🔱': 'Мематика',
  '💀': 'Некротизм',
  '⚙️': 'Механизм',
  '🧪': 'Химия',
  '💎': 'Камень',
  '💨': 'Газ',
  '💧': 'Жидкость',
  '🩸': 'Кровь',
  '🌿': 'Растения',
  '🍄': 'Грибы',
  '☢️': 'Радиация',
  '💠': 'Фрактал',
  '♻️': 'Инкарнация',
  '❓': 'Неизвестно'
};

// Damage Types
const DAMAGE_TYPES = {
  '🪓': 'Физический',
  '❄️': 'Крионический',
  '🔥': 'Термический',
  '☢️': 'Радиационный',
  '🧪': 'Химический',
  '☀️': 'Светлый',
  '🌒': 'Тёмный',
  '✨': 'Магический',
  '⚡️': 'Энергетический',
  '💀': 'Некротический',
  '🔱': 'Мематический',
  '🌸': 'Духовный',
  '🦇': 'Вампирский',
  '🌐': 'Эфирный',
  '⚫️': 'Пустотный',
  '🪩': 'Астральный',
  '👿': 'Демонический',
  '⚖️': 'Порядочный',
  '💠': 'Фрактальный',
  '☸️': 'Хаотический'
};

// Properties
const PROPERTIES = {
  '⚫️': 'Материальная',
  '🌐': 'Полуматериальная',
  '⚪️': 'Нематериальная'
};

// Rarity
const RARITY = {
  '⚪️': 'Обычные',
  '🔵': 'Необычные',
  '🟣': 'Редкие',
  '🟡': 'Эпические',
  '🔴': 'Легендарные'
};

let monsters = [];
let editingId = null;
let viewFilter = 'all';
let searchQuery = '';
let unsubscribe = null;

// ── RENDER CARDS ──
function renderCards() {
  const grid = document.getElementById('cards-grid');
  let list = monsters.filter(m => {
    const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery);
    const matchType = viewFilter === 'all' || m.type === viewFilter;
    return matchSearch && matchType;
  });

  document.getElementById('monster-count').textContent = monsters.length;

  if (!list.length) {
    grid.innerHTML = `<div class="empty-state"><span>[ — ]</span>${monsters.length ? 'Ничего не найдено.' : 'Монстров пока нет. Создайте первого.'}</div>`;
    return;
  }

  grid.innerHTML = list.map(m => {
    const rarityClass = m.rarity === '⚪️' ? 'common' : m.rarity === '🔵' ? 'uncommon' : m.rarity === '🟣' ? 'rare' : m.rarity === '🟡' ? 'epic' : 'legendary';
    return `<div class="monster-card" data-id="${m.id}">
      <div class="monster-card-rarity ${rarityClass}">${m.rarity || '⚪️'}</div>
      <div class="monster-card-name">${m.name || '???'}</div>
      <div class="monster-card-type">${MONSTER_TYPES[m.type] || 'Неизвестно'}</div>
      <div class="monster-card-row"><span>Свойства</span><span>${PROPERTIES[m.properties] || '—'}</span></div>
      <div class="monster-card-row"><span>Распространение</span><span>${m.distribution || '—'}</span></div>
      ${m.vulnerabilities && m.vulnerabilities.length ? `<div class="monster-card-tags">${m.vulnerabilities.map(t=>`<span class="tag-badge">Уязвимость: ${t}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');

  grid.querySelectorAll('.monster-card').forEach(card => {
    card.addEventListener('click', () => openView(card.dataset.id));
  });
}

// ── VIEW ──
function openView(id) {
  const m = monsters.find(x => x.id === id);
  if (!m) return;

  document.getElementById('view-content').innerHTML = `
    <div class="view-name">${m.name||'???'}</div>
    <div class="view-type">${MONSTER_TYPES[m.type] || 'Неизвестно'} · ${PROPERTIES[m.properties] || '—'}</div>

    <div class="view-section">
      <div class="view-section-label">ОПИСАНИЕ</div>
      <div class="view-text">${m.description||'—'}</div>
    </div>

    <div class="view-section">
      <div class="view-section-label">ХАРАКТЕРИСТИКИ</div>
      <div class="view-grid">
        <div class="view-row"><span class="view-row-label">Тип</span><span class="view-row-val">${MONSTER_TYPES[m.type]||'—'}</span></div>
        <div class="view-row"><span class="view-row-label">Свойства</span><span class="view-row-val">${PROPERTIES[m.properties]||'—'}</span></div>
        <div class="view-row"><span class="view-row-label">Редкость</span><span class="view-row-val">${RARITY[m.rarity]||'—'}</span></div>
        <div class="view-row"><span class="view-row-label">Распространение</span><span class="view-row-val">${m.distribution||'—'}</span></div>
      </div>
    </div>

    <div class="view-section">
      <div class="view-section-label">УЯЗВИМОСТИ</div>
      <div class="view-damage-types">
        ${m.vulnerabilities && m.vulnerabilities.length ? m.vulnerabilities.map(t=>`<span class="damage-badge">${t} ${DAMAGE_TYPES[t]||''}</span>`).join('') : '<span class="view-text">—</span>'}
      </div>
    </div>

    <div class="view-section">
      <div class="view-section-label">СТАНДАРТНЫЙ УРОН</div>
      <div class="view-damage-types">
        ${m.standardDamage && m.standardDamage.length ? m.standardDamage.map(t=>`<span class="damage-badge">${t} ${DAMAGE_TYPES[t]||''}</span>`).join('') : '<span class="view-text">—</span>'}
      </div>
    </div>

    <div class="view-section">
      <div class="view-section-label">СОПРОТИВЛЕНИЯ</div>
      <div class="view-damage-types">
        ${m.resistances && m.resistances.length ? m.resistances.map(t=>`<span class="damage-badge">${t} ${DAMAGE_TYPES[t]||''}</span>`).join('') : '<span class="view-text">—</span>'}
      </div>
    </div>

    <div class="view-section">
      <div class="view-section-label">ИММУНИТЕТЫ</div>
      <div class="view-damage-types">
        ${m.immunities && m.immunities.length ? m.immunities.map(t=>`<span class="damage-badge">${t} ${DAMAGE_TYPES[t]||''}</span>`).join('') : '<span class="view-text">—</span>'}
      </div>
    </div>

    <div style="margin-top:1.5rem;display:flex;justify-content:flex-end;">
      <button class="btn-edit" id="btn-view-edit" data-id="${m.id}">РЕДАКТИРОВАТЬ</button>
    </div>
  `;

  document.getElementById('view-modal').classList.add('open');

  document.getElementById('btn-view-edit').addEventListener('click', () => {
    document.getElementById('view-modal').classList.remove('open');
    openEdit(m.id);
  });
}

document.getElementById('view-close').addEventListener('click', () => {
  document.getElementById('view-modal').classList.remove('open');
});

// ── EDIT ──
function openEdit(id) {
  editingId = id || null;
  const m = id ? monsters.find(x=>x.id===id) : null;
  document.getElementById('edit-modal-title').textContent = id ? '// РЕДАКТИРОВАТЬ МОНСТРА' : '// СОЗДАТЬ МОНСТРА';
  document.getElementById('btn-delete').style.display = id ? '' : 'none';

  document.getElementById('f-name').value = m?.name || '';
  document.getElementById('f-type').value = m?.type || '';
  document.getElementById('f-properties').value = m?.properties || '';
  document.getElementById('f-description').value = m?.description || '';
  document.getElementById('f-rarity').value = m?.rarity || '⚪️';
  document.getElementById('f-distribution').value = m?.distribution || '';

  // Reset damage type selectors
  document.querySelectorAll('.damage-selector').forEach(selector => {
    selector.querySelectorAll('.damage-option').forEach(opt => {
      opt.classList.remove('selected');
    });
  });

  // Set selected damage types
  if (m) {
    if (m.vulnerabilities) {
      m.vulnerabilities.forEach(type => {
        const opt = document.querySelector(`.damage-selector[data-type="vulnerabilities"] .damage-option[data-value="${type}"]`);
        if (opt) opt.classList.add('selected');
      });
    }
    if (m.standardDamage) {
      m.standardDamage.forEach(type => {
        const opt = document.querySelector(`.damage-selector[data-type="standardDamage"] .damage-option[data-value="${type}"]`);
        if (opt) opt.classList.add('selected');
      });
    }
    if (m.resistances) {
      m.resistances.forEach(type => {
        const opt = document.querySelector(`.damage-selector[data-type="resistances"] .damage-option[data-value="${type}"]`);
        if (opt) opt.classList.add('selected');
      });
    }
    if (m.immunities) {
      m.immunities.forEach(type => {
        const opt = document.querySelector(`.damage-selector[data-type="immunities"] .damage-option[data-value="${type}"]`);
        if (opt) opt.classList.add('selected');
      });
    }
  }

  document.getElementById('edit-modal').classList.add('open');
}

document.getElementById('edit-close').addEventListener('click', () => {
  document.getElementById('edit-modal').classList.remove('open');
});
document.getElementById('btn-cancel-edit').addEventListener('click', () => {
  document.getElementById('edit-modal').classList.remove('open');
});
document.getElementById('btn-create').addEventListener('click', () => openEdit(null));

// Damage type selector handlers
document.querySelectorAll('.damage-option').forEach(option => {
  option.addEventListener('click', () => {
    option.classList.toggle('selected');
  });
});

document.getElementById('btn-save').addEventListener('click', async () => {
  const getSelectedDamageTypes = (type) => {
    return Array.from(document.querySelectorAll(`.damage-selector[data-type="${type}"] .damage-option.selected`))
      .map(opt => opt.dataset.value);
  };

  const m = {
    name: document.getElementById('f-name').value.trim(),
    type: document.getElementById('f-type').value,
    properties: document.getElementById('f-properties').value,
    description: document.getElementById('f-description').value.trim(),
    rarity: document.getElementById('f-rarity').value,
    distribution: document.getElementById('f-distribution').value.trim(),
    vulnerabilities: getSelectedDamageTypes('vulnerabilities'),
    standardDamage: getSelectedDamageTypes('standardDamage'),
    resistances: getSelectedDamageTypes('resistances'),
    immunities: getSelectedDamageTypes('immunities')
  };

  if (!m.name) { alert('Введите название монстра.'); return; }

  try {
    if (editingId) {
      await updateDocument('monsters', editingId, m);
    } else {
      const newMonster = await addDocument('monsters', m);
      editingId = newMonster.id;
    }
    document.getElementById('edit-modal').classList.remove('open');
  } catch (error) {
    alert('Ошибка сохранения: ' + error.message);
  }
});

document.getElementById('btn-delete').addEventListener('click', async () => {
  if (!confirm('Удалить этого монстра?')) return;
  try {
    await deleteDocument('monsters', editingId);
    document.getElementById('edit-modal').classList.remove('open');
  } catch (error) {
    alert('Ошибка удаления: ' + error.message);
  }
});

// ── FILTERS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    viewFilter = btn.dataset.type;
    renderCards();
  });
});

document.getElementById('search-input').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderCards();
});

// close on overlay click
['view-modal','edit-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('open');
  });
});

// ── FIREBASE REAL-TIME UPDATES ──
function initFirebase() {
  unsubscribe = subscribeCollection('monsters', (docs) => {
    monsters = docs;
    renderCards();
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initFirebase();
});
