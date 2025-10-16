import { useState, useEffect } from "react";
import { ChefHat, Clock, Flame, UtensilsCrossed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Ingredient {
  name: string;
  amount?: string;
}

interface Preferences {
  cuisineType: string[];
  calorieRange: [number, number];
  timeRange: [number, number];
}

interface Recipe {
  id: string;
  title: string;
  cuisineType: string;
  prepTime: number;
  calories: number;
  ingredients: string[];
  equipment: string[];
  instructions: string[];
  description: string;
}

interface RecipeResultsProps {
  ingredients: Ingredient[];
  equipment: string[];
  preferences: Preferences;
  commonSeasonings: string[];
  onRecipeSelect: (recipeId: string) => void;
  onStartOver: () => void;
}

const RecipeResults = ({ 
  ingredients, 
  equipment, 
  preferences,
  commonSeasonings,
  onRecipeSelect,
  onStartOver 
}: RecipeResultsProps) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    generateRecipes();
  }, []);

  const generateRecipes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: {
          ingredients: ingredients.map(i => i.name),
          equipment,
          preferences,
          commonSeasonings,
        },
      });

      if (error) throw error;

      const recipesWithIds = data.recipes || [];
      setRecipes(recipesWithIds);
      // Store recipes in sessionStorage for RecipeDetail to access
      sessionStorage.setItem("generatedRecipes", JSON.stringify(recipesWithIds));
    } catch (error: any) {
      console.error("Error generating recipes:", error);
      toast({
        title: "Error generating recipes",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRecipes = async () => {
    setLoadingMore(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: {
          ingredients: ingredients.map(i => i.name),
          equipment,
          preferences,
          commonSeasonings,
        },
      });

      if (error) throw error;

      const newRecipes = data.recipes || [];
      const updatedRecipes = [...recipes, ...newRecipes];
      setRecipes(updatedRecipes);
      // Update sessionStorage with all recipes
      sessionStorage.setItem("generatedRecipes", JSON.stringify(updatedRecipes));
      
      toast({
        title: "More recipes loaded!",
        description: `Added ${newRecipes.length} new recipe options`,
      });
    } catch (error: any) {
      console.error("Error loading more recipes:", error);
      toast({
        title: "Error loading more recipes",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">Cooking up some recipe ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-2 text-foreground">Your Recipes</h2>
          <p className="text-muted-foreground text-lg mb-4">
            We found {recipes.length} delicious recipes for you
          </p>
          <Button variant="outline" onClick={onStartOver}>
            Start Over
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <Card
              key={recipe.id}
              className="p-6 shadow-card bg-gradient-card hover:shadow-xl transition-all cursor-pointer animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onRecipeSelect(recipe.id)}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2 text-foreground">{recipe.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.prepTime} min
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {recipe.calories} kcal
                </Badge>
                <Badge variant="outline">{recipe.cuisineType}</Badge>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Ingredients needed:</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.slice(0, 5).map((ing, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {ing}
                    </Badge>
                  ))}
                  {recipe.ingredients.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.ingredients.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button className="w-full" variant="default">
                View Recipe
              </Button>
            </Card>
          ))}
        </div>

        {recipes.length > 0 && (
          <div className="mt-8 text-center">
            <Button 
              onClick={loadMoreRecipes} 
              disabled={loadingMore}
              variant="outline"
              size="lg"
              className="min-w-[200px]"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading More...
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4 mr-2" />
                  Show More Recipes
                </>
              )}
            </Button>
          </div>
        )}

        {recipes.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-4">
              No recipes found with your current criteria
            </p>
            <Button onClick={onStartOver} variant="hero">
              Try Different Ingredients
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeResults;
