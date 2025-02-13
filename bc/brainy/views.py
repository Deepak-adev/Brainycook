from django.http import JsonResponse
import requests
from .utils import fetch_recipe_by_name, fetch_random_recipe

def search_recipes(request):
    query = request.GET.get('query', '')
    recipes = fetch_recipe_by_name(query)
    return JsonResponse(recipes, safe=False)

def random_recipe(request):
    recipe = fetch_random_recipe()
    return JsonResponse(recipe, safe=False)

from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login, authenticate
from django.contrib import messages
from .models import SavedRecipe, Recipe



def register_view(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save() 
            messages.success(request, 'Registration complete! You can now login.')
            return redirect('login')  
        else:
            messages.error(request, 'Error: Unable to register. Please check the form.')
    else:
        form = UserCreationForm()

    return render(request, 'register.html', {'form': form})




def login_view(request):
    print("🚀 login_view function triggered")  # Debugging
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        print(f"🔍 Attempting login with: {username}, {password}")  # Debugging

        user = authenticate(request, username="keerthi", password="keer12")
        print(user)
        if user is not None:
            print("✅ Authentication successful!")  # Debugging
            login(request, user)
            return redirect('home')
        else:
            print("❌ Authentication failed!")  # Debugging
            messages.error(request, 'Invalid credentials. Please try again.')

    return render(request, 'login.html')



def home_view(request):
    return render(request, 'home.html')  
from django.shortcuts import render

import google.generativeai as genai
from django.shortcuts import render
from django.conf import settings

# Configure Gemini API with your API key
genai.configure(api_key=settings.GEMINI_API_KEY)

# Function to call Gemini AI and generate recipes
import google.generativeai as genai
from django.shortcuts import render
from django.conf import settings

# Configure Gemini API with your API key
genai.configure(api_key=settings.GEMINI_API_KEY)

# Function to get recipes from ingredients
def get_recipes_from_ingredients(ingredients):
    try:
        model = genai.GenerativeModel("gemini-pro")  # Use the correct Gemini model
        response = model.generate_content(f"""
        You are a professional chef AI. Suggest **at least 50 unique recipes** based on these ingredients: {ingredients}.
        
        For each recipe, provide:
        - Name
        - Image URL (if possible)
        - List of ingredients
        - Cooking instructions
        - Nutritional info (calories, protein, carbs, fat)
        - Diet type (Vegan, Keto, etc.)

        Format the response in structured JSON.
        """)

        return response.text  # Convert AI response to text (or JSON if possible)

    except Exception as e:
        return {"error": str(e)}

# Recipe search view
def search_recipes_view(request):
    recipes = None
    if request.method == "POST":
        ingredients = request.POST.get("ingredients")  # Get user input
        recipes = get_recipes_from_ingredients(ingredients)  # Call Gemini API
    return render(request, "gsearch.html", {"recipes": recipes})


def recipe_detail_view(request, recipe_name):
    # Fetch detailed information for the selected recipe
    prompt = f"Provide a detailed recipe for {recipe_name}, including ingredients, steps, and nutrition."
    response = genai.generate_text(prompt=prompt)

    recipe_details = response.text  # Adjust this based on the Gemini response

    return render(request, "recipe_detail.html", {"recipe": recipe_details})

def save_recipe(request):
    if request.method == "POST":
        recipe_id = request.POST.get("recipe_id")
        recipe = Recipe.objects.get(id=recipe_id)  # Adjust based on your model

        saved_recipe, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
        if created:
            saved_recipe.save()
    
    return redirect("saved_recipes")

def index(request):
    return render(request, 'brainy/search.html')

from django.shortcuts import render

def recipe_view(request):
    meal_id = request.GET.get('mealID')
    if not meal_id:
        return render(request, '404.html')  # Handle missing mealID
    return render(request, 'recipe.html', {'meal_id': meal_id})
