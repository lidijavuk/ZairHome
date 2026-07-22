document.addEventListener('DOMContentLoaded', () => {

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  reveals.forEach(el => io.observe(el));

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  // Auto broj modela u hero-u (tepisi.html / posudje.html / dekoracija.html)
  // — broji trenutne kartice, tako da se ne mora ručno mijenjati "X" svaki
  // put kad se doda/skloni proizvod.
  const pageTotal = document.getElementById('page-total');
  if (pageTotal) {
    const count = document.querySelectorAll('#product-grid .product-card').length;
    pageTotal.textContent = count;
  }

  // Category filter — only present on katalog.html (the combined "sve kategorije" view).
  // Cards are queried fresh on every click, so this works even if the cards
  // were added dynamically (after katalog-loader.js fetches them in).
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.product-card[data-category]').forEach(card => {
          card.style.display = (filter === 'sve' || card.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }

  // Missing-photo fallback — applies to any product/category image slot,
  // including ones added later (e.g. by katalog-loader.js). Image "error"
  // events don't bubble, so this listens in the capture phase on document,
  // which catches them regardless of when/where the <img> was added.
  document.addEventListener('error', e => {
    const img = e.target;
    if (img.tagName !== 'IMG') return;
    const tile = img.closest('.product-img, .category-card-img');
    if (tile) tile.classList.add('img-missing');
  }, true);

  // Lightbox — only wires up if the page has a #lightbox element
  // (tepisi.html / posudje.html / dekoracija.html / katalog.html). Uses
  // event delegation so it also works for product photos added dynamically
  // after the page has already loaded.
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lbImg = document.getElementById('lb-img');
    const lbCounter = document.getElementById('lb-counter');
    let loaded = [];
    let current = 0;

    // Sve pojedinačne slike (svaka od dvije po tepihu), ne samo prva po
    // kartici — tako lightbox lista prolazi kroz obje slike svakog proizvoda.
    function loadedImages() {
      return [...document.querySelectorAll('.product-img:not(.img-missing) img')].filter(img => {
        const tile = img.closest('.product-img');
        return img.complete && img.naturalWidth > 0 && tile && tile.offsetParent !== null;
      });
    }

    function show(i) {
      if (!loaded.length) return;
      current = (i + loaded.length) % loaded.length;
      const img = loaded[current];
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCounter.textContent = `${current + 1} / ${loaded.length}`;
    }

    function openFromTile(tile, clickedImg) {
      loaded = loadedImages();
      // Otvori tačno onu sliku na koju je kliknuto (ako je vidljiva/hover
      // slika kliknuta, kreće se od nje); u suprotnom od prve slike kartice.
      const tileImgs = [...tile.querySelectorAll('img')];
      let idx = -1;
      if (clickedImg) idx = loaded.indexOf(clickedImg);
      if (idx === -1) {
        idx = loaded.findIndex(img => tileImgs.includes(img));
      }
      if (idx === -1) idx = 0;
      show(idx);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    document.addEventListener('click', e => {
      const tile = e.target.closest('.product-img');
      if (tile && !tile.classList.contains('img-missing')) {
        const clickedImg = e.target.tagName === 'IMG' ? e.target : null;
        openFromTile(tile, clickedImg);
      }
    });

    const btnClose = document.getElementById('lb-close');
    const btnPrev = document.getElementById('lb-prev');
    const btnNext = document.getElementById('lb-next');
    if (btnClose) btnClose.addEventListener('click', close);
    if (btnPrev) btnPrev.addEventListener('click', () => show(current - 1));
    if (btnNext) btnNext.addEventListener('click', () => show(current + 1));

    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'Escape') close();
    });
  }
});