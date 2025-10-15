import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserPreferences {
  seasonings: string[];
  equipment: string[];
  cuisines: string[];
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    seasonings: [],
    equipment: [],
    cuisines: [],
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
      });
    }
    setLoading(false);
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: user.id,
        seasonings: newPreferences.seasonings,
        equipment: newPreferences.equipment,
        cuisines: newPreferences.cuisines,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Error updating preferences:", error);
    }
  };

  return { preferences, updatePreferences, loading };
};
