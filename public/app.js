/**
 * AutoReply Pro - Professional Dashboard JavaScript
 * 
 * Features:
 * - Authentication (login required)
 * - Section navigation (Dashboard, Rules, Settings, Profile)
 * - CRUD operations for rules
 * - Settings management
 * - Profile & Page management
 * - Filter & Stats
 * - Toast notifications
 */

const API_URL = '/api/rules';

// ============ AUTH CHECK ============
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token) {
  window.location.href = '/login';
}

// Auth headers for all API calls
function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

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
  // Show user name in sidebar
  if (user) {
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = user.name || 'User';
    const planEl = document.getElementById('userPlan');
    if (planEl) planEl.textContent = (user.subscription?.plan || 'free').toUpperCase() + ' Plan';
  }

  fetchRules();
  fetchSettings();
  fetchProfile();
  fetchProducts();
  fetchBusinessDetails();
  setupNavigation();
  setupFilterButtons();

  // Show admin link if user is admin
  checkAdminAccess();
});

// ============ LOGOUT ============
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// ============ NAVIGATION ============
function setupNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;

      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${section}`).classList.add('active');

      const titles = { dashboard: 'Dashboard', rules: 'Rules', settings: 'Settings', products: 'Products & Business', profile: 'Profile' };
      document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

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
      const result = await createRule({ keyword, reply, platform });
      if (result.success === false) {
        showToast(result.message, 'error');
        return;
      }
      showToast('Rule added successfully!', 'success');
    }

    ruleForm.reset();
    fetchRules();
  } catch (error) {
    showToast('Error saving rule. Please try again.', 'error');
  }
});

// ============ FETCH ALL RULES ============
async function fetchRules() {
  try {
    const response = await fetch(API_URL, { headers: authHeaders() });

    if (response.status === 401) { logout(); return; }

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
        <p>Error loading rules.</p>
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
            ${getPlatformLabel(rule.platform)}
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

function getPlatformLabel(platform) {
  switch (platform) {
    case 'messenger': return 'Messenger';
    case 'whatsapp': return 'WhatsApp';
    default: return 'Both';
  }
}

// ============ CRUD OPERATIONS ============
async function createRule(data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

async function updateRule(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
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
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: authHeaders() });
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
    const res = await fetch('/api/settings', { headers: authHeaders() });
    if (res.status === 401) return;
    const data = await res.json();

    if (data.success) {
      const s = data.data;
      document.getElementById('toggleAutoReply').checked = s.isAutoReplyEnabled;
      document.getElementById('toggleAwayMode').checked = s.isAwayMode;
      document.getElementById('toggleGreeting').checked = s.isGreetingEnabled;
      document.getElementById('defaultReply').value = s.defaultReply || '';
      document.getElementById('awayMessage').value = s.awayMessage || '';
      document.getElementById('greetingMessage').value = s.greetingMessage || '';
      document.getElementById('aiContext').value = s.aiContext || '';
      // Also fill Rules page AI context field
      const rulesAiField = document.getElementById('aiContextRules');
      if (rulesAiField) rulesAiField.value = s.aiContext || '';
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
      greetingMessage: document.getElementById('greetingMessage').value.trim(),
      aiContext: document.getElementById('aiContext').value.trim()
    };

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(settings)
    });

    const data = await res.json();
    if (data.success) {
      showToast('Settings saved!', 'success');
    } else {
      showToast('Error saving settings', 'error');
    }
  } catch (error) {
    showToast('Error saving settings', 'error');
  }
}

// ============ PROFILE ============
async function fetchProfile() {
  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    if (res.status === 401) return;
    const data = await res.json();

    if (data.success) {
      const u = data.data;
      document.getElementById('profileName').value = u.name || '';
      document.getElementById('profileEmail').value = u.email || '';
      document.getElementById('profilePhone').value = u.phone || '';
      document.getElementById('pageName').value = u.pageDetails?.pageName || '';
      document.getElementById('pageId').value = u.pageDetails?.pageId || '';
      document.getElementById('pageToken').value = u.pageDetails?.pageAccessToken || '';
      document.getElementById('waPhoneId').value = u.pageDetails?.whatsappPhoneNumberId || '';
      document.getElementById('waToken').value = u.pageDetails?.whatsappAccessToken || '';
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
  }
}

async function saveProfile() {
  try {
    const profileData = {
      name: document.getElementById('profileName').value.trim(),
      email: document.getElementById('profileEmail').value.trim(),
      phone: document.getElementById('profilePhone').value.trim()
    };

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(profileData)
    });

    const data = await res.json();
    if (data.success) {
      showToast('Profile updated!', 'success');
      // Update local storage
      const stored = JSON.parse(localStorage.getItem('user'));
      stored.name = profileData.name;
      localStorage.setItem('user', JSON.stringify(stored));
      document.getElementById('userName').textContent = profileData.name;
    } else {
      showToast(data.message || 'Error updating profile', 'error');
    }
  } catch (error) {
    showToast('Error updating profile', 'error');
  }
}

async function savePageDetails() {
  try {
    const pageData = {
      pageName: document.getElementById('pageName').value.trim(),
      pageId: document.getElementById('pageId').value.trim(),
      pageAccessToken: document.getElementById('pageToken').value.trim(),
      whatsappPhoneNumberId: document.getElementById('waPhoneId').value.trim(),
      whatsappAccessToken: document.getElementById('waToken').value.trim()
    };

    const res = await fetch('/api/auth/page', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(pageData)
    });

    const data = await res.json();
    if (data.success) {
      showToast('Page details saved!', 'success');
    } else {
      showToast('Error saving page details', 'error');
    }
  } catch (error) {
    showToast('Error saving page details', 'error');
  }
}

async function changePassword() {
  const current = document.getElementById('currentPassword').value;
  const newPass = document.getElementById('newPassword').value;

  if (!current || !newPass) {
    showToast('Fill in both password fields', 'error');
    return;
  }

  if (newPass.length < 6) {
    showToast('New password must be at least 6 characters', 'error');
    return;
  }

  try {
    const res = await fetch('/api/auth/password', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword: current, newPassword: newPass })
    });

    const data = await res.json();
    if (data.success) {
      showToast('Password changed!', 'success');
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
    } else {
      showToast(data.message || 'Error changing password', 'error');
    }
  } catch (error) {
    showToast('Error changing password', 'error');
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

// ============ AI CONTEXT (Rules page) ============
async function saveAIContext() {
  try {
    const aiContext = document.getElementById('aiContextRules').value.trim();
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ aiContext })
    });
    const data = await res.json();
    if (data.success) {
      showToast('AI info saved! Bot will use this to reply.', 'success');
      // Sync with settings page too
      const settingsField = document.getElementById('aiContext');
      if (settingsField) settingsField.value = aiContext;
    } else {
      showToast('Error saving', 'error');
    }
  } catch (e) { showToast('Error saving', 'error'); }
}

// ============ ADMIN CHECK ============
async function checkAdminAccess() {
  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    const data = await res.json();
    if (data.success && data.data.role === 'admin') {
      const adminLink = document.getElementById('adminLink');
      if (adminLink) adminLink.style.display = 'flex';
    }
  } catch (e) {}
}

// ============ PRODUCTS ============
let editingProductId = null;

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('prodName').value.trim();
  const price = document.getElementById('prodPrice').value.trim();
  const category = document.getElementById('prodCategory').value.trim();
  const description = document.getElementById('prodDesc').value.trim();

  if (!name) { showToast('Product name required', 'error'); return; }

  try {
    if (editingProductId) {
      await fetch(`/api/products/${editingProductId}`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ name, price, category, description })
      });
      showToast('Product updated!', 'success');
      editingProductId = null;
      document.getElementById('prodBtnText').textContent = 'Add Product';
    } else {
      await fetch('/api/products', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name, price, category, description })
      });
      showToast('Product added!', 'success');
    }
    document.getElementById('productForm').reset();
    fetchProducts();
  } catch (e) { showToast('Error saving product', 'error'); }
});

async function fetchProducts() {
  try {
    const res = await fetch('/api/products', { headers: authHeaders() });
    const data = await res.json();
    if (data.success) renderProducts(data.data);
  } catch (e) {}
}

function renderProducts(products) {
  const container = document.getElementById('productsContainer');
  if (!products.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>No products yet. Add your first product above!</p></div>';
    return;
  }
  container.innerHTML = products.map(p => `
    <div class="rule-item">
      <div class="rule-info">
        <div class="rule-keyword"><i class="fas fa-box" style="color:var(--primary);font-size:0.8rem;"></i> ${escapeHtml(p.name)} ${p.price ? `<span style="color:var(--success);font-weight:700;margin-left:8px;">${escapeHtml(p.price)}</span>` : ''}</div>
        <div class="rule-reply">${escapeHtml(p.description || 'No description')}</div>
        <div class="rule-meta">
          <span class="badge badge-both">${escapeHtml(p.category || 'General')}</span>
          <span class="badge ${p.isAvailable ? 'badge-active' : 'badge-inactive'}">${p.isAvailable ? 'Available' : 'Unavailable'}</span>
        </div>
      </div>
      <div class="rule-actions">
        <button class="btn btn-edit" onclick="editProduct('${p._id}','${escapeAttr(p.name)}','${escapeAttr(p.price||'')}','${escapeAttr(p.category||'')}','${escapeAttr(p.description||'')}')"><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger" onclick="deleteProduct('${p._id}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function editProduct(id, name, price, category, desc) {
  editingProductId = id;
  document.getElementById('prodName').value = name;
  document.getElementById('prodPrice').value = price;
  document.getElementById('prodCategory').value = category;
  document.getElementById('prodDesc').value = desc;
  document.getElementById('prodBtnText').textContent = 'Update Product';
  document.querySelector('[data-section="products"]').click();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  await fetch(`/api/products/${id}`, { method: 'DELETE', headers: authHeaders() });
  showToast('Product deleted', 'success');
  fetchProducts();
}

// ============ BUSINESS DETAILS ============
async function fetchBusinessDetails() {
  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    const data = await res.json();
    if (data.success && data.data.businessDetails) {
      const b = data.data.businessDetails;
      document.getElementById('bizName').value = b.businessName || '';
      document.getElementById('bizCategory').value = b.category || '';
      document.getElementById('bizDesc').value = b.description || '';
      document.getElementById('bizAddress').value = b.address || '';
      document.getElementById('bizPhone').value = b.phone || '';
      document.getElementById('bizWebsite').value = b.website || '';
      document.getElementById('bizWhatsapp').value = b.whatsappNumber || '';
    }
  } catch (e) {}
}

async function saveBusinessDetails() {
  try {
    const res = await fetch('/api/auth/business', {
      method: 'PUT', headers: authHeaders(),
      body: JSON.stringify({
        businessName: document.getElementById('bizName').value.trim(),
        category: document.getElementById('bizCategory').value.trim(),
        description: document.getElementById('bizDesc').value.trim(),
        address: document.getElementById('bizAddress').value.trim(),
        phone: document.getElementById('bizPhone').value.trim(),
        website: document.getElementById('bizWebsite').value.trim(),
        whatsappNumber: document.getElementById('bizWhatsapp').value.trim()
      })
    });
    const data = await res.json();
    if (data.success) showToast('Business details saved!', 'success');
    else showToast('Error saving', 'error');
  } catch (e) { showToast('Error saving', 'error'); }
}
