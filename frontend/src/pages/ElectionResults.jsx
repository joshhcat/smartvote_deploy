import { useState, useEffect } from "react";
import axios from "axios";
import { FaUsers, FaVoteYea, FaChartBar } from "react-icons/fa";
import Loader from "../components/Loader";

// Department colors
const deptColors = {
  CCS: "bg-blue-500",
  CTE: "bg-orange-500",
  CBA: "bg-green-500",
  PYSCH: "bg-purple-500",
  CJE: "bg-red-500",
  CHTM: "bg-yellow-500",
  CAHS: "bg-pink-500",
  BSIT: "bg-blue-500",
  BSA: "bg-green-500",
  CRIMINOLOGY: "bg-red-500",
  BEED: "bg-orange-500",
  Unknown: "bg-gray-500",
};

// Year level colors
const yearColors = {
  "1st Year": "bg-blue-500",
  "2nd Year": "bg-green-500",
  "3rd Year": "bg-yellow-500",
  "4th Year": "bg-red-500",
  "5th Year+": "bg-purple-500",
};

// Gender colors
const genderColors = {
  Male: "bg-blue-600",
  Female: "bg-pink-500",
  Other: "bg-purple-500",
};

// All election types
const ALL_ELECTION_TYPES = [
  { id: "SSG", label: "SSG Election" },
  { id: "BSIT", label: "BSIT Election" },
  { id: "BSA", label: "BSA Election" },
  { id: "BEED", label: "BEED Election" },
  { id: "CRIMINOLOGY", label: "CRIMINOLOGY Election" },
  { id: "PSYCH", label: "PSYCH Election" },
];

// SSG Positions
const SSG_POSITIONS = [
  { key: "president", label: "President" },
  { key: "vice_president", label: "Vice President" },
  { key: "secretary", label: "Secretary" },
  { key: "treasurer", label: "Treasurer" },
  { key: "auditor", label: "Auditor" },
  { key: "mmo", label: "MMO" },
];

// Department Positions
const DEPT_POSITIONS = [
  { key: "president", label: "President" },
  { key: "vice_president", label: "Vice President" },
  { key: "secretary", label: "Secretary" },
  { key: "treasurer", label: "Treasurer" },
  { key: "mmo", label: "MMO" },
  { key: "representatives", label: "Representatives" },
];

// Medal colors for rankings
const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return {
        bg: "bg-green-50",
        label: "1st Place",
        border: "border-green-200",
      };
    case 2:
      return {
        bg: "bg-green-50",
        label: "2nd Place",
        border: "border-green-200",
      };
    case 3:
      return {
        bg: "bg-green-50",
        label: "3rd Place",
        border: "border-green-200",
      };
    default:
      return {
        bg: "bg-green-50",
        label: `${rank}th Place`,
        border: "border-green-200",
      };
  }
};

export default function ElectionResults() {
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [totalVoters, setTotalVoters] = useState(0);
  const [electionStatus, setElectionStatus] = useState("CLOSED");
  const [statistics, setStatistics] = useState(null);

  const admin = JSON.parse(localStorage.getItem("AdminData"));
  const adminDepartments = admin?.[0]?.departments?.split(",").map(d => d.trim().toUpperCase()) || [];

  // Department mappings: which admin department can see which election results
  const departmentElectionMap = {
    "SSG": ["SSG"],
    "BSIT": ["BSIT"],
    "CCS": ["BSIT"], // CCS admins see BSIT election results
    "BSA": ["BSA"],
    "CBA": ["BSA"], // CBA admins see BSA election results
    "BEED": ["BEED"],
    "CTE": ["BEED"], // CTE admins see BEED election results
    "CRIMINOLOGY": ["CRIMINOLOGY"],
    "CRIM": ["CRIMINOLOGY"],
    "CJE": ["CRIMINOLOGY"], // CJE admins see CRIMINOLOGY election results
    "PSYCH": ["PSYCH"],
    "PSYCHOLOGY": ["PSYCH"],
  };

  // Filter election types based on admin's departments
  const getFilteredElectionTypes = () => {
    const allowedElections = new Set();
    
    // Check each admin department and add allowed elections
    adminDepartments.forEach((dept) => {
      const deptUpper = dept.toUpperCase();
      const allowedElectionIds = departmentElectionMap[deptUpper] || [];
      allowedElectionIds.forEach((electionId) => {
        allowedElections.add(electionId);
      });
    });

    // Return only elections that are in the allowed set
    return ALL_ELECTION_TYPES.filter((election) => {
      return allowedElections.has(election.id);
    });
  };

  const filteredElectionTypes = getFilteredElectionTypes();

  // Get positions based on election type
  const getPositions = () => {
    if (selectedElection === "SSG") {
      return SSG_POSITIONS;
    }
    return DEPT_POSITIONS;
  };

  const positions = getPositions();

  // Fetch election results
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/get-election-results/${selectedElection}`
      );

      if (response.data.success) {
        setResults(response.data.data.results || {});
        setTotalVoters(response.data.data.totalVoters || 0);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    }

    // Also fetch election status
    try {
      const statusResponse = await axios.post(
        `http://localhost:3004/smart-vote/get-election-schedule/${selectedElection}`
      );
      if (statusResponse.data.success) {
        setElectionStatus(statusResponse.data.data[0]?.status || "CLOSED");
      }
    } catch (error) {
      console.error("Error fetching election status:", error);
    }

    // Fetch statistics
    try {
      const statsResponse = await axios.post(
        `http://localhost:3004/smart-vote/get-election-statistics/${selectedElection}`
      );
      if (statsResponse.data.success) {
        setStatistics(statsResponse.data.data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setStatistics(null);
    }

    setIsLoading(false);
  };

  // Helper functions
  const getPercentageStat = (count, total) => {
    if (!total || total === 0) return "0.0";
    return ((count / total) * 100).toFixed(1);
  };

  const getMaxValue = (data) => {
    if (!data) return 1;
    const values = Object.values(data);
    return Math.max(...values, 1);
  };

  useEffect(() => {
    if (filteredElectionTypes.length > 0) {
      // Check if current selected election is still valid
      const isValidElection = selectedElection && filteredElectionTypes.find(e => e.id === selectedElection);
      if (!isValidElection) {
        // If current selection is not valid or null, set to first available
        setSelectedElection(filteredElectionTypes[0].id);
      }
    } else {
      // If no elections are available, clear selection
      setSelectedElection(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredElectionTypes.length]);

  useEffect(() => {
    if (selectedElection) {
      fetchResults();
    }
  }, [selectedElection]);

  // Calculate percentage
  const getPercentage = (votes) => {
    if (totalVoters === 0) return 0;
    return ((votes / totalVoters) * 100).toFixed(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <Loader />
        </div>
      )}

      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Election Results
            </h1>
            <p className="text-base-content/60 mt-1">
              View the ranking of candidates for each position
            </p>
          </div>

          {/* Election Type Selector */}
          {filteredElectionTypes.length > 0 ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Election:</span>
              <select
                className="select select-bordered"
                value={selectedElection || ""}
                onChange={(e) => setSelectedElection(e.target.value)}
              >
                {filteredElectionTypes.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="alert alert-warning">
              <span>You do not have access to any election results based on your assigned departments.</span>
            </div>
          )}
        </div>

        {/* Show message if no elections available */}
        {filteredElectionTypes.length === 0 && (
          <div className="bg-base-100 rounded-xl p-12 text-center shadow">
            <h3 className="text-xl font-bold text-base-content/70">No Access</h3>
            <p className="text-base-content/50 mt-2">
              You do not have permission to view election results for any department.
            </p>
          </div>
        )}

        {/* Stats Cards - Only show if election is selected */}
        {selectedElection && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <div className="stat-figure text-emerald-700">
              <FaVoteYea className="text-3xl" />
            </div>
            <div className="stat-title">Total Votes Cast</div>
            <div className="stat-value text-emerald-700">{totalVoters}</div>
          </div>
          <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <div className="stat-figure text-emerald-800">
              <FaUsers className="text-3xl" />
            </div>
            <div className="stat-title">Positions</div>
            <div className="stat-value text-emerald-800">{positions.length}</div>
          </div>
          <div className="stat bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <div className="stat-figure">
              {electionStatus === "OPEN" ? (
                <span className="badge badge-success badge-lg">ONGOING</span>
              ) : (
                <span className="badge badge-error badge-lg">CLOSED</span>
              )}
            </div>
            <div className="stat-title">Election Status</div>
            <div className="stat-value text-sm">{selectedElection}</div>
          </div>
        </div>
        )}

        {/* Final Results - Winners Section */}
        {selectedElection && electionStatus === "CLOSED" && Object.keys(results).length > 0 && (
          <div className="bg-base-100 rounded-xl shadow-lg p-6 mb-8 border-2 border-emerald-300 dark:border-emerald-600">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-green-700">
                Final Results - Winners
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((position) => {
                const positionResults = results[position.key] || [];
                const winner = positionResults[0]; // First place is the winner
                
                if (!winner) return null;
                
                return (
                  <div
                    key={position.key}
                    className="bg-base-100 rounded-lg shadow-md p-4 border-2 border-emerald-300 dark:border-emerald-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-base-content">
                        {position.label}
                      </h3>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-lg p-4 text-base-content">
                      <div className="text-sm text-base-content/70 mb-1">Winner</div>
                      <div className="text-xl font-bold mb-2 text-emerald-700 dark:text-emerald-400">{winner.name}</div>
                      <div className="flex justify-between items-center text-sm text-base-content/80">
                        <span>Votes:</span>
                        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{winner.votes}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 text-sm text-base-content/80">
                        <span>Percentage:</span>
                        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{getPercentage(winner.votes)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics Section - Only show if election is selected */}
        {selectedElection && statistics && (
          <div className="bg-base-100 rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartBar className="text-emerald-700" />
              Voting Statistics
            </h2>

            {/* Gender Breakdown */}
            {statistics.byGender && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">👥 Votes by Gender</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {Object.entries(statistics.byGender).map(([gender, count]) => (
                    <div
                      key={gender}
                      className="bg-base-200 rounded-lg p-4 text-center"
                    >
                      <div className={`w-14 h-14 mx-auto mb-2 rounded-full ${genderColors[gender] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg`}>
                        {count}
                      </div>
                      <p className="font-medium">{gender}</p>
                      <p className="text-xs text-base-content/60">
                        {getPercentageStat(count, statistics.totalVotes)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Department breakdown for SSG elections */}
            {selectedElection === "SSG" && statistics.byDepartment && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">🏫 Votes by Department</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {Object.entries(statistics.byDepartment).map(([dept, count]) => (
                    <div
                      key={dept}
                      className="bg-base-200 rounded-lg p-4 text-center"
                    >
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${deptColors[dept] || 'bg-gray-500'} flex items-center justify-center text-white font-bold`}>
                        {count}
                      </div>
                      <p className="font-medium text-sm">{dept}</p>
                      <p className="text-xs text-base-content/60">
                        {getPercentageStat(count, statistics.totalVotes)}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Gender per department table */}
                {statistics.departmentGender && (
                  <div className="overflow-x-auto mt-4">
                    <h4 className="text-sm font-medium mb-3">Gender per Department</h4>
                    <table className="table table-sm w-full">
                      <thead>
                        <tr>
                          <th>Department</th>
                          <th className="text-blue-600">Male</th>
                          <th className="text-pink-500">Female</th>
                          <th className="text-purple-500">Other</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(statistics.departmentGender).map(([dept, genders]) => (
                          <tr key={dept}>
                            <td className="font-medium">{dept}</td>
                            <td>{genders.Male || 0}</td>
                            <td>{genders.Female || 0}</td>
                            <td>{genders.Other || 0}</td>
                            <td className="font-bold">
                              {(genders.Male || 0) + (genders.Female || 0) + (genders.Other || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Bar chart */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(statistics.byDepartment).map(([dept, count]) => (
                      <div key={dept} className="flex items-center gap-2">
                        <span className="w-24 text-sm font-medium">{dept}</span>
                        <div className="flex-1 bg-base-200 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full ${deptColors[dept] || 'bg-gray-500'} flex items-center justify-end pr-2`}
                            style={{
                              width: `${(count / getMaxValue(statistics.byDepartment)) * 100}%`,
                              minWidth: count > 0 ? '30px' : '0',
                            }}
                          >
                            <span className="text-xs text-white font-medium">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Year level breakdown for department elections */}
            {selectedElection !== "SSG" && statistics.byYearLevel && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">📚 Votes by Year Level</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  {Object.entries(statistics.byYearLevel).map(([year, count]) => (
                    <div
                      key={year}
                      className="bg-base-200 rounded-lg p-4 text-center"
                    >
                      <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${yearColors[year] || 'bg-gray-500'} flex items-center justify-center text-white font-bold`}>
                        {count}
                      </div>
                      <p className="font-medium text-sm">{year}</p>
                      <p className="text-xs text-base-content/60">
                        {getPercentageStat(count, statistics.totalVotes)}%
                      </p>
                    </div>
                  ))}
                </div>

                {/* Gender per year level table */}
                {statistics.yearLevelGender && (
                  <div className="overflow-x-auto mt-4">
                    <h4 className="text-sm font-medium mb-3">Gender per Year Level</h4>
                    <table className="table table-sm w-full">
                      <thead>
                        <tr>
                          <th>Year Level</th>
                          <th className="text-blue-600">Male</th>
                          <th className="text-pink-500">Female</th>
                          <th className="text-purple-500">Other</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(statistics.yearLevelGender).map(([year, genders]) => (
                          <tr key={year}>
                            <td className="font-medium">{year}</td>
                            <td>{genders.Male || 0}</td>
                            <td>{genders.Female || 0}</td>
                            <td>{genders.Other || 0}</td>
                            <td className="font-bold">
                              {(genders.Male || 0) + (genders.Female || 0) + (genders.Other || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Bar chart */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(statistics.byYearLevel).map(([year, count]) => (
                      <div key={year} className="flex items-center gap-2">
                        <span className="w-20 text-sm font-medium">{year}</span>
                        <div className="flex-1 bg-base-200 rounded-full h-6 overflow-hidden">
                          <div
                            className={`h-full ${yearColors[year] || 'bg-gray-500'} flex items-center justify-end pr-2`}
                            style={{
                              width: `${(count / getMaxValue(statistics.byYearLevel)) * 100}%`,
                              minWidth: count > 0 ? '30px' : '0',
                            }}
                          >
                            <span className="text-xs text-white font-medium">{count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results by Position - Only show if election is selected */}
        {selectedElection && positions.map((position) => {
          const positionResults = results[position.key] || [];

          return (
            <div key={position.key} className="mb-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="badge badge-primary badge-lg">
                  {position.label}
                </span>
              </h2>

              {positionResults.length === 0 ? (
                <div className="bg-base-100 rounded-xl p-8 text-center text-base-content/60 shadow">
                  No votes recorded yet for this position
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {positionResults.map((candidate, index) => {
                    const rank = index + 1;
                    const style = getRankStyle(rank);
                    const percentage = getPercentage(candidate.votes);

                    return (
                      <div
                        key={candidate.name}
                        className={`card bg-base-100 shadow-lg border ${style.border} transition-transform hover:scale-105`}
                      >
                        <div className={`${style.bg} text-green-800 px-4 py-2 rounded-t-xl flex items-center justify-between`}>
                          <span className="font-bold">{style.label}</span>
                        </div>
                        <div className="card-body p-4">
                          <h3 className="card-title text-lg">{candidate.name}</h3>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-2xl font-bold text-emerald-700">
                              {candidate.votes}
                            </span>
                            <span className="text-sm text-base-content/60">votes</span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-base-200 rounded-full h-3 mt-2">
                            <div
                              className="h-3 rounded-full bg-emerald-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-right text-sm text-base-content/60 mt-1">
                            {percentage}% of total votes
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* No Results Message - Only show if election is selected */}
        {selectedElection && Object.keys(results).length === 0 && !isLoading && (
          <div className="bg-base-100 rounded-xl p-12 text-center shadow">
            <FaVoteYea className="text-6xl text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-base-content/70">No Results Yet</h3>
            <p className="text-base-content/60 mt-2">
              Votes will appear here once students start voting
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
