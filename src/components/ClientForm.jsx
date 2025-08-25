"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  calcBMR,
  calcTDEE,
  calcDailyCalories,
  calcMacros,
  ACTIVITY_MULTIPLIERS
} from "@/libs/nutrition";

const GENDERS = ["Male", "Female"];
const ACTIVITY = Object.keys(ACTIVITY_MULTIPLIERS);
const GOALS = ["Fat Loss", "Maintain", "Lean Gain"];
const DIETS = ["Balanced", "Keto", "Vegetarian", "Vegan", "Low Carb", "Mediterranean"];

export default function ClientForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [apiError, setApiError] = useState("");

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000";

  const onSubmit = async (values) => {
    setApiError("");

    const age = Number(values.age);
    const height = Number(values.height);
    const weight = Number(values.weight);
    const goalWeight = Number(values.goalWeight);
    const timeframe = Number(values.timeframe);

    if ([age, height, weight, goalWeight, timeframe].some(n => Number.isNaN(n) || n <= 0)) {
      setApiError("Please enter valid positive numbers for age, height, weight and goal weight.");
      return;
    }

    const BMR = calcBMR({ gender: values.gender, weightKg: weight, heightCm: height, age });
    const TDEE = calcTDEE({ bmr: BMR, activityLevel: values.activityLevel });
    const dailyCalories = calcDailyCalories(TDEE, values.goalType, weight, goalWeight, timeFrame);
    const { proteins, fats, carbs } = calcMacros({ weightKg: weight, dailyCalories });

    const payload = {
      name: values.name.trim(),
      age,
      gender: values.gender,
      height,
      weight,
      goalWeight,
      timeframe,
      goalType: values.goalType,
      dietType: values.dietType,
      activityLevel: values.activityLevel,
      BMR,
      TDEE,
      dailyCalories,
      proteins,
      fats,
      carbs,
      useEmptyWeek: true
    };

    try {
      const res = await fetch(`${baseUrl}/api/clients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create client");
      }

      router.push("/clients");
      router.refresh();
    } catch (err) {
      setApiError(err.message);
    }
  };

  return (
    <div className="bg-gray-50 px-4">
      <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border shadow-sm p-8 space-y-2 max-w-3xl mx-auto"
    >
      <h2 className="text-2xl font-bold text-gray-900">Create New Client</h2>

      {apiError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Client Full Name"
          {...register("name", { required: "Name is required", minLength: 2 })}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      {/* Age + Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age (years)</label>
          <input
            type="number" min="1"
            placeholder="Age"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            {...register("age", { required: "Age is required", valueAsNumber: true })}
          />
          {errors.age && <p className="text-sm text-red-600 mt-1">{errors.age.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            {...register("gender", { required: true })}
          >
            <option value="">Select gender</option>
            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.gender && <p className="text-sm text-red-600 mt-1">Gender is required</p>}
        </div>
      </div>

      {/* Height + Weight + Goal Weight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["Height (cm)", "Weight (kg)", "Goal Weight (kg)"].map((label, idx) => {
          const key = ["height", "weight", "goalWeight"][idx];
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type="number" min="10"
                placeholder={label}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                {...register(key, { required: true, valueAsNumber: true })}
              />
            </div>
          );
        })}
      </div>

      {/* Timeframe */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe (Days)</label>
        <input
          type="Number" min="7"
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Days"
          {...register("timeframe", { required: true })}
        />
      </div>

      {/* Goal, Diet, Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[["Goal Type", GOALS, "goalType"], ["Diet Type", DIETS, "dietType"], ["Activity Level", ACTIVITY, "activityLevel"]].map(([label, options, key]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              {...register(key, { required: true })}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow-md hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isSubmitting ? "Creating..." : "Create Client"}
        </button>
      </div>
    </form>
    </div>
  );
}

