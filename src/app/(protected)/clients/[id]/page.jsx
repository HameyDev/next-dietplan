// import dbConnect from "@/libs/dbConnect";
// import Client from "@/models/Client";
// import Link from "next/link";

// export const metadata = { title: "Client Detail" };

// export default async function ClientDetailPage({ params }) {
//   await dbConnect();
//   const client = await Client.findById(params.id).lean();

//   if (!client) {
//     return (
//       <div>
//         <h1 className="text-2xl font-semibold">Client not found</h1>
//         <Link href="/clients" className="mt-4 inline-block text-blue-600 hover:underline">
//           ← Back to Clients
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-semibold">{client.name}</h1>
//         <div className="flex items-center gap-2">
//           <Link href="/clients" className="rounded border px-3 py-1.5 hover:bg-gray-100">
//             Back
//           </Link>
//           <Link
//             href={`/clients/${client._id}/diet`}
//             className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
//             title="Edit Weekly Diet Plan"
//           >
//             Edit Diet Plan
//           </Link>
//         </div>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <div className="rounded border bg-white p-4">
//           <h2 className="font-semibold mb-2">Profile</h2>
//           <ul className="text-sm text-gray-700 space-y-1">
//             <li><strong>Age:</strong> {client.age}</li>
//             <li><strong>Gender:</strong> {client.gender}</li>
//             <li><strong>Height:</strong> {client.height} cm</li>
//             <li><strong>Weight:</strong> {client.weight} kg</li>
//             <li><strong>Goal Weight:</strong> {client.goalWeight} kg</li>
//             <li><strong>Timeframe:</strong> {client.timeframe}</li>
//             <li><strong>Goal Type:</strong> {client.goalType}</li>
//             <li><strong>Diet Type:</strong> {client.dietType}</li>
//             <li><strong>Activity:</strong> {client.activityLevel}</li>
//           </ul>
//         </div>

//         <div className="rounded border bg-white p-4">
//           <h2 className="font-semibold mb-2">Calculated Targets</h2>
//           <ul className="text-sm text-gray-700 space-y-1">
//             <li><strong>BMR:</strong> {client.BMR} kcal</li>
//             <li><strong>TDEE:</strong> {client.TDEE} kcal</li>
//             <li><strong>Daily Calories:</strong> {client.dailyCalories} kcal</li>
//             <li><strong>Protein:</strong> {client.proteins} g</li>
//             <li><strong>Fats:</strong> {client.fats} g</li>
//             <li><strong>Carbs:</strong> {client.carbs} g</li>
//           </ul>
//         </div>
//       </div>

//       <div className="rounded border bg-white p-4">
//         <h2 className="font-semibold mb-2">Meal Plan (Overview)</h2>
//         {Array.isArray(client.mealPlan) && client.mealPlan.length > 0 ? (
//           <ul className="list-disc pl-5 text-sm text-gray-700">
//             {client.mealPlan.map((d, idx) => (
//               <li key={idx}>
//                 <span className="font-medium">{d.day}</span> — {d.meals?.length || 0} meals
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="text-sm text-gray-600">No meals yet. Click “Edit Diet Plan”.</p>
//         )}
//       </div>
//     </div>
//   );
// }

import dbConnect from "@/libs/dbConnect";
import Client from "@/models/Client";
import Link from "next/link";

export const metadata = { title: "Client Detail" };

export default async function ClientDetailPage({ params }) {
  await dbConnect();
  const client = await Client.findById(params.id).lean();

  if (!client) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-800">Client not found</h1>
        <Link
          href="/clients"
          className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          ← Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Back
          </Link>
          <Link
            href={`/clients/${client._id}/diet`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
          >
            Edit Diet Plan
          </Link>
        </div>
      </div>

      {/* Profile + Calculated Targets */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>Age:</strong> {client.age}</li>
            <li><strong>Gender:</strong> {client.gender}</li>
            <li><strong>Height:</strong> {client.height} cm</li>
            <li><strong>Weight:</strong> {client.weight} kg</li>
            <li><strong>Goal Weight:</strong> {client.goalWeight} kg</li>
            <li><strong>Timeframe:</strong> {client.timeframe}</li>
            <li><strong>Goal Type:</strong> {client.goalType}</li>
            <li><strong>Diet Type:</strong> {client.dietType}</li>
            <li><strong>Activity:</strong> {client.activityLevel}</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Calculated Targets</h2>
          <ul className="text-sm text-gray-700 space-y-2">
            <li><strong>BMR:</strong> {client.BMR} kcal</li>
            <li><strong>TDEE:</strong> {client.TDEE} kcal</li>
            <li><strong>Daily Calories:</strong> {client.dailyCalories} kcal</li>
            <li><strong>Protein:</strong> {client.proteins} g</li>
            <li><strong>Fats:</strong> {client.fats} g</li>
            <li><strong>Carbs:</strong> {client.carbs} g</li>
          </ul>
        </div>
      </div>

      {/* Meal Plan */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Meal Plan (Overview)</h2>
        {Array.isArray(client.mealPlan) && client.mealPlan.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2 text-sm text-gray-700">
            {client.mealPlan.map((d, idx) => (
              <li key={idx}>
                <span className="font-medium text-gray-900">{d.day}</span> —{" "}
                <span className="text-gray-600">{d.meals?.length || 0} meals</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 italic">
            No meals yet. Click <span className="font-medium">“Edit Diet Plan”</span> to create one.
          </p>
        )}
      </div>
    </div>
  );
}

