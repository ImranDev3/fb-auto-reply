/**
 * AutoReply Pro - Professional Dashboard JavaScript
 * 
 * Features:
 * - Section navigation (Dashboard, Rules, Settings)
 * - CRUD operations for rules
 * - Settings management
 * - Filter & Stats
 * - Toast notifications
 * - Responsive sidebar
 */

const API_URL = '/api/rules';

// DOM Elements
const ruleForm = document.getElementById('ruleForm');
const keywordInput = document.getElementById('keyword');
const replyInput = document.getElementById('reply');
const platformSelect = document.getElementById('platform');
const rulesContainer = document.getElementById('rulesContainer');
const formBtnText = document.getElementById('formBtnText');

// State
let editingRuleId = null;
let allRules = [];
let currentFilter = 'all';

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  fetchRules();
  fetchSettings();
  setupNavigation();
  setupFilterButtons();
});

// ============ NAVIGATION ============
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;

      // Update active nav
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Show section
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');

      // Update title
      const titles = { dashboard: 'Dashboard', rules: 'Rules', settings: 'Settings' };
      document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

      // Close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

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
      formBtnText.textContent = 'Add Rule';
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
            <i class="fas fa-inbox"></i>
            <p>No rules yet. Add your first auto-reply rule!</p>
          </div>
        `;
      }
    }
  } catch (error) {
    rulesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading rules. Is the server running?</p>
      </div>
    `;
  }
}

// ============ UPDATE STATS ============
function updateStats(rules) {
  document.getElementById('totalRules').textContent = rules.length;
  document.getElementById('activeRules').textContent = rules.filter(r => r.isActive).length;
  document.getElementById('messengerRules').textContent = rules.filter(r => r.platform === 'messenger' || r.platform === 'both').length;
  document.getElementById('whatsappRules').textContent = rules.filter(r => r.platform === 'whatsapp' || r.platform === 'both').length;
}

// ============ RENDER RULES ============
function renderRules(rules) {
  if (rules.length === 0) {
    rulesContainer.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-filter"></i>
        <p>No rules found for this filter.</p>
      </div>
    `;
    return;
  }

  rulesContainer.innerHTML = rules.map(rule => `
    <div class="rule-item">
      <div class="rule-info">
        <div class="rule-keyword">
          <i class="fas fa-key" style="color: var(--primary); font-size: 0.8rem;"></i>
          ${escapeHtml(rule.keyword)}
        </div>
        <div class="rule-reply"><i class="fas fa-reply" style="font-size: 0.75rem;"></i> ${escapeHtml(rule.reply)}</div>
        <div class="rule-meta">
          <span class="badge ${rule.isActive ? 'badge-active' : 'badge-inactive'}">
            ${rule.isActive ? '● Active' : '● Inactive'}
          </span>
          <span class="badge badge-${rule.platform || 'both'}">
            ${getPlatformIcon(rule.platform)} ${getPlatformLabel(rule.platform)}
          </span>
        </div>
      </div>
      <div class="rule-actions">
        <button class="btn btn-edit" onclick="editRule('${rule._id}', '${escapeAttr(rule.keyword)}', '${escapeAttr(rule.reply)}', '${rule.platform || 'both'}')">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button class="btn btn-danger" onclick="deleteRule('${rule._id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

// ============ HELPERS ============
function getPlatformLabel(platform) {
  switch (platform) {
    case 'messenger': return 'Messenger';
    case 'whatsapp': return 'WhatsApp';
    default: return 'Both';
  }
}

function getPlatformIcon(platform) {
  switch (platform) {
    case 'messenger': return '<i class="fab fa-facebook-messenger"></i>';
    case 'whatsapp': return '<i class="fab fa-whatsapp"></i>';
    default: return '<i class="fas fa-link"></i>';
  }
}

// ============ CRUD OPERATIONS ============
async function createRule(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateRule(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

function editRule(id, keyword, reply, platform) {
  editingRuleId = id;
  keywordInput.value = keyword;
  replyInput.value = reply;
  platformSelect.value = platform || 'both';
  formBtnText.textContent = 'Update Rule';

  // Switch to dashboard section and scroll to form
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector('[data-section="dashboard"]').classList.add('active');
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-dashboard').classList.add('active');
  document.getElementById('pageTitle').textContent = 'Dashboard';

  ruleForm.scrollIntoView({ behavior: 'smooth' });
}

async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (data.success) {
      showToast('Rule deleted!', 'success');
      fetchRules();
    } else {
      showToast('Error deleting rule', 'error');
    }
  } catch (error) {
    showToast('Error deleting rule', 'error');
  }
}

// ============ SETTINGS ============
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();

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
    const settings = {
      isAutoReplyEnabled: document.getElementById('toggleAutoReply').checked,
      isAwayMode: document.getElementById('toggleAwayMode').checked,
      isGreetingEnabled: document.getElementById('toggleGreeting').checked,
      defaultReply: document.getElementById('defaultReply').value.trim(),
      awayMessage: document.getElementById('awayMessage').value.trim(),
      greetingMessage: document.getElementById('greetingMessage').value.trim()
    };

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });

    const data = await res.json();
    if (data.success) {
      showToast('Settings saved successfully!', 'success');
    } else {
      showToast('Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
  }
}

// ============ TOAST ============
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

// ============ UTILITIES ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
