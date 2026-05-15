/**
 * Auto Reply SaaS - Frontend JavaScript
 * 
 * Handles:
 * - Fetching and displaying rules
 * - Adding new rules (with platform selection)
 * - Editing rules
 * - Deleting rules
 * - Filtering by platform
 * - Stats display
 * - Toast notifications
 */

// API base URL
const API_URL = '/api/rules';

// DOM Elements
const ruleForm = document.getElementById('ruleForm');
const keywordInput = document.getElementById('keyword');
const replyInput = document.getElementById('reply');
const platformSelect = document.getElementById('platform');
const rulesContainer = document.getElementById('rulesContainer');

// State
let editingRuleId = null;
let allRules = [];
let currentFilter = 'all';

// ============ LOAD ON PAGE LOAD ============
document.addEventListener('DOMContentLoaded', () => {
  fetchRules();
  fetchSettings();
  setupFilterButtons();
});

// ============ FILTER BUTTONS ============
function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderRules(filterRules(allRules));
    });
  });
}

function filterRules(rules) {
  if (currentFilter === 'all') return rules;
  return rules.filter(r => r.platform === currentFilter);
}

// ============ FORM SUBMIT ============
ruleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const keyword = keywordInput.value.trim();
  const reply = replyInput.value.trim();
  const platform = platformSelect.value;

  if (!keyword || !reply) {
    showToast('Please fill in both keyword and reply fields', 'error');
    return;
  }

  try {
    if (editingRuleId) {
      await updateRule(editingRuleId, { keyword, reply, platform });
      showToast('Rule updated successfully!', 'success');
      editingRuleId = null;
      ruleForm.querySelector('button[type="submit"]').textContent = 'Add Rule';
    } else {
      await createRule({ keyword, reply, platform });
      showToast('Rule added successfully!', 'success');
    }

    ruleForm.reset();
    fetchRules();
  } catch (error) {
    showToast('Error saving rule. Please try again.', 'error');
    console.error(error);
  }
});

// ============ FETCH ALL RULES ============
async function fetchRules() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.success) {
      allRules = data.data;
      updateStats(allRules);

      if (allRules.length > 0) {
        renderRules(filterRules(allRules));
      } else {
        rulesContainer.innerHTML = `
          <div class="empty-state">
            <p>No rules yet. Add your first auto-reply rule above! ☝️</p>
          </div>
        `;
      }
    }
  } catch (error) {
    rulesContainer.innerHTML = `
      <div class="empty-state">
        <p>❌ Error loading rules. Is the server running?</p>
      </div>
    `;
    console.error('Error fetching rules:', error);
  }
}

// ============ UPDATE STATS ============
function updateStats(rules) {
  document.getElementById('totalRules').textContent = rules.length;
  document.getElementById('activeRules').textContent = rules.filter(r => r.isActive).length;
  document.getElementById('messengerRules').textContent = rules.filter(r => r.platform === 'messenger' || r.platform === 'both').length;
  document.getElementById('whatsappRules').textContent = rules.filter(r => r.platform === 'whatsapp' || r.platform === 'both').length;
}

// ============ RENDER RULES LIST ============
function renderRules(rules) {
  if (rules.length === 0) {
    rulesContainer.innerHTML = `
      <div class="empty-state">
        <p>No rules found for this filter.</p>
      </div>
    `;
    return;
  }

  rulesContainer.innerHTML = rules.map(rule => `
    <div class="rule-item" data-id="${rule._id}">
      <div class="rule-info">
        <div class="rule-keyword">
          🔑 ${escapeHtml(rule.keyword)}
        </div>
        <div class="rule-reply">💬 ${escapeHtml(rule.reply)}</div>
        <div class="rule-meta">
          <span class="badge ${rule.isActive ? 'badge-active' : 'badge-inactive'}">
            ${rule.isActive ? 'Active' : 'Inactive'}
          </span>
          <span class="badge badge-${rule.platform || 'both'}">
            ${getPlatformLabel(rule.platform)}
          </span>
        </div>
      </div>
      <div class="rule-actions">
        <button class="btn btn-edit" onclick="editRule('${rule._id}', '${escapeAttr(rule.keyword)}', '${escapeAttr(rule.reply)}', '${rule.platform || 'both'}')">
          ✏️ Edit
        </button>
        <button class="btn btn-danger" onclick="deleteRule('${rule._id}')">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

// ============ PLATFORM LABEL ============
function getPlatformLabel(platform) {
  switch (platform) {
    case 'messenger': return '💬 Messenger';
    case 'whatsapp': return '📱 WhatsApp';
    case 'both': 
    default: return '🔗 Both';
  }
}

// ============ CREATE RULE ============
async function createRule(ruleData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData)
  });
  return response.json();
}

// ============ UPDATE RULE ============
async function updateRule(id, ruleData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData)
  });
  return response.json();
}

// ============ EDIT RULE ============
function editRule(id, keyword, reply, platform) {
  editingRuleId = id;
  keywordInput.value = keyword;
  replyInput.value = reply;
  platformSelect.value = platform || 'both';
  ruleForm.querySelector('button[type="submit"]').textContent = 'Update Rule';
  ruleForm.scrollIntoView({ behavior: 'smooth' });
}

// ============ DELETE RULE ============
async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await response.json();

    if (data.success) {
      showToast('Rule deleted!', 'success');
      fetchRules();
    } else {
      showToast('Error deleting rule', 'error');
    }
  } catch (error) {
    showToast('Error deleting rule', 'error');
    console.error(error);
  }
}

// ============ TOAST NOTIFICATION ============
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// ============ UTILITY FUNCTIONS ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ============ SETTINGS ============
async function fetchSettings() {
  try {
    const response = await fetch('/api/settings');
    const data = await response.json();

    if (data.success) {
      const s = data.data;
      document.getElementById('toggleAutoReply').checked = s.isAutoReplyEnabled;
      document.getElementById('toggleAwayMode').checked = s.isAwayMode;
      document.getElementById('toggleGreeting').checked = s.isGreetingEnabled;
      document.getElementById('defaultReply').value = s.defaultReply || '';
      document.getElementById('awayMessage').value = s.awayMessage || '';
      document.getElementById('greetingMessage').value = s.greetingMessage || '';
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
  }
}

async function saveSettings() {
  try {
    const settingsData = {
      isAutoReplyEnabled: document.getElementById('toggleAutoReply').checked,
      isAwayMode: document.getElementById('toggleAwayMode').checked,
      isGreetingEnabled: document.getElementById('toggleGreeting').checked,
      defaultReply: document.getElementById('defaultReply').value.trim(),
      awayMessage: document.getElementById('awayMessage').value.trim(),
      greetingMessage: document.getElementById('greetingMessage').value.trim()
    };

    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });

    const data = await response.json();
    if (data.success) {
      showToast('Settings saved! ✅', 'success');
    } else {
      showToast('Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
    console.error(error);
  }
}
