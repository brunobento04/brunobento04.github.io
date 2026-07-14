/* Bruno Bento · portfolio interactions
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Current year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- Rotating role typing effect ---- */
  var roles = [
    "Tech Lead de ERP",
    "Fullstack Engineer",
    "SaaS Builder",
    "Cloud & Reliability",
    "AI/Automation"
  ];
  var typedEl = document.getElementById("typed");

  if (typedEl) {
    if (reduceMotion) {
      // Reduced motion: show the first role statically, no caret animation.
      typedEl.textContent = roles[0];
    } else {
      var roleIdx = 0;
      var charIdx = 0;
      var deleting = false;

      var TYPE_MS = 62;      // per character while typing
      var DELETE_MS = 34;    // per character while deleting
      var HOLD_MS = 1500;    // pause on a full word
      var GAP_MS = 420;      // pause on empty before next word

      function tick() {
        var word = roles[roleIdx];

        if (!deleting) {
          charIdx++;
          typedEl.textContent = word.slice(0, charIdx);
          if (charIdx === word.length) {
            deleting = true;
            return schedule(HOLD_MS);
          }
          return schedule(TYPE_MS);
        } else {
          charIdx--;
          typedEl.textContent = word.slice(0, charIdx);
          if (charIdx === 0) {
            deleting = false;
            roleIdx = (roleIdx + 1) % roles.length;
            return schedule(GAP_MS);
          }
          return schedule(DELETE_MS);
        }
      }

      function schedule(ms) { window.setTimeout(tick, ms); }
      schedule(600);
    }
  }

  /* ---- Scroll reveal via IntersectionObserver ---- */
  var revealEls = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    // Small stagger within shared parents for a calmer cascade.
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min((i % 6) * 55, 260) + "ms";
      io.observe(el);
    });
  }
})();
