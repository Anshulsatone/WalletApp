import React, { useState } from "react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-black text-white shadow fixed w-full top-0 z-10">
      {/* Left Section: Logo + Name + Version */}
      <div className="flex items-center space-x-3">
        <span className="text-4xl">🔗</span>
        <h1 className="text-3xl font-semibold">
          WalletApp
          <span className="ml-4 bg-gray-800 px-4 py-2 rounded-full text-sm text-gray-300">
            {"{v1.0}"}
          </span>
        </h1>
      </div>

      {/* Right Section: Toggle Button */}
      <div className="flex items-center space-x-2">
        <span className="text-sm">{darkMode ? "🌙" : "☀️"}</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            onChange={toggleDark}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer dark:bg-gray-300 peer-checked:bg-blue-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
        </label>
      </div>
    </nav>
  );
};

export default Navbar;
