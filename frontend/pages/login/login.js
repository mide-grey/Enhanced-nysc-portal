// Language translations
const translations = {
  en: {
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    name: 'Full Name',
    batch: 'NYSC Batch',
    submit: 'Login',
    haveAccount: "Don't have an account?",
    noAccount: 'Already have an account?',
    errorEmail: 'Please enter a valid email',
    errorPassword: 'Password must be at least 6 characters',
    errorMatch: 'Passwords do not match',
    errorName: 'Please enter your name',
    errorBatch: 'Please select your batch',
    successSignup: 'Account created successfully! Please login.',
    successLogin: 'Login successful! Redirecting...',
    errorLoginFailed: 'Invalid email or password',
  },
  yo: {
    login: 'Wọlé',
    signup: 'Forọ',
    email: 'Àdirẹ́ẹ̀sì Imeèlì',
    password: 'Ọ̀rọ̀ Ọ̀fọ̀',
    confirmPassword: 'Ìdá Ọ̀rọ̀ Ọ̀fọ̀',
    name: 'Orúkọ Ún Tí ó Pé',
    batch: 'NYSC Ìyẹ̀',
    submit: 'Wọlé',
    haveAccount: 'Ṇjẹ̀ o ní àkáun̄tì?',
    noAccount: 'Ó ti yẹ o ní àkáun̄tì?',
    errorEmail: 'Jọ̀wọ́ ti àdirẹ́ẹ̀sì imeèlì tí ó́ tọ̀',
    errorPassword: 'Ọ̀rọ̀ ọ̀fọ̀ gbọ́dọ̀ jẹ́ oríkì 6 lẹ́tà',
    errorMatch: 'Ọ̀rọ̀ ọ̀fọ̀ kò̀ dọ́ pọ̀',
    errorName: 'Jọ̀wọ́ tin orúkọ ọ́',
    errorBatch: 'Jọ̀wọ́ yan NYSC Ìyẹ̀ rẹ',
    successSignup: 'Àkáun̄tì ti dá rẹ! Jọ̀wọ́ wọlé.',
    successLogin: 'Wọlé rẹ̀! A ń lo sí ibi tí à wà...',
    errorLoginFailed: 'Imeèlì tàbí ọ̀rọ̀ ọ̀fọ̀ kò̀ tọ̀',
  },
  ha: {
    login: 'Shiga',
    signup: 'Bugi',
    email: 'Adireshin Sadarwa',
    password: 'Kalmar Sirri',
    confirmPassword: 'Tabbatarwa Kalmar Sirri',
    name: 'Cikakken Suna',
    batch: 'NYSC Gulma',
    submit: 'Shiga',
    haveAccount: 'Ba ka da asusu ba?',
    noAccount: 'Ya kai asusun ba?',
    errorEmail: 'Da fatan za ka saka adireshin sadarwa mai dacewa',
    errorPassword: 'Kalmar sirri dole ne ta kasua haraashi 6',
    errorMatch: 'Kalmar sirri ba su dace ba',
    errorName: 'Da fatan ka saka sunanka',
    errorBatch: 'Da fatan ka zaɓi gulman NYSC naka',
    successSignup: 'An bugi asusu! Da fatan za ka shiga.',
    successLogin: 'Shigar nai! Ana tafiya...',
    errorLoginFailed: 'Sadarwa ko kalmar sirri basu dace ba',
  }
};

let currentLang = 'en';

// Tab Switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tab = this.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-tab'));
    
    this.classList.add('active');
    document.getElementById(tab + 'Form').classList.add('active-tab');
    
    // Update submit button text
    const submitBtn = document.getElementById(tab + 'Form').querySelector('.btn-submit');
    submitBtn.textContent = translations[currentLang][tab === 'login' ? 'submit' : 'submit'];
  });
});

// Switch Tab via Link
document.querySelectorAll('.switch-tab').forEach(link => {
  link.addEventListener('click', function() {
    const tab = this.dataset.tab;
    const btn = document.querySelector(`[data-tab="${tab}"]`);
    btn.click();
  });
});

// Language Toggle
function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  updatePageLanguage();
}

function updatePageLanguage() {
  const t = translations[currentLang];
  
  // Update labels and placeholders
  document.querySelectorAll('label').forEach((label, i) => {
    const keys = ['name', 'email', 'password', 'confirmPassword', 'batch'];
    if (i < keys.length) {
      label.textContent = t[keys[i]];
    }
  });
  
  // Update placeholders
  const inputs = document.querySelectorAll('input');
  inputs[0].placeholder = t.email;
  inputs[1].placeholder = t.password;
  if (inputs[2]) inputs[2].placeholder = t.email;
  if (inputs[3]) inputs[3].placeholder = t.password;
  if (inputs[4]) inputs[4].placeholder = t.confirmPassword;
  
  // Update submit buttons
  document.querySelectorAll('.btn-submit').forEach(btn => {
    btn.textContent = t.submit;
  });
  
  // Update form links
  document.querySelectorAll('.form-link').forEach((link, i) => {
    if (i === 0) {
      link.innerHTML = t.haveAccount + ' <span class="switch-tab" data-tab="signup">' + t.signup + '</span>';
    } else {
      link.innerHTML = t.noAccount + ' <span class="switch-tab" data-tab="login">' + t.login + '</span>';
    }
  });
  
  // Re-attach switch tab listeners
  document.querySelectorAll('.switch-tab').forEach(link => {
    link.addEventListener('click', function() {
      const tab = this.dataset.tab;
      const btn = document.querySelector(`[data-tab="${tab}"]`);
      btn.click();
    });
  });
}

// Form Handling
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Validation
  if (!email || !email.includes('@')) {
    showError(translations[currentLang].errorEmail);
    return;
  }
  
  // Get stored users
  const users = JSON.parse(localStorage.getItem('nysc_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    showError(translations[currentLang].errorLoginFailed);
    return;
  }
  
  // Login successful
  const session = {
    email: email,
    name: user.name,
    batch: user.batch,
    loginTime: new Date().toISOString()
  };
  
  localStorage.setItem('nysc_session', JSON.stringify(session));
  localStorage.setItem('nysc_profile_cache', JSON.stringify({
    name: user.name,
    batch: user.batch
  }));
  window.name = JSON.stringify({
    name: user.name,
    batch: user.batch
  });
  showSuccess(translations[currentLang].successLogin);
  
  setTimeout(() => {
    window.location.href = '../index/';
  }, 1500);
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('signupConfirm').value;
  const batch = document.getElementById('signupBatch').value;
  
  const t = translations[currentLang];
  
  // Validation
  if (!name) {
    showError(t.errorName);
    return;
  }
  if (!email || !email.includes('@')) {
    showError(t.errorEmail);
    return;
  }
  if (!password || password.length < 6) {
    showError(t.errorPassword);
    return;
  }
  if (password !== confirm) {
    showError(t.errorMatch);
    return;
  }
  if (!batch) {
    showError(t.errorBatch);
    return;
  }
  
  // Check if email exists
  const users = JSON.parse(localStorage.getItem('nysc_users') || '[]');
  if (users.find(u => u.email === email)) {
    showError('Email already registered');
    return;
  }
  
  // Add new user
  users.push({ name, email, password, batch });
  localStorage.setItem('nysc_users', JSON.stringify(users));
  
  showSuccess(t.successSignup);
  
  setTimeout(() => {
    document.querySelector('[data-tab="login"]').click();
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = '';
  }, 1500);
});

// Error/Success Messages
function showError(msg) {
  const errorEl = document.getElementById('errorMsg');
  errorEl.textContent = msg;
  errorEl.classList.add('show');
  document.getElementById('successMsg').classList.remove('show');
  
  setTimeout(() => {
    errorEl.classList.remove('show');
  }, 5000);
}

function showSuccess(msg) {
  const successEl = document.getElementById('successMsg');
  successEl.textContent = msg;
  successEl.classList.add('show');
  document.getElementById('errorMsg').classList.remove('show');
  
  setTimeout(() => {
    successEl.classList.remove('show');
  }, 5000);
}

// Check if already logged in
window.addEventListener('load', function() {
  const session = localStorage.getItem('nysc_session');
  if (session) {
    window.location.href = '../index/';
  }
});
