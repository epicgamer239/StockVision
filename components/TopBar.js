'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import Link from "next/link";

export default function TopBar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);
  const user = auth.currentUser;

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-8">
        <h1 className="text-xl font-semibold text-gray-800">StockVision</h1>
        <nav className="flex space-x-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
            Home
          </Link>
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition">
            Dashboard
          </Link>
          <Link href="/chronos" className="text-gray-600 hover:text-gray-900 transition">
            Chronos
          </Link>
        </nav>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <span className="text-gray-700 font-medium hidden sm:block">
            {user?.displayName || 'User'}
          </span>
          <img
            src={user?.photoURL || 'https://i.pravatar.cc/40'}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-300"
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            <Link
              href="/settings"
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
