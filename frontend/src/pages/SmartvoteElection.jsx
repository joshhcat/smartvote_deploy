import { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "../components/Navbar";
import {
  FaCheckCircle,
  FaChevronCircleLeft,
  FaChevronLeft,
} from "react-icons/fa";
import { FaArrowLeftLong, FaCircleXmark } from "react-icons/fa6";
import CountDown from "../components/CountDown";
import ElectionCountdown from "../components/ElectionCountdown";
import axios from "axios";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

export default function SmartvoteElection() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [role, setRole] = useState("president"); // Added role state
  const [candidates, setCandidates] = useState(null);
  const [tabActive, setTabActive] = useState("tab1");
  const [isLoading, setIsLoading] = useState(false);
  const [isElectionEnded, setIsElectionEnded] = useState(false);

  //?facial

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [isModelsReady, setIsModelsReady] = useState(false);
  const [openCam, setOpenCam] = useState(false);
  const [isFaceMatched, setIsFaceMatched] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  const [responseMessage, setResponseMessage] = useState({
    message: "",
    type: "",
  }); // {message, type}

  const studentData = JSON.parse(localStorage.getItem("UserData"));
  
  // Determine which elections the student can participate in based on department
  const studentDept = studentData?.department?.toUpperCase() || "";
  
  // Get available elections for this student
  const getAvailableElections = () => {
    const elections = [{ id: "SSG", label: "SSG Election" }]; // SSG is for all students
    
    // Add department-specific elections
    if (["BSIT", "CCS"].includes(studentDept)) {
      elections.push({ id: "BSIT", label: "BSIT Election" });
    }
    if (["BSA", "CBA"].includes(studentDept)) {
      elections.push({ id: "BSA", label: "BSA Election" });
    }
    if (["BEED", "CTE"].includes(studentDept)) {
      elections.push({ id: "BEED", label: "BEED Election" });
    }
    if (["CRIMINOLOGY", "CRIM", "CJE"].includes(studentDept)) {
      elections.push({ id: "CRIMINOLOGY", label: "CRIMINOLOGY Election" });
    }
    
    return elections;
  };
  
  const availableElections = getAvailableElections();
  const tabIndex = parseInt(tabActive.replace("tab", "")) - 1;
  const dept = availableElections[tabIndex]?.id || "SSG";

  const [votersData, setVotersData] = useState({
    student_id: studentData?.student_id,
    voters_id: studentData?.voters_id,
    fullname: studentData?.firstname + " " + studentData.lastname,
    email: studentData?.email,
    department: studentData?.department,
    election_type: "",
  });

  const [emptyFields, setEmptyFields] = useState({});

  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    // Switch the tab
    setTabActive(tab);
    // Reset role to first position when switching tabs
    setRole("president");
    // Clear all voter selections
    setVotersData({
      ...votersData,
      president: "",
      vice_president: "",
      secretary: "",
    });
    // Clear active card
    setActiveCard(null);
    setIsOpen(false);
  };

  const getCandidates = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/approved-candidates/${dept}`
      );
      if (response.data.success === true) {
        setCandidates(response.data.data);
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCandidates();
  }, [dept, tabActive]);

  // Group candidates by position and build roles dynamically
  const groupedByPosition = useMemo(() => {
    if (!candidates) return {};
    return candidates.reduce((acc, candidate) => {
      const pos = (candidate.position || "").trim();
      if (!pos) return acc;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(candidate);
      return acc;
    }, {});
  }, [candidates]);

  const positionOrder = [
    "President",
    "Vice President",
    "Secretary",
    "Treasurer",
    "Auditor",
    "MMO",
    "Representatives",
  ];
  const toKey = (pos) => pos.toLowerCase().replace(/[\s-]+/g, "_");

  // Candidate lists per position for the ballot section
  const presidentOptions = groupedByPosition["President"] || [];
  const vicePresidentOptions = groupedByPosition["Vice President"] || [];
  const secretaryOptions = groupedByPosition["Secretary"] || [];

  const roles = useMemo(() => {
    return positionOrder
      .filter((pos) => groupedByPosition[pos]?.length)
      .map((pos) => ({
        key: pos.toLowerCase().replace(/\s+/g, "-"),
        label: `-- ${pos.toUpperCase()} --`,
        data: groupedByPosition[pos],
      }));
  }, [groupedByPosition]);

  const roleData = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      map[r.key] = r.data;
    });
    return map;
  }, [roles]);

  const roleDisplayName = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      map[r.key] = r.label;
    });
    return map;
  }, [roles]);

  // Ensure current role is valid when roles change
  useEffect(() => {
    if (!roles.length) return;
    if (!roles.find((r) => r.key === role)) {
      setRole(roles[0].key);
    }
  }, [roles, role]);

  // Ensure votersData and emptyFields include dynamic position keys
  useEffect(() => {
    if (!roles.length) return;
    const updates = {};
    roles.forEach((r) => {
      const key = toKey(r.label.replace(/--/g, "").trim());
      if (!(key in votersData)) {
        updates[key] = "";
      }
    });
    if (Object.keys(updates).length) {
      setVotersData((prev) => ({ ...prev, ...updates }));
    }

    const emptyUpdates = {};
    roles.forEach((r) => {
      const key = toKey(r.label.replace(/--/g, "").trim());
      if (!(key in emptyFields)) {
        emptyUpdates[key] = false;
      }
    });
    if (Object.keys(emptyUpdates).length) {
      setEmptyFields((prev) => ({ ...prev, ...emptyUpdates }));
    }
  }, [roles]);
  const roleIndex = roles.findIndex((r) => r.key === role);
  const [showVotersForm, setShowVotersForm] = useState(false);
  // Handle Next button click
  const handleNext = () => {
    if (!roles.length) return;
    if (roleIndex === -1) return;
    if (roleIndex === roles.length - 1) {
      setShowVotersForm(true);
    } else {
      setRole(roles[roleIndex + 1].key);
    }
    setActiveCard(null); // close modal if open when switching role
  };

  // Handle Previous button click
  const handlePrevious = () => {
    if (!roles.length) return;
    if (roleIndex > 0) {
      setRole(roles[roleIndex - 1].key);
    }
    setActiveCard(null); // close modal if open when switching role
  };

  const cards = roleData[role] || [];
  const currentRoleLabel =
    roleDisplayName[role] ||
    (roleIndex >= 0 ? roles[roleIndex]?.label : roles[0]?.label) ||
    "";

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [electionData, setElectionData] = useState(null);
  const [electionStatus, setElectionStatus] = useState("CLOSED");

  // Fetch election schedule from backend
  const getElectionSchedule = async () => {
    try {
      const response = await axios.post(
        `http://localhost:3004/smart-vote/get-election-schedule/${dept}`
      );
      if (response.data.success === true) {
        setElectionData(response.data.data[0]);
        setElectionStatus(response.data.data[0]?.status || "CLOSED");
      }
    } catch (error) {
      console.error("Error fetching election schedule:", error);
      setElectionStatus("CLOSED");
    }
  };

  useEffect(() => {
    getElectionSchedule();
  }, [dept, tabActive]);

  const closeDate = electionData?.close_date;
  const getFilingStatus = electionStatus === "OPEN" ? "open" : "closed";

  useEffect(() => {
    // Only start countdown if we have a valid close date
    if (!closeDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(closeDate);
      
      // Check if date is valid
      if (isNaN(end.getTime())) return;
      
      const diff = end - now;
      
      // Check if election has ended
      if (diff <= 0) {
        setIsElectionEnded(true);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      setIsElectionEnded(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [closeDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setVotersData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleClear = () => {
    const cleared = { ...votersData };
    roles.forEach((r) => {
      const key = toKey(r.label.replace(/--/g, "").trim());
      cleared[key] = "";
    });
    setVotersData(cleared);
  };




  const handleSubmitVote = async (e) => {
    e.preventDefault();

    // Check if election has ended
    if (isElectionEnded) {
      setResponseMessage({
        message: "This election has ended. Voting is closed.",
        type: "error",
      });
      return;
    }

    const requiredFields = roles.map((r) =>
      toKey(r.label.replace(/--/g, "").trim())
    );

    let newEmptyFields = { ...emptyFields };
    requiredFields.forEach((field) => {
      newEmptyFields[field] = !votersData[field];
    });

    setEmptyFields(newEmptyFields);

    if (requiredFields.some((field) => !votersData[field])) {
      console.log("Please fill in all required fields.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/insert-votes",
        { ...votersData, election_type: dept }
      );

      if (response.data.success === true) {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message || "Registration successful!",
            type: "success", // or any other type for styling
          });
          handleClear();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 3000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message || "Registration failed.",
            type: "error",
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 3000);
      }
      // Set a timeout to remove the responseMessage after 5 seconds
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" }); // Clear message after 5 seconds
      }, 5000); // 5000 milliseconds = 5 seconds
    } catch (error) {
      console.error(error);
    }
  };

  

  //.split transform string to an array
  //.join transfomr array to string
  const facial_descriptor = studentData?.facial_descriptor.split(',');
  // console.log(typeof(facial_descriptor));
  
  // const userdata = JSON.parse(localStorage.getItem("UserData")) || [];
  // const userdata = facedb[0];
  const handleVerifyFace = () => {
    setOpenCam(true);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setStatus("Detecting Face ✅");
        setIsModelsReady(true);
      } catch (err) {
        setStatus("Failed to load models ❌");
        console.error(err);
      }
    };
    loadModels();
  }, []);
  // console.log(userdata);

  // console.log(facial_descriptor);
  
  // Run face verification only for the logged-in user's descriptor
  useEffect(() => {
    if (!isModelsReady || !studentData || !facial_descriptor) return;

    const targetDescriptor = new Float32Array(facial_descriptor);
    const labeledDescriptor = new faceapi.LabeledFaceDescriptors(
      studentData.firstname +" "+ studentData.lastname,
      [targetDescriptor]
    );

    // Stricter threshold (0.5 = more strict, 0.6 = default)
    const matcher = new faceapi.FaceMatcher([labeledDescriptor], 0.5);

    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video;

        const detections = await faceapi
          .detectAllFaces(video)
          .withFaceLandmarks()
          .withFaceDescriptors();

        const dims = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        faceapi.matchDimensions(canvasRef.current, dims);
        const resized = faceapi.resizeResults(detections, dims);
        const ctx = canvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, dims.width, dims.height);

        if (resized.length === 0) {
          setStatus("No face detected. Please look at the camera.");
        }

        resized.forEach((det) => {
          const match = matcher.findBestMatch(det.descriptor);
          const { box } = det.detection;

          // Check if face matches the registered voter
          const isMatch = match.label === studentData.firstname + " " + studentData.lastname;
          
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: isMatch ? `✅ ${match.label}` : `❌ NOT RECOGNIZED`,
            boxColor: isMatch ? '#00ff00' : '#ff0000',
          });
          drawBox.draw(canvasRef.current);

          if (isMatch) {
            setIsFaceMatched(true);
            setStatus("✅ Face verified! Redirecting...");
          } else {
            setStatus("❌ Face does not match! Please try again.");
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isModelsReady, studentData]);

  // Handle successful face match
  useEffect(() => {
    if (isFaceMatched && studentData) {
      setTimeout(() => {
        setOpenCam(false);
        setHideButton(true);
      }, 5000);
    }
    console.log("Matche");
    console.log(hideButton);
  }, [isFaceMatched]);

  if (openCam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 p-4 space-y-4">
        <h1 className="text-2xl text-white font-bold">
          🔐 Verifying Your Identity
        </h1>
        <p className="text-sm text-gray-300">
          Logged in as: <span className="font-bold text-primary">{studentData?.firstname} {studentData?.lastname}</span>
        </p>
        <p className={`text-lg font-semibold ${
          status.includes("✅") ? "text-green-400" : 
          status.includes("❌") ? "text-red-400" : "text-yellow-400"
        }`}>
          {status}
        </p>
        <div className="relative w-[640px] h-[480px] bg-black rounded-lg overflow-hidden border-4 border-gray-600">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
            videoConstraints={{ 
              facingMode: "user",
              width: 640,
              height: 480
            }}
            className="rounded shadow"
            onUserMedia={() => {
              console.log("Camera started successfully");
              setStatus("📷 Camera ready - Looking for your face...");
            }}
            onUserMediaError={(err) => {
              console.error("Camera error:", err);
              setStatus("❌ Camera error: " + err.message);
            }}
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 z-10"
          />
        </div>
        <div className="bg-gray-700 p-4 rounded-lg text-center max-w-md">
          <p className="text-white text-sm">
            ⚠️ <strong>Security Notice:</strong> Your face must match the registered voter. 
            If you are not <strong>{studentData?.firstname} {studentData?.lastname}</strong>, 
            you will NOT be able to vote.
          </p>
        </div>
        <button
          className="btn btn-error btn-sm"
          onClick={() => setOpenCam(false)}
        >
          Cancel Verification
        </button>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-base-200 w-full overflow-auto">
      <Navbar />
      <div className="mt-20 flex justify-center">
        {getFilingStatus === "open" ? (
          isElectionEnded ? (
            <div className="text-center">
              <div className="text-2xl font-bold text-error mb-2">
                🚫 {dept} Election Has Ended
              </div>
              <p className="text-base-content/70">Voting is no longer available for this election.</p>
            </div>
          ) : (
            <ElectionCountdown countdown={countdown} dept={dept} />
          )
        ) : (
          <div className="text-xl mt-4 font-bold tracking-wider">
            NOT AVAILABLE
          </div>
        )}
      </div>

      {/* Loaders */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-75">
          {/* Prevent interaction with content behind */}
          <div className="pointer-events-none">
            <Loader />
          </div>
        </div>
      )}

      {/* Conditionally render the response message */}
      {responseMessage.message && (
        <div className="flex justify-center mt-4 px-4">
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
      <div className="px-6 md:px-20 py-8 flex flex-col justify-center">
        <div className="mb-4">
          <button
            className="btn btn-outline btn-sm flex items-center gap-2"
            onClick={() => navigate("/student/homepage")}
          >
            <FaArrowLeftLong /> Back to Homepage
          </button>
        </div>
        <div className="">
          {availableElections.map((election, index) => (
          <button
              key={election.id}
            className={`btn border-0 rounded-none border-b-0 border-red-400 tracking-wider ${
                tabActive === `tab${index + 1}` ? "btn-active border-1" : ""
            }`}
              onClick={() => handleTabClick(`tab${index + 1}`)}
          >
              {election.label}
          </button>
          ))}
        </div>
        {getFilingStatus != "open" ? (
          <div className="h-96 border border-gray-500 flex justify-center items-center">
            <div className="font-semibold tracking-wider text-xl">
              Election is not available
            </div>
          </div>
        ) : (
          <>
            {showVotersForm ? (
              <div className="relative flex items-center justify-center w-full p-4 border border-gray-500">
                <div
                  className=" absolute top-0 left-0 p-2 flex items-center gap-2 cursor-pointer hover:scale-105 w-fit"
                  onClick={() => setShowVotersForm(false)}
                >
                  <FaArrowLeftLong /> Back
                </div>
                <form action="" className=" w-full rounded-md border-base-300 ">
                  <div className="text-center text-base py-4 border-b-2 border-base-300 mb-2">
                    Voters Form
                  </div>
                  <div className="w-full p-6 ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border p-4 rounded-md">
                      <div>
                        <label htmlFor="vote-student-id" className="text-xs">
                          Student ID
                        </label>
                        <input
                          id="vote-student-id"
                          type="text"
                          placeholder="ID"
                          value={studentData?.student_id}
                          className="input input-bordered w-full"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="vote-voters-id" className="text-xs">
                          Voters ID
                        </label>
                        <input
                          id="vote-voters-id"
                          type="text"
                          placeholder="ID"
                          value={studentData?.voters_id}
                          className="input input-bordered w-full"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="vote-fullname" className="text-xs">
                          Fullname
                        </label>
                        <input
                          id="vote-fullname"
                          type="text"
                          placeholder="fullname"
                          value={
                            studentData?.firstname + " " + studentData.lastname
                          }
                          className="input input-bordered w-full"
                          readOnly
                        />
                      </div>
                      <div>
                        <label htmlFor="vote-email" className="text-xs">
                          Email Address
                        </label>
                        <input
                          id="vote-email"
                          type="text"
                          placeholder="email"
                          value={studentData?.email}
                          className="input input-bordered w-full"
                          readOnly
                        />
                      </div>

                      <div>
                        <label htmlFor="vote-department" className="text-xs">
                          Department/Course
                        </label>
                        <input
                          id="vote-department"
                          type="text"
                          value={studentData?.department}
                          placeholder="Department"
                          className="input input-bordered w-full"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roles.map((r) => {
                        const key = toKey(r.label.replace(/--/g, "").trim());
                        const options = roleData[r.key] || [];
                        if (!options.length) return null;
                        return (
                          <div key={r.key}>
                            <div className="mt-4 text-sm mb-1">{r.label.replace(/--/g, "").trim()}</div>
                            <div
                              className={`border p-4 rounded-md ${
                                emptyFields[key] ? "border-red-400" : ""
                              }`}
                            >
                              <div className="text-xs md:text-sm grid grid-cols-2 gap-4">
                                {options.map((cand, index) => {
                                  const radioId = `vote-${key}-${index}`;
                                  return (
                                    <div key={index} className="flex gap-4">
                                      <label htmlFor={radioId}>
                                        {cand.firstname} {cand.lastname}
                                      </label>
                                      <input
                                        id={radioId}
                                        type="radio"
                                        name={key}
                                        value={`${cand.firstname} ${cand.lastname}`}
                                        className="radio radio-info"
                                        onChange={handleChange}
                                        checked={
                                          votersData[key] ===
                                          `${cand.firstname} ${cand.lastname}`
                                        }
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Election Ended Message */}
                  {isElectionEnded && (
                    <div className="alert alert-error mb-4">
                      <span className="text-lg font-bold">🚫 This election has ended. Voting is closed.</span>
                    </div>
                  )}

                  {!hideButton && !isElectionEnded && (
                    <div className="flex justify-center">
                      <div
                        className="btn btn-warning text-white mx-auto w-full"
                        onClick={handleVerifyFace}
                      >
                        Verify Face
                      </div>
                    </div>
                  )}

                  {/* show button */}
                  {hideButton && !isElectionEnded && (
                    <>
                      <div className="text-center text-green-500 font-bold">
                        ✅ Face Verified
                      </div>
                      <div className="flex gap-2 justify-between p-5">
                        <button
                          className="btn btn-error"
                          onClick={handleSubmitVote}
                        >
                          Submit Vote
                        </button>
                        <div className="btn" onClick={handleClear}>
                          Clear Form
                        </div>
                      </div>
                    </>
                  )}
                </form>
              </div>
            ) : (
              <div className="w-auto py-2 flex flex-col items-center justify-center  border border-base-300">
                {roles.length === 0 ? (
                  <div className="text-base-content/70">No candidates available.</div>
                ) : (
                  <>
                    <div className="text-md font-bold tracking-wider mb-4 ">
                      {currentRoleLabel}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {cards?.map((card) => (
                        <div
                          key={card.id}
                          className="card bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 w-72 shadow-sm flex-shrink-0 snap-center transform transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:border-emerald-500 dark:hover:border-emerald-500"
                        >
                          {/* Candidate Image */}
                          <figure className="px-4 pt-4">
                            {card.image && card.image.trim() !== '' ? (
                              <img
                                src={card.image.startsWith('http://') || card.image.startsWith('https://') ? card.image : `http://localhost:3004${card.image.startsWith('/') ? card.image : '/' + card.image}`}
                                alt={`${card.firstname} ${card.lastname}`}
                                className="w-full h-48 object-cover rounded-lg"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.nextElementSibling;
                                  if (placeholder) placeholder.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div 
                              className={`w-full h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center ${card.image && card.image.trim() !== '' ? 'hidden' : ''}`}
                              style={{ display: card.image && card.image.trim() !== '' ? 'none' : 'flex' }}
                            >
                              <div className="text-6xl font-bold text-emerald-600">
                                {card.firstname?.[0]?.toUpperCase() || '?'}
                                {card.lastname?.[0]?.toUpperCase() || ''}
                              </div>
                            </div>
                          </figure>
                          <div className="card-body">
                            <h2 className="card-title text-lg font-bold text-base-content">{card.party}</h2>
                            <p className="text-base-content/80">
                              {card.firstname} {card.lastname}
                            </p>
                            <p className="text-sm text-base-content/60">{card.department}</p>
                            <div className="card-actions justify-end">
                              <button
                                className="btn btn-outline w-full"
                                onClick={() => {
                                  setActiveCard(card);
                                  setIsOpen(true);
                                }}
                              >
                                Candidate Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center mt-4 gap-6">
                      <button
                        className="btn btn-outline"
                        onClick={handlePrevious}
                        disabled={roleIndex <= 0}
                      >
                        Previous
                      </button>
                      <button
                        className="btn btn-outline w-24"
                        onClick={handleNext}
                        disabled={roleIndex === -1}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {activeCard && (
                  <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30  backdrop-blur-sm transition-opacity duration-500 ease-in-out ${
                      isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div
                      className={`bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 p-6 rounded-lg shadow-lg w-[90%] max-w-xl transform transition-transform duration-500 ease-in-out hover:border-emerald-500 dark:hover:border-emerald-500 ${
                        isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
                      }`}
                    >
                      {/* Candidate Image in Modal */}
                      <div className="mb-4 flex justify-center">
                        {activeCard.image ? (
                          <img
                            src={activeCard.image.startsWith('http') ? activeCard.image : `http://localhost:3004${activeCard.image}`}
                            alt={`${activeCard.firstname} ${activeCard.lastname}`}
                            className="w-48 h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                              e.target.style.display = 'none';
                              const placeholder = e.target.nextElementSibling;
                              if (placeholder) placeholder.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-48 h-48 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center ${activeCard.image ? 'hidden' : ''}`}
                          style={{ display: activeCard.image ? 'none' : 'flex' }}
                        >
                          <div className="text-6xl font-bold text-emerald-600">
                            {activeCard.firstname?.[0]?.toUpperCase() || '?'}
                            {activeCard.lastname?.[0]?.toUpperCase() || ''}
                          </div>
                        </div>
                      </div>

                      <h2 className="text-xl mb-2 font-bold">{activeCard.party}</h2>
                      <div className="text-xl font-bold mb-2">
                        {activeCard.firstname} {activeCard.lastname}
                      </div>
                      <div className="text-lg mb-4 text-base-content/70">{activeCard.department}</div>
                      {activeCard.about_yourself && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">About</h3>
                          <p className="text-base-content/80">{activeCard.about_yourself}</p>
                        </div>
                      )}
                      {activeCard.purpose && (
                        <div className="mb-4">
                          <h3 className="font-semibold mb-2">Platform</h3>
                          <p className="text-base-content/80">{activeCard.purpose}</p>
                        </div>
                      )}
                      <div className="w-full flex justify-end ">
                        <button
                          className="btn btn-secondary "
                          onClick={() => setIsOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
