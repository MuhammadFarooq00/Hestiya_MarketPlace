import React from "react";

const SessionExpiredModal = ({ open, onLogin }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full flex flex-col items-center border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-center text-[#1A2B2B]">
          Session Expired
        </h2>
        <p className="text-base text-gray-600 mb-6 text-center">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          className="w-full py-3 rounded-lg bg-[#2F4236] text-white font-semibold tracking-wide hover:bg-[#223026] transition mb-2"
          onClick={onLogin}
        >
          Sign-In
        </button>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
