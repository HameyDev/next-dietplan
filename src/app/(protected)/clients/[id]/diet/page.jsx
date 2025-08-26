import dbConnect from "@/libs/dbConnect";
import Client from "@/models/Client";
import Link from "next/link";
import DietEditorWrapper from "@/components/DietEditorWrapper";

export const metadata = { title: "Edit Diet Plan" };

export default async function DietPage({ params }) {
  await dbConnect();
  const client = await Client.findById(params.id).lean();

  if (!client) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">Client not found</h1>
        <Link href="/clients" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Back to Clients
        </Link>
      </div>
    );
  }

  const safeClient = {
    ...client,
    _id: client._id.toString(),
    createdAt: client.createdAt ? client.createdAt.toISOString() : null,
    updatedAt: client.updatedAt ? client.updatedAt.toISOString() : null,
  };

  // Pass client data to client-side editor via props (serialized)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Diet Plan — {client.name}</h1>
        <div className="flex gap-2">
          <Link href={`/clients/${client._id}`} className="rounded border px-3 py-1.5 hover:bg-gray-100">
            Back
          </Link>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <DietEditorWrapper client={safeClient} clientId={String(safeClient._id)} />
      </div>
    </div>
  );
}


