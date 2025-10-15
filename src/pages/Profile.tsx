import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, ChefHat, LogOut, Home, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [cookedRecipes, setCookedRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    fetchProfile(user.id);
    fetchCookedRecipes(user.id);
    fetchSavedRecipes(user.id);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) setProfile(data);
    setLoading(false);
  };

  const fetchCookedRecipes = async (userId: string) => {
    const { data } = await supabase
      .from("cooked_recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) setCookedRecipes(data);
  };

  const fetchSavedRecipes = async (userId: string) => {
    const { data } = await supabase
      .from("saved_recipes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) setSavedRecipes(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteSavedRecipe = async (id: string) => {
    const { error } = await supabase
      .from("saved_recipes")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSavedRecipes(savedRecipes.filter((r) => r.id !== id));
      toast({ title: "Recipe removed" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Card className="p-8 bg-card">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
              <ChefHat className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {profile?.display_name || "Chef"}
              </h1>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold text-foreground">
                    Level {profile?.level || 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold text-foreground">
                    {profile?.total_points || 0} points
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress to Level {(profile?.level || 1) + 1}</span>
              <span>
                {profile?.total_points % 100}/100 pts
              </span>
            </div>
            <div className="h-3 bg-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(profile?.total_points % 100)}%` }}
              />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="cooked" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cooked">Cooked Recipes</TabsTrigger>
            <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
          </TabsList>

          <TabsContent value="cooked" className="space-y-4">
            {cookedRecipes.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <p className="text-muted-foreground">No recipes cooked yet. Start cooking!</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {cookedRecipes.map((recipe) => (
                  <Card key={recipe.id} className="p-6 bg-card">
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {recipe.recipe_data.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < recipe.rating ? "fill-primary text-primary" : "text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span>+{recipe.points_earned} pts</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(recipe.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-4">
            {savedRecipes.length === 0 ? (
              <Card className="p-8 text-center bg-card">
                <p className="text-muted-foreground">No saved recipes yet.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {savedRecipes.map((recipe) => (
                  <Card key={recipe.id} className="p-6 bg-card">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {recipe.recipe_data.name}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSavedRecipe(recipe.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {recipe.recipe_data.cookTime} • {recipe.recipe_data.calories} cal
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Saved {new Date(recipe.created_at).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
