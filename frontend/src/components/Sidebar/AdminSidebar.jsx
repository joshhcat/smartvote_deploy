import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaKaaba,
  FaWhmcs,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash,
  FaCalendarAlt,
  FaTrophy,
  FaHistory,
  FaCrown,
} from "react-icons/fa";
import ThemeSwitcher from "../ThemeSwitcher";

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidacyOpen, setCandidacyOpen] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [adminData, setAdminData] = useState(null);
  const [role, setRole] = useState(null);
  const [departments, setDepartments] = useState(null);

  useEffect(() => {
    if (location.pathname.startsWith("/admin")) {
      setAdminData(JSON.parse(localStorage.getItem("AdminData")));
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/candidacy")) {
      setCandidacyOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (adminData) {
      setRole(adminData[0].role);
      setDepartments(adminData[0]?.departments.split(","));
    }
  }, [adminData]);

  // Sidebar link data
  const links = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: <FaKaaba />,
    },

    //* Show only User Management if SuperAdmin
    ...(role === "SUPERADMIN"
      ? [
          {
            to: "/admin/user-management",
            label: "User Management",
            icon: <FaWhmcs />,
          },
        ]
      : []),

    //* Show Election Schedule for Admins (not SuperAdmin)
    ...(role !== "SUPERADMIN"
      ? [
          {
            to: "/admin/election-schedule",
            label: "Election Schedule",
            icon: <FaCalendarAlt />,
          },
          {
            to: "/admin/election-results",
            label: "Election Results",
            icon: <FaTrophy />,
          },
          {
            to: "/admin/final-results",
            label: "Final Results",
            icon: <FaCrown />,
          },
          {
            to: "/admin/voting-history",
            label: "Voting History",
            icon: <FaHistory />,
          },
        ]
      : []),
  ];

  // Generate candidacy links dynamically based on admin's departments
  const getCandidacyLinks = () => {
    if (!departments) return [];
    
    const departmentMap = {
      "SSG": { to: "/admin/candidacy/ssg", label: "SSG" },
      "BSIT": { to: "/admin/candidacy/bsit", label: "BSIT" },
      "CCS": { to: "/admin/candidacy/bsit", label: "BSIT" }, // CCS admins manage BSIT
      "BEED": { to: "/admin/candidacy/beed", label: "BEED" },
      "CTE": { to: "/admin/candidacy/beed", label: "BEED" }, // CTE admins manage BEED
      "CRIMINOLOGY": { to: "/admin/candidacy/crim", label: "CRIMINOLOGY" },
      "CRIM": { to: "/admin/candidacy/crim", label: "CRIMINOLOGY" },
      "CJE": { to: "/admin/candidacy/crim", label: "CRIMINOLOGY" }, // CJE admins manage CRIMINOLOGY
      "PSYCH": { to: "/admin/candidacy/psych", label: "PSYCH" },
      "PSYCHOLOGY": { to: "/admin/candidacy/psych", label: "PSYCH" },
      "BSA": { to: "/admin/candidacy/bsa", label: "BSA" },
      "CBA": { to: "/admin/candidacy/bsa", label: "BSA" }, // CBA admins manage BSA
    };

    const links = [];
    const addedLabels = new Set();

    departments.forEach((dept) => {
      const trimmedDept = dept.trim().toUpperCase();
      const mapping = departmentMap[trimmedDept];
      
      if (mapping && !addedLabels.has(mapping.label)) {
        links.push({
          to: mapping.to,
          label: mapping.label,
          icon: <FaPlus />,
        });
        addedLabels.add(mapping.label);
      }
    });

    return links;
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  //* Get filtered candidacy links based on admin's departments
  const filteredCandidacyLinks = getCandidacyLinks();

  // Desktop Sidebar
  return (
    <>
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-60 bg-base-100 border-r-2 border-emerald-300 dark:border-emerald-600 shadow-lg z-30 overflow-auto">
        <div className="p-6 text-xl text-center font-bold border-b">
          Smart Vote Admin
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`btn btn-ghost w-full justify-start flex items-center gap-2 ${
                location.pathname === link.to ? "bg-gray-800 text-white" : ""
              }`}
              onClick={() => setCandidacyOpen(false)}
            >
              {/* Icon always visible, tooltip on hover for small screens */}
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
          {/* if role is not super admin show these  */}
          {role !== "SUPERADMIN" && (
            <button
              type="button"
              className="btn btn-ghost w-full justify-start flex items-center gap-2"
              onClick={() => {
                setCandidacyOpen((prev) => !prev);
                if (!candidacyOpen) {
                  navigate("/admin/candidacy/ssg");
                }
              }}
            >
              <span className="group relative">
                <FaPlus />
                <span className="absolute left-8 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none md:hidden z-50">
                  Candidacy
                </span>
              </span>
              <span className="font-semibold flex-1 text-left hidden md:inline">
                Candidacy
              </span>
              {candidacyOpen ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          )}

          {candidacyOpen && (
            <div className="pl-6 mt-2 space-y-1">
              {filteredCandidacyLinks.map((link) => (
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
          <div className="flex items-center gap-3 mb-4">
            <div className="avatar avatar-online avatar-placeholder">
              <div className="bg-neutral text-neutral-content w-8 rounded-full dropdown">
                <span className="text-xs">UI</span>
              </div>
            </div>
            <div className="text-sm">
              Joshua Catapan <br />{" "}
              <span
                className="text-xs tracking-wide text-blue-500 cursor-pointer hover:underline"
                onClick={() =>
                  document.getElementById("change_pass_modal_3").showModal()
                }
              >
                Change Password
              </span>
            </div>

            <div className=" ml-6 tooltip tooltip-bottom" data-tip="Logout">
              <FaSignOutAlt
                className="text-2xl cursor-pointer"
                onClick={() => navigate("/login")}
              />
            </div>
          </div>
          {/* <button
            className="btn btn-outline w-full hover:bg-gray-800 hover:text-white flex items-center gap-2"
            onClick={handleLogout}
          >
            <span className="group relative">
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
          </button> */}

          <ThemeSwitcher />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <aside className="md:hidden fixed inset-0 bg-base-100 border-r-2 border-emerald-300 dark:border-emerald-600 shadow-lg z-40 flex flex-col w-50 ">
          <nav className="flex-1 p-3 space-y-2 mt-12">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`btn btn-ghost w-full justify-start flex items-center gap-2 ${
                  location.pathname === link.to ? "bg-gray-800 text-white" : ""
                }`}
                onClick={() => setCandidacyOpen(false)}
                title={link.label}
              >
                {link.icon}
                <span className="text-xs">{link.label}</span>
              </Link>
            ))}
            <button
              type="button"
              className="btn btn-ghost w-full justify-start flex items-center gap-2"
              onClick={() => {
                setCandidacyOpen((prev) => !prev);
                if (!candidacyOpen) {
                  navigate("/admin/candidacy/ssg");
                }
              }}
              title="Candidacy"
            >
              <FaPlus />
              <span className="text-xs">Candidacy</span>
              {candidacyOpen ? <FaChevronDown /> : <FaChevronUp />}
            </button>
            {candidacyOpen && (
              <div className="pl-2 mt-2 space-y-1">
                {filteredCandidacyLinks.map((link) => (
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
                    <span className="text-xs">{link.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>
          <div className="p-3 border-t">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="avatar avatar-online avatar-placeholder">
                <div className="bg-neutral text-neutral-content w-8 rounded-full dropdown">
                  <span className="text-xs">UI</span>
                </div>
              </div>
              <div className="text-sm">
                Joshua Catapan <br />{" "}
                <span
                  className="text-xs tracking-wide text-blue-500 cursor-pointer hover:underline"
                  onClick={() =>
                    document.getElementById("change_pass_modal_3").showModal()
                  }
                >
                  Change Password
                </span>
              </div>

              <div
                className="tooltip tooltip-bottom border p-1 w-full flex justify-center rounded"
                data-tip="Logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="text-2xl cursor-pointer" />
              </div>
            </div>
            <ThemeSwitcher />
          </div>
        </aside>
      )}

      <dialog id="change_pass_modal_3" className="modal">
        <div className="modal-box lg:w-96 ">
          <form method="dialog">
            {/* Close button */}
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>

            <h3 className="font-bold text-lg tracking-wider">
              Change Password
            </h3>

            {/* Current Password */}
            <div className="flex flex-col form-control w-full mt-4 relative">
              <label className="text-sm tracking-wider">Current Password</label>
              <input
                className="border p-2 pr-10 rounded"
                type={showCurrent ? "text" : "password"}
                placeholder="Current Password"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-base-content/60"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col form-control w-full mt-4 relative">
              <label className="text-sm tracking-wider">New Password</label>
              <input
                className="border p-2 pr-10 rounded"
                type={showNew ? "text" : "password"}
                placeholder="New Password"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-base-content/60"
                onClick={() => setShowNew(!showNew)}
              >
                {showCurrent ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col form-control w-full mt-4 relative">
              <label className="text-sm tracking-wider">Confirm Password</label>
              <input
                className="border p-2 pr-10 rounded"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
              />
              <div
                className="absolute right-3 top-9 cursor-pointer text-base-content/60"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showCurrent ? <FaEye /> : <FaEyeSlash />}
              </div>
            </div>

            <button className="btn btn-secondary w-full mt-4">Submit</button>
          </form>
        </div>
      </dialog>
    </>
  );
}
