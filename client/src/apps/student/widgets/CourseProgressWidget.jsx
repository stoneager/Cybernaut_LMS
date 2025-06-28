import React from 'react';

function CourseProgressWidget({ progress = 60 }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 w-full">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">
        Your Course Progress
      </h3>

      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>

      {/* Main progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-5">
        <div
          className="bg-[#4086F4] h-5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default CourseProgressWidget;
