import React, { useEffect, useState } from "react";
import API from "../api";
import CourseCard from "./CourseCard";
import { useNavigate } from "react-router-dom";
import FullStack from "../assets/FullStack.webp";
import TechTrio from "../assets/TechTrio.webp";
import DataAnalytics from "../assets/DataAnalytics.webp";
import AdminLayout from "./AdminLayout";
import Sidebar from "./Sidebar";

const courseImages = {
  "FullStack.webp": FullStack,
  "TechTrio.webp": TechTrio,
  "DataAnalytics.webp": DataAnalytics
};

export default function AdminHome() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/admin-batches/my-batches");
      console.log(res.data);
      setBatches(res.data);
    } catch (err) {
      console.error("Error fetching batches", err);
    }
  };

  const handleCourseClick = (batchId) => {
  navigate(`/batch/${batchId}/lesson-plan`);
};


  return (
        <Sidebar>
        <div className="max-w-[90%] mx-auto pt-6 min-h-[80vh]">
          <h1 className="text-3xl font-bold  text-gray-800">Your Teaching Batches</h1>

          {batches.length === 0 ? (
            <p className="text-gray-500 text-lg">No courses assigned to you yet.</p>
          ) : (
            <div className="flex flex-wrap gap-6 overflow-y-auto max-h-[70vh] pr-2 py-10 ">
              {batches.map((batch, idx) => {
                const course = batch.course;

                return (
                  <CourseCard 
                    key={idx}
                    image={courseImages[batch.course.image]}
                    name={course?.courseName}
                    startDate={batch?.startDate}
                    batch={batch?.batchName}
                    onClick={() => handleCourseClick(batch?._id)}
                  />
                );
              })}
            </div>
          )}
        </div>
        </Sidebar>

  );
}