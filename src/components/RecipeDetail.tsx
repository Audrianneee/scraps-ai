import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft, Clock, Flame, MessageSquare, Send, Check, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  imageUrl?: string;
}

interface RecipeDetailProps {
  recipeId: string;
  onBack: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const RecipeDetail = ({ recipeId, onBack }: RecipeDetailProps) => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would fetch from a database
    // For now, we'll get it from sessionStorage set by RecipeResults
    const storedRecipes = sessionStorage.getItem("generatedRecipes");
    if (storedRecipes) {
      const recipes = JSON.parse(storedRecipes);
      const foundRecipe = recipes.find((r: Recipe) => r.id === recipeId);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      }
    }
  }, [recipeId]);

  const handleSaveRecipe = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save recipes",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from("saved_recipes").insert([{
      user_id: user.id,
      recipe_data: recipe as any,
    }]);

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Recipe saved!",
        description: "You can find it in your profile",
      });
    }
  };

  const handleFinishCooking = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to track your progress",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    navigate("/completion", { state: { recipe } });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !recipe) return;

    const userMessage: Message = { role: "user", content: currentMessage };
    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoadingChat(true);

    try {
      const { data, error } = await supabase.functions.invoke("recipe-chat", {
        body: {
          recipeTitle: recipe.title,
          recipeInstructions: recipe.instructions,
          recipeIngredients: recipe.ingredients,
          messages: [...messages, userMessage],
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Error in chat:", error);
      toast({
        title: "Chat error",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Recipes
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveRecipe} disabled={isSaving}>
              <Bookmark className="w-4 h-4 mr-2" />
              Save Recipe
            </Button>
            <Button onClick={handleFinishCooking}>
              <Check className="w-4 h-4 mr-2" />
              Finish Cooking
            </Button>
          </div>
        </div>

        <div className="animate-slide-in">
          {recipe.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 text-foreground">
              {recipe.title}
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {recipe.description}
            </p>
            <div className="flex flex-wrap gap-2">
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
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 shadow-card bg-gradient-card">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-foreground">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 shadow-card bg-gradient-card">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Equipment
              </h2>
              <ul className="space-y-2">
                {recipe.equipment.map((equip, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-foreground">{equip}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card className="p-6 shadow-card bg-gradient-card mb-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Instructions
            </h2>
            <ol className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-bold text-primary mr-3">
                    {index + 1}.
                  </span>
                  <span className="text-foreground">{instruction}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6 shadow-card bg-gradient-card">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">
                Ask Questions About This Recipe
              </h2>
            </div>

            <ScrollArea className="h-64 mb-4 p-4 rounded-lg bg-muted/30">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Ask me anything about this recipe! I can help with substitutions,
                  techniques, or clarify any steps.
                </p>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about this recipe..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoadingChat}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isLoadingChat}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
