// ============================================================
// REZZA MAULANA PORTFOLIO — script.js
// ============================================================

// ===== DARK / LIGHT MODE TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== ACTIVE NAV LINK =====
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function updateActiveLink() {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

window.addEventListener('scroll', updateActiveLink);

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// ===== TYPING ANIMATION =====
const roles = [
  'Web Developer',
  'UI/UX Designer',
  'Frontend Developer',
  'PHP & Laravel Dev',
];

let roleIdx = 0;
let charIdx = 0;
let isDeleting = false;
const typingEl = document.getElementById('typingText');

function typeLoop() {
  if (!typingEl) return;
  const current = roles[roleIdx];

  if (isDeleting) {
    typingEl.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typingEl.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }

  let speed = isDeleting ? 60 : 100;

  if (!isDeleting && charIdx === current.length) {
    speed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIdx === 0) {
    isDeleting = false;
    roleIdx = (roleIdx + 1) % roles.length;
    speed = 300;
  }

  setTimeout(typeLoop, speed);
}

typeLoop();

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -50px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

// ===== SKILL BAR ANIMATION =====
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillFills.forEach(fill => skillObserver.observe(fill));

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    backToTop.classList.add('show');
  } else {
    backToTop.classList.remove('show');
  }
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== CONTACT FORM — ANTI-SPAM + FORMSPREE =====
const contactForm = document.getElementById('contactForm');
const formStatus  = document.getElementById('formStatus');
const submitBtn   = document.getElementById('submitBtn');

// --- Proteksi 1: Rate limiting (max 3 kirim per 10 menit) ---
const RATE_LIMIT    = 3;
const RATE_WINDOW   = 10 * 60 * 1000; // 10 menit dalam ms
const COOLDOWN_TIME = 60 * 1000;      // cooldown 60 detik antar submit

function getRateData() {
  const raw = sessionStorage.getItem('_form_rate');
  return raw ? JSON.parse(raw) : { count: 0, firstAt: null, lastAt: null };
}

function setRateData(data) {
  sessionStorage.setItem('_form_rate', JSON.stringify(data));
}

function isRateLimited() {
  const data = getRateData();
  const now  = Date.now();

  // Reset window jika sudah lewat 10 menit
  if (data.firstAt && (now - data.firstAt) > RATE_WINDOW) {
    setRateData({ count: 0, firstAt: null, lastAt: null });
    return false;
  }

  // Cek cooldown antar submit (60 detik)
  if (data.lastAt && (now - data.lastAt) < COOLDOWN_TIME) {
    const sisaDetik = Math.ceil((COOLDOWN_TIME - (now - data.lastAt)) / 1000);
    return { limited: true, reason: `Tunggu ${sisaDetik} detik sebelum mengirim lagi.` };
  }

  // Cek max pengiriman
  if (data.count >= RATE_LIMIT) {
    return { limited: true, reason: `Batas pengiriman tercapai. Coba lagi dalam beberapa menit.` };
  }

  return false;
}

function recordSubmit() {
  const data = getRateData();
  const now  = Date.now();
  setRateData({
    count:   data.count + 1,
    firstAt: data.firstAt || now,
    lastAt:  now,
  });
}

// --- Proteksi 2: Validasi input ---
function validateForm(nama, email, pesan) {
  const errors = [];

  // Nama: min 2 karakter, tidak boleh angka semua, tidak ada URL
  if (nama.trim().length < 2) {
    errors.push('Nama minimal 2 karakter.');
  }
  if (/https?:\/\//i.test(nama)) {
    errors.push('Nama tidak boleh mengandung URL.');
  }

  // Email: format valid
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    errors.push('Format email tidak valid.');
  }

  // Pesan: min 10 karakter, max 2000, tidak boleh semua huruf sama / spam pattern
  if (pesan.trim().length < 10) {
    errors.push('Pesan minimal 10 karakter.');
  }
  if (pesan.trim().length > 2000) {
    errors.push('Pesan maksimal 2000 karakter.');
  }
  // Deteksi spam: terlalu banyak URL di pesan
  const urlCount = (pesan.match(/https?:\/\//gi) || []).length;
  if (urlCount > 2) {
    errors.push('Pesan mengandung terlalu banyak link.');
  }
  // Deteksi karakter berulang (aaaaa, !!!!! dsb)
  if (/(.)\1{9,}/.test(pesan)) {
    errors.push('Pesan mengandung karakter berulang yang tidak wajar.');
  }

  return errors;
}

// --- Proteksi 3: Waktu pengisian (bot biasanya submit sangat cepat) ---
const formLoadTime = Date.now();

// --- Proteksi 4: Char counter untuk textarea ---
const pesanTextarea = document.getElementById('pesan');
const charCounter   = document.getElementById('charCounter');

if (pesanTextarea && charCounter) {
  pesanTextarea.addEventListener('input', () => {
    const len = pesanTextarea.value.length;
    charCounter.textContent = `${len}/2000`;
    charCounter.style.color = len > 1800
      ? 'var(--color-danger, #dc2626)'
      : 'var(--text-3)';
  });
}

// --- Helper: tampilkan status ---
function showStatus(type, message) {
  const icon = type === 'success'
    ? '<i class="fa-solid fa-circle-check"></i>'
    : '<i class="fa-solid fa-circle-xmark"></i>';
  formStatus.className     = `form-status ${type}`;
  formStatus.innerHTML     = `${icon} ${message}`;
  formStatus.style.display = 'flex';
}

// --- Submit handler ---
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nama  = document.getElementById('nama').value;
    const email = document.getElementById('email').value;
    const pesan = document.getElementById('pesan').value;

    // Cek honeypot — jika terisi berarti bot
    const honeypot = contactForm.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value !== '') return;

    // Cek waktu pengisian — jika kurang dari 3 detik kemungkinan bot
    if (Date.now() - formLoadTime < 3000) {
      showStatus('error', 'Pengisian terlalu cepat. Mohon isi form dengan benar.');
      return;
    }

    // Cek rate limit
    const rateCheck = isRateLimited();
    if (rateCheck && rateCheck.limited) {
      showStatus('error', rateCheck.reason);
      return;
    }

    // Validasi input
    const errors = validateForm(nama, email, pesan);
    if (errors.length > 0) {
      showStatus('error', errors[0]);
      return;
    }

    // Loading state
    submitBtn.classList.add('btn-loading');
    submitBtn.innerHTML   = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
    formStatus.style.display = 'none';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(contactForm.action, {
        method:  'POST',
        body:    formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        recordSubmit();
        showStatus('success', 'Pesan berhasil terkirim! Saya akan segera membalas.');
        contactForm.reset();
        if (charCounter) charCounter.textContent = '0/2000';
      } else {
        const data = await response.json();
        const msg  = data.errors?.map(err => err.message).join(', ') || 'Terjadi kesalahan. Coba lagi.';
        showStatus('error', msg);
      }
    } catch (err) {
      showStatus('error', 'Gagal mengirim. Periksa koneksi internet kamu.');
    } finally {
      submitBtn.classList.remove('btn-loading');
      submitBtn.innerHTML = 'Kirim Pesan <i class="fa-solid fa-paper-plane"></i>';
      setTimeout(() => { formStatus.style.display = 'none'; }, 6000);
    }
  });
}

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});