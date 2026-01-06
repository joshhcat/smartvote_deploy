import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import testImage from "../assets/unsplash.jpg";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
export default function Register() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    firstname: "",
    lastname: "",
    course: "",
    year: "",
    email: "",
    password: "",
    facial_descriptor: "",
  });

  // Clear face-db when component mounts (new registration session)
  useEffect(() => {
    localStorage.removeItem("face-db");
    setFaceRegistered(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const [emptyFields, setEmptyFields] = useState({
    student_id: false,
    firstname: false,
    lastname: false,
    department: false,
    course: false,
    year: false,
    email: false,
    password: false,
  });

  const [responseMessage, setResponseMessage] = useState({
    message: "",
    type: "",
  }); // {message, type}

  const [open, setOpen] = useState(false);

  const handleFacial = () => {
    const requiredFields = [
      "student_id",
      "firstname",
      "lastname",
      "department",
      "course",
      "year",
      "email",
      "password",
    ];

    let newEmptyFields = { ...emptyFields };
    // Check if any required field is empty and mark it in the state
    requiredFields.forEach((field) => {
      newEmptyFields[field] = !formData[field];
    });

    setEmptyFields(newEmptyFields);

    // If any field is empty, prevent submission
    if (requiredFields.some((field) => !formData[field])) {
      console.log("Please fill in all required fields.");
      return;
    }

    setOpen(true);
  };

  // Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      setStatus("Models loaded ✅");
      setModelsLoaded(true);
    };
    loadModels();
  }, [open]);

  // Draw face detections continuously on canvas
  useEffect(() => {
    let intervalId;

    if (modelsLoaded) {
      intervalId = setInterval(async () => {
        if (
          webcamRef.current &&
          webcamRef.current.video.readyState === 4 // video is ready
        ) {
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;

          // Detect faces with landmarks
          const detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks();

          // Resize canvas to video dimensions
          const dims = {
            width: video.videoWidth,
            height: video.videoHeight,
          };
          faceapi.matchDimensions(canvas, dims);

          const resizedDetections = faceapi.resizeResults(detections, dims);

          // Clear canvas before drawing
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw detections & landmarks
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        }
      }, 100); // update every 100ms
    }

    return () => clearInterval(intervalId);
  }, [modelsLoaded]);

  // Capture face descriptor and save with name
  const captureAndRegister = async () => {
    // if (!) {
    //   setStatus("Please enter a name.");
    //   return;
    // }

    if (!webcamRef.current || webcamRef.current.video.readyState !== 4) {
      setStatus("Camera not ready.");
      return;
    }

    const video = webcamRef.current.video;

    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("No face detected. Please try again.");
      return;
    }

    // Convert descriptor to array for storage
    const descriptor = Array.from(detection.descriptor);

    // Load existing DB or create new
    const db = JSON.parse(localStorage.getItem("face-db")) || [];
    // db.push({ l, descriptor });
    db.push({ ...formData, descriptor });
    localStorage.setItem("face-db", JSON.stringify(db));

    // Mark face as registered for this session
    setFaceRegistered(true);

    setTimeout(() => {
      setOpen(false);
    }, 2000);

    setStatus(
      `✅ Face registered for ${formData?.firstname} ${formData?.lastname}`
    );
  };

  const face_db = JSON.parse(localStorage.getItem("face-db")) || [];
  const facialDesc = face_db[0]?.descriptor.join(',');
  const handleRegister = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "student_id",
      "firstname",
      "lastname",
      "department",
      "course",
      "year",
      "email",
      "password",
    ];

    let newEmptyFields = { ...emptyFields };
    // Check if any required field is empty and mark it in the state
    requiredFields.forEach((field) => {
      newEmptyFields[field] = !formData[field];
    });

    setEmptyFields(newEmptyFields);

    // If any field is empty, prevent submission
    if (requiredFields.some((field) => !formData[field])) {
      console.log("Please fill in all required fields.");
      return;
    }

    // Check if face was registered in THIS session (not from old data)
    if (!faceRegistered || face_db.length === 0) {
      setResponseMessage({
        message: "Facial Recognition Required! Please register your face first.",
        type: "error",
      });
      setTimeout(() => {
        setResponseMessage({
          message: "",
          type: "",
        });
      }, 3000);

      return;
    }
    // Add registration logic here

    try {
      const response = await axios.post(
        "http://localhost:3004/smart-vote/voters",
        {...formData, facial_descriptor: facialDesc}
      );
      if (response.data.success === true) {
        // Clear face-db after successful registration
        localStorage.removeItem("face-db");
        setFaceRegistered(false);
        
        setResponseMessage({
          message: response.data.message || "Registration successful!",
          type: "success",
        });

        setFormData({
          student_id: "",
          firstname: "",
          lastname: "",
          deparment: "",
          course: "",
          year: "",
          email: "",
          password: "",
          facial_descriptor: "",
        });
      } else {
        localStorage.removeItem("face-db");
        setResponseMessage({
          message: response.data.message || "Registration failed.",
          type: "error",
        });
      }

      // Set a timeout to remove the responseMessage after 5 seconds
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" }); // Clear message after 5 seconds
      }, 5000); // 5000 milliseconds = 5 seconds
    } catch (error) {
      console.error(error);
    }
  };

  if (open) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4 space-y-4">
      
        <h1 className="text-2xl text-base-content/70 font-bold ">Register Face</h1>
        <div className="relative w-[640px] h-[480px]">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={640}
            height={480}
            videoConstraints={{ facingMode: "user" }}
            className="rounded shadow"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 z-10"
          />
        </div>

        <button
          onClick={captureAndRegister}
          className="btn btn-primary"
          disabled={!modelsLoaded}
        >
          {modelsLoaded ? "Register Face" : "Loading..."}
        </button>

        <p className="text-green-600">{status}</p>
      </div>
    );
  }

  return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800">
      <div className="flex min-h-screen ">
        <div className="w-full md:w-1/2 flex items-center justify-center p-4 ">
          <div className="card w-96 bg-base-100 border-2 border-emerald-300 dark:border-emerald-600 shadow-xl z-10">
            {/* Conditionally render the response message */}
            {responseMessage.message && (
              <div className="flex justify-center mt-4 px-4">
                <div
                  className={`alert w-72 md:w-86 ${responseMessage.type === "success"
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
            <div className="card-body">
              {/* <h2 className="card-title justify-center">Register</h2> */}
              <form onSubmit={handleRegister} className="space-y-4 ">
                <div className="text-center text-xl font-bold tracking-wider">
                  Voters Registration
                </div>
                <input
                  type="text"
                  placeholder="ID"
                  className={`input input-bordered w-full ${emptyFields.student_id ? "input-error" : ""
                    }`}
                  name="student_id"
                  value={formData.student_id || ""}
                  onChange={handleChange}
                // required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  className={`input input-bordered w-full ${emptyFields.firstname ? "input-error" : ""
                    }`}
                  name="firstname"
                  value={formData.firstname || ""}
                  onChange={handleChange}
                // required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className={`input input-bordered w-full ${emptyFields.lastname ? "input-error" : ""
                    }`}
                  name="lastname"
                  value={formData.lastname || ""}
                  onChange={handleChange}
                // required
                />
                <input
                  type="text"
                  placeholder="Department"
                  className={`input input-bordered w-full ${emptyFields.department ? "input-error" : ""
                    }`}
                  name="department"
                  value={formData.department || ""}
                  onChange={handleChange}
                // required
                />
                <input
                  type="text"
                  placeholder="Course"
                  className={`input input-bordered w-full ${emptyFields.course ? "input-error" : ""
                    }`}
                  name="course"
                  value={formData.course || ""}
                  onChange={handleChange}
                // required
                />
                 <select
                  className={`select select-bordered w-full ${emptyFields.year ? "select-error" : ""
                    }`}
                  name="year"
                  value={formData.year || ""}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Year
                  </option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>

                <select
                  className={`select select-bordered w-full ${emptyFields.gender ? "select-error" : ""
                    }`}
                  name="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                >
                  <option value="" disabled >
                    Select Gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select> 

                <input
                  type="text"
                  placeholder="Email"
                  className={`input input-bordered w-full ${emptyFields.email ? "input-error" : ""
                    }`}
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                // required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className={`input input-bordered w-full ${emptyFields.password ? "input-error" : ""
                    }`}
                  name="password"
                  value={formData.password || ""}
                  onChange={handleChange}
                // required
                />
                {/* <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input input-bordered w-full"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                /> */}
                <button
                // disabled
                  className="btn btn-warning text-white w-full"
                  onClick={handleFacial}
                >
                  Register Face
                </button>
                <button type="submit" 
                // disabled
                className="btn btn-primary w-full">
                  Register
                </button>
              </form>
              <div className="text-center w-full mt-4">
                Already have an account?&nbsp;
                <Link
                  to="/login"
                  className="link link-hover font-medium text-blue-600"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-1/2 py-8 px-12 hidden md:flex flex-col overflow-hidden">
          {/* Background image */}
          <img
            src={testImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-1 opacity-40 blur-xs"
          />

          {/* Overlay (optional for readability) */}
          <div className="absolute inset-0 bg-black opacity-5 z-0"></div>

          {/* Text content */}
          <div className="relative z-20 mt-20 text-4xl font-bold tracking-wider text-white">
            "Empowering Every Student Voice — Vote Anytime, Anywhere."
          </div>
          <div className="relative z-20 mt-10 text-justify text-md text-2xl font-bold italic text-white ">
            Welcome to Smart Vote
          </div>
          <div className="text-base mt-4 text-justify text-white">
            The innovative online voting system designed to streamline and
            secure the election process for our school community. With Smart
            Vote, students can easily register as voters,
          </div>
        </div>
      </div>
    </div>
  );
}
