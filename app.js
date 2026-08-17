/**
 * VORTEX HUB - Main Application
 */

document.addEventListener('DOMContentLoaded', () => {
  // Core systems
  Theme.init();
  Toast.init();
  Navbar.init();
  Search.init();
  Auth.init();

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      item.classList.toggle('open');
    });
  });

  // Tab system
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabs = btn.closest('.tabs') || btn.parentElement;
      const target = btn.dataset.tab;
      
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });

  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.copy);
      if (target) {
        const text = target.value || target.textContent;
        navigator.clipboard.writeText(text).then(() => {
          Toast.show('Disalin ke clipboard!', 'success');
        });
      }
    });
  });

  // Update stats on homepage if present
  updateHomeStats();
});

function updateHomeStats() {
  const toolsCount = document.querySelector('#stat-tools');
  const usersCount = document.querySelector('#stat-users');
  if (toolsCount) toolsCount.textContent = ToolsRegistry.length + '+';
  if (usersCount) {
    const users = Storage.getUsers();
    usersCount.textContent = Math.max(users.length, 128) + '+';
  }
}

// Helper: mark tool as recent when used
function useTool(toolId) {
  Storage.addRecent(toolId);
}

window.useTool = useTool;
