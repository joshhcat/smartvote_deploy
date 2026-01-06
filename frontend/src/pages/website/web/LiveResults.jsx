import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import liveImage from "../../../assets/liveimage.jpg";

const LiveResults = () => {
  return (
    <>
      <Navbar />
      <div 
        className="w-full min-h-screen pt-24 bg-white relative"
        style={{
          backgroundImage: `url(${liveImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/20 z-0"></div>
        <section className="bg-white/30 py-16 relative z-10">
          <div className="max-w-screen-xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-green-950">LIVE RESULTS</h1>
            <p className="mt-2 font-bold text-green-800">How voters can view results in real-time using SmartVote.</p>
          </div>
        </section>

        <section className="py-12 bg-white/30 relative z-10">
          <div className="max-w-screen-xl mx-auto px-6">
            <div className="bg-emerald-800 rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-xl font-semibold text-white">How voters see the results</h2>
                  <p className="mt-3 text-emerald-100 leading-7">
                    During the voting period, the system can display aggregate counts per position without
                    revealing individual voter identities. If enabled by administrators, this page updates
                    automatically as ballots are cast, reflecting the latest tallies and turnout.
                  </p>
                  <ul className="mt-4 list-disc list-inside text-emerald-100 space-y-1">
                    <li>Position-based cards show current leading candidates.</li>
                    <li>Turnout and participation rate appear alongside results.</li>
                    <li>All figures are aggregated and anonymized for privacy.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-700">Transparency</h3>
                  <p className="mt-2 text-sm text-emerald-900">
                    SmartVote emphasizes fairness and openness. Results can be published live or after the poll closes
                    depending on school policy. Regardless, summaries are accessible to everyone when released.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-15 pt-15 bg-white/30 relative z-10">
          <div className="max-w-screen-x2 mx-auto px-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {["President", "Vice President", "Secretary"].map((position) => (
                <div key={position} className="border-2 border-emerald-200 rounded-xl p-5 bg-white hover:border-emerald-400 hover:shadow-lg transition">
                  <h4 className="text-lg font-semibold text-gray-900">{position}</h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Candidate A</span>
                      <span className="font-semibold text-emerald-600">—</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Candidate B</span>
                      <span className="font-semibold text-emerald-600">—</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">Live tallies appear here during elections.</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default LiveResults;


