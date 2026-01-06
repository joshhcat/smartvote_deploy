import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, use } from "react";
import {
  FaKaaba,
  FaWhmcs,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import ThemeSwitcher from "../ThemeSwitcher";

export default function StudentSidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [filingLinkOpen, setFilingLinkOpen] = useState(false);
  const [votingLinkOpen, setVotingLinkOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/student/filing")) {
      setFilingLinkOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/student/voting")) {
      setVotingLinkOpen(true);
    }
  }, [location.pathname]);

  // Sidebar link data
  const links = [
    {
      to: "/student",
      label: "Home",
      icon: <FaKaaba />,
    },
  ];

  const filingLinks = [
    {
      to: "/student/filing/ssg",
      label: "SSG",
      icon: <FaPlus />,
    },
    {
      to: "/student/filing/bsit",
      label: "BSIT",
      icon: <FaPlus />,
    },
  ];
  const votingLinks = [
    {
      to: "/student/voting/ssg",
      label: "SSG",
      icon: <FaPlus />,
    },
    {
      to: "/student/voting/bsit",
      label: "BSIT",
      icon: <FaPlus />,
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Desktop Sidebar
  return (
    <>
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-60 bg-base-100 border-r-2 border-emerald-300 dark:border-emerald-600 shadow-lg z-30 overflow-auto">
        <div className="p-6 text-xl text-center font-bold border-b">
          Smart Vote Students
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`btn btn-ghost w-full justify-start flex items-center gap-2 ${
                location.pathname === link.to ? "bg-gray-800 text-white" : ""
              }`}
              onClick={() => setFilingLinkOpen(false)}
            >
              <span className="group relative">
                {link.icon}
                <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                  {link.label}
                </span>
              </span>
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          ))}
          {/* Candidacy expandable section */}
          <button
            type="button"
            className="btn btn-ghost w-full justify-start flex items-center gap-2"
            onClick={() => {
              setFilingLinkOpen((prev) => !prev);
              if (!filingLinkOpen) {
                navigate("/student/filing/ssg");
              }
            }}
          >
            <span className="group relative">
              {/* Candidacy icon */}
              <FaPlus />
              <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                File Candidacy
              </span>
            </span>
            <span className="font-semibold flex-1 text-left hidden md:inline">
              File Candidacy
            </span>
            {filingLinkOpen ? <FaChevronDown /> : <FaChevronUp />}
          </button>
          {filingLinkOpen && (
            <div className="pl-6 mt-2 space-y-1">
              {filingLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`btn btn-ghost w-full justify-start flex items-center gap-2 text-left ${
                    location.pathname === link.to
                      ? "bg-gray-800 text-white"
                      : ""
                  }`}
                >
                  <span className="group relative">
                    {link.icon}
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                      {link.label}
                    </span>
                  </span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              ))}
            </div>
          )}
          {/* Election expandable section */}
          <button
            type="button"
            className="btn btn-ghost w-full justify-start flex items-center gap-2"
            onClick={() => {
              setVotingLinkOpen((prev) => !prev);
              if (!votingLinkOpen) {
                navigate("/admin/voting/ssg");
              }
            }}
          >
            <span className="group relative">
              {/* Candidacy icon */}
              <FaWhmcs />
              <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                Election
              </span>
            </span>
            <span className="font-semibold flex-1 text-left hidden md:inline">
              Election
            </span>
            {votingLinkOpen ? <FaChevronDown /> : <FaChevronUp />}
          </button>
          {votingLinkOpen && (
            <div className="pl-6 mt-2 space-y-1">
              {votingLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`btn btn-ghost w-full justify-start flex items-center gap-2 text-left ${
                    location.pathname === link.to
                      ? "bg-gray-800 text-white"
                      : ""
                  }`}
                >
                  <span className="group relative">
                    {link.icon}
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                      {link.label}
                    </span>
                  </span>
                  <span className="hidden md:inline">{link.label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
        <div className="p-4 border-t">
          <button
            className="btn btn-outline w-full hover:bg-gray-800 hover:text-white flex items-center gap-2"
            onClick={handleLogout}
          >
            <span className="group relative">
              {/* Logout icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12v7a2 2 0 002 2h6"
                />
              </svg>
              <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                Logout
              </span>
            </span>
            <span className="hidden md:inline">Logout</span>
          </button>
          <ThemeSwitcher />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <aside className="md:hidden fixed inset-0 bg-base-100 border-r-2 border-emerald-300 dark:border-emerald-600 shadow-lg z-40 flex flex-col w-24 ">
          <nav className="flex-1 p-3 space-y-2 mt-12">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`btn btn-ghost w-full justify-start flex items-center gap-2 ${
                  location.pathname === link.to ? "bg-gray-800 text-white" : ""
                }`}
                onClick={() => setFilingLinkOpen(false)}
                title={link.label}
              >
                {link.icon}
              </Link>
            ))}
            <button
              type="button"
              className="btn btn-ghost w-full justify-start flex items-center gap-2"
              onClick={() => {
                setFilingLinkOpen((prev) => !prev);
                if (!filingLinkOpen) {
                  navigate("/student/voting/ssg");
                }
              }}
              title="Candidacy"
            >
              <FaPlus />
              {filingLinkOpen ? <FaChevronDown /> : <FaChevronUp />}
            </button>
            {filingLinkOpen && (
              <div className="pl-2 mt-2 space-y-1">
                {filingLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`btn btn-ghost w-full justify-start flex items-center gap-2 text-left ${
                      location.pathname === link.to
                        ? "bg-gray-800 text-white"
                        : ""
                    }`}
                    title={link.label}
                  >
                    {link.icon}
                  </Link>
                ))}
              </div>
            )}
            <button
              type="button"
              className="btn btn-ghost w-full justify-start flex items-center gap-2"
              onClick={() => {
                setVotingLinkOpen((prev) => !prev);
                if (!votingLinkOpen) {
                  navigate("/student/voting/ssg");
                }
              }}
              title="Election"
            >
              <FaPlus />
              {votingLinkOpen ? <FaChevronDown /> : <FaChevronUp />}
            </button>
            {votingLinkOpen && (
              <div className="pl-2 mt-2 space-y-1">
                {electionLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`btn btn-ghost w-full justify-start flex items-center gap-2 text-left ${
                      location.pathname === link.to
                        ? "bg-gray-800 text-white"
                        : ""
                    }`}
                    title={link.label}
                  >
                    {link.icon}
                  </Link>
                ))}
              </div>
            )}
          </nav>
          <div className="p-3 border-t">
            <button
              className="btn btn-outline w-full hover:bg-gray-800 hover:text-white flex items-center gap-2"
              onClick={handleLogout}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12v7a2 2 0 002 2h6"
                />
              </svg>
            </button>
            <ThemeSwitcher />
          </div>
        </aside>
      )}
    </>
  );
}
