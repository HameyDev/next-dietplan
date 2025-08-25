import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function ProtectedLayout({ children }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar at top */}
      <Navbar />

      {/* Main content takes all available space */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer pushed to bottom */}
      <Footer />
    </div>
  );
}
