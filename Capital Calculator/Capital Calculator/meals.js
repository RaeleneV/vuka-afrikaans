const category = localStorage.getItem("category");
const mealContainer = document.getElementById("mealContainer");
const title = document.getElementById("categoryTitle");
const nextBtn = document.getElementById("nextBtn");

title.textContent = foodData[category].title;

foodData[category].meals.forEach((meal) => {
  mealContainer.innerHTML += ` 
        <div class="card meal-card" data-id="${meal.id}">
            <img src="${meal.image}">
            <h2>${meal.name}</h2>
        </div>
    `;
});

const cards = document.querySelectorAll(".meal-card");

cards.forEach((card) => {
  card.onclick = () => {
    cards.forEach((c) => {
      c.classList.remove("selected");
      c.classList.add("blur");
    });
    card.classList.remove("blur");
    card.classList.add("selected");
    localStorage.setItem("meal", card.dataset.id);
    nextBtn.disabled = false;
  };
});

nextBtn.onclick = () => {
  location.href = "calculator.html";
};
