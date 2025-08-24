import ClientForm from "@/components/ClientForm";

export const metadata = { title: "Create Client" };

export default function CreateClientPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Client</h1>
      <ClientForm />
    </div>
  );
}
