import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    studentsCount: 0,
    votersCount: 0,
    adminsCount: 0,
    votersByDepartment: [],
  });
  const [loading, setLoading] = useState(true);

  // Get admin data to determine department filter
  const adminData = JSON.parse(localStorage.getItem("AdminData") || "[]");
  const adminDepartments = adminData[0]?.departments || "";
  const isSSGAdmin = adminDepartments.includes("SSG");

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/get-dashboard-stats",
        {
          department: isSSGAdmin ? null : adminDepartments,
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  // Prepare chart data from voters by department
  const departments = stats.votersByDepartment.map((d) => d.department || "Unknown");
  const voterCounts = stats.votersByDepartment.map((d) => d.count || 0);

const lineData = {
    labels: departments.length > 0 ? departments : ["CCS", "CTE", "CBA", "PYSCH", "CJE"],
  datasets: [
    {
        label: "Registered Voters",
        data: voterCounts.length > 0 ? voterCounts : [0, 0, 0, 0, 0],
      borderColor: "#059669",
      backgroundColor: "rgba(5, 150, 105, 0.2)",
      tension: 0.4,
    },
  ],
};

const barData = {
    labels: departments.length > 0 ? departments : ["CCS", "CTE", "CBA", "PYSCH", "CJE"],
  datasets: [
    {
      label: "Registered Voters",
        data: voterCounts.length > 0 ? voterCounts : [0, 0, 0, 0, 0],
        backgroundColor: ["#059669", "#047857", "#065f46", "#10b981", "#34d399"],
    },
  ],
};

  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-center md:text-left text-base-content">
          Welcome, <span className="text-emerald-600 dark:text-emerald-400">Admin!</span>
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg text-emerald-700"></span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats shadow bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <div className="stat">
                  <div className="stat-figure text-emerald-600 dark:text-emerald-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
              <div className="stat-title font-medium text-base-content/70">Students</div>
                  <div className="stat-value text-emerald-600 dark:text-emerald-400">{stats.studentsCount}</div>
                  <div className="stat-desc text-base-content/60">Total enrolled students</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <div className="stat">
                  <div className="stat-figure text-emerald-600 dark:text-emerald-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
              <div className="stat-title font-medium text-base-content/70">Registered Voters</div>
                  <div className="stat-value text-emerald-600 dark:text-emerald-400">{stats.votersCount}</div>
                  <div className="stat-desc text-base-content/60">Voters who can cast votes</div>
            </div>
          </div>
          <div className="stats shadow bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <div className="stat">
                  <div className="stat-figure text-emerald-700 dark:text-emerald-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      className="inline-block w-8 h-8 stroke-current"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
              <div className="stat-title font-medium text-base-content/70">Admins</div>
                  <div className="stat-value text-emerald-700 dark:text-emerald-500">{stats.adminsCount}</div>
                  <div className="stat-desc text-base-content/60">System administrators</div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <h2 className="font-bold mb-2 text-center text-base-content">
                  Registered Voters by Department
                </h2>
            <Line data={lineData} />
          </div>
          <div className="bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg p-4 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <h2 className="font-bold mb-2 text-center text-base-content">
                  Voters Distribution
                </h2>
            <Bar data={barData} />
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
