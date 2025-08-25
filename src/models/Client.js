import mongoose from "mongoose";

const MealItemSchema = new mongoose.Schema(
  {
    mealType: { type: String, required: true }, // Breakfast/Lunch/Dinner/Snack
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 }, // g
    carbs:   { type: Number, default: 0 }, // g
    fats:    { type: Number, default: 0 }, // g
    items:   [{ type: String }] // list of foods
  },
  { _id: false }
);

const DayPlanSchema = new mongoose.Schema(
  {
    day: { type: String, required: true }, // Monday...Sunday
    meals: { type: [MealItemSchema], default: [] }
  },
  { _id: false }
);

const ClientSchema = new mongoose.Schema(
  {
    // Basic profile
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1 },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    height: { type: Number, required: true }, // cm
    weight: { type: Number, required: true }, // kg
    goalWeight: { type: Number, required: true }, // kg
    timeframe: { type: Number, required: true }, // e.g. "8 weeks"
    goalType: { type: String, required: true }, // e.g. "Fat Loss", "Lean Gain"
    dietType: { type: String, required: true }, // e.g. "Keto", "Balanced", "Veg"
    activityLevel: {
      type: String,
      enum: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"],
      required: true
    },

    // Calculated fields (we will compute in Chunk 5)
    BMR: { type: Number, default: 0 },
    TDEE: { type: Number, default: 0 },
    dailyCalories: { type: Number, default: 0 },
    proteins: { type: Number, default: 0 }, // g
    fats: { type: Number, default: 0 },     // g
    carbs: { type: Number, default: 0 },    // g

    // Weekly plan (7 entries with days)
    mealPlan: { type: [DayPlanSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.models.Client ||
  mongoose.model("Client", ClientSchema);
