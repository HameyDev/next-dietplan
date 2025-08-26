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
  const initial =
    client.mealPlan && client.mealPlan.length === 7
      ? client.mealPlan.map((d) => ({
          ...d,
          meals: (d.meals || []).map((m) => ({
            ...m,
            items: Array.isArray(m.items) ? m.items.join(", ") : m.items || "",
          })),
        }))
      : buildWeeklyTemplate(client);

  const [week, setWeek] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);

  // totals for entire week
  const weeklyTotals = useMemo(() => {
    return week.reduce(
      (acc, day) => {
        const s = sumMeals(day.meals || []);
        acc.calories += s.calories;
        acc.protein += s.protein;
        acc.fats += s.fats;
        acc.carbs += s.carbs;
        return acc;
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 }
    );
  }, [week]);

  // Helpers
  const updateMeal = (dayIndex, mealIndex, field, value) => {
    setWeek((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const meal = copy[dayIndex].meals[mealIndex];
      if (!meal) return prev;

      if (["calories", "protein", "fats", "carbs"].includes(field)) {
        meal[field] = value === "" ? "" : parseInt(value, 10);
      } else {
        // mealType and items are stored as string
        meal[field] = value;
      }

      return copy;
    });
    setDirty(true);
  };

  const addMeal = (dayIndex) => {
    setWeek((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      copy[dayIndex].meals.push({
        mealType: "Snack",
        calories: 0,
        protein: 0,
        fats: 0,
        carbs: 0,
        items: [],
      });
      return copy;
    });
    setDirty(true);
  };

  const removeMeal = (dayIndex, mealIndex) => {
    setWeek((prev) => {
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
      const invalidDay = week.find(
        (d) => !Array.isArray(d.meals) || d.meals.length === 0
      );
      if (invalidDay) {
        throw new Error(
          "Each day must have at least one meal. Use Prefill to auto-generate."
        );
      }

      // sanitize and ensure numbers
      const payloadPlan = week.map((d) => ({
        day: d.day,
        meals: (d.meals || []).map((m) => ({
          mealType: m.mealType || "Meal",
          calories: numberOrZero(m.calories),
          protein: numberOrZero(m.protein),
          carbs: numberOrZero(m.carbs),
          fats: numberOrZero(m.fats),
          items: m.items
            ? m.items
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        })),
      }));

      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlan: payloadPlan }),
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold">Weekly Plan Editor</h3>
          <p className="text-sm text-gray-600">
            Client daily calories: <strong>{client.dailyCalories} kcal</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prefillWeek}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 shadow-sm"
          >
            Prefill Template
          </button>
          <button
            onClick={discardChanges}
            className={`rounded-lg border px-3 py-1.5 text-sm shadow-sm ${
              !dirty ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
          >
            Discard
          </button>
          <button
            onClick={savePlan}
            disabled={!dirty || busy}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="p-2 rounded-lg bg-green-50 text-green-700 text-sm shadow-sm">
          {message}
        </div>
      )}

      {/* Days Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {week.map((day, di) => {
          const totals = sumMeals(day.meals || []);
          const overCalories =
            totals.calories > (client.dailyCalories || Infinity);
          const overProtein = totals.protein > (client.proteins || Infinity);

          return (
            <div
              key={day.day}
              className="rounded-xl border bg-white p-4 shadow-sm flex flex-col"
            >
              {/* Day header */}
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">{day.day}</h4>
                  <p className="text-xs text-gray-500">
                    {day.meals?.length || 0} meals
                  </p>
                </div>
                <div className="text-right text-xs">
                  <div
                    className={`font-medium ${
                      overCalories ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    {totals.calories} kcal
                  </div>
                  <div className="text-gray-500">
                    P {totals.protein}g • C {totals.carbs}g • F {totals.fats}g
                  </div>
                </div>
              </div>

              {/* Meals */}
              <div className="mt-4 space-y-3 flex-1">
                {(day.meals || []).map((meal, mi) => (
                  <div
                    key={mi}
                    className="rounded-lg border p-3 shadow-sm bg-gray-50"
                  >
                    {/* Meal top row */}
                    <div className="flex items-center justify-between gap-2">
                      <input
                        value={meal.mealType}
                        onChange={(e) =>
                          updateMeal(di, mi, "mealType", e.target.value)
                        }
                        className="flex-1 rounded border px-2 py-1 text-sm"
                      />
                      <button
                        onClick={() => removeMeal(di, mi)}
                        className="ml-2 text-xs text-red-600 hover:text-red-700 hover:underline"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Macros row */}
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      <input
                        type="number"
                        value={meal.calories}
                        onChange={(e) =>
                          updateMeal(di, mi, "calories", e.target.value)
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="kcal"
                      />
                      <input
                        type="number"
                        value={meal.protein}
                        onChange={(e) =>
                          updateMeal(di, mi, "protein", e.target.value)
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="P g"
                      />
                      <input
                        type="number"
                        value={meal.carbs}
                        onChange={(e) =>
                          updateMeal(di, mi, "carbs", e.target.value)
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="C g"
                      />
                      <input
                        type="number"
                        value={meal.fats}
                        onChange={(e) =>
                          updateMeal(di, mi, "fats", e.target.value)
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="F g"
                      />
                    </div>

                    {/* Items */}
                    <div className="mt-2">
                      <input
                        value={
                          Array.isArray(meal.items)
                            ? meal.items.join(", ")
                            : meal.items || ""
                        }
                        onChange={(e) =>
                          updateMeal(di, mi, "items", e.target.value)
                        }
                        className="w-full rounded border px-2 py-1 text-sm"
                        placeholder="e.g. Oats, Milk, Banana"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add meal */}
              <button
                onClick={() => addMeal(di)}
                className="mt-3 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 w-full shadow-sm"
              >
                + Add Meal
              </button>
            </div>
          );
        })}
      </div>

      {/* Weekly Totals */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h4 className="font-semibold mb-2">Weekly Totals</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-800">
          <div>
            Calories: <strong>{weeklyTotals.calories}</strong> kcal
          </div>
          <div>
            Protein: <strong>{weeklyTotals.protein}</strong> g
          </div>
          <div>
            Carbs: <strong>{weeklyTotals.carbs}</strong> g
          </div>
          <div>
            Fats: <strong>{weeklyTotals.fats}</strong> g
          </div>
        </div>
      </div>
    </div>
  );
}
