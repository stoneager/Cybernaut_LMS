import React from "react";

export default function CourseCard({ image, name, startDate, batch, onClick }) {
  
  // Extract year and month from startDate (ISO format from Mongo)
  const date = new Date(startDate);
  const year = date.getFullYear();
  const month = date.toLocaleString('default', { month: 'long' }); // Eg: June

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden w-80
      transform transition-all duration-300
      hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      <img
        src={image}
        alt={name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <span>{year}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>{month}</span>
          <span>Batch: {batch}</span>
        </div>
      </div>
    </div>
  );
}
