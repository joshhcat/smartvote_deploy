import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PastElections = () => {
  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen pt-24 bg-white">
        <section className="bg-white py-16">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">PAST ELECTIONS</h1>
            <p className="mt-3 text-gray-700 leading-7 max-w-2xl mx-auto">
              Review previous election summaries, turnout, and published results. Archived data supports
              transparency and continuous improvement of campus elections.
            </p>
          </div>
        </section>
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-slate-600 text-center">No past elections available at this time.</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default PastElections;


