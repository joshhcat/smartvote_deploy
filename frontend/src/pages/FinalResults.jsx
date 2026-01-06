import { useState, useEffect } from "react";
import axios from "axios";
import { FaTrophy, FaCrown, FaTimesCircle, FaPrint, FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import Loader from "../components/Loader";

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

export default function FinalResults() {
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [electionStatus, setElectionStatus] = useState("CLOSED");
  const [totalVoters, setTotalVoters] = useState(0);

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
    if (!selectedElection) return;
    
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

    setIsLoading(false);
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
    fetchResults();
  }, [selectedElection]);

  // Calculate percentage
  const getPercentage = (votes) => {
    if (totalVoters === 0) return 0;
    return ((votes / totalVoters) * 100).toFixed(1);
  };

  // Print/Download as PDF
  const handlePrint = () => {
    window.print();
  };

  // Export as PDF and download
  const handleExportPDF = () => {
    if (!selectedElection || Object.keys(results).length === 0) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const tableStartY = 50;
    const rowHeight = 8;
    const colWidths = [50, 70, 30, 30];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);
    const tableStartX = (pageWidth - tableWidth) / 2;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(`${selectedElection} ELECTION - FINAL RESULTS`, pageWidth / 2, 20, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Official Winners Declaration', pageWidth / 2, 30, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, pageWidth / 2, 37, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Draw table header
    let currentY = tableStartY;
    doc.setFillColor(240, 240, 240);
    doc.rect(tableStartX, currentY, tableWidth, rowHeight, 'F');
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    
    let currentX = tableStartX;
    doc.text('Position', currentX + colWidths[0] / 2, currentY + 5, { align: 'center' });
    currentX += colWidths[0];
    doc.text('Winner', currentX + colWidths[1] / 2, currentY + 5, { align: 'center' });
    currentX += colWidths[1];
    doc.text('Votes', currentX + colWidths[2] / 2, currentY + 5, { align: 'center' });
    currentX += colWidths[2];
    doc.text('Percentage', currentX + colWidths[3] / 2, currentY + 5, { align: 'center' });
    
    // Draw table border
    doc.setDrawColor(0, 0, 0);
    doc.rect(tableStartX, tableStartY, tableWidth, rowHeight);
    
    currentY += rowHeight;
    
    // Draw table rows
    doc.setFont(undefined, 'normal');
    positions.forEach((position, index) => {
      const positionResults = results[position.key] || [];
      const winner = positionResults[0];
      
      // Draw row background (alternating)
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(tableStartX, currentY, tableWidth, rowHeight, 'F');
      }
      
      // Draw row border
      doc.rect(tableStartX, currentY, tableWidth, rowHeight);
      
      // Draw cell borders and text
      currentX = tableStartX;
      
      // Position
      doc.rect(currentX, currentY, colWidths[0], rowHeight);
      doc.setFont(undefined, 'bold');
      doc.setFontSize(9);
      doc.text(position.label, currentX + 2, currentY + 5);
      currentX += colWidths[0];
      
      // Winner
      doc.rect(currentX, currentY, colWidths[1], rowHeight);
      doc.setFont(undefined, 'normal');
      doc.text(winner ? winner.name : 'No Winner', currentX + 2, currentY + 5);
      currentX += colWidths[1];
      
      // Votes
      doc.rect(currentX, currentY, colWidths[2], rowHeight);
      doc.text(winner ? winner.votes.toString() : '-', currentX + colWidths[2] / 2, currentY + 5, { align: 'center' });
      currentX += colWidths[2];
      
      // Percentage
      doc.rect(currentX, currentY, colWidths[3], rowHeight);
      doc.text(winner ? `${getPercentage(winner.votes)}%` : '-', currentX + colWidths[3] / 2, currentY + 5, { align: 'center' });
      
      currentY += rowHeight;
    });
    
    // Summary
    const summaryY = currentY + 15;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Summary', pageWidth / 2, summaryY, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Positions: ${positions.length}`, margin, summaryY + 10);
    doc.text(`Winners Declared: ${positions.filter(p => results[p.key]?.[0]).length}`, margin, summaryY + 17);
    doc.text(`Total Votes Cast: ${totalVoters}`, margin, summaryY + 24);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `This document certifies the official winners of the ${selectedElection} Election.`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Save the PDF
    doc.save(`${selectedElection}_Election_Final_Results.pdf`);
  };

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
            <Loader />
          </div>
        )}

        <main className="flex-1 p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 no-print">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 text-base-content">
                <FaCrown className="text-yellow-500" />
                Final Results
              </h1>
              <p className="text-base-content/70 mt-1">
                View the winners of each position after the election has ended
              </p>
            </div>

            {/* Election Type Selector */}
            {filteredElectionTypes.length > 0 ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-base-content">Election:</span>
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
                {selectedElection && electionStatus === "CLOSED" && Object.keys(results).length > 0 && (
                  <>
                    <button
                      className="btn bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                      onClick={handlePrint}
                    >
                      <FaPrint className="mr-2" />
                      Print
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={handleExportPDF}
                    >
                      <FaFilePdf className="mr-2" />
                      Export PDF
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                <span>You do not have access to any election results based on your assigned departments.</span>
              </div>
            )}
          </div>

        {/* Show message if no elections available */}
        {filteredElectionTypes.length === 0 && (
          <div className="bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl p-12 text-center shadow-lg no-print hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-200">
            <FaTrophy className="text-6xl text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-base-content/70">No Access</h3>
            <p className="text-base-content/50 mt-2">
              You do not have permission to view final results for any department.
            </p>
          </div>
        )}

        {/* Election Status Check */}
        {selectedElection && electionStatus !== "CLOSED" && (
          <div className="alert alert-info mb-6 no-print">
            <FaTimesCircle />
            <div>
              <h3 className="font-bold">Election Still Ongoing</h3>
              <p>
                The {selectedElection} election is still open. Final results will be available once the election is closed.
              </p>
            </div>
          </div>
        )}

        {/* Final Results - Simple Table Format for PDF */}
        {selectedElection && electionStatus === "CLOSED" && Object.keys(results).length > 0 && (
          <div className="print-content bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl shadow-lg p-8 mb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2 text-base-content">
                {selectedElection} ELECTION - FINAL RESULTS
              </h2>
              <p className="text-base-content/70">
                Official Winners Declaration
              </p>
              <p className="text-sm text-base-content/60 mt-2">
                Generated on: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>

            {/* Simple Table */}
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-base-200">
                    <th className="border border-base-content/20 p-3 text-left font-bold text-base-content">Position</th>
                    <th className="border border-base-content/20 p-3 text-left font-bold text-base-content">Winner</th>
                    <th className="border border-base-content/20 p-3 text-center font-bold text-base-content">Total Votes</th>
                    <th className="border border-base-content/20 p-3 text-center font-bold text-base-content">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => {
                    const positionResults = results[position.key] || [];
                    const winner = positionResults[0]; // First place is the winner
                    
                    return (
                      <tr key={position.key} className="border-b border-base-content/20">
                        <td className="border border-base-content/20 p-3 font-semibold text-base-content">
                          {position.label}
                        </td>
                        <td className="border border-base-content/20 p-3 text-base-content">
                          {winner ? (
                            <strong className="text-base-content">{winner.name}</strong>
                          ) : (
                            <span className="text-base-content/60 italic">No Winner</span>
                          )}
                        </td>
                        <td className="border border-base-content/20 p-3 text-center text-base-content">
                          {winner ? winner.votes : "-"}
                        </td>
                        <td className="border border-base-content/20 p-3 text-center text-base-content">
                          {winner ? `${getPercentage(winner.votes)}%` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="mt-8 pt-5 border-t-2 border-base-content/20">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-base-content/60 mb-1">Total Positions</div>
                  <div className="text-lg font-bold text-base-content">{positions.length}</div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60 mb-1">Winners Declared</div>
                  <div className="text-lg font-bold text-base-content">
                    {positions.filter(p => results[p.key]?.[0]).length}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-base-content/60 mb-1">Total Votes Cast</div>
                  <div className="text-lg font-bold text-base-content">{totalVoters}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {selectedElection && electionStatus === "CLOSED" && Object.keys(results).length === 0 && !isLoading && (
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-12 text-center shadow-lg no-print hover:border-emerald-400 transition-all duration-200">
            <FaTrophy className="text-6xl text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-base-content/70">No Results Available</h3>
            <p className="text-base-content/60 mt-2">
              No election results have been recorded yet for {selectedElection} election.
            </p>
          </div>
        )}

        {/* No Election Selected */}
        {!selectedElection && filteredElectionTypes.length > 0 && (
          <div className="bg-white border-2 border-emerald-200 rounded-xl p-12 text-center shadow-lg no-print hover:border-emerald-400 transition-all duration-200">
            <FaCrown className="text-6xl text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-base-content/70">Select an Election</h3>
            <p className="text-base-content/60 mt-2">
              Please select an election from the dropdown above to view final results.
            </p>
          </div>
        )}
      </main>
    </div>
    </>
  );
}

