import React from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import storyImage from "../../../assets/story.jpg";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen pt-20 sm:pt-24 bg-white">
        {/* Hero Section */}
        <section className="bg-white py-16 sm:py-20">
          <div className="w-full max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-green-950">
              ABOUT SMARTVOTE
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-700">
              Revolutionizing campus elections with secure, transparent, and
              accessible voting technology
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 hover:text-white transition w-full sm:w-auto"
              >
                Get Started
              </Link>
              <Link
                to="/readmore"
                className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 hover:text-white transition w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg text-gray-800 max-w-2xl mx-auto">
                To provide a secure, transparent, and user-friendly digital voting
                platform that empowers students to participate in democratic
                processes with confidence and ease.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-6">
                <div className="bg-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">🔒</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold  text-gray-800 mb-2">
                  Security First
                </h3>
                <p className="text-gray-800 text-sm sm:text-base">
                  Advanced encryption and facial recognition ensure every vote is
                  secure and authentic.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">📊</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold  text-gray-800 mb-2">
                  Transparency
                </h3>
                <p className="text-gray-800 text-sm sm:text-base">
                  Real-time results and audit trails provide complete transparency
                  in the voting process.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="bg-emerald-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">🚀</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold  text-gray-800 mb-2">
                  Accessibility
                </h3>
                <p className="text-gray-800 text-sm sm:text-base">
                  User-friendly interface designed for all students, regardless of
                  technical expertise.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Our Story
                </h2>
                <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
                  SmartVote was born from the recognition that traditional voting
                  systems in educational institutions were often inefficient,
                  time-consuming, and lacked transparency.
                </p>
                <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4">
                  Our team of developers and educators came together to create a
                  solution that would modernize the voting experience while
                  maintaining the highest standards of security and integrity.
                </p>
                <p className="text-base sm:text-lg text-gray-700">
                  Today, SmartVote serves thousands of students across multiple
                  institutions, providing a reliable platform for democratic
                  participation in campus elections.
                </p>
              </div>
              <div className="story-image md:flex justify-center sv-fade-in-up-delay">
                <div className="relative w-75 h-80 rounded-3xl border border-emerald-400/70 shadow-[0_0_35px_rgba(16,185,129,0.75)] flex items-center justify-center overflow-hidden">
                  <img
                    src={storyImage}
                    alt="Our Story"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-500/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        

      </div>
      <Footer />
    </>
  );
};

export default About;
