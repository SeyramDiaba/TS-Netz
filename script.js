(() => {
  const panels = Array.from(document.querySelectorAll('.panel'));
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const dots = Array.from(document.querySelectorAll('.dot'));

  const TOTAL = panels.length;
  const LOCK_MS = 800;      // debounce lock so rapid scrolling can't skip sections
  const SWIPE_THRESHOLD = 50; // px, minimum swipe distance to trigger a section change

  let currentIndex = 0;
  let isScrolling = false;
  let touchStartY = null;

  function setActivePanel(index) {
    panels.forEach((panel, i) => {
      panel.classList.toggle('is-active', i === index);
    });

    const activeId = panels[index].id;

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === activeId);
    });

    dots.forEach(dot => {
      dot.classList.toggle('active', dot.dataset.section === activeId);
    });

    history.replaceState(null, '', `#${activeId}`);
  }

  function goToIndex(index) {
    const clamped = Math.max(0, Math.min(TOTAL - 1, index));
    if (clamped === currentIndex || isScrolling) return;

    isScrolling = true;
    currentIndex = clamped;
    setActivePanel(currentIndex);

    setTimeout(() => {
      isScrolling = false;
    }, LOCK_MS);
  }

  function goToSectionId(id) {
    const index = panels.findIndex(panel => panel.id === id);
    if (index !== -1) goToIndex(index);
  }

  // ---- Wheel (mouse) scrolljacking ----
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isScrolling) return;

    if (e.deltaY > 0) {
      goToIndex(currentIndex + 1);
    } else if (e.deltaY < 0) {
      goToIndex(currentIndex - 1);
    }
  }, { passive: false });

  // ---- Keyboard arrows / Page Up/Down / Space ----
  window.addEventListener('keydown', (e) => {
    const forwardKeys = ['ArrowDown', 'PageDown', ' '];
    const backwardKeys = ['ArrowUp', 'PageUp'];

    if (forwardKeys.includes(e.key)) {
      e.preventDefault();
      goToIndex(currentIndex + 1);
    } else if (backwardKeys.includes(e.key)) {
      e.preventDefault();
      goToIndex(currentIndex - 1);
    }
  }, { passive: false });

  // ---- Touch / swipe scrolljacking ----
  window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    e.preventDefault(); // block native touch scrolling
  }, { passive: false });

  window.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;

    if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
      if (deltaY > 0) {
        goToIndex(currentIndex + 1); // swipe up -> next section
      } else {
        goToIndex(currentIndex - 1); // swipe down -> previous section
      }
    }

    touchStartY = null;
  }, { passive: true });

  // ---- Header nav + dot nav click handling ----
  [...navLinks, ...dots].forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.section;
      goToSectionId(targetId);
    });
  });

  // ---- Init: honor a deep link hash on load, else start at first section ----
  function init() {
    const hash = window.location.hash.replace('#', '');
    const initialIndex = panels.findIndex(panel => panel.id === hash);
    currentIndex = initialIndex !== -1 ? initialIndex : 0;
    setActivePanel(currentIndex);
  }

  init();
})();
