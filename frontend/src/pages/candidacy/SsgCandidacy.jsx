import { useState, useEffect } from "react";
import {
  FaLayerGroup,
  FaFileSignature,
  FaCube,
  FaEye,
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

const dept = "SSG";

export const SsgCandidacy = () => {
  const [showCandidacyForm, setShowCandidacyForm] = useState(true);
  const [candidacyOpened, setCandidacyOpened] = useState(false);
  // const [closeDate, setCloseDate] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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
    if (data && data.status === "OPEN") {
      setCandidacyOpened(true);
      setShowCandidacyForm(false);
    } else {
      setCandidacyOpened(false);
      setShowCandidacyForm(true);
    }
  }, [data]);

  // Update countdown every second
  useEffect(() => {
    if (!candidacyOpened || !closeDate) return;

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
  }, [candidacyOpened, closeDate]);

  const candidatesPerPage = 5;
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

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
  }, []);

  console.log(candidacyOpened);
  console.log(showCandidacyForm);

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

  //* Count Pending Candidate by Departments
  const ccsPendingCandidates = countPendingCandidates.filter(
    (item) => item.department === "CCS"
  );
  const ctePendingCandidates = countPendingCandidates.filter(
    (item) => item.department === "CTE"
  );
  const cbaPendingCandidates = countPendingCandidates.filter(
    (item) => item.department === "CBA"
  );
  const bsitPendingCandidates = countPendingCandidates.filter(
    (item) => item.department === "BSIT"
  );
  const cjePendingCandidates = countPendingCandidates.filter(
    (item) => item.department === "CJE"
  );
  //* Count Approved Candidate by Departments
  const ccsApprovedCandidates = countApprovedCandidates.filter(
    (item) => item.department === "CCS"
  );
  const cteApprovedCandidates = countApprovedCandidates.filter(
    (item) => item.department === "CTE"
  );
  const cbaApprovedCandidates = countApprovedCandidates.filter(
    (item) => item.department === "CBA"
  );
  const bsitApprovedCandidates = countApprovedCandidates.filter(
    (item) => item.department === "BSIT"
  );
  const cjeApprovedCandidates = countApprovedCandidates.filter(
    (item) => item.department === "CJE"
  );
  //* Count Rejected Candidate by Departments
  const ccsRejectedCandidates = countRejectedCandidates.filter(
    (item) => item.department === "CCS"
  );
  const cteRejectedCandidates = countRejectedCandidates.filter(
    (item) => item.department === "CTE"
  );
  const cbaRejectedCandidates = countRejectedCandidates.filter(
    (item) => item.department === "CBA"
  );
  const bsitRejectedCandidates = countRejectedCandidates.filter(
    (item) => item.department === "BSIT"
  );
  const cjeRejectedCandidates = countRejectedCandidates.filter(
    (item) => item.department === "CJE"
  );

  // console.log(countApprovedCandidates);

  useEffect(() => {
    console.log(ccsApprovedCandidates.length);
  }, []);
  // Filter logic
  const filteredCandidates = candidates.filter((candidate) => {
    const matchesStatus =
      statusFilter === "All" || candidate.status === statusFilter.toUpperCase();
    return matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
  const startIdx = (currentPage - 1) * candidatesPerPage;
  const paginatedCandidates = filteredCandidates.slice(
    startIdx,
    startIdx + candidatesPerPage
  );

  const [showRejectionForm, setShowRejectionForm] = useState(false);
  //console.log(statusFilter);
  useEffect(() => {
    if (selectedCandidate) {
      const modal = document.getElementById("my_modal_4");
      if (modal) {
        modal.showModal();
      }
    }
  }, [selectedCandidate]);

  const handleApproveClick = () => {
    setStatus("APPROVED"); // Set the status to "APPROVED"
    setRemarks("This candidate was approved");
  };

  const handleRejectClick = () => {
    if (remarks.trim() === "") {
      setError(true);
      return; // Don't proceed with any further logic if remarks are empty
    }
    setStatus("REJECTED"); // Set the status to "REJECTED"
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
    if (!selectedCandidate || !status) {
      return; // Don't proceed if no candidate selected or no status set
    }
    
    // For rejection, ensure remarks are provided
    if (status === "REJECTED" && remarks.trim() === "") {
      setError(true);
      return;
    }
    
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
          setStatus("");
          setSelectedCandidate(null);
          setResponseMessage({
            message: response.data.message,
            type: "success",
          });
          setShowRejectionForm(false);
          window.scroll({ top: 0, behavior: "smooth" });
          setRemarks("");
        }, 3000);
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" }); // Clear message after 5 seconds
          getCandidate();
        }, 5000); // 5000 milliseconds = 5 seconds
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message,
            type: "error",
          });
        }, 3000);
        // Set a timeout to remove the responseMessage after 5 seconds
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" }); // Clear message after 5 seconds
        }, 5000); // 5000 milliseconds = 5 seconds
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setResponseMessage({
        message: "Failed to update candidate. Please try again.",
        type: "error",
      });
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" });
      }, 5000);
    }
  };

  // Trigger update when status changes (for approve/reject)
  useEffect(() => {
    if (status && selectedCandidate && (status === "APPROVED" || (status === "REJECTED" && remarks.trim() !== ""))) {
      updateCandidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
    
    // Format current date for MySQL
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
        // Update localStorage
        const updatedData = { ...data, status: "CLOSED" };
        localStorage.setItem("candidacyData", JSON.stringify(updatedData));
        
        setIsLoading(false);
        setResponseMessage({
          message: "Candidacy filing closed successfully!",
          type: "success",
        });
        
        // Refresh the page after a short delay
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

  useEffect(() => {
    if (status && remarks.trim() !== "") {
      updateCandidate(); // Call updateCandidate only if remarks are not empty
    }
  }, [status]); // Trigger when status or remarks change

  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-75">
          {/* Prevent interaction with content behind */}
          <div className="pointer-events-none">
            <Loader />
          </div>
        </div>
      )}

      <div className="flex-1 p-8">
        {/* Election Form */}

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
              <div className="flex justify-center px-4">
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
            )}{" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 mt-4">
              <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <div className="card-body px-6">
                  <h2 className="text-sm font-medium text-base-content/70">Pending Candidates</h2>
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {countPendingCandidates.length}
                    </h1>
                    <FaLayerGroup className="text-2xl" />
                  </div>
                  <div>Departments</div>
                  <div>
                    <div className="font-bold tracking-wider">
                      CCS - {ccsPendingCandidates.length}, CTE -{" "}
                      {ctePendingCandidates.length}, CBA -{" "}
                      {cbaPendingCandidates.length}, BSIT -{" "}
                      {bsitPendingCandidates.length}, CJE-{" "}
                      {cjePendingCandidates.length}
                    </div>
                  </div>
                </div>
              </div>
              <div className="card w-full bg-base-100 border-2 border-red-300 dark:border-red-600 card-xs shadow-sm hover:border-red-500 dark:hover:border-red-500 transition-all duration-200">
                <div className="card-body px-6">
                  <h2 className="text-sm font-medium text-base-content/70">Rejected Candidates</h2>
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold text-red-500 dark:text-red-400">
                      {countRejectedCandidates.length}
                    </h1>
                    <FaCube className="text-2xl text-red-500 dark:text-red-400" />
                  </div>
                  <div className="text-base-content/60">Departments</div>
                  <div>
                    <div className="font-bold tracking-wider text-base-content">
                      CCS - {ccsRejectedCandidates.length}, CTE -{" "}
                      {cteRejectedCandidates.length}, CBA -{" "}
                      {cbaRejectedCandidates.length}, BSIT -{" "}
                      {cbaRejectedCandidates.length} , CJE -{" "}
                      {cjeRejectedCandidates.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card w-full bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 card-xs shadow-sm hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
                <div className="card-body px-6">
                  <h2 className="text-sm font-medium text-base-content/70">Approved Candidates</h2>
                  <div className="flex items-center justify-between">
                    <h1 className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                      {countApprovedCandidates.length}
                    </h1>
                    <FaFileSignature className="text-2xl text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>Departments</div>
                  <div>
                    <div className="font-bold tracking-wider">
                      CCS - {ccsApprovedCandidates.length}, CTE -{" "}
                      {cteApprovedCandidates.length}, CBA -{" "}
                      {cbaApprovedCandidates.length}, BSIT -{" "}
                      {bsitApprovedCandidates.length}, CJE-{" "}
                      {cjeApprovedCandidates.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* User List and Details */}
            <div className="w-full mt-4 ">
              {/* Filter Bar */}
              <div className="flex justify-end items-center mb-4 gap-2">
                {/* Filter Dropdown with Icon */}
                <div className="relative w-full max-w-xs">
                  <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 dark:text-emerald-400 z-10" />
                  <select
                    className="select select-bordered w-full pl-10 bg-base-100 border-emerald-300 dark:border-emerald-600 focus:border-emerald-500 dark:focus:border-emerald-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              {/* Table */}
              <div className="overflow-x-auto bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-lg shadow-lg">
                <table className="table bg-base-100 rounded-box shadow-md w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCandidates.map((candidate) => (
                      <tr
                        key={candidate.id}
                        className="hover:bg-base-200 cursor-pointer transition"
                      >
                        <td className="flex items-center gap-2 px-4 py-2">
                          {/* <img
                            className="size-10 rounded-box"
                            src={candidate.img}
                            alt={candidate.name}
                          /> */}
                          <span>
                            {candidate.firstname + " " + candidate.lastname}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-xs uppercase font-semibold">
                            {candidate.department}
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
                    ))}
                  </tbody>
                </table>
              </div>
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
              {selectedCandidate && (
                <div className="w-96">
                  {/* Modal Backdrop - more transparent */}
                  {/* <div
                  className="fixed inset-0 bg-black opacity-70  z-40"
                  onClick={() => setSelectedCandidate(null)}
                ></div> */}
                  {/* Modal Content */}
                  <dialog id="my_modal_4" className="modal">
                    <div className="modal-box w-11/12 max-w-5xl h-auto bg-base-100 border-2 border-emerald-300 dark:border-emerald-600">
                      {(() => {
                        const statusClass =
                          {
                            PENDING: "text-emerald-600 dark:text-emerald-400",
                            APPROVED: "text-emerald-700 dark:text-emerald-500",
                            REJECTED: "text-red-500 dark:text-red-400",
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
                        {/* <form method="dialog"> */}
                        <div className="">
                          {selectedCandidate.image && (
                            <div className="mb-4 flex justify-center">
                              <img
                                src={selectedCandidate.image.startsWith('http') ? selectedCandidate.image : `http://localhost:3004${selectedCandidate.image}`}
                                alt={`${selectedCandidate.firstname} ${selectedCandidate.lastname}`}
                                className="w-48 h-48 object-cover rounded-lg border-2 border-emerald-300 dark:border-emerald-600"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
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

                        {selectedCandidate?.status && selectedCandidate.status.toUpperCase() === "PENDING" && (
                          <div className="rounded-md h-auto border-2 border-emerald-300 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 mt-4 p-2 ">
                            <div className="flex flex-row gap-2 items-center p-2">
                              <FaMessage className="text-emerald-700 dark:text-emerald-400" />
                              <div className="text-sm text-base-content font-medium">Admin Review</div>
                            </div>

                            {/* Rejection  */}

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
                                    onChange={(e) => setRemarks(e.target.value)}
                                  />
                                </div>

                                <div className="flex gap-4 px-2 mb-2">
                                  <button
                                    className="btn btn-error"
                                    onClick={handleRejectClick}
                                  >
                                    Submit Rejection
                                  </button>
                                  <button
                                    className="btn btn-default"
                                    onClick={() => setShowRejectionForm(false)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="flex gap-4 px-2 mb-2">
                                <button
                                  className="btn w-28 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600"
                                  onClick={handleApproveClick}
                                >
                                  <span>
                                    {" "}
                                    <FaRegCheckCircle className="text-xl text-white" />
                                  </span>
                                  Approve
                                </button>
                                <button
                                  className="btn btn-error w-28"
                                  onClick={() => setShowRejectionForm(true)}
                                >
                                  <span>
                                    {" "}
                                    <FaRegCircleXmark className="text-xl text-white" />
                                  </span>
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* if status is rejected */}
                        {selectedCandidate?.status === "REJECTED" && (
                          <div className="border border-red-500 bg-red-200 h-auto p-2 mt-4 rounded-md ">
                            <div className="flex font-bold text-red-500 items-center gap-2">
                              <FaRegCircleXmark className="text-xl" />
                              Candidate Rejected
                            </div>
                            <p className="text-black mt-2 text-justify">
                              {selectedCandidate.approver_remarks}
                            </p>
                          </div>
                        )}

                        {/* if there is a button, it will close the modal */}
                        <button
                          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                          onClick={() => {
                            setShowRejectionForm(false);
                            setSelectedCandidate(null);
                          }}
                        >
                          ✕
                        </button>
                        {/* </form> */}
                      </div>
                    </div>
                  </dialog>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Countdown */}
      </div>
    </div>
  );
};
