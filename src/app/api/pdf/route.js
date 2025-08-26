// ✅ Force Node.js runtime
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import dbConnect from "@/libs/dbConnect";
import Client from "@/models/Client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// Helper: Check Y position and add page if needed
function checkY(pdfDoc, page, y, minY = 100) {
  if (y < minY) {
    const newPage = pdfDoc.addPage([595, 842]);
    return { page: newPage, y: 780 };
  }
  return { page, y };
}

async function createPDFBuffer(client) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  let y = 780;
  const leftColX = 40;
  const rightColX = 320;
  const rowGap = 20;

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // ---- Header ----
  page.drawRectangle({ x: 0, y: 780, width: 595, height: 60, color: rgb(0.2, 0.55, 0.9) });
  page.drawText("Diet Plan", { x: 40, y: 800, size: 24, font: timesRomanBold, color: rgb(1, 1, 1) });
  y -= 70;

  // ---- Client Info Box ----
  page.drawRectangle({ x: leftColX - 10, y: y - 10, width: 515, height: 150, color: rgb(0.95, 0.95, 0.95) });
  page.drawText("Client Information", { x: leftColX, y: y + 80, size: 14, font: timesRomanBold, color: rgb(0, 0, 0.3) });

  page.drawText("Name:", { x: leftColX, y: y + 60, size: 11, font: timesRoman });
  page.drawText(client.name || "-", { x: leftColX + 60, y: y + 60, size: 11, font: timesRomanBold });
  page.drawText(`Age: ${client.age || "-"}`, { x: rightColX, y: y + 60, size: 11, font: timesRoman });

  page.drawText(`Gender: ${client.gender || "-"}`, { x: leftColX, y: y + 40, size: 11, font: timesRoman });
  page.drawText(`Height: ${client.height || "-"} cm`, { x: rightColX, y: y + 40, size: 11, font: timesRoman });

  page.drawText(`Weight: ${client.weight || "-"} kg`, { x: leftColX, y: y + 20, size: 11, font: timesRoman });
  page.drawText(`Goal Weight: ${client.goalWeight || "-"} kg`, { x: rightColX, y: y + 20, size: 11, font: timesRoman });

  page.drawText(`Goal: ${client.goalType || "-"}`, { x: leftColX, y: y, size: 11, font: timesRoman });
  page.drawText(`Diet Type: ${client.dietType || "-"}`, { x: rightColX, y: y, size: 11, font: timesRoman });

  page.drawText(`Activity: ${client.activityLevel || "-"}`, { x: leftColX, y: y - 20, size: 11, font: timesRoman });
  page.drawText(`Timeframe: ${client.timeframe || "-"}`, { x: rightColX, y: y - 20, size: 11, font: timesRoman });

  y -= 150;

  // ---- Targets Box ----
  page.drawRectangle({ x: leftColX - 10, y: y - 10, width: 515, height: 60, color: rgb(0.9, 0.95, 1) });
  page.drawText("Targets", { x: leftColX, y: y + 30, size: 14, font: timesRomanBold, color: rgb(0, 0, 0.3) });

  page.drawText(`BMR: ${client.BMR || 0} kcal`, { x: leftColX, y: y + 10, size: 11, font: timesRoman });
  page.drawText(`TDEE: ${client.TDEE || 0} kcal`, { x: leftColX + 160, y: y + 10, size: 11, font: timesRoman });
  page.drawText(`Daily Calories: ${client.dailyCalories || 0} kcal`, { x: leftColX + 320, y: y + 10, size: 11, font: timesRoman });

  page.drawText(`Protein: ${client.proteins || 0} g`, { x: leftColX, y: y - 10, size: 11, font: timesRoman });
  page.drawText(`Fats: ${client.fats || 0} g`, { x: leftColX + 160, y: y - 10, size: 11, font: timesRoman });
  page.drawText(`Carbs: ${client.carbs || 0} g`, { x: leftColX + 320, y: y - 10, size: 11, font: timesRoman });

  y -= 80;

  // ---- Meal Plan Section ----
  page.drawText("Weekly Meal Plan", { x: leftColX, y, size: 16, font: timesRomanBold, color: rgb(0.2, 0.55, 0.9) });
  y -= 25;

  const mealPlan = Array.isArray(client.mealPlan) ? client.mealPlan : [];
  if (mealPlan.length === 0) {
    page.drawText("No meal plan available.", { x: leftColX, y, size: 11, font: timesRoman });
  } else {
    for (let d = 0; d < mealPlan.length; d++) {
      const dayObj = mealPlan[d];
      const dayLabel = dayObj.day || `Day ${d + 1}`;

      ({ page, y } = checkY(pdfDoc, page, y, 100));
      page.drawRectangle({ x: leftColX - 5, y: y - 5, width: 515, height: 15, color: rgb(0.8, 0.9, 1) });
      page.drawText(dayLabel, { x: leftColX, y, size: 12, font: timesRomanBold });
      y -= 20;

      (dayObj.meals || []).forEach((meal, i) => {
        ({ page, y } = checkY(pdfDoc, page, y, 100));
        if (i % 2 === 0) {
          page.drawRectangle({ x: leftColX - 5, y: y - 5, width: 515, height: 15, color: rgb(0.95, 0.95, 1) });
        }
        page.drawText(
          `${meal.mealType || "Meal"}: ${meal.calories || 0} kcal, P:${meal.protein || 0} F:${meal.fats || 0} C:${meal.carbs || 0}`,
          { x: leftColX + 10, y, size: 10, font: timesRoman }
        );
        y -= 18;
        if (meal.items && meal.items.length) {
          page.drawText(`Items: ${meal.items.join(", ")}`, { x: leftColX + 20, y, size: 9, font: timesRoman });
          y -= 12;
        }
      });
      y -= 8;
    }
  }

  // ---- Footer on last page only ----
  page.drawText(`Generated by Laiba Nutritionist — ${new Date().toLocaleString()}`, { x: leftColX, y: 30, size: 9, font: timesRoman, color: rgb(0.4, 0.4, 0.4) });

  return pdfDoc.save();
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");
    if (!clientId)
      return new Response(JSON.stringify({ error: "clientId is required" }), { status: 400, headers: { "Content-Type": "application/json" } });

    await dbConnect();
    const client = await Client.findById(clientId).lean();
    if (!client)
      return new Response(JSON.stringify({ error: "Client not found" }), { status: 404, headers: { "Content-Type": "application/json" } });

    const pdfBuffer = await createPDFBuffer(client);

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.length),
        "Content-Disposition": `attachment; filename="${(client.name || "client").replace(/\s+/g, "_")}_diet_plan.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF API Error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
