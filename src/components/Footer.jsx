export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
        {/* Left - Copyright */}
        <p className="mb-2 md:mb-0">
          © {new Date().getFullYear()} <span className="font-semibold text-gray-700">Diet Admin</span>. All rights reserved.
        </p>

        {/* Right - Links */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}
