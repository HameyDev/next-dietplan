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

export async function createPDFBuffer(client) {
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595;
  const pageHeight = 842;
  let page = pdfDoc.addPage([pageWidth, pageHeight]); // A4
  let y = pageHeight - 50; // starting y
  const leftColX = 40;
  const rightColX = 320;
  const rowHeight = 18;

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // ---- HEADER ----
const headerHeight = 80; // taller header for logo + info
page.drawRectangle({ x: 0, y: pageHeight - headerHeight, width: pageWidth, height: headerHeight, color: rgb(0.2, 0.55, 0.9) });

// Draw Logo (example: small square for placeholder, replace with actual image later)
const logoSize = 50;
// If you have a base64 or Uint8Array of the logo:
// const logoImage = await pdfDoc.embedPng(logoBytes);
// page.drawImage(logoImage, { x: leftColX, y: pageHeight - 60, width: logoSize, height: logoSize });
page.drawRectangle({ x: leftColX, y: pageHeight - 60, width: logoSize, height: logoSize, color: rgb(1, 1, 1) }); // placeholder

// Draw Title
page.drawText("Diet Plan", { x: leftColX + 70, y: pageHeight - 35, size: 24, font: timesRomanBold, color: rgb(1, 1, 1) });

// Draw Your Name
page.drawText("Dr. Laiba Noor", { x: leftColX + 70, y: pageHeight - 55, size: 16, font: timesRomanBold, color: rgb(1, 1, 1) });

// Draw Instagram Info
page.drawText("@your_instagram_handle", { x: leftColX + 70, y: pageHeight - 70, size: 12, font: timesRoman, color: rgb(1, 1, 1) });

y -= headerHeight + 20;


  // ---- CLIENT INFO & TARGETS BOX ----
  const clientInfo = [
    ["Name", client.name], ["Age", client.age],
    ["Gender", client.gender], ["Height", client.height ? client.height + " cm" : "-"],
    ["Weight", client.weight ? client.weight + " kg" : "-"], ["Goal Weight", client.goalWeight ? client.goalWeight + " kg" : "-"],
    ["Goal", client.goalType], ["Diet Type", client.dietType],
    ["Activity", client.activityLevel], ["Timeframe", client.timeframe]
  ];

  const targets = [
    ["BMR", client.BMR], ["TDEE", client.TDEE],
    ["Calories", client.dailyCalories], ["Protein", client.proteins],
    ["Fats", client.fats], ["Carbs", client.carbs]
  ];

  const maxRows = Math.max(clientInfo.length, targets.length);
  const boxHeight = rowHeight * maxRows + 40; // dynamic height

  // Draw background rectangles
  page.drawRectangle({ x: leftColX - 10, y: y - boxHeight, width: 265, height: boxHeight, color: rgb(0.95, 0.95, 0.95) });
  page.drawRectangle({ x: rightColX - 10, y: y - boxHeight, width: 265, height: boxHeight, color: rgb(0.9, 0.95, 1) });

  // Titles
  page.drawText("Client Information", { x: leftColX, y: y - 20, size: 14, font: timesRomanBold, color: rgb(0, 0, 0.3) });
  page.drawText("Targets", { x: rightColX, y: y - 20, size: 14, font: timesRomanBold, color: rgb(0, 0, 0.3) });

  // Draw Client Info
  let clientStartY = y - 40;
  clientInfo.forEach(([label, val], i) => {
    const rowY = clientStartY - i * rowHeight;
    page.drawText(`${label}:`, { x: leftColX, y: rowY, size: 11, font: timesRoman });
    page.drawText(String(val || "-"), { x: leftColX + 100, y: rowY, size: 11, font: timesRomanBold });
  });

  // Draw Targets
  let targetStartY = y - 40;
  targets.forEach(([label, val], i) => {
    const rowY = targetStartY - i * rowHeight;
    page.drawText(`${label}: ${String(val || 0)}`, { x: rightColX, y: rowY, size: 11, font: timesRoman });
  });

  y -= boxHeight + 20;

  // ---- WEEKLY MEAL PLAN ----
  const mealPlan = Array.isArray(client.mealPlan) ? client.mealPlan : [];
  page.drawText("Weekly Meal Plan", { x: leftColX, y, size: 16, font: timesRomanBold, color: rgb(0.2, 0.55, 0.9) });
  y -= 25;

  const tableHeaders = ["Meal Type", "Calories", "Protein", "Fats", "Carbs", "Items"];
  tableHeaders.forEach((h, i) => {
    page.drawText(h, { x: leftColX + i * 80, y, size: 11, font: timesRomanBold });
  });
  y -= rowHeight;

  mealPlan.forEach((day, d) => {
    if (y < 100) { 
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - 50;
    }

    page.drawText(day.day || `Day ${d + 1}`, { x: leftColX, y, size: 12, font: timesRomanBold, color: rgb(0.2, 0.55, 0.9) });
    y -= rowHeight;

    (day.meals || []).forEach((meal, i) => {
      if (i % 2 === 0) page.drawRectangle({ x: leftColX - 5, y: y - 5, width: 515, height: rowHeight, color: rgb(0.95, 0.95, 1) });

      page.drawText(String(meal.mealType || "Meal"), { x: leftColX, y, size: 10, font: timesRoman });
      page.drawText(String(meal.calories || 0), { x: leftColX + 80, y, size: 10, font: timesRoman });
      page.drawText(String(meal.protein || 0), { x: leftColX + 160, y, size: 10, font: timesRoman });
      page.drawText(String(meal.fats || 0), { x: leftColX + 240, y, size: 10, font: timesRoman });
      page.drawText(String(meal.carbs || 0), { x: leftColX + 320, y, size: 10, font: timesRoman });
      page.drawText((meal.items || []).join(", "), { x: leftColX + 400, y, size: 10, font: timesRoman });

      y -= rowHeight;
    });
    y -= 10;
  });

  // ---- FOOTER ----
  if (y < 50) page = pdfDoc.addPage([pageWidth, pageHeight]);
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
