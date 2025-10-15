import { useState, useEffect } from "react";
import { Plus, X, ChefHat, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface Ingredient {
  name: string;
  amount?: string;
}

interface IngredientInputProps {
  onComplete: (ingredients: Ingredient[], equipment: string[], seasonings: string[]) => void;
  onBack?: () => void;
}

const defaultSeasonings = [
  "Salt", "Black Pepper", "Olive Oil", "Vegetable Oil", "Garlic Powder",
  "Onion Powder", "Paprika", "Cumin", "Oregano", "Basil", "Thyme", "Rosemary"
];

const defaultEquipment = [
  "Oven", "Stovetop", "Microwave", "Air Fryer", "Blender", 
  "Food Processor", "Slow Cooker", "Instant Pot", "Grill"
];

const IngredientInput = ({ onComplete, onBack }: IngredientInputProps) => {
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedSeasonings, setSelectedSeasonings] = useState<string[]>([]);
  const [customSeasoning, setCustomSeasoning] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [availableSeasonings, setAvailableSeasonings] = useState<string[]>(defaultSeasonings);
  const [availableEquipment, setAvailableEquipment] = useState<string[]>(defaultEquipment);

  useEffect(() => {
    if (!loading && preferences) {
      // Build available lists: defaults + custom - removed
      const allSeasonings = [...new Set([
        ...defaultSeasonings,
        ...(preferences.customSeasonings || [])
      ])].filter(s => !(preferences.removedSeasonings || []).includes(s));

      const allEquipment = [...new Set([
        ...defaultEquipment,
        ...(preferences.customEquipment || [])
      ])].filter(e => !(preferences.removedEquipment || []).includes(e));
      
      setAvailableSeasonings(allSeasonings);
      setAvailableEquipment(allEquipment);
      setSelectedSeasonings(preferences.seasonings || []);
      setSelectedEquipment(preferences.equipment || []);
    }
  }, [loading, preferences]);

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
    const newSelection = selectedEquipment.includes(equip)
      ? selectedEquipment.filter(e => e !== equip)
      : [...selectedEquipment, equip];
    
    setSelectedEquipment(newSelection);
    updatePreferences({ equipment: newSelection });
  };

  const toggleSeasoning = (seasoning: string) => {
    const newSelection = selectedSeasonings.includes(seasoning)
      ? selectedSeasonings.filter(s => s !== seasoning)
      : [...selectedSeasonings, seasoning];
    
    setSelectedSeasonings(newSelection);
    updatePreferences({ seasonings: newSelection });
  };

  const addCustomSeasoning = () => {
    const val = customSeasoning.trim();
    if (val && !availableSeasonings.includes(val)) {
      const newSeasonings = [...availableSeasonings, val];
      setAvailableSeasonings(newSeasonings);
      setCustomSeasoning("");
      const newCustom = [...(preferences.customSeasonings || []), val];
      updatePreferences({ customSeasonings: newCustom });
    }
  };

  const addCustomEquipment = () => {
    const val = customEquipment.trim();
    if (val && !availableEquipment.includes(val)) {
      const newEquipment = [...availableEquipment, val];
      setAvailableEquipment(newEquipment);
      setCustomEquipment("");
      const newCustom = [...(preferences.customEquipment || []), val];
      updatePreferences({ customEquipment: newCustom });
    }
  };

  const removeSeasoning = (seasoning: string) => {
    const newAvail = availableSeasonings.filter(s => s !== seasoning);
    setAvailableSeasonings(newAvail);
    const newSelected = selectedSeasonings.filter(s => s !== seasoning);
    setSelectedSeasonings(newSelected);

    if (defaultSeasonings.includes(seasoning)) {
      const removed = Array.from(new Set([...(preferences.removedSeasonings || []), seasoning]));
      updatePreferences({ removedSeasonings: removed, seasonings: newSelected });
    } else {
      const newCustom = (preferences.customSeasonings || []).filter(s => s !== seasoning);
      updatePreferences({ customSeasonings: newCustom, seasonings: newSelected });
    }
  };

  const removeEquipment = (equipment: string) => {
    const newAvail = availableEquipment.filter(e => e !== equipment);
    setAvailableEquipment(newAvail);
    const newSelected = selectedEquipment.filter(e => e !== equipment);
    setSelectedEquipment(newSelected);

    if (defaultEquipment.includes(equipment)) {
      const removed = Array.from(new Set([...(preferences.removedEquipment || []), equipment]));
      updatePreferences({ removedEquipment: removed, equipment: newSelected });
    } else {
      const newCustom = (preferences.customEquipment || []).filter(e => e !== equipment);
      updatePreferences({ customEquipment: newCustom, equipment: newSelected });
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
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
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
                <div key={seasoning} className="relative">
                  <Badge
                    variant={selectedSeasonings.includes(seasoning) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1 transition-all hover:scale-105 pr-7"
                    onClick={() => toggleSeasoning(seasoning)}
                  >
                    {seasoning}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSeasoning(seasoning);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
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
                <div key={equip} className="relative">
                  <Badge
                    variant={selectedEquipment.includes(equip) ? "default" : "outline"}
                    className="cursor-pointer px-4 py-2 transition-all hover:scale-105 pr-7"
                    onClick={() => toggleEquipment(equip)}
                  >
                    {equip}
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEquipment(equip);
                    }}
                    className="absolute top-1/2 -translate-y-1/2 right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
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
