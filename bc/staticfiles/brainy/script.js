const searchBtn = document.getElementById("search-btn");
const mealList = document.getElementById("meal");
const mealDetailsContent = document.querySelector(".meal-details-content");
const recipeCloseBtn = document.getElementById("recipe-close-btn");

const API_KEY = "8fec620392384f819c73a5e188f16c36"; // Replace with your Spoonacular API key

// Initialize Zapier Chatbot
function initZapierChatbot() {
    // Create and append the script
    const zapierScript = document.createElement('script');
    zapierScript.async = true;
    zapierScript.type = 'module';
    zapierScript.src = 'https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js';
    document.head.appendChild(zapierScript);

    // Create and append the chatbot element
    const chatbotElement = document.createElement('zapier-interfaces-chatbot-embed');
    chatbotElement.setAttribute('is-popup', 'true');
    chatbotElement.setAttribute('chatbot-id', 'cm7262k2p0041bm8jff2n44bc');
    document.body.appendChild(chatbotElement);
}

// Call the initialization function when the page loads
document.addEventListener('DOMContentLoaded', initZapierChatbot);

// Event Listeners
searchBtn.addEventListener("click", getMealList);
mealList.addEventListener("click", getMealRecipe);
recipeCloseBtn.addEventListener("click", () => {
    mealDetailsContent.parentElement.classList.remove("showRecipe");
});

// Get meal list based on multiple ingredients
async function getMealList() {
    let searchInputTxt = document.getElementById("search-input").value.trim();

    if (!/^[A-Za-z\s,]+$/.test(searchInputTxt)) {      
        mealList.innerHTML = `<p>❌ Only letters are allowed! No numbers or special characters.</p>`;
        return;
    }
    if (searchInputTxt === "") {
        mealList.innerHTML = `<p>Please enter at least one ingredient.</p>`;
        return;
    }

    let ingredients = searchInputTxt.split(",").map(ing => ing.trim()).join(",");

    try {
        let response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=10&apiKey=${API_KEY}`);
        let data = await response.json();

        let html = "";
        if (data.length > 0) {
            data.forEach(meal => {
                html += `
                    <div class="meal-item" data-id="${meal.id}">
                        <div class="meal-img">
                            <img src="${meal.image}" alt="food">
                        </div>
                        <div class="meal-name">
                            <h3>${meal.title}</h3>
                            <a href="#" class="recipe-btn">Get Recipe</a>
                        </div>
                    </div>
                `;
            });
            mealList.classList.remove("notFound");
        } else {
            html = "<p>😞 No meals found with these ingredients.</p>";
            mealList.classList.add("notFound");
        }

        mealList.innerHTML = html;
    } catch (error) {
        mealList.innerHTML = `<p>⚠️ Error fetching meal data. Please try again.</p>`;
        console.error("API Error:", error);
    }
}

// Get detailed recipe
async function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains("recipe-btn")) {
        let mealItem = e.target.parentElement.parentElement;
        let mealId = mealItem.dataset.id;

        try {
            let response = await fetch(`https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${API_KEY}`);
            let meal = await response.json();

            let html = `
                <h2 class="recipe-title">${meal.title}</h2>
                <p class="recipe-category">${meal.dishTypes ? meal.dishTypes.join(", ") : "N/A"}</p>
                <div class="recipe-instruct">
                    <h3>Instructions:</h3>
                    <p>${meal.instructions ? meal.instructions.substring(0, 200) + "..." : "No instructions available."}</p>
                </div>
                <div class="recipe-meal-img">
                    <img src="${meal.image}" alt="">
                </div>
                <div class="recipe-link">
                    <a href="${meal.sourceUrl}" target="_blank">View Full Recipe</a>
                </div>
                <button class="view-full-recipe-btn" onclick="viewFullRecipe(${meal.id})">View Full Recipe</button>
            `;

            mealDetailsContent.innerHTML = html;
            mealDetailsContent.parentElement.classList.add("showRecipe");
        } catch (error) {
            mealDetailsContent.innerHTML = `<p>⚠️ Error loading recipe details.</p>`;
            console.error("API Error:", error);
        }
    }
}

// Redirect to full recipe page
function viewFullRecipe(mealID) {
    window.location.href = `recipe.html?mealID=${mealID}`;
}
// Save Recipe to LocalStorage
document.querySelector(".save-btn")?.addEventListener("click", async function () {
    // Get recipe details dynamically
    const recipeName = document.querySelector(".meal-name h3")?.innerText ?? "";
    const recipeImage = document.querySelector(".meal-img img")?.src ?? "";
    const recipeInstructions = document.querySelector(".recipe-instruct p")?.innerText ?? "";

    const recipeData = {
        name: recipeName,
        image: recipeImage,
        instructions: recipeInstructions
    };

    // Get saved recipes from localStorage or initialize to an empty array
    const savedRecipes = JSON.parse(localStorage.getItem("savedRecipes") ?? "[]");

    // Add new recipe to the saved recipes array
    savedRecipes.push(recipeData);

    // Save back to localStorage
    localStorage.setItem("savedRecipes", JSON.stringify(savedRecipes));

    alert("Recipe saved successfully!");

    // After saving, navigate to the "Viewed Recipes" section (header)
    window.location.href = "#saved-recipes-container";  // Or the correct ID or route
});

