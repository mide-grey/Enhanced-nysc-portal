/**
 * chat-init.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Initializes NyscChat for the chat.html page.
 * Include AFTER nysc-chatbot.js in your HTML.
 *
 * Usage in chat.html:
 *   <script src="/static/js/nysc-chatbot.js"></script>
 *   <script src="/static/js/chat-init.js"></script>
 * ─────────────────────────────────────────────────────────────────────────────
 */

document.addEventListener('DOMContentLoaded', function () {

  // ── Initialize the chatbot ────────────────────────────────────────────────
  NyscChat.init({
    // DOM Element IDs (matching your chat.html)
    elements: {
      messagesContainer: 'messages',
      userInput:         'userInput',
      sendButton:        'sendBtn',
      welcomeScreen:     'welcomeScreen',
      langButtons:       '.lang-btn',
    },

    // API endpoint (Django backend)
    apiUrl: 'http://127.0.0.1:8000/api/v1/chat/message/',

    // Starting language
    language: 'en',

    // Show welcome message on load
    autoWelcome:  true,
    welcomeDelay: 700,

    // Check backend connectivity on load
    checkHealth: true,
  });

  // ── "New Chat" button (sidebar) ───────────────────────────────────────────
  const newChatBtn = document.querySelector('.new-chat-btn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', function () {
      NyscChat.clear();
      // On mobile: close sidebar after new chat
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    });
  }

  // ── Quick-start suggestion chips (welcome screen) ─────────────────────────
  // These already call sendPreset() in your chat.html — update them to use NyscChat
  window.sendPreset = function (text) {
    const inputEl = document.getElementById('userInput');
    if (inputEl) {
      inputEl.value = text;
    }
    NyscChat.send();
  };

  // ── Language toggle buttons (sidebar) ────────────────────────────────────
  // Your existing setLang() function — bridge to NyscChat
  window.setLang = function (lang, btn) {
    NyscChat.setLanguage(lang);

    // Update button states (your existing UI)
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  };

  // ── Microphone button (UI only, future feature) ───────────────────────────
  window.showMicToast = function () {
    // Use NyscChat's toast or your existing toast function
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = '🎙️ Voice input coming soon!';
      toast.style.opacity = '1';
      setTimeout(() => toast.style.opacity = '0', 2500);
    }
  };

  // ── Sidebar toggle (mobile) ───────────────────────────────────────────────
  window.toggleSidebar = function () {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  };

  window.closeSidebar = function () {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  };

  // ── Clear chat (existing function) ───────────────────────────────────────
  window.clearChat = function () {
    NyscChat.clear();
  };

  window.startNewChat = function () {
    NyscChat.clear();
    closeSidebar();
  };

  console.log('[chat-init.js] Chat page initialized ✓');
});
