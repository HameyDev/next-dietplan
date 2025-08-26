"use client";

import { useState, useMemo } from "react";
import { buildWeeklyTemplate } from "@/libs/mealTemplates";

function sumMeals(meals) {
  return meals.reduce(
    (acc, m) => {
      acc.calories += Number(m.calories || 0);
      acc.protein += Number(m.protein || 0);
      acc.fats += Number(m.fats || 0);
      acc.carbs += Number(m.carbs || 0);
      return acc;
    },
    { calories: 0, protein: 0, fats: 0, carbs: 0 }
  );
}

function numberOrZero(v) {
  const n = Number(v);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : 0;
}

export default function DietEditor({ client, clientId }) {
  // initialPlan: use client.mealPlan if present else build empty week
  const initial = client.mealPlan && client.mealPlan.length === 7
    ? client.mealPlan.map(d => ({ ...d, meals: d.meals || [] }))
    : buildWeeklyTemplate(client);

  const [week, setWeek] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  // totals for entire week
  const weeklyTotals = useMemo(() => {
    return week.reduce((acc, day) => {
      const s = sumMeals(day.meals || []);
      acc.calories += s.calories;
      acc.protein += s.protein;
      acc.fats += s.fats;
      acc.carbs += s.carbs;
      return acc;
    }, { calories: 0, protein: 0, fats: 0, carbs: 0 });
  }, [week]);

  // Helpers
  const updateMeal = (dayIndex, mealIndex, field, value) => {
    setWeek(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const meal = copy[dayIndex].meals[mealIndex];
      if (!meal) return prev;
      // numeric fields
      if (["calories","protein","fats","carbs"].includes(field)) {
        meal[field] = numberOrZero(value);
      } else if (field === "items") {
        // expect comma separated string
        meal.items = value.split(",").map(s => s.trim()).filter(Boolean);
      } else {
        meal[field] = value;
      }
      return copy;
    });
    setDirty(true);
  };

  const addMeal = (dayIndex) => {
    setWeek(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[dayIndex].meals.push({
        mealType: "Snack",
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
        items: []
      });
      return copy;
    });
    setDirty(true);
  };

  const removeMeal = (dayIndex, mealIndex) => {
    setWeek(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[dayIndex].meals.splice(mealIndex, 1);
      return copy;
    });
    setDirty(true);
  };

  const prefillWeek = () => {
    const template = buildWeeklyTemplate(client);
    setWeek(template);
    setDirty(true);
    setMessage("Prefilled week based on client's daily targets.");
    setTimeout(() => setMessage(""), 3500);
  };

  const discardChanges = () => {
    setWeek(initial);
    setDirty(false);
    setMessage("Changes discarded.");
    setTimeout(() => setMessage(""), 2000);
  };

  const savePlan = async () => {
    setBusy(true);
    setMessage("");
    try {
      // simple validation: ensure each day has at least one meal
      const invalidDay = week.find(d => !Array.isArray(d.meals) || d.meals.length === 0);
      if (invalidDay) {
        throw new Error("Each day must have at least one meal. Use Prefill to auto-generate.");
      }

      // sanitize and ensure numbers
      const payloadPlan = week.map(d => ({
        day: d.day,
        meals: (d.meals || []).map(m => ({
          mealType: m.mealType || "Meal",
          calories: numberOrZero(m.calories),
          protein: numberOrZero(m.protein),
          carbs: numberOrZero(m.carbs),
          fats: numberOrZero(m.fats),
          items: Array.isArray(m.items) ? m.items : (m.items ? String(m.items).split(",").map(s => s.trim()).filter(Boolean) : [])
        }))
      }));

      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlan: payloadPlan })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save plan");
      }

      setDirty(false);
      setMessage("Plan saved successfully.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.message || "Error saving plan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Weekly Plan Editor</h3>
          <p className="text-sm text-gray-600">Client daily calories: <strong>{client.dailyCalories} kcal</strong></p>
        </div>
        <div className="flex gap-2">
          <button onClick={prefillWeek} className="rounded border px-3 py-1.5 hover:bg-gray-100">Prefill Template</button>
          <button onClick={discardChanges} className={`rounded border px-3 py-1.5 ${!dirty ? "opacity-50 pointer-events-none" : ""}`}>Discard</button>
          <button onClick={savePlan} disabled={!dirty || busy} className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700 disabled:opacity-60">
            {busy ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>

      {message && <div className="p-2 rounded bg-green-50 text-green-700 text-sm">{message}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {week.map((day, di) => {
          const dayTotals = sumMeals(day.meals || []);
          const exceedsCalories = dayTotals.calories > (client.dailyCalories || Infinity);
          const exceedsProtein = dayTotals.protein > (client.proteins || Infinity);

          return (
            <div key={day.day} className="rounded border p-3 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{day.day}</h4>
                  <p className="text-xs text-gray-500">Meals: {(day.meals || []).length}</p>
                </div>
                <div className="text-right text-xs">
                  <div className={`font-medium ${exceedsCalories ? "text-red-600" : "text-gray-700"}`}>{dayTotals.calories} kcal</div>
                  <div className="text-gray-500">P {dayTotals.protein}g • C {dayTotals.carbs}g • F {dayTotals.fats}g</div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {(day.meals || []).map((meal, mi) => (
                  <div key={mi} className="rounded border p-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        value={meal.mealType}
                        onChange={(e) => updateMeal(di, mi, "mealType", e.target.value)}
                        className="w-36 rounded border px-2 py-1 text-sm"
                      />
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={meal.calories}
                          onChange={(e) => updateMeal(di, mi, "calories", e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                          placeholder="kcal"
                        />
                        <input
                          type="number"
                          value={meal.protein}
                          onChange={(e) => updateMeal(di, mi, "protein", e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                          placeholder="P g"
                        />
                        <input
                          type="number"
                          value={meal.carbs}
                          onChange={(e) => updateMeal(di, mi, "carbs", e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                          placeholder="C g"
                        />
                        <input
                          type="number"
                          value={meal.fats}
                          onChange={(e) => updateMeal(di, mi, "fats", e.target.value)}
                          className="w-20 rounded border px-2 py-1 text-sm"
                          placeholder="F g"
                        />
                        <button onClick={() => removeMeal(di, mi)} className="text-sm text-red-600 hover:underline">Remove</button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Items (comma separated)</label>
                      <input
                        value={Array.isArray(meal.items) ? meal.items.join(", ") : (meal.items || "")}
                        onChange={(e) => updateMeal(di, mi, "items", e.target.value)}
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="e.g. Oats, Milk, Banana"
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <button onClick={() => addMeal(di)} className="mt-1 rounded border px-3 py-1.5 text-sm hover:bg-gray-100">+ Add Meal</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded border bg-white p-3">
        <h4 className="font-semibold mb-2">Weekly Totals</h4>
        <div className="text-sm text-gray-700">
          <div>Calories: <strong>{weeklyTotals.calories}</strong> kcal</div>
          <div>Protein: <strong>{weeklyTotals.protein}</strong> g</div>
          <div>Carbs: <strong>{weeklyTotals.carbs}</strong> g</div>
          <div>Fats: <strong>{weeklyTotals.fats}</strong> g</div>
        </div>
      </div>
    </div>
  );
}
