let currentLang = "en";
let isTyping = false;
let chatStarted = false;
let isListening = false;

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
      "Hello! I'm your NYSC AI Assistant. How can I help you today? 😊",
      "Hi there! Ready to assist with all your NYSC questions.",
      "Welcome, Corps Member! What do you need help with today?",
    ],
    registration: `To register for NYSC, follow these steps:\n\n<ul><li><strong>Step 1:</strong> Visit the NYSC portal at <em>portal.nysc.org.ng</em></li><li><strong>Step 2:</strong> Click on "Online Registration" and create an account</li><li><strong>Step 3:</strong> Upload required documents (degree certificate, passport photograph, birth certificate)</li><li><strong>Step 4:</strong> Complete your biodata form</li><li><strong>Step 5:</strong> Print your call-up letter after approval</li></ul>\n\nRegistration is usually done by your institution. Ensure your NYSC clearance is completed before graduation.`,
    camp: `<strong>What to pack for NYSC Orientation Camp:</strong>\n\n<ul><li>White shorts and white T-shirts (at least 3 pairs)</li><li>White canvas shoes or trainers</li><li>Bedding: mattress cover, pillow, mosquito net</li><li>Toiletries and personal hygiene items</li><li>Medical prescriptions (if applicable)</li><li>Call-up letter and ID documents</li><li>Padlock for your locker</li><li>Flashlight/torchlight</li></ul>\n\nCamp typically lasts 3 weeks. Avoid bringing valuables or large sums of money.`,
    allowance: `The current NYSC monthly allowance (stipend) is <strong>₦33,000</strong> as approved by the Federal Government.\n\nThis is paid directly into your NYSC bank account. Additional allowances may be provided by your Place of Primary Assignment (PPA) depending on the employer.\n\nNote: Ensure your bank account details are correctly registered on the NYSC portal to avoid payment delays.`,
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
    greeting: [
      "Ẹ káàbọ̀! Èmi ni olùrànlọ́wọ́ NYSC AI rẹ. Báwo ni mo ṣe lè ràn yín lọ́wọ́? 😊",
    ],
    default: [
      "Ẹ jọ̀wọ́ béèrè ìbéèrè rẹ nípa NYSC. Mo lè ràn yín lọ́wọ́ pẹ̀lú ìforúkọsilẹ̀, ibùdó, owó oṣù, àti ohun mìíràn.",
    ],
    registration:
      "Láti forúkọ sílẹ̀ fún NYSC, ẹ lọ sí oju opo wẹẹbu NYSC (portal.nysc.org.ng) kí ẹ sì tẹ̀lé àwọn ìtọ́sọ́nà tí a pèsè sílẹ̀.",
    allowance: "Owó NYSC oṣùù jẹ́ ₦33,000 gẹ́gẹ́ bí ìjọba àpapọ̀ ti fọwọ́ sí.",
  },
  ha: {
    greeting: [
      "Barka da zuwa! Ni ne mataimakiyar AI ta NYSC. Yaya zan taimaka maka? 😊",
    ],
    default: [
      "Don Allah tambayi tambayarka ta NYSC. Zan iya taimaka ka game da rajista, sansani, alawus-alawus, da sauransu.",
    ],
    registration:
      "Don yin rajista a NYSC, ziyarci shafin yanar gizon NYSC (portal.nysc.org.ng) ka bi umarnin da aka bayar.",
    allowance:
      "Alawus-alawus na wata-wata na NYSC shine ₦33,000 kamar yadda gwamnatin tarayya ta amince.",
  },
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

function addMessage(text, role) {
  showChat();
  const messages = document.getElementById("messages");
  const wrapper = document.createElement("div");
  wrapper.className = "msg-wrapper";

  const initials = role === "user" ? "CM" : "AI";
  const bubbleContent =
    role === "ai" ? text.replace(/\n/g, "<br>") : escapeHtml(text);

  wrapper.innerHTML = `
    <div class="msg-row ${role}">
      <div class="msg-avatar ${role}">${initials}</div>
      <div class="bubble ${role}">${bubbleContent}</div>
    </div>
    <div class="msg-time">${timeString()}</div>
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
    <div class="msg-avatar ai">AI</div>
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

  // Call public API
  fetch("/api/v1/chat/message/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: text,
      language: currentLang,
      history: history,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      removeTyping();
      if (data.error) {
        addMessage("Sorry, I encountered an error: " + data.error, "ai");
      } else {
        addMessage(data.ai_response || data.ai_response, "ai");
      }
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
  if (recognition) recognition.lang = langCodes[lang] || 'en-US';
  document
    .querySelectorAll(".lang-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const langNames = {
    en: "English",
    yo: "Yoruba",
    ha: "Hausa",
    ig: "Igbo"
  };
  showToast(
    `Language set to ${langNames[lang]}`
  );
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
  
  recognition.start();
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

function speakText(text) {
  if (!window.speechSynthesis) {
    console.log('Text-to-speech not supported');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCodes[currentLang] || 'en-US';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
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

function toggleSidebarCollapse() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}

// Show welcome message after slight delay
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    addMessage(responses.en.greeting[0], "ai");
  }, 700);
});
