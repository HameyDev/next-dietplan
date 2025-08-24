export const ACTIVITY_MULTIPLIERS = {
  "Sedentary": 1.2,
  "Lightly Active": 1.375,
  "Moderately Active": 1.55,
  "Very Active": 1.725
};

export function calcBMR({ gender, weightKg, heightCm, age }) {
  // Mifflin-St Jeor (metric)
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === "Male" ? base + 5 : base - 161);
}

export function calcTDEE({ bmr, activityLevel }) {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] ?? 1.2;
  return Math.round(bmr * mult);
}

/**
 * goalType: "Fat Loss" | "Maintain" | "Lean Gain"
 * timeframe: free text, not used in math here (we’ll keep it for display)
 * dietType: not used in math here (you can use later to bias macros)
 */
export function calcDailyCalories(tdee, goalType) {
  if (goalType === "Fat Loss") return Math.round(tdee * 0.80);    // ~20% deficit
  if (goalType === "Lean Gain") return Math.round(tdee * 1.10);   // ~10% surplus
  return Math.round(tdee);                                        // Maintain
}

/**
 * Macro strategy (simple, sensible defaults):
 *  - Protein: 1.8 g/kg
 *  - Fat:    0.8 g/kg
 *  - Carbs:  remainder
 */
export function calcMacros({ weightKg, dailyCalories }) {
  const proteinG = Math.round(weightKg * 1.8);
  const fatG = Math.round(weightKg * 0.8);

  const kcalFromProtein = proteinG * 4;
  const kcalFromFat = fatG * 9;
  const kcalLeft = Math.max(dailyCalories - (kcalFromProtein + kcalFromFat), 0);
  const carbsG = Math.round(kcalLeft / 4);

  return {
    proteins: proteinG,
    fats: fatG,
    carbs: carbsG
  };
}
