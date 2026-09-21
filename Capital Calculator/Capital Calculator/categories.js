const cards = document.querySelectorAll(".card");
const nextBtn = document.getElementById("nextBtn");

const foodBtn = document.getElementById("foodBtn");
const beverageBtn = document.getElementById("beverageBtn");

const instruction = document.getElementById("instruction");

const strCalculator = document.getElementById("strCalculator");

let selectedCategory = "";

foodBtn.addEventListener("click", () => {
  instruction.style.display = "block";
  cards.forEach((card) => {
    if (card.dataset.category === "drinks") {
      card.style.display = "none";
    } else {
      card.style.display = "block";
    }
  });
  cards.forEach((card) => {
    card.classList.remove("blur");
    card.classList.remove("selected");
  });
  nextBtn.disabled = true;
});

beverageBtn.addEventListener("click", () => {
  instruction.style.display = "none";
  cards.forEach((card) => {
    if (card.dataset.category === "drinks") {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
  cards.forEach((card) => {
    card.classList.remove("blur");
    card.classList.remove("selected");
  });
  nextBtn.disabled = true;
});

cards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedCategory = card.dataset.category;
    localStorage.setItem("category", selectedCategory);
    cards.forEach((c) => {
      c.classList.remove("selected");
      c.classList.add("blur");
    });
    card.classList.remove("blur");
    card.classList.add("selected");
    nextBtn.disabled = false;
  });
});

nextBtn.addEventListener("click", () => {
  location.href = "meals.html";
});

strCalculator.addEventListener("click", () => {
  localStorage.removeItem("category");
  localStorage.removeItem("meal");
  location.href = "calculator.html";
});
