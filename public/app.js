/**
 * FB Auto Reply SaaS - Frontend JavaScript
 * 
 * Handles:
 * - Fetching and displaying rules
 * - Adding new rules
 * - Editing rules
 * - Deleting rules
 * - Toast notifications
 */

// API base URL (same server)
const API_URL = '/api/rules';

// DOM Elements
const ruleForm = document.getElementById('ruleForm');
const keywordInput = document.getElementById('keyword');
const replyInput = document.getElementById('reply');
const rulesContainer = document.getElementById('rulesContainer');

// Track if we're editing a rule
let editingRuleId = null;

// ============ LOAD RULES ON PAGE LOAD ============
document.addEventListener('DOMContentLoaded', () => {
  fetchRules();
});

// ============ FORM SUBMIT (Add or Update Rule) ============
ruleForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const keyword = keywordInput.value.trim();
  const reply = replyInput.value.trim();

  if (!keyword || !reply) {
    showToast('Please fill in both fields', 'error');
    return;
  }

  try {
    if (editingRuleId) {
      // Update existing rule
      await updateRule(editingRuleId, { keyword, reply });
      showToast('Rule updated successfully!', 'success');
      editingRuleId = null;
      ruleForm.querySelector('button[type="submit"]').textContent = 'Add Rule';
    } else {
      // Create new rule
      await createRule({ keyword, reply });
      showToast('Rule added successfully!', 'success');
    }

    // Clear form and refresh list
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

    if (data.success && data.data.length > 0) {
      renderRules(data.data);
    } else {
      rulesContainer.innerHTML = `
        <div class="empty-state">
          <p>No rules yet. Add your first auto-reply rule above! ☝️</p>
        </div>
      `;
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

// ============ RENDER RULES LIST ============
function renderRules(rules) {
  rulesContainer.innerHTML = rules.map(rule => `
    <div class="rule-item" data-id="${rule._id}">
      <div class="rule-info">
        <div class="rule-keyword">
          🔑 ${escapeHtml(rule.keyword)}
          <span class="badge ${rule.isActive ? 'badge-active' : 'badge-inactive'}">
            ${rule.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div class="rule-reply">💬 ${escapeHtml(rule.reply)}</div>
      </div>
      <div class="rule-actions">
        <button class="btn btn-edit" onclick="editRule('${rule._id}', '${escapeAttr(rule.keyword)}', '${escapeAttr(rule.reply)}')">
          ✏️ Edit
        </button>
        <button class="btn btn-danger" onclick="deleteRule('${rule._id}')">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
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

// ============ EDIT RULE (populate form) ============
function editRule(id, keyword, reply) {
  editingRuleId = id;
  keywordInput.value = keyword;
  replyInput.value = reply;
  ruleForm.querySelector('button[type="submit"]').textContent = 'Update Rule';

  // Scroll to form
  ruleForm.scrollIntoView({ behavior: 'smooth' });
}

// ============ DELETE RULE ============
async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
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
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============ UTILITY: Escape HTML ============
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ UTILITY: Escape for HTML attributes ============
function escapeAttr(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
