// ===== Prevent scroll restoration on page load =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
const _targetHash = window.location.hash;
if (_targetHash) {
  history.replaceState(null, '', window.location.pathname);
}
window.scrollTo(0, 0);
window.addEventListener('load', () => {
  if (_targetHash) {
    setTimeout(() => {
      const target = document.querySelector(_targetHash);
      if (target) {
        const navH = document.getElementById('nav')?.offsetHeight || 72;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
      }
    }, 100);
  } else {
    window.scrollTo(0, 0);
  }
});

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

// ===== Request form (Formspree) =====
const form = document.getElementById('request-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('form-success');

if (form) form.addEventListener('submit', async (e) => {
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
    document.getElementById('form-error')?.classList.add('visible');
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

// ===== Setlist toggles =====
document.querySelectorAll('.setlist-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const setlist = btn.closest('.video-setlist');
    const isOpen = setlist.classList.toggle('open');
    btn.innerHTML = isOpen
      ? '曲目を閉じる <span class="setlist-icon">▼</span>'
      : '曲目を見る <span class="setlist-icon">▼</span>';
  });
});

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    // Toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ===== Instagram Feed =====
(async () => {
  const grid = document.getElementById('instaGrid');
  if (!grid) return;

  function escAttr(str) { return str.replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
  function escHtml(str) { return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function renderCard(post) {
    const imgSrc = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
    const caption = post.caption || '';
    const altText = escAttr(caption.substring(0, 60) || 'Instagram投稿');
    return `<a class="insta-card" href="${post.permalink}" target="_blank" rel="noopener">
      <div class="insta-card-img">
        <img src="${imgSrc}" alt="${altText}" loading="lazy">
      </div>
      <div class="insta-card-body">
        <p class="insta-card-caption">${escHtml(caption)}</p>
        <span class="insta-card-footer">Instagramで見る →</span>
      </div>
    </a>`;
  }

  try {
    const res = await fetch('/.netlify/functions/instagram-feed');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    const posts = (data.data || []).slice(0, 3);
    if (!posts.length) throw new Error('no posts');
    grid.innerHTML = posts.map(renderCard).join('');
  } catch {
    // フォールバック：静的カードを表示
    grid.innerHTML = [
      { permalink: 'https://www.instagram.com/ostri_ch2017', media_url: 'images/IMG_3465.webp', caption: '練習の様子' },
      { permalink: 'https://www.instagram.com/ostri_ch2017', media_url: 'images/IMG_6901.webp', caption: '集合写真' },
      { permalink: 'https://www.instagram.com/ostri_ch2017', media_url: 'images/DSC_3747.webp', caption: '楽器' },
    ].map(renderCard).join('');
  }
})();
