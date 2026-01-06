import { useEffect, useState } from "react";
import CountDown from "./CountDown";
import Navbar from "./Navbar";
import dropdowndata from "../utils/dropdowndata";
import axios from "axios";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { FaCircleXmark, FaArrowLeftLong } from "react-icons/fa6";
import { sendMail } from "../utils/mailer";
export default function CandidacyForm() {
  const navigate = useNavigate();
  const [candidacyOpened, setCandidacyOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tabActive, setTabActive] = useState("tab1");

  const loggedUser = JSON.parse(localStorage.getItem("UserData"));
  const studentDept = loggedUser?.department?.toUpperCase() || "";
  
  // Get available candidacy types for this student based on their department
  const getAvailableCandidacyTypes = () => {
    const candidacyTypes = [{ id: "SSG", label: "SSG Candidacy" }]; // SSG is for all students
    
    // Add department-specific candidacy
    if (["BSIT", "CCS"].includes(studentDept)) {
      candidacyTypes.push({ id: "BSIT", label: "BSIT Candidacy" });
    }
    if (["BSA", "CBA"].includes(studentDept)) {
      candidacyTypes.push({ id: "BSA", label: "BSA Candidacy" });
    }
    if (["BEED", "CTE"].includes(studentDept)) {
      candidacyTypes.push({ id: "BEED", label: "BEED Candidacy" });
    }
    if (["CRIMINOLOGY", "CRIM", "CJE"].includes(studentDept)) {
      candidacyTypes.push({ id: "CRIMINOLOGY", label: "CRIMINOLOGY Candidacy" });
    }
    if (["PSYCH", "PSYCHOLOGY"].includes(studentDept)) {
      candidacyTypes.push({ id: "PSYCH", label: "PSYCH Candidacy" });
    }
    
    return candidacyTypes;
  };

  const availableCandidacyTypes = getAvailableCandidacyTypes();
  const tabIndex = parseInt(tabActive.replace("tab", "")) - 1;
  const selectedCandidacyType = availableCandidacyTypes[tabIndex] || availableCandidacyTypes[0];
  const dept = selectedCandidacyType?.id || "SSG";

  // const [closeDate, setCloseDate] = useState("");
  const [candidateData, setCandidateData] = useState({
    student_id: loggedUser?.student_id || "",
    voters_id: loggedUser?.voters_id || "",
    firstname: loggedUser?.firstname || "",
    lastname: loggedUser?.lastname || "",
    department: loggedUser?.department || "",
    email: loggedUser?.email || "",
    position: "",
    party: "",
    about_yourself: "",
    purpose: "",
    election_type: dept,
    image: "", // Image URL from upload
  });

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  // useEffect(() => {
  //   console.log(tabActive);
  // }, [tabActive]);
  //* Get Candidacy Schedule
  const [candidacySchedule, setCandidacySchedule] = useState();

  const getCandidacySchedule = async () => {
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
      } else {
        setCandidacySchedule(null);
      }
    } catch (error) {
      console.error(error);
      setCandidacySchedule(null);
    }
  };

  useEffect(() => {
    getCandidacySchedule();
    // Update election_type when dept changes
    setCandidateData(prev => ({
      ...prev,
      election_type: dept,
    }));
  }, [dept]);

  // console.log(candidacySchedule);

  //* Get All Admins
  const [admins, setAdmins] = useState([]);
  const geAllAdmin = async (e) => {
    try {
      const response = await axios.get(
        "http://localhost:3004/smart-vote/get-admins"
      );

      if (response.data.success === true) {
        setAdmins(response.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    geAllAdmin();
  }, []);

  const filteredData = admins.filter((item) => item.departments === dept);

  const handleTabClick = (tab) => {
    const { position, party, about_yourself, purpose } = candidateData;
    const hasChanges = position || party || about_yourself || purpose;

    if (hasChanges) {
      const confirmSwitch = window.confirm(
        "Changes will not be saved. Do you want to continue?"
      );
      if (!confirmSwitch) return;
    }

    // Get the candidacy type for the selected tab
    const tabIdx = parseInt(tab.replace("tab", "")) - 1;
    const selectedType = availableCandidacyTypes[tabIdx] || availableCandidacyTypes[0];
    const newDept = selectedType?.id || "SSG";

    // Clear the form
    setCandidateData({
      student_id: loggedUser?.student_id || "",
      voters_id: loggedUser?.voters_id || "",
      firstname: loggedUser?.firstname || "",
      lastname: loggedUser?.lastname || "",
      department: loggedUser?.department || "",
      email: loggedUser?.email || "",
      position: "",
      party: "",
      about_yourself: "",
      purpose: "",
      election_type: newDept,
      image: "",
    });
    // Clear image state
    setImageFile(null);
    setImagePreview(null);

    // Switch the tab
    setTabActive(tab);
    // getCandidacySchedule will be called by useEffect when dept changes
    // console.log(tabActive);
  };

  // console.log(tabActive);

  // useEffect(() => {
  //   console.log(tabActive);
  // }, [tabActive]); // Runs every time tabActive changes

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setCandidateData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setResponseMessage({
          message: "Please select a valid image file.",
          type: "error",
        });
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 3000);
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setResponseMessage({
          message: "Image size should be less than 5MB.",
          type: "error",
        });
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 3000);
        return;
      }

      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Auto-upload the image
      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await axios.post(
          'http://localhost:3004/smart-vote/upload-candidate-image',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success === true) {
          const imageUrl = response.data.data.url;
          setCandidateData((prevData) => ({
            ...prevData,
            image: imageUrl,
          }));
        } else {
          throw new Error(response.data.message || 'Failed to upload image');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        setResponseMessage({
          message: error.response?.data?.message || "Failed to upload image. Please try again.",
          type: "error",
        });
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 3000);
        // Reset image state on error
        setImageFile(null);
        setImagePreview(null);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // Upload image to backend
  const handleImageUpload = async () => {
    if (!imageFile) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(
        'http://localhost:3004/smart-vote/upload-candidate-image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success === true) {
        const imageUrl = response.data.data.url;
        setCandidateData((prevData) => ({
          ...prevData,
          image: imageUrl,
        }));
        setResponseMessage({
          message: "Image uploaded successfully!",
          type: "success",
        });
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setResponseMessage({
        message: error.response?.data?.message || "Failed to upload image. Please try again.",
        type: "error",
      });
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" });
      }, 3000);
      // Reset image state on error
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCandidateData((prevData) => ({
      ...prevData,
      image: "",
    }));
  };

  // const data = [
  //   {
  //     adminId: "test1",
  //     adminPassword: "testpass",
  //     closeFileDate: "2025-09-18T16:59",
  //     department: "SSG",
  //     filingStatus: "open",
  //   },
  //   {
  //     adminId: "test1",
  //     adminPassword: "testpass",
  //     closeFileDate: "2025-09-18T16:35",
  //     department: "BSIT",
  //     filingStatus: "closed",
  //   },
  // ];

  const getFilingStatus = candidacySchedule?.status;
  const closeDate = candidacySchedule?.close_date;

  // useEffect(() => {
  //   if (getFilingStatus === "open") {
  //     setCandidacyOpened(true);
  //     // setShowCandidacyForm(false);
  //   } else {
  //     setCandidacyOpened(false);
  //     // setShowCandidacyForm(true);
  //   }
  // }, [data]);

  // Update countdown every second
  useEffect(() => {
    // if (!candidacyOpened || !closeDate) return;

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
  }, [closeDate]);
  // }, [candidacyOpened, closeDate]);

  const [emptyFields, setEmptyFields] = useState({
    position: false,
    party: false,
    about_yourself: false,
    purpose: false,
  });

  const [responseMessage, setResponseMessage] = useState({
    message: "",
    type: "",
  }); // {message, type}

  const emailData = {
    to: "joshuacatapan2003@gmail.com",
    subject: "Smart Vote Filing Of Candidacy",
    text: `${
      candidateData.firstname + " " + candidateData.lastname
    } has filed candidacy for the position of ${
      candidateData.position
    }. Need your Review and Approval`,
    html: `${
      candidateData.firstname + " " + candidateData.lastname
    } has filed candidacy for the position of ${
      candidateData.position
    }. Need your Review and Approval`,
  };

  const handleSubmitCandidacy = async (e) => {
    e.preventDefault();

    const requiredFields = ["position", "about_yourself", "purpose"];

    let newEmptyFields = { ...emptyFields };
    // Check if any required field is empty and mark it in the state
    requiredFields.forEach((field) => {
      newEmptyFields[field] = !candidateData[field];
    });

    setEmptyFields(newEmptyFields);

    // If any field is empty, prevent submission
    if (requiredFields.some((field) => !candidateData[field])) {
      console.log("Please fill in all required fields.");
      return;
    }
    
    // Ensure image field is always included
    const submissionData = {
      ...candidateData,
      // Send image as-is if it exists, otherwise send empty string (backend will convert to null)
      image: candidateData.image || '',
    };
    
    console.log('Submitting candidacy data:', submissionData);
    console.log('Image URL being sent:', submissionData.image);
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/insert-candidates",
        submissionData
      );
      if (response.data.success === true) {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message || "Registration successful!",
            type: "success", // or any other type for styling
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
          sendMail(emailData);
        }, 3000);
        setTimeout(() => {
          navigate("/student/homepage");
        }, 5000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message || "Login failed.",
            type: "error",
          });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 3000);
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 5000);
      }
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-base-200 overflow-auto">
      <Navbar />
      <div className="mt-20 flex justify-center">
        {getFilingStatus === "OPEN" ? (
          <CountDown countdown={countdown} dept={dept} />
        ) : (
          <div className="text-xl mt-4 font-bold tracking-wider">
            NOT AVAILABLE
          </div>
        )}
      </div>

      {/* Centered Loader with disabled backdrop click */}
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
        <div className="flex justify-center mt-4 px-2">
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

      {/* name of each tab group should be unique */}

      <div className="px-6 md:px-20 py-8 flex-1 flex-col justify-center">
        <div className="mb-4">
          <button
            className="btn btn-outline btn-sm flex items-center gap-2"
            onClick={() => navigate("/student/homepage")}
          >
            <FaArrowLeftLong /> Back to Homepage
          </button>
        </div>
        {/* name of each tab group should be unique */}
        <div className="">
          {availableCandidacyTypes.map((candidacyType, index) => {
            const tabId = `tab${index + 1}`;
            return (
              <button
                key={candidacyType.id}
                className={`btn border-0 rounded-none border-b-0 border-red-400 tracking-wider ${
                  tabActive === tabId ? "btn-active border-1" : ""
                }`}
                onClick={() => handleTabClick(tabId)}
              >
                {candidacyType.label}
              </button>
            );
          })}
        </div>

        {getFilingStatus != "OPEN" ? (
          <div className="h-96 border border-base-300 flex justify-center items-center ">
            <h1 className="text-base md:text-xl font-bold tracking-wider">
              Filing of Candidacy is not available.
            </h1>
          </div>
        ) : (
          <form action="" className="border border-base-300 ">
              
            <div className="text-center text-2xl py-4 border-b-2 border-base-300 mb-2">
             
              {`${selectedCandidacyType?.label || "SSG Candidacy"} Form`}
              
            </div>
            <div className="w-full p-6 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border p-4 rounded-md">
                <div>
                  <label htmlFor="candidate-student-id" className="text-xs">
                    Student ID
                  </label>
                  <input
                    id="candidate-student-id"
                    type="text"
                    className="input input-bordered w-full"
                    name="student_id"
                    placeholder="Student ID"
                    value={candidateData.student_id}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="candidate-voters-id" className="text-xs">
                    Voters ID
                  </label>
                  <input
                    id="candidate-voters-id"
                    type="text"
                    className="input input-bordered w-full"
                    name="Voters_id"
                    placeholder="voters_id"
                    value={candidateData.voters_id}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="candidate-firstname" className="text-xs">
                    First Name
                  </label>
                  <input
                    id="candidate-firstname"
                    type="text"
                    className="input input-bordered w-full"
                    name="firstname"
                    placeholder="First Name"
                    value={candidateData.firstname}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="candidate-lastname" className="text-xs">
                    Last Name
                  </label>
                  <input
                    id="candidate-lastname"
                    type="text"
                    className="input input-bordered w-full"
                    name="lastname"
                    placeholder="Last Name"
                    value={candidateData.lastname}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="candidate-email" className="text-xs">
                    Email
                  </label>
                  <input
                    id="candidate-email"
                    type="text"
                    className="input input-bordered w-full"
                    name="email"
                    placeholder="Email"
                    value={candidateData.email}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="candidate-department" className="text-xs">
                    Department/Course
                  </label>
                  <input
                    id="candidate-department"
                    type="text"
                    className="input input-bordered w-full"
                    name="department"
                    placeholder="Department/Course"
                    value={candidateData.department}
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="candidate-position" className="text-xs">
                    Position
                  </label>
                  <select
                    id="candidate-position"
                    className={`input input-bordered w-full ${
                      emptyFields.position ? "input-error" : ""
                    }`}
                    name="position"
                    placeholder="Position"
                    value={candidateData.position || ""}
                    onChange={handleChanges}
                    required
                  >
                    <option value="">Please Select</option>
                    {tabActive === "tab1"
                      ? dropdowndata.getDepPositions().map((pos) => (
                          <option key={pos.id} value={pos.name}>
                            {pos.name}
                          </option>
                        ))
                      : dropdowndata.getSsgPositions().map((pos) => (
                          <option key={pos.id} value={pos.name}>
                            {pos.name}
                          </option>
                        ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="candidate-party" className="text-xs">
                    Parties
                  </label>
                  <input
                    id="candidate-party"
                    type="text"
                    className="input input-bordered w-full"
                    name="party"
                    placeholder="Parties/Organization"
                    value={candidateData.party}
                    onChange={handleChanges}
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm">Tell us about yourself</div>
                <textarea
                  className={`border w-full rounded-md text-sm p-4 ${
                    emptyFields.about_yourself ? "border-error" : ""
                  }`}
                  name="about_yourself"
                  placeholder="Enter a brief description"
                  value={candidateData.about_yourself || ""}
                  onChange={handleChanges}
                ></textarea>
              </div>
              <div className="mt-4">
                <div className="text-sm">Purpose of filing</div>
                <textarea
                  className={`border w-full rounded-md text-sm p-4 ${
                    emptyFields.purpose ? "border-error" : ""
                  }`}
                  name="purpose"
                  placeholder="Enter a brief description"
                  value={candidateData.purpose || ""}
                  onChange={handleChanges}
                ></textarea>
              </div>
              
              {/* Image Upload Section */}
              <div className="mt-4">
                <label htmlFor="candidate-image" className="text-sm font-medium">
                  Candidate Photo (Optional)
                </label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-base-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                      >
                        ×
                      </button>
                      {isUploadingImage && (
                        <div className="mt-2 text-xs text-info">
                          Uploading...
                        </div>
                      )}
                      {candidateData.image && !isUploadingImage && (
                        <div className="mt-2 text-xs text-success">
                          ✓ Image uploaded successfully
                        </div>
                      )}
                    </div>
                  ) : candidateData.image ? (
                    <div className="relative inline-block">
                      <img
                        src={candidateData.image}
                        alt="Candidate"
                        className="w-48 h-48 object-cover rounded-lg border-2 border-base-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 btn btn-sm btn-circle btn-error"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-base-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        id="candidate-image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="candidate-image"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <svg
                          className="w-12 h-12 text-base-content/50 mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm text-base-content/70">
                          Click to upload candidate photo
                        </span>
                        <span className="text-xs text-base-content/50 mt-1">
                          PNG, JPG, GIF up to 5MB
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
           
            <div className="flex gap-2 justify-center p-6">
            {/* pointer-events-none */}
              <button 
                className="btn btn-error" 
                onClick={handleSubmitCandidacy}
                disabled={isUploadingImage}
              >
                Submit Candidacy
              </button>
              <button 
                className="btn"
                type="button"
                onClick={() => {
                  setCandidateData({
                    student_id: loggedUser?.student_id || "",
                    voters_id: loggedUser?.voters_id || "",
                    firstname: loggedUser?.firstname || "",
                    lastname: loggedUser?.lastname || "",
                    department: loggedUser?.department || "",
                    email: loggedUser?.email || "",
                    position: "",
                    party: "",
                    about_yourself: "",
                    purpose: "",
                    election_type: dept,
                    image: "",
                  });
                  setImageFile(null);
                  setImagePreview(null);
                  setEmptyFields({
                    position: false,
                    party: false,
                    about_yourself: false,
                    purpose: false,
                  });
                }}
              >
                Clear Form
              </button>
            </div>
          
          </form>
        )}
      </div>
    </div>
  );
}
