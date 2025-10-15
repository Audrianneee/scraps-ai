import { useState, useEffect } from "react";
import { ChefHat, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface Preferences {
  cuisineType: string[];
  calorieRange: [number, number];
  timeRange: [number, number];
}

interface PreferenceSelectorProps {
  onComplete: (preferences: Preferences) => void;
}

const defaultCuisines = [
  "Asian", "Italian", "Mexican", "Indian", "Mediterranean",
  "American", "French", "Thai", "Japanese", "Middle Eastern"
];

const PreferenceSelector = ({ onComplete }: PreferenceSelectorProps) => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [customCuisine, setCustomCuisine] = useState("");
  const [availableCuisines, setAvailableCuisines] = useState<string[]>(defaultCuisines);
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 1000]);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 120]);

  useEffect(() => {
    if (!loading && preferences) {
      const allCuisines = [...new Set([
        ...defaultCuisines,
        ...(preferences.customCuisines || [])
      ])].filter(c => !(preferences.removedCuisines || []).includes(c));
      setAvailableCuisines(allCuisines);
      setSelectedCuisines(preferences.cuisines || []);
    }
  }, [loading, preferences]);

  const toggleCuisine = (cuisine: string) => {
    const newSelection = selectedCuisines.includes(cuisine)
      ? selectedCuisines.filter(c => c !== cuisine)
      : [...selectedCuisines, cuisine];
    
    setSelectedCuisines(newSelection);
    updatePreferences({ cuisines: newSelection });
  };

  const addCustomCuisine = () => {
    const val = customCuisine.trim();
    if (val && !availableCuisines.includes(val)) {
      const newCuisines = [...availableCuisines, val];
      setAvailableCuisines(newCuisines);
      setCustomCuisine("");
      const newCustom = [...(preferences.customCuisines || []), val];
      updatePreferences({ customCuisines: newCustom });
    }
  };

  const removeCuisine = (cuisine: string) => {
    const newAvail = availableCuisines.filter(c => c !== cuisine);
    setAvailableCuisines(newAvail);
    const newSelected = selectedCuisines.filter(c => c !== cuisine);
    setSelectedCuisines(newSelected);

    if (defaultCuisines.includes(cuisine)) {
      const removed = Array.from(new Set([...(preferences.removedCuisines || []), cuisine]));
      updatePreferences({ removedCuisines: removed, cuisines: newSelected });
    } else {
      const newCustom = (preferences.customCuisines || []).filter(c => c !== cuisine);
      updatePreferences({ customCuisines: newCustom, cuisines: newSelected });
    }
  };

  const handleSubmit = () => {
    onComplete({
      cuisineType: selectedCuisines,
      calorieRange,
      timeRange,
    });
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-2 text-foreground">Your Preferences</h2>
          <p className="text-muted-foreground text-lg">Customize your recipe recommendations</p>
        </div>

        <Card className="p-8 shadow-card bg-gradient-card animate-slide-in">
          {/* Cuisine Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">
              Cuisine Type (select all that apply)
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add custom cuisine type..."
                value={customCuisine}
                onChange={(e) => setCustomCuisine(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomCuisine()}
              />
              <Button onClick={addCustomCuisine} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableCuisines.map((cuisine) => (
                <div key={cuisine} className="relative">
                  <Badge
                    variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 transition-all hover:scale-105 pr-7"
                    onClick={() => toggleCuisine(cuisine)}
                  >
                    {cuisine}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCuisine(cuisine);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Calorie Range */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">
              Calorie Range (kcal)
            </label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                <Input
                  type="number"
                  value={calorieRange[0]}
                  onChange={(e) => setCalorieRange([parseInt(e.target.value) || 0, calorieRange[1]])}
                  min={0}
                  max={calorieRange[1]}
                />
              </div>
              <span className="text-muted-foreground mt-6">to</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                <Input
                  type="number"
                  value={calorieRange[1]}
                  onChange={(e) => setCalorieRange([calorieRange[0], parseInt(e.target.value) || 1000])}
                  min={calorieRange[0]}
                  max={5000}
                />
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">
              Preparation Time (minutes)
            </label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                <Input
                  type="number"
                  value={timeRange[0]}
                  onChange={(e) => setTimeRange([parseInt(e.target.value) || 0, timeRange[1]])}
                  min={0}
                  max={timeRange[1]}
                />
              </div>
              <span className="text-muted-foreground mt-6">to</span>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                <Input
                  type="number"
                  value={timeRange[1]}
                  onChange={(e) => setTimeRange([timeRange[0], parseInt(e.target.value) || 120])}
                  min={timeRange[0]}
                  max={300}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
            variant="hero"
          >
            Generate Recipes
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PreferenceSelector;
