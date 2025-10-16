import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ingredients, equipment, preferences, commonSeasonings, existingRecipes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build the prompt for AI
    const cuisineFilter = preferences.cuisineType.length > 0 
      ? `Focus on these cuisine types: ${preferences.cuisineType.join(', ')}.` 
      : 'Any cuisine type is acceptable.';

    const systemPrompt = `You are an expert chef specializing in creative leftover recipes and food waste reduction. 
Your mission is to transform leftover ingredients into delicious, restaurant-quality meals.

Core Principles:
- Maximize use of all provided ingredients, especially leftovers
- Create recipes that breathe new life into day-old or leftover foods
- Suggest creative flavor combinations that mask "leftover taste"
- Provide tips for reviving textures (crispy, fresh, tender)
- Focus on practical, achievable recipes for home cooks
- Ensure food safety when working with leftovers

Always prioritize creativity and flavor while minimizing waste.`;

    const seasoningsNote = commonSeasonings && commonSeasonings.length > 0
      ? `Common seasonings available: ${commonSeasonings.join(', ')}`
      : 'Assume basic seasonings are available';

    const existingRecipesNote = existingRecipes && existingRecipes.length > 0
      ? `\nIMPORTANT: Avoid creating recipes similar to these already shown recipes: ${existingRecipes.map((r: any) => r.title).join(', ')}. 
Create completely different dishes with unique cooking methods and flavor profiles.`
      : '';

    const userPrompt = `Create 3-5 creative recipe suggestions using these leftover ingredients and items: ${ingredients.join(', ')}.

IMPORTANT: Treat these as leftover or surplus ingredients that need to be used creatively. 
Focus on recipes that transform leftovers into exciting new dishes.${existingRecipesNote}

Available equipment: ${equipment.join(', ') || 'basic kitchen tools'}
${seasoningsNote}

Preferences:
- ${cuisineFilter}
- Calories: ${preferences.calorieRange[0]}-${preferences.calorieRange[1]} kcal per serving
- Preparation time: ${preferences.timeRange[0]}-${preferences.timeRange[1]} minutes

For each recipe, provide:
1. A creative, appetizing title
2. Brief description (1-2 sentences)
3. Cuisine type
4. Preparation time (in minutes)
5. Estimated calories per serving
6. List of all ingredients needed (including common seasonings)
7. Required equipment
8. Step-by-step cooking instructions

Return your response as a JSON object with this exact structure:
{
  "recipes": [
    {
      "id": "unique-id",
      "title": "Recipe Title",
      "description": "Brief description",
      "cuisineType": "Cuisine Type",
      "prepTime": number,
      "calories": number,
      "ingredients": ["ingredient1", "ingredient2"],
      "equipment": ["equipment1", "equipment2"],
      "instructions": ["step1", "step2"]
    }
  ]
}`;

    console.log('Calling Lovable AI to generate recipes...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI response received successfully');

    // Parse the JSON response
    let parsedRecipes;
    try {
      parsedRecipes = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', content);
      throw new Error('Invalid response format from AI');
    }

    return new Response(
      JSON.stringify(parsedRecipes),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recipes function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        recipes: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
