import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const [electionType, setElectionType] = useState("SSG");
  const [results, setResults] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [electionStatus, setElectionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student data from localStorage
  const userData = JSON.parse(localStorage.getItem("UserData") || "{}");
  const studentDepartment = userData?.department || "CCS";

  // Available elections based on student's department
  const getAvailableElections = () => {
    const elections = [{ value: "SSG", label: "SSG Election" }];
    
    // Add department-specific election
    const deptElections = {
      CCS: { value: "CCS", label: "CCS Election (BSIT)" },
      CBA: { value: "CBA", label: "CBA Election (BSA)" },
      CJE: { value: "CJE", label: "CJE Election (CRIM)" },
      CHTM: { value: "CTE", label: "CTEElection" },
      CAHS: { value: "PSHYCHOLOGY", label: "PSHYCHOLOGY Election" },
    };

    if (deptElections[studentDepartment]) {
      elections.push(deptElections[studentDepartment]);
    }

    return elections;
  };

  const positions = [
    "president",
    "vice_president",
    "secretary",
    "treasurer",
    "auditor",
    "mmo",
    "representatives",
  ];

  const positionLabels = {
    president: "President",
    vice_president: "Vice President",
    secretary: "Secretary",
    treasurer: "Treasurer",
    auditor: "Auditor",
    mmo: "MMO",
    representatives: "Representatives",
  };

  // Department colors for charts
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
  };

  // Gender colors
  const genderColors = {
    Male: "bg-blue-500",
    Female: "bg-pink-500",
    Other: "bg-purple-500",
  };

  // Fetch election results
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch election status
      try {
        const statusResponse = await axios.post(
          `http://localhost:3004/smart-vote/get-election-schedule/${electionType}`
        );
        if (statusResponse.data.success) {
          setElectionStatus(statusResponse.data.data[0] || null);
        }
      } catch (err) {
        console.log("No election schedule found");
        setElectionStatus(null);
      }

      // Fetch election results
      try {
        const resultsResponse = await axios.post(
          `http://localhost:3004/smart-vote/get-election-results/${electionType}`
        );
        if (resultsResponse.data.success) {
          setResults(resultsResponse.data.data);
        }
      } catch (err) {
        console.log("No election results found");
        setResults(null);
      }

      // Fetch election statistics
      try {
        const statsResponse = await axios.post(
          `http://localhost:3004/smart-vote/get-election-statistics/${electionType}`
        );
        if (statsResponse.data.success) {
          setStatistics(statsResponse.data.data);
        }
      } catch (err) {
        console.log("No statistics found");
        setStatistics(null);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch election data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [electionType]);

  const getStatusBadge = (status) => {
    if (status === "OPEN") {
      return <span className="badge badge-success">OPEN</span>;
    } else if (status === "CLOSED") {
      return <span className="badge badge-error">CLOSED</span>;
    }
    return <span className="badge badge-warning">NOT SCHEDULED</span>;
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  // Calculate percentage
  const getPercentage = (votes, total) => {
    if (!total || total === 0) return "0.0";
    return ((votes / total) * 100).toFixed(1);
  };

  // Get max value for bar chart scaling
  const getMaxValue = (data) => {
    if (!data) return 1;
    const values = Object.values(data);
    return Math.max(...values, 1);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="pt-20 px-4 md:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-base-content">📊 Live Election <span className="text-emerald-600 dark:text-emerald-400">Results</span></h1>
              
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                className="select select-bordered min-w-[200px] bg-base-100 border-emerald-300 dark:border-emerald-600 focus:border-emerald-500 dark:focus:border-emerald-500"
                value={electionType}
                onChange={(e) => setElectionType(e.target.value)}
              >
                {getAvailableElections().map((election) => (
                  <option key={election.value} value={election.value}>
                    {election.label}
                  </option>
                ))}
              </select>
              <div className="flex-shrink-0">
                {getStatusBadge(electionStatus?.status)}
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Total Voters Card */}
              <div className="card bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 shadow-lg mb-6 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <div className="card-body py-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-base-content">Total Votes Cast</h3>
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {results?.totalVoters || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistics Section */}
              {statistics && (
                <div className="card bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 shadow-lg mb-6 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                  <div className="card-body">
                    <h2 className="card-title text-lg mb-4 text-base-content">
                      📈 Voting <span className="text-emerald-600 dark:text-emerald-400">Statistics</span>
                    </h2>

                    {/* Gender Breakdown - Shown for all elections */}
                    {statistics.byGender && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">👥 Votes by Gender</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {Object.entries(statistics.byGender).map(([gender, count]) => (
                            <div
                              key={gender}
                              //CARDS
                              className="bg-base-200 rounded-lg p-4 text-center"
                            >
                              <div className={`w-14 h-14 mx-auto mb-2 rounded-full ${genderColors[gender] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg`}>
                                {count}
                              </div>
                              <p className="font-medium">{gender}</p>
                              <p className="text-xs text-base-content/60">
                                {getPercentage(count, statistics.totalVotes)}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {electionType === "SSG" && statistics.byDepartment ? (
                      // Department breakdown for SSG elections
                      <div>
                        <h3 className="font-semibold mb-3">🏫 Votes by Department</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                          {Object.entries(statistics.byDepartment).map(([dept, count]) => (
                            <div
                              key={dept}
                              //CARDS
                              className="bg-base-200 rounded-lg p-4 text-center"
                            >
                              <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${deptColors[dept] || 'bg-gray-500'} flex items-center justify-center text-white font-bold`}>
                                {count}
                              </div>
                              <p className="font-medium text-sm">{dept}</p>
                              <p className="text-xs text-base-content/60">
                                {getPercentage(count, statistics.totalVotes)}%
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Gender breakdown per department */}
                        {statistics.departmentGender && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Gender per Department</h4>
                            <div className="overflow-x-auto">
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
                          </div>
                        )}
                        
                        {/* Bar chart visualization */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-3">Distribution Chart</h4>
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
                                    <span className="text-xs text-white font-medium">
                                      {count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : statistics.byYearLevel ? (
                      // Year level breakdown for department elections
                      <div>
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
                                {getPercentage(count, statistics.totalVotes)}%
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Gender breakdown per year level */}
                        {statistics.yearLevelGender && (
                          <div className="mt-6">
                            <h4 className="text-sm font-medium mb-3">Gender per Year Level</h4>
                            <div className="overflow-x-auto">
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
                                      <td>{genders.Female|| 0}</td>
                                      <td>{genders.Other || 0}</td>
                                      <td className="font-bold">
                                        {(genders.Male || 0) + (genders.Female || 0) + (genders.Other || 0)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        {/* Bar chart visualization */}
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-3">Distribution Chart</h4>
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
                                    <span className="text-xs text-white font-medium">
                                      {count}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base-content/70">No statistics available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Results Grid */}
              <h2 className="text-xl font-bold mb-4 text-base-content">🏆 Candidate <span className="text-emerald-600 dark:text-emerald-400">Rankings</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {positions.map((position) => (
                  //cards
                  <div key={position} className="card bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                    <div className="card-body">
                      <h2 className="card-title text-lg text-base-content">
                        {positionLabels[position]}
                      </h2>
                      <div className="divider my-1"></div>
                      {results?.results?.[position] && results.results[position].length > 0 ? (
                        <div className="space-y-3">
                          {results.results[position].slice(0, 3).map((candidate, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-2 rounded-lg ${
                                index === 0
                                //ranking
                                  ? "bg-yellow-100 dark:bg-yellow-900/30"
                                   //ranking
                                  : "bg-base-200"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-xl">
                                  {getRankBadge(index + 1)}
                                </span>
                                <div>
                                  <p className="font-medium">
                                    {candidate.name}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">
                                  {candidate.votes}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getPercentage(candidate.votes, results.totalVoters)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-base-content/70 text-center py-4">
                          No votes yet
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Last Updated */}
              <div className="text-center text-sm text-base-content/60">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
