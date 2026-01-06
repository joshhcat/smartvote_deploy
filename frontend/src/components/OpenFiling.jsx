import { useEffect, useState } from "react";
import Loader from "./Loader";
import axios from "axios";
import { FaExclamationTriangle, FaLock } from "react-icons/fa";

const OpenFiling = ({ dept, setCandidacyOpened, setShowCandidacyForm }) => {
  const adminStr = localStorage.getItem("AdminData");
  const admin = adminStr ? JSON.parse(adminStr) : null;
  const [candidacySchedule, setCandidacySchedule] = useState();
  const [formData, setFormData] = useState({
    close_date: "",
    candidacy_type: dept,
    status: "OPEN",
    opened_by: admin?.[0]?.admin_id || "",
  });

  // Check if admin has permission for this department
  // Admin can only open filing for their own department
  const hasPermission = () => {
    if (!admin || !admin[0]?.departments) return false;
    
    const adminDepartments = admin[0].departments
      .split(",")
      .map(d => d.trim().toUpperCase());
    
    const deptUpper = dept.toUpperCase();
    
    // Check if admin's department matches the filing department
    return adminDepartments.includes(deptUpper);
  };

  const canOpenFiling = hasPermission();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //* Get Candidacy Schedule
  const getCandidacySchedule = async (e) => {
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/get-candidacy-schedule/${dept}`
      );

      if (response.data.success === true && response.data.data?.[0]) {
        setCandidacySchedule(response.data.data[0]);
        localStorage.setItem(
          "candidacyData",
          JSON.stringify(response.data.data[0])
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCandidacySchedule();
  }, [dept]);

  useEffect(() => {
    if (candidacySchedule?.status === "OPEN") {
      setCandidacyOpened(true);
      setShowCandidacyForm(false);
    }
  }, [candidacySchedule]);

  //* Format date for MySQL (YYYY-MM-DD HH:MM:SS)
  const formatDateForMySQL = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  //* Updated Candidacy
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canOpenFiling) {
      alert("You do not have permission to open this filing.");
      return;
    }

    if (!formData.close_date) {
      alert("Please select a close date");
      return;
    }

    try {
      setIsLoading(true);
      const dataToSend = {
        ...formData,
        close_date: formatDateForMySQL(formData.close_date),
      };
      
      const response = await axios.post(
        "http://localhost:3004/smart-vote/update-candidacy",
        dataToSend
      );
      if (response.data.success === true) {
        localStorage.setItem("candidacyData", JSON.stringify(dataToSend));
        setTimeout(() => {
          setIsLoading(false);
          setCandidacyOpened(true);
          setShowCandidacyForm(false);
        }, 3000);
      } else {
        setIsLoading(false);
        alert(response.data.message || "Failed to open filing");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      alert("An error occurred while opening the filing");
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-md h-auto mx-auto bg-base-100 p-6 rounded-xl shadow-lg mt-20">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-75">
          {/* Prevent interaction with content behind */}
          <div className="pointer-events-none">
            <Loader />
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-center mb-4">
        Open {dept} Filing
      </h2>

      {!canOpenFiling && (
        <div className="alert alert-error mb-4">
          <FaExclamationTriangle />
          <div>
            <h3 className="font-bold">Access Denied</h3>
            <div className="text-sm">
              <p className="mb-2">
                You do not have permission to open {dept} filing. Only {dept} department admins can open this candidacy filing.
              </p>
              {admin && admin[0]?.departments && (
                <p className="text-xs opacity-75">
                  Your assigned departments: {admin[0].departments}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form className="space-y-4">
        <label className="block font-medium">Candidate Filing Close Date</label>
        <input
          type="datetime-local"
          className="input input-bordered w-full"
          name="close_date"
          value={formData.close_date}
          onChange={handleChange}
          required
          disabled={!canOpenFiling}
        />
        <button
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full"
          onClick={handleSubmit}
          disabled={!canOpenFiling}
        >
          {!canOpenFiling ? (
            <>
              <FaLock className="mr-2" />
              Access Restricted
            </>
          ) : (
            "Open Filing"
          )}
        </button>
      </form>
    </div>
  );
};

export default OpenFiling;
