import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const ElectionInfo = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <Navbar />
      <div className="w-full min-h-screen pt-24 bg-white">
        {/* Header with quick anchors */}
        <section className="relative overflow-hidden bg-white">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-green-950">HOW SMARTVOTE ELECTIONS WORK</h1>
            <p className="mt-3 text-base md:text-lg text-gray-700">
              A transparent overview of candidacy, voting, and result handling in SmartVote.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <a href="#candidacy" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 hover:text-white transition">Candidacy</a>
              <a href="#before" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 hover:text-white transition">Before</a>
              <a href="#during" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 hover:text-white transition">During</a>
              <a href="#after" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 hover:text-white transition">After</a>
              <a href="#faq" className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 hover:text-white transition">FAQ</a>
            </div>
          </div>
        </section>

        {/* Candidacy Opening */}
        <section id="candidacy" className="py-12 scroll-mt-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-emerald-800 rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Candidacy Opening</h2>
                  <p className="mt-3 text-emerald-100 leading-7">
                    Administrators announce the candidacy window and requirements in-app. Interested students
                    submit their profiles via the Candidacy form, providing platform statements and credentials.
                    Submissions are reviewed by admins for completeness and eligibility. Verified candidates are
                    then published to the official candidates list before the campaign period begins.
                  </p>
                  <ul className="mt-4 list-disc list-inside text-emerald-100 space-y-1">
                    <li>Submit candidate details and platform in the application form.</li>
                    <li>Admin verification ensures identity and eligibility.</li>
                    <li>Published candidate profiles appear on the elections page.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-700">Transparency Goals</h3>
                  <ul className="mt-3 text-sm text-emerald-900 space-y-2">
                    <li>Clear timelines for candidacy filing and publication.</li>
                    <li>Uniform criteria for eligibility and verification.</li>
                    <li>Publicly accessible candidate profiles prior to voting.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Before Voting */}
        <section id="before" className="py-12 bg-white scroll-mt-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-emerald-800 rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Before Voting</h2>
                  <p className="mt-3 text-emerald-100 leading-7">
                    Students register accounts and are verified by admins. Depending on the configuration,
                    SmartVote may use facial recognition or ID checks to prevent impersonation. Election schedules
                    and rules are posted ahead of time so voters know when and how to participate.
                  </p>
                  <ul className="mt-4 list-disc list-inside text-emerald-100 space-y-1">
                    <li>Student registration and admin verification.</li>
                    <li>Election schedule published with positions and rules.</li>
                    <li>Candidate list finalized and visible to all voters.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-700">Integrity Measures</h3>
                  <ul className="mt-3 text-sm text-emerald-900 space-y-2">
                    <li>Verified identities via admin checks and optional face recognition.</li>
                    <li>Role-based access so only eligible voters can cast ballots.</li>
                    <li>Locked configuration after publication to avoid mid-election changes.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* During Voting */}
        <section id="during" className="py-12 scroll-mt-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-emerald-800 rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-white">During Voting</h2>
                  <p className="mt-3 text-emerald-100 leading-7">
                    When the election opens, verified users log in and cast their vote securely. SmartVote enforces
                    one-person-one-vote and records every ballot atomically. As votes are cast, the system updates
                    the tally. For transparency, participation stats and live results (if enabled) can be viewed on
                    dashboards without exposing individual voter identities.
                  </p>
                  <ul className="mt-4 list-disc list-inside text-emerald-100 space-y-1">
                    <li>Secure authentication and voter eligibility checks.</li>
                    <li>One-time ballot submission with confirmation.</li>
                    <li>Optional live tally and participation rate display.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-700">Voter Experience</h3>
                  <ul className="mt-3 text-sm text-emerald-900 space-y-2">
                    <li>Accessible UI with clear instructions per position.</li>
                    <li>Validation to prevent incomplete or duplicate ballots.</li>
                    <li>Immediate feedback upon successful submission.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* After Voting */}
        <section id="after" className="py-12 bg-white scroll-mt-28">
          <div className="max-w-6xl mx-auto px-6">
            <div className="bg-emerald-800 rounded-xl p-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-white">After Voting</h2>
                  <p className="mt-3 text-emerald-100 leading-7">
                    Once the voting period closes, SmartVote finalizes the tally and prepares auditable summaries.
                    Results can be published instantly to the results page, and administrators may export official
                    reports (e.g., PDF) for record-keeping. Historical results remain available for transparency
                    and future analysis.
                  </p>
                  <ul className="mt-4 list-disc list-inside text-emerald-100 space-y-1">
                    <li>Final tally computed and locked.</li>
                    <li>Publication of winners and vote counts.</li>
                    <li>Exportable reports for documentation and auditing.</li>
                  </ul>
                </div>
                <div className="bg-white rounded-xl p-6 border border-emerald-200">
                  <h3 className="font-semibold text-emerald-700">Transparency & Accountability</h3>
                  <ul className="mt-3 text-sm text-emerald-900 space-y-2">
                    <li>Public access to summarized results and turnout.</li>
                    <li>Archived elections for longitudinal transparency.</li>
                    <li>Clear separation of voter identity and ballot secrecy.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        

        {/* FAQ / Clarifications */}
        <section id="faq" className="py-12 scroll-mt-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl font-semibold text-gray-900">Common Questions</h2>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              {[
                {
                  q: "How is voter privacy protected?",
                  a: "SmartVote separates identity verification from ballot choices. Only aggregated counts are stored for results.",
                },
                {
                  q: "Can results be audited?",
                  a: "Yes. Final reports can be exported and immutable logs help reconcile counts for independent review.",
                },
                {
                  q: "How do I become a candidate?",
                  a: "File during the candidacy window via the Candidacy form. Admins verify eligibility before publication.",
                },
                {
                  q: "What happens if I lose connection while voting?",
                  a: "Ballot submission is atomic. If not confirmed, you can re-attempt; duplicates are prevented by the system.",
                },
              ].map((item, index) => (
                <div key={item.q} className="bg-white border border-emerald-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between bg-emerald-50 text-emerald-700 hover:bg-emerald-700 hover:text-white transition-colors"
                  >
                    <span className="font-semibold">{item.q}</span>
                    <span className="text-xl font-bold">{openFaqIndex === index ? "−" : "+"}</span>
                  </button>
                  {openFaqIndex === index && (
                    <div className="px-5 pb-5 -mt-2 text-gray-700 text-sm leading-6">
                      {item.a}
                    </div>
                  )}
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

export default ElectionInfo;


