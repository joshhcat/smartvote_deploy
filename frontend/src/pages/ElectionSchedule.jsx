import { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import Loader from "../components/Loader";

// All election types
const ALL_ELECTION_TYPES = [
  { id: "SSG", label: "SSG Election", description: "Supreme Student Government - All Students", candidacyType: "SSG" },
  { id: "BSIT", label: "BSIT Election", description: "College of Computer Studies - BSIT Students", candidacyType: "BSIT" },
  { id: "BSA", label: "BSA Election", description: "College of Business Administration - BSA Students", candidacyType: "BSA" },
  { id: "BEED", label: "BEED Election", description: "College of Teacher Education - BEED Students", candidacyType: "BEED" },
  { id: "CRIMINOLOGY", label: "CRIMINOLOGY Election", description: "College of Criminal Justice Education - Criminology Students", candidacyType: "CRIMINOLOGY" },
];

export default function ElectionSchedule() {
  const [selectedElection, setSelectedElection] = useState(null);
  const [electionSchedules, setElectionSchedules] = useState({});
  const [candidacySchedules, setCandidacySchedules] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState({ message: "", type: "" });

  const admin = JSON.parse(localStorage.getItem("AdminData"));
  const adminDepartments = admin?.[0]?.departments?.split(",") || [];

  const [formData, setFormData] = useState({
    election_type: "",
    close_date: "",
    status: "OPEN",
    opened_by: admin?.[0]?.admin_id || "",
  });

  // Filter election types based on admin's departments
  // Each admin can ONLY schedule their own department's election
  const getFilteredElectionTypes = () => {
    return ALL_ELECTION_TYPES.filter((election) => {
      // SSG admin can only schedule SSG election (sends to all students)
      if (adminDepartments.includes("SSG") && election.id === "SSG") return true;
      // BSIT admin can only schedule BSIT election
      if (adminDepartments.includes("BSIT") && election.id === "BSIT") return true;
      // BSA admin can only schedule BSA election
      if (adminDepartments.includes("BSA") && election.id === "BSA") return true;
      // BEED admin can only schedule BEED election
      if (adminDepartments.includes("BEED") && election.id === "BEED") return true;
      // CRIMINOLOGY admin can only schedule CRIMINOLOGY election
      if (adminDepartments.includes("CRIMINOLOGY") && election.id === "CRIMINOLOGY") return true;
      return false;
    });
  };

  const filteredElectionTypes = getFilteredElectionTypes();

  // Fetch all election and candidacy schedules on mount
  useEffect(() => {
    const fetchAllSchedules = async () => {
      const electionData = {};
      const candidacyData = {};

      for (const election of filteredElectionTypes) {
        // Fetch election schedule
        try {
          const response = await axios.post(
            `http://localhost:3004/smart-vote/get-election-schedule/${election.id}`
          );
          if (response.data.success) {
            electionData[election.id] = response.data.data[0];
          }
        } catch (error) {
          console.error(`Error fetching ${election.id} election schedule:`, error);
        }

        // Fetch candidacy schedule
        try {
          const candidacyResponse = await axios.post(
            `http://localhost:3004/smart-vote/get-candidacy-schedule/${election.candidacyType}`
          );
          if (candidacyResponse.data.success) {
            candidacyData[election.id] = candidacyResponse.data.data[0];
          }
        } catch (error) {
          console.error(`Error fetching ${election.candidacyType} candidacy schedule:`, error);
        }
      }

      setElectionSchedules(electionData);
      setCandidacySchedules(candidacyData);
    };
    fetchAllSchedules();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if candidacy is closed for an election type
  const isCandidacyClosed = (electionId) => {
    const candidacy = candidacySchedules[electionId];
    return candidacy?.status === "CLOSED";
  };

  // Check if candidacy is open for an election type
  const isCandidacyOpen = (electionId) => {
    const candidacy = candidacySchedules[electionId];
    return candidacy?.status === "OPEN";
  };

  const handleSelectElection = (electionType) => {
    // Check if candidacy is still open
    if (isCandidacyOpen(electionType.id)) {
      setResponseMessage({
        message: `Cannot open ${electionType.label}. Filing of candidacy is still OPEN. Please close the candidacy filing first.`,
        type: "error",
      });
      setTimeout(() => setResponseMessage({ message: "", type: "" }), 5000);
      return;
    }

    // Check if candidacy has been scheduled at all
    const candidacy = candidacySchedules[electionType.id];
    if (!candidacy) {
      setResponseMessage({
        message: `Cannot open ${electionType.label}. Filing of candidacy has not been scheduled yet.`,
        type: "error",
      });
      setTimeout(() => setResponseMessage({ message: "", type: "" }), 5000);
      return;
    }

    setSelectedElection(electionType);
    setFormData((prev) => ({
      ...prev,
      election_type: electionType.id,
      close_date: electionSchedules[electionType.id]?.close_date || "",
    }));
  };

  // Format date for MySQL (YYYY-MM-DD HH:MM:SS)
  const formatDateForMySQL = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.close_date) {
      setResponseMessage({ message: "Please select a close date", type: "error" });
      setTimeout(() => setResponseMessage({ message: "", type: "" }), 3000);
      return;
    }

    // Double check candidacy is closed before submitting
    if (!isCandidacyClosed(formData.election_type)) {
      setResponseMessage({
        message: "Cannot open election. Filing of candidacy must be closed first.",
        type: "error",
      });
      setTimeout(() => setResponseMessage({ message: "", type: "" }), 5000);
      return;
    }

    setIsLoading(true);

    // Format the close_date for MySQL
    const formattedData = {
      ...formData,
      close_date: formatDateForMySQL(formData.close_date),
    };

    try {
      const response = await axios.post(
        "http://localhost:3004/smart-vote/update-election",
        formattedData
      );

      if (response.data.success) {
        // Update local state
        setElectionSchedules((prev) => ({
          ...prev,
          [formData.election_type]: {
            ...prev[formData.election_type],
            close_date: formData.close_date,
            status: formData.status,
            opened_by: formData.opened_by,
          },
        }));

        setResponseMessage({
          message: `${selectedElection?.label} scheduled successfully!`,
          type: "success",
        });
        setSelectedElection(null);
      } else {
        setResponseMessage({
          message: response.data.message || "Failed to schedule election",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error scheduling election:", error);
      setResponseMessage({ message: "An error occurred", type: "error" });
    } finally {
      setIsLoading(false);
      setTimeout(() => setResponseMessage({ message: "", type: "" }), 5000);
    }
  };

  const handleCloseElection = async (electionType) => {
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3004/smart-vote/update-election", {
        election_type: electionType,
        close_date: formatDateForMySQL(new Date()),
        status: "CLOSED",
        opened_by: admin?.[0]?.admin_id || "",
      });

      if (response.data.success) {
        // Update local state
        setElectionSchedules((prev) => ({
          ...prev,
          [electionType]: {
            ...prev[electionType],
            status: "CLOSED",
          },
        }));
        setResponseMessage({ message: "Election closed successfully!", type: "success" });
        
        // Refresh the schedules from backend
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setResponseMessage({ 
          message: response.data.message || "Failed to close election", 
          type: "error" 
        });
      }
    } catch (error) {
      console.error("Error closing election:", error);
      setResponseMessage({ 
        message: error.response?.data?.message || "Failed to close election. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setResponseMessage({ message: "", type: "" }), 5000);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "OPEN") {
      return <span className="badge badge-success text-white">OPEN</span>;
    }
    return <span className="badge badge-error text-white">CLOSED</span>;
  };

  const getCandidacyStatusBadge = (electionId) => {
    const candidacy = candidacySchedules[electionId];
    if (!candidacy) {
      return <span className="badge badge-warning badge-sm">Not Scheduled</span>;
    }
    if (candidacy.status === "OPEN") {
      return <span className="badge badge-warning badge-sm">Filing Open</span>;
    }
    return <span className="badge badge-info badge-sm">Filing Closed</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // Check if election can be opened (candidacy must be closed)
  const canOpenElection = (electionId) => {
    return isCandidacyClosed(electionId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
          <Loader />
        </div>
      )}

      <main className=" bg-whiteflex-1 p-8">
        <h1 className="text-3xl font-bold mb-2 text-center md:text-left">
          Election Schedule Management
        </h1>
        <p className="text-base-content/60 mb-6 text-center md:text-left">
          Set and manage election schedules. Elections can only be opened after candidacy filing is closed.
        </p>

        {/* Response Message */}
        {responseMessage.message && (
          <div className="flex justify-center mb-6">
            <div
              className={`alert w-full max-w-2xl ${
                responseMessage.type === "success" ? "alert-success" : "alert-error"
              }`}
            >
              {responseMessage.type === "success" ? <FaCheckCircle /> : <FaCircleXmark />}
              <span>{responseMessage.message}</span>
            </div>
          </div>
        )}

        {/* Election Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredElectionTypes.map((election) => {
            const schedule = electionSchedules[election.id];
            const isOpen = schedule?.status === "OPEN";
            const candidacyIsClosed = canOpenElection(election.id);

            return (
              <div
                key={election.id}
                className={`card bg-base-900 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isOpen ? "border-2 border-success" : "border border-base-content"
                }`}
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title text-lg">{election.label}</h2>
                    {getStatusBadge(schedule?.status)}
                  </div>
                  <p className="text-sm text-base-content/70">{election.description}</p>

                  <div className="divider my-2"></div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-base-content/70">Candidacy Status:</span>
                      {getCandidacyStatusBadge(election.id)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Close Date:</span>
                      <span className="font-medium">{formatDate(schedule?.close_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-base-content/70">Opened By:</span>
                      <span className="font-medium">{schedule?.opened_by || "N/A"}</span>
                    </div>
                  </div>

                  {/* Warning if candidacy is still open */}
                  {!isOpen && !candidacyIsClosed && (
                    <div className="alert alert-warning mt-3 py-2">
                      <FaExclamationTriangle />
                      <span className="text-xs">Close candidacy filing first</span>
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {isOpen ? (
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleCloseElection(election.id)}
                      >
                        Close Election
                      </button>
                    ) : (
                      <button
                        className={`btn btn-sm ${candidacyIsClosed ? "btn-primary" : "btn-disabled"}`}
                        onClick={() => handleSelectElection(election)}
                        disabled={!candidacyIsClosed}
                      >
                        <FaCalendarAlt className="mr-1" /> Schedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Schedule Modal */}
        {selectedElection && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-fadeIn hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-emerald-700" />
                Schedule {selectedElection.label}
              </h3>

              <p className="text-sm text-base-content/70 mb-4">{selectedElection.description}</p>

              <div className="alert alert-info mb-4 py-2">
                <FaCheckCircle />
                <span className="text-sm">Candidacy filing is closed. You can now open the election.</span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text font-medium">Election Close Date & Time</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="close_date"
                    className="input input-bordered w-full"
                    value={formData.close_date}
                    onChange={handleChange}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setSelectedElection(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700">
                    Open Election
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
