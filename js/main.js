// ==========================================================================
// Vuka — shared site behaviour (static build)
// ==========================================================================

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
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    topicSections.forEach((section) => observer.observe(section));
  }

  const initialId = window.location.hash
    ? window.location.hash.replace("#", "")
    : topicSections[0].id;
  setActive(initialId);
})();

// ==========================================================================
// Journey 1 — Checklist (partial-progress message + automatic badge at 100%)
// ==========================================================================
(function () {
  var READY_THRESHOLD = 0.6;
  var READY_MESSAGE = "Mooi werk. Jy toon werklike tekens van groei!";

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

  if (
    !countEl ||
    !percentEl ||
    !fillEl ||
    !barEl ||
    !messageEl ||
    !messageTextEl ||
    !badgeSection
  ) {
    console.warn(
      "Journey 1 checklist: missing one or more required elements.",
      {
        countEl: !!countEl,
        percentEl: !!percentEl,
        fillEl: !!fillEl,
        barEl: !!barEl,
        messageEl: !!messageEl,
        messageTextEl: !!messageTextEl,
        badgeSection: !!badgeSection,
      },
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

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
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
          p.opacity = Math.max(
            0,
            1 - (elapsed - duration * 0.6) / (duration * 0.4),
          );
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
  var READY_MESSAGE =
    "Uitstekende nadenke! Jy is gereed om die volgende stap te neem.";

  var textarea = document.getElementById("growthReflectionInput");
  var messageEl = document.getElementById("reflectionMessage");
  var messageTextEl = document.getElementById("reflectionMessageText");
  var badgeSection = document.getElementById("riseBadgeSection");

  if (!textarea || !messageEl || !messageTextEl || !badgeSection) {
    if (textarea) {
      console.warn(
        "Journey 1 reflection: missing one or more required elements.",
        {
          messageEl: !!messageEl,
          messageTextEl: !!messageTextEl,
          badgeSection: !!badgeSection,
        },
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

  if (
    !calcBtn ||
    !moneyInInput ||
    !moneyOutInput ||
    !profitResult ||
    !badgeSection ||
    !numbersBadge
  ) {
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
      message =
        "Jou wins hierdie week is <strong>" +
        profit.toFixed(2) +
        "</strong>. Mooi so!";
    } else if (profit === 0) {
      message =
        "Jy het hierdie week gelykop gebreek: <strong>0.00</strong> wins.";
    } else {
      message =
        "Jy het hierdie week 'n verlies van <strong>" +
        Math.abs(profit).toFixed(2) +
        "</strong> gemaak.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
    if (emergency) parts.push("Noodgeld: " + emergency);

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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  btn.addEventListener("click", function () {
    var expense = expenseInput.value.trim();
    var amount = parseFloat(amountInput.value) || 0;
    var idea = ideaInput.value.trim();

    if (!expense || !idea) {
      resultEl.textContent =
        "Voeg jou grootste uitgawe en een idee by om dit te verminder.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.innerHTML =
      "Grootste uitgawe: <strong>" +
      expense +
      "</strong>" +
      (amount ? " (~R" + amount.toFixed(2) + "/week)" : "") +
      "<br>Jou plan: " +
      idea;
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
            ": " +
            desc +
            (amount ? " — R" + amount.toFixed(2) : ""),
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  var requirements = {
    capitec: [
      "'n Bestaande Capitec GlobalOne persoonlike rekening",
      "Jou Suid-Afrikaanse ID",
      "Geen minimum deposito om oop te maak nie",
    ],
    tyme: [
      '\'n Bestaande TymeBank "Good Friends" persoonlike rekening',
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
        if (check.checked)
          chosenTasks.push(check.parentElement.textContent.trim());
      });

      if (!bankSelect.value) {
        resultEl.textContent = "Kies eers 'n bank.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      if (!chosenTasks.length) {
        resultEl.textContent =
          "Merk ten minste een ding wat jy hierdie week gaan doen.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  btn.addEventListener("click", function () {
    var notes = notesInput.value.trim();

    if (!notes) {
      resultEl.textContent =
        "Voeg ten minste een dokument of permit by wat jy sal nodig hê.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  btn.addEventListener("click", function () {
    var address = addressInput.value.trim();
    var phone = phoneInput.value.trim();

    if (!address && !phone) {
      resultEl.textContent = "Voeg die kantooradres of kontaknommer by.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var parts = [];
    if (address) parts.push("Adres: " + address);
    if (phone) parts.push("Telefoon: " + phone);

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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
    if (missing) parts.push("Kort: " + missing);

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

  form.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  function setRecordsType(type) {
    recordsType = type;
    var isActual = type === "actual";
    actualBtn.classList.toggle("active", isActual);
    actualBtn.setAttribute("aria-pressed", String(isActual));
    estimateBtn.classList.toggle("active", !isActual);
    estimateBtn.setAttribute("aria-pressed", String(!isActual));
  }

  if (actualBtn)
    actualBtn.addEventListener("click", function () {
      setRecordsType("actual");
    });
  if (estimateBtn)
    estimateBtn.addEventListener("click", function () {
      setRecordsType("estimate");
    });

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
      var notTrading = document.querySelector(
        '.not-trading-check[data-month="' + month + '"]',
      );
      if (notTrading && notTrading.checked) return;

      var value = parseFloat(input.value);
      if (!isNaN(value) && input.value.trim() !== "") {
        total += value;
        monthsTrading++;
        anyEntry = true;
      }
    });

    if (!anyEntry) {
      resultEl.textContent =
        'Voer ten minste een maand se verkope in, of merk maande as "dryf nog nie handel nie."';
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var average = monthsTrading > 0 ? total / monthsTrading : 0;
    var percent = Math.min(100, Math.round((total / VAT_THRESHOLD) * 100));

    totalAmountEl.textContent =
      "R " + total.toLocaleString("en-ZA", { maximumFractionDigits: 2 });
    averageAmountEl.textContent =
      "R " + average.toLocaleString("en-ZA", { maximumFractionDigits: 2 });
    progressPercentEl.textContent = percent + "%";
    progressBarEl.setAttribute("aria-valuenow", percent);
    progressFillEl.style.width = percent + "%";

    progressFillEl.classList.remove("near-limit", "over-limit");
    resultEl.classList.remove("result-warning", "result-alert", "result-error");

    var statusLine;
    if (total >= VAT_THRESHOLD) {
      progressFillEl.classList.add("over-limit");
      resultEl.classList.add("result-alert");
      statusLine =
        "Jou verkope is op of bo die BTW-drempel. Bevestig jou posisie so gou moontlik met SARS.";
    } else if (percent >= 80) {
      progressFillEl.classList.add("near-limit");
      resultEl.classList.add("result-warning");
      statusLine =
        "Jy kom naby — ongeveer R" +
        (VAT_THRESHOLD - total).toLocaleString("en-ZA", {
          maximumFractionDigits: 0,
        }) +
        " onder die BTW-drempel van R2,3 miljoen.";
    } else {
      statusLine =
        "Jy is R" +
        (VAT_THRESHOLD - total).toLocaleString("en-ZA", {
          maximumFractionDigits: 0,
        }) +
        " onder die verpligte BTW-drempel van R2 300 000.";
    }

    var recordLabel =
      recordsType === "estimate"
        ? "Dit is slegs 'n skatting."
        : "Dit is werklike rekords.";

    resultEl.innerHTML =
      "Aangeteken oor " +
      monthsTrading +
      " maand" +
      (monthsTrading === 1 ? "" : "e") +
      ": <strong>R" +
      total.toLocaleString("en-ZA", { maximumFractionDigits: 2 }) +
      "</strong><br>" +
      statusLine +
      "<br>" +
      '<span class="small">' +
      recordLabel +
      "</span>";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  var actionLabels = {
    records: "Begin maandelikse verkooprekords hou",
    "turnover-tax": "Gaan na of ek vir Omsetbelasting kwalifiseer",
    efiling: "Teken in by of skep my SARS eFiling-profiel",
    branch: "Bespreek 'n SARS-afspraak of besoek 'n tak",
    practitioner: "Praat met 'n geregistreerde belastingpraktisyn",
  };

  var reminderLabels = {
    none: "Geen herinnering gestel nie",
    "3days": "Herinnering gestel vir 3 dae van nou af",
    "1week": "Herinnering gestel vir volgende week",
  };

  btn.addEventListener("click", function () {
    var missing = [];
    if (!choiceSelect.value) missing.push("kies 'n aksie");
    if (!dateInput.value) missing.push("kies 'n teikendatum");
    if (!ackCheckbox.checked)
      missing.push(
        "bevestig dat jy verstaan dit is riglyne, nie 'n SARS-besluit nie",
      );

    if (missing.length) {
      resultEl.innerHTML =
        "Doen asseblief die volgende: " + missing.join(", ") + ".";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var reminderChecked = document.querySelector(
      'input[name="tax-reminder"]:checked',
    );
    var reminderValue = reminderChecked ? reminderChecked.value : "none";

    var formattedDate = new Date(
      dateInput.value + "T00:00:00",
    ).toLocaleDateString("af-ZA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    resultEl.innerHTML =
      "Jou plan: <strong>" +
      actionLabels[choiceSelect.value] +
      "</strong> teen <strong>" +
      formattedDate +
      "</strong>.<br>" +
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  var whereText = {
    home: "van die huis of 'n werf af handel dryf",
    stall:
      "vanaf 'n stalletjie, tafel, sypaadjie of openbare ruimte handel dryf",
    shop: "vanuit 'n winkel of houer handel dryf",
    online: "aanlyn of per aflewering verkoop",
  };

  var whatText = {
    packaged: "verpakte goedere verkoop",
    food: "vars of voorbereide kos verkoop",
    services: "dienste aanbied",
    other: "iets anders verkoop",
  };

  var setupText = {
    sole: "Jy dryf tans handel as 'n eenmansaak.",
    partnership: "Jy dryf tans handel as 'n vennootskap.",
    company: "Jy het reeds 'n geregistreerde maatskappy.",
    unsure:
      "Jy is nog nie seker van jou besigheidstruktuur nie — dit is die moeite werd om vroeg uit te sorteer, aangesien dit belasting en aanspreeklikheid raak.",
  };

  function buildRecommendations(where, what) {
    var recs = [];

    if (where === "stall")
      recs.push(
        "gaan jou plaaslike munisipaliteit se permitvereistes vir informele handel na",
      );
    else if (where === "home")
      recs.push("gaan na of jou eiendom vir besigheidsgebruik gesoneer is");
    else if (where === "shop")
      recs.push(
        "gaan jou munisipale besigheidslisensievereistes vir 'n vaste perseel na",
      );
    else if (where === "online")
      recs.push(
        "gaan die Wet op Verbruikersbeskerming se reëls vir aanlyn- en afstandverkope na",
      );

    if (what === "food")
      recs.push(
        "ondersoek jou plaaslike Omgewingsgesondheidsdepartement se Sertifikaat van Aanvaarbaarheid (voedselveiligheidspermit)",
      );
    else if (what === "packaged")
      recs.push(
        "gaan na of jou etikettering aan die Wet op Voedingsmiddels, Skoonheidsmiddels en Ontsmettingsmiddels se reëls voldoen, waar van toepassing",
      );
    else if (what === "services")
      recs.push(
        "gaan na of jou tipe diens sy eie professionele registrasie of lisensie benodig",
      );

    recs.push(
      "registreer jou besigheid by CIPC as jy dit nog nie gedoen het nie, aangesien dit die grondslag vir alles anders lê",
    );

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
    var recList = recs
      .map(function (r) {
        return "<li>" + r.charAt(0).toUpperCase() + r.slice(1) + "</li>";
      })
      .join("");

    resultEl.innerHTML =
      '<p class="compliance-map-summary">Omdat jy ' +
      whereText[where] +
      " en " +
      whatText[what] +
      ", is dit wat jy eerste moet ondersoek:</p>" +
      '<ul class="compliance-map-list">' +
      recList +
      "</ul>" +
      '<span class="small">' +
      setupText[setup] +
      "</span>";
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
  readyMessage: "Mooi — dis 'n duidelike beeld van jou handelsmerk.",
  storageKey: "brandAwareBadge",
});

initReflection({
  inputId: "strategyStarterInput",
  messageId: "strategyStarterMessage",
  messageTextId: "strategyStarterMessageText",
  badgeSectionId: "strategyStarterBadgeSection",
  readyMessage: "Uitstekend — doel en visie is aangeteken.",
  storageKey: "strategyStarterBadge",
});

initReflection({
  inputId: "foundVoiceInput",
  messageId: "foundVoiceMessage",
  messageTextId: "foundVoiceMessageText",
  badgeSectionId: "foundVoiceBadgeSection",
  readyMessage: "Jy het jou slagspreuk gevind!",
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
  readyMessage: "Dis 'n stewige daaglikse struktuur.",
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
  readyMessage: "Dis 'n gewoonte wat die moeite werd is om te bou.",
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
  readyMessage: "Dis die begin van 'n stewige befondsingsvoorlegging.",
  storageKey: "pitchReadyBadge",
});

initReflection({
  inputId: "structureCheckInput",
  messageId: "structureCheckMessage",
  messageTextId: "structureCheckMessageText",
  badgeSectionId: "structureCheckBadgeSection",
  readyMessage:
    "Goed — die moeite werd om weer te besoek soos jou besigheid groei.",
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

  if (
    !primaryInput ||
    !secondaryInput ||
    !messageEl ||
    !messageTextEl ||
    !badgeSection
  )
    return; // not on this page

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

  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  var CORRECT_ANSWERS = ["A", "C", "D", "E", "G"];

  var CORRECT_MESSAGE =
    "Mooi werk! Jy hoef nie by CIPC geregistreer te wees om as 'n " +
    "Eenmansaak aan te sluit nie. Jy benodig jou persoonlike besonderhede, " +
    "verifikasie van jou Suid-Afrikaanse ID, 'n handelsadres, en 'n Suid-Afrikaanse " +
    "bankrekening in jou eie naam. Jy kan dan die kaartmasjien kies wat by jou besigheid pas.";

  var INCORRECT_MESSAGE =
    "Probeer weer. Onthou: Yoco laat Eenmansake toe om sonder " +
    "CIPC-registrasie aan te sluit. Fokus op die identiteits-, adres- en bankbesonderhede " +
    "wat nodig is om kaartbetalings op te stel.";

  function clearHighlights() {
    options.forEach(function (option) {
      option
        .closest(".quiz-option")
        .classList.remove("correct-answer", "incorrect-answer");
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
      CORRECT_ANSWERS.every(function (answer) {
        return selected.indexOf(answer) !== -1;
      });

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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  var COMPLETED_MESSAGE =
    "Jy het 'n kontakpunt vir befondsingsondersteuning gevind. Om ongeregistreer " +
    "te wees hoef jou nie te keer om jou opsies te verken nie. Jou volgende " +
    "stap is om die organisasie te kontak en te vra of jou besigheidsidee " +
    "aan hul vereistes voldoen.";

  var INCOMPLETE_MESSAGE =
    "Vul asseblief die organisasie, 'n spesifieke tak of kontakpunt, " +
    "jou dorp of area, 'n kontakmetode, 'n telefoonnommer of e-pos, en " +
    "een vraag wat jy die befondser sou vra, in.";

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

    if (
      hasOrg &&
      hasBranch &&
      hasTown &&
      hasMethod &&
      hasDetail &&
      hasQuestion
    ) {
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

  var situationOptions = document.querySelectorAll(
    ".employer-situation-option",
  );
  var checklistBlock = document.getElementById("employerChecklistBlock");
  var hiringBlock = document.getElementById("employerHiringBlock");
  var reflectionInput = document.getElementById("employerReflection");
  var hireDateInput = document.getElementById("hireDate");
  var resultEl = document.getElementById("fairEmployerResult");
  var badgeSection = document.getElementById("fairEmployerBadgeSection");

  var form = document.getElementById("fairEmployerForm");
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  situationOptions.forEach(function (option) {
    option.addEventListener("change", function () {
      checklistBlock.classList.toggle(
        "hidden",
        option.value !== "A" || !option.checked,
      );
      hiringBlock.classList.toggle(
        "hidden",
        option.value !== "B" || !option.checked,
      );
    });
  });

  btn.addEventListener("click", function () {
    var situation = document.querySelector(
      'input[name="employerSituation"]:checked',
    );

    if (!situation) {
      resultEl.textContent =
        "Kies asseblief die stelling wat jou besigheid vandag beskryf.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    var complete = false;
    var summary = "";

    if (situation.value === "A") {
      var uif = document.querySelector('input[name="req-uif"]:checked');
      var coida = document.querySelector('input[name="req-coida"]:checked');
      var payslips = document.querySelector(
        'input[name="req-payslips"]:checked',
      );
      var partTime = document.querySelector(
        'input[name="req-parttime"]:checked',
      );
      var hasReflection = reflectionInput.value.trim() !== "";

      complete = !!(uif && coida && payslips && partTime && hasReflection);
      summary = complete
        ? "Eerste vereiste om uit te sorteer: " + reflectionInput.value.trim()
        : "";
    } else if (situation.value === "B") {
      complete = hireDateInput.value.trim() !== "";
      summary = complete
        ? "Beplande aanstellingsdatum: " + hireDateInput.value
        : "";
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
      resultEl.textContent =
        "Voltooi asseblief die kontrolelys of aanstellingstelling voordat jy stoor.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!buyerName.value.trim() || !safetyRequirement.value.trim()) {
      resultEl.textContent =
        "Noem asseblief 'n spesifieke koper en teken een verskaffersvereiste of -vraag aan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor: " +
      buyerName.value.trim() +
      " — " +
      safetyRequirement.value.trim();
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!materialSelect.value || !proQuestion.value.trim()) {
      resultEl.textContent =
        "Kies asseblief 'n verpakkingsmateriaal en teken 'n vraag aan om te ondersoek.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Materiaal: " + materialSelect.value + " — Vraag aangeteken.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!nameSearched.value.trim() || !brandNextStep.value) {
      resultEl.textContent =
        "Voer asseblief die naam in wat jy gesoek het en kies 'n volgende stap.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gesoek: " +
      nameSearched.value.trim() +
      " — Volgende stap: " +
      brandNextStep.value;
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    if (!taxStatus.value || !bbeeStatus.value || !qualifiesEME.value) {
      resultEl.textContent =
        "Voltooi asseblief albei dokumentstatusse en jou EME-kontrole.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Belasting: " +
      taxStatus.value +
      " · B-BBEE: " +
      bbeeStatus.value +
      " · EME-kontrole: " +
      qualifiesEME.value;
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
      resultEl.textContent =
        "Merk asseblief ten minste een tipe data wat jy insamel en skryf 'n kort doelstelling.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      'Gestoor. "Ons gebruik jou persoonlike inligting slegs om ' +
      purposeStatement.value.trim() +
      '"';
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
    var chosenLabel = chosen
      ? chosen.value === "Other"
        ? otherText.value.trim()
        : chosen.value
      : "";

    if (
      !chosen ||
      (chosen.value === "Other" && !otherText.value.trim()) ||
      !researchInput.value.trim() ||
      !actionInput.value.trim()
    ) {
      resultEl.textContent =
        "Kies asseblief 'n groei-opsie en teken een navorsingsvraag en een volgende aksie aan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Groei-opsie: " +
      chosenLabel +
      " — Navorsing: " +
      researchInput.value.trim() +
      " — Volgende 7 dae: " +
      actionInput.value.trim();
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
    inputs.forEach(function (input) {
      if (input.checked) checked++;
    });

    var percent = total === 0 ? 0 : Math.round((checked / total) * 100);
    countEl.textContent = checked + " van " + total + " voltooi";
    percentEl.textContent = percent + "%";
    fillEl.style.width = percent + "%";
    barEl.setAttribute("aria-valuenow", percent);

    if (total > 0 && checked === total) {
      messageTextEl.textContent =
        "Mooi! Jou kombuis se basiese vereistes is gedek.";
      messageEl.classList.add("is-visible");
      localStorage.setItem("kitchenReadyBadge", "earned");
      showBadge();
    } else {
      messageEl.classList.remove("is-visible");
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener("change", update);
  });

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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  nutritionClaimSelect.addEventListener("change", function () {
    nutritionTableField.classList.toggle(
      "hidden",
      nutritionClaimSelect.value !== "Yes",
    );
  });

  btn.addEventListener("click", function () {
    var allChecked = true;
    presentSelects.forEach(function (select) {
      if (!select.value) allChecked = false;
    });

    if (!allChecked || !improvementInput.value.trim()) {
      resultEl.textContent =
        "Gaan asseblief al vyf etiketvereistes na en teken een verbetering aan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. Volgende verbetering: " + improvementInput.value.trim();
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
        resultEl.textContent =
          "Teken asseblief 'n temperatuurlesing aan en of die kos koud genoeg is.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }
      resultEl.textContent =
        "Aangeteken: " + tempReading.value + "°C — " + tempColdEnough.value;
      resultEl.classList.remove("hidden");
      resultEl.classList.remove("result-error");
      localStorage.setItem("coldChainBadge", "earned");
      showBadge();
    } else if (hasThermometerNo.checked) {
      if (!thermometerGetByDate.value || !thermometerCheckDate.value) {
        resultEl.textContent =
          "Stel asseblief 'n datum om 'n termometer te kry en 'n datum vir jou eerste kontrole.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }
      resultEl.textContent =
        "Plan gestoor: kry 'n termometer teen " +
        thermometerGetByDate.value +
        ", gaan na op " +
        thermometerCheckDate.value +
        ".";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
      resultEl.textContent =
        "Teken asseblief ten minste jouself aan, merk of bewys beskikbaar is, en voeg een aksie by.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. Volgende aksie: " + actionInput.value.trim();
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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

    if (
      !hasAtLeastOneProduct ||
      !riskProductName.value.trim() ||
      !riskQuestion.value.trim()
    ) {
      resultEl.textContent =
        "Lys asseblief ten minste een beplande produk en een vraag om te ondersoek.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. Onder ondersoek: " + riskProductName.value.trim();
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasItem = false;
    itemInputs.forEach(function (input) {
      if (input.value.trim() !== "") hasItem = true;
    });

    var hasAnswer = false;
    frontSelects.forEach(function (select) {
      if (select.value) hasAnswer = true;
    });

    var hasNo = false;
    frontSelects.forEach(function (select) {
      if (select.value === "No") hasNo = true;
    });

    if (!hasItem || !hasAnswer) {
      resultEl.textContent =
        "Gaan asseblief ten minste een item na en bevestig of die oudste voorraad voor staan.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (hasNo && !actionInput.value.trim()) {
      resultEl.textContent =
        "Jy het 'n item gemerk as nie FIFO-voldoenend nie. Teken asseblief die aksie aan wat jy geneem het.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. " +
      (actionInput.value.trim()
        ? "Aksie: " + actionInput.value.trim()
        : "Jou oudste voorraad is korrek geplaas.");
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var hasCompleteRow = false;
    for (var i = 0; i < itemInputs.length; i++) {
      if (
        itemInputs[i].value.trim() &&
        levelInputs[i].value.trim() &&
        reorderInputs[i].value.trim()
      ) {
        hasCompleteRow = true;
        break;
      }
    }

    if (!hasCompleteRow) {
      resultEl.textContent =
        "Voltooi asseblief ten minste een volledige ry: item, parvlak, en herbestelpunt.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent = "Parvlakke gestoor.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  soldOutYes.addEventListener("change", function () {
    logBlock.classList.remove("hidden");
  });
  soldOutNo.addEventListener("change", function () {
    logBlock.classList.add("hidden");
  });

  btn.addEventListener("click", function () {
    var choice = document.querySelector('input[name="anySoldOut"]:checked');

    if (!choice) {
      resultEl.textContent =
        "Kies asseblief of enigiets vandag uitverkoop het.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (choice.value === "yes") {
      var hasItem = false;
      itemInputs.forEach(function (input) {
        if (input.value.trim() !== "") hasItem = true;
      });

      if (!hasItem || !changeInput.value.trim()) {
        resultEl.textContent =
          "Teken asseblief ten minste een item aan wat uitverkoop het en een verandering vir volgende keer.";
        resultEl.classList.remove("hidden");
        resultEl.classList.add("result-error");
        return;
      }

      resultEl.textContent =
        "Gestoor. Volgende keer: " + changeInput.value.trim();
    } else {
      resultEl.textContent =
        "Niks het vandag uitverkoop nie. Hou môre aan om voorraad te volg en teken enige item aan wat opraak.";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
    if (
      !perishableItem.value.trim() ||
      !perishablePlan.value.trim() ||
      !dryItem.value.trim() ||
      !dryPlan.value.trim() ||
      !supplierItemName.value.trim()
    ) {
      resultEl.textContent =
        "Voltooi asseblief albei items met 'n bestellingsplan, en noem 'n item vir jou verskaffersvraag.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. Verskaffersvraag gereed vir: " + supplierItemName.value.trim();
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  nameInput.addEventListener("input", function () {
    namePreview.textContent = nameInput.value.trim() || "[besigheidsnaam]";
  });
  productsInput.addEventListener("input", function () {
    productsPreview.textContent = productsInput.value.trim() || "[produkte]";
  });
  hoursInput.addEventListener("input", function () {
    hoursPreview.textContent = hoursInput.value.trim() || "[ure]";
  });

  btn.addEventListener("click", function () {
    var allChecked = true;
    checks.forEach(function (select) {
      if (!select.value) allChecked = false;
    });

    if (
      !allChecked ||
      !nameInput.value.trim() ||
      !productsInput.value.trim() ||
      !hoursInput.value.trim()
    ) {
      resultEl.textContent =
        "Voltooi asseblief die kontrolelys en skryf jou groetboodskap se besonderhede.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Profiel gestoor vir " + nameInput.value.trim() + ".";
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var completeCount = 0;
    for (var i = 0; i < nameInputs.length; i++) {
      if (nameInputs[i].value.trim() && priceInputs[i].value.trim())
        completeCount++;
    }

    if (
      completeCount < 3 ||
      !shareMethod.value ||
      !updateFrequency.value.trim()
    ) {
      resultEl.textContent =
        "Voeg asseblief 'n naam en prys vir al drie items by, kies 'n deelmetode, en stel 'n opdateringsroetine.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Katalogus gestoor met 3 items. Deel via: " + shareMethod.value;
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

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
    if (
      !platformSelected.value ||
      !isLinked.value ||
      !whatCustomersCanDo.value.trim()
    ) {
      resultEl.textContent =
        "Kies asseblief 'n platform, bevestig jou skakelstatus, en verduidelik wat kliënte sal kan doen.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    if (isLinked.value !== "Yes" && !linkByDate.value) {
      resultEl.textContent =
        "Stel asseblief 'n datum waarteen jy jou rekening sal skakel.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. Platform: " +
      platformSelected.value +
      (isLinked.value === "Yes"
        ? " (reeds geskakel)"
        : " — skakel teen " + linkByDate.value);
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  dishInput.addEventListener("input", function () {
    dishPreview.textContent = dishInput.value.trim() || "[gereg]";
  });
  locationInput.addEventListener("input", function () {
    locationPreview.textContent = locationInput.value.trim() || "[ligging]";
  });
  priceInput.addEventListener("input", function () {
    pricePreview.textContent = priceInput.value.trim() || "[prys]";
  });

  btn.addEventListener("click", function () {
    var allChecked = true;
    checks.forEach(function (select) {
      if (!select.value) allChecked = false;
    });

    if (
      !allChecked ||
      !dishInput.value.trim() ||
      !locationInput.value.trim() ||
      !priceInput.value.trim()
    ) {
      resultEl.textContent =
        "Voltooi asseblief die fotokontrolelys en vul jou byskrifbesonderhede in.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Gestoor. Byskrif gereed vir: " + dishInput.value.trim();
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
  if (form)
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });

  function showBadge() {
    if (badgeSection.classList.contains("earned")) return;
    badgeSection.classList.remove("hidden");
    badgeSection.classList.add("earned");
    badgeSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  btn.addEventListener("click", function () {
    var completeCount = 0;
    for (var i = 0; i < textInputs.length; i++) {
      if (
        textInputs[i].value.trim() &&
        formatSelects[i].value &&
        whenInputs[i].value.trim()
      )
        completeCount++;
    }

    if (completeCount < 3 || !weeklyPostDay.value) {
      resultEl.textContent =
        "Voeg asseblief drie volledige plasingsidees by en kies 'n weeklikse plasingsdag.";
      resultEl.classList.remove("hidden");
      resultEl.classList.add("result-error");
      return;
    }

    resultEl.textContent =
      "Ideebank gestoor. Plasing elke " + weeklyPostDay.value + ".";
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

  function showCongratsToast() {
    var badgeNames = getEarnedBadgeNames();

    var overlay = document.createElement("div");
    overlay.className = "page-complete-overlay";

    var badgeListHtml = "";
    if (badgeNames.length) {
      badgeListHtml =
        '<ul class="page-complete-badge-list">' +
        badgeNames
          .map(function (name) {
            return "<li>" + name + "</li>";
          })
          .join("") +
        "</ul>";
    }

    var modal = document.createElement("div");
    modal.className = "page-complete-modal";
    modal.setAttribute("role", "status");
    modal.setAttribute("aria-live", "polite");
    modal.innerHTML =
      '<div class="page-complete-icon">🎉</div>' +
      "<h2>Mooi werk!</h2>" +
      "<p>Jy het elke uitdaging op hierdie bladsy voltooi en verdien:</p>" +
      badgeListHtml +
      '<button type="button" class="btn btn-primary page-complete-close">Gaan voort</button>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    requestAnimationFrame(function () {
      overlay.classList.add("is-visible");
    });

    function dismiss() {
      overlay.classList.remove("is-visible");
      setTimeout(function () {
        overlay.remove();
      }, 400);
    }

    modal
      .querySelector(".page-complete-close")
      .addEventListener("click", dismiss);
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
    note.textContent =
      "Kry 'n PDF-afskrif van alles wat jy op hierdie bladsy ingevul het.";

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
    var titleEl =
      container.querySelector(".checklist-intro h2") ||
      container.querySelector("h2");
    var title = titleEl ? titleEl.textContent.trim() : "Uitdaging";

    var promptEl =
      container.querySelector(".checklist-intro .lead") ||
      container.querySelector(".lead");
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
    container
      .querySelectorAll(".requirement-table, table")
      .forEach(function (table) {
        if (
          table.closest(".example-answer") ||
          table.classList.contains("example-table")
        )
          return;

        var headers = Array.prototype.map.call(
          table.querySelectorAll("thead th"),
          function (th) {
            return th.textContent.trim();
          },
        );

        var rows = [];
        table.querySelectorAll("tbody tr").forEach(function (tr) {
          var cells = tr.querySelectorAll("td");
          var hasContent = false;
          var rowValues = Array.prototype.map.call(cells, function (td) {
            var input = td.querySelector("input, select, textarea");
            var val = "";
            if (input) {
              if (input.tagName === "SELECT") val = valueForSelect(input);
              else if (input.type === "checkbox" || input.type === "radio")
                val = input.checked ? "Ja" : "";
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
      var group = container.querySelectorAll(
        'input[type="radio"][name="' + CSS.escape(name) + '"]',
      );
      var checked = Array.prototype.find.call(group, function (r) {
        return r.checked;
      });
      if (checked) {
        var lbl = checked.closest("label");
        var text = lbl ? lbl.textContent.trim() : name;
        qa.push({ question: "Wat het jy gekies?", answer: text });
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
      'input[type="text"], input[type="number"], input[type="date"], input[type="time"], input[type="color"], textarea, select',
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
    var containers = document.querySelectorAll(
      ".checklist-card, .challenge-box",
    );
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
  // !! IMPORTANT !! Replace this entire line with the VUKA_LOGO_DATA_URL line
  // from your ORIGINAL file. Nothing in it is translatable text, and a single
  // altered character will break the logo in the PDF.
  var VUKA_LOGO_DATA_URL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAEuCAMAAAAp7VMSAAADAFBMVEVMaXGx1NT////p5dX7///////////+8rb56tPBqXv8tAP///+qyMj3/Pz8uQP9qAiLs7X6/f37pgX//ubz+Pj8ogX5uQX//eDS4OHo8fL5sQb/+NO6z8/////4tQf///3//vr///D75Z7///Rckpbf6ur/+tj/+NL7rQ/8rQP///j6qQgoaGn6kAb9/fz+//6UtbT60Xv92XP6x2r75qH755qcsrP63IP////6kBPH2tmNt7n41IXF3+L41o/7lRn4ogf/+M/64Ix8mZv+78D+98n+9MH53ZL95ZP87LD988H86bj867v4phOqysrS4+Olw8P5wHf7fhH52Zn5iQebu7z+8MeMs7T+8b397rD53ajO3t75yonB1db8nwjd6uv867Pi7e7S4eLE2Nirx8e0zs/63aeyzc/+76irxsf866765aL+9tP3yXXC09PV5ua81tfJ4OH75K74nQP71pDf7u7S5eX66Lfy+fq+1tb6462vycn75q3E2Nj52pb3yJT8rV/6zAT636W209bS5ub99br74aH52pL52IPznQP60qX887z6v4P////////+ghj/tgn/tAj/qAz/uwf/uAf/rAn/vgb/uwv+qgj+vAb/xAn/qhD+ow7/vQn/pQ3+wgr+ug//sgr/1gb+sAf9twf/qAf/lxv/lQv+zQf+txD+oxj/uQv/hBv/mwj+xwn9qwr+vA3+nxv+shH+pQf9rgv+rRX9ugj/vwv+kgv9qg/+pxj/qhb/0Af/oAb+lwn9vwr7vQj+1Ab/nR/+nBn/lx/7uBD+ygj+mRn+jg3/rgv+hRT+lg/+oBfu9/f+pxL9vhD9swn9pQv+iBL+ig71+/zx+Pj5///+rhD+shX8tBD/owj+y1v9myD8lQ78hRr/vz//2Vj+0Gr/y0j/uTL+whz/yzD/xVH/1E3+tSf/3mn/yTn/1mH+3Xz+wy7/yCP/0j/8vSD+iCD7txj9u2b+pzP9nyn9rSH/rUH/tVH/5YT/5XP/nkL/ki//4zb+2SD/7lvaTmr/AAAA+nRSTlMABPwFAvz9AwEC/CArDf3+NxL8Uwj8/V/5/PxzsRb8LTNH3j8O/Gp9/vw5/Rj9HChv+/790eqb+ST+khrvK979/YjuY4eVq+T5wKGjlf49xln7/ND8S2AmuM3L7+vR/dm159a6c3u7ZeeS3MNM6+mkVWuw/PmtlXvjiaCkqKS+1f79k0R/wa+rx/ui+7b////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////+PVuHDgAAAAlwSFlzAAALEgAACxIB0t1+/AAAIABJREFUeNrtvQlcVPe5+H1g5sMsyBBZ4xCGLSJLwctWpFJA/iii0sSlVo0hZjOJS5Kqrb02e5q0vfflEwQUCWKwYlJCEkbFIWgbpjGTxBpZGhUpKpsCsijB3aQ37/P8zpkFmHNmRUDPE0U0OsDwnWdfKOruFRG1dCnlQPHCy9iIgErbQEn454GXMRIJ9XYc/yzwMoYSmMg/B7yMoaRH+VFC/mngZazkT7fdwRPkhZcxkvWtwRAL88LL2MQgovWX5/FhMC/UWKUBw2LOZ/AA8kKNVRrQvbcklgeQlzHTgMGt5X/iAeRlzACc3Z7PA8jL2AG44LI0fgafCORlrKLgeT3yW0F8HoaXsQIw44LiIg8gL2MG4NpLitZZPIC8jBmA5xVdy3gAeRkrAP/0nvTCKh5AXsYOQMWlDTyAvIyJCKnpUTKv83/kAeSFGps0YNAthVddkgcl5p8MXsYEwGipWjF3Op+J5mVsAAy4qFApovmeaF7GrBdBmifrdeedQF7GBsBpXQBgqw8PIC9jA+C8dgCwazY/FcLL2AA4p0daLr28gAeQl7EBcNUFqUp64Q3eBPMyNgC+fUmqKr30R74llZexA1ClifPlM9G8jIGIqVfOqwDA+DA+EciLGbwI7M2fb3oJAKi47W3/KETII03djd0D9n20GZvqVWqV4qKP3QEUS3ijftfZy0gfDzsDOL1vTzkA2DrN3gAKqTC+vnfXRQz+/2vfkoWQ8m/bk69SSS/bG0Ax5bImjc/tUHdd//xcf3uqFRHsRZCWA4AXNtsZQJg3nsvX9+4+Feh9e609M3bQi9CMAJZeWmXfRCCQfStxMp/aues0oHNqb7AddZWAmtUlLy9XldYF2rUlVUxNDmydwye370IC5/fAPlOJ/QCcfVkKAOaXpLrYE0AJNburOYC3wNTdt8vK++LAWwK7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";

  function generateResponsesPdf() {
    if (!window.jspdf) {
      alert(
        "Jammer, die PDF-hulpmiddel het nie gelaai nie. Herlaai asseblief die bladsy en probeer weer.",
      );
      return;
    }

    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF();
    var pageWidth = doc.internal.pageSize.getWidth();
    var pageHeight = doc.internal.pageSize.getHeight();
    var moduleTitle = getModuleTitle();
    var date = new Date().toLocaleDateString("en-ZA");
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
      doc.text("Afgelaai op " + date, pageWidth - margin, 18, {
        align: "right",
      });

      var y = 40;

      doc.setTextColor(6, 72, 70);
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      var titleLines = doc.splitTextToSize(
        sanitizeForPdf(moduleTitle),
        maxTextWidth,
      );
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
          var questionLines = doc.splitTextToSize(
            sanitizeForPdf(pair.question),
            maxTextWidth,
          );
          var answerLines = doc.splitTextToSize(
            sanitizeForPdf(String(pair.answer)),
            maxTextWidth - 4,
          );
          var blockHeight =
            questionLines.length * 5.5 + answerLines.length * 5.5 + 10;

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
            styles: {
              fontSize: 9,
              cellPadding: 3,
              textColor: [50, 50, 50],
              overflow: "linebreak",
            },
            headStyles: {
              fillColor: [6, 72, 70],
              textColor: [255, 255, 255],
              fontStyle: "bold",
            },
            alternateRowStyles: { fillColor: [242, 238, 235] },
          });

          y = doc.lastAutoTable.finalY + 12;
        });

        y += 4;
      });

      if (!sections.length) {
        doc.setFontSize(11);
        doc.setTextColor(95, 95, 95);
        doc.text(
          "Geen antwoorde is gevind om in hierdie PDF in te sluit nie.",
          margin,
          y,
        );
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
          { align: "right" },
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
