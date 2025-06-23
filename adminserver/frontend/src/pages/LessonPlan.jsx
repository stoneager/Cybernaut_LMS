import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function AdminNotes() {
  const { batchId } = useParams();
  const navigate = useNavigate();

  const [adminData, setAdminData] = useState(null);
  const [form, setForm] = useState({
    title: '',
    meetlink: '',
    quizlink: '',
    assignmentlink: '',
    day: '',
  });
  const [pdfFile, setPdfFile] = useState(null);

  const backendBase = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5002';

  // ✅ Fetch logged-in user (admin) data from backend
  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get(`${backendBase}/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setAdminData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin data:', err.response || err);
        alert('Failed to fetch admin info. Please login again.');
        navigate('/login');
      }
    };
    fetchAdmin();
  }, [navigate]);

  const addNote = async () => {
    if (!form.title || !form.day || !adminData || !adminData.domain) {
      return alert('Fill in title, day, and ensure you are logged in.');
    }

    try {
      let assignmentFilePath = '';

      // 1️⃣ Upload PDF if selected
      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);

        await axios.post(
          `${backendBase}/upload-assignment?` +
            `batch=${encodeURIComponent(batchId)}&` +
            `module=${encodeURIComponent(adminData.domain)}&` +
            `title=${encodeURIComponent(form.title)}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        assignmentFilePath =
          `${backendBase}/uploads/` +
          `${encodeURIComponent(batchId)}/` +
          `${encodeURIComponent(adminData.domain)}/` +
          `${encodeURIComponent(form.title)}/assignment/question.pdf`;
      }

      // 2️⃣ Create the note
      await axios.post(
        `${backendBase}/notes`,
        {
          title: form.title,
          meetlink: form.meetlink,
          quizlink: form.quizlink,
          assignmentlink: form.assignmentlink || '',
          assignmentFilePath,
          batch: batchId,
          module: adminData.domain,
          admin: adminData._id,
          day: form.day,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      navigate(`/admin/batch/${batchId}`);
    } catch (err) {
      console.error('Error creating note:', err.response || err);
      alert(err.response?.data?.error || 'Failed to create note');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        Create Note for <span className="text-blue-600">{batchId}</span>{' '}
        {adminData && (
          <>
            — Module <span className="text-green-600">{adminData.domain}</span>
          </>
        )}
      </h3>

      <div className="space-y-4">
        <input
          className="w-full border border-gray-300 p-3 rounded-lg"
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg"
          placeholder="Meet Link"
          value={form.meetlink}
          onChange={e => setForm({ ...form, meetlink: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg"
          placeholder="Quiz Link"
          value={form.quizlink}
          onChange={e => setForm({ ...form, quizlink: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-3 rounded-lg"
          placeholder="External Assignment Link (optional)"
          value={form.assignmentlink}
          onChange={e => setForm({ ...form, assignmentlink: e.target.value })}
        />

        <input
          type="number"
          placeholder="Day (e.g., 1)"
          className="w-full border border-gray-300 p-3 rounded-lg"
          value={form.day}
          onChange={e => setForm({ ...form, day: e.target.value })}
        />

        <input
          type="file"
          accept="application/pdf"
          className="w-full p-2 border border-dashed border-gray-400 rounded-lg bg-gray-50"
          onChange={e => setPdfFile(e.target.files[0])}
        />
      </div>

      <button
        className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        onClick={addNote}
      >
        Add Note
      </button>
    </div>
  );
}
