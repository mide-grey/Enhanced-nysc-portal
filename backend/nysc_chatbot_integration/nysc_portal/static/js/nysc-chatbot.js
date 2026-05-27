/**
 * nysc-chatbot.js
 * ─────────────────────────────────────────────────────────────────────────────
 * NYSC AI Portal — Frontend Chatbot Integration
 * Connects your existing chat.html to the Django backend API.
 *
 * HOW TO USE IN YOUR HTML:
 *   <script src="/static/js/nysc-chatbot.js"></script>
 *   Then call: NyscChat.init({ ... }) with your element IDs.
 *
 * FEATURES:
 *   ✓ Sends messages to Django backend
 *   ✓ Manages conversation history (in memory, not DB)
 *   ✓ Renders markdown-style formatting
 *   ✓ Shows typing indicator
 *   ✓ Auto-scrolls to latest message
 *   ✓ Language switching (EN/YO/HA)
 *   ✓ Graceful error handling
 *   ✓ Works with existing chat.html UI
 * ─────────────────────────────────────────────────────────────────────────────
 */

const NyscChat = (() => {

  // ── Configuration ─────────────────────────────────────────────────────────
  const CONFIG = {
    // Backend API URL — change to your server URL when deploying
    API_URL:      'http://127.0.0.1:8000/api/v1/chat/message/',
    HEALTH_URL:   'http://127.0.0.1:8000/api/v1/chat/health/',
    MAX_HISTORY:  20,       // Max messages to send as context
    TYPING_DELAY: 600,      // Milliseconds to show typing indicator
    MAX_RETRIES:  2,        // Retry failed requests
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let state = {
    conversationHistory: [],  // [{role: 'user'|'assistant', content: ''}]
    currentLanguage:     'en',
    isTyping:            false,
    elements:            {},   // Cached DOM elements
    initialized:         false,
  };

  // ── DOM Element IDs (overridable via init options) ────────────────────────
  let ELEMENTS = {
    messagesContainer: 'messages',      // Scrollable message list
    userInput:         'userInput',     // Text input / textarea
    sendButton:        'sendBtn',       // Send button
    typingIndicator:   'typingIndicator', // Typing animation element
    welcomeScreen:     'welcomeScreen', // Welcome screen (hidden on first message)
    langButtons:       '.lang-btn',     // Language toggle buttons
    newChatButton:     null,            // Optional new chat button
  };

  // ── Utility: Simple Markdown Renderer ─────────────────────────────────────
  function renderMarkdown(text) {
    if (!text) return '';

    return text
      // Bold: **text**
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
      // Numbered list: 1. item → <li>
      .replace(/^\d+\.?\s+(.+)$/gm, '<li>$1</li>')
      // Bullet points: • item or - item
      .replace(/^[•\-]\s+(.+)$/gm, '<li class="bullet">$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/((<li[^>]*>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // Emoji lines (standalone lines starting with emoji)
      .replace(/^([📋🏕️💰📍🤝🎓📄🏢🇳🇬✅❌⚠️💡📅📝🌐💊🔦🛏️👕🧴].+)$/gm, '<p class="emoji-line">$1</p>')
      // Double newline → paragraph break
      .replace(/\n\n/g, '</p><p>')
      // Single newline → line break
      .replace(/\n/g, '<br>')
      // Wrap in paragraph if not already
      .replace(/^(?!<[uop])/, '<p>')
      .replace(/(?<![>])$/, '</p>')
      // Clean up empty paragraphs
      .replace(/<p><\/p>/g, '')
      .replace(/<p><br><\/p>/g, '');
  }

  // ── Utility: Get current time string ─────────────────────────────────────
  function getTimeString() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // ── Utility: Show toast notification ─────────────────────────────────────
  function showToast(message, duration = 3000) {
    let toast = document.getElementById('nyscToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nyscToast';
      toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; z-index: 9999;
        background: #1C2128; border: 1px solid rgba(48,54,61,0.8);
        color: #E6EDF3; padding: 12px 20px; border-radius: 10px;
        font-size: 0.88rem; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        opacity: 0; transition: opacity 0.3s; max-width: 300px;
        font-family: 'DM Sans', sans-serif;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, duration);
  }

  // ── Switch from welcome screen to chat view ───────────────────────────────
  function activateChatView() {
    const welcome  = document.getElementById(ELEMENTS.welcomeScreen);
    const messages = document.getElementById(ELEMENTS.messagesContainer);
    if (welcome)  welcome.style.display  = 'none';
    if (messages) messages.style.display = 'block';
  }

  // ── Append a message bubble to the chat ──────────────────────────────────
  function appendMessage(content, role) {
    activateChatView();

    const container = document.getElementById(ELEMENTS.messagesContainer);
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper';
    wrapper.style.animation = 'msgIn 0.3s ease';

    const isUser    = role === 'user';
    const initials  = isUser ? 'CM' : 'AI';
    const rendered  = isUser
      ? escapeHtml(content)       // user text: escape HTML
      : renderMarkdown(content);  // AI text: render markdown

    wrapper.innerHTML = `
      <div class="msg-row ${role}" style="display:flex;gap:12px;margin-bottom:4px;align-items:flex-start;${isUser ? 'flex-direction:row-reverse;' : ''}">
        <div class="msg-avatar ${role}" style="width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.76rem;font-weight:700;flex-shrink:0;margin-top:2px;background:${isUser ? 'linear-gradient(135deg,#1F4E8A,#1F6FEB)' : 'linear-gradient(135deg,#005C2A,#00843D)'};color:#fff">
          ${initials}
        </div>
        <div class="bubble ${role}" style="max-width:72%;padding:12px 16px;border-radius:16px;font-size:.93rem;line-height:1.65;${isUser ? 'background:#1F6FEB;color:#fff;border-top-right-radius:4px;' : 'background:#1C2128;border:1px solid rgba(48,54,61,0.8);color:#E6EDF3;border-top-left-radius:4px;'}">
          ${rendered}
        </div>
      </div>
      <div class="msg-time" style="font-size:.72rem;color:#484F58;margin-top:2px;${isUser ? 'text-align:right;padding-right:44px;' : 'padding-left:44px;'}">${getTimeString()}</div>
    `;

    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  // ── Show typing indicator ─────────────────────────────────────────────────
  function showTyping() {
    const container = document.getElementById(ELEMENTS.messagesContainer);
    if (!container) return;
    activateChatView();

    let indicator = document.getElementById('nyscTyping');
    if (indicator) return; // already showing

    indicator = document.createElement('div');
    indicator.id = 'nyscTyping';
    indicator.style.cssText = 'display:flex;align-items:center;gap:12px;padding:0 24px;margin-bottom:8px;animation:msgIn 0.3s ease;';
    indicator.innerHTML = `
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#005C2A,#00843D);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0">AI</div>
      <div style="padding:12px 16px;background:#1C2128;border:1px solid rgba(48,54,61,0.8);border-radius:16px;border-top-left-radius:4px;display:flex;gap:5px;align-items:center">
        <span style="width:7px;height:7px;border-radius:50%;background:#7D8590;display:inline-block;animation:dotPulse 1.4s infinite 0s"></span>
        <span style="width:7px;height:7px;border-radius:50%;background:#7D8590;display:inline-block;animation:dotPulse 1.4s infinite 0.2s"></span>
        <span style="width:7px;height:7px;border-radius:50%;background:#7D8590;display:inline-block;animation:dotPulse 1.4s infinite 0.4s"></span>
      </div>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;

    // Inject keyframe if not already present
    if (!document.getElementById('nyscChatStyles')) {
      const style = document.createElement('style');
      style.id = 'nyscChatStyles';
      style.textContent = `
        @keyframes dotPulse { 0%,60%,100%{transform:scale(1);opacity:.5} 30%{transform:scale(1.3);opacity:1} }
        @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .msg-wrapper { max-width:780px; margin:0 auto; padding:4px 24px; }
        .bubble ul { margin: 8px 0 0 16px; padding-left: 4px; }
        .bubble li { margin-bottom: 4px; }
        .bubble p { margin: 0 0 6px; }
        .bubble strong { color: #58A6FF; }
        .bubble .emoji-line { margin: 4px 0; }
      `;
      document.head.appendChild(style);
    }
  }

  function hideTyping() {
    const indicator = document.getElementById('nyscTyping');
    if (indicator) indicator.remove();
  }

  // ── Send message to backend API ───────────────────────────────────────────
  async function sendToAPI(message, retries = 0) {
    const payload = {
      message:  message,
      language: state.currentLanguage,
      history:  state.conversationHistory.slice(-CONFIG.MAX_HISTORY),
    };

    const response = await fetch(CONFIG.API_URL, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (retries < CONFIG.MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1000));
        return sendToAPI(message, retries + 1);
      }
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  // ── Core: Handle sending a message ───────────────────────────────────────
  async function handleSend() {
    if (state.isTyping) return;

    const inputEl = document.getElementById(ELEMENTS.userInput);
    const sendBtn = document.getElementById(ELEMENTS.sendButton);
    if (!inputEl) return;

    const message = inputEl.value.trim();
    if (!message) return;

    // Clear input
    inputEl.value = '';
    if (inputEl.tagName === 'TEXTAREA') {
      inputEl.style.height = 'auto';
    }

    // Disable input while processing
    state.isTyping = true;
    if (sendBtn) sendBtn.disabled = true;

    // Add user message to UI
    appendMessage(message, 'user');

    // Add to history
    state.conversationHistory.push({ role: 'user', content: message });

    // Show typing indicator with slight delay (feels natural)
    setTimeout(showTyping, 200);

    try {
      const data = await sendToAPI(message);

      hideTyping();

      const aiResponse = data.response || "I'm sorry, I couldn't generate a response. Please try again.";
      appendMessage(aiResponse, 'assistant');

      // Add AI response to history
      state.conversationHistory.push({ role: 'assistant', content: aiResponse });

      // Trim history to prevent context bloat
      if (state.conversationHistory.length > CONFIG.MAX_HISTORY) {
        state.conversationHistory = state.conversationHistory.slice(-CONFIG.MAX_HISTORY);
      }

    } catch (error) {
      hideTyping();
      console.error('[NYSC Chat Error]', error);

      // Show user-friendly fallback error
      appendMessage(
        "⚠️ I'm having trouble connecting right now.\n\n" +
        "Please check:\n" +
        "• Is the Django server running? (`python manage.py runserver`)\n" +
        "• Is the server at `http://127.0.0.1:8000`?\n\n" +
        "You can also visit **nysc.gov.ng** for official information.",
        'assistant'
      );
    }

    state.isTyping = false;
    if (sendBtn) sendBtn.disabled = false;
    if (inputEl) inputEl.focus();
  }

  // ── Clear / New Chat ─────────────────────────────────────────────────────
  function clearChat() {
    state.conversationHistory = [];

    const messages = document.getElementById(ELEMENTS.messagesContainer);
    const welcome  = document.getElementById(ELEMENTS.welcomeScreen);

    if (messages) {
      messages.innerHTML = '';
      messages.style.display = 'none';
    }
    if (welcome) welcome.style.display = 'flex';

    hideTyping();
  }

  // ── Language setter ──────────────────────────────────────────────────────
  function setLanguage(lang) {
    if (!['en', 'yo', 'ha'].includes(lang)) return;
    state.currentLanguage = lang;

    // Update UI buttons if they exist
    document.querySelectorAll(ELEMENTS.langButtons).forEach(btn => {
      const btnLang = btn.getAttribute('data-lang') ||
                      btn.textContent.trim().toLowerCase().slice(0, 2);
      btn.classList.toggle('active', btnLang === lang);
    });

    const names = { en: 'English', yo: 'Yoruba', ha: 'Hausa' };
    showToast(`Language switched to ${names[lang]}`);
  }

  // ── Textarea auto-resize ─────────────────────────────────────────────────
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }

  // ── Check backend health ─────────────────────────────────────────────────
  async function checkHealth() {
    try {
      const r = await fetch(CONFIG.HEALTH_URL);
      const d = await r.json();
      console.log('[NYSC Chat] Backend status:', d);
      return d;
    } catch {
      console.warn('[NYSC Chat] Backend not reachable. Using offline mode.');
      return null;
    }
  }

  // ── Initialize the chatbot ────────────────────────────────────────────────
  function init(options = {}) {
    if (state.initialized) return;

    // Merge options
    if (options.elements) Object.assign(ELEMENTS, options.elements);
    if (options.apiUrl)   CONFIG.API_URL = options.apiUrl;
    if (options.language) state.currentLanguage = options.language;

    // ── Bind send button ─────────────────────────────────────
    const sendBtn = document.getElementById(ELEMENTS.sendButton);
    if (sendBtn) {
      sendBtn.addEventListener('click', handleSend);
    }

    // ── Bind input field ─────────────────────────────────────
    const inputEl = document.getElementById(ELEMENTS.userInput);
    if (inputEl) {
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
      if (inputEl.tagName === 'TEXTAREA') {
        inputEl.addEventListener('input', () => autoResize(inputEl));
      }
    }

    // ── Bind language buttons ─────────────────────────────────
    document.querySelectorAll(ELEMENTS.langButtons).forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang') ||
                     btn.textContent.trim().toLowerCase().slice(0, 2);
        setLanguage(lang);
      });
    });

    // ── Bind new chat button ─────────────────────────────────
    if (ELEMENTS.newChatButton) {
      const newBtn = document.getElementById(ELEMENTS.newChatButton);
      if (newBtn) newBtn.addEventListener('click', clearChat);
    }

    // Also expose clearChat for buttons using onclick=""
    window.nyscNewChat = clearChat;
    window.nyscSetLang = setLanguage;
    window.nyscSend    = handleSend;

    // ── Inject base styles ────────────────────────────────────
    if (!document.getElementById('nyscChatStyles')) {
      const style = document.createElement('style');
      style.id = 'nyscChatStyles';
      style.textContent = `
        @keyframes dotPulse { 0%,60%,100%{transform:scale(1);opacity:.5} 30%{transform:scale(1.3);opacity:1} }
        @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .msg-wrapper { max-width: 780px; margin: 0 auto; padding: 4px 24px; }
        .bubble ul { margin: 8px 0 4px 16px; padding-left: 4px; }
        .bubble li { margin-bottom: 5px; }
        .bubble p  { margin: 0 0 6px; }
        .bubble strong { color: #58A6FF; }
        .bubble.user strong { color: #fff; font-weight: 700; }
        .bubble em { color: #7EE787; }
      `;
      document.head.appendChild(style);
    }

    // ── Optional: check backend on load ─────────────────────
    if (options.checkHealth !== false) {
      checkHealth();
    }

    state.initialized = true;
    console.log('[NYSC Chat] Chatbot initialized ✓');

    // ── Optional: show welcome message automatically ──────────
    if (options.autoWelcome !== false) {
      setTimeout(() => {
        appendMessage(
          "Hello! 👋 I'm your **NYSC AI Assistant**.\n\n" +
          "I can help you with registration, orientation camp, allowances, " +
          "redeployment, CDS, and all NYSC-related questions.\n\n" +
          "What would you like to know? 🇳🇬",
          'assistant'
        );
      }, options.welcomeDelay || 800);
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────
  return {
    init,
    send:        handleSend,
    clear:       clearChat,
    setLanguage,
    appendMessage,
    checkHealth,
    getHistory:  () => [...state.conversationHistory],
    getState:    () => ({ ...state }),
  };

})();

// ── Auto-initialize if data attributes are present on <body> ────────────────
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  if (body.dataset.nyscChat === 'true') {
    NyscChat.init({
      language:     body.dataset.nyscLang || 'en',
      autoWelcome:  body.dataset.nyscWelcome !== 'false',
      welcomeDelay: parseInt(body.dataset.nyscDelay || '800'),
    });
  }
});
