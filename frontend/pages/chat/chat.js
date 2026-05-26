let currentLang = localStorage.getItem("nysc_chat_lang") || "en";
let isTyping = false;
let chatStarted = false;
let isListening = false;
let lastAssistantReply = "";
let preferredVoiceGender =
  localStorage.getItem("nysc_voice_gender") || "female";
let availableVoices = [];

const CHAT_API_FALLBACK_BASE = "http://127.0.0.1:8000";
const SIDEBAR_HISTORY_KEY = "nysc_chat_sidebar_history";

function getChatApiBaseUrl() {
  if (typeof window !== "undefined" && window.location?.protocol !== "file:") {
    return window.location.origin;
  }

  return CHAT_API_FALLBACK_BASE;
}

function getChatApiUrl() {
  return `${getChatApiBaseUrl()}/api/v1/chat/message/`;
}

async function parseChatApiResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.error || data?.message || text || `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

async function postChatMessage(payload) {
  const candidates = [
    getChatApiUrl(),
    `${CHAT_API_FALLBACK_BASE}/api/v1/chat/message/`,
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      return await parseChatApiResponse(response);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to reach chat API");
}

const ASSISTANT_NAME = "Grey";

const uiText = {
  en: {
    htmlLang: "en",
    languageLabel: "Language",
    newChat: "New Chat",
    recentLabel: "Recent",
    home: "Home",
    fallbackName: "Corps Member",
    batchNotSet: "Batch not set",
    welcomeGreeting: "Hello, {name}!",
    welcomeSub:
      "I'm Grey. Ask me anything about your service year — registration, camp, posting, allowances, CDS, and more.",
    preset1: "How do I register for NYSC?",
    preset1Sub: "Step-by-step guide",
    preset2: "What should I pack for camp?",
    preset2Sub: "Camp preparation checklist",
    preset3: "How much is the NYSC monthly allowance?",
    preset3Sub: "Stipend & financial info",
    preset4: "How can I apply for relocation?",
    preset4Sub: "Posting & redeployment",
    suggestion1: "CDS groups",
    suggestion2: "Call-up letter",
    suggestion3: "Allowance",
    suggestion4: "Exemption",
    placeholder: "Ask anything about NYSC…",
    micTitle: "Voice input",
    sendTitle: "Send message",
    inputFooter: "NYSC AI Portal · For informational use only ·",
    officialSite: "Official site ↗",
    chatHeaderTitle: "NYSC AI Assistant",
    chatHeaderStatus: "— Online",
    languageSet: "Language set to {lang}"
  },
  yo: {
    htmlLang: "yo",
    languageLabel: "Èdè",
    newChat: "Ìjíròrò Tuntun",
    recentLabel: "Àwọn tó déédéé",
    home: "Ilé",
    fallbackName: "Ọmọ ẹgbẹ̀ NYSC",
    batchNotSet: "Ìyẹ̀ kò ṣeto",
    welcomeGreeting: "Ẹ káàbọ̀, {name}!",
    welcomeSub:
      "Èmi ni olùrànlọ́wọ́ NYSC AI rẹ. Béèrè ohun gbogbo nípa ọdun iṣẹ́ rẹ — ìforúkọsilẹ̀, ibùdó, àkókò, owo-oṣù, CDS, àti ohun mìíràn.",
    preset1: "Bí mo ṣe lè forúkọ sílẹ̀ fún NYSC?",
    preset1Sub: "Ìtọ́sọ́nà ìṣíṣe",
    preset2: "Kí ni mo yẹ kí n mú sọ́lẹ̀ fún ibùdó?",
    preset2Sub: "Ìtòlẹ́sẹẹ̀ṣe àlàyé camp",
    preset3: "Bawo ni owo-oṣù NYSC ṣe mú?",
    preset3Sub: "Ìmúlò ti stipend",
    preset4: "Bí mo ṣe lè beere fún relocation?",
    preset4Sub: "Ìfọwọ́si pọṣítí",
    suggestion1: "Àwọn ẹgbẹ̀ CDS",
    suggestion2: "Lẹ́tà call-up",
    suggestion3: "Owo-oṣù",
    suggestion4: "Ìmúkò",
    placeholder: "Béèrè ohun gbogbo nípa NYSC…",
    micTitle: "Ohùn ìfọwọ́si",
    sendTitle: "Firanṣẹ ìbéèrè",
    inputFooter: "NYSC AI Portal · Fun ìlànà ìmọ̀ràn nikan ·",
    officialSite: "Àyè ìkànsí ↗",
    chatHeaderTitle: "Olùrànlọ́wọ́ NYSC AI",
    chatHeaderStatus: "— Mo wà lórí ayelujara",
    languageSet: "Èdè ti ṣeto sí {lang}"
  },
  ha: {
    htmlLang: "ha",
    languageLabel: "Harshe",
    newChat: "Sabuwar tattaunawa",
    recentLabel: "Na baya",
    home: "Gida",
    fallbackName: "Memba NYSC",
    batchNotSet: "Ba a sa batch ba",
    welcomeGreeting: "Barka, {name}!",
    welcomeSub:
      "Ni ne mataimakiyar AI ta NYSC. Tambayi komai game da shekarar hidima — rajista, sansani, birki, alawus, CDS, da sauransu.",
    preset1: "Yadda zan yi rajista a NYSC?",
    preset1Sub: "Tuntsa-ta-tsa jagora",
    preset2: "Wadanne abubuwa zan yi packing domin sansani?",
    preset2Sub: "Jerin abubuwan sansani",
    preset3: "Nawa ne alawus na NYSC na wata-wata?",
    preset3Sub: "Bayanan stipend",
    preset4: "Yadda zan nemi canji wurin aiki?",
    preset4Sub: "Bayanin canji",
    suggestion1: "Kungiyoyin CDS",
    suggestion2: "Wasikar call-up",
    suggestion3: "Alawus",
    suggestion4: "Keɓancewa",
    placeholder: "Tambayi komai game da NYSC…",
    micTitle: "Shigar da murya",
    sendTitle: "Aika saƙo",
    inputFooter: "NYSC AI Portal · Don bayani kawai ·",
    officialSite: "Shafin hukuma ↗",
    chatHeaderTitle: "Mataimakiyar NYSC AI",
    chatHeaderStatus: "— A kan layi",
    languageSet: "An sa harshe zuwa {lang}"
  },
  ig: {
    htmlLang: "ig",
    languageLabel: "Asụsụ",
    newChat: "Nkata ọhụrụ",
    recentLabel: "Nke na-adịbeghị anya",
    home: "Ụlọ",
    fallbackName: "Ndị NYSC",
    batchNotSet: "Batch adịghị setị",
    welcomeGreeting: "Ndewo, {name}!",
    welcomeSub:
      "Abụ m ọkachamara AI NYSC. Ajụ ihe ọbụla gbasara afọ ọrụ gị — ndebanye, camp, mbanye, ụgwọ, CDS, na okwu ndị ọzọ.",
    preset1: "Otu m ga-esi ndebanye NYSC?",
    preset1Sub: "Ntuziaka nzọụkwụ",
    preset2: "Gịnị ka m ga-eburu maka camp?",
    preset2Sub: "Ndepụta ihe ị ga-ebu",
    preset3: "Ego NYSC kwa ọnwa olile?",
    preset3Sub: "Nkọwa stipend",
    preset4: "Otu m ga-esi arịrịọ ịgbanwe ọnọdụ?",
    preset4Sub: "Nkọwa mgbanwe",
    suggestion1: "Ụmụ CDS",
    suggestion2: "Akwụkwọ call-up",
    suggestion3: "Alawus",
    suggestion4: "Ihichapụ",
    placeholder: "Ajụ ihe ọbụla gbasara NYSC…",
    micTitle: "Ntinye olu",
    sendTitle: "Zipu ajụjụ",
    inputFooter: "NYSC AI Portal · Maka ozi naanị ·",
    officialSite: "Saịtị gọọmenti ↗",
    chatHeaderTitle: "Ndịaka NYSC AI",
    chatHeaderStatus: "— Ọ na-arụ lọwọ",
    languageSet: "Asụsụ setị na {lang}"
  }
};

function getUiText(lang) {
  return uiText[lang] || uiText.en;
}

function loadSidebarHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SIDEBAR_HISTORY_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item.title === "string")
      .map((item) => ({
        title: item.title.slice(0, 80),
        savedAt: Number(item.savedAt) || Date.now(),
      }))
      .slice(0, 8);
  } catch (error) {
    return [];
  }
}

function saveSidebarHistory(history) {
  localStorage.setItem(SIDEBAR_HISTORY_KEY, JSON.stringify(history));
}

function deleteSidebarHistoryItem(title) {
  const normalizedTitle = sanitizeConversationTitle(title);
  if (!normalizedTitle || normalizedTitle === "New chat") return;

  const history = loadSidebarHistory().filter(
    (item) => item.title !== normalizedTitle
  );

  saveSidebarHistory(history);
  renderSidebarHistory();
}

function sanitizeConversationTitle(text) {
  const cleaned = String(text || "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 80) || "New chat";
}

function registerSidebarTitle(text) {
  const title = sanitizeConversationTitle(text);
  if (!title || title === "New chat") return;

  const history = loadSidebarHistory();
  const filtered = history.filter((item) => item.title !== title);
  filtered.unshift({ title, savedAt: Date.now() });
  saveSidebarHistory(filtered.slice(0, 8));
  renderSidebarHistory();
}

function renderSidebarHistory() {
  const container = document.getElementById("chatHistoryList");
  if (!container) return;

  const history = loadSidebarHistory();
  container.innerHTML = "";

  if (!history.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "chat-history-item";
    placeholder.style.opacity = "0.65";
    placeholder.style.pointerEvents = "none";
    placeholder.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      <span>No chats yet</span>
    `;
    container.appendChild(placeholder);
    return;
  }

  history.forEach((item, index) => {
    const node = document.createElement("div");
    node.className = `chat-history-item${index === 0 ? " active" : ""}`;
    node.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
      <span class="chat-history-title">${escapeHtml(item.title)}</span>
      <button
        type="button"
        class="chat-history-delete-btn"
        aria-label="Delete conversation ${escapeHtml(item.title)}"
        title="Delete conversation"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        </svg>
      </button>
    `;

    const deleteBtn = node.querySelector(".chat-history-delete-btn");
    deleteBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteSidebarHistoryItem(item.title);
    });

    container.appendChild(node);
  });
}

function getSessionData() {
  try {
    return JSON.parse(localStorage.getItem("nysc_session") || "null");
  } catch (error) {
    return null;
  }
}

function parseProfilePayload(value) {
  if (!value) return null;

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return null;
}

function getCachedProfile() {
  try {
    return JSON.parse(localStorage.getItem("nysc_profile_cache") || "null");
  } catch (error) {
    return null;
  }
}

function getProfileData() {
  const sessionProfile = getSessionData();
  if (sessionProfile && typeof sessionProfile === "object") {
    return sessionProfile;
  }

  const cachedProfile = getCachedProfile();
  if (cachedProfile && typeof cachedProfile === "object") {
    return cachedProfile;
  }

  const windowProfile = parseProfilePayload(window.name);
  if (windowProfile && typeof windowProfile === "object") {
    return windowProfile;
  }

  const params = new URLSearchParams(window.location.search);
  const name = params.get("name");
  const batch = params.get("batch");
  if (name || batch) {
    return {
      name: name || "",
      batch: batch || "",
    };
  }

  return null;
}

function getDisplayName(name) {
  const safeName = (name || getUiText(currentLang).fallbackName).trim();
  return safeName || getUiText(currentLang).fallbackName;
}

function getInitials(name) {
  const displayName = getDisplayName(name);
  if (displayName === getUiText(currentLang).fallbackName) return "CM";

  const parts = displayName.split(/\s+/).filter(Boolean);
  if (!parts.length) return "CM";

  return `${parts[0][0]}${parts[1]?.[0] || ""}`.toUpperCase();
}

function applyUiTranslations() {
  const t = getUiText(currentLang);
  document.documentElement.lang = t.htmlLang || currentLang;

  const chatHeaderTitle = document.getElementById("chatHeaderTitle");
  if (chatHeaderTitle) chatHeaderTitle.textContent = ASSISTANT_NAME;

  const sidebarLanguageLabel = document.getElementById("sidebarLanguageLabel");
  if (sidebarLanguageLabel) sidebarLanguageLabel.textContent = t.languageLabel;

  const newChatText = document.getElementById("newChatText");
  if (newChatText) newChatText.textContent = t.newChat;

  const recentLabelText = document.getElementById("recentLabelText");
  if (recentLabelText) recentLabelText.textContent = t.recentLabel;

  const homeLinkText = document.getElementById("homeLinkText");
  if (homeLinkText) homeLinkText.textContent = t.home;

  const chatHeaderStatus = document.getElementById("chatHeaderStatus");
  if (chatHeaderStatus) chatHeaderStatus.textContent = t.chatHeaderStatus;

  const welcomeSubText = document.getElementById("welcomeSubText");
  if (welcomeSubText) welcomeSubText.textContent = t.welcomeSub;

  const welcomeChips = document.querySelectorAll(".welcome-chip");
  const welcomeChipLabels = [t.preset1, t.preset2, t.preset3, t.preset4];
  const welcomeChipSubs = [t.preset1Sub, t.preset2Sub, t.preset3Sub, t.preset4Sub];
  welcomeChips.forEach((chip, index) => {
    const spans = chip.querySelectorAll("span");
    if (spans[0] && welcomeChipLabels[index]) spans[0].textContent = welcomeChipLabels[index];
    if (spans[1] && welcomeChipSubs[index]) spans[1].textContent = welcomeChipSubs[index];
  });

  const suggestions = document.querySelectorAll(".suggestion-chip");
  const suggestionLabels = [t.suggestion1, t.suggestion2, t.suggestion3, t.suggestion4];
  suggestions.forEach((chip, index) => {
    if (suggestionLabels[index]) chip.textContent = suggestionLabels[index];
  });

  const userInput = document.getElementById("userInput");
  if (userInput) userInput.placeholder = t.placeholder;

  const micBtn = document.getElementById("micBtn");
  if (micBtn) micBtn.title = t.micTitle;

  const sendBtn = document.getElementById("sendBtn");
  if (sendBtn) sendBtn.title = t.sendTitle;

  const inputFooterText = document.getElementById("inputFooterText");
  if (inputFooterText) inputFooterText.textContent = t.inputFooter;

  const officialSiteLink = document.getElementById("officialSiteLink");
  if (officialSiteLink) officialSiteLink.textContent = t.officialSite;

  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.remove("active");
    if (b.textContent.toLowerCase().includes(currentLang)) {
      b.classList.add("active");
    }
  });
}

function loadUserProfile() {
  const profile = getProfileData();
  const t = getUiText(currentLang);
  const userName = document.getElementById("userName");
  const userRole = document.getElementById("userRole");
  const userAvatar = document.getElementById("userAvatar");
  const welcomeTitle = document.getElementById("welcomeTitle");

  const profileName = profile?.name ? String(profile.name).trim() : t.fallbackName;
  const profileBatch = profile?.batch ? String(profile.batch).trim() : t.batchNotSet;

  if (userName) userName.textContent = profileName;
  if (userRole) userRole.textContent = profileBatch;
  if (userAvatar) userAvatar.textContent = getInitials(profileName);
  if (welcomeTitle) welcomeTitle.textContent = t.welcomeGreeting.replace("{name}", profileName);
}

function syncSidebarToggleLayout() {
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");

  if (!sidebar || !collapseBtn) return;

  sidebar.style.position = "relative";
  sidebar.style.overflow = "visible";

  collapseBtn.style.position = "absolute";
  collapseBtn.style.right = "-14px";
  collapseBtn.style.top = "50%";
  collapseBtn.style.transform = "translateY(-50%)";
  collapseBtn.style.width = "28px";
  collapseBtn.style.height = "28px";
  collapseBtn.style.borderRadius = "999px";
  collapseBtn.style.border = "1px solid var(--border)";
  collapseBtn.style.background = "var(--surface)";
  collapseBtn.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.4)";
  collapseBtn.style.zIndex = "50";
}

function initChatPage() {
  applyUiTranslations();
  loadUserProfile();
  renderSidebarHistory();
  syncSidebarToggleLayout();
  updateSidebarCollapseState(false);
  updateReadReplyState();
  const genderSelect = document.getElementById("voiceGenderSelect");
  if (genderSelect) {
    genderSelect.value = preferredVoiceGender;
  }
  cacheVoices();
  if (window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = cacheVoices;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChatPage);
} else {
  initChatPage();
}

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = true;
}

// Language codes for speech recognition
const langCodes = {
  en: 'en-US',
  yo: 'yo-NG',
  ha: 'ha-NG',
  ig: 'ig-NG'
};

// ─── RESPONSES DATABASE ───
const responses = {
  en: {
    greeting: [
      "Hello! I'm Grey. How can I help you today? 😊",
      "Hi there! I'm Grey and I'm ready to assist with your NYSC questions.",
      "Welcome, Corps Member! I'm Grey — what do you need help with today?",
    ],
    registration: `To register for NYSC, follow these steps:\n\n<ul><li><strong>Step 1:</strong> Visit the NYSC portal at <em>portal.nysc.org.ng</em></li><li><strong>Step 2:</strong> Click on "Online Registration" and create an account</li><li><strong>Step 3:</strong> Upload required documents (degree certificate, passport photograph, birth certificate)</li><li><strong>Step 4:</strong> Complete your biodata form</li><li><strong>Step 5:</strong> Print your call-up letter after approval</li></ul>\n\nRegistration is usually done by your institution. Ensure your NYSC clearance is completed before graduation.`,
    camp: `<strong>What to pack for NYSC Orientation Camp:</strong>\n\n<ul><li>White shorts and white T-shirts (at least 3 pairs)</li><li>White canvas shoes or trainers</li><li>Bedding: mattress cover, pillow, mosquito net</li><li>Toiletries and personal hygiene items</li><li>Medical prescriptions (if applicable)</li><li>Call-up letter and ID documents</li><li>Padlock for your locker</li><li>Flashlight/torchlight</li></ul>\n\nCamp typically lasts 3 weeks. Avoid bringing valuables or large sums of money.`,
    allowance: `The current NYSC monthly allowance (stipend) is <strong>₦77,000</strong> as approved by the Federal Government.\n\nThis is paid directly into your NYSC bank account. Additional allowances may be provided by your Place of Primary Assignment (PPA) depending on the employer.\n\nNote: Ensure your bank account details are correctly registered on the NYSC portal to avoid payment delays.`,
    relocation: `To apply for relocation/redeployment:\n\n<ul><li>Log in to the NYSC portal</li><li>Go to "Redeployment" section</li><li>Select your reason (medical, marriage, security, etc.)</li><li>Upload supporting documents</li><li>Submit and wait for approval (usually 2–4 weeks)</li></ul>\n\nValid reasons include: medical conditions, marriage to a corps member, security concerns in the deployed state. Note that approval is not guaranteed.`,
    cds: `<strong>Community Development Service (CDS)</strong> is a key part of your service year.\n\nYou must join a CDS group in your state of deployment and attend weekly meetings. Groups include:\n<ul><li>Health CDS</li><li>Education CDS</li><li>Agriculture CDS</li><li>Technology CDS</li><li>Legal Aid CDS</li></ul>\n\nAttendance is mandatory and affects your NYSC certificate. CDS activities count towards your overall assessment.`,
    callup: `Your NYSC call-up letter is issued after your university completes your clearance and submits your details to NYSC.\n\nTo get it:\n<ul><li>Visit the NYSC portal (portal.nysc.org.ng)</li><li>Log in with your registered credentials</li><li>Navigate to "Call-Up Letter" section</li><li>Download and print your letter</li></ul>\n\nKeep your call-up letter safe — you'll need it throughout your service year.`,
    exemption: `You may qualify for NYSC exemption if:\n<ul><li>You are 30 years or older at the time of graduation</li><li>You obtained your degree from a foreign institution not recognized by NUC</li><li>You have a permanent disability</li></ul>\n\nApply for exemption through the NYSC portal under "Exemption Application." You'll need to upload relevant documents like your birth certificate.`,
    default: [
      "I'm here to help with NYSC-related questions! You can ask me about:\n\n• Registration and call-up letter\n• Camp preparation\n• Monthly allowance\n• Relocation/redeployment\n• CDS groups\n• Exemption\n• PPA (Place of Primary Assignment)\n\nWhat would you like to know?",
      "Great question! I can assist with NYSC registration, camp, allowances, CDS, and redeployment. Could you clarify what specific information you need?",
      "I specialize in NYSC information. Please ask me about registration, orientation camp, postings, allowances, CDS, or any service year related query.",
    ],
  },
  yo: {
    greeting: ["Ẹ káàbọ̀! Oruko mi ni Grey. Báwo ni mo ṣe lè ràn yín lọ́wọ́? 😊"],
    registration: "Láti forúkọ sílẹ̀ fún NYSC, ẹ lọ sí oju opo wẹẹbu NYSC (portal.nysc.org.ng) kí ẹ sì tẹ̀lé àwọn ìtọ́sọ́nà tí a pèsè sílẹ̀.",
    camp: "Fun ohun tí o yẹ kí o mú sọ́lẹ̀ fún NYSC Orientation Camp, o yẹ kí o ni shorts funfun, T-shirt funfun, ọkọ̀, àti ohun ìhùwà.",
    allowance: "Owó NYSC oṣùù jẹ́ ₦77,000 gẹ́gẹ́ bí ìjọba àpapọ̀ ti fọwọ́ sí.",
    relocation: "Láti beere fún relocation, wọlé sí oju opo wẹẹbu NYSC, lọ sí apakan Redeployment, yan ìdí, àti rán àkọsílẹ̀ lọ.",
    cds: "CDS jẹ́ apakan pàtàkì ti ọdun iṣẹ́ rẹ. Ẹ gbọdọ̀ darapọ̀ pọ̀ si ẹgbẹ CDS kan, kí ẹ sì tẹ̀sí si ìpàdé owó.",
    callup: "Lẹ́tà call-up NYSC wa lẹhin ẹ̀yìn tuntun. Wọlé, lọ sí Call-Up Letter, ki o sì tẹ̀sí sí.",
    exemption: "O lè yẹ fún ìmúkò NYSC bí o ba jẹ 30 ọdún tàbí ba gba ìwé kọ́ọ̀lẹ̀ ìta ilẹ̀.",
    default: ["Ẹ jọ̀wọ́ béèrè ìbéèrè rẹ nípa NYSC. Mo lè ràn yín lọ́wọ́ pẹ̀lú ìforúkọsilẹ̀, ibùdó, owó oṣù, àti ohun mìíràn."],
  },
  ha: {
    greeting: ["Barka da zuwa! Ni Grey ne. Yaya zan taimaka maka? 😊"],
    registration: "Don yin rajista a NYSC, ziyarci shafin yanar gizon NYSC (portal.nysc.org.ng) ka bi umarnin da aka bayar.",
    camp: "Don abin da za a shirya domin sansanin NYSC, tabbatar akwai shorts da T-shirt na fari, takalma, da abubuwan lafiya.",
    allowance: "Alawus-alawus na wata-wata na NYSC shine ₦77,000 kamar yadda gwamnatin tarayya ta amince.",
    relocation: "Don neman canji wurin aiki, shiga portal, je zuwa Redeployment, zaɓi dalili, sannan aika takardun.",
    cds: "CDS babban sashi ne na shekarar hidima. Dole ne ka shiga rukuni na CDS kuma ka halarci taron mako-mako.",
    callup: "Ana ba da wasikar call-up bayan an kammala tsari. Shiga portal, je Call-Up Letter, sannan ka zazzagewa.",
    exemption: "Kana iya samun keɓancewa idan kana 30 shekaru ko fiye, ko ka kammala karatun ƙasashen waje.",
    default: ["Don Allah tambayi tambayarka ta NYSC. Zan iya taimaka ka game da rajista, sansani, alawus-alawus, da sauransu."],
  },
  ig: {
    greeting: ["Ndewo! Abụ m Grey. Kedu ihe m nwere ike inyere gị aka? 😊"],
    registration: "Iji ndebanye NYSC, gaa na portal NYSC (portal.nysc.org.ng), banye, wee soro usoro ndị a.",
    camp: "Maka ihe ị ga-ebu maka camp NYSC, mara shorts na T-shirt na-acha ọcha, akpụkpọ, na ihe ndị ọzọ.",
    allowance: "Ego NYSC kwa ọnwa bụ ₦77,000 dịka gọọmenti kwadoro.",
    relocation: "Iji arịrịọ ịgbanwe ọnọdụ, banye na portal, gaa na Redeployment, họrọ ihe kpatara ya, wee zipu akwụkwọ.",
    cds: "CDS bụ akụkụ dị mkpa nke afọ ọrụ gị. Ị ga-abanye otu CDS ma rụkwaa nkuzi kwa izu.",
    callup: "A na-enye akwụkwọ call-up mgbe usoro ndị ahụ gasịrị. Banye na portal, gaa na Call-Up Letter, wee budata.",
    exemption: "Ị nwere ike nweta ihichapụ NYSC ma ọ bụrụ na ị gaghị 30, ma ọ bụ ịnụrụ akwụkwọ n’ụzọ ọzọ.",
    default: ["Ajụ ihe ọbụla gbasara NYSC. Enwere m ike inyere gị aka gbasara ndebanye, camp, alawus, na okwu ndị ọzọ."],
  }
};

function getResponse(text) {
  const t = text.toLowerCase();
  const lang = responses[currentLang] || responses.en;
  const r = (key) => {
    const v = lang[key] || responses.en[key];
    return Array.isArray(v) ? v[Math.floor(Math.random() * v.length)] : v;
  };

  if (
    /\b(hi|hello|hey|good morning|good afternoon|howdy|ola|yo|what's up)\b/.test(
      t
    )
  )
    return r("greeting");
  if (/register|registration|how to join|sign up|portal|apply/.test(t))
    return r("registration");
  if (/pack|bring|camp|orientation|what to take|kit/.test(t))
    return r("camp");
  if (/allowance|stipend|salary|pay|how much|₦|money/.test(t))
    return r("allowance");
  if (/relocat|redeployment|transfer|move state|change state/.test(t))
    return r("relocation");
  if (/cds|community development|group|weekly|service/.test(t))
    return r("cds");
  if (/call.?up|callup|letter/.test(t)) return r("callup");
  if (/exempt|exemption|age|30|foreign/.test(t)) return r("exemption");
  return r("default");
}

const presetUiTextKeys = {
  welcome_registration: "preset1",
  welcome_camp: "preset2",
  welcome_allowance: "preset3",
  welcome_relocation: "preset4",
  suggestion_cds: "suggestion1",
  suggestion_callup: "suggestion2",
  suggestion_allowance: "suggestion3",
  suggestion_exemption: "suggestion4",
};

const presetResponseKeys = {
  welcome_registration: "registration",
  welcome_camp: "camp",
  welcome_allowance: "allowance",
  welcome_relocation: "relocation",
  suggestion_cds: "cds",
  suggestion_callup: "callup",
  suggestion_allowance: "allowance",
  suggestion_exemption: "exemption",
};

function getPresetQuestionText(presetKey) {
  const uiKey = presetUiTextKeys[presetKey];
  if (!uiKey) return "";
  return getUiText(currentLang)[uiKey] || "";
}

function getLocalizedPresetReply(presetKey) {
  const responseKey = presetResponseKeys[presetKey];
  if (!responseKey) return null;

  const langResponses = responses[currentLang] || responses.en;
  const reply = langResponses[responseKey] || responses.en[responseKey];
  if (!reply) return null;

  return Array.isArray(reply) ? reply[0] : reply;
}

function sendPresetByKey(presetKey) {
  const reply = getLocalizedPresetReply(presetKey);
  const text = getPresetQuestionText(presetKey);

  if (reply && text) {
    registerSidebarTitle(text);
    addMessage(text, "user");
    addMessage(reply, "ai");
    lastAssistantReply = String(reply)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    updateReadReplyState();
    return;
  }

  sendPreset(text || "");
}

function timeString() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showChat() {
  if (!chatStarted) {
    chatStarted = true;
    document.getElementById("welcomeScreen").style.display = "none";
    document.getElementById("messages").style.display = "block";
    document.getElementById("suggestions").style.display = "flex";
  }
}

function getCurrentUserInitials() {
  const profile = getProfileData();
  const profileName = profile?.name ? String(profile.name).trim() : getUiText(currentLang).fallbackName;
  return getInitials(profileName);
}

function addMessage(text, role) {
  showChat();
  const messages = document.getElementById("messages");
  const wrapper = document.createElement("div");
  wrapper.className = "msg-wrapper";

  const initials = role === "user" ? getCurrentUserInitials() : ASSISTANT_NAME;
  const bubbleContent =
    role === "ai" ? text.replace(/\n/g, "<br>") : escapeHtml(text);
  const showTime = role === "user";

  wrapper.innerHTML = `
    <div class="msg-row ${role}">
      <div class="msg-avatar ${role}">${initials}</div>
      <div class="bubble ${role}">${bubbleContent}</div>
    </div>
    ${showTime ? `<div class="msg-time">${timeString()}</div>` : ""}
  `;
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function escapeHtml(t) {
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function showTyping() {
  showChat();
  const messages = document.getElementById("messages");
  const t = document.createElement("div");
  t.className = "typing-indicator";
  t.id = "typing";
  t.innerHTML = `
    <div class="msg-avatar ai">${ASSISTANT_NAME}</div>
    <div class="typing-bubble">
      <div class="dot-pulse"></div>
      <div class="dot-pulse"></div>
      <div class="dot-pulse"></div>
    </div>`;
  messages.appendChild(t);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById("typing");
  if (t) t.remove();
}

function sendMessage() {
  if (isTyping) return;
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

  registerSidebarTitle(text);
  input.value = "";
  autoResize(input);
  addMessage(text, "user");
  document.getElementById("sendBtn").disabled = true;
  isTyping = true;

  showTyping();

  // Build conversation history
  const messagesEl = document.getElementById("messages");
  const history = [];
  if (messagesEl) {
    const bubbles = messagesEl.querySelectorAll(".bubble");
    bubbles.forEach((bubble) => {
      const row = bubble.closest(".msg-row");
      const role = row.classList.contains("user") ? "user" : "assistant";
      history.push({
        role: role,
        content: bubble.textContent || bubble.innerText,
      });
    });
  }

  postChatMessage({
    message: text,
    language: currentLang,
    history: history,
  })
    .then((data) => {
      removeTyping();

      const reply =
        data?.response ||
        data?.ai_response ||
        data?.message ||
        "Sorry, I couldn't generate an answer right now.";

      if (data?.error) {
        addMessage("Sorry, I encountered an error: " + data.error, "ai");
        lastAssistantReply = "";
      } else {
        addMessage(reply, "ai");
        lastAssistantReply = String(reply)
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }

      updateReadReplyState();
      isTyping = false;
      document.getElementById("sendBtn").disabled = false;
    })
    .catch((err) => {
      removeTyping();
      console.error("Error:", err);
      addMessage(
        "Sorry, I couldn't reach the server. Please try again.",
        "ai"
      );
      isTyping = false;
      document.getElementById("sendBtn").disabled = false;
    });
}

function sendPreset(text) {
  document.getElementById("userInput").value = text;
  sendMessage();
}

function handleKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}

function clearChat() {
  chatStarted = false;
  lastAssistantReply = "";
  updateReadReplyState();
  document.getElementById("messages").innerHTML = "";
  document.getElementById("messages").style.display = "none";
  document.getElementById("suggestions").style.display = "none";
  document.getElementById("welcomeScreen").style.display = "flex";
}

function startNewChat() {
  clearChat();
  closeSidebar();
}

function setLang(lang, btn) {
  currentLang = lang;
  if (recognition) recognition.lang = langCodes[lang] || "en-US";
  localStorage.setItem("nysc_chat_lang", lang);
  document.querySelectorAll(".lang-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const langNames = {
    en: "English",
    yo: "Yoruba",
    ha: "Hausa",
    ig: "Igbo",
  };
  applyUiTranslations();
  loadUserProfile();
  showToast(getUiText(lang).languageSet.replace("{lang}", langNames[lang]));
}

// Speech Recognition and TTS Functions
function startVoiceInput() {
  if (!recognition) {
    showToast("🎤 Voice not supported on this browser");
    return;
  }

  if (isListening) {
    recognition.stop();
    isListening = false;
    updateMicButton();
    return;
  }
  
  isListening = true;
  updateMicButton();
  recognition.lang = langCodes[currentLang] || 'en-US';
  
  let transcript = '';
  
  recognition.onstart = () => {
    showToast("🎤 Listening...");
  };
  
  recognition.onresult = (event) => {
    transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    // Update input field in real-time
    document.getElementById('userInput').value = transcript;
  };
  
  recognition.onerror = (event) => {
    showToast("🎤 Error: " + event.error);
    isListening = false;
    updateMicButton();
  };
  
  recognition.onend = () => {
    isListening = false;
    updateMicButton();
    const text = document.getElementById('userInput').value.trim();
    if (text) {
      sendMessage();
    }
  };

  try {
    recognition.start();
  } catch (error) {
    isListening = false;
    updateMicButton();
    showToast("🎤 Voice input could not start. Please allow microphone access.");
    console.error("Voice input start failed:", error);
  }
}

function updateMicButton() {
  const micBtn = document.querySelector('.mic-btn');
  if (!micBtn) return;
  if (isListening) {
    micBtn.classList.add('listening');
    micBtn.style.background = 'rgba(220, 53, 69, 0.2)';
  } else {
    micBtn.classList.remove('listening');
    micBtn.style.background = '';
  }
}

function cacheVoices() {
  if (!window.speechSynthesis) return;
  availableVoices = window.speechSynthesis.getVoices() || [];
}

function selectVoiceForSpeech() {
  if (!window.speechSynthesis) return null;
  cacheVoices();

  const preferred = preferredVoiceGender === "male" ? "male" : "female";
  const preferredVoice = availableVoices.find((voice) => {
    const gender = (voice.gender || "").toLowerCase();
    const name = voice.name.toLowerCase();
    if (gender === preferred) return true;
    if (preferred === "female" && /female|zira|samantha|susan|victoria|jessica|maya/.test(name)) return true;
    if (preferred === "male" && /male|david|mark|alex|james|michael|daniel|john/.test(name)) return true;
    return false;
  });

  return (
    preferredVoice ||
    availableVoices.find((voice) => voice.default) ||
    availableVoices[0] ||
    null
  );
}

function speakText(text) {
  if (!window.speechSynthesis) {
    showToast("🎤 Voice playback is not supported in this browser");
    return;
  }

  const cleanedText = String(text || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanedText) {
    showToast("🎤 There is no reply to read aloud yet");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = langCodes[currentLang] || "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const selectedVoice = selectVoiceForSpeech();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  window.speechSynthesis.speak(utterance);
  showToast("🎧 Reading the reply aloud");
}

function readLastAssistantReply() {
  if (!lastAssistantReply) {
    showToast("🎤 No assistant reply is available to read yet");
    return;
  }

  speakText(lastAssistantReply);
}

function updateReadReplyState() {
  const readBtn = document.getElementById("readReplyBtn");
  if (readBtn) {
    readBtn.disabled = !lastAssistantReply;
  }
}

function applyVoiceGenderSelection(value) {
  preferredVoiceGender = value;
  localStorage.setItem("nysc_voice_gender", value);
  if (window.speechSynthesis) {
    cacheVoices();
  }
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(() => (t.style.opacity = "0"), 2500);
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
}

function updateSidebarCollapseState(isCollapsed) {
  const sidebar = document.getElementById("sidebar");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");

  if (!sidebar) return;

  sidebar.classList.toggle("collapsed", isCollapsed);
  sidebar.style.width = isCollapsed ? "80px" : "270px";
  sidebar.style.minWidth = isCollapsed ? "80px" : "270px";

  if (collapseBtn) {
    collapseBtn.setAttribute("aria-expanded", String(!isCollapsed));
    collapseBtn.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
    );
    collapseBtn.innerHTML = isCollapsed
      ? `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6" />
          </svg>`
      : `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>`;
  }
}

function toggleSidebarCollapse() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  const nextState = !sidebar.classList.contains("collapsed");
  updateSidebarCollapseState(nextState);
}

// Show welcome message after slight delay
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    addMessage(getResponse("hello"), "ai");
  }, 700);
});
