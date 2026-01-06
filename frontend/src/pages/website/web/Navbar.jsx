import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../../assets/slogo.png";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which dropdown is open

  const handleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <nav className="bg-slate-800 shadow-lg fixed top-0 left-0 w-full z-50 border-b border-slate-700">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-5 py-1">
        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={logo} alt="SmartVote Logo" className="h-16 w-auto" />
          <span className="text-xl font-bold text-white">SmartVote</span>
        </Link>

        {/* Mobile Hamburger (shown on small screens) */}
        <div className="md:hidden relative">
          <div
            className="text-3xl cursor-pointer text-white"
            onClick={() => setMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✖" : "☰"}
          </div>
          
          {/* Mobile Dropdown Menu */}
          <div
            className={`absolute top-full right-0 mt-2 bg-slate-800/85 backdrop-blur-md shadow-xl rounded-lg z-40 overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "opacity-100 max-h-96 translate-y-0"
                : "opacity-0 max-h-0 -translate-y-2 pointer-events-none"
            }`}
            style={{ width: "200px" }}
          >
            <div className="p-2 flex flex-col text-white text-sm font-medium">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                Home
              </Link>
              <Link
                to="/elections/info"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                Elections
              </Link>
              <Link
                to="/stats/live-results"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                Live Results
              </Link>
              <Link
                to="/features"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                Features
              </Link>
              <Link
                to="/about"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                About
              </Link>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 hover:bg-slate-700/70 rounded transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop / tablet Menu */}
        <ul className="hidden md:flex space-x-10 text-white text-sm font-medium">
          <li>
            <Link to="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link to="/elections/info" className="hover:text-emerald-400 transition-colors">
              Elections
            </Link>
          </li>
          <li className="relative">
            <button
              type="button"
              onClick={() => handleDropdown("stats")}
              className="hover:text-emerald-400 focus:outline-none transition-colors"
            >
              Stats ▾
            </button>
            {openDropdown === "stats" && (
              <ul className="absolute bg-slate-700 shadow-lg rounded-lg mt-2 w-48 z-50 text-sm text-gray-200 border border-slate-600">
                <li>
                  <Link
                    to="/stats/live-results"
                    className="block px-4 py-2 hover:bg-slate-600 hover:text-emerald-400"
                  >
                    Live Results
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li>
            <Link to="/features" className="hover:text-emerald-400 transition-colors">
              Features
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-emerald-400 transition-colors">
              About
            </Link>
          </li>
          <li className="relative">
            <button
              type="button"
              onClick={() => handleDropdown("account")}
              className="hover:text-emerald-400 focus:outline-none transition-colors"
            >
              Account ▾
            </button>
            {openDropdown === "account" && (
              <ul className="absolute bg-slate-700 shadow-lg rounded-lg mt-2 w-48 z-50 text-sm text-gray-200 border border-slate-600">
                <li>
                  <Link
                    to="/login"
                    //pointer-events-none
                    className="block px-4 py-2 hover:bg-slate-600  hover:text-emerald-400"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    //pointer-events-none
                    className="block px-4 py-2 hover:bg-slate-600 hover:text-emerald-400"
                  >
                    Sign up
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
