// /lib/mealTemplates.js
export const DEFAULT_MEAL_DISTRIBUTION = [
  { name: "Breakfast", pct: 0.30 },
  { name: "Lunch", pct: 0.30 },
  { name: "Dinner", pct: 0.30 },
  { name: "Snack 1", pct: 0.05 },
  { name: "Snack 2", pct: 0.05 }
];

/**
 * Build a single day's meals based on daily targets.
 * Returns array of meals with calories, and rough macro split.
 * protein/fat/carbs per meal computed proportionally by calories.
 */
export function buildDayFromTargets({ dayName, dailyCalories, proteinsG, fatsG, carbsG }) {
  // copy distribution
  const meals = DEFAULT_MEAL_DISTRIBUTION.map(m => ({ ...m }));

  // compute per-meal calories (rounded)
  const mealsWithCalories = meals.map(m => {
    const cals = Math.round(dailyCalories * m.pct);
    return { mealType: m.name, calories: cals };
  });

  // compute per-calorie macro ratios
  const totalMacroKcals = proteinsG * 4 + fatsG * 9 + carbsG * 4;
  const proteinRatio = (proteinsG * 4) / Math.max(totalMacroKcals, 1);
  const fatRatio = (fatsG * 9) / Math.max(totalMacroKcals, 1);
  const carbRatio = (carbsG * 4) / Math.max(totalMacroKcals, 1);

  const mealsWithMacros = mealsWithCalories.map(m => {
    const kcal = m.calories;
    const p = Math.round((kcal * proteinRatio) / 4); // g
    const f = Math.round((kcal * fatRatio) / 9); // g
    const c = Math.round((kcal * carbRatio) / 4); // g
    return {
      mealType: m.mealType,
      calories: m.calories,
      protein: p,
      fats: f,
      carbs: c,
      items: []
    };
  });

  return { day: dayName, meals: mealsWithMacros };
}

/**
 * Build an entire week using client targets.
 * client object must contain dailyCalories, proteins, fats, carbs
 */
export function buildWeeklyTemplate(client) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  return days.map(d => buildDayFromTargets({
    dayName: d,
    dailyCalories: client.dailyCalories || 0,
    proteinsG: client.proteins || 0,
    fatsG: client.fats || 0,
    carbsG: client.carbs || 0
  }));
}
