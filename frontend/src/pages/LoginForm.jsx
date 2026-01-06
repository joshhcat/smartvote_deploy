import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import testImage from "../assets/unsplash.jpg";
import slogo from "../assets/slogo.png";
import Loader from "../components/Loader";
import axios from "axios";
import { FaCheckCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    student_id: "",
    password: "",
  });

  const [error, setError] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    message: "",
    type: "",
  }); // {message, type}
  
  // Password update modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminDataForUpdate, setAdminDataForUpdate] = useState(null);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordError("");
  };

  const handleUpdatePassword = async () => {
    // Validate passwords
    if (!passwordData.old_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError("All fields are required");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (passwordData.old_password === passwordData.new_password) {
      setPasswordError("New password must be different from old password");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/update-admin-password",
        {
          admin_id: adminDataForUpdate[0].admin_id,
          old_password: passwordData.old_password,
          new_password: passwordData.new_password,
        }
      );

      if (response.data.success === true) {
        setIsLoading(false);
        setShowPasswordModal(false);
        setResponseMessage({
          message: "Password updated successfully! Please login with your new password.",
          type: "success",
        });
        // Reset form
        setLoginData({ student_id: "", password: "" });
        setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
        setAdminDataForUpdate(null);
        
        setTimeout(() => {
          setResponseMessage({ message: "", type: "" });
        }, 5000);
      } else {
        setIsLoading(false);
        setPasswordError(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setPasswordError("An error occurred. Please try again.");
    }
  };

  const handleAdminLogin = async (e) => {
    if (loginData.student_id === "" || loginData.password === "") {
      setError(true);
      return;
    }

    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/admin-login",
        {
          admin_id: loginData.student_id,
          password: loginData.password,
        }
      );
      if (response.data.success === true) {
        const adminData = response.data.data;
        
        // Check if it's first login (is_first_login = 1) - show optional password change
        if (adminData[0]?.is_first_login === 1) {
          setIsLoading(false);
          setAdminDataForUpdate(adminData);
          setPasswordData((prev) => ({ ...prev, old_password: loginData.password }));
          setShowPasswordModal(true);
          return;
        }
        
        setTimeout(() => {
          setIsLoading(false);
          localStorage.setItem("AdminData", JSON.stringify(response.data.data));
          setResponseMessage({
            message: response.data.message || "Login successful!",
            type: "success", // or any other type for styling
          });
        }, 3000);
        setTimeout(() => {
          navigate("/admin");
        }, 5000);
      } else {
        setTimeout(() => {
          setIsLoading(false);
          setResponseMessage({
            message: response.data.message || "Login failed.",
            type: "error",
          });
        }, 3000);
      }

      // Set a timeout to remove the responseMessage after 5 seconds
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" }); // Clear message after 5 seconds
      }, 5000); // 5000 milliseconds = 5 seconds
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
    // Add admin login logic
  };

  const studentLogin = async (e) => {
    e.preventDefault();

    if (loginData.student_id === "" || loginData.password === "") {
      setError(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:3004/smart-vote/voters-login",
        loginData
      );
      if (response.data.success === true) {
        setTimeout(() => {
          setIsLoading(false);
          localStorage.setItem("UserData", JSON.stringify(response.data.data));
          setResponseMessage({
            message: response.data.message || "Login successful!",
            type: "success", // or any other type for styling
          });
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
        }, 3000);
      }

      // Set a timeout to remove the responseMessage after 5 seconds
      setTimeout(() => {
        setResponseMessage({ message: "", type: "" }); // Clear message after 5 seconds
      }, 5000); // 5000 milliseconds = 5 seconds
    } catch (error) {
      console.error(error);
    }

    // setIsLoading(true);
    // setTimeout(() => {
    //   localStorage.setItem("User", "Student");
    //   navigate("/student/homepage");

    //   setIsLoading(false);
    // }, 10000);
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //   try {
  //     // perform login
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return (
      <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800">
      {/* Centered Loader with disabled backdrop click */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black opacity-75">
          {/* Prevent interaction with content behind */}
          <div className="pointer-events-none">
            <Loader />
          </div>
        </div>
      )}

      {/* Password Update Modal - Optional */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-base-100 rounded-lg shadow-xl p-6 w-96 max-w-[90%]">
            <h3 className="text-xl font-bold mb-4 text-center">Change Password?</h3>
            <p className="text-sm text-base-content/70 mb-4 text-center">
              Would you like to change your default password? You can skip this and do it later.
            </p>
            
            {passwordError && (
              <div className="alert alert-error mb-4 py-2">
                <FaCircleXmark />
                <span className="text-sm">{passwordError}</span>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="relative">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <input
                  type={showOldPassword ? "text" : "password"}
                  name="old_password"
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-12 text-base-content/60"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                >
                  {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              <div className="relative">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-12 text-base-content/60"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              
              <div className="relative">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full pr-10"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-12 text-base-content/60"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <button
                className="btn btn-primary w-full"
                onClick={handleUpdatePassword}
              >
                Update Password
              </button>
              <button
                className="btn btn-outline w-full"
                onClick={() => {
                  // Skip and continue to admin dashboard
                  setShowPasswordModal(false);
                  localStorage.setItem("AdminData", JSON.stringify(adminDataForUpdate));
                  setResponseMessage({
                    message: "Login successful!",
                    type: "success",
                  });
                  setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
                  setPasswordError("");
                  setTimeout(() => {
                    navigate("/admin");
                  }, 2000);
                }}
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Card & Side Info Section */}
      <div className="flex min-h-screen">
        {/* Login Card */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-4">
          <div className="card w-96 bg-base-100 shadow-xl z-10">
            {/* Conditionally render the response message */}

            <div className="card-body">
              <div className="flex justify-center items-center gap-3 mb-4">
                <img src={slogo} alt="Smart Vote" className="h-25 w-auto" />
                <h2 className="text-2xl tracking-widest font-bold">Smart Vote</h2>
              </div>
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
              <form className="space-y-4 mt-6">
                <input
                  type="text"
                 // disabled
                  className={`input input-bordered w-full ${
                    error ? "input-error" : ""
                  }`}
                  placeholder="ID"
                  name="student_id"
                  value={loginData.student_id || ""}
                  onChange={handleChange}
                  required
                />
                <input
                  type="password"
                   // disabled
                  className={`input input-bordered w-full ${
                    error ? "input-error" : ""
                  }`}
                  placeholder="Password"
                  name="password"
                  value={loginData.password || ""}
                  onChange={handleChange}
                  required
                />
                <button
                  type="submit"
                  //disabled
                  className="btn btn-primary w-full"
                  onClick={studentLogin}
                >
                  Login as Student
                </button>
                <button
                  type="button"
                  // disabled
                  className="btn btn-outline bg-orange-700 text-white w-full"
                  onClick={handleAdminLogin}
                >
                  Login as Admin
                </button>
              </form>
              <div className="text-center w-full mt-4">
                Don't have an account?&nbsp;
                <Link
                  to="/register"
                  className="link link-hover font-medium text-blue-600"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Info Section */}
        <div className="relative w-1/2 py-8 px-12 hidden md:flex flex-col overflow-hidden">
          {/* Background image */}
          <img
            src={testImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-1 opacity-40 blur-xs"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black opacity-5 z-0"></div>

          {/* Text content */}
          <div className="relative z-20 mt-20 text-4xl font-bold tracking-wider text-white">
            "Empowering Every Student Voice — Vote Anytime, Anywhere."
          </div>
          <div className="relative z-20 mt-10 text-justify text-2xl font-bold italic text-white">
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
