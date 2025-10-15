import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import RecipeDetail from "@/components/RecipeDetail";

const RecipeView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipeId, setRecipeId] = useState<string | null>(null);

  useEffect(() => {
    // Get recipes from sessionStorage
    const storedRecipes = sessionStorage.getItem("generatedRecipes");
    
    if (storedRecipes) {
      const recipes = JSON.parse(storedRecipes);
      // Find the recipe with matching id or use the first one
      const recipe = recipes.find((r: any) => r.id === id) || recipes[0];
      if (recipe) {
        setRecipeId(recipe.id || id || "0");
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [id, navigate]);

  if (!recipeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading recipe...</p>
      </div>
    );
  }

  return (
    <RecipeDetail
      recipeId={recipeId}
      onBack={() => navigate(-1)}
    />
  );
};

export default RecipeView;
