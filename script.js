/**
 * Swapnil Bari - Portfolio Interactive Engine
 * Handles animations, dynamic typewriter, CP stats, DSA code tabs, modal drawers, and theme controls.
 */

(function () {
  "use strict";

  var root = document.documentElement;

  // ---------- Theme Management ----------
  var themeBtn = document.getElementById("theme");
  try {
    var savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      root.setAttribute("data-theme", savedTheme);
    }
  } catch (e) {
    console.warn("Theme storage access unavailable:", e);
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var currentTheme = root.getAttribute("data-theme");
      var isDark = currentTheme === "dark" ||
        (!currentTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var nextTheme = isDark ? "light" : "dark";
      root.setAttribute("data-theme", nextTheme);
      try {
        localStorage.setItem("theme", nextTheme);
      } catch (e) {}
      showToast("Switched to " + nextTheme + " mode");
    });
  }

  // ---------- Mobile Navigation Menu ----------
  var menu = document.getElementById("menu");
  var menuBtn = document.getElementById("menuBtn");
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", isOpen);
    });

    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.closest("a")) {
        menu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", function (e) {
      if (!menu.contains(e.target) && !menuBtn.contains(e.target) && menu.classList.contains("open")) {
        menu.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---------- Active Section Navigation Spy ----------
  var navLinks = document.querySelectorAll("nav a[href^='#']");
  var sections = document.querySelectorAll("main section[id]");
  if ("IntersectionObserver" in window && sections.length > 0) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href");
            link.classList.toggle("active", href === "#" + id);
          });
        }
      });
    }, { rootMargin: "-35% 0px -45% 0px" });

    sections.forEach(function (sec) {
      navObserver.observe(sec);
    });
  }

  // ---------- Typewriter Animation in Hero ----------
  var typewriterEl = document.getElementById("typewriterText");
  if (typewriterEl) {
    var phrases = [
      "Software Developer & Problem Solver",
      "Student at R.C. Patel Institute of Technology, Shirpur",
      "Data Structures & Algorithms in C++",
      "Full-Stack E-Commerce Web Development"
    ];
    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingDelay = 65;
    var erasingDelay = 35;
    var newPhraseDelay = 1800;

    function typeLoop() {
      var currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
      }

      var currentDelay = isDeleting ? erasingDelay : typingDelay;

      if (!isDeleting && charIndex === currentPhrase.length) {
        currentDelay = newPhraseDelay;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        currentDelay = 400;
      }

      setTimeout(typeLoop, currentDelay);
    }

    typeLoop();
  }

  // ---------- Scroll Reveal Animations ----------
  var revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add("active");
    });
  }

  // ---------- Animated Numbers Counter ----------
  var counters = document.querySelectorAll(".counter");
  var countersTriggered = false;

  function runCounters() {
    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute("data-target"), 10);
      if (isNaN(target)) return;

      var current = 0;
      var duration = 1600;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        // Easing out cubic
        var easeOut = 1 - Math.pow(1 - progress, 3);
        current = Math.floor(easeOut * target);
        counter.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(step);
    });
  }

  if ("IntersectionObserver" in window && counters.length > 0) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !countersTriggered) {
          countersTriggered = true;
          runCounters();
        }
      });
    }, { threshold: 0.2 });

    var heroMetrics = document.querySelector(".metrics-grid");
    if (heroMetrics) counterObserver.observe(heroMetrics);
    var cpGrid = document.querySelector(".cp-cards-grid");
    if (cpGrid) counterObserver.observe(cpGrid);
  } else {
    runCounters();
  }

  // ---------- Project Category Filters ----------
  var filterBtns = document.querySelectorAll(".filters .filter-btn");
  var projectCards = document.querySelectorAll(".grid .card");

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) {
        var isSelected = b === btn;
        b.classList.toggle("active", isSelected);
        b.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });

      projectCards.forEach(function (card) {
        var category = card.getAttribute("data-cat");
        if (filter === "all" || category === filter) {
          card.removeAttribute("hidden");
          card.style.display = "flex";
        } else {
          card.setAttribute("hidden", "true");
          card.style.display = "none";
        }
      });
    });
  });



  // ---------- Interactive Project Details Modal ----------
  var modal = document.getElementById("projectModal");
  var modalContent = document.getElementById("modalContent");
  var modalCloseBtn = document.getElementById("modalCloseBtn");
  var detailButtons = document.querySelectorAll(".open-details-btn");

  var projectDetailsData = {
    ecommerce: {
      title: "E-Commerce Web Application",
      subtitle: "Full-Stack Web Architecture (Ready for your project stack & details)",
      overview: "Full-stack e-commerce web platform engineered with product browsing, category filtering, cart management, user authentication, and checkout workflow. Ready to update with your project's custom features and database design.",
      architecture: [
        "Storefront & Catalog: Product browsing with category filters and search.",
        "Shopping Cart & State: Cart management with item quantities and calculations.",
        "Authentication & Security: User login, registration, and session protection.",
        "Checkout Pipeline: Order placement and checkout workflow."
      ],
      stack: ["Full-Stack", "Web Development", "E-Commerce"]
    },
    dsa: {
      title: "Data Structures & Algorithms in C++",
      subtitle: "Implementations in C++ with Complexity Analysis (R.C. Patel Institute of Technology, Shirpur)",
      overview: "A repository of fundamental and advanced data structures and algorithms implemented in modern C++ by Swapnil Bari at R.C. Patel Institute of Technology, Shirpur (RCPIT), focusing on algorithmic optimization and clean OOP.",
      architecture: [
        "Data Structures: Arrays, Linked Lists, Stacks, Queues, Trees, Heaps, and Graphs.",
        "Algorithmic Paradigms: Divide & Conquer, Greedy, Dynamic Programming, and Graph Traversals.",
        "C++ Modern Standards: Standard Template Library (STL) containers, iterators, and memory efficiency.",
        "Complexity Analysis: Detailed Big-O time and space complexity evaluations."
      ],
      stack: ["C++", "Data Structures", "Algorithms", "STL"]
    },
    leetcode: {
      title: "Competitive Programming C++ Solutions Hub",
      subtitle: "Curated collection of 500+ LeetCode, Codeforces, & CodeChef problems",
      overview: "A structured archive organizing 500+ competitive programming problems by core algorithmic patterns, developed alongside coursework at R.C. Patel Institute of Technology, Shirpur. Each solution includes detailed problem statement analysis, intuition breakdown, time/space complexity proofs, and alternate approaches.",
      architecture: [
        "Pattern Classification: Problems categorized by Sliding Window, Two Pointers, Monotonic Stack, Binary Search on Answer, Dynamic Programming, and Graph Traversals.",
        "Contest History: Regular participation in weekly contests on LeetCode and Div. 2 rounds on Codeforces with a peak rating of 1850+.",
        "Optimal Complexity: Every accepted submission is written in GNU C++20 with strict focus on zero-overhead STL utilization and avoiding integer overflow.",
        "Templates: Ready-to-use C++ contest templates including fast I/O, modular arithmetic, matrix exponentiation, and prime sieves."
      ],
      stack: ["C++20", "LeetCode", "Codeforces", "CodeChef", "Problem Solving", "Mathematical Analysis"]
    },
    backend: {
      title: "E-Commerce REST API & Inventory Management Engine",
      subtitle: "High-concurrency backend services with transactional order handling",
      overview: "A scalable backend engine engineered to serve e-commerce applications. Handles heavy catalog querying, user session security, inventory lock reservations, and order fulfillment states.",
      architecture: [
        "API Architecture: RESTful design with pagination, field projection, and query parameter filtering on high-volume endpoints.",
        "Concurrency Control: Inventory deduction locks during checkout preventing negative stock edge cases.",
        "Authentication: Role-based authorization middleware (Customer vs Store Admin) with token expiration refresh flows.",
        "Testing: Documented Postman collections and automated endpoint testing."
      ],
      stack: ["Node.js", "Express.js", "MongoDB", "Mongoose", "Postman", "JWT", "Bcrypt"]
    }
  };

  function openModal(projectKey) {
    var data = projectDetailsData[projectKey];
    if (!data || !modal || !modalContent) return;

    var archHtml = data.architecture.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");

    var tagsHtml = data.stack.map(function (tag) {
      return "<span class='cat-pill'>" + tag + "</span>";
    }).join(" ");

    modalContent.innerHTML =
      "<h3>" + data.title + "</h3>" +
      "<div class='modal-subtitle'>" + data.subtitle + "</div>" +
      "<div class='modal-section'>" +
        "<h4>Project Overview</h4>" +
        "<p>" + data.overview + "</p>" +
      "</div>" +
      "<div class='modal-section'>" +
        "<h4>Architecture & Key Highlights</h4>" +
        "<ul class='modal-features-list'>" + archHtml + "</ul>" +
      "</div>" +
      "<div class='modal-section'>" +
        "<h4>Technologies & Tools</h4>" +
        "<div style='display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.5rem;'>" + tagsHtml + "</div>" +
      "</div>";

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  detailButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var projKey = btn.getAttribute("data-project");
      openModal(projKey);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("open")) {
      closeModal();
    }
  });

  // ---------- Toast Notification Utility ----------
  var toastEl = document.getElementById("toast");
  var toastTimeout = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2800);
  }

  // ---------- Copy Email Shortcut ----------
  var copyEmailBtn = document.getElementById("copyEmailBtn");
  var emailVal = document.getElementById("emailVal");
  if (copyEmailBtn && emailVal) {
    copyEmailBtn.addEventListener("click", function () {
      var email = emailVal.textContent.trim();
      navigator.clipboard.writeText(email).then(function () {
        showToast("Email address copied to clipboard!");
      }).catch(function () {
        showToast("Copied: " + email);
      });
    });
  }

  // ---------- Contact Form Submission ----------
  var form = document.getElementById("form");
  var status = document.getElementById("status");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var formData = new FormData(form);
      var name = (formData.get("name") || "").trim();
      var email = (formData.get("email") || "").trim();
      var subject = (formData.get("subject") || "Portfolio Inquiry from " + name).trim();
      var message = (formData.get("message") || "").trim();

      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
        if (status) {
          status.className = "status error";
          status.textContent = "Please provide your name, a valid email, and a message.";
        }
        return;
      }

      if (status) {
        status.className = "status success";
        status.textContent = "Thank you! Opening your email client to dispatch the message...";
      }

      showToast("Preparing message for Swapnil Bari...");

      var emailBody = "Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message;
      var mailtoUrl = "mailto:swapnilbari.dev@gmail.com?subject=" +
        encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(emailBody);

      setTimeout(function () {
        window.location.href = mailtoUrl;
      }, 500);
    });
  }



  // ---------- Interactive E-Commerce Sandbox Engine ----------
  (function initStoreSandbox() {
    var grid = document.getElementById("storeProductGrid");
    var cartBtn = document.getElementById("storeCartBtn");
    var cartCloseBtn = document.getElementById("storeCartCloseBtn");
    var cartDrawer = document.getElementById("storeCartDrawer");
    var cartItemsList = document.getElementById("storeCartItemsList");
    var cartCountEl = document.getElementById("storeCartCount");
    var cartTotalBadge = document.getElementById("storeCartTotalBadge");
    var subtotalEl = document.getElementById("cartSubtotal");
    var taxEl = document.getElementById("cartTax");
    var totalEl = document.getElementById("cartTotal");
    var couponInput = document.getElementById("couponInput");
    var applyCouponBtn = document.getElementById("applyCouponBtn");
    var checkoutBtn = document.getElementById("checkoutBtn");
    var searchInput = document.getElementById("storeSearchInput");
    var catButtons = document.querySelectorAll(".store-cat-btn");

    if (!grid) return;

    var catalog = [
      {
        id: "p1",
        title: "Nexus Mechanical Keyboard",
        cat: "hardware",
        price: 119.99,
        icon: "⌨️",
        badge: "Hardware",
        desc: "Hot-swappable tactile switches, per-key RGB backlighting, aircraft aluminum frame."
      },
      {
        id: "p2",
        title: "Modern C++ & STL Masterclass",
        cat: "software",
        price: 49.99,
        icon: "📘",
        badge: "Learning",
        desc: "Comprehensive handbook covering C++17/20, custom allocators, and STL efficiency."
      },
      {
        id: "p3",
        title: "AlgoCraft Visualizer License",
        cat: "software",
        price: 29.99,
        icon: "🧩",
        badge: "Software",
        desc: "Interactive algorithmic workbench containing 50+ real-time algorithm templates."
      },
      {
        id: "p4",
        title: "Developer Ergonomic Desk Mat",
        cat: "gear",
        price: 34.99,
        icon: "🖥️",
        badge: "Gear",
        desc: "Ultra-smooth waterproof micro-weave surface with anti-slip rubber base."
      }
    ];

    var cart = [];
    var discountPercent = 0;
    var currentCatFilter = "all";
    var currentSearchQuery = "";

    function renderCatalog() {
      grid.innerHTML = "";
      var filtered = catalog.filter(function (item) {
        var matchesCat = (currentCatFilter === "all" || item.cat === currentCatFilter);
        var matchesQuery = item.title.toLowerCase().indexOf(currentSearchQuery) !== -1 ||
          item.desc.toLowerCase().indexOf(currentSearchQuery) !== -1;
        return matchesCat && matchesQuery;
      });

      if (filtered.length === 0) {
        grid.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:var(--muted); padding:2rem 0;'>No matching products found in the catalog.</p>";
        return;
      }

      filtered.forEach(function (item) {
        var card = document.createElement("div");
        card.className = "store-item-card";
        card.innerHTML =
          "<div class='store-item-icon'>" + item.icon + "</div>" +
          "<span class='store-item-badge'>" + item.badge + "</span>" +
          "<h4 class='store-item-title'>" + item.title + "</h4>" +
          "<p class='store-item-desc'>" + item.desc + "</p>" +
          "<div class='store-item-foot'>" +
            "<span class='store-price'>$" + item.price.toFixed(2) + "</span>" +
            "<button type='button' class='btn-sm primary add-to-cart-btn' data-id='" + item.id + "'>Add to Cart</button>" +
          "</div>";
        grid.appendChild(card);
      });

      grid.querySelectorAll(".add-to-cart-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-id");
          addToCart(id);
        });
      });
    }

    function addToCart(id) {
      var product = catalog.find(function (p) { return p.id === id; });
      if (!product) return;

      var existing = cart.find(function (item) { return item.id === id; });
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
      }

      updateCartView();
      showToast("Added \"" + product.title + "\" to cart!");
    }

    function updateCartQty(id, delta) {
      var itemIndex = cart.findIndex(function (item) { return item.id === id; });
      if (itemIndex === -1) return;

      cart[itemIndex].qty += delta;
      if (cart[itemIndex].qty <= 0) {
        cart.splice(itemIndex, 1);
      }
      updateCartView();
    }

    function updateCartView() {
      var totalItems = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
      var subtotal = cart.reduce(function (sum, i) { return sum + (i.price * i.qty); }, 0);
      var discountedSubtotal = subtotal * (1 - (discountPercent / 100));
      var tax = discountedSubtotal * 0.08;
      var total = discountedSubtotal + tax;

      if (cartCountEl) cartCountEl.textContent = totalItems;
      if (cartTotalBadge) cartTotalBadge.textContent = "$" + total.toFixed(2);
      if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
      if (taxEl) taxEl.textContent = "$" + tax.toFixed(2);
      if (totalEl) totalEl.textContent = "$" + total.toFixed(2);

      if (!cartItemsList) return;

      if (cart.length === 0) {
        cartItemsList.innerHTML = "<p class='cart-empty-text'>Your cart is empty. Add products above to test the checkout workflow!</p>";
      } else {
        cartItemsList.innerHTML = "";
        cart.forEach(function (item) {
          var row = document.createElement("div");
          row.className = "cart-item-row";
          row.innerHTML =
            "<div class='cart-item-info'>" +
              "<strong>" + item.title + "</strong>" +
              "<span style='color:var(--muted); font-size:0.85rem;'>($" + item.price.toFixed(2) + ")</span>" +
            "</div>" +
            "<div class='cart-qty-ctrls'>" +
              "<button type='button' class='qty-btn dec-btn' data-id='" + item.id + "'>-</button>" +
              "<span>" + item.qty + "</span>" +
              "<button type='button' class='qty-btn inc-btn' data-id='" + item.id + "'>+</button>" +
            "</div>";
          cartItemsList.appendChild(row);
        });

        cartItemsList.querySelectorAll(".dec-btn").forEach(function (b) {
          b.addEventListener("click", function () { updateCartQty(b.getAttribute("data-id"), -1); });
        });
        cartItemsList.querySelectorAll(".inc-btn").forEach(function (b) {
          b.addEventListener("click", function () { updateCartQty(b.getAttribute("data-id"), 1); });
        });
      }
    }

    if (cartBtn && cartDrawer) {
      cartBtn.addEventListener("click", function () {
        cartDrawer.classList.toggle("open");
      });
    }

    if (cartCloseBtn && cartDrawer) {
      cartCloseBtn.addEventListener("click", function () {
        cartDrawer.classList.remove("open");
      });
    }

    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener("click", function () {
        var code = couponInput.value.trim().toUpperCase();
        if (code === "SWAPNIL10") {
          discountPercent = 10;
          showToast("Coupon Applied! 10% Discount applied to cart.");
          updateCartView();
        } else {
          showToast("Invalid code. Use coupon: SWAPNIL10");
        }
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function () {
        if (cart.length === 0) {
          showToast("Add items to your cart before proceeding to checkout!");
          return;
        }
        showToast("Order Placed Successfully! Simulated invoice #RCP-" + Math.floor(1000 + Math.random() * 9000) + " generated.");
        cart = [];
        discountPercent = 0;
        if (couponInput) couponInput.value = "";
        updateCartView();
        if (cartDrawer) cartDrawer.classList.remove("open");
      });
    }

    catButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        catButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        currentCatFilter = btn.getAttribute("data-storecat") || "all";
        renderCatalog();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        currentSearchQuery = searchInput.value.trim().toLowerCase();
        renderCatalog();
      });
    }

    renderCatalog();
    updateCartView();
  })();

  // ---------- Interactive Professional Resume Modal Logic ----------
  (function initResumeModal() {
    var resumeModal = document.getElementById("resumeModal");
    var navResumeBtn = document.getElementById("navResumeBtn");
    var heroResumeBtn = document.getElementById("heroResumeBtn");
    var closeBtn = document.getElementById("resumeModalCloseBtn");
    var printBtn = document.getElementById("printResumeBtn");

    function openResume() {
      if (!resumeModal) return;
      resumeModal.classList.add("open");
      resumeModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeResume() {
      if (!resumeModal) return;
      resumeModal.classList.remove("open");
      resumeModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (navResumeBtn) navResumeBtn.addEventListener("click", openResume);
    if (heroResumeBtn) heroResumeBtn.addEventListener("click", openResume);
    if (closeBtn) closeBtn.addEventListener("click", closeResume);

    if (resumeModal) {
      resumeModal.addEventListener("click", function (e) {
        if (e.target === resumeModal) closeResume();
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && resumeModal && resumeModal.classList.contains("open")) {
        closeResume();
      }
    });

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }
  })();

  // ---------- Dynamic Copyright Year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

})();
