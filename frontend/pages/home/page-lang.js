let siteLang = localStorage.getItem('nysc_site_lang') || 'en';

const landingTranslations = {
  en: {
    navFeatures: 'Features',
    navHow: 'How it Works',
    navLanguages: 'Languages',
    navCta: 'Ask Grey →',
    logout: 'Logout',
    heroBadge: 'Meet Grey · Powered by Artificial Intelligence · Beta',
    heroTitle: 'Your <span class="accent">Smart NYSC</span><br>Assistant',
    heroSub: 'Meet Grey, your smart NYSC assistant. Get instant, accurate answers about your NYSC journey — from registration and camp procedures to posting, CDS, and allowances. Available 24/7 in English, Yoruba, Hausa, and Igbo.',
    heroAsk: 'Ask Grey',
    heroSee: 'See Features',
    statCorps: 'Corps Members',
    statAvailability: 'Availability',
    statLanguages: 'Languages',
    statResponse: 'Response Time',
    featuresLabel: 'Features',
    featuresTitle: 'Everything you need<br>in one smart portal',
    featuresSub: "Designed specifically for Nigeria's National Youth Service Corps members and prospective corpers.",
    instantTitle: 'Instant Answers',
    instantDesc: 'Get immediate responses to your NYSC questions without waiting in long queues or browsing outdated FAQs. Real-time AI-powered support.',
    voiceTitle: 'Voice Interaction',
    voiceDesc: 'Speak your questions naturally using the microphone feature. Perfect for when you are on the go or prefer talking over typing.',
    multilingualTitle: 'Multilingual Support',
    multilingualDesc: 'Communicate in English, Yoruba, Hausa, or Igbo. The AI understands and responds in your preferred language for true inclusivity.',
    docTitle: 'NYSC Document Help',
    docDesc: 'Get guidance on call-up letters, exclusion letters, relocation requests, and all essential documentation required throughout service year.',
    stateTitle: 'State Deployment Info',
    stateDesc: 'Learn about your state of deployment — camp details, orientation schedules, allowances, and what to expect at your NYSC camp.',
    secureTitle: 'Secure & Private',
    secureDesc: 'Your conversations are confidential. The portal does not store personal data and complies with Nigerian data protection guidelines.',
    howLabel: 'How it Works',
    howTitle: 'Simple. Fast.<br>Reliable.',
    howSub: 'Three steps to getting the NYSC answers you need — no login required to start.',
    step1Title: 'Open the AI Chat',
    step1Desc: 'Click "Ask AI Assistant" to open the intelligent chat interface — available instantly, no account needed.',
    step2Title: 'Ask Your Question',
    step2Desc: 'Type (or speak) your NYSC question in any language. Be as specific or general as you like — the AI understands context.',
    step3Title: 'Get Instant Guidance',
    step3Desc: 'Receive a clear, accurate answer within seconds. Follow up with more questions or start a new topic anytime.',
    langLabel: 'Languages',
    langTitle: 'Speak the language<br>you\'re most comfortable with',
    langBody: "Nigeria's diversity is our strength. The NYSC AI Portal supports four major languages to serve every corps member.",
    langEnglish: 'English',
    langYoruba: 'Yoruba',
    langHausa: 'Hausa',
    langIgbo: 'Igbo',
    ctaLabel: 'Get Started',
    ctaTitle: 'Ready to simplify your<br>NYSC experience?',
    ctaBody: 'Join thousands of corps members getting instant answers to their NYSC questions every day.',
    ctaBtn: 'Open AI Assistant',
    footerBrand: 'NYSC AI Portal · An AI-powered information assistant',
    footerAbout: 'About',
    footerPrivacy: 'Privacy',
    footerContact: 'Contact',
    footerOfficial: 'nysc.gov.ng ↗',
    footerCopyright: '© 2025 NYSC AI Portal. For informational purposes only.'
  },
  yo: {
    navFeatures: 'Àwọn ẹya',
    navHow: 'Bí ó ṣe ṣiṣẹ',
    navLanguages: 'Àwọn èdè',
    navCta: 'Beere Grey →',
    logout: 'Jìwọ́ sílẹ̀',
    heroBadge: 'Meet Grey · Powered by Artificial Intelligence · Beta',
    heroTitle: 'Olùrànlọ́wọ́ <span class="accent">NYSC</span><br>Rẹ',
    heroSub: 'Meet Grey, olùrànlọ́wọ́ NYSC ọlọ́gbọ́n rẹ. Gba idahun lẹsẹkẹsẹ nipa irin-ajo NYSC rẹ — lati ìforúkọsilẹ̀ sí ìkúnlẹ̀, ipò, CDS, àti owo-oṣù. Wà lọwọlọwọ́ ni gbogbo ọjọ́ àti gbogbo àkókò ni English, Yoruba, Hausa, àti Igbo.',
    heroAsk: 'Beere Grey',
    heroSee: 'Wo Àwọn ẹya',
    statCorps: 'Àwọn ọmọ ẹgbẹ̀ NYSC',
    statAvailability: 'Ìmúlò',
    statLanguages: 'Àwọn èdè',
    statResponse: 'Àkókò ìdáhùn',
    featuresLabel: 'Àwọn ẹya',
    featuresTitle: 'Ohun gbogbo tí o nilo<br>ni ibi kan',
    featuresSub: 'A ṣe apẹrẹ pataki fún àwọn ọmọ ẹgbẹ̀ NYSC àti àwọn tí wọ́n fẹ́ láti wọlé ìjọba.',
    instantTitle: 'Àwọn idahun lẹsẹkẹsẹ',
    instantDesc: 'Gba idahun lẹsẹkẹsẹ si àwọn ìbéèrè NYSC rẹ laisi pe o dúró fún ìpẹ́apọ̀. Atilẹ́yìn AI ni akoko gidi.',
    voiceTitle: 'Ìsọ̀rọ̀ ohùn',
    voiceDesc: 'Sọ àwọn ìbéèrè rẹ pẹ̀lú ohùn. O dara fun ìgbà tí o máa n rin kiri tàbí tí o fẹ́ sọ dípò kikọ.',
    multilingualTitle: 'Àtìlẹ́yìn èdè pupọ',
    multilingualDesc: 'Sọ̀rọ̀ ni English, Yoruba, Hausa, tàbí Igbo. AI yóò tẹ̀sí sí èdè tí o yan fun ìkúnlè.',
    docTitle: 'Ìrànlọ́wọ́ fún àkọsílẹ̀ NYSC',
    docDesc: 'Gba ìrànlọ́wọ́ nípa lẹ́tà ìpàdé, ìtẹ́wọ̀sí, ìfè́ràn, àti gbogbo àkọsílẹ̀ tí o nilo fún ọdun iṣẹ́ rẹ.',
    stateTitle: 'Ìmọ̀ iṣẹ́ ìpínlẹ̀',
    stateDesc: 'Mọ̀ nípa ibùdó rẹ — ìpinnu camp, ìṣèòrí, owo-oṣù, àti ohun tí o yẹ kí o reti.',
    secureTitle: 'Aabo àti ìkúnlẹ̀',
    secureDesc: 'Awọn ìjíròrò rẹ jẹ́ aláìsọfò. Ààrẹgbẹ́ n kò́ sí ipamọ́ data tí kì í ṣe ẹni rẹ.',
    howLabel: 'Bí ó ṣe ṣiṣẹ',
    howTitle: 'Kò pọ́n. Kò ní ṣe.<br>Ọ́ dájú.',
    howSub: 'Awọn ìgbésẹ̀ mẹ́ta láti gba àdáhùn NYSC rẹ — kò nílò ìwọlé láti bẹ̀rẹ̀.',
    step1Title: 'Ṣí ìjíròrò AI',
    step1Desc: 'Tẹ “Beere AI” láti ṣi ìjíròrò chat tí o yi ara rẹ. O wà lẹsẹkẹsẹ, kò nílò ìkàun̄tì.',
    step2Title: 'Béèrè ìbéèrè rẹ',
    step2Desc: 'Tẹ̀ tàbí sọ ìbéèrè NYSC rẹ ni èdè tí o fẹ́. O lè ṣe pataki tàbí gbooro — AI yóò túmọ̀ sí.',
    step3Title: 'Gba ìrànlọ́wọ́ lẹsẹkẹsẹ',
    step3Desc: 'Gba idahun kedere, tó dájú, ni ìsẹ́jú díẹ̀. O lè béèrè ìbéèrè síi lẹ́ẹ̀kan si.',
    langLabel: 'Àwọn èdè',
    langTitle: 'Sọ̀rọ̀ ni èdè tí o<br>yára fẹ́',
    langBody: 'Ọ̀pọ̀pọ̀ èdè ilẹ̀ Naijírí jẹ́ agbára wa. NYSC AI Portal ṣe atilẹ́ko èdè mẹ́rin.',
    langEnglish: 'English',
    langYoruba: 'Yoruba',
    langHausa: 'Hausa',
    langIgbo: 'Igbo',
    ctaLabel: 'Bẹrẹ',
    ctaTitle: 'Ṣé o fẹ́ láti mú<br>ìrírí NYSC rẹ di ẹ̀rọ?',
    ctaBody: 'Darapọ̀ pẹlu ẹgbẹ̀ẹ́rún ọmọ ẹgbẹ̀ NYSC tí ń gba idahun lẹsẹkẹsẹ wọ́pọ̀.',
    ctaBtn: 'Ṣí AI Assistant',
    footerBrand: 'NYSC AI Portal · Olùrànlọ́wọ́ AI',
    footerAbout: 'Nipa',
    footerPrivacy: 'Ìtọ́kasí',
    footerContact: 'Ìbánisọ̀rọ̀',
    footerOfficial: 'nysc.gov.ng ↗',
    footerCopyright: '© 2025 NYSC AI Portal. Fun ìlànà ìmọ̀ràn nikan.'
  },
  ha: {
    navFeatures: 'Fasaloli',
    navHow: 'Yadda Ake Aiki',
    navLanguages: 'Harsuna',
    navCta: 'Tambaya Grey →',
    logout: 'Fita',
    heroBadge: 'Meet Grey · Powered by Artificial Intelligence · Beta',
    heroTitle: 'Mataimakin <span class="accent">NYSC</span><br>ɗinku',
    heroSub: 'Meet Grey, mataimakin NYSC ɗinku mai hankali. Samun amsa nan take game da NYSC ɗinku — daga rajista da shirye-shiryen sansani, zuwa biyan kuɗi, CDS, da sauran abubuwa. Akwai 24/7 a English, Yoruba, Hausa, da Igbo.',
    heroAsk: 'Tambaya Grey',
    heroSee: 'Duba Fasaloli',
    statCorps: 'Mambobin NYSC',
    statAvailability: 'Yanzu-yanzu',
    statLanguages: 'Harsuna',
    statResponse: 'Lokacin amsa',
    featuresLabel: 'Fasaloli',
    featuresTitle: 'Duk abin da kake so<br>a shafin guda',
    featuresSub: 'An tsara shi musamman ga mambobin NYSC da waɗanda ke shirin shiga.',
    instantTitle: 'Amsa nan take',
    instantDesc: 'Samun amsa nan take ga tambayoyin NYSC da ba ku jira dogon lokaci ba ko bincika FAQ marasa zamani.',
    voiceTitle: 'Amsa ta murya',
    voiceDesc: 'Faɗa tambayoyinku ta hanyar murya. Yana da kyau lokacin da kuke cikin tafiya ko kuna son magana maimakon buga.',
    multilingualTitle: 'Tallafin harsuna da yawa',
    multilingualDesc: 'Kuna iya magana da English, Yoruba, Hausa, ko Igbo. AI na gane da amsa da harshen da kuka zaɓa.',
    docTitle: 'Taimakon takardu na NYSC',
    docDesc: 'Samun jagora kan wasikar kiran aiki, takardu na keɓancewa, buƙatun ƙaura, da duk takardu masu mahimmanci.',
    stateTitle: 'Bayani kan wurin aiki',
    stateDesc: 'Koyi game da wurin da kuke aiki — bayanin sansani, jadawalin shiri, alawus, da abin da ake sa ran a sansani.',
    secureTitle: 'Amintattu & sirri',
    secureDesc: 'Tattaunawar ku na ɓoye. Portal ba ta adana bayanan sirri ba kuma tana bin ka\'idodin kariya.',
    howLabel: 'Yadda Ake Aiki',
    howTitle: 'Sauƙi. Gudu.<br>Amintattu.',
    howSub: 'Matakai uku na samun amsar NYSC da kuke buƙata — ba sa buƙatar shiga don farawa.',
    step1Title: 'Buɗe tattaunawar AI',
    step1Desc: 'Danna “Tambaya AI” don buɗe muhawara ta chat da take, ba buƙatar asusu.',
    step2Title: 'Tambayi tambaya',
    step2Desc: 'Buga ko yi magana game da tambayar NYSC a harshen da kuka zaɓa. AI na fahimta.',
    step3Title: 'Samun jagora nan take',
    step3Desc: 'Samun amsa mai bayyanawa da daidai a cikin daƙiƙa. Kuna iya ci gaba da tambaya a kowane lokaci.',
    langLabel: 'Harsuna',
    langTitle: 'Yi magana da harshen da<br>kuke fi so',
    langBody: 'Rikicin al’adun Najeriya shine ƙarfi namu. NYSC AI Portal yana goyan bayan harsuna huɗu.',
    langEnglish: 'English',
    langYoruba: 'Yoruba',
    langHausa: 'Hausa',
    langIgbo: 'Igbo',
    ctaLabel: 'Fara',
    ctaTitle: 'Kuna shirye don sauƙaƙe<br>kwan NYSC ɗinku?',
    ctaBody: 'Ku shiga cikin dubban mambobin NYSC da ke samun amsa nan take game da tambayoyinsu.',
    ctaBtn: 'Buɗe AI Assistant',
    footerBrand: 'NYSC AI Portal · Mataimakin AI',
    footerAbout: 'Game da',
    footerPrivacy: 'Keɓancewa',
    footerContact: 'Tuntuɓa',
    footerOfficial: 'nysc.gov.ng ↗',
    footerCopyright: '© 2025 NYSC AI Portal. Don dalilai na bayani kawai.'
  },
  ig: {
    navFeatures: 'Ụdị',
    navHow: 'Otu o si eme',
    navLanguages: 'Asụsụ',
    navCta: 'Ajụ Grey →',
    logout: 'Pụọ',
    heroBadge: 'Meet Grey · Powered by Artificial Intelligence · Beta',
    heroTitle: 'Ndịaka <span class="accent">NYSC</span><br>Gị',
    heroSub: 'Meet Grey, enyemaka NYSC gị nwere amamihe. Nweta azịza ngwa ngwa gbasara NYSC gị — site na ndebanye, usoro camp, ịtọ ọrụ, CDS, na ụgwọ. Ọ dị n’oge 24/7 na English, Yoruba, Hausa, na Igbo.',
    heroAsk: 'Ajụ Grey',
    heroSee: 'Lee Ụdị',
    statCorps: 'Ndị NYSC',
    statAvailability: 'Ndịnị',
    statLanguages: 'Asụsụ',
    statResponse: 'Oge nzịza',
    featuresLabel: 'Ụdị',
    featuresTitle: 'Ihe niile i chọrọ<br>na otu ebe',
    featuresSub: 'A haziri ya maka ndị NYSC na ndị na-eche ịbanye.',
    instantTitle: 'Azịza ngwa ngwa',
    instantDesc: 'Nweta azịza ngwa ngwa maka ajụjụ NYSC gị, na-ewezuga igbu oge ma ọ bụ ịgagharịrị FAQs ochie.',
    voiceTitle: 'Azịza site n’olu',
    voiceDesc: 'Kwuo ajụjụ gị site n’olu. Ọ bara uru mgbe ị na-aga ma ọ bụ ịnọgide na-agwa okwu karịa ịde ihe.',
    multilingualTitle: 'Nkwado asụsụ ọtụtụ',
    multilingualDesc: 'Gwa okwu na English, Yoruba, Hausa, ma ọ bụ Igbo. AI na aghọta ma zaa n’asụsụ ị họọrọ.',
    docTitle: 'Nkwado akwụkwọ NYSC',
    docDesc: 'Nweta ntuziaka gbasara akwụkwọ kpọ oku, akwụkwọ ihichapụ, arịrịọ ịgbanwe ọnọdụ, na akwụkwọ niile dị mkpa.',
    stateTitle: 'Ozi banyere ọnọdụ ọrụ',
    stateDesc: 'Mụta banyere obodo ọrụ gị — nkọwa camp, atụmatụzụ, ụgwọ, na ihe i kwesịrị ịtụ anya.',
    secureTitle: 'Nche & nzuzo',
    secureDesc: 'Mkparịta ụka gị bụ nzuzo. Portal anaghị echekwa data nkeonwe ma na-emeso iwu nchekwa data.',
    howLabel: 'Otu o si eme',
    howTitle: 'Ọ dị mfe. Ọ ngwa.<br>Ọ dabara.',
    howSub: 'Usoro atọ iji nweta azịza NYSC gị — ịkwaghị ịbanye iji malite.',
    step1Title: 'Meghe chat AI',
    step1Desc: 'Pịa “Ajụ AI” iji meghe chat nyocha ngwa ngwa, na-enweghị akaụntụ.',
    step2Title: 'Ajụ ajụjụ gị',
    step2Desc: 'Pịnye ma ọ bụ kwuru ajụjụ NYSC gị n’asụsụ gị. AI na aghọta ọnọdụ.',
    step3Title: 'Nweta ntuziaka ngwa ngwa',
    step3Desc: 'Nweta azịza doro anya na nke ziri ezi n’oge ntabi anya. Ị pụrụ ịga n’ihu ajụ ọzọ.',
    langLabel: 'Asụsụ',
    langTitle: 'Kwuo asụsụ ị<br>masịrị',
    langBody: 'Ọdịdị asụsụ Naịjirịa bụ ike anyị. NYSC AI Portal na-akwado asụsụ anọ.',
    langEnglish: 'English',
    langYoruba: 'Yoruba',
    langHausa: 'Hausa',
    langIgbo: 'Igbo',
    ctaLabel: 'Malite',
    ctaTitle: 'Ị ready iji mee<br>NYSC gị mfe?',
    ctaBody: 'Sonye n’ọnụ ọgụgụ ndị NYSC ndị na-enweta azịza ngwa ngwa kwa ụbọchị.',
    ctaBtn: 'Meghe AI Assistant',
    footerBrand: 'NYSC AI Portal · Nkwado AI',
    footerAbout: 'Banyere',
    footerPrivacy: 'Nzuzo',
    footerContact: 'Kpọtụrụ',
    footerOfficial: 'nysc.gov.ng ↗',
    footerCopyright: '© 2025 NYSC AI Portal. Maka ozi naanị.'
  }
};

function getLandingText(lang) {
  return landingTranslations[lang] || landingTranslations.en;
}

function setPageLang(lang) {
  siteLang = lang;
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-nav-btn').forEach((b) => {
    b.classList.toggle('active', b.textContent.toLowerCase().includes(lang));
  });
  updateLandingLanguage();
  localStorage.setItem('nysc_site_lang', lang);
}

function updateLandingLanguage() {
  const t = getLandingText(siteLang);

  const heroTitle = document.querySelector('.hero-content h1');
  if (heroTitle) heroTitle.innerHTML = t.heroTitle;

  const heroSub = document.querySelector('.hero-sub');
  if (heroSub) heroSub.textContent = t.heroSub;

  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge) heroBadge.textContent = t.heroBadge;

  document.querySelectorAll('.btn-primary-custom').forEach((b) => {
    b.textContent = t.heroAsk;
  });

  const seeFeatures = document.querySelector('.btn-secondary-custom');
  if (seeFeatures) seeFeatures.textContent = t.heroSee;

  const stats = document.querySelectorAll('.hero-stats .stat-label');
  const statLabels = [t.statCorps, t.statAvailability, t.statLanguages, t.statResponse];
  stats.forEach((el, index) => {
    if (statLabels[index]) el.textContent = statLabels[index];
  });

  const featureLabels = document.querySelectorAll('.feature-card .feature-title');
  const featureTexts = [t.instantTitle, t.voiceTitle, t.multilingualTitle, t.docTitle, t.stateTitle, t.secureTitle];
  featureLabels.forEach((el, index) => {
    if (featureTexts[index]) el.textContent = featureTexts[index];
  });

  const featureDescs = document.querySelectorAll('.feature-card .feature-desc');
  const featureDescsText = [t.instantDesc, t.voiceDesc, t.multilingualDesc, t.docDesc, t.stateDesc, t.secureDesc];
  featureDescs.forEach((el, index) => {
    if (featureDescsText[index]) el.textContent = featureDescsText[index];
  });

  const featuresLabel = document.querySelector('.features .section-label');
  if (featuresLabel) featuresLabel.textContent = t.featuresLabel;
  const featuresTitle = document.querySelector('.features .section-title');
  if (featuresTitle) featuresTitle.innerHTML = t.featuresTitle;
  const featuresSub = document.querySelector('.features .section-sub');
  if (featuresSub) featuresSub.textContent = t.featuresSub;

  const howLabel = document.querySelector('.how .section-label');
  if (howLabel) howLabel.textContent = t.howLabel;
  const howTitle = document.querySelector('.how .section-title');
  if (howTitle) howTitle.innerHTML = t.howTitle;
  const howSub = document.querySelector('.how .section-sub');
  if (howSub) howSub.textContent = t.howSub;

  const howTitles = document.querySelectorAll('.step-line .step-title');
  const howStepTitles = [t.step1Title, t.step2Title, t.step3Title];
  howTitles.forEach((el, index) => {
    if (howStepTitles[index]) el.textContent = howStepTitles[index];
  });

  const howDescs = document.querySelectorAll('.step-line .step-desc');
  const howStepDescs = [t.step1Desc, t.step2Desc, t.step3Desc];
  howDescs.forEach((el, index) => {
    if (howStepDescs[index]) el.textContent = howStepDescs[index];
  });

  const langLabel = document.querySelector('.lang-card .section-label');
  if (langLabel) langLabel.textContent = t.langLabel;
  const langTitle = document.querySelector('.lang-card .section-title');
  if (langTitle) langTitle.innerHTML = t.langTitle;
  const langBody = document.querySelector('.lang-card p');
  if (langBody) langBody.textContent = t.langBody;

  document.querySelectorAll('.lang-chip').forEach((chip, index) => {
    const labels = [t.langEnglish, t.langYoruba, t.langHausa, t.langIgbo];
    const icon = chip.dataset.icon || '';
    if (labels[index]) chip.textContent = `${icon} ${labels[index]}`;
  });

  const navFeatures = document.getElementById('navFeaturesLink');
  if (navFeatures) navFeatures.textContent = t.navFeatures;
  const navHow = document.getElementById('navHowLink');
  if (navHow) navHow.textContent = t.navHow;
  const navLanguages = document.getElementById('navLanguagesLink');
  if (navLanguages) navLanguages.textContent = t.navLanguages;
  const navCta = document.getElementById('navCtaLink');
  if (navCta) navCta.textContent = t.navCta;

  const ctaLabel = document.querySelector('.cta-section .section-label');
  if (ctaLabel) ctaLabel.textContent = t.ctaLabel;
  const ctaTitle = document.querySelector('.cta-section h2');
  if (ctaTitle) ctaTitle.innerHTML = t.ctaTitle;
  const ctaBody = document.querySelector('.cta-section p');
  if (ctaBody) ctaBody.textContent = t.ctaBody;

  const footerBrand = document.getElementById('footerBrandText');
  if (footerBrand) footerBrand.textContent = t.footerBrand;
  const footerLinks = document.querySelectorAll('footer a');
  if (footerLinks.length >= 4) {
    footerLinks[0].textContent = t.footerAbout;
    footerLinks[1].textContent = t.footerPrivacy;
    footerLinks[2].textContent = t.footerContact;
    footerLinks[3].textContent = t.footerOfficial;
  }
  const footerCopyright = document.getElementById('footerCopyrightText');
  if (footerCopyright) footerCopyright.textContent = t.footerCopyright;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.textContent = t.logout;

  document.querySelectorAll('.lang-chip').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.lang === siteLang);
  });
}

window.addEventListener('load', () => {
  const lang = localStorage.getItem('nysc_site_lang') || 'en';
  setPageLang(lang);
  const session = localStorage.getItem('nysc_session');
  if (session) document.getElementById('logoutBtn').style.display = 'inline-block';
});

function logout() {
  localStorage.removeItem('nysc_session');
  window.location.href = '../index/';
}
