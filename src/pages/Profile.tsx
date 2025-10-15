import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Settings, Trophy, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [cookedRecipes, setCookedRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    
    await Promise.all([
      fetchProfile(user.id),
      fetchCookedRecipes(user.id),
      fetchSavedRecipes(user.id),
      fetchLeaderboard()
    ]);
    
    setLoading(false);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (data) {
      setProfile(data);
      setNewUsername(data.username || "");
    }
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

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, username, total_points")
      .order("total_points", { ascending: false })
      .limit(10);
    
    if (data) setLeaderboard(data);
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
      toast({
        title: "Recipe deleted",
        description: "Recipe removed from saved list",
      });
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ username: newUsername.trim() })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProfile({ ...profile, username: newUsername.trim() });
      setSettingsOpen(false);
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    }
  };

  const handleRecipeClick = (recipeData: any) => {
    // Store recipe in sessionStorage and navigate to recipe view
    const recipes = [recipeData.recipe_data || recipeData];
    sessionStorage.setItem("generatedRecipes", JSON.stringify(recipes));
    navigate(`/recipe/${recipeData.recipe_data?.id || recipeData.id || 'view'}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Profile Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                    />
                  </div>
                  <Button onClick={handleUpdateUsername} className="w-full">
                    Update Username
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSignOut} variant="destructive">
              Sign Out
            </Button>
          </div>
        </div>

        <Card className="p-6 bg-gradient-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {profile?.username || profile?.display_name || "User"}
              </h1>
              <p className="text-muted-foreground">
                {profile?.total_points || 0} points
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{profile?.total_points || 0}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs defaultValue="cooked">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cooked">Cooked Recipes ({cookedRecipes.length})</TabsTrigger>
                <TabsTrigger value="saved">Saved Recipes ({savedRecipes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="cooked" className="space-y-4 mt-4">
                {cookedRecipes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No cooked recipes yet</p>
                  </Card>
                ) : (
                  cookedRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {recipe.recipe_data?.title || "Recipe"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Rating: {"⭐".repeat(recipe.rating || 0)} • {recipe.points_earned} points earned
                          </p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {new Date(recipe.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="saved" className="space-y-4 mt-4">
                {savedRecipes.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No saved recipes yet</p>
                  </Card>
                ) : (
                  savedRecipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="p-4 hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {recipe.recipe_data?.title || "Recipe"}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {recipe.recipe_data?.cuisineType} • {recipe.recipe_data?.prepTime} min
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedRecipe(recipe.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
              </div>
              <div className="space-y-3">
                {leaderboard.map((user, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      user.username === profile?.username || user.display_name === profile?.display_name
                        ? "bg-primary/10"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <p className="font-medium text-foreground">
                        {user.username || user.display_name}
                      </p>
                    </div>
                    <p className="font-bold text-primary">{user.total_points} pts</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
