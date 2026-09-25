/**
 * BRO CAFÉ - Interactive Menu & Experience Script
 * Good Drinks • Better Vibes
 * Stable, Smooth, and Robust Navigation Engine
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. WhatsApp Configuration
  const WHATSAPP_NUMBER = "201287066660"; // Bro Café WhatsApp business number
  const WHATSAPP_MESSAGE = "مرحباً BRO CAFÉ، أود الاستفسار والطلب من المنيو.";

  const whatsappFab = document.getElementById("whatsappFab");
  if (whatsappFab) {
    const cleanNumber = WHATSAPP_NUMBER.replace(/\D/g, "");
    if (cleanNumber.length >= 10) {
      whatsappFab.href = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
        WHATSAPP_MESSAGE
      )}`;
    } else {
      whatsappFab.addEventListener("click", (e) => {
        e.preventDefault();
        alert("يرجى تعيين رقم واتساب كافيه برو في ملف script.js");
      });
    }
  }

  // DOM Elements
  const menuControlPanel = document.getElementById("menuControlPanel");
  const categoriesNav = document.getElementById("categoriesNav");
  const catPills = Array.from(document.querySelectorAll(".cat-pill"));
  const allSections = Array.from(document.querySelectorAll(".menu-section"));
  const allItems = Array.from(document.querySelectorAll(".menu-item-row"));

  const menuSearchInput = document.getElementById("menuSearch");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const searchFeedback = document.getElementById("searchFeedback");
  const searchCountText = document.getElementById("searchCountText");
  const menuSearchEmpty = document.getElementById("menuSearchEmpty");
  const emptyFavorites = document.getElementById("emptyFavorites");
  const resetSearchBtn = document.getElementById("resetSearchBtn");
  const browseFromFavBtn = document.getElementById("browseFromFavBtn");

  const scrollTopBtn = document.getElementById("scrollTopBtn");
  const footerScrollTop = document.getElementById("footerScrollTop");

  const heroMenuBtn = document.getElementById("heroMenuBtn");
  const heroFeaturedBtn = document.getElementById("heroFeaturedBtn");
  const featuredExploreBtn = document.getElementById("featuredExploreBtn");

  // State
  let activeMode = "all"; // 'all' | 'favorites' | specific category id
  let isProgrammaticScrolling = false;
  let scrollLockTimer = null;
  let scrollSpyRaf = null;

  // 2. Safe Horizontal Scrolling for Category Pills (Never affects window scroll)
  function scrollCategoryPillIntoView(pill) {
    if (!categoriesNav || !pill) return;
    const pillLeft = pill.offsetLeft;
    const pillWidth = pill.offsetWidth;
    const navWidth = categoriesNav.offsetWidth;
    const targetScrollLeft = pillLeft - (navWidth / 2) + (pillWidth / 2);

    categoriesNav.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }

  // 3. Exact Vertical Section Navigation (Compensates for Sticky Header)
  function navigateToSection(targetId) {
    const section = document.getElementById(targetId);
    if (!section) return;

    const stickyTop = window.innerWidth <= 640 ? 6 : 8;
    const panelHeight = menuControlPanel ? menuControlPanel.offsetHeight : 110;
    const offsetPadding = 14;
    const rect = section.getBoundingClientRect();
    const targetTop = rect.top + window.pageYOffset - (panelHeight + stickyTop + offsetPadding);

    isProgrammaticScrolling = true;

    window.scrollTo({
      top: Math.max(0, Math.round(targetTop)),
      behavior: "smooth",
    });

    clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => {
      isProgrammaticScrolling = false;
      updateScrollSpy();
    }, 1200);
  }

  // Modern scrollend event handler for instant lock release upon animation finish
  window.addEventListener("scrollend", () => {
    if (isProgrammaticScrolling) {
      isProgrammaticScrolling = false;
      updateScrollSpy();
    }
  });

  // 4. Back To Top Logic
  const handleScrollTop = (e) => {
    if (e) e.preventDefault();
    isProgrammaticScrolling = true;

    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => {
      isProgrammaticScrolling = false;
      if (activeMode === "all") {
        const allPill = document.querySelector('.cat-pill[data-filter="all"]');
        if (allPill && !allPill.classList.contains("active")) {
          catPills.forEach((p) => p.classList.remove("active"));
          allPill.classList.add("active");
          scrollCategoryPillIntoView(allPill);
        }
      }
    }, 700);
  };

  if (scrollTopBtn) scrollTopBtn.addEventListener("click", handleScrollTop);
  if (footerScrollTop) footerScrollTop.addEventListener("click", handleScrollTop);

  // Toggle Scroll-to-Top Button Visibility
  const updateScrollTopVisibility = () => {
    if (!scrollTopBtn) return;
    if (window.scrollY > 280) {
      scrollTopBtn.classList.remove("is-hidden");
    } else {
      scrollTopBtn.classList.add("is-hidden");
    }
  };

  // 5. Hero & Feature Jump Buttons
  if (heroMenuBtn) {
    heroMenuBtn.addEventListener("click", () => {
      const firstSection = document.getElementById("specialty-coffee");
      if (firstSection) {
        navigateToSection("specialty-coffee");
      } else {
        const menuEl = document.getElementById("menu");
        if (menuEl) menuEl.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  if (heroFeaturedBtn) {
    heroFeaturedBtn.addEventListener("click", () => {
      const feat = document.getElementById("featured");
      if (feat) feat.scrollIntoView({ behavior: "smooth" });
    });
  }

  if (featuredExploreBtn) {
    featuredExploreBtn.addEventListener("click", () => {
      navigateToSection("mocktails");
    });
  }

  // 6. Favorites System (localStorage)
  const FAVORITES_KEY = "bro_cafe_favs";
  let favorites = new Set();

  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      favorites = new Set(JSON.parse(saved));
    }
  } catch (e) {
    console.warn("Could not load favorites:", e);
  }

  const favCountBadge = document.getElementById("favCount");
  const updateFavBadge = () => {
    if (favCountBadge) {
      favCountBadge.textContent = favorites.size;
    }
  };

  const saveFavorites = () => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch (e) {
      console.warn("Could not save favorites:", e);
    }
    updateFavBadge();
  };

  // Initialize heart buttons
  const allFavButtons = document.querySelectorAll(".fav-btn");
  allFavButtons.forEach((btn) => {
    const itemId = btn.dataset.item;
    if (favorites.has(itemId)) {
      btn.classList.add("is-active");
      const icon = btn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
      }
    }

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = favorites.has(itemId);
      const icon = btn.querySelector("i");

      if (isActive) {
        favorites.delete(itemId);
        btn.classList.remove("is-active");
        if (icon) {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
        }
      } else {
        favorites.add(itemId);
        btn.classList.add("is-active");
        if (icon) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
        }
      }

      saveFavorites();

      if (activeMode === "favorites") {
        showFavoritesView();
      }
    });
  });

  updateFavBadge();

  // 7. Menu Search & Live Filtering
  const updateClearButtonState = () => {
    if (!clearSearchBtn || !menuSearchInput) return;
    const hasText = menuSearchInput.value.trim().length > 0;
    if (hasText) {
      clearSearchBtn.classList.add("is-visible");
    } else {
      clearSearchBtn.classList.remove("is-visible");
    }
  };

  const resetAllFilters = () => {
    if (menuSearchInput) menuSearchInput.value = "";
    updateClearButtonState();

    if (searchFeedback) searchFeedback.hidden = true;
    if (menuSearchEmpty) menuSearchEmpty.hidden = true;
    if (emptyFavorites) emptyFavorites.hidden = true;

    allItems.forEach((item) => item.classList.remove("is-hidden-search"));
    allSections.forEach((sec) => sec.classList.remove("is-hidden-search"));

    activeMode = "all";
    catPills.forEach((p) => p.classList.remove("active"));
    const allPill = document.querySelector('.cat-pill[data-filter="all"]');
    if (allPill) {
      allPill.classList.add("active");
      scrollCategoryPillIntoView(allPill);
    }
  };

  if (resetSearchBtn) resetSearchBtn.addEventListener("click", resetAllFilters);
  if (browseFromFavBtn) browseFromFavBtn.addEventListener("click", resetAllFilters);

  const filterMenu = (query) => {
    const q = query.trim().toLowerCase();
    updateClearButtonState();

    if (emptyFavorites) emptyFavorites.hidden = true;

    if (!q) {
      if (searchFeedback) searchFeedback.hidden = true;
      if (menuSearchEmpty) menuSearchEmpty.hidden = true;

      if (activeMode === "favorites") {
        showFavoritesView();
        return;
      }

      allItems.forEach((el) => el.classList.remove("is-hidden-search"));
      allSections.forEach((s) => s.classList.remove("is-hidden-search"));
      return;
    }

    let matchCount = 0;

    allItems.forEach((item) => {
      const itemId = item.dataset.id;
      if (activeMode === "favorites" && !favorites.has(itemId)) {
        item.classList.add("is-hidden-search");
        return;
      }

      const text = item.textContent.toLowerCase();
      const isMatch = text.includes(q);

      item.classList.toggle("is-hidden-search", !isMatch);
      if (isMatch) matchCount++;
    });

    // Update section visibility
    allSections.forEach((section) => {
      const hasVisibleItem = [
        ...section.querySelectorAll(".menu-item-row"),
      ].some((item) => !item.classList.contains("is-hidden-search"));
      section.classList.toggle("is-hidden-search", !hasVisibleItem);
    });

    // If searching while scrolled past the menu results, bring top of menu into view
    const menuEl = document.getElementById("menu");
    if (menuEl && window.scrollY > menuEl.offsetTop + 180) {
      window.scrollTo({
        top: menuEl.offsetTop - 10,
        behavior: "smooth",
      });
    }

    // Feedback
    if (matchCount > 0) {
      if (menuSearchEmpty) menuSearchEmpty.hidden = true;
      if (searchFeedback && searchCountText) {
        searchFeedback.hidden = false;
        searchCountText.textContent = `تم العثور على ${matchCount} صنف مطابقة لبحثك`;
      }
    } else {
      if (menuSearchEmpty) menuSearchEmpty.hidden = false;
      if (searchFeedback) searchFeedback.hidden = true;
    }
  };

  if (menuSearchInput) {
    menuSearchInput.addEventListener("input", (e) => {
      filterMenu(e.target.value);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      menuSearchInput.value = "";
      filterMenu("");
      menuSearchInput.focus();
    });
  }

  // 8. Favorites View
  const showFavoritesView = () => {
    activeMode = "favorites";
    if (menuSearchInput) menuSearchInput.value = "";
    updateClearButtonState();

    if (searchFeedback) searchFeedback.hidden = true;
    if (menuSearchEmpty) menuSearchEmpty.hidden = true;

    if (favorites.size === 0) {
      allSections.forEach((sec) => sec.classList.add("is-hidden-search"));
      if (emptyFavorites) emptyFavorites.hidden = false;
      return;
    }

    if (emptyFavorites) emptyFavorites.hidden = true;

    allItems.forEach((item) => {
      const itemId = item.dataset.id;
      const isFav = favorites.has(itemId);
      item.classList.toggle("is-hidden-search", !isFav);
    });

    allSections.forEach((sec) => {
      const hasFav = [...sec.querySelectorAll(".menu-item-row")].some(
        (el) => !el.classList.contains("is-hidden-search")
      );
      sec.classList.toggle("is-hidden-search", !hasFav);
    });
  };

  // 9. Category Navigation Tabs Click Handler
  catPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const filter = pill.dataset.filter;
      const targetId = pill.dataset.target;

      catPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      scrollCategoryPillIntoView(pill);

      if (filter === "all") {
        resetAllFilters();
        const firstSection = document.getElementById("specialty-coffee");
        if (firstSection) {
          navigateToSection("specialty-coffee");
        }
      } else if (filter === "favorites") {
        showFavoritesView();
      } else if (targetId) {
        if (activeMode === "favorites" || (menuSearchInput && menuSearchInput.value.trim())) {
          resetAllFilters();
          pill.classList.add("active");
          const allPill = document.querySelector('.cat-pill[data-filter="all"]');
          if (allPill) allPill.classList.remove("active");
        }

        activeMode = targetId;
        navigateToSection(targetId);
      }
    });
  });

  // 10. Robust Scroll Spy Engine (Zero Jitter, Single Source of Truth)
  function updateScrollSpy() {
    updateScrollTopVisibility();

    if (isProgrammaticScrolling || activeMode === "favorites" || (menuSearchInput && menuSearchInput.value.trim())) {
      return;
    }

    const panelRect = menuControlPanel
      ? menuControlPanel.getBoundingClientRect()
      : { bottom: 120 };
    const activationPoint = panelRect.bottom + 60;

    let currentSectionId = null;

    // Scan backwards from bottom to find the current active section
    for (let i = allSections.length - 1; i >= 0; i--) {
      const sec = allSections[i];
      if (sec.classList.contains("is-hidden-search")) continue;
      const rect = sec.getBoundingClientRect();
      if (rect.top <= activationPoint) {
        currentSectionId = sec.id;
        break;
      }
    }

    // Check if before the first section
    if (!currentSectionId && allSections.length > 0) {
      const firstRect = allSections[0].getBoundingClientRect();
      if (firstRect.top > activationPoint) {
        const allPill = document.querySelector('.cat-pill[data-filter="all"]');
        if (allPill && !allPill.classList.contains("active")) {
          catPills.forEach((p) => p.classList.remove("active"));
          allPill.classList.add("active");
          scrollCategoryPillIntoView(allPill);
        }
        return;
      }
    }

    if (currentSectionId) {
      const matchingPill = document.querySelector(`.cat-pill[data-target="${currentSectionId}"]`);
      if (matchingPill && !matchingPill.classList.contains("active")) {
        catPills.forEach((p) => p.classList.remove("active"));
        matchingPill.classList.add("active");
        scrollCategoryPillIntoView(matchingPill);
      }
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollSpyRaf) cancelAnimationFrame(scrollSpyRaf);
      scrollSpyRaf = requestAnimationFrame(updateScrollSpy);
    },
    { passive: true }
  );

  // Initial check
  updateClearButtonState();
  updateScrollTopVisibility();
});
