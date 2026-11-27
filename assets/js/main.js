/* Solace: shared behaviours */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Header state ---- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.setAttribute("aria-expanded", "false");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (other) {
        if (other !== item) {
          other.classList.remove("open");
          other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
          other.querySelector(".faq-a").style.maxHeight = "0px";
        }
      });
      item.classList.toggle("open", !isOpen);
      q.setAttribute("aria-expanded", String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : "0px";
    });
  });

  /* ---- Animated counters ---- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animate = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (prefersReduced) { el.textContent = target.toLocaleString("en-IN"); return; }
      var t0 = null, dur = 1600;
      var step = function (ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-IN");
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Form validation (client side) ---- */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.setAttribute("novalidate", "novalidate");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var valid = input.value.trim() !== "";
        if (valid && input.type === "email") {
          valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        }
        if (valid && input.type === "tel") {
          valid = /^[+0-9 ()-]{7,18}$/.test(input.value.trim());
        }
        if (field) field.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (!ok) return;
      form.dispatchEvent(new CustomEvent("solace:valid", { bubbles: true }));
    });
    form.querySelectorAll("[required]").forEach(function (input) {
      input.addEventListener("input", function () {
        var field = input.closest(".field");
        if (field) field.classList.remove("invalid");
      });
    });
  });

  /* ---- Footer year ---- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* ---------- Concierge chat widget ---------- */
(function () {
  var CONCIERGE_WA = "919650470279";

  var intents = [
    { keys: ["sri lanka", "ceylon", "galle", "mirissa", "weligama", "tangalle", "colombo", "ella", "yala", "kandy", "sigiriya", "bentota", "hikkaduwa", "unawatuna", "ahangama", "trincomalee", "tea"],
      reply: "Our <a href=\"/best-luxury-destinations-sri-lanka\">Sri Lanka guide</a> covers the fifteen destinations we compose most: Galle Fort and its ramparts, the Mirissa and Weligama coast, Tangalle's private coves, Yala's leopards and the tea country. The south coast is at its best December to April. Shall I bring a travel designer into this conversation on WhatsApp?",
      topic: "Sri Lanka journey" },
    { keys: ["maldives", "resort", "overwater", "villa", "soneva", "atoll"],
      reply: "For the islands, our designers trust twelve resorts above the rest, from Soneva Jani to The Nautilus. The <a href=\"/best-luxury-resorts-maldives\">Maldives resorts guide</a> compares them by atoll, style and signature experience. Go December to April, and book the villa five to seven nights.",
      topic: "Maldives resorts" },
    { keys: ["honeymoon", "couple", "anniversary", "romance", "proposal"],
      reply: "For two, the compositions we love most pair one quiet chapter with one celebratory one: a fort in Galle with a private cove in Tangalle, or tea country mornings with Mirissa evenings. The <a href=\"/best-luxury-vacation-destinations-for-couples\">couples destinations guide</a> walks through twelve of them. Tell us the month and the mood, and we will hold the villa and the table.",
      topic: "A journey for two" },
    { keys: ["party", "nightlife", "beach club", "club", "dance", "dj", "celebrat"],
      reply: "The sociable heart of the island is the south coast between Weligama and Mirissa: barefoot beach clubs, sunset bars and full-moon parties on the headland. Our members usually split the week, quiet nights in Ahangama or Tangalle, the celebration in Mirissa, thirty minutes apart. Our concierge can hold tables and plan the nights.",
      topic: "South coast celebration" },
    { keys: ["wellness", "retreat", "yoga", "ayurveda", "spa", "burnout", "relax", "heal"],
      reply: "For restoration, the south coast between Ahangama and Tangalle is the island's wellness quarter: surf, shala mornings and properly prescribed Ayurveda. Higher still, Ceylon Tea Trails in the hills is the most restorative stay we know. A designer can sequence a week of mornings that belong to you and evenings that are optional.",
      topic: "Wellness retreat" },
    { keys: ["cost", "price", "budget", "how much", "expensive", "rate", "fee", "charge"],
      reply: "Sri Lanka is one of the few places where genuinely top-tier stays remain approachable: composed journeys there typically begin around USD 600 to 900 per night for two, rising with private guides, seaplanes and festive dates. For a precise sketch, a travel designer needs the month, the party and the mood. Shall we continue on WhatsApp?",
      topic: "Cost of a journey" },
    { keys: ["membership", "join", "member", "club", "apply", "subscription"],
      reply: "Membership is by application and conversation rather than form. It opens the full atelier: a dedicated travel designer, first access to rare stays, and journeys composed from a blank page. The <a href=\"/membership\">membership page</a> describes the philosophy; the concierge can begin the conversation whenever you wish.",
      topic: "Membership" },
    { keys: ["best time", "when", "season", "weather", "monsoon", "month"],
      reply: "Sri Lanka's two monsoons never overlap, so the island works year-round. December to April belongs to the south and west coasts and the hills; May to September belongs to the east coast, Trincomalee and Pigeon Island. Tell us your month and we will choose the right shore.",
      topic: "Seasons" },
    { keys: ["visa", "passport", "eta", "indian"],
      reply: "Indian passport holders need a Sri Lanka ETA, arranged online before travel and usually processed within days. We confirm current requirements as part of composing every journey, so nothing is left to chance at the airport.",
      topic: "Visa guidance" },
    { keys: ["book", "plan", "enquir", "trip", "journey", "start", "lead"],
      reply: "The easiest way to begin is the <a href=\"/best-luxury-destinations-sri-lanka#plan\">journey form</a> on our Sri Lanka guide, or simply the <a href=\"/contact\">contact page</a>. Share the month and the mood; a travel designer replies within a day, usually sooner.",
      topic: "Planning a journey" },
    { keys: ["human", "person", "real", "agent", "concierge", "whatsapp", "call", "phone", "talk", "speak", "contact", "email", "mail"],
      reply: null, topic: "Concierge handoff" },
    { keys: ["hello", "hi", "hey", "namaste", "good morning", "good evening"],
      reply: "Hello, and welcome to Solace. Ask me about destinations, seasons, costs, membership, or the shape a journey could take. And whenever you would rather speak with a person, one tap brings the concierge in.",
      topic: "Greeting" },
    { keys: ["thank", "thanks", "great", "lovely", "perfect", "nice"],
      reply: "It is a pleasure. Whenever you are ready to begin, the concierge is one tap away, and the first conversation is the easiest one you will ever have about travel.",
      topic: "Pleasantry" },
    { keys: ["who are you", "what is solace", "about", "solace"],
      reply: "Solace is a private travel club, a club for the well-lived, composing bespoke journeys across travel, wellness, culture and access. Journeys composed, never packaged. The <a href=\"/about\">Society page</a> tells the story properly.",
      topic: "About Solace" }
  ];

  var fallbackReplies = [
    "That deserves a considered answer rather than a quick one. May I bring a travel designer into this conversation? One tap opens WhatsApp with everything we have discussed.",
    "I would rather give you a precise answer than a vague one. The concierge reads every conversation; shall I hand this over on WhatsApp?"
  ];

  var FAB_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H4l2-3.2A8 8 0 1 1 21 12z"/><circle cx="9" cy="12" r=".8" fill="currentColor"/><circle cx="13" cy="12" r=".8" fill="currentColor"/><circle cx="17" cy="12" r=".8" fill="currentColor"/></svg>';
  var SEND_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 12l18-8-6 8 6 8z"/></svg>';
  var MARK_SVG = '<svg viewBox="0 0 512 512" fill="none" stroke="currentColor" aria-hidden="true"><g transform="translate(256 268)"><g stroke="currentColor" stroke-width="10" opacity=".85"><line y1="-150" y2="-182"/><line y1="150" y2="182"/><line x1="-150" x2="-182"/><line x1="150" x2="182"/><line x1="106" y1="-106" x2="129" y2="-129"/><line x1="-106" y1="106" x2="-129" y2="129"/><line x1="106" y1="106" x2="129" y2="129"/><line x1="-106" y1="-106" x2="-129" y2="-129"/></g><circle r="122" stroke="currentColor" stroke-width="14"/></g></svg>';

  var fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.setAttribute("aria-label", "Chat with the Solace concierge");
  fab.setAttribute("aria-expanded", "false");
  fab.innerHTML = FAB_SVG + '<span class="chat-dot" aria-hidden="true"></span>';
  document.body.appendChild(fab);

  var panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Solace concierge chat");
  panel.innerHTML =
    '<div class="chat-head">' +
      '<span class="chat-head-mark">' + MARK_SVG + '</span>' +
      '<div class="chat-head-title"><strong>Solace Concierge</strong><span>A Club for the Well-Lived</span></div>' +
      '<button class="chat-close" type="button" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div class="chat-log" aria-live="polite"></div>' +
    '<div class="chat-chips"></div>' +
    '<form class="chat-input-row" novalidate>' +
      '<input class="chat-input" type="text" placeholder="Ask about destinations, seasons, costs…" aria-label="Your message" autocomplete="off">' +
      '<button class="chat-send" type="submit" aria-label="Send message">' + SEND_SVG + '</button>' +
    '</form>';
  document.body.appendChild(panel);

  var log = panel.querySelector(".chat-log");
  var chips = panel.querySelector(".chat-chips");
  var input = panel.querySelector(".chat-input");
  var transcript = [];

  function esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function addMsg(html, who) {
    var div = document.createElement("div");
    div.className = "chat-msg " + who;
    div.innerHTML = html;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    if (transcript.length < 12) transcript.push((who === "user" ? "Guest: " : "Concierge: ") + div.textContent.replace(/\s+/g, " ").slice(0, 220));
  }

  function waUrl(extra) {
    var text = "Hello Solace, I have a few questions from your website.";
    if (transcript.length) {
      text = "Hello Solace, following our website conversation:\n" + transcript.join("\n") + (extra ? "\n" + extra : "");
    }
    return "https://wa.me/" + CONCIERGE_WA + "?text=" + encodeURIComponent(text);
  }

  function renderChips() {
    chips.innerHTML = "";
    ["Sri Lanka trip", "Cost of a journey", "Wellness retreat", "Speak to the concierge"].forEach(function (label) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chat-chip";
      b.textContent = label;
      b.addEventListener("click", function () { answer(label); });
      chips.appendChild(b);
    });
  }

  function matchIntent(text) {
    var t = " " + text.toLowerCase() + " ";
    var seasonal = /(best time|season|monsoon|weather|when|month)/.test(t);
    var best = null, bestScore = 0;
    intents.forEach(function (it) {
      var score = 0;
      it.keys.forEach(function (k) { if (t.indexOf(k) !== -1) score += k.length; });
      if (seasonal && it.topic === "Seasons") score += 24;
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return best;
  }

  var fallbackIdx = 0;
  function answer(text) {
    addMsg(esc(text), "user");
    var it = matchIntent(text);
    if (it && it.reply === null) {
      addMsg('Of course. I am opening WhatsApp with our concierge team; everything we have discussed travels with you. <a href="' + waUrl() + '" target="_blank" rel="noopener">Continue on WhatsApp</a>.', "bot");
      window.open(waUrl(), "_blank", "noopener");
    } else if (it) {
      addMsg(it.reply, "bot");
    } else {
      addMsg(fallbackReplies[fallbackIdx++ % fallbackReplies.length] + ' <a href="' + waUrl() + '" target="_blank" rel="noopener">Continue on WhatsApp</a>.', "bot");
    }
  }

  fab.addEventListener("click", function () {
    var open = panel.classList.toggle("open");
    fab.setAttribute("aria-expanded", open ? "true" : "false");
    if (open && !log.children.length) {
      addMsg("Good day. I am the Solace concierge assistant, versed in our destinations, seasons and the shape of composed journeys. How may I help?", "bot");
      renderChips();
    }
    if (open) setTimeout(function () { input.focus(); }, 380);
  });
  panel.querySelector(".chat-close").addEventListener("click", function () {
    panel.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  });
  panel.querySelector(".chat-input-row").addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    answer(v);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) {
      panel.classList.remove("open");
      fab.setAttribute("aria-expanded", "false");
    }
  });
})();
