import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function ProtectedLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      <Footer />
    </div>
  );
}
