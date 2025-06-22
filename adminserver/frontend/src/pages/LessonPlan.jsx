import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { FaEdit } from 'react-icons/fa';  // edit icon

export default function LessonPlan() {
  const { batchId } = useParams();
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetchLessonPlans();
  }, []);

  const fetchLessonPlans = async () => {
    try {
      console.log("Yet to Complete");
    } catch (err) {
      console.error("Error fetching lesson plans", err);
    }
  };

  const handleEdit = (plan) => {
    // 👉 You can open a modal here to edit the fields.
    console.log("Edit clicked for:", plan);
  };

  if (plans.length === 0) {
    return (
      <AdminLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Lesson Plan</h1>
          <p>No lesson plans available.</p>
        </div>
      </AdminLayout>
    );
  }

  const [firstPlan, ...otherPlans] = plans;

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Lesson Plan</h1>

        {/* Latest Day (larger card) */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white p-8 rounded-xl shadow-lg mb-6 relative">
          <h2 className="text-4xl font-bold mb-4">Day {firstPlan.day}</h2>
          <p><span className="font-semibold">Meeting Link:</span> {firstPlan.meetingLink || "N/A"}</p>
          <p><span className="font-semibold">Quiz:</span> {firstPlan.quiz || "N/A"}</p>
          <p><span className="font-semibold">Coding Question:</span> {firstPlan.codingQuestion || "N/A"}</p>
          
          {/* Edit button */}
          <button 
            className="absolute top-4 right-4 bg-white text-blue-500 p-2 rounded-full shadow-md hover:bg-blue-100 transition"
            onClick={() => handleEdit(firstPlan)}
          >
            <FaEdit size={20} />
          </button>
        </div>

        {/* Remaining Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPlans.map((plan) => (
            <div key={plan._id} className="bg-white p-6 rounded-lg shadow-md relative">
              <h2 className="text-xl font-semibold mb-2 text-blue-600">Day {plan.day}</h2>
              <p><span className="font-medium">Meeting Link:</span> {plan.meetingLink || "N/A"}</p>
              <p><span className="font-medium">Quiz:</span> {plan.quiz || "N/A"}</p>
              <p><span className="font-medium">Coding Question:</span> {plan.codingQuestion || "N/A"}</p>

              {/* Edit button */}
              <button 
                className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition"
                onClick={() => handleEdit(plan)}
              >
                <FaEdit size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
