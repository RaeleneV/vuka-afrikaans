// ==========================================================================
// Vuka — shared site behaviour (static build)
// ==========================================================================

// ==========================================================================
// Translation helper (Afrikaans)
// Form option values stay in English because the code depends on them.
// Anything that is SHOWN to the visitor goes through af() so it appears in
// Afrikaans. Values that are not in the list are shown unchanged.
// ==========================================================================
var DISPLAY_AF = {
  "Yes": "Ja",
  "No": "Nee",
  "Not sure": "Nie seker nie",
  "Need to check": "Moet nagaan",
  "Not yet": "Nog nie",
  "Neither yet": "Nog nie een nie",
  "Plastic": "Plastiek",
  "Glass": "Glas",
  "Paper or cardboard": "Papier of karton",
  "Metal": "Metaal",
  "Mixed materials": "Gemengde materiale",
  "Use another name": "Gebruik 'n ander naam",
  "Seek advice": "Kry advies",
  "Consider trademark registration": "Oorweeg handelsmerkregistrasie",
  "Monitor the name": "Hou die naam dop",
  "Co-packing": "Kontrakverpakking (co-packing)",
  "Shared or cloud kitchen": "Gedeelde kombuis of wolkkombuis",
  "Subscription boxes": "Intekenboksies",
  "Pre-orders": "Voorafbestellings",
  "Exporting via AfCFTA": "Uitvoer deur AfCFTA-geleenthede",
  "Menu board": "Spyskaartbord",
  "QR code at stall": "QR-kode by die stalletjie",
  "Customer group": "Kliëntegroep",
  "Social media profile": "Sosialemedia-profiel",
  "Tell regulars": "Vertel gereelde kliënte",
  "Monday": "Maandag",
  "Tuesday": "Dinsdag",
  "Wednesday": "Woensdag",
  "Thursday": "Donderdag",
  "Friday": "Vrydag",
  "Saturday": "Saterdag",
  "Sunday": "Sondag"
};

function af(value) {
  return Object.prototype.hasOwnProperty.call(DISPLAY_AF, value) ? DISPLAY_AF[value] : value;
}

/* Mobile nav toggle — runs on every page */
(function initBurgerMenu() {
  const burgerBtn = document.getElementById("burgerBtn");
  const navRight = document.getElementById("navRight");
  if (!burgerBtn || !navRight) return;

  burgerBtn.addEventListener("click", () => {
    const isOpen = navRight.classList.toggle("open");
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
  });
})();

/* Module pages: highlight the active topic in the sidebar while scrolling */
(function initTopicScrollspy() {
  const topicLinks = document.querySelectorAll(".topic-nav a.topic-link");
  const topicSections = document.querySelectorAll(".topic-section");
  if (!topicLinks.length || !topicSections.length) return;

  const linkById = new Map();
  topicLinks.forEach((link) => {
    const id = link.getAttribute("href").replace("#", "");
    linkById.set(id, link);
  });

  function setActive(id) {
    topicLinks.forEach((link) => link.classList.remove("active"));
    const active = linkById.get(id);
    if (active) active.classList.add("active");
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );
    topicSections.forEach((section) => observer.observe(section));
  }

  const initialId = window.location.hash ? window.location.hash.replace("#", "") : topicSections[0].id;
  setActive(initialId);
})();

// ==========================================================================
// Journey 1 — Checklist (partial-progress message + automatic badge at 100%)
// ==========================================================================
(function () {
  var READY_THRESHOLD = 0.6;
  var READY_MESSAGE = "Goeie werk. Jy toon werklike tekens van groei!";

  var list = document.getElementById("checklistList");
  if (!list) return; // not on this page

  var inputs = list.querySelectorAll(".checklist-input");
  var countEl = document.getElementById("checklistCount");
  var percentEl = document.getElementById("checklistPercent");
  var fillEl = document.getElementById("checklistProgressFill");
  var barEl = document.getElementById("checklistProgressBar");
  var messageEl = document.getElementById("checklistMessage");
  var messageTextEl = document.getElementById("checklistMessageText");
  var badgeSection = document.getElementById("growthBadgeSection");

  if (!countEl || !percentEl || !fillEl || !barEl || !messageEl || !messageTextEl || !badgeSection) {
    console.warn(
      "Journey 1 checklist: missing one or more required elements.",
      { countEl: !!countEl, percentEl: !!percentEl, fillEl: !!fillEl, barEl: !!barEl,
        messageEl: !!messageEl, messageTextEl: !!messageTextEl, badgeSection: !!badgeSection }
    );
    return;
  }

  function updateChecklist() {
    var total = inputs.length;
    var checked = 0;

    inputs.forEach(function (input) {
      if (input.checked) checked++;
    });

    var percent = total === 0 ? 0 : Math.round((checked / total) * 100);

    countEl.textContent = checked + " van " + total + " voltooi";
    percentEl.textContent = percent + "%";
    fillEl.style.width = percent + "%";
    barEl.setAttribute("aria-valuenow", percent);

    var isPartiallyReady = total > 0 && checked / total >= READY_THRESHOLD;
    var isFullyComplete = total > 0 && checked === total;

    if (isPartiallyReady) {
      messageTextEl.textContent = READY_MESSAGE;
      messageEl.classList.add("is-visible");
    } else {
      messageEl.classList.remove("is-visible");
    }

    if (isFullyComplete) {
      localStorage.setItem("growthSignalBadge", "earned");
      showBadge();
    }
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  inputs.forEach(function (input) {
    input.addEventListener("change", updateChecklist);
  });

  if (localStorage.getItem("growthSignalBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  updateChecklist();
})();

// ==========================================================================
// Confetti burst — fires once when all Journey 1 checklist items are checked
// ==========================================================================
(function () {
  var list = document.getElementById("checklistList");
  if (!list) return;

  var inputs = list.querySelectorAll(".checklist-input");
  if (!inputs.length) return;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasCelebrated = false;

  function allChecked() {
    var checked = 0;
    inputs.forEach(function (input) {
      if (input.checked) checked++;
    });
    return checked === inputs.length;
  }

  function launchConfetti() {
    if (prefersReducedMotion) return;

    var canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    var colors = ["#319966", "#1fc652", "#b7d64a", "#1daec6", "#f09c3a"];
    var pieceCount = 140;
    var pieces = [];

    for (var i = 0; i < pieceCount; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * window.innerHeight * 0.5,
        w: 6 + Math.random() * 6,
        h: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: -8 + Math.random() * 16,
        speedY: 2 + Math.random() * 3,
        speedX: -1.5 + Math.random() * 3,
        opacity: 1,
      });
    }

    var startTime = null;
    var duration = 3200;

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      pieces.forEach(function (p) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        if (elapsed > duration * 0.6) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < duration) {
        requestAnimationFrame(frame);
      } else {
        canvas.remove();
      }
    }

    requestAnimationFrame(frame);
  }

  function checkForCelebration() {
    if (hasCelebrated) return;
    if (allChecked()) {
      hasCelebrated = true;
      launchConfetti();
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener("change", checkForCelebration);
  });
})();

// ==========================================================================
// Journey 1 — Reflection textbox (partial-progress message + automatic badge)
// ==========================================================================
(function () {
  var READY_MESSAGE = "Puik besinning! Jy is gereed om die volgende stap te neem.";

  var textarea = document.getElementById("growthReflectionInput");
  var messageEl = document.getElementById("reflectionMessage");
  var messageTextEl = document.getElementById("reflectionMessageText");
  var badgeSection = document.getElementById("riseBadgeSection");

  if (!textarea || !messageEl || !messageTextEl || !badgeSection) {
    if (textarea) {
      console.warn(
        "Journey 1 reflection: missing one or more required elements.",
        { messageEl: !!messageEl, messageTextEl: !!messageTextEl, badgeSection: !!badgeSection }
      );
    }
    return;
  }

  function updateReflection() {
    var hasContent = textarea.value.trim().length > 0;

    if (hasContent) {
      messageTextEl.textContent = READY_MESSAGE;
      messageEl.classList.add("is-visible");
      localStorage.setItem("readyToRiseBadge", "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  textarea.addEventListener("input", updateReflection);

  if (localStorage.getItem("readyToRiseBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  updateReflection();
})();

// ==========================================================================
// Journey 2 — Profit calculator + badge
// ==========================================================================
(function () {
  var form = document.getElementById("profit-calculator");
  var moneyInInput = document.getElementById("money-in");
  var moneyOutInput = document.getElementById("money-out");
  var calcBtn = document.getElementById("calc-profit");
  var profitResult = document.getElementById("profit-result");
  var badgeSection = document.getElementById("badge-section");
  var numbersBadge = document.getElementById("numbers-badge");

  if (!calcBtn || !moneyInInput || !moneyOutInput || !profitResult || !badgeSection || !numbersBadge) {
    return; // not on this page
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    numbersBadge.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (localStorage.getItem("numbersKnowHowBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  calcBtn.addEventListener("click", function () {
    var moneyIn = parseFloat(moneyInInput.value) || 0;
    var moneyOut = parseFloat(moneyOutInput.value) || 0;
    var profit = moneyIn - moneyOut;

    var message;
    if (profit > 0) {
      message = "Jou wins hierdie week is <strong>" + profit.toLocaleString("af-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</strong>. Goed gedaan!";
    } else if (profit === 0) {
      message = "Jy het hierdie week gelykop gebreek: <strong>0,00</strong> wins.";
    } else {
      message = "Jy het hierdie week 'n verlies van <strong>" + Math.abs(profit).toLocaleString("af-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</strong> gely.";
    }

    profitResult.innerHTML = message;
    profitResult.classList.remove("hidden");
    profitResult.classList.remove("result-error");

    localStorage.setItem("numbersKnowHowBadge", "earned");
    showBadge();
  });
})();

// ==========================================================================
// Journey 2 — "Separate & Secure": three money containers
// ==========================================================================
(function () {
  var btn = document.getElementById("save-separate-plan");
  if (!btn) return;

  var businessInput = document.getElementById("business-place");
  var personalInput = document.getElementById("personal-place");
  var emergencyInput = document.getElementById("emergency-place");
  var resultEl = document.getElementById("separate-result");
  var badgeEl = document.getElementById("badge-separate");

  var form = document.getElementById("separate-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var business = businessInput.value.trim();
    var personal = personalInput.value.trim();
    var emergency = emergencyInput.value.trim();

    if (!business && !personal && !emergency) {
      resultEl.textContent = "Vul ten minste een plek in om jou plan te stoor.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (business) parts.push("Besigheid: " + business);
    if (personal) parts.push("Persoonlik: " + personal);
    if (emergency) parts.push("Noodgeval: " + emergency);

    resultEl.innerHTML = "Jou plan — " + parts.join(" · ");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 2 — "Cost Cutter": biggest expense + reduction idea
// ==========================================================================
(function () {
  var btn = document.getElementById("save-leaks-plan");
  if (!btn) return;

  var expenseInput = document.getElementById("big-expense");
  var amountInput = document.getElementById("expense-amount");
  var ideaInput = document.getElementById("cut-idea");
  var resultEl = document.getElementById("leaks-result");
  var badgeEl = document.getElementById("badge-leaks");

  var form = document.getElementById("leaks-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var expense = expenseInput.value.trim();
    var amount = parseFloat(amountInput.value) || 0;
    var idea = ideaInput.value.trim();

    if (!expense || !idea) {
      resultEl.textContent = "Voeg jou grootste uitgawe en een idee om dit te verminder by.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML =
      "Grootste uitgawe: <strong>" + expense + "</strong>" +
      (amount ? " (~R" + amount.toLocaleString("af-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "/week)" : "") +
      "<br>Jou plan: " + idea;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 2 — "Proof Keeper": first two transactions
// ==========================================================================
(function () {
  var btn = document.getElementById("save-proof-entries");
  if (!btn) return;

  var descInputs = document.querySelectorAll(".tx-desc");
  var amountInputs = document.querySelectorAll(".tx-amount");
  var typeSelects = document.querySelectorAll(".tx-type");
  var resultEl = document.getElementById("proof-result");
  var badgeEl = document.getElementById("badge-proof");

  var form = document.getElementById("proof-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var rows = [];
    var hasEntry = false;

    for (var i = 0; i < descInputs.length; i++) {
      var desc = descInputs[i].value.trim();
      var amount = parseFloat(amountInputs[i].value) || 0;
      var type = typeSelects[i].value;

      if (desc) {
        hasEntry = true;
        rows.push(
          (type === "in" ? "Geld In" : "Geld Uit") +
          ": " + desc +
          (amount ? " — R" + amount.toLocaleString("af-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")
        );
      }
    }

    if (!hasEntry) {
      resultEl.textContent = "Voeg ten minste een transaksiebeskrywing by.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML = rows.join("<br>");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 2 — "Banked & Building": bank choice + requirements + plan
// ==========================================================================
(function () {
  var bankSelect = document.getElementById("bank-choice");
  if (!bankSelect) return;

  var stepsEl = document.getElementById("bank-steps");
  var requirementsEl = document.getElementById("bank-requirements");
  var saveBtn = document.getElementById("save-bank-plan");
  var resultEl = document.getElementById("bank-result");
  var badgeEl = document.getElementById("badge-bank");
  var taskChecks = document.querySelectorAll(".bank-task");

  var form = document.getElementById("bank-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var requirements = {
    capitec: [
      "'n Bestaande Capitec GlobalOne-persoonlike rekening",
      "Jou Suid-Afrikaanse ID",
      "Geen minimum deposito om oop te maak nie",
    ],
    tyme: [
      "'n Bestaande TymeBank \"Good Friends\"-persoonlike rekening",
      "Stel op in die app: My Profile > My Details > Business Benefits",
      "Gratis om oop te maak",
    ],
  };

  bankSelect.addEventListener("change", function () {
    var choice = bankSelect.value;
    if (!choice) {
      stepsEl.classList.add("hidden");
      return;
    }

    requirementsEl.innerHTML = "";
    requirements[choice].forEach(function (req) {
      var li = document.createElement("li");
      li.textContent = req;
      requirementsEl.appendChild(li);
    });

    stepsEl.classList.remove("hidden");
  });

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      var chosenTasks = [];
      taskChecks.forEach(function (check) {
        if (check.checked) chosenTasks.push(check.parentElement.textContent.trim());
      });

      if (!bankSelect.value) {
        resultEl.textContent = "Kies eers 'n bank.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      if (!chosenTasks.length) {
        resultEl.textContent = "Merk ten minste een ding wat jy hierdie week sal doen.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      resultEl.innerHTML = "Hierdie week: " + chosenTasks.join(", ");
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      badgeEl.classList.remove("hidden");
      badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
})();

// ==========================================================================
// Journey 03 — "Officially Official": CIPC document checklist
// ==========================================================================

(function () {
  var btn = document.getElementById("save-cipc-checklist");
  if (!btn) return;

  var notesInput = document.getElementById("cipc-checklist-notes");
  var resultEl = document.getElementById("cipc-checklist-result");
  var badgeEl = document.getElementById("badge-cipc-checklist");

  var form = document.getElementById("cipc-checklist-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var notes = notesInput.value.trim();

    if (!notes) {
      resultEl.textContent = "Voeg ten minste een dokument of permit by wat jy sal nodig hê.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML = "Jou lys: " + notes;
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Food Safe": municipal health office details
// ==========================================================================

(function () {
  var btn = document.getElementById("save-health-permit");
  if (!btn) return;

  var addressInput = document.getElementById("health-office-address");
  var phoneInput = document.getElementById("health-office-phone");
  var resultEl = document.getElementById("health-permit-result");
  var badgeEl = document.getElementById("badge-health-permit");

  var form = document.getElementById("health-permit-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var address = addressInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!address && !phone) {
      resultEl.textContent = "Voeg die kantoor se adres of kontaknommer by.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (address) parts.push("Adres: " + address);
    if (phone) parts.push("Foon: " + phone);

    resultEl.innerHTML = parts.join(" · ");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Paper Trail Pro": permits audit
// ==========================================================================

(function () {
  var btn = document.getElementById("save-permits-audit");
  if (!btn) return;

  var haveInput = document.getElementById("permits-have");
  var missingInput = document.getElementById("permits-missing");
  var resultEl = document.getElementById("permits-audit-result");
  var badgeEl = document.getElementById("badge-permits-audit");

  var form = document.getElementById("permits-audit-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  btn.addEventListener("click", function () {
    var have = haveInput.value.trim();
    var missing = missingInput.value.trim();

    if (!have && !missing) {
      resultEl.textContent = "Lys ten minste een permit wat jy het of kortkom.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (have) parts.push("Het: " + have);
    if (missing) parts.push("Ontbreek: " + missing);

    resultEl.innerHTML = parts.join("<br>");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Tax Tracker": 12-month sales picture calculator
// ==========================================================================
(function () {
  var form = document.getElementById("sales-picture-form");
  if (!form) return; // not on this page

  var VAT_THRESHOLD = 2300000; // R2.3 million, effective 1 April 2026 (SARS)

  var monthInputs = document.querySelectorAll(".month-input");
  var notTradingChecks = document.querySelectorAll(".not-trading-check");
  var actualBtn = document.getElementById("records-actual-btn");
  var estimateBtn = document.getElementById("records-estimate-btn");
  var totalAmountEl = document.getElementById("sales-total-amount");
  var averageAmountEl = document.getElementById("sales-average-amount");
  var progressPercentEl = document.getElementById("vat-progress-percent");
  var progressBarEl = document.getElementById("vat-progress-bar");
  var progressFillEl = document.getElementById("vat-progress-fill");
  var calcBtn = document.getElementById("calc-sales-picture");
  var resultEl = document.getElementById("sales-picture-result");
  var badgeEl = document.getElementById("badge-sales-picture");

  var recordsType = "actual";

  form.addEventListener("submit", function (e) { e.preventDefault(); });

  function setRecordsType(type) {
    recordsType = type;
    var isActual = type === "actual";
    actualBtn.classList.toggle("active", isActual);
    actualBtn.setAttribute("aria-pressed", String(isActual));
    estimateBtn.classList.toggle("active", !isActual);
    estimateBtn.setAttribute("aria-pressed", String(!isActual));
  }

  if (actualBtn) actualBtn.addEventListener("click", function () { setRecordsType("actual"); });
  if (estimateBtn) estimateBtn.addEventListener("click", function () { setRecordsType("estimate"); });

  notTradingChecks.forEach(function (check) {
    check.addEventListener("change", function () {
      var month = check.getAttribute("data-month");
      var input = document.getElementById("month-" + month);
      var row = check.closest(".month-row");
      if (!input) return;

      input.disabled = check.checked;
      if (check.checked) input.value = "";
      if (row) row.classList.toggle("is-not-trading", check.checked);
    });
  });

  calcBtn.addEventListener("click", function () {
    var total = 0;
    var monthsTrading = 0;
    var anyEntry = false;

    monthInputs.forEach(function (input) {
      var month = input.getAttribute("data-month");
      var notTrading = document.querySelector('.not-trading-check[data-month="' + month + '"]');
      if (notTrading && notTrading.checked) return;

      var value = parseFloat(input.value);
      if (!isNaN(value) && input.value.trim() !== "") {
        total += value;
        monthsTrading++;
        anyEntry = true;
      }
    });

    if (!anyEntry) {
      resultEl.textContent = 'Voer ten minste een maand se verkope in, of merk maande as "nog nie handel gedryf nie."';
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var average = monthsTrading > 0 ? total / monthsTrading : 0;
    var percent = Math.min(100, Math.round((total / VAT_THRESHOLD) * 100));

    totalAmountEl.textContent = "R " + total.toLocaleString("af-ZA", { maximumFractionDigits: 2 });
    averageAmountEl.textContent = "R " + average.toLocaleString("af-ZA", { maximumFractionDigits: 2 });
    progressPercentEl.textContent = percent + "%";
    progressBarEl.setAttribute("aria-valuenow", percent);
    progressFillEl.style.width = percent + "%";

    progressFillEl.classList.remove("near-limit", "over-limit");
    resultEl.classList.remove("result-warning", "result-alert", "result-error");

    var statusLine;
    if (total >= VAT_THRESHOLD) {
      progressFillEl.classList.add("over-limit");
      resultEl.classList.add("result-alert");
      statusLine = "Jou verkope is by of bo die BTW-drempel. Bevestig jou posisie dadelik by SARS.";
    } else if (percent >= 80) {
      progressFillEl.classList.add("near-limit");
      resultEl.classList.add("result-warning");
      statusLine = "Jy kom naby — ongeveer R" + (VAT_THRESHOLD - total).toLocaleString("af-ZA", { maximumFractionDigits: 0 }) + " onder die BTW-drempel van R2,3 miljoen.";
    } else {
      statusLine = "Jy is R" + (VAT_THRESHOLD - total).toLocaleString("af-ZA", { maximumFractionDigits: 0 }) + " onder die verpligte BTW-drempel van R2 300 000.";
    }

    var recordLabel = recordsType === "estimate" ? "Dit is slegs 'n skatting." : "Dit is werklike rekords.";

    resultEl.innerHTML =
      "Aangeteken oor " + monthsTrading + " maand" + (monthsTrading === 1 ? "" : "e") + ": <strong>R" + total.toLocaleString("af-ZA", { maximumFractionDigits: 2 }) + "</strong><br>" +
      statusLine + "<br>" +
      '<span class="small">' + recordLabel + "</span>";
    resultEl.classList.remove("hidden");

    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Tax Smart": choose one tax action + date + reminder
// ==========================================================================
(function () {
  var btn = document.getElementById("save-tax-next-step");
  if (!btn) return;

  var choiceSelect = document.getElementById("tax-action-select");
  var dateInput = document.getElementById("tax-action-date");
  var ackCheckbox = document.getElementById("tax-guidance-ack");
  var resultEl = document.getElementById("tax-next-step-result");
  var badgeEl = document.getElementById("badge-tax-next-step");

  var form = document.getElementById("tax-next-step-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var actionLabels = {
    records: "Begin om maandelikse verkoopsrekords te hou",
    "turnover-tax": "Kontroleer of ek vir Omsetbelasting kwalifiseer",
    efiling: "Meld aan by of skep my SARS eFiling-profiel",
    branch: "Bespreek 'n SARS-afspraak of besoek 'n tak",
    practitioner: "Praat met 'n geregistreerde belastingpraktisyn",
  };

  var reminderLabels = {
    none: "Geen herinnering gestel nie",
    "3days": "Herinnering gestel vir oor 3 dae",
    "1week": "Herinnering gestel vir volgende week",
  };

  btn.addEventListener("click", function () {
    var missing = [];
    if (!choiceSelect.value) missing.push("kies 'n aksie");
    if (!dateInput.value) missing.push("kies 'n teikendatum");
    if (!ackCheckbox.checked) missing.push("bevestig dat jy verstaan dat dit leiding is en nie 'n SARS-besluit nie");

    if (missing.length) {
      resultEl.innerHTML = "Voltooi asseblief die volgende: " + missing.join(", ") + ".";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var reminderChecked = document.querySelector('input[name="tax-reminder"]:checked');
    var reminderValue = reminderChecked ? reminderChecked.value : "none";

    var formattedDate = new Date(dateInput.value + "T00:00:00").toLocaleDateString("af-ZA", {
      year: "numeric", month: "long", day: "numeric",
    });

    resultEl.innerHTML =
      "Jou plan: <strong>" + actionLabels[choiceSelect.value] + "</strong> teen <strong>" + formattedDate + "</strong>.<br>" +
      reminderLabels[reminderValue];
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");

    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Journey 03 — "Compliance Mapped": personalised compliance map
// ==========================================================================
(function () {
  var btn = document.getElementById("build-compliance-map");
  if (!btn) return;

  var whereSelect = document.getElementById("compliance-where");
  var whatSelect = document.getElementById("compliance-what");
  var setupSelect = document.getElementById("compliance-setup");
  var resultEl = document.getElementById("compliance-map-result");
  var badgeEl = document.getElementById("badge-compliance-map");

  var form = document.getElementById("compliance-map-form");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  // These fragments finish the sentence "Omdat jy ... en ..., is dit wat jy
  // eerste moet ondersoek:" so each one ends in a verb (Afrikaans word order).
  var whereText = {
    home: "vanaf die huis of 'n erf handel",
    stall: "vanaf 'n stalletjie, tafel, sypaadjie of openbare ruimte handel",
    shop: "vanaf 'n winkel of houer handel",
    online: "aanlyn of per aflewering verkoop",
  };

  var whatText = {
    packaged: "verpakte goedere verkoop",
    food: "vars of voorbereide kos verkoop",
    services: "dienste lewer",
    other: "iets anders verkoop",
  };

  var setupText = {
    sole: "Jy handel tans as 'n eenmansaak.",
    partnership: "Jy handel tans as 'n vennootskap.",
    company: "Jy het reeds 'n geregistreerde maatskappy.",
    unsure: "Jy is nog nie seker van jou besigheidstruktuur nie — dit is die moeite werd om vroeg te besleg, aangesien dit belasting en aanspreeklikheid raak.",
  };

  function buildRecommendations(where, what) {
    var recs = [];

    if (where === "stall") recs.push("gaan jou plaaslike munisipaliteit se vereistes vir 'n informele-handelspermit na");
    else if (where === "home") recs.push("gaan na of jou eiendom vir besigheidsgebruik gesoneer is");
    else if (where === "shop") recs.push("gaan jou munisipale besigheidslisensievereistes vir 'n vaste perseel na");
    else if (where === "online") recs.push("gaan die reëls van die Wet op Verbruikersbeskerming vir aanlyn- en afstandverkope na");

    if (what === "food") recs.push("ondersoek jou plaaslike Omgewingsgesondheidsdepartement se Sertifikaat van Aanvaarbaarheid (voedselveiligheidspermit)");
    else if (what === "packaged") recs.push("gaan na of jou etikettering voldoen aan die reëls van die Wet op Voedingsmiddels, Skoonheidsmiddels en Ontsmettingsmiddels, indien van toepassing");
    else if (what === "services") recs.push("gaan na of jou tipe diens sy eie professionele registrasie of lisensie benodig");

    recs.push("registreer jou besigheid by CIPC as jy dit nog nie gedoen het nie, aangesien dit alles anders onderlê");

    return recs;
  }

  btn.addEventListener("click", function () {
    if (!whereSelect.value || !whatSelect.value || !setupSelect.value) {
      resultEl.innerHTML = "Beantwoord asseblief al drie vrae.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var where = whereSelect.value;
    var what = whatSelect.value;
    var setup = setupSelect.value;

    var recs = buildRecommendations(where, what);
    var recList = recs.map(function (r) { return "<li>" + r.charAt(0).toUpperCase() + r.slice(1) + "</li>"; }).join("");

    resultEl.innerHTML =
      '<p class="compliance-map-summary">Omdat jy ' + whereText[where] + " en " + whatText[what] + ", is dit wat jy eerste moet ondersoek:</p>" +
      '<ul class="compliance-map-list">' + recList + "</ul>" +
      '<span class="small">' + setupText[setup] + "</span>";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");

    badgeEl.classList.remove("hidden");
    badgeEl.scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();

// ==========================================================================
// Shared helper — reflection textarea with partial message + automatic badge
// Used by Journey 07, 08, 09, 10 (and any future reflection challenges)
// ==========================================================================
function initReflection(config) {
  var textarea = document.getElementById(config.inputId);
  var messageEl = document.getElementById(config.messageId);
  var messageTextEl = document.getElementById(config.messageTextId);
  var badgeSection = document.getElementById(config.badgeSectionId);

  if (!textarea || !messageEl || !messageTextEl || !badgeSection) return; // not on this page

  function update() {
    var hasContent = textarea.value.trim().length > 0;

    if (hasContent) {
      messageTextEl.textContent = config.readyMessage;
      messageEl.classList.add("is-visible");
      localStorage.setItem(config.storageKey, "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  textarea.addEventListener("input", update);

  if (localStorage.getItem(config.storageKey) === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  update();
}

// ==========================================================================
// Journey 07 — Reflection challenges (Brand Aware, Strategy Starter,
// Found My Voice)
// ==========================================================================
initReflection({
  inputId: "brandAwareInput",
  messageId: "brandAwareMessage",
  messageTextId: "brandAwareMessageText",
  badgeSectionId: "brandAwareBadgeSection",
  readyMessage: "Mooi — dit is 'n duidelike prentjie van jou handelsmerk.",
  storageKey: "brandAwareBadge",
});

initReflection({
  inputId: "strategyStarterInput",
  messageId: "strategyStarterMessage",
  messageTextId: "strategyStarterMessageText",
  badgeSectionId: "strategyStarterBadgeSection",
  readyMessage: "Puik — doel en visie aangeteken.",
  storageKey: "strategyStarterBadge",
});

initReflection({
  inputId: "foundVoiceInput",
  messageId: "foundVoiceMessage",
  messageTextId: "foundVoiceMessageText",
  badgeSectionId: "foundVoiceBadgeSection",
  readyMessage: "Jy het jou leuse gevind!",
  storageKey: "foundMyVoiceBadge",
});

// ==========================================================================
// Journey 08 — Reflection challenges (Clear Communicator, Time Tamer,
// Team Builder, Pro Mode, Well Connected)
// ==========================================================================
initReflection({
  inputId: "clearCommunicatorInput",
  messageId: "clearCommunicatorMessage",
  messageTextId: "clearCommunicatorMessageText",
  badgeSectionId: "clearCommunicatorBadgeSection",
  readyMessage: "Goeie strategieë om 'n moeilike oomblik te hanteer.",
  storageKey: "clearCommunicatorBadge",
});

initReflection({
  inputId: "timeTamerInput",
  messageId: "timeTamerMessage",
  messageTextId: "timeTamerMessageText",
  badgeSectionId: "timeTamerBadgeSection",
  readyMessage: "Dit is 'n soliede daaglikse struktuur.",
  storageKey: "timeTamerBadge",
});

initReflection({
  inputId: "teamBuilderInput",
  messageId: "teamBuilderMessage",
  messageTextId: "teamBuilderMessageText",
  badgeSectionId: "teamBuilderBadgeSection",
  readyMessage: "Duidelike rolle maak 'n sterker span.",
  storageKey: "teamBuilderBadge",
});

initReflection({
  inputId: "proModeInput",
  messageId: "proModeMessage",
  messageTextId: "proModeMessageText",
  badgeSectionId: "proModeBadgeSection",
  readyMessage: "Dit is 'n gewoonte wat die moeite werd is om te bou.",
  storageKey: "proModeBadge",
});

initReflection({
  inputId: "wellConnectedInput",
  messageId: "wellConnectedMessage",
  messageTextId: "wellConnectedMessageText",
  badgeSectionId: "wellConnectedBadgeSection",
  readyMessage: "Jy het mense op wie jy kan staatmaak.",
  storageKey: "wellConnectedBadge",
});

initReflection({
  inputId: "pitchReadyInput",
  messageId: "pitchReadyMessage",
  messageTextId: "pitchReadyMessageText",
  badgeSectionId: "pitchReadyBadgeSection",
  readyMessage: "Dit is die begin van 'n soliede befondsingsaanbieding.",
  storageKey: "pitchReadyBadge",
});

initReflection({
  inputId: "structureCheckInput",
  messageId: "structureCheckMessage",
  messageTextId: "structureCheckMessageText",
  badgeSectionId: "structureCheckBadgeSection",
  readyMessage: "Goed — die moeite werd om te hersien soos jou besigheid groei.",
  storageKey: "structureCheckBadge",
});

// ==========================================================================
// Journey 07 — "Look Locked In": brand colour picker
// ==========================================================================
(function () {
  var primaryInput = document.getElementById("brandColorPrimary");
  var secondaryInput = document.getElementById("brandColorSecondary");
  var primaryValueEl = document.getElementById("brandColorPrimaryValue");
  var secondaryValueEl = document.getElementById("brandColorSecondaryValue");
  var messageEl = document.getElementById("lookLockedInMessage");
  var messageTextEl = document.getElementById("lookLockedInMessageText");
  var badgeSection = document.getElementById("lookLockedInBadgeSection");

  if (!primaryInput || !secondaryInput || !messageEl || !messageTextEl || !badgeSection) return; // not on this page

  var READY_MESSAGE = "Jou handelsmerkidentiteit is vasgestel.";
  var STORAGE_KEY = "lookLockedInBadge";
  var hasInteracted = false;

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function update() {
    primaryValueEl.textContent = primaryInput.value.toUpperCase();
    secondaryValueEl.textContent = secondaryInput.value.toUpperCase();

    if (!hasInteracted) return; // don't fire on the default pre-set colours alone

    messageTextEl.textContent = READY_MESSAGE;
    messageEl.classList.add("is-visible");
    localStorage.setItem(STORAGE_KEY, "earned");
    showBadge();
  }

  primaryInput.addEventListener("input", function () {
    hasInteracted = true;
    update();
  });

  secondaryInput.addEventListener("input", function () {
    hasInteracted = true;
    update();
  });

  if (localStorage.getItem(STORAGE_KEY) === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  update();
})();

// ==========================================================================
// Journey 08 — "Tap to Trade": Yoco Sign-Up Checklist quiz
// ==========================================================================
(function () {
  var checkBtn = document.getElementById("checkYocoChecklist");
  if (!checkBtn) return; // not on this page

  var options = document.querySelectorAll(".yoco-checklist-option");
  var resultEl = document.getElementById("yocoChecklistResult");
  var badgeSection = document.getElementById("tapToTradeBadgeSection");
  var form = document.getElementById("yocoChecklistForm");

  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var CORRECT_ANSWERS = ["A", "C", "D", "E", "G"];

  var CORRECT_MESSAGE =
    "Goed gedaan! Jy hoef nie by CIPC geregistreer te wees om as 'n " +
    "Eenmansaak aan te meld nie. Jy het jou persoonlike besonderhede, " +
    "Suid-Afrikaanse ID-verifikasie, 'n handelsadres en 'n Suid-Afrikaanse " +
    "bankrekening in jou eie naam nodig. Jy kan dan die kaartmasjien kies wat " +
    "by jou besigheid pas.";

  var INCORRECT_MESSAGE =
    "Probeer weer. Onthou: Yoco laat Eenmansake toe om aan te meld sonder " +
    "CIPC-registrasie. Fokus op die identiteits-, adres- en bankbesonderhede " +
    "wat nodig is om kaartbetalings op te stel.";

  function clearHighlights() {
    options.forEach(function (option) {
      option.closest(".quiz-option").classList.remove("correct-answer", "incorrect-answer");
    });
  }

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  checkBtn.addEventListener("click", function () {
    var selected = [];
    options.forEach(function (option) {
      if (option.checked) selected.push(option.value);
    });

    clearHighlights();

    var isCorrect =
      selected.length === CORRECT_ANSWERS.length &&
      CORRECT_ANSWERS.every(function (answer) { return selected.indexOf(answer) !== -1; });

    options.forEach(function (option) {
      var wrapper = option.closest(".quiz-option");
      var isCorrectAnswer = CORRECT_ANSWERS.indexOf(option.value) !== -1;

      if (isCorrectAnswer && option.checked) {
        wrapper.classList.add("correct-answer");
      } else if (!isCorrectAnswer && option.checked) {
        wrapper.classList.add("incorrect-answer");
      } else if (isCorrectAnswer && !option.checked && !isCorrect) {
        wrapper.classList.add("incorrect-answer");
      }
    });

    resultEl.classList.remove("result-success", "result-retry");

    if (isCorrect) {
      resultEl.textContent = CORRECT_MESSAGE;
      resultEl.classList.add("result-success");
      resultEl.classList.remove("hidden");

      localStorage.setItem("tapToTradeBadge", "earned");
      showBadge();
    } else {
      resultEl.textContent = INCORRECT_MESSAGE;
      resultEl.classList.add("result-retry");
      resultEl.classList.remove("hidden");
    }
  });

  if (localStorage.getItem("tapToTradeBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 09 — "Find Your Funding Contact": NYDA/SEDFA contact-point activity
// ==========================================================================
(function () {
  var btn = document.getElementById("saveFundingContact");
  if (!btn) return; // not on this page

  var orgSelect = document.getElementById("orgSelected");
  var branchInput = document.getElementById("branchContact");
  var townInput = document.getElementById("townArea");
  var contactMethodSelect = document.getElementById("contactMethod");
  var detailInput = document.getElementById("contactDetail");
  var questionInput = document.getElementById("fundingQuestion");
  var messageEl = document.getElementById("fundingContactMessage");
  var messageTextEl = document.getElementById("fundingContactMessageText");
  var badgeSection = document.getElementById("fundingContactBadgeSection");

  var form = document.getElementById("fundingContactForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  var COMPLETED_MESSAGE =
    "Jy het 'n kontakpunt vir befondsingsteun gevind. Om ongeregistreerd te " +
    "wees, hoef jy nie te keer om jou opsies te verken nie. Jou volgende stap is " +
    "om die organisasie te kontak en te vra of jou besigheidsidee aan hul " +
    "vereistes voldoen.";

  var INCOMPLETE_MESSAGE =
    "Vul asseblief die organisasie, 'n spesifieke tak of kontakpunt, jou dorp " +
    "of area, 'n kontakmetode, 'n foonnommer of e-posadres, en een vraag in " +
    "wat jy aan die befondser sou vra.";

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (localStorage.getItem("fundingAwareBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  btn.addEventListener("click", function () {
    var hasOrg = orgSelect.value.trim() !== "";
    var hasBranch = branchInput.value.trim() !== "";
    var hasTown = townInput.value.trim() !== "";
    var hasMethod = contactMethodSelect.value.trim() !== "";
    var hasDetail = detailInput.value.trim() !== "";
    var hasQuestion = questionInput.value.trim() !== "";

    messageEl.classList.remove("is-visible");

    if (hasOrg && hasBranch && hasTown && hasMethod && hasDetail && hasQuestion) {
      messageTextEl.textContent = COMPLETED_MESSAGE;
      messageEl.classList.add("is-visible");
      messageEl.classList.remove("message-error");

      localStorage.setItem("fundingAwareBadge", "earned");
      showBadge();
    } else {
      messageTextEl.textContent = INCOMPLETE_MESSAGE;
      messageEl.classList.add("is-visible");
      messageEl.classList.add("message-error");
    }
  });
})();

// ==========================================================================
// Journey 10 — "Fair Employer": employer readiness check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveFairEmployer");
  if (!btn) return;

  var situationOptions = document.querySelectorAll(".employer-situation-option");
  var checklistBlock = document.getElementById("employerChecklistBlock");
  var hiringBlock = document.getElementById("employerHiringBlock");
  var reflectionInput = document.getElementById("employerReflection");
  var hireDateInput = document.getElementById("hireDate");
  var resultEl = document.getElementById("fairEmployerResult");
  var badgeSection = document.getElementById("fairEmployerBadgeSection");

  var form = document.getElementById("fairEmployerForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  situationOptions.forEach(function (option) {
    option.addEventListener("change", function () {
      checklistBlock.classList.toggle("hidden", option.value !== "A" || !option.checked);
      hiringBlock.classList.toggle("hidden", option.value !== "B" || !option.checked);
    });
  });

  btn.addEventListener("click", function () {
    var situation = document.querySelector('input[name="employerSituation"]:checked');

    if (!situation) {
      resultEl.textContent = "Kies asseblief die stelling wat jou besigheid vandag beskryf.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var complete = false;
    var summary = "";

    if (situation.value === "A") {
      var uif = document.querySelector('input[name="req-uif"]:checked');
      var coida = document.querySelector('input[name="req-coida"]:checked');
      var payslips = document.querySelector('input[name="req-payslips"]:checked');
      var partTime = document.querySelector('input[name="req-parttime"]:checked');
      var hasReflection = reflectionInput.value.trim() !== "";

      complete = !!(uif && coida && payslips && partTime && hasReflection);
      summary = complete ? "Eerste vereiste om te reël: " + reflectionInput.value.trim() : "";
    } else if (situation.value === "B") {
      complete = hireDateInput.value.trim() !== "";
      summary = complete ? "Beplande aanstellingsdatum: " + hireDateInput.value : "";
    } else {
      complete = true;
      summary = "Geen huidige werknemers of aanstellingsplanne aangeteken nie.";
    }

    if (complete) {
      resultEl.textContent = summary;
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("fairEmployerBadge", "earned");
      showBadge();
    } else {
      resultEl.textContent = "Voltooi asseblief die kontrolelys of aanstellingstelling voordat jy stoor.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
    }
  });

  if (localStorage.getItem("fairEmployerBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Retail Ready": supplier checklist
// ==========================================================================
(function () {
  var btn = document.getElementById("saveRetailReady");
  if (!btn) return;

  var buyerName = document.getElementById("buyerName");
  var safetyRequirement = document.getElementById("safetyRequirement");
  var resultEl = document.getElementById("retailReadyResult");
  var badgeSection = document.getElementById("retailReadyBadgeSection");

  var form = document.getElementById("retailReadyForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!buyerName.value.trim() || !safetyRequirement.value.trim()) {
      resultEl.textContent = "Noem asseblief 'n spesifieke koper en teken een verskaffervereiste of -vraag aan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor: " + buyerName.value.trim() + " — " + safetyRequirement.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("retailReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("retailReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Packaging Aware": packaging material check
// ==========================================================================
(function () {
  var btn = document.getElementById("savePackagingCheck");
  if (!btn) return;

  var materialSelect = document.getElementById("packagingMaterial");
  var proQuestion = document.getElementById("proQuestion");
  var resultEl = document.getElementById("packagingResult");
  var badgeSection = document.getElementById("packagingBadgeSection");

  var form = document.getElementById("packagingForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!materialSelect.value || !proQuestion.value.trim()) {
      resultEl.textContent = "Kies asseblief 'n verpakkingsmateriaal en teken 'n vraag aan om te ondersoek.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Materiaal: " + af(materialSelect.value) + " — Vraag aangeteken.";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("packagingAwareBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("packagingAwareBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Brand Protector": trademark search result
// ==========================================================================
(function () {
  var btn = document.getElementById("saveBrandSearch");
  if (!btn) return;

  var nameSearched = document.getElementById("nameSearched");
  var brandNextStep = document.getElementById("brandNextStep");
  var resultEl = document.getElementById("brandSearchResult");
  var badgeSection = document.getElementById("brandSearchBadgeSection");

  var form = document.getElementById("brandSearchForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!nameSearched.value.trim() || !brandNextStep.value) {
      resultEl.textContent = "Voer asseblief die naam in waarna gesoek is en kies 'n volgende stap.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gesoek: " + nameSearched.value.trim() + " — Volgende stap: " + af(brandNextStep.value);
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("brandProtectorBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("brandProtectorBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Deal Ready": document readiness planner
// ==========================================================================
(function () {
  var btn = document.getElementById("saveDealReady");
  if (!btn) return;

  var taxStatus = document.getElementById("taxStatus");
  var bbeeStatus = document.getElementById("bbeeStatus");
  var qualifiesEME = document.getElementById("qualifiesEME");
  var resultEl = document.getElementById("dealReadyResult");
  var badgeSection = document.getElementById("dealReadyBadgeSection");

  var form = document.getElementById("dealReadyForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!taxStatus.value || !bbeeStatus.value || !qualifiesEME.value) {
      resultEl.textContent = "Voltooi asseblief albei dokumentstatusse en jou EME-kontrole.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Belasting: " + af(taxStatus.value) + " · B-BBEE: " + af(bbeeStatus.value) + " · EME-kontrole: " + af(qualifiesEME.value);
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("dealReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("dealReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Data Responsible": customer-data audit
// ==========================================================================
(function () {
  var btn = document.getElementById("saveDataAudit");
  if (!btn) return;

  var collectSelects = document.querySelectorAll(".data-collect-select");
  var purposeStatement = document.getElementById("dataPurposeStatement");
  var otherType = document.getElementById("dataOtherType");
  var resultEl = document.getElementById("dataAuditResult");
  var badgeSection = document.getElementById("dataAuditBadgeSection");

  var form = document.getElementById("dataAuditForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasAtLeastOneYes = false;
    collectSelects.forEach(function (select) {
      if (select.value === "Yes") hasAtLeastOneYes = true;
    });
    if (otherType.value.trim() !== "") hasAtLeastOneYes = true;

    var hasStatement = purposeStatement.value.trim() !== "";

    if (!hasAtLeastOneYes || !hasStatement) {
      resultEl.textContent = "Merk asseblief ten minste een tipe data wat jy insamel en skryf 'n kort doelstelling.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = 'Gestoor. "Ons gebruik jou persoonlike inligting slegs om ' + purposeStatement.value.trim() + '"';
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("dataResponsibleBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("dataResponsibleBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 10 — "Growth Thinker": alternative growth plan
// ==========================================================================
(function () {
  var btn = document.getElementById("saveGrowthPlan");
  if (!btn) return;

  var optionRadios = document.querySelectorAll(".growth-option-radio");
  var otherRadio = document.getElementById("growthOptionOtherRadio");
  var otherText = document.getElementById("growthOptionOtherText");
  var researchInput = document.getElementById("growthResearch");
  var actionInput = document.getElementById("growthAction");
  var resultEl = document.getElementById("growthPlanResult");
  var badgeSection = document.getElementById("growthPlanBadgeSection");

  var form = document.getElementById("growthPlanForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  optionRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      otherText.disabled = !otherRadio.checked;
      if (!otherRadio.checked) otherText.value = "";
    });
  });

  btn.addEventListener("click", function () {
    var chosen = document.querySelector('input[name="growthOption"]:checked');
    var chosenLabel = chosen ? (chosen.value === "Other" ? otherText.value.trim() : af(chosen.value)) : "";

    if (!chosen || (chosen.value === "Other" && !otherText.value.trim()) || !researchInput.value.trim() || !actionInput.value.trim()) {
      resultEl.textContent = "Kies asseblief 'n groei-opsie en teken een navorsingsvraag en een volgende stap aan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Groei-opsie: " + chosenLabel + " — Navorsing: " + researchInput.value.trim() + " — Volgende 7 dae: " + actionInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("growthThinkerBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("growthThinkerBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Kitchen Ready": safety checklist
// ==========================================================================
(function () {
  var list = document.getElementById("kitchenChecklistList");
  if (!list) return;

  var inputs = list.querySelectorAll(".checklist-input");
  var countEl = document.getElementById("kitchenChecklistCount");
  var percentEl = document.getElementById("kitchenChecklistPercent");
  var fillEl = document.getElementById("kitchenChecklistProgressFill");
  var barEl = document.getElementById("kitchenChecklistProgressBar");
  var messageEl = document.getElementById("kitchenChecklistMessage");
  var messageTextEl = document.getElementById("kitchenChecklistMessageText");
  var badgeSection = document.getElementById("kitchenReadyBadgeSection");

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function update() {
    var total = inputs.length;
    var checked = 0;
    inputs.forEach(function (input) { if (input.checked) checked++; });

    var percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    countEl.textContent = checked + " van " + total + " voltooi";
    percentEl.textContent = percent + "%";
    fillEl.style.width = percent + "%";
    barEl.setAttribute("aria-valuenow", percent);

    if (total > 0 && checked === total) {
      messageTextEl.textContent = "Mooi! Jou kombuisbasiese vereistes is gedek.";
      messageEl.classList.add("is-visible");
      localStorage.setItem("kitchenReadyBadge", "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  inputs.forEach(function (input) { input.addEventListener("change", update); });

  if (localStorage.getItem("kitchenReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }

  update();
})();

// ==========================================================================
// Journey 04 — "Trust Builder": label check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveLabelCheck");
  if (!btn) return;

  var presentSelects = document.querySelectorAll(".label-present-select");
  var nutritionClaimSelect = document.getElementById("hasNutritionClaim");
  var nutritionTableField = document.getElementById("nutritionTableField");
  var improvementInput = document.getElementById("labelImprovement");
  var resultEl = document.getElementById("labelCheckResult");
  var badgeSection = document.getElementById("labelCheckBadgeSection");

  var form = document.getElementById("labelCheckForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  nutritionClaimSelect.addEventListener("change", function () {
    nutritionTableField.classList.toggle("hidden", nutritionClaimSelect.value !== "Yes");
  });

  btn.addEventListener("click", function () {
    var allChecked = true;
    presentSelects.forEach(function (select) {
      if (!select.value) allChecked = false;
    });

    if (!allChecked || !improvementInput.value.trim()) {
      resultEl.textContent = "Gaan asseblief al vyf etiketvereistes na en teken een verbetering aan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. Volgende verbetering: " + improvementInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("trustBuilderBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("trustBuilderBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Cold Chain Champion": temperature log
// ==========================================================================
(function () {
  var btn = document.getElementById("saveTempLog");
  if (!btn) return;

  var hasThermometerYes = document.getElementById("hasThermometerYes");
  var hasThermometerNo = document.getElementById("hasThermometerNo");
  var tempLogBlock = document.getElementById("tempLogBlock");
  var noThermometerBlock = document.getElementById("noThermometerBlock");
  var tempReading = document.getElementById("tempReading");
  var tempColdEnough = document.getElementById("tempColdEnough");
  var thermometerGetByDate = document.getElementById("thermometerGetByDate");
  var thermometerCheckDate = document.getElementById("thermometerCheckDate");
  var resultEl = document.getElementById("tempLogResult");
  var badgeSection = document.getElementById("tempLogBadgeSection");

  var form = document.getElementById("tempLogForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  hasThermometerYes.addEventListener("change", function () {
    tempLogBlock.classList.remove("hidden");
    noThermometerBlock.classList.add("hidden");
  });

  hasThermometerNo.addEventListener("change", function () {
    tempLogBlock.classList.add("hidden");
    noThermometerBlock.classList.remove("hidden");
  });

  btn.addEventListener("click", function () {
    if (hasThermometerYes.checked) {
      if (tempReading.value.trim() === "" || !tempColdEnough.value) {
        resultEl.textContent = "Teken asseblief 'n temperatuurlesing aan en of die kos koud genoeg is.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }
      resultEl.textContent = "Aangeteken: " + tempReading.value + "°C — " + af(tempColdEnough.value);
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("coldChainBadge", "earned");
      showBadge();
    } else if (hasThermometerNo.checked) {
      if (!thermometerGetByDate.value || !thermometerCheckDate.value) {
        resultEl.textContent = "Stel asseblief 'n datum om 'n termometer te kry en 'n datum vir jou eerste kontrole.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }
      resultEl.textContent = "Plan gestoor: kry 'n termometer teen " + thermometerGetByDate.value + ", kontroleer op " + thermometerCheckDate.value + ".";
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("coldChainBadge", "earned");
      showBadge();
    } else {
      resultEl.textContent = "Kies asseblief of jy 'n termometer het.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
    }
  });

  if (localStorage.getItem("coldChainBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Clean Team": training check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveTrainingCheck");
  if (!btn) return;

  var nameInputs = document.querySelectorAll(".training-name-input");
  var proofSelects = document.querySelectorAll(".training-proof-select");
  var actionInput = document.getElementById("trainingAction");
  var resultEl = document.getElementById("trainingCheckResult");
  var badgeSection = document.getElementById("trainingCheckBadgeSection");

  var form = document.getElementById("trainingCheckForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasAtLeastOnePerson = false;
    nameInputs.forEach(function (input) {
      if (input.value.trim() !== "") hasAtLeastOnePerson = true;
    });

    var hasProofAnswer = false;
    proofSelects.forEach(function (select) {
      if (select.value) hasProofAnswer = true;
    });

    if (!hasAtLeastOnePerson || !hasProofAnswer || !actionInput.value.trim()) {
      resultEl.textContent = "Teken asseblief ten minste jouself aan, merk of bewys beskikbaar is, en voeg een stap by.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. Volgende stap: " + actionInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("cleanTeamBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("cleanTeamBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 04 — "Ready to Scale": product risk check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveProductRisk");
  if (!btn) return;

  var productNameInputs = document.querySelectorAll(".product-name-input");
  var riskProductName = document.getElementById("riskProductName");
  var riskQuestion = document.getElementById("riskQuestion");
  var resultEl = document.getElementById("productRiskResult");
  var badgeSection = document.getElementById("productRiskBadgeSection");

  var form = document.getElementById("productRiskForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasAtLeastOneProduct = false;
    productNameInputs.forEach(function (input) {
      if (input.value.trim() !== "") hasAtLeastOneProduct = true;
    });

    if (!hasAtLeastOneProduct || !riskProductName.value.trim() || !riskQuestion.value.trim()) {
      resultEl.textContent = "Lys asseblief ten minste een beplande produk en een vraag om te ondersoek.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. Ondersoek: " + riskProductName.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("readyToScaleBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("readyToScaleBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "FIFO Focused": fridge/storage check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveFifoCheck");
  if (!btn) return;

  var itemInputs = document.querySelectorAll(".fifo-item-input");
  var frontSelects = document.querySelectorAll(".fifo-front-select");
  var actionInput = document.getElementById("fifoAction");
  var resultEl = document.getElementById("fifoCheckResult");
  var badgeSection = document.getElementById("fifoCheckBadgeSection");

  var form = document.getElementById("fifoCheckForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasItem = false;
    itemInputs.forEach(function (input) { if (input.value.trim() !== "") hasItem = true; });

    var hasAnswer = false;
    frontSelects.forEach(function (select) { if (select.value) hasAnswer = true; });

    var hasNo = false;
    frontSelects.forEach(function (select) { if (select.value === "No") hasNo = true; });

    if (!hasItem || !hasAnswer) {
      resultEl.textContent = "Gaan asseblief ten minste een item na en bevestig of die oudste voorraad heel voor is.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (hasNo && !actionInput.value.trim()) {
      resultEl.textContent = "Jy het 'n item as nie-FIFO-voldoenend gemerk. Teken asseblief die stap aan wat jy geneem het.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. " + (actionInput.value.trim() ? "Stap: " + actionInput.value.trim() : "Jou oudste voorraad is korrek geplaas.");
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("fifoFocusedBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("fifoFocusedBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "Par Level Pro": reorder planning
// ==========================================================================
(function () {
  var btn = document.getElementById("saveParLevel");
  if (!btn) return;

  var itemInputs = document.querySelectorAll(".par-item-input");
  var levelInputs = document.querySelectorAll(".par-level-input");
  var reorderInputs = document.querySelectorAll(".par-reorder-input");
  var resultEl = document.getElementById("parLevelResult");
  var badgeSection = document.getElementById("parLevelBadgeSection");

  var form = document.getElementById("parLevelForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasCompleteRow = false;
    for (var i = 0; i < itemInputs.length; i++) {
      if (itemInputs[i].value.trim() && levelInputs[i].value.trim() && reorderInputs[i].value.trim()) {
        hasCompleteRow = true;
        break;
      }
    }

    if (!hasCompleteRow) {
      resultEl.textContent = "Voltooi asseblief ten minste een volledige ry: item, minimum vlak en herbestelpunt.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Minimum vlakke gestoor.";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("parLevelProBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("parLevelProBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "Pattern Spotter": sell-out log
// ==========================================================================
(function () {
  var btn = document.getElementById("saveSellOutLog");
  if (!btn) return;

  var soldOutYes = document.getElementById("soldOutYes");
  var soldOutNo = document.getElementById("soldOutNo");
  var logBlock = document.getElementById("sellOutLogBlock");
  var itemInputs = document.querySelectorAll(".sellout-item-input");
  var changeInput = document.getElementById("sellOutChange");
  var patternReflection = document.getElementById("patternReflection");
  var resultEl = document.getElementById("sellOutResult");
  var badgeSection = document.getElementById("sellOutBadgeSection");

  var form = document.getElementById("sellOutForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  soldOutYes.addEventListener("change", function () { logBlock.classList.remove("hidden"); });
  soldOutNo.addEventListener("change", function () { logBlock.classList.add("hidden"); });

  btn.addEventListener("click", function () {
    var choice = document.querySelector('input[name="anySoldOut"]:checked');

    if (!choice) {
      resultEl.textContent = "Kies asseblief of enigiets vandag uitverkoop het.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (choice.value === "yes") {
      var hasItem = false;
      itemInputs.forEach(function (input) { if (input.value.trim() !== "") hasItem = true; });

      if (!hasItem || !changeInput.value.trim()) {
        resultEl.textContent = "Teken asseblief ten minste een item aan wat uitverkoop het en een verandering vir volgende keer.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      resultEl.textContent = "Gestoor. Volgende keer: " + changeInput.value.trim();
    } else {
      resultEl.textContent = "Niks het vandag uitverkoop nie. Hou môre voort om voorraad dop te hou en teken enige item aan wat opraak.";
    }

    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("patternSpotterBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("patternSpotterBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 05 — "Smart Stocker": ordering plan
// ==========================================================================
(function () {
  var btn = document.getElementById("saveOrderPlan");
  if (!btn) return;

  var perishableItem = document.getElementById("perishableItem");
  var perishablePlan = document.getElementById("perishablePlan");
  var dryItem = document.getElementById("dryItem");
  var dryPlan = document.getElementById("dryPlan");
  var supplierItemName = document.getElementById("supplierItemName");
  var supplierPreview = document.getElementById("supplierQuestionPreview");
  var resultEl = document.getElementById("orderPlanResult");
  var badgeSection = document.getElementById("orderPlanBadgeSection");

  var form = document.getElementById("orderPlanForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  supplierItemName.addEventListener("input", function () {
    supplierPreview.textContent = supplierItemName.value.trim() || "[item]";
  });

  btn.addEventListener("click", function () {
    if (!perishableItem.value.trim() || !perishablePlan.value.trim() || !dryItem.value.trim() || !dryPlan.value.trim() || !supplierItemName.value.trim()) {
      resultEl.textContent = "Voltooi asseblief albei items met 'n bestelplan, en noem 'n item vir jou verskaffervraag.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. Verskaffervraag gereed vir: " + supplierItemName.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("smartStockerBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("smartStockerBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Business Ready": WhatsApp profile checklist
// ==========================================================================
(function () {
  var btn = document.getElementById("saveWaProfile");
  if (!btn) return;

  var checks = document.querySelectorAll(".wa-profile-check");
  var nameInput = document.getElementById("waBusinessName");
  var productsInput = document.getElementById("waProducts");
  var hoursInput = document.getElementById("waHours");
  var namePreview = document.getElementById("waNamePreview");
  var productsPreview = document.getElementById("waProductsPreview");
  var hoursPreview = document.getElementById("waHoursPreview");
  var resultEl = document.getElementById("waProfileResult");
  var badgeSection = document.getElementById("waProfileBadgeSection");

  var form = document.getElementById("waProfileForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  nameInput.addEventListener("input", function () { namePreview.textContent = nameInput.value.trim() || "[besigheidsnaam]"; });
  productsInput.addEventListener("input", function () { productsPreview.textContent = productsInput.value.trim() || "[produkte]"; });
  hoursInput.addEventListener("input", function () { hoursPreview.textContent = hoursInput.value.trim() || "[openingstye]"; });

  btn.addEventListener("click", function () {
    var allChecked = true;
    checks.forEach(function (select) { if (!select.value) allChecked = false; });

    if (!allChecked || !nameInput.value.trim() || !productsInput.value.trim() || !hoursInput.value.trim()) {
      resultEl.textContent = "Voltooi asseblief die kontrolelys en skryf jou groetboodskapbesonderhede.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Profiel gestoor vir " + nameInput.value.trim() + ".";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("businessReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("businessReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Catalogue Built": WhatsApp catalogue builder
// ==========================================================================
(function () {
  var btn = document.getElementById("saveCatalogue");
  if (!btn) return;

  var nameInputs = document.querySelectorAll(".cat-name-input");
  var priceInputs = document.querySelectorAll(".cat-price-input");
  var shareMethod = document.getElementById("catShareMethod");
  var updateFrequency = document.getElementById("catUpdateFrequency");
  var resultEl = document.getElementById("catalogueResult");
  var badgeSection = document.getElementById("catalogueBadgeSection");

  var form = document.getElementById("catalogueForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var completeCount = 0;
    for (var i = 0; i < nameInputs.length; i++) {
      if (nameInputs[i].value.trim() && priceInputs[i].value.trim()) completeCount++;
    }

    if (completeCount < 3 || !shareMethod.value || !updateFrequency.value.trim()) {
      resultEl.textContent = "Voeg asseblief 'n naam en prys vir al drie items by, kies 'n deelmetode, en stel 'n opdateringsroetine.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Katalogus gestoor met 3 items. Deel via: " + af(shareMethod.value);
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("catalogueBuiltBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("catalogueBuiltBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Connected": social-media connection check
// ==========================================================================
(function () {
  var btn = document.getElementById("saveConnection");
  if (!btn) return;

  var platformSelected = document.getElementById("platformSelected");
  var isLinked = document.getElementById("isLinked");
  var whatCustomersCanDo = document.getElementById("whatCustomersCanDo");
  var linkedDateBlock = document.getElementById("linkedDateBlock");
  var linkByDate = document.getElementById("linkByDate");
  var resultEl = document.getElementById("connectionResult");
  var badgeSection = document.getElementById("connectionBadgeSection");

  var form = document.getElementById("connectionForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  isLinked.addEventListener("change", function () {
    linkedDateBlock.classList.toggle("hidden", isLinked.value === "Yes");
  });

  btn.addEventListener("click", function () {
    if (!platformSelected.value || !isLinked.value || !whatCustomersCanDo.value.trim()) {
      resultEl.textContent = "Kies asseblief 'n platform, bevestig jou koppelingstatus, en verduidelik wat kliënte sal kan doen.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (isLinked.value !== "Yes" && !linkByDate.value) {
      resultEl.textContent = "Stel asseblief 'n datum teen wanneer jy jou rekening sal koppel.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. Platform: " + af(platformSelected.value) + (isLinked.value === "Yes" ? " (reeds gekoppel)" : " — koppel teen " + linkByDate.value);
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("connectedBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("connectedBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Camera Ready": food photo checklist + caption
// ==========================================================================
(function () {
  var btn = document.getElementById("savePhotoChallenge");
  if (!btn) return;

  var checks = document.querySelectorAll(".photo-check-select");
  var dishInput = document.getElementById("captionDish");
  var locationInput = document.getElementById("captionLocation");
  var priceInput = document.getElementById("captionPrice");
  var dishPreview = document.getElementById("captionDishPreview");
  var locationPreview = document.getElementById("captionLocationPreview");
  var pricePreview = document.getElementById("captionPricePreview");
  var resultEl = document.getElementById("photoChallengeResult");
  var badgeSection = document.getElementById("photoChallengeBadgeSection");

  var form = document.getElementById("photoChallengeForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  dishInput.addEventListener("input", function () { dishPreview.textContent = dishInput.value.trim() || "[gereg]"; });
  locationInput.addEventListener("input", function () { locationPreview.textContent = locationInput.value.trim() || "[ligging]"; });
  priceInput.addEventListener("input", function () { pricePreview.textContent = priceInput.value.trim() || "[prys]"; });

  btn.addEventListener("click", function () {
    var allChecked = true;
    checks.forEach(function (select) { if (!select.value) allChecked = false; });

    if (!allChecked || !dishInput.value.trim() || !locationInput.value.trim() || !priceInput.value.trim()) {
      resultEl.textContent = "Voltooi asseblief die fotokontrolelys en vul jou onderskrifbesonderhede in.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Gestoor. Onderskrif gereed vir: " + dishInput.value.trim();
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("cameraReadyBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("cameraReadyBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Journey 06 — "Idea Bank": monthly content idea bank
// ==========================================================================
(function () {
  var btn = document.getElementById("saveIdeaBank");
  if (!btn) return;

  var textInputs = document.querySelectorAll(".idea-text-input");
  var formatSelects = document.querySelectorAll(".idea-format-select");
  var whenInputs = document.querySelectorAll(".idea-when-input");
  var weeklyPostDay = document.getElementById("weeklyPostDay");
  var resultEl = document.getElementById("ideaBankResult");
  var badgeSection = document.getElementById("ideaBankBadgeSection");

  var form = document.getElementById("ideaBankForm");
  if (form) form.addEventListener("submit", function (e) { e.preventDefault(); });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var completeCount = 0;
    for (var i = 0; i < textInputs.length; i++) {
      if (textInputs[i].value.trim() && formatSelects[i].value && whenInputs[i].value.trim()) completeCount++;
    }

    if (completeCount < 3 || !weeklyPostDay.value) {
      resultEl.textContent = "Voeg asseblief drie volledige plasingsidees by en kies 'n weeklikse plasingsdag.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Idee-bank gestoor. Plaas elke " + af(weeklyPostDay.value) + ".";
    resultEl.classList.remove("hidden");
    resultEl.classList.remove("result-error");
    localStorage.setItem("ideaBankBadge", "earned");
    showBadge();
  });

  if (localStorage.getItem("ideaBankBadge") === "earned") {
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
  }
})();

// ==========================================================================
// Page completion: congratulatory modal + "download my responses" PDF
// Generic — works on any module page via the .badge-section/"hidden"
// convention already used by every challenge across Journeys 1–10.
// ==========================================================================
(function () {
  var moduleMain = document.querySelector(".module-main");
  if (!moduleMain) return; // not a module/journey page

  var badgeSections = document.querySelectorAll(".badge-section");
  if (!badgeSections.length) return; // no challenges on this page

  var STORAGE_KEY = "pageCompletionCelebrated:" + window.location.pathname;

  function allComplete() {
    return Array.prototype.every.call(badgeSections, function (el) {
      return !el.classList.contains("hidden");
    });
  }

  function getModuleTitle() {
    var h1 = document.querySelector(".module-header h1");
    return h1 ? h1.textContent.trim() : document.title;
  }

  // ---- Strip emoji before anything reaches jsPDF ----
  // jsPDF's built-in fonts (Helvetica/Times/Courier) have no glyphs for
  // emoji. Leaving them in causes garbled characters and broken letter
  // spacing on the whole line (emoji are surrogate pairs, which throws off
  // jsPDF's width calculations). This only affects the PDF text — the
  // on-screen HTML keeps its emoji as normal.
  function sanitizeForPdf(text) {
    if (!text) return text;
    return text
      .replace(/\p{Extended_Pictographic}/gu, "") // emoji
      .replace(/\uFE0F/g, "") // emoji variation selector
      .replace(/\s{2,}/g, " ") // collapse the gap left behind
      .trim();
  }

  // ---- Congratulatory modal ----
  function getEarnedBadgeNames() {
    var names = [];
    badgeSections.forEach(function (section) {
      var badgeEl = section.querySelector(".badge");
      if (badgeEl) {
        names.push(badgeEl.textContent.trim().replace(/\s+/g, " "));
      }
    });
    return names;
  }

  // ---- Confetti behind the pop-up (skipped if the visitor prefers reduced motion) ----
  function launchCompletionConfetti() {
    try {
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      var canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
      document.body.appendChild(canvas);

      var ctx = canvas.getContext("2d");
      if (!ctx) {
        canvas.remove();
        return;
      }
      var dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);

      var colors = ["#319966", "#1fc652", "#b7d64a", "#1daec6", "#f09c3a"];
      var pieces = [];
      for (var i = 0; i < 180; i++) {
        pieces.push({
          x: Math.random() * window.innerWidth,
          y: -20 - Math.random() * window.innerHeight * 0.6,
          w: 6 + Math.random() * 6,
          h: 8 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: -8 + Math.random() * 16,
          speedY: 2 + Math.random() * 3,
          speedX: -1.5 + Math.random() * 3,
          opacity: 1,
        });
      }

      var startTime = null;
      var duration = 4500;

      function frame(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        pieces.forEach(function (p) {
          p.x += p.speedX;
          p.y += p.speedY;
          p.rotation += p.rotationSpeed;
          if (elapsed > duration * 0.6) {
            p.opacity = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
          }
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        });

        if (elapsed < duration) {
          requestAnimationFrame(frame);
        } else {
          canvas.remove();
        }
      }

      requestAnimationFrame(frame);
    } catch (e) {
      /* confetti is decoration only - never let it block the pop-up */
    }
  }

  function showCongratsToast() {
    var badgeNames = getEarnedBadgeNames();

    var overlay = document.createElement("div");
    overlay.className = "page-complete-overlay";

    var badgeListHtml = "";
    if (badgeNames.length) {
      badgeListHtml =
        '<ul class="page-complete-badge-list">' +
        badgeNames.map(function (name) { return "<li>" + name + "</li>"; }).join("") +
        "</ul>";
    }

    var modal = document.createElement("div");
    modal.className = "page-complete-modal";
    modal.setAttribute("role", "status");
    modal.setAttribute("aria-live", "polite");
    modal.innerHTML =
      '<div class="page-complete-icon">🎉</div>' +
      "<h2>Goeie werk!</h2>" +
      "<p>Jy het elke uitdaging op hierdie bladsy voltooi en die volgende verdien:</p>" +
      badgeListHtml +
      '<button type="button" class="btn btn-primary page-complete-close">Gaan voort</button>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add("is-visible");
    });

    launchCompletionConfetti();

    function dismiss() {
      overlay.classList.remove("is-visible");
      setTimeout(function () {
        overlay.remove();
      }, 400);
    }

    modal.querySelector(".page-complete-close").addEventListener("click", dismiss);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) dismiss();
    });

    setTimeout(dismiss, 35000);
  }

  // ---- Download button ----
  function addDownloadButton() {
    if (document.getElementById("downloadResponsesBtn")) return;

    var wrap = document.createElement("div");
    wrap.className = "download-responses-wrap";

    var note = document.createElement("p");
    note.className = "download-responses-note";
    note.textContent = "Kry 'n PDF-kopie van alles wat jy op hierdie bladsy ingevul het.";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "downloadResponsesBtn";
    btn.className = "btn btn-primary";
    btn.textContent = "⬇ Laai My Antwoorde Af (PDF)";
    btn.addEventListener("click", generateResponsesPdf);

    wrap.appendChild(note);
    wrap.appendChild(btn);
    moduleMain.appendChild(wrap);
  }

  // ---- Generic response harvester ----
  function labelForInput(el) {
    if (el.id) {
      var lbl = document.querySelector('label[for="' + el.id + '"]');
      if (lbl) return lbl.textContent.trim();
    }
    var parentLabel = el.closest("label");
    if (parentLabel) {
      var clone = parentLabel.cloneNode(true);
      var innerInput = clone.querySelector("input, select, textarea");
      if (innerInput) innerInput.remove();
      return clone.textContent.trim();
    }
    var field = el.closest(".form-field");
    if (field) {
      var flabel = field.querySelector("label");
      if (flabel) return flabel.textContent.trim();
    }
    return null;
  }

  function valueForSelect(sel) {
    if (sel.selectedIndex < 0) return "";
    var opt = sel.options[sel.selectedIndex];
    return opt ? opt.textContent.trim() : sel.value;
  }

  function collectSection(container) {
    var titleEl = container.querySelector(".checklist-intro h2") || container.querySelector("h2");
    var title = titleEl ? titleEl.textContent.trim() : "Uitdaging";

    var promptEl = container.querySelector(".checklist-intro .lead") || container.querySelector(".lead");
    var prompt = promptEl ? promptEl.textContent.trim() : null;

    var qa = []; // { question, answer }
    var tables = []; // { headers: [...], rows: [[...], ...] }

    // Checklist items — each item's text is its own question
    container.querySelectorAll(".checklist-item").forEach(function (item) {
      var input = item.querySelector(".checklist-input");
      var text = item.querySelector(".checklist-text");
      if (input && text) {
        qa.push({
          question: text.textContent.trim(),
          answer: input.checked ? "Ja, gemerk" : "Nie gemerk nie",
        });
      }
    });

    // Tables — captured as real table data, not flattened into Q&A
    container.querySelectorAll(".requirement-table, table").forEach(function (table) {
      if (table.closest(".example-answer") || table.classList.contains("example-table")) return;

      var headers = Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) {
        return th.textContent.trim();
      });

      var rows = [];
      table.querySelectorAll("tbody tr").forEach(function (tr) {
        var cells = tr.querySelectorAll("td");
        var hasContent = false;
        var rowValues = Array.prototype.map.call(cells, function (td) {
          var input = td.querySelector("input, select, textarea");
          var val = "";
          if (input) {
            if (input.tagName === "SELECT") val = valueForSelect(input);
            else if (input.type === "checkbox" || input.type === "radio") val = input.checked ? "Ja" : "";
            else val = input.value;
          } else {
            val = td.textContent.trim();
          }
          if (val) hasContent = true;
          return val || "-";
        });
        if (hasContent) rows.push(rowValues);
      });

      if (rows.length) {
        tables.push({ headers: headers, rows: rows });
      }
    });

    // Radio groups (skip ones already captured as table cells above)
    var seenRadioNames = {};
    container.querySelectorAll('input[type="radio"]').forEach(function (radio) {
      if (radio.closest("td")) return;
      var name = radio.name;
      if (!name || seenRadioNames[name]) return;
      seenRadioNames[name] = true;
      var group = container.querySelectorAll('input[type="radio"][name="' + CSS.escape(name) + '"]');
      var checked = Array.prototype.find.call(group, function (r) { return r.checked; });
      if (checked) {
        var lbl = checked.closest("label");
        var text = lbl ? lbl.textContent.trim() : name;
        qa.push({ question: "Watter een het jy gekies?", answer: text });
      }
    });

    // Standalone checkboxes (quiz options, task lists)
    container.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      if (cb.closest(".checklist-item")) return;
      var label = cb.closest("label");
      if (!label || !cb.checked) return;
      var clone = label.cloneNode(true);
      var innerInput = clone.querySelector("input");
      if (innerInput) innerInput.remove();
      var text = clone.textContent.trim();
      if (text) qa.push({ question: "Gekies", answer: text });
    });

    // Text/number/date/time/color inputs, selects, textareas
    var freeInputs = container.querySelectorAll(
      'input[type="text"], input[type="number"], input[type="date"], input[type="time"], input[type="color"], textarea, select'
    );
    var freeInputList = Array.prototype.filter.call(freeInputs, function (el) {
      return !el.closest("td") && !el.closest(".example-answer");
    });

    // Single free-text question (e.g. a reflection textarea) — use the
    // challenge's own prompt as the question instead of a generic field label.
    if (freeInputList.length === 1 && prompt) {
      var value = freeInputList[0].value;
      if (value) {
        qa.push({ question: prompt, answer: value });
      }
      freeInputList = [];
    }

    freeInputList.forEach(function (el) {
      var label = labelForInput(el);
      if (!label) return;
      var value = el.tagName === "SELECT" ? valueForSelect(el) : el.value;
      if (!value) return;
      qa.push({ question: label, answer: value });
    });

    return { title: title, prompt: prompt, qa: qa, tables: tables };
  }

  function collectAllResponses() {
    var containers = document.querySelectorAll(".checklist-card, .challenge-box");
    var sections = [];
    containers.forEach(function (c) {
      var data = collectSection(c);
      if (data.qa.length || data.tables.length) sections.push(data);
    });
    return sections;
  }

  // Embedded as a data URI (not fetched) so the PDF header logo always
  // renders, regardless of how the page is opened (file://, no server,
  // offline, etc.) - fetch() of local files is blocked under file://.
  //
  // >>> KEEP YOUR EXISTING LOGO LINE HERE. <<<
  // Replace the placeholder text below with the long base64 string from your
  // original main.js (the line that starts: var VUKA_LOGO_DATA_URL = "data:image/png;base64,...).
  var VUKA_LOGO_DATA_URL = "PASTE_YOUR_EXISTING_LOGO_DATA_URL_HERE";

  function generateResponsesPdf() {
    if (!window.jspdf) {
      alert("Jammer, die PDF-instrument het nie gelaai nie. Verfris asseblief die bladsy en probeer weer.");
      return;
    }

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var moduleTitle = getModuleTitle();
    var date = new Date().toLocaleDateString("af-ZA");
    var margin = 16;
    var maxTextWidth = pageWidth - margin * 2;

    function drawHeader() {
      doc.setFillColor(6, 72, 70);
      doc.rect(0, 0, pageWidth, 26, "F");
    }

    function checkPageBreak(y, needed) {
      if (y + needed > pageHeight - 20) {
        doc.addPage();
        return 20;
      }
      return y;
    }

    function renderPdf(logoDataUrl) {
      drawHeader();

      if (logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, "PNG", margin, 6, 32, 14);
        } catch (err) {
          console.warn("Could not add logo to PDF:", err);
        }
      }

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("My Antwoorde", pageWidth - margin, 12, { align: "right" });
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text("Afgelaai op " + date, pageWidth - margin, 18, { align: "right" });

      var y = 40;

      doc.setTextColor(6, 72, 70);
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      var titleLines = doc.splitTextToSize(sanitizeForPdf(moduleTitle), maxTextWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 7 + 6;

      var sections = collectAllResponses();

      sections.forEach(function (section) {
        y = checkPageBreak(y, 20);

        doc.setFillColor(242, 238, 235);
        doc.rect(margin, y - 6, maxTextWidth, 10, "F");
        doc.setTextColor(6, 72, 70);
        doc.setFontSize(13);
        doc.setFont(undefined, "bold");
        doc.text(sanitizeForPdf(section.title), margin + 3, y + 1);
        y += 14;

        section.qa.forEach(function (pair) {
          var questionLines = doc.splitTextToSize(sanitizeForPdf(pair.question), maxTextWidth);
          var answerLines = doc.splitTextToSize(sanitizeForPdf(String(pair.answer)), maxTextWidth - 4);
          var blockHeight = questionLines.length * 5.5 + answerLines.length * 5.5 + 10;

          y = checkPageBreak(y, blockHeight);

          doc.setTextColor(6, 72, 70);
          doc.setFontSize(10);
          doc.setFont(undefined, "bold");
          doc.text(questionLines, margin, y);
          y += questionLines.length * 5.5 + 2;

          doc.setTextColor(50, 50, 50);
          doc.setFontSize(10);
          doc.setFont(undefined, "normal");
          doc.text(answerLines, margin + 4, y);
          y += answerLines.length * 5.5 + 8;
        });

        section.tables.forEach(function (tableData) {
          y = checkPageBreak(y, 24);

          var cleanHeaders = tableData.headers.map(sanitizeForPdf);
          var cleanRows = tableData.rows.map(function (row) {
            return row.map(sanitizeForPdf);
          });

          doc.autoTable({
            startY: y,
            margin: { left: margin, right: margin },
            head: cleanHeaders.length ? [cleanHeaders] : undefined,
            body: cleanRows,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3, textColor: [50, 50, 50], overflow: "linebreak" },
            headStyles: { fillColor: [6, 72, 70], textColor: [255, 255, 255], fontStyle: "bold" },
            alternateRowStyles: { fillColor: [242, 238, 235] },
          });

          y = doc.lastAutoTable.finalY + 12;
        });

        y += 4;
      });

      if (!sections.length) {
        doc.setFontSize(11);
        doc.setTextColor(95, 95, 95);
        doc.text("Geen antwoorde is gevind om in hierdie PDF in te sluit nie.", margin, y);
      }

      var pageCount = doc.internal.getNumberOfPages();
      for (var i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          "Bladsy " + i + " van " + pageCount,
          pageWidth - margin,
          pageHeight - 8,
          { align: "right" }
        );
      }

      var safeName = moduleTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      doc.save(safeName + "_my_antwoorde.pdf");
    }

    renderPdf(VUKA_LOGO_DATA_URL);
  }

  // ---- Wire it up ----
  function checkCompletion() {
    if (!allComplete()) return;
    if (document.getElementById("downloadResponsesBtn")) return;

    if (localStorage.getItem(STORAGE_KEY)) {
      addDownloadButton();
    } else {
      localStorage.setItem(STORAGE_KEY, "shown");
      showCongratsToast();
      setTimeout(addDownloadButton, 4500);
    }
  }

  checkCompletion(); // covers returning visitors who already finished
  document.addEventListener("change", checkCompletion);
  document.addEventListener("click", function () {
    setTimeout(checkCompletion, 50);
  });
})();