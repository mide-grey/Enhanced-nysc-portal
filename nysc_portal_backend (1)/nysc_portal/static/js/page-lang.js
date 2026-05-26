let siteLang = 'en';

function setPageLang(lang) {
  siteLang = lang;
  document.querySelectorAll('.lang-nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.lang-nav-btn').forEach(b => { if (b.textContent.toLowerCase().includes(lang)) b.classList.add('active'); });
  updateLandingLanguage();
  // Persist
  localStorage.setItem('nysc_site_lang', lang);
}

function updateLandingLanguage() {
  const t = {
    en: { heroTitle: 'Your Smart NYSC Assistant', heroSub: "Get instant, accurate answers about your NYSC journey — from registration and camp procedures to posting, CDS, and allowances.", btn: 'Ask AI Assistant →' },
    yo: { heroTitle: 'Olùrànlọ́wọ́ NYSC Rẹ', heroSub: 'Gba idahun lẹsẹkẹsẹ nipa irin-ajo NYSC rẹ — lati ìforúkọsilẹ̀ sí ìkúnlẹ̀, ipò, CDS, àti owo-oṣù.', btn: 'Beere AI →' },
    ha: { heroTitle: 'Mataimakin NYSC ɗinku', heroSub: 'Samu amsoshi nan take game da NYSC ɗinku — daga rijista, sansani, zuwa biyan kuɗi da CDS.', btn: 'Tambaya AI →' }
  }[siteLang];

  if (!t) return;
  const title = document.querySelector('.hero-content h1');
  if (title) title.innerHTML = `Your <span class="accent">Smart NYSC</span><br>Assistant`;
  const sub = document.querySelector('.hero-sub');
  if (sub) sub.textContent = t.heroSub;
  document.querySelectorAll('.btn-primary-custom').forEach(b => b.textContent = t.btn);
}

window.addEventListener('load', () => {
  const lang = localStorage.getItem('nysc_site_lang') || 'en';
  setPageLang(lang);
  // show logout if authenticated
  const session = localStorage.getItem('nysc_session');
  if (session) document.getElementById('logoutBtn').style.display = 'inline-block';
});

function logout() {
  localStorage.removeItem('nysc_session');
  window.location.href = 'login.html';
}
