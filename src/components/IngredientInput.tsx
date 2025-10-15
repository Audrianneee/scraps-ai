import { useState } from "react";
import { Plus, X, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  name: string;
  amount?: string;
}

interface IngredientInputProps {
  onComplete: (ingredients: Ingredient[], equipment: string[], seasonings: string[]) => void;
}

const commonSeasoningsList = [
  "Salt", "Black Pepper", "Olive Oil", "Vegetable Oil", "Garlic Powder",
  "Onion Powder", "Paprika", "Cumin", "Oregano", "Basil", "Thyme", "Rosemary"
];

const commonEquipment = [
  "Oven", "Stovetop", "Microwave", "Air Fryer", "Blender", 
  "Food Processor", "Slow Cooker", "Instant Pot", "Grill"
];

const IngredientInput = ({ onComplete }: IngredientInputProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedSeasonings, setSelectedSeasonings] = useState<string[]>([]);
  const [customSeasoning, setCustomSeasoning] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [availableSeasonings, setAvailableSeasonings] = useState<string[]>(commonSeasoningsList);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(commonEquipment);

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, { 
        name: currentIngredient.trim(), 
        amount: currentAmount.trim() || undefined 
      }]);
      setCurrentIngredient("");
      setCurrentAmount("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleEquipment = (equip: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equip)
        ? prev.filter(e => e !== equip)
        : [...prev, equip]
    );
  };

  const toggleSeasoning = (seasoning: string) => {
    setSelectedSeasonings(prev =>
      prev.includes(seasoning)
        ? prev.filter(s => s !== seasoning)
        : [...prev, seasoning]
    );
  };

  const addCustomSeasoning = () => {
    if (customSeasoning.trim() && !availableSeasonings.includes(customSeasoning.trim())) {
      setAvailableSeasonings([...availableSeasonings, customSeasoning.trim()]);
      setCustomSeasoning("");
    }
  };

  const addCustomEquipment = () => {
    if (customEquipment.trim() && !availableEquipment.includes(customEquipment.trim())) {
      setAvailableEquipment([...availableEquipment, customEquipment.trim()]);
      setCustomEquipment("");
    }
  };

  const handleSubmit = () => {
    if (ingredients.length > 0) {
      onComplete(ingredients, selectedEquipment, selectedSeasonings);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-2 text-foreground">Your Ingredients</h2>
          <p className="text-muted-foreground text-lg">Tell us what you have in your kitchen</p>
        </div>

        <Card className="p-8 shadow-card bg-gradient-card animate-slide-in">
          {/* Ingredient Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">Add Ingredients</label>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Ingredient name (e.g., chicken, tomatoes)"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                className="flex-1"
              />
              <Input
                placeholder="Amount (optional)"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                className="w-32"
              />
              <Button onClick={addIngredient} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Ingredient List */}
            {ingredients.length > 0 && (
              <div className="space-y-2 mb-4">
                {ingredients.map((ing, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-slide-in"
                  >
                    <span className="text-foreground">
                      <strong>{ing.name}</strong>
                      {ing.amount && <span className="text-muted-foreground ml-2">({ing.amount})</span>}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Common Seasonings Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">
              Common Seasonings Available
            </label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add custom seasoning..."
                value={customSeasoning}
                onChange={(e) => setCustomSeasoning(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomSeasoning()}
              />
              <Button onClick={addCustomSeasoning} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableSeasonings.map((seasoning) => (
                <Badge
                  key={seasoning}
                  variant={selectedSeasonings.includes(seasoning) ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1 transition-all hover:scale-105"
                  onClick={() => toggleSeasoning(seasoning)}
                >
                  {seasoning}
                </Badge>
              ))}
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3 text-foreground">Available Equipment</label>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add custom equipment..."
                value={customEquipment}
                onChange={(e) => setCustomEquipment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomEquipment()}
              />
              <Button onClick={addCustomEquipment} size="icon" variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableEquipment.map((equip) => (
                <Badge
                  key={equip}
                  variant={selectedEquipment.includes(equip) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 transition-all hover:scale-105"
                  onClick={() => toggleEquipment(equip)}
                >
                  {equip}
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={ingredients.length === 0}
            className="w-full"
            size="lg"
            variant="hero"
          >
            Continue to Preferences
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default IngredientInput;
