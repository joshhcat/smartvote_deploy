import { useState, useEffect } from "react";
import { FaUsers, FaCheckCircle, FaTimesCircle, FaSearch, FaEnvelope, FaHistory } from "react-icons/fa";
import axios from "axios";

export default function VotingHistory() {
  const [electionType, setElectionType] = useState("SSG");
  const [votingData, setVotingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("notVoted"); // 'voted' or 'notVoted'
  const [adminData, setAdminData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("AdminData");
    if (stored) {
      setAdminData(JSON.parse(stored));
    }
  }, []);

  // Get available election types based on admin's departments
  const getElectionTypes = () => {
    const types = ["SSG"];
    if (adminData && adminData[0]?.departments) {
      const depts = adminData[0].departments.split(",");
      depts.forEach((dept) => {
        const trimmedDept = dept.trim();
        if (trimmedDept && !types.includes(trimmedDept)) {
          types.push(trimmedDept);
        }
      });
    }
    return types;
  };

  const fetchVotingHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/get-voting-history/${electionType}`
      );
      if (response.data.success) {
        setVotingData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch voting history");
        setVotingData(null);
      }
    } catch (error) {
      console.error("Error fetching voting history:", error);
      setError("An error occurred while fetching voting history. Please try again.");
      setVotingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminData) {
      fetchVotingHistory();
    }
  }, [electionType, adminData]);

  // Filter data based on search term
  const filterData = (list) => {
    if (!searchTerm) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (voter) =>
        voter.fullname.toLowerCase().includes(term) ||
        voter.student_id.toLowerCase().includes(term) ||
        voter.department.toLowerCase().includes(term) ||
        voter.course?.toLowerCase().includes(term)
    );
  };

  const displayList = viewMode === "voted" ? votingData?.voted : votingData?.notVoted;
  const filteredList = displayList ? filterData(displayList) : [];

  // Calculate participation rate
  const participationRate = votingData
    ? ((votingData.votedCount / votingData.totalVoters) * 100).toFixed(1)
    : 0;

  return (
    <div className="p-6 min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-base-content">Voting History</h1>
          <p className="text-base-content/60">
            Track voter participation and see which students haven't voted yet
          </p>
        </div>

        {/* Election Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Election</label>
          <select
            value={electionType}
            onChange={(e) => setElectionType(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            {getElectionTypes().map((type) => (
              <option key={type} value={type}>
                {type} Election
              </option>
            ))}
          </select>
        </div>

        {/* Stats Cards */}
        {votingData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
              <div className="stat-figure text-emerald-700">
                <FaUsers className="text-3xl" />
              </div>
              <div className="stat-title">Total Voters</div>
              <div className="stat-value text-emerald-700">{votingData.totalVoters}</div>
              <div className="stat-desc">Registered for {electionType}</div>
            </div>

            <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
              <div className="stat-figure text-emerald-600">
                <FaCheckCircle className="text-3xl" />
              </div>
              <div className="stat-title">Already Voted</div>
              <div className="stat-value text-emerald-600">{votingData.votedCount}</div>
              <div className="stat-desc">{participationRate}% participation</div>
            </div>

            <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
              <div className="stat-figure text-error">
                <FaTimesCircle className="text-3xl" />
              </div>
              <div className="stat-title">Not Yet Voted</div>
              <div className="stat-value text-error">{votingData.notVotedCount}</div>
              <div className="stat-desc">Pending voters</div>
            </div>

            <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
              <div className="stat-figure text-info">
                <div className="radial-progress text-info" style={{ "--value": participationRate, "--size": "3rem" }}>
                  {participationRate}%
                </div>
              </div>
              <div className="stat-title">Participation Rate</div>
              <div className="stat-value text-info">{participationRate}%</div>
              <div className="stat-desc">Current turnout</div>
            </div>
          </div>
        )}

        {/* View Toggle and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${viewMode === "notVoted" ? "tab-active" : ""}`}
              onClick={() => setViewMode("notVoted")}
            >
              <FaTimesCircle className="mr-2" />
              Not Voted ({votingData?.notVotedCount || 0})
            </button>
            <button
              className={`tab ${viewMode === "voted" ? "tab-active" : ""}`}
              onClick={() => setViewMode("voted")}
            >
              <FaCheckCircle className="mr-2" />
              Already Voted ({votingData?.votedCount || 0})
            </button>
          </div>

          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
              <input
                type="text"
                placeholder="Search by name, student ID, department..."
                className="input input-bordered w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-6">
            <FaHistory />
            <span>{error}</span>
          </div>
        )}

        {/* Voters Table */}
        <div className="bg-base-100 rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center p-12">
              <div className="text-center">
                <FaHistory className="text-4xl text-base-content/40 mx-auto mb-4" />
                <p className="text-base-content/60">{error}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr className="bg-base-200">
                    <th>#</th>
                    <th>Student ID</th>
                    <th>Full Name</th>
                    <th>Department</th>
                    <th>Course</th>
                    <th>Year Level</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length > 0 ? (
                    filteredList.map((voter, index) => (
                      <tr key={voter.voters_id || index}>
                        <td>{index + 1}</td>
                        <td className="font-mono">{voter.student_id}</td>
                        <td className="font-medium">{voter.fullname}</td>
                        <td>
                          <span className="badge badge-outline">{voter.department}</span>
                        </td>
                        <td>{voter.course || "-"}</td>
                        <td>{voter.year_level || "-"}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <FaEnvelope className="text-base-content/60" />
                            <span className="text-sm">{voter.email}</span>
                          </div>
                        </td>
                        <td>
                          {viewMode === "voted" ? (
                            <span className="badge badge-success gap-1">
                              <FaCheckCircle /> Voted
                            </span>
                          ) : (
                            <span className="badge badge-error gap-1">
                              <FaTimesCircle /> Not Voted
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                        <td colSpan="8" className="text-center py-8 text-base-content/60">
                        {searchTerm
                          ? "No voters found matching your search"
                          : viewMode === "voted"
                          ? "No voters have voted yet"
                          : "All voters have already voted!"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredList.length > 0 && (
          <div className="mt-4 text-sm text-base-content/60 text-right">
            Showing {filteredList.length} of {displayList?.length || 0} {viewMode === "voted" ? "voted" : "non-voted"} students
          </div>
        )}
      </div>
    </div>
  );
}


