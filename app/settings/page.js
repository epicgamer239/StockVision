"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [budget, setBudget] = useState(5000);
  const router = useRouter();

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`min-h-screen p-6 transition-colors ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <button
        onClick={() => router.push("/dashboard")}
        className="mb-4 text-sm text-blue-600 hover:underline flex items-center"
      >
        ← Back to Dashboard
      </button>

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 transition duration-300">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          ⚙️ Settings
        </h1>

        <div className="flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Theme
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark mode.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span>🌞</span>
            <div className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <div className="block w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
            </div>
            <span>🌙</span>
          </label>
        </div>

        <div className="border-b pb-4 border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Stock Budget
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Set a limit for how much you plan to invest.
          </p>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="text-center mt-2 font-medium text-gray-800 dark:text-white">
            ${budget.toLocaleString()}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            More Settings
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            More options coming soon...
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <button
            onClick={() => {
              alert("Settings saved!");
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 active:scale-95"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
