import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./web/Navbar";
import Footer from "./web/Footer";

// Media
import heroVideo from "../../assets/cover1.mp4";
import voteImage from "../../assets/vote1.jpg";

// Icons from react-icons (already in project)
import {
  FaShieldAlt,
  FaChartBar,
  FaUserCheck,
  FaLock,
  FaCogs,
  FaFileAlt,
} from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 w-full bg-emerald-50 pt-16">
        {/* Hero Section */}
        <section className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-emerald-50">
          {/* Background video with green overlay */}
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-10"
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-emerald-50 z-0" />
          <div className="relative z-10 w-full max-w-5xl px-4 md:px-8 mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left: Text Content */}
              <div className="text-left sv-fade-in-up">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-gray-800">
                  YOUR <div className="text-emerald-600">GATEWAY</div>TO<br /><span className="text-emerald-700">SECURE VOTING</span>
                </h1>
                <p className="text-base md:text-lg mb-8 text-gray-600 leading-relaxed max-w-xl">
                  We offer tailored voting solutions, expert guidance, and innovative technology designed to ensure fair and transparent campus elections.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/register"
                    // pointer-events-none
                    className=" inline-block bg-emerald-50 text-emerald-700 font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-emerald-700 hover:text-white hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 text-center"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/about"
                    className="inline-block bg-emerald-50 text-emerald-700 font-semibold px-8 py-3 rounded-lg shadow-md border-2 border-emerald-700 hover:bg-emerald-700 hover:text-white transition-all duration-200 text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              {/* Right: Hero illustration */}
              <div className="hidden md:flex justify-end sv-fade-in-up-delay ml-auto">
                <div className="relative w-90 h-100 rounded-3xl border-4 border-red-300 shadow-2xl flex items-center justify-center overflow-hidden">
                  <img
                    src={voteImage}
                    alt="Illustration of casting a vote"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-700/10" />
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* How It Works */}
        <section className="py-16 px-4 md:px-8 text-center sv-section bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              HOW <span className="text-emerald-700">SMARTVOTE</span> WORKS
            </h2>
            <p className="text-gray-600 mb-10 max-w-2xl mx-auto text-base">
              Follow these simple steps to experience secure and transparent campus elections.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                {
                  step: "1️⃣",
                  title: "Register",
                  desc: "Sign up using your School ID and student details.",
                },
                {
                  step: "2️⃣",
                  title: "Get Verified",
                  desc: "Admins verify your identity using face or ID.",
                },
                {
                  step: "3️⃣",
                  title: "Cast Your Vote",
                  desc: "Login during the election period and vote securely.",
                },
                {
                  step: "4️⃣",
                  title: "See Results",
                  desc: "Watch votes update live and receive confirmation.",
                },
              ].map(({ step, title, desc }, index) => (
                <div
                  key={index}
                  //red
                  className="bg-white border-2 border-emerald-200 shadow-lg p-6 rounded-xl hover:-translate-y-1 hover:border-emerald-400 hover:shadow-xl transition-all duration-200 relative group"
                >
                  <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-3xl mb-4">{step}</div>
                  <h3 className="text-lg font-bold mb-2 text-gray-800">
                    {title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Info Block */}
        <section className="relative py-16 px-4 md:px-8 overflow-hidden sv-section h-auto min-h-[400px] flex items-center bg-emerald-800">
          {/* Background video */}
          <video
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            src={heroVideo}
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 bg-emerald-800/40 z-0" />
          <div className="relative z-10 max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                EMPOWERING ELECTIONS TOGETHER
              </h2>
              <p className="text-emerald-200 text-lg max-w-2xl mx-auto mb-8">
                Building stronger networks, driving shared success
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl p-8 max-w-3xl border border-white/20">
                <p className="text-white text-lg md:text-xl leading-relaxed text-center">
                  <span className="text-emerald-200 font-semibold">Every vote matters.</span> Your voice has a powerful impact on each election result. When you cast your ballot, you're not just making a choice—you're shaping the future of your campus community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section
          id="features"
          className="bg-white py-16 px-4 md:px-6 text-center sv-section"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            OUR CORE <span className="text-emerald-700">FEATURES</span>
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12 text-base">
            Everything students and administrators need for fair, transparent, and efficient campus elections.
          </p>
          <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[
              {
                icon: <FaUserCheck />,
                title: "Face Recognition",
                desc: "Authenticate securely before voting.",
              },
              {
                icon: <FaChartBar />,
                title: "Real-Time Counting",
                desc: "Live election results dashboard.",
              },
              {
                icon: <FaShieldAlt />,
                title: "User-Friendly",
                desc: "Simple and accessible for all students.",
              },
              {
                icon: <FaLock />,
                title: "Role-Based Access",
                desc: "Separate admin and voter access.",
              },
              {
                icon: <FaCogs />,
                title: "Election Management",
                desc: "Manage schedules and candidates.",
              },
              {
                icon: <FaFileAlt />,
                title: "Exportable Reports",
                desc: "Download final results in PDF.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white border-2 border-emerald-200 rounded-xl shadow-lg p-6 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-400 transition-all duration-200 group"
              >
                <div className="flex justify-center text-emerald-700 mb-4 text-4xl group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold mb-2 text-gray-800 text-center">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm text-center leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
