import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const navigate = useNavigate();
  const themes = [
    { name: "light", icon: "🌞" },
    { name: "dark", icon: "🌙" },
    { name: "cyberpunk", icon: "🤖" },
    { name: "retro", icon: "🕹️" },
  ];

  // Get logged-in student's data
  const userData = JSON.parse(localStorage.getItem("UserData") || "{}");
  const studentName = userData?.firstname || "Student";

  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or fallback to 'dark'
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    document.querySelector("html").setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="navbar bg-base-100 border-b-2 border-emerald-300 dark:border-emerald-600 shadow-sm fixed w-full z-10">
      <div className="flex-1">
        <a
          className="btn btn-ghost text-xl"
          onClick={() => navigate("/student/homepage")}
        >
          SmartVote
        </a>
      </div>
      <div className="flex gap-2 items-center mr-4">
        <div className="text-sm font-medium">Hello, {studentName}</div>
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />{" "}
              </svg>
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          <div
            tabIndex={0}
            className="card card-compact dropdown-content bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 z-1 mt-3 w-52 shadow"
          >
            <div className="card-body">
              <span className="text-sm">Notification here</span>
            </div>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="Tailwind CSS Navbar component"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            {/* <li className="flex flex-row justify-between">
              <div className="text-xs">Theme</div>
              <select
                className=""
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
              >
                {themes.map((t) => (
                  <option className="text-black" key={t.name} value={t.name}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </li> */}
            <li
            //pointer-events-none
              className="mb-2 "
              onClick={() => {
                navigate("/student/dashboard");
              }}
            >
              <a>📊 Live Results</a>
            </li>
            <li
              className="mb-2"
              onClick={() => {
                navigate("/student/candidacy/history");
              }}
            >
              <a>Candidacy History</a>
            </li>
            <li
              className="mb-2"
              onClick={() => {
                navigate("/student/election/history");
              }}
            >
              <a>Voting History</a>
            </li>
            <li
            // aria-disabled
              className="mb-2"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              <a>Logout</a>
            </li>
            <div className="mt-2 text-sm ">
              <ThemeSwitcher />
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
}
