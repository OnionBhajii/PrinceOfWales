document.addEventListener("DOMContentLoaded", () => {

  // ── Navbar Mobile Toggle ──
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks   = document.querySelector(".nav-links");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("nav-open");
      menuToggle.setAttribute("aria-expanded", isOpen);

      const spans = menuToggle.querySelectorAll("span");
      if (isOpen) {
        spans[0].style.transform = "translateY(7px) rotate(45deg)";
        spans[1].style.opacity   = "0";
        spans[2].style.transform = "translateY(-7px) rotate(-45deg)";
      } else {
        spans[0].style.transform = "";
        spans[1].style.opacity   = "";
        spans[2].style.transform = "";
      }
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove("nav-open");
        menuToggle.setAttribute("aria-expanded", false);
        menuToggle.querySelectorAll("span").forEach(s => {
          s.style.transform = "";
          s.style.opacity   = "";
        });
      }
    });
  }

 // ── Active nav link highlighting ──
  const currentPath = window.location.pathname;
  document.querySelectorAll(".nav-links a").forEach(link => {
    const href = link.getAttribute("href");
    
    // Check if the current path matches the link exactly
    if (href === currentPath || (currentPath === "/" && href === "/")) {
      link.classList.add("active");
    }
  });
  // ── Events page: Gig Guide Tabs ──
  const gigTabs = document.querySelectorAll('.gig-tab');
  if (gigTabs.length > 0) {
    gigTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.gig-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.gig-list').forEach(l => l.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`gig-${tab.dataset.month}`).classList.add('active');
      });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    document.querySelectorAll('.gig-list li').forEach(li => {
      const dateString = li.getAttribute('data-date');
      if (dateString) {
        const eventDate = new Date(dateString);
        if (eventDate < today) li.style.display = 'none'; 
      }
    });

    let firstVisibleTab = null;
    let activeTabStaysVisible = false;

    gigTabs.forEach(tab => {
      const list = document.getElementById(`gig-${tab.dataset.month}`);
      if (list) {
        const visibleEvents = Array.from(list.querySelectorAll('li')).filter(li => li.style.display !== 'none');
        if (visibleEvents.length === 0) {
          tab.style.display = 'none'; 
        } else {
          if (!firstVisibleTab) firstVisibleTab = tab; 
          if (tab.classList.contains('active')) activeTabStaysVisible = true;
        }
      }
    });

    if (!activeTabStaysVisible && firstVisibleTab) {
      firstVisibleTab.click();
    }
  }

  // ── Room gallery logic ──
  document.querySelectorAll(".room-gallery").forEach(gallery => {
    const track = gallery.querySelector(".room-gallery-track");
    const imgs  = track.querySelectorAll("img");
    const dots  = gallery.querySelectorAll(".gallery-dot");
    let current = 0;

    function goTo(index) {
      current = ((index % imgs.length) + imgs.length) % imgs.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
    }

    gallery.querySelector(".prev").addEventListener("click", () => goTo(current - 1));
    gallery.querySelector(".next").addEventListener("click", () => goTo(current + 1));
    dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

    let startX = null;
    track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend",   e => {
      if (startX === null) return;
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
      startX = null;
    });
  });

  // ── Accessible Gallery Lightbox ──
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  
  if(items.length > 0 && lightbox) {
    const lbImg    = document.getElementById('lightbox-img');
    const lbCap    = document.getElementById('lightbox-caption');
    const lbClose  = document.getElementById('lightbox-close');
    const lbPrev   = document.getElementById('lightbox-prev');
    const lbNext   = document.getElementById('lightbox-next');

    let current = 0;
    let previousActiveElement = null; // For accessibility focus trap
    const focusableElementsString = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const images = Array.from(items).map(item => ({
      src:     item.querySelector('img').src,
      caption: item.querySelector('.gallery-overlay span').textContent
    }));

    function openLightbox(index) {
      current = index;
      lbImg.src = images[current].src;
      lbCap.textContent = images[current].caption;
      
      previousActiveElement = document.activeElement; // Remember where we were
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Focus on the next button right away for screen readers
      lbNext.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      if(previousActiveElement) previousActiveElement.focus(); // Return focus to the original image clicked
    }

    function showNext() {
      current = (current + 1) % images.length;
      lbImg.src = images[current].src;
      lbCap.textContent = images[current].caption;
    }

    function showPrev() {
      current = (current - 1 + images.length) % images.length;
      lbImg.src = images[current].src;
      lbCap.textContent = images[current].caption;
    }

    items.forEach((item, i) => {
      item.setAttribute("tabindex", "0"); // Make images keyboard clickable
      item.addEventListener('click', () => openLightbox(i));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') openLightbox(i);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbNext.addEventListener('click', showNext);
    lbPrev.addEventListener('click', showPrev);

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation & Focus Trap
    lightbox.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();

      // Trap Focus inside lightbox
      let isTabPressed = e.key === 'Tab' || e.keyCode === 9;
      if (!isTabPressed) return;

      const focusableNodes = lightbox.querySelectorAll(focusableElementsString);
      const firstFocusable = focusableNodes[0];
      const lastFocusable = focusableNodes[focusableNodes.length - 1];

      if (e.shiftKey) { 
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    });
  }
});

// ── Navbar scroll effect (Outside DOMContentLoaded) ──
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".site-header");
  if (nav) {
    nav.classList.toggle("scrolled", window.scrollY > 10);
  }
}, { passive: true });

// ── Events page: Facebook Page Plugin fallback ──
setTimeout(function () {
  const plugin   = document.querySelector(".fb-page");
  const wrap     = document.querySelector(".fb-plugin-wrap");
  const fallback = document.getElementById("fb-fallback");

  if (!plugin || plugin.offsetHeight < 50) {
    if (wrap)     wrap.style.display     = "none";
    if (fallback) fallback.style.display = "block";
  }
}, 4000);