import React from "react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-6 sm:py-8 border-t border-slate-700">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Get In Touch
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            Have questions? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              Contact Information
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">📧</span>
                <span className="text-slate-300">support@smartvote.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📞</span>
                <span className="text-slate-300">+63 912 345 6789</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">📍</span>
                <span className="text-slate-300">University Campus, Metro Manila</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Copyright &copy; {new Date().getFullYear()}, CRMC SmartVote System
          </p>
        </div>
      </div>
    </footer>
  );
}
