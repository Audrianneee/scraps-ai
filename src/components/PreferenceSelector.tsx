import { useState } from "react";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface Preferences {
  cuisineType: string[];
  calorieRange: [number, number];
  timeRange: [number, number];
}

interface PreferenceSelectorProps {
  onComplete: (preferences: Preferences) => void;
}

const cuisineTypes = [
  "Asian", "Italian", "Mexican", "Indian", "Mediterranean",
  "American", "French", "Thai", "Japanese", "Middle Eastern"
];

const PreferenceSelector = ({ onComplete }: PreferenceSelectorProps) => {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState<[number, number]>([0, 1000]);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 120]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
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
            <div className="flex flex-wrap gap-2">
              {cuisineTypes.map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={selectedCuisines.includes(cuisine) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 transition-all hover:scale-105"
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {cuisine}
                </Badge>
              ))}
            </div>
          </div>

          {/* Calorie Range */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">
              Calorie Range: {calorieRange[0]} - {calorieRange[1]} kcal
            </label>
            <Slider
              value={calorieRange}
              onValueChange={(value) => setCalorieRange(value as [number, number])}
              min={0}
              max={2000}
              step={50}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 kcal</span>
              <span>2000 kcal</span>
            </div>
          </div>

          {/* Time Range */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">
              Preparation Time: {timeRange[0]} - {timeRange[1]} minutes
            </label>
            <Slider
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as [number, number])}
              min={0}
              max={180}
              step={5}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 min</span>
              <span>3 hours</span>
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
