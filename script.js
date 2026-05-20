// ===== Prevent hash-scroll on page load =====
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname);
}
window.scrollTo(0, 0);

// ===== Announcement close =====
const announcementClose = document.getElementById('announcement-close');
if (announcementClose) {
  announcementClose.addEventListener('click', () => {
    document.getElementById('announcement').classList.add('hidden');
  });
}

// ===== Hamburger menu =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ===== Video tabs =====
document.querySelectorAll('.video-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.video-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const key = tab.dataset.vtab;
    document.querySelectorAll('.video-grid').forEach(g => g.classList.add('video-grid--hidden'));
    const target = document.getElementById('vtab-' + key);
    if (target) target.classList.remove('video-grid--hidden');
  });
});

// ===== Gallery tabs =====
document.querySelectorAll('.gallery-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const key = tab.dataset.tab;
    document.getElementById('gallery-performance').classList.add('gallery-grid--hidden');
    document.getElementById('gallery-practice').classList.add('gallery-grid--hidden');
    document.getElementById('gallery-' + key).classList.remove('gallery-grid--hidden');
  });
});

// ===== Request form (Formspree) =====
const form = document.getElementById('request-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.textContent = '送信中…';
  submitBtn.disabled = true;

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      form.reset();
      successMsg.classList.add('visible');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      submitBtn.textContent = '送信しました';
    } else {
      throw new Error();
    }
  } catch {
    alert('送信に失敗しました。お手数ですが、しばらくしてから再度お試しください。');
    submitBtn.textContent = '送信する';
    submitBtn.disabled = false;
  }
});

// ===== Fade-in on scroll =====
const fadeEls = document.querySelectorAll(
  '.news-card, .concert-row, .video-card, .gallery-item, .request-feature, .insta-photo'
);
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

fadeEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = `opacity 0.5s ease ${(i % 6) * 0.07}s, transform 0.5s ease ${(i % 6) * 0.07}s`;
  io.observe(el);
});
