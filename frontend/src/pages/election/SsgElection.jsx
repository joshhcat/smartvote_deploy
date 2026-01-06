import { useState, useEffect } from "react";
import {
  FaLayerGroup,
  FaMoneyCheck,
  FaRegEdit,
  FaUserCheck,
  FaUserPlus,
} from "react-icons/fa";
import OpenElection from "../../components/OpenElection";
import ElectionCountdown from "../../components/ElectionCountdown";
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
  Filler, // <-- Add this
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
  Legend,
  Filler // <-- Add this
);

const initialUsers = [
  {
    id: 1,
    name: "Dio Lupa",
    song: "Remaining Reason",
    img: "https://img.daisyui.com/images/profile/demo/1@94.webp",
    details: "Dio Lupa is a top artist this week. Song: Remaining Reason.",
  },
  {
    id: 2,
    name: "Jane Doe",
    song: "Sky High",
    img: "https://img.daisyui.com/images/profile/demo/2@94.webp",
    details: "Jane Doe's hit single Sky High is trending.",
  },
  {
    id: 3,
    name: "John Smith",
    song: "Night Drive",
    img: "https://img.daisyui.com/images/profile/demo/3@94.webp",
    details: "John Smith released Night Drive last month.",
  },
  {
    id: 4,
    name: "Alice Blue",
    song: "Ocean Eyes",
    img: "https://img.daisyui.com/images/profile/demo/4@94.webp",
    details: "Alice Blue's Ocean Eyes is a fan favorite.",
  },
  {
    id: 5,
    name: "Bob Green",
    song: "Mountain Call",
    img: "https://img.daisyui.com/images/profile/demo/5@94.webp",
    details: "Bob Green's Mountain Call is climbing the charts.",
  },
  {
    id: 6,
    name: "Bob Green",
    song: "Mountain Call",
    img: "https://img.daisyui.com/images/profile/demo/5@94.webp",
    details: "Bob Green's Mountain Call is climbing the charts.",
  },
  {
    id: 7,
    name: "Bob Green",
    song: "Mountain Call",
    img: "https://img.daisyui.com/images/profile/demo/5@94.webp",
    details: "Bob Green's Mountain Call is climbing the charts.",
  },
  {
    id: 8,
    name: "Bob Green",
    song: "Mountain Call",
    img: "https://img.daisyui.com/images/profile/demo/5@94.webp",
    details: "Bob Green's Mountain Call is climbing the charts.",
  },
];
const dept = "SSG";

export const SsgElection = () => {
  const [showElectionForm, setShowElectionForm] = useState(true);
  const [electionOpened, setElectionOpened] = useState(false);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const data = JSON.parse(localStorage.getItem("electionData"));
  const closeDate = data?.close_date;
  useEffect(() => {
    if (data && data?.status === "OPEN") {
      setElectionOpened(true);
      setShowElectionForm(false);
    } else {
      setElectionOpened(false);
      setShowElectionForm(true);
    }
  }, [data]);

  // Update countdown every second
  useEffect(() => {
    if (!electionOpened || !closeDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(closeDate);
      const diff = Math.max(0, end - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [electionOpened, closeDate]);

  const [users, setUsers] = useState(initialUsers);
  const [selected, setSelected] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Get users for current page
  const startIdx = (currentPage - 1) * usersPerPage;
  const paginatedUsers = users.slice(startIdx, startIdx + usersPerPage);

  const handleDelete = (id) => {
    setUsers(users.filter((u) => u.id !== id));
    if (selected && selected.id === id) setSelected(null);
    // If deleting last item on page, go to previous page if needed
    if (paginatedUsers.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const position = ["President", "Vice-President", "Auditor", "Secretary"];
  const presData = [2000, 5000, 7400, 300];
  const vicePresData = [9000, 2000, 2400, 6000];
  const auData = [400, 8000, 600, 800];
  const courses = [
    "BSIT",
    "BSA",
    "CTE",
    "HM",
    "BSED",
    "CRIMINOLOGY",
    "PSYCHOLOGY",
  ];
  const votedByCourse = [29000, 28000, 22400, 25000, 27000, 23000, 22000];

  const lineData = {
    labels: position,
    datasets: [
      {
        label: "Party A",
        data: presData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.4,
      },
      {
        label: "Party B",
        data: vicePresData,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.4,
      },
      {
        label: "Party C",
        data: auData,
        borderColor: "#f59e42",
        backgroundColor: "rgba(245,158,66,0.2)",
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: courses,
    datasets: [
      {
        label: "Voters Voted by Course",
        data: votedByCourse, // Example: one value from each array
        backgroundColor: [
          "#3b82f6", // blue
          "#10b981", // green
          "#f59e42", // orange
          "#a78bfa", // purple
          "#f43f5e", // pink
          "#fbbf24", // yellow
          "#6366f1", // indigo
        ],
        borderColor: [
          "#2563eb", // blue
          "#059669", // green
          "#ea580c", // orange
          "#7c3aed", // purple
          "#be185d", // pink
          "#f59e42", // yellow
          "#4f46e5", // indigo
        ],
        borderWidth: 2,
      },
    ],
  };

  // Add this near your other chart data
  const hours = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
  const votersPerHour = [10, 25, 40, 60, 80, 120, 90, 70, 50, 30];
  const waveData = {
    labels: hours,
    datasets: [
      {
        label: "Voters per Hour",
        data: votersPerHour,
        fill: true,
        backgroundColor: "rgba(59,130,246,0.2)", // blue with opacity
        borderColor: "#3b82f6",
        tension: 0.5,
        pointRadius: 3,
      },
    ],
  };
  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      <div className="flex-1 p-8">
        <div>
          {/* Election Form */}
          {showElectionForm && (
            <OpenElection
              dept={dept}
              setElectionOpened={setElectionOpened}
              setShowElectionForm={setShowElectionForm}
            />
          )}
          {!showElectionForm && (
            <div className="flex flex-col mb-6 w-full">
              <ElectionCountdown countdown={countdown} dept={dept} />

              <div className="grid grid-cols-1  lg:grid-cols-4 gap-6 mb-2 mt-4">
                <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:scale-95 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                  <div className="card-body cursor-pointer px-6">
                    <h2 className="text-sm font-medium">No. of Candidates</h2>
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-extrabold text-red-500">
                        18
                      </h1>
                      <FaUserPlus className="text-2xl" />
                    </div>
                  </div>
                </div>
                <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:scale-95 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                  <div className="card-body cursor-pointer px-6">
                    <h2 className="text-sm font-medium">No. of Position</h2>
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-extrabold text-purple-500">
                        10
                      </h1>
                      <FaLayerGroup className="text-2xl" />
                    </div>
                  </div>
                </div>
                <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:scale-95 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                  <div className="card-body cursor-pointer transition px-6">
                    <h2 className="text-sm font-medium">Total Voters</h2>
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-extrabold text-green-500">
                        1000
                      </h1>
                      <FaMoneyCheck className="text-2xl" />
                    </div>
                  </div>
                </div>
                <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:scale-95 hover:shadow-md hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                  <div className="card-body cursor-pointer px-6">
                    <h2 className="text-sm font-medium">Voters Voted</h2>
                    <div className="flex items-center justify-between">
                      <h1 className="text-4xl font-extrabold text-base-content">
                        500
                      </h1>
                      <FaUserCheck className="text-2xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User List and Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full mt-4">
                  <div className="bg-base-100 rounded-md h-88 shadow p-4 flex flex-col justify-center">
                    <h2 className="font-bold mb-2 text-center">Line Chart</h2>
                    <Line data={lineData} />
                  </div>
                </div>
                <div className="w-full mt-4">
                  <div className="bg-base-100 rounded-md h-88 shadow p-4 flex flex-col justify-center">
                    <h2 className="font-bold mb-2 text-center">Bar Chart</h2>
                    <Bar data={barData} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full mt-4 flex justify-center">
                  <div
                    className="bg-base-100 rounded-md w-full h-88 shadow p-4 flex flex-col justify-center"
                    style={{ height: 350 }} // Set fixed height for the chart container
                  >
                    <h2 className="font-bold mb-2 text-center">
                      Voters Every Hour (Wave Chart)
                    </h2>
                    <Line
                      data={waveData}
                      options={{ maintainAspectRatio: false }}
                      height={250} // Chart height
                    />
                  </div>
                </div>
                <div className="w-full  mt-4 ">
                  <ul className="list bg-base-100 rounded-box shadow-md p-4 h-88 ">
                    <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                      Recently Student Voters
                    </li>
                    {paginatedUsers.map((user) => (
                      <li
                        key={user.id}
                        className={`list-row cursor-pointer hover:bg-base-200 transition flex items-center gap-2 px-4 py-2`}
                        onClick={() => setSelected(user)}
                      >
                        <img
                          className="size-10 rounded-box"
                          src={user.img}
                          alt={user.name}
                        />
                        <div className="flex-1">
                          <div>{user.name}</div>
                          <div className="text-xs uppercase font-semibold opacity-60">
                            {user.song}
                          </div>
                        </div>
                        <button
                          className="btn btn-square btn-ghost"
                          title="Play"
                        >
                          <svg
                            className="size-[1.2em]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <g
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth="2"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path d="M6 3L20 12 6 21 6 3z"></path>
                            </g>
                          </svg>
                        </button>
                        <button
                          className="btn btn-square btn-ghost text-error"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user.id);
                          }}
                        >
                          <svg
                            className="size-[1.2em]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <g
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              strokeWidth="2"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path d="M6 6L18 18M6 18L18 6"></path>
                            </g>
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* Pagination Controls */}
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <button
                      className="btn btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Prev
                    </button>
                    <span className="px-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      className="btn btn-sm"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </button>
                  </div>
                  {selected && (
                    <div>
                      {/* Modal Backdrop - more transparent */}
                      <div
                        className="fixed inset-0 bg-black opacity-70  z-40"
                        onClick={() => setSelected(null)}
                      ></div>
                      {/* Modal Content */}
                      <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-base-100 rounded-box shadow-lg p-6 w-full max-w-md relative">
                          <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => setSelected(null)}
                          >
                            ✕
                          </button>
                          <div className="flex items-center gap-4 mb-2">
                            <img
                              className="size-12 rounded-box"
                              src={selected.img}
                              alt={selected.name}
                            />
                            <div>
                              <div className="font-bold text-lg">
                                {selected.name}
                              </div>
                              <div className="text-xs uppercase font-semibold opacity-60">
                                {selected.song}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">{selected.details}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Countdown */}
        </div>
      </div>
    </div>
  );
};
