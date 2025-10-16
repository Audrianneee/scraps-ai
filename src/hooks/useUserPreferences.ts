import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserPreferences {
  seasonings: string[];
  equipment: string[];
  cuisines: string[];
  customSeasonings: string[];
  customEquipment: string[];
  customCuisines: string[];
  removedSeasonings: string[];
  removedEquipment: string[];
  removedCuisines: string[];
  customDietaryRestrictions: string[];
  removedDietaryRestrictions: string[];
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    seasonings: [],
    equipment: [],
    cuisines: [],
    customSeasonings: [],
    customEquipment: [],
    customCuisines: [],
    removedSeasonings: [],
    removedEquipment: [],
    removedCuisines: [],
    customDietaryRestrictions: [],
    removedDietaryRestrictions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setPreferences({
        seasonings: data.seasonings || [],
        equipment: data.equipment || [],
        cuisines: data.cuisines || [],
        customSeasonings: data.custom_seasonings || [],
        customEquipment: data.custom_equipment || [],
        customCuisines: data.custom_cuisines || [],
        removedSeasonings: data.removed_seasonings || [],
        removedEquipment: data.removed_equipment || [],
        removedCuisines: data.removed_cuisines || [],
        customDietaryRestrictions: data.custom_dietary_restrictions || [],
        removedDietaryRestrictions: data.removed_dietary_restrictions || [],
      });
    }
    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPreferences: UserPreferences = { ...preferences, ...updates } as UserPreferences;
    setPreferences(newPreferences);

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        seasonings: newPreferences.seasonings,
        equipment: newPreferences.equipment,
        cuisines: newPreferences.cuisines,
        custom_seasonings: newPreferences.customSeasonings,
        custom_equipment: newPreferences.customEquipment,
        custom_cuisines: newPreferences.customCuisines,
        removed_seasonings: newPreferences.removedSeasonings,
        removed_equipment: newPreferences.removedEquipment,
        removed_cuisines: newPreferences.removedCuisines,
        custom_dietary_restrictions: newPreferences.customDietaryRestrictions,
        removed_dietary_restrictions: newPreferences.removedDietaryRestrictions,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Error updating preferences:", error);
    }
  };

  return { preferences, updatePreferences, loading };
};
