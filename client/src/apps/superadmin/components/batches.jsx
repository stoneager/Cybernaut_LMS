import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../api";
import { toast } from 'react-toastify';
import { FaUpload, FaUserPlus, FaDownload } from "react-icons/fa";
import { FaEye, FaPlus } from "react-icons/fa";


const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState({ show: false, course: null, batchId: null });
  const [form, setForm] = useState({ course: "", startDate: "", admins: [] });
  const [courses, setCourses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [uniqueCourses, setUniqueCourses] = useState([]);

  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState({});
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedBatchName, setGeneratedBatchName] = useState("");

  const [viewBatch, setViewBatch] = useState(null);

  useEffect(() => {
    fetchBatches();
    API.get("/api/courses").then(res => setCourses(res.data));
    API.get("/api/users?role=admin").then(res => setStaff(res.data));
  }, []);

  const fetchBatches = () => {
    API.get("/api/batches")
      .then(res => {
        setBatches(res.data);
        const courses = [
          ...new Set(res.data.map(b => b.course?.courseName).filter(Boolean))
        ];
        setUniqueCourses(courses);
      })
      .catch(err => console.error("Error fetching batches:", err));
  };

  const generateBatchName = async (courseId, startDate) => {
    if (!courseId || !startDate) return;

    const course = courses.find(c => c._id === courseId);
    const [year, month] = startDate.split("-");
    const shortMonth = new Date(startDate).toLocaleString("default", { month: "short" }).toUpperCase();
    const shortYear = year.slice(-2);
    const prefix = course.courseName
      .split(" ")
      .slice(0, 2)
      .map(w => w[0].toUpperCase())
      .join("");

    try {
      const res = await API.get(`/api/batches/count?courseId=${courseId}&month=${month}&year=${year}`);
      const count = res.data.count;
      const name = `${prefix}-${shortMonth}${shortYear}-B${count + 1}`;
      setGeneratedBatchName(name);
      return name;
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
    try {
      const finalBatchName = await generateBatchName(form.course, form.startDate);
      const payload = { ...form, batchName: finalBatchName };
      const res = await API.post("/api/batches", payload);
      toast.success("✅ Batch created successfully!");
      fetchBatches();
      setForm({ course: "", startDate: "", admins: [] });
      setModules([]);
      setGeneratedBatchName("");
      setShowModal(false);
    } catch (err) {
      toast.error("❌ Failed to create batch. Please try again.");
    }
  };

  const handleUpload = async (e) => {
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);
  setLoading(true);
  try {
    const res = await API.post("/api/upload/upload", formData);
const cleanedStudents = res.data.students.map(stu => ({
  ...stu,
  email: typeof stu.email === "object" ? stu.email.text : stu.email,
  name: typeof stu.name === "object" ? stu.name.text : stu.name,
  phone: typeof stu.phone === "object" ? stu.phone.text : stu.phone,
}));
setStudents(cleanedStudents);

// Auto-select
const autoSelected = {};
cleanedStudents.forEach(stu => {
  autoSelected[stu.email] = true;
});
setSelected(autoSelected);


  } catch (err) {
    toast.error("Error saving students");

  } finally {
    setLoading(false);
  }
};


  const toggleSelect = (email) => {
  const cleanEmail = typeof email === "object" ? email.text : email;
  setSelected((prev) => ({ ...prev, [cleanEmail]: !prev[cleanEmail] }));
};
 

const [added, setAdded] = useState(false);

const handleSave = async () => {
  const selectedList = students
    .filter((stu) => selected[stu.email])
    .map((stu) => ({
      ...stu,
      course: showModal2.course,
      batch: showModal2.batchId,
    }));

  setSaving(true);
  try {
    const res = await API.post("/api/students/save-selected", selectedList);
    setCredentials(res.data.credentials);
    toast.success("Students Added Successfully");
    setAdded(true); // ✅ Disable button
  } catch (err) {
    alert("Error saving students");
  } finally {
    setSaving(false);
  }
};


  const handleDownloadCSV = async () => {
    try {
      const res = await API.post(
        "/api/students/download-credentials",
        credentials,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "credentials.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Failed to download CSV");
    }
  };

  const filteredBatches = batches.filter(
    b =>
      (selectedCourse === "All" || b.course?.courseName === selectedCourse) &&
      b.batchName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 bg-gradient-to-br from-white via-blue-50 to-white text-blue-900 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Batch Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-white border shadow rounded-lg">
          <h2 className="text-lg font-semibold text-gray-600">Total Batches</h2>
          <p className="text-2xl mt-2 font-bold">{batches.length}</p>
        </div>
        <div className="p-4 bg-white border shadow rounded-lg">
          <h2 className="text-lg font-semibold text-gray-600">Total Students</h2>
          <p className="text-2xl mt-2 font-bold">{batches.reduce((acc, b) => acc + (b.studentCount || 0), 0)}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <input type="text"
          placeholder="Search batches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-4 py-2 rounded w-full max-w-md"
        />

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="All">All Courses</option>
          {uniqueCourses.map((course, idx) => (
            <option key={idx} value={course}>{course}</option>
          ))}
        </select>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 ml-4 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
  {filteredBatches.map(batch => {
    const isActive = new Date(batch.startDate) <= new Date();
    return (
      <div key={batch._id} className="border rounded-xl shadow-md p-5 bg-white relative space-y-2">
        {/* Active Badge */}
        {isActive && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow">
            Active
          </div>
        )}

        <h2 className="text-xl font-bold text-blue-800">{batch.batchName}</h2>
        <p className="text-sm text-gray-600 font-medium">
          <span className="text-gray-500 font-semibold">Course:</span> {batch.course?.courseName}
        </p>
        <p className="text-sm text-gray-600 font-medium">
          <span className="text-gray-500 font-semibold">Start Date:</span> {new Date(batch.startDate).toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-600 font-medium">
          <span className="text-gray-500 font-semibold">Students:</span> {batch.studentCount}
        </p>
        

        {/* Buttons */}
        <div className="pt-2 flex gap-3">
          <button
            onClick={() => setViewBatch(batch)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-900"
          >
            <FaEye /> View Details
          </button>
          <button
            onClick={() => {
              setShowModal2({ show: true, course: batch.course, batchId: batch._id });
              setStudents([]); setSelected({}); setCredentials([]); setAdded(false);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            <FaPlus /> Add Students
          </button>
        </div>
      </div>
    );
  })}
</div>


      {viewBatch && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg max-w-xl w-full relative shadow-lg">
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
        onClick={() => setViewBatch(null)}
      >
        &times;
      </button>

      <h2 className="text-xl font-bold mb-4">{viewBatch.batchName}</h2>
      <p><strong>Course:</strong> {viewBatch.course?.courseName}</p>
      <p><strong>Start Date:</strong> {new Date(viewBatch.startDate).toLocaleDateString()}</p>
      <p><strong>Student Count:</strong> {viewBatch.studentCount}</p>
      <div className="mt-3">
        <strong>Admins:</strong>
        {viewBatch.admins.map((a, i) => (
          <div key={i}>{a.module} - {a.admin?.name}</div>
        ))}
      </div>
    </div>
  </div>
)}

      {/* Batch Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-xl w-full relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Create Batch</h2>

            <div className="mb-4 p-2 bg-gray-100 rounded text-gray-800">
              <strong>Batch Name: </strong> {generatedBatchName || "Select course and date"}
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

            <button
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
            >
              Create Batch
            </button>
          </div>
        </div>
      )}

      
{showModal2.show && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg max-w-5xl w-full shadow-xl overflow-y-auto max-h-[90vh] relative">
      <button
        className="absolute top-4 right-6 text-gray-500 text-2xl hover:text-red-600 font-bold"
        onClick={() => setShowModal2({ show: false, course: null, batchId: null })}
      >
        &times;
      </button>

      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <FaUserPlus /> Upload & Assign Students
      </h2>

      <div className="flex justify-center mb-10">
        <label
          htmlFor="file-upload"
          className="flex items-center gap-3 px-6 py-3 text-white font-medium bg-blue-600 rounded-lg shadow hover:bg-blue-700 cursor-pointer"
        >
          <FaUpload /> {loading ? "Uploading..." : "Upload Excel"}
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleUpload}
          accept=".xlsx, .xls, .csv"
        />
      </div>

      {students.length > 0 && (
        <>
          <div className="overflow-x-auto mb-6 rounded-xl border border-blue-100 shadow">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-blue-100 text-blue-900 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 text-left">Select</th>
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, i) => (
                  <tr key={i} className="border-t border-gray-200 hover:bg-blue-50 transition">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        onChange={() => toggleSelect(stu.email)}
                        checked={!!selected[stu.email]}
                      />
                    </td>
                    <td className="p-4">
  {typeof stu.name === "object" ? stu.name.text : stu.name}
</td>
<td className="p-4">
  {typeof stu.email === "object" ? stu.email.text : stu.email}
</td>
<td className="p-4">
  {typeof stu.phone === "object" ? stu.phone.text : stu.phone}
</td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

         <button
  onClick={handleSave}
  disabled={saving || added}
  className={`w-full py-3 text-lg font-semibold text-white rounded-xl transition ${
    saving || added ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
  }`}
>
  {saving ? "Saving..." : added ? "Students Added" : "Add Selected Students"}
</button>


          {credentials.length > 0 && (
            <button
              onClick={handleDownloadCSV}
              className="w-full py-3 mt-4 text-lg font-semibold text-white rounded-xl bg-yellow-500 hover:bg-yellow-600 transition"
            >
              <FaDownload className="inline mr-2" /> Download Credentials CSV
            </button>
          )}
        </>
      )}
    </div>
  </div>
)}

    </div>


  );
};

export default Batches;
