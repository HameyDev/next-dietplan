import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import dbConnect from "@/libs/dbConnect";
import Client from "@/models/Client";
import { buildEmptyWeek } from "@/libs/emptyWeek";

export async function GET(req) {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // Basic pagination & search
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const skip = (page - 1) * limit;

  const filter = q
    ? { name: { $regex: q, $options: "i" } }
    : {};

  const [items, total] = await Promise.all([
    Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Client.countDocuments(filter)
  ]);

  return NextResponse.json({
    page, limit, total, items
  });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  try {
    const body = await req.json();

    // Allow client creation without mealPlan; build default empty week if asked
    const useEmptyWeek = body.useEmptyWeek === true;
    if (useEmptyWeek && (!body.mealPlan || body.mealPlan.length === 0)) {
      body.mealPlan = buildEmptyWeek();
    }

    // NOTE: Calculated fields (BMR, TDEE, etc.) will be filled in Chunk 5.
    const created = await Client.create({
      name: body.name,
      age: body.age,
      gender: body.gender,
      height: body.height,
      weight: body.weight,
      goalWeight: body.goalWeight,
      timeframe: body.timeframe,
      goalType: body.goalType,
      dietType: body.dietType,
      activityLevel: body.activityLevel,

      BMR: body.BMR ?? 0,
      TDEE: body.TDEE ?? 0,
      dailyCalories: body.dailyCalories ?? 0,
      proteins: body.proteins ?? 0,
      fats: body.fats ?? 0,
      carbs: body.carbs ?? 0,

      mealPlan: body.mealPlan ?? []
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create client" }, { status: 400 });
  }
}
