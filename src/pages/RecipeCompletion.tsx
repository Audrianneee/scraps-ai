import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Trophy, Leaf, Home, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const RecipeCompletion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const recipe = location.state?.recipe;
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [foodWasteSaved, setFoodWasteSaved] = useState(0);

  useEffect(() => {
    // Set constant food waste value
    const wasteValue = Math.floor(Math.random() * 500 + 200);
    setFoodWasteSaved(wasteValue);

    // Trigger confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Fetch leaderboard
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, username, total_points")
      .order("total_points", { ascending: false })
      .limit(5);
    
    if (data) setLeaderboard(data);
  };

  const calculatePoints = (rating: number, foodWaste: number) => {
    // Rating bonus: 10 points per star
    // Food waste: 1 point per 10 grams
    return (rating * 10) + Math.floor(foodWaste / 10);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please rate the recipe",
        description: "Select a star rating before continuing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const pointsEarned = calculatePoints(rating, foodWasteSaved);

    // Insert cooked recipe
    const { error: cookedError } = await supabase
      .from("cooked_recipes")
      .insert({
        user_id: user.id,
        recipe_data: recipe,
        rating,
        points_earned: pointsEarned,
        food_waste_saved: foodWasteSaved,
      });

    if (cookedError) {
      toast({
        title: "Error",
        description: cookedError.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Update profile points
    const { error: pointsError } = await supabase.rpc(
      "update_profile_points_and_level",
      {
        user_id: user.id,
        points_to_add: pointsEarned,
      }
    );

    if (pointsError) {
      console.error("Error updating points:", pointsError);
    }

    toast({
      title: "Recipe completed!",
      description: `You earned ${pointsEarned} points!`,
    });

    setTimeout(() => {
      navigate("/profile");
    }, 1500);
  };

  const points = rating > 0 ? calculatePoints(rating, foodWasteSaved) : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-muted-foreground">
            You've completed another delicious meal!
          </p>
        </div>

        <Card className="p-8 space-y-6 bg-card">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Rate Your Meal</h2>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (hoveredRating || rating)
                        ? "fill-primary text-primary"
                        : "text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-accent/10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Leaf className="w-5 h-5" />
                <span className="font-medium">Food Waste Managed</span>
              </div>
              <p className="text-3xl font-bold text-foreground">
                ~{foodWasteSaved}g
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-accent/10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Points Earned</span>
              </div>
              <p className="text-3xl font-bold text-primary">
                +{points} pts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Top Chefs 🏆</h3>
            <div className="space-y-2">
              {leaderboard.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/10"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{user.username || user.display_name}</p>
                    </div>
                  </div>
                  <p className="font-bold text-primary">{user.total_points} pts</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
              size="lg"
            >
              Continue
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="lg"
            >
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RecipeCompletion;
