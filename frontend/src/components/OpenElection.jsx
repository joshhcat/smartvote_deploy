import axios from "axios";
import { useEffect, useState } from "react";

const OpenElection = ({ dept, setElectionOpened, setShowElectionForm }) => {
  const [electionSchedule, setElectionSchedule] = useState();
  const admin = JSON.parse(localStorage.getItem("AdminData"));
  const [formData, setFormData] = useState({
    close_date: "",
    election_type: dept,
    status: "OPEN",
    opened_by: admin[0]?.admin_id,
  });
  //

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  //*Get Election Schedule
  const getElectionSchedule = async (e) => {
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/get-election-schedule/${dept}`
      );
      if (response.data.success === true) {
        setElectionSchedule(response.data.data[0]);
        localStorage.setItem(
          "electionData",
          JSON.stringify(response.data.data[0])
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getElectionSchedule();
  }, [dept]);

  useEffect(() => {
    if (electionSchedule?.status === "OPEN") {
      setElectionOpened(true);
      setShowElectionForm(false);
    }
  }, [electionSchedule]);

  //* Update Election
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3004/smart-vote/update-election",
        formData
      );
      if (response.data.success === true) {
        // localStorage.setItem("electionData", JSON.stringify(formData));
        setTimeout(() => {
          setElectionOpened(true);
          setShowElectionForm(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md h-auto mx-auto bg-base-100 p-6 rounded-xl shadow-lg border mt-20">
      <h2 className="text-2xl font-bold text-center mb-4">
        Open {dept} Election
      </h2>
      <form className="space-y-4">
        {/* <input
          type="text"
          placeholder="Admin ID"
          name="adminId"
          className="input input-bordered w-full"
          value={formData.adminId}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          placeholder="Admin Password"
          name="adminPassword"
          className="input input-bordered w-full"
          value={formData.adminPassword}
          onChange={handleChange}
          required
        /> */}
        <label className="block font-medium">Election Close Date</label>
        <input
          type="datetime-local"
          className="input input-bordered w-full"
          name="close_date"
          value={formData.close_date}
          onChange={handleChange}
          required
        />
        <button
          className="btn bg-gray-800 text-white w-full"
          onClick={handleSubmit}
        >
          Open Election
        </button>
      </form>
    </div>
  );
};

export default OpenElection;
