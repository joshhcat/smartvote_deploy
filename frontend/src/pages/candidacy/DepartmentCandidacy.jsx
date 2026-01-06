import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaLayerGroup,
  FaFileSignature,
  FaCube,
  FaEye,
  FaSearch,
  FaFilter,
  FaRegCheckCircle,
  FaCheckCircle,
  FaStop,
} from "react-icons/fa";
import CountDown from "../../components/CountDown";
import OpenFiling from "../../components/OpenFiling";
import { FaCircleXmark, FaMessage, FaRegCircleXmark } from "react-icons/fa6";
import axios from "axios";
import Loader from "../../components/Loader";
import { sendMail } from "../../utils/mailer";

export const DepartmentCandidacy = () => {
  const { department } = useParams();
  // Map URL params to actual department names
  const deptMap = {
    ssg: "SSG",
    bsit: "BSIT",
    beed: "BEED",
    crim: "CRIMINOLOGY",
    psych: "PSYCH",
    bsa: "BSA",
  };
  
  const dept = deptMap[department?.toLowerCase()] || department?.toUpperCase() || "SSG";
  
  const [showCandidacyForm, setShowCandidacyForm] = useState(true);
  const [candidacyOpened, setCandidacyOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [responseMessage, setResponseMessage] = useState({
    message: "",
    type: "",
  });

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const candidacyDataStr = localStorage.getItem("candidacyData");
  const data = candidacyDataStr && candidacyDataStr !== "undefined" ? JSON.parse(candidacyDataStr) : null;
  const closeDate = data?.close_date;
  
  useEffect(() => {
    if (data && data.status === "OPEN" && data.candidacy_type === dept) {
      setCandidacyOpened(true);
      setShowCandidacyForm(false);
    } else {
      setCandidacyOpened(false);
      setShowCandidacyForm(true);
    }
  }, [data, dept]);

  //* Get Candidates
  const getCandidate = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/get-candidates/${dept}`
      );

      if (response.data.success === true) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    getCandidate();
    // Reset form state when department changes
    const scheduleData = localStorage.getItem("candidacyData");
    if (scheduleData) {
      const parsed = JSON.parse(scheduleData);
      if (parsed.candidacy_type === dept && parsed.status === "OPEN") {
        setCandidacyOpened(true);
        setShowCandidacyForm(false);
      } else {
        setCandidacyOpened(false);
        setShowCandidacyForm(true);
      }
    }
  }, [dept]);

  //* Count by Status
  const countApprovedCandidates = candidates.filter(
    (item) => item.status === "APPROVED"
  );
  const countRejectedCandidates = candidates.filter(
    (item) => item.status === "REJECTED"
  );
  const countPendingCandidates = candidates.filter(
    (item) => item.status === "PENDING"
  );

  //* Close Candidacy Filing
  const handleCloseCandidacy = async () => {
    const admin = JSON.parse(localStorage.getItem("AdminData"));
    
    // Check if admin has permission for this department
    const adminDepartments = admin?.[0]?.departments?.split(",").map(d => d.trim().toUpperCase()) || [];
    if (!adminDepartments.includes(dept.toUpperCase())) {
      setResponseMessage({
        message: `You do not have permission to close ${dept} filing. Only ${dept} department admins can manage this candidacy.`,
        type: "error",
      });
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" });
      }, 5000);
      return;
    }
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/update-candidacy",
        {
          candidacy_type: dept,
          close_date: formattedDate,
          status: "CLOSED",
          opened_by: admin?.[0]?.admin_id || "",
        }
      );

      if (response.data.success === true) {
        const updatedData = { ...data, status: "CLOSED" };
        localStorage.setItem("candidacyData", JSON.stringify(updatedData));
        
        setIsLoading(false);
        setResponseMessage({
          message: "Candidacy filing closed successfully!",
          type: "success",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setIsLoading(false);
        setResponseMessage({
          message: response.data.message || "Failed to close candidacy",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error closing candidacy:", error);
      setIsLoading(false);
      setResponseMessage({
        message: "An error occurred while closing candidacy",
        type: "error",
      });
    }
    
    setTimeout(() => {
      setResponseMessage({ message: "", type: "" });
    }, 5000);
  };

  // Update countdown every second
  useEffect(() => {
    if (!candidacyOpened || !closeDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(closeDate);
      const diff = Math.max(0, end - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [candidacyOpened, closeDate]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 5;
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Filter logic
  const filteredCandidates = candidates.filter((candidate) => {
    const fullName = `${candidate.firstname || ""} ${candidate.lastname || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      candidate.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "Pending") {
      matchesStatus = candidate.status === "PENDING";
    } else if (statusFilter === "Accepted") {
      matchesStatus = candidate.status === "APPROVED";
    } else if (statusFilter === "Rejected") {
      matchesStatus = candidate.status === "REJECTED";
    }
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIdx = (currentPage - 1) * candidatesPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIdx, startIdx + candidatesPerPage);

  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [status, setStatus] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (selectedCandidate) {
      const modal = document.getElementById("my_modal_4");
      if (modal) {
        modal.showModal();
      }
    }
  }, [selectedCandidate]);

  const handleApproveClick = () => {
    setStatus("APPROVED");
    setRemarks("This candidate was approved");
  };

  const handleRejectClick = () => {
    if (remarks.trim() === "") {
      setError(true);
      return;
    }
    setStatus("REJECTED");
  };

  const sendCandidateEmail = async (candidateStatus) => {
    if (!selectedCandidate?.email) {
      console.log("No email found for candidate");
      return;
    }

    const candidateName = `${selectedCandidate.firstname} ${selectedCandidate.lastname}`;
    const position = selectedCandidate.position;
    const statusText = candidateStatus === "APPROVED" ? "approved" : "rejected";
    
    const emailData = {
      to: selectedCandidate.email,
      subject: "Smart Vote - Candidacy Application Update",
      text: candidateStatus === "APPROVED"
        ? `Hello ${candidateName},\n\nCongratulations! Your application for the position of ${position} has been ${statusText} by the Department Admin.\n\nYou are now an official candidate for this position.\n\nBest regards,\nSmartVote Team`
        : `Hello ${candidateName},\n\nWe regret to inform you that your application for the position of ${position} has been ${statusText} by the Department Admin.\n\nReason: ${remarks}\n\nIf you have any questions, please contact the administration.\n\nBest regards,\nSmartVote Team`,
      html: candidateStatus === "APPROVED"
        ? `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #27ae60;">Congratulations!</h2>
            <p>Hello <strong>${candidateName}</strong>,</p>
            <p>We are pleased to inform you that your application for the position of <strong>${position}</strong> has been <strong style="color: #27ae60;">${statusText}</strong> by the Department Admin.</p>
            <div style="background-color: #d4edda; border-left: 4px solid #27ae60; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0;"><strong>Status:</strong> Approved</p>
              <p style="margin: 5px 0 0 0;"><strong>Position:</strong> ${position}</p>
            </div>
            <p>You are now an official candidate for this position. Good luck with your campaign!</p>
            <p>Best regards,<br/>SmartVote Team</p>
          </div>
        `
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #e74c3c;">Application Update</h2>
            <p>Hello <strong>${candidateName}</strong>,</p>
            <p>We regret to inform you that your application for the position of <strong>${position}</strong> has been <strong style="color: #e74c3c;">${statusText}</strong> by the Department Admin.</p>
            <div style="background-color: #f8d7da; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 0;"><strong>Status:</strong> Rejected</p>
              <p style="margin: 5px 0 0 0;"><strong>Position:</strong> ${position}</p>
              <p style="margin: 10px 0 0 0;"><strong>Reason:</strong></p>
              <p style="margin: 5px 0 0 0;">${remarks}</p>
            </div>
            <p>If you have any questions or concerns, please contact the administration.</p>
            <p>Best regards,<br/>SmartVote Team</p>
          </div>
        `,
    };

    try {
      await sendMail(emailData);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  const updateCandidate = async () => {
    document.getElementById("my_modal_4").close();
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/update-candidate",
        {
          student_id: selectedCandidate.student_id,
          status: status,
          remarks: remarks,
        }
      );
      if (response.data.success === true) {
        // Send email notification to candidate
        if (selectedCandidate?.email) {
          sendCandidateEmail(status);
        }
        
        setTimeout(() => {
          setIsLoading(false);
          setStatus(null);
          setSelectedCandidate(null);
          setResponseMessage({
            message: response.data.message,
            type: "success",
          });
          setShowRejectionForm(false);
          setRemarks("");
          window.scroll({ top: 0, behavior: "smooth" });
        }, 3000);
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
          getCandidate();
        }, 5000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message,
            type: "error",
          });
        }, 3000);
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 5000);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status && remarks.trim() !== "") {
      updateCandidate();
    }
  }, [status]);

  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-75">
          <div className="pointer-events-none">
            <Loader />
          </div>
        </div>
      )}

      <div className="flex-1 p-8">
        {showCandidacyForm && (
          <OpenFiling
            dept={dept}
            setCandidacyOpened={setCandidacyOpened}
            setShowCandidacyForm={setShowCandidacyForm}
          />
        )}

        {!showCandidacyForm && (
          <div className="flex flex-col mb-6 w-full">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
              <CountDown countdown={countdown} dept={dept} />
              <button
                className="btn btn-error btn-sm"
                onClick={handleCloseCandidacy}
              >
                <FaStop className="mr-1" /> Close Candidacy Filing
              </button>
            </div>
            
            {responseMessage.message && (
              <div className="flex justify-center px-4 mb-4">
                <div
                  className={`alert w-72 md:w-86 ${
                    responseMessage.type === "success"
                      ? "alert-success"
                      : "alert-error"
                  }`}
                >
                  {responseMessage.type === "success" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaCircleXmark />
                  )}
                  <span>{responseMessage.message}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 mt-4">
              <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <div className="card-body px-6">
                  <h2 className="text-sm font-medium">Pending Candidates</h2>
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold text-blue-500">
                      {countPendingCandidates.length}
                    </h1>
                    <FaLayerGroup className="text-2xl" />
                  </div>
                </div>
              </div>
              <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <div className="card-body px-6">
                  <h2 className="text-sm font-medium">Rejected Candidates</h2>
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold text-red-500">
                      {countRejectedCandidates.length}
                    </h1>
                    <FaCube className="text-2xl" />
                  </div>
                </div>
              </div>

              <div className="card w-full bg-base-100 card-xs shadow-sm">
                <div className="card-body px-6">
                  <h2 className="text-sm font-medium">Accepted Candidates</h2>
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold text-green-500">
                      {countApprovedCandidates.length}
                    </h1>
                    <FaFileSignature className="text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full mt-4 ">
              <div className="flex justify-between items-center mb-4 gap-2">
                <div className="relative w-full max-w-xs">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 z-10" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="input input-bordered w-full pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative w-full max-w-xs">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50 z-10" />
                  <select
                    className="select select-bordered w-full pl-10"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="table bg-base-100 rounded-box shadow-md w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Position</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCandidates.length > 0 ? (
                      paginatedCandidates.map((candidate) => (
                        <tr
                          key={candidate.id || candidate.student_id}
                          className="hover:bg-base-200 cursor-pointer transition"
                        >
                          <td className="flex items-center gap-2 px-4 py-2">
                            <span>
                              {candidate.firstname} {candidate.lastname}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <span className="text-xs uppercase font-semibold">
                              {candidate.position}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {(() => {
                              const statusClass =
                                {
                                  PENDING: "text-blue-500",
                                  APPROVED: "text-green-600",
                                  REJECTED: "text-red-500",
                                }[candidate.status] || "";

                              return (
                                <span
                                  className={`text-xs uppercase  ${statusClass} font-extrabold tracking-wide`}
                                >
                                  {candidate.status}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-2 flex gap-2">
                            <button
                              className="btn btn-sm btn-outline w-20"
                              onClick={() => setSelectedCandidate(candidate)}
                            >
                              <span>
                                <FaEye />
                              </span>
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-base-content/60">
                          {searchTerm || statusFilter !== "All"
                            ? "No candidates found matching your search"
                            : "No candidates have filed yet"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
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
              
              {selectedCandidate && (
                <div className="w-96">
                  <dialog id="my_modal_4" className="modal">
                    <div className="modal-box w-11/12 max-w-5xl h-auto">
                      {(() => {
                        const statusClass =
                          {
                            PENDING: "text-blue-500",
                            APPROVED: "text-green-600",
                            REJECTED: "text-red-500",
                          }[selectedCandidate?.status] || "";

                        return (
                          <span
                            className={`text-md uppercase ${statusClass} font-extrabold tracking-wider`}
                          >
                            {selectedCandidate?.status} Candidate
                          </span>
                        );
                      })()}
                      <div className="mt-2">
                        <div className="">
                          <div>
                            <div className="text-sm">
                              Name :{" "}
                              <span className="font-medium text-lg">
                                {" "}
                                {selectedCandidate.firstname +
                                  " " +
                                  selectedCandidate.lastname}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm">
                              Position filed :{" "}
                              <span className="">
                                {" "}
                                {selectedCandidate.position}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm">
                          Candidate Detail : {selectedCandidate.about_yourself}
                        </div>
                        <div className="text-sm">
                          Purpose of filing: {selectedCandidate.purpose}
                        </div>

                        {selectedCandidate?.status === "PENDING" && (
                          <div className="rounded-md h-auto border mt-4 p-2 ">
                            <div className="flex flex-row gap-2 items-center p-2">
                              <FaMessage />
                              <div className="text-sm">Admin Review</div>
                            </div>

                            {showRejectionForm ? (
                              <>
                                <div className="p-2 text-sm">
                                  <h2>Reason for rejection:</h2>
                                  <textarea
                                    name="remarks"
                                    value={remarks}
                                    className={`border w-full h-20 rounded-md p-2 ${
                                      error ? "border-red-400" : ""
                                    }`}
                                    placeholder="Please provide feedback on what needs to changed..."
                                    onChange={(e) => {
                                      setRemarks(e.target.value);
                                      setError(false);
                                    }}
                                  />
                                  {error && (
                                    <p className="text-red-500 text-xs mt-1">
                                      Please provide a reason for rejection
                                    </p>
                                  )}
                                </div>

                                <div className="flex gap-4 px-2 mb-2">
                                  <div
                                    className="btn btn-error"
                                    onClick={handleRejectClick}
                                  >
                                    Submit Rejection
                                  </div>
                                  <div
                                    className="btn btn-default"
                                    onClick={() => setShowRejectionForm(false)}
                                  >
                                    Cancel
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex gap-4 px-2 mb-2">
                                <div
                                  className="btn btn-success w-28"
                                  onClick={handleApproveClick}
                                >
                                  <span>
                                    {" "}
                                    <FaRegCheckCircle className="text-xl text-white" />
                                  </span>
                                  Approve
                                </div>
                                <div
                                  className="btn btn-error w-28"
                                  onClick={() => setShowRejectionForm(true)}
                                >
                                  <span>
                                    {" "}
                                    <FaRegCircleXmark className="text-xl text-white" />
                                  </span>
                                  Reject
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedCandidate?.status === "REJECTED" && (
                          <div className="border border-error bg-error/20 h-auto p-2 mt-4 rounded-md ">
                            <div className="flex font-bold text-error items-center gap-2">
                              <FaRegCircleXmark className="text-xl" />
                              Candidate Rejected
                            </div>
                            <p className="text-base-content mt-2 text-justify">
                              {selectedCandidate.approver_remarks || "No remarks provided"}
                            </p>
                          </div>
                        )}

                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() => {
                            setShowRejectionForm(false);
                            setSelectedCandidate(null);
                            setRemarks("");
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </dialog>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

