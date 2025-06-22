import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BatchForm({ onCreated }) {
  const [form, setForm] = useState({ course: "", startDate: "", admins: [] });
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modules, setModules] = useState([]);
  const [batchNamePreview, setBatchNamePreview] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/courses").then(res => setCourses(res.data));
    axios.get("http://localhost:5000/api/users?role=admin").then(res => setStaff(res.data));
  }, []);

  const generateBatchName = async (courseId, startDate) => {
    if (!courseId || !startDate) return;

    const course = courses.find(c => c._id === courseId);
    const [year, month] = startDate.split("-");
    const shortMonth = new Date(startDate).toLocaleString("default", { month: "short" }).toUpperCase();
    const shortYear = year.slice(-2);
    const prefix = course.courseName
      .split(" ")
      .slice(0, 2)
      .map(word => word[0].toUpperCase())
      .join("");

    try {
      const res = await axios.get(`http://localhost:5000/api/batches/count?courseId=${courseId}&month=${month}&year=${year}`);
      const count = res.data.count;
      const batchName = `${prefix}-${shortMonth}${shortYear}-B${count + 1}`;
      setBatchNamePreview(batchName);
      return batchName;
    } catch (err) {
      console.error("Error generating batch name", err);
      return "";
    }
  };

  const handleCourseChange = async (id) => {
    const course = courses.find(c => c._id === id);
    setForm(f => ({ ...f, course: id, admins: [] }));
    setModules(course.modules || []);
    if (form.startDate) {
      await generateBatchName(id, form.startDate);
    }
  };

  const handleStartDateChange = async (date) => {
    setForm(f => ({ ...f, startDate: date }));
    if (form.course) {
      await generateBatchName(form.course, date);
    }
  };

  const handleSubmit = async () => {
    const finalBatchName = await generateBatchName(form.course, form.startDate);
    const payload = { ...form, batchName: finalBatchName };

    try {
      const res = await axios.post("http://localhost:5000/api/batches", payload);
      alert("Batch created!");
      onCreated(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Error creating batch");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">Create Batch</h2>

      {/* Auto-generated Batch Name Display */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <strong>Batch Name:</strong> {batchNamePreview || "Select course and date to generate"}
      </div>

      <select
        onChange={e => handleCourseChange(e.target.value)}
        value={form.course}
        className="border p-2 mb-4 w-full rounded"
      >
        <option value="">Select Course</option>
        {courses.map(c => <option key={c._id} value={c._id}>{c.courseName}</option>)}
      </select>

      <input
        type="date"
        value={form.startDate}
        onChange={e => handleStartDateChange(e.target.value)}
        className="border p-2 mb-4 w-full rounded"
      />

      {modules.map((mod, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <span className="w-1/3">{mod}</span>
          <select
            onChange={(e) => {
              const updated = [...form.admins];
              updated[i] = { module: mod, admin: e.target.value };
              setForm(f => ({ ...f, admins: updated }));
            }}
            className="border p-1 flex-1 rounded"
          >
            <option value="">Select Admin</option>
            {staff.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
        </div>
      ))}

      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">
        Create Batch
      </button>
    </div>
  );
}
