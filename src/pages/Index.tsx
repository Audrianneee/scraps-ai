import { useState } from "react";
import { ChefHat, Sparkles, Clock, Flame, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-food.jpg";
import IngredientInput from "@/components/IngredientInput";
import PreferenceSelector from "@/components/PreferenceSelector";
import RecipeResults from "@/components/RecipeResults";
import RecipeDetail from "@/components/RecipeDetail";
import RecipeChat from "@/components/RecipeChat";

type Step = "welcome" | "ingredients" | "preferences" | "results" | "recipe-detail" | "chat";

interface Ingredient {
  name: string;
  amount?: string;
}

interface Preferences {
  cuisineType: string[];
  calorieRange: [number, number];
  timeRange: [number, number];
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<Preferences>({
    cuisineType: [],
    calorieRange: [0, 1000],
    timeRange: [0, 120],
  });
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [commonSeasonings, setCommonSeasonings] = useState<string[]>([]);

  const handleGetStarted = () => {
    setCurrentStep("ingredients");
  };

  const handleIngredientsComplete = (ings: Ingredient[], equip: string[], seasonings: string[]) => {
    setIngredients(ings);
    setEquipment(equip);
    setCommonSeasonings(seasonings);
    setCurrentStep("preferences");
  };

  const handlePreferencesComplete = (prefs: Preferences) => {
    setPreferences(prefs);
    setCurrentStep("results");
  };

  const handleRecipeSelect = (recipeId: string) => {
    setSelectedRecipeId(recipeId);
    setCurrentStep("recipe-detail");
  };

  const handleBackToResults = () => {
    setCurrentStep("results");
  };

  const handleStartOver = () => {
    setCurrentStep("ingredients");
    setIngredients([]);
    setEquipment([]);
    setSelectedRecipeId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === "welcome" && (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Hero Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className="absolute inset-0 bg-white" />
          
          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-6">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              Left OverCook
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your leftover ingredients into delicious, creative recipes tailored just for you.
              Eliminate food waste while discovering amazing meals.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">AI-Powered Recipes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Reduce Food Waste</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Calorie Tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Zero Waste Cooking</span>
              </div>
            </div>
            
            <Button 
              variant="hero" 
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6 h-auto"
            >
              Get Started
              <ChefHat className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {currentStep === "ingredients" && (
        <IngredientInput onComplete={handleIngredientsComplete} />
      )}

      {currentStep === "preferences" && (
        <PreferenceSelector onComplete={handlePreferencesComplete} />
      )}

      {currentStep === "results" && (
        <RecipeResults
          ingredients={ingredients}
          equipment={equipment}
          preferences={preferences}
          commonSeasonings={commonSeasonings}
          onRecipeSelect={handleRecipeSelect}
          onStartOver={handleStartOver}
        />
      )}

      {currentStep === "recipe-detail" && selectedRecipeId && (
        <RecipeDetail
          recipeId={selectedRecipeId}
          onBack={handleBackToResults}
        />
      )}

      {currentStep === "chat" && selectedRecipeId && (
        <RecipeChat
          recipeId={selectedRecipeId}
          onBack={handleBackToResults}
        />
      )}
    </div>
  );
};

export default Index;
