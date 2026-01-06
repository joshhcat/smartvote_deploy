import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const Test = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Loading models...");
  const [modelsLoaded, setModelsLoaded] = useState(false);

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
  }, []);

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
    if (!name) {
      setStatus("Please enter a name.");
      return;
    }

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
    db.push({ name, descriptor });
    localStorage.setItem("face-db", JSON.stringify(db));

    setStatus(`✅ Face registered for "${name}"`);
    setName("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 space-y-4">
      <h1 className="text-2xl font-bold">Register Face</h1>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-64"
      />

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
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        disabled={!modelsLoaded}
      >
        {modelsLoaded ? "Register Face" : "Loading..."}
      </button>

      <p className="text-green-600">{status}</p>
    </div>
  );
};

export default Test;
