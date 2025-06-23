import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
export default function LessonPlan() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', meetlink: '', quizlink: '', assignmentlink: '', day: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [module, setModule] = useState('');
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [batchDetails, setBatchDetails] = useState({});
  const backendBase = 'http://localhost:5002';
  const token = localStorage.getItem('token');

  useEffect(() => {
  const fetchBatchModule = async () => {
    try {
      const res = await axios.get(`${backendBase}/api/admin-batches/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const batch = res.data;

      // Save batchName and course name
      setBatchDetails({
        batchName: batch.batchName,
        courseName: batch.course.name,
      });

      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const currentAdminId = tokenPayload.id;

      const adminEntry = batch.admins.find(a => a.admin === currentAdminId);
      if (!adminEntry) return navigate('/unauthorized');

      setAdminId(currentAdminId);
      setModule(adminEntry.module);
    } catch (err) {
      console.error('Batch fetch failed:', err);
      navigate('/login');
    }
  };

  fetchBatchModule();
}, [batchId, navigate, token]);

  useEffect(() => {
    const fetchNotes = async () => {
      console.log("Module : "+module);
      if (!module) return;
      try {
        const res = await axios.get(`${backendBase}/notes/${batchId}/${module}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(res.data.sort((a, b) => parseInt(a.day) - parseInt(b.day)));
      } catch (err) {
        console.error('Note fetch failed:', err);
      }
    };
    fetchNotes();
  }, [module, batchId, token]);

  const openModalForAdd = () => {
    setEditingNoteId(null);
    setForm({ title: '', meetlink: '', quizlink: '', assignmentlink: '', day: '' });
    setPdfFile(null);
    setShowModal(true);
  };

  const openModalForEdit = note => {
    setForm({
      title: note.title,
      meetlink: note.meetlink,
      quizlink: note.quizlink,
      assignmentlink: note.assignmentlink,
      day: note.day,
    });
    setEditingNoteId(note._id);
    setPdfFile(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.day || !module || !adminId) return alert('Fill title, day, and module');

    try {
      let assignmentFilePath = '';
      console.log("Module : "+module);
      if (pdfFile) {
        const formData = new FormData();
        formData.append('file', pdfFile);
        await axios.post(
          `${backendBase}/upload-assignment?batch=${encodeURIComponent(batchId)}&module=${encodeURIComponent(module)}&title=${encodeURIComponent(form.title)}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const uploadRes = await axios.post(
  `${backendBase}/upload-assignment?` +
    `batch=${encodeURIComponent(batchId)}&` +
    `module=${encodeURIComponent(module)}&` +
    `title=${encodeURIComponent(form.title)}`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  }
);

assignmentFilePath = backendBase + uploadRes.data.path;

      }

      const payload = {
        ...form,
        batch: batchId,
        module,
        admin: adminId,
        assignmentFilePath,
      };

      if (editingNoteId) {
        await axios.put(`${backendBase}/notes/${editingNoteId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${backendBase}/notes`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setForm({ title: '', meetlink: '', quizlink: '', assignmentlink: '', day: '' });
      setPdfFile(null);
      setEditingNoteId(null);
      setShowModal(false);
      window.location.reload();
    } catch (err) {
      console.error('Note error:', err.response || err);
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <AdminLayout>
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
  Lesson Plan — Batch {batchDetails.batchName || batchId} 
  {batchDetails.courseName && (
    <span className="text-gray-500 text-base"> ({batchDetails.courseName})</span>
  )}
</h3>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={openModalForAdd}
        >
          + Add Note
        </button>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes found.</p>
      ) : (
        <div className="space-y-4">
          {notes.map(note => {
            const isToday = new Date(note.createdAt).toISOString().split('T')[0] === today;
            return (
              <div key={note._id} className={`p-4 border rounded-lg ${isToday ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                <h4 className="font-semibold text-lg">Day {note.day}: {note.title}</h4>
                <p>Meet: <a href={note.meetlink} className="text-blue-600" target="_blank" rel="noreferrer">{note.meetlink}</a></p>
                <p>Quiz: <a href={note.quizlink} className="text-blue-600" target="_blank" rel="noreferrer">{note.quizlink}</a></p>
                {note.assignmentlink && (
                  <p>Assignment Link: <a href={note.assignmentlink} className="text-blue-600" target="_blank" rel="noreferrer">Open</a></p>
                )}
                {note.assignmentFilePath && (
                  <p>Assignment PDF: <a href={note.assignmentFilePath} className="text-green-600" target="_blank" rel="noreferrer">Download</a></p>
                )}
                <button onClick={() => openModalForEdit(note)} className="mt-2 text-sm text-blue-700 underline">Edit</button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-4">
              {editingNoteId ? 'Edit Note' : 'Add Note'} — {module}
            </h3>

            <div className="space-y-4">
              <input className="w-full border p-3 rounded-lg" placeholder="Title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />

              <input className="w-full border p-3 rounded-lg" placeholder="Meet Link" value={form.meetlink}
                onChange={e => setForm({ ...form, meetlink: e.target.value })} />

              <input className="w-full border p-3 rounded-lg" placeholder="Quiz Link" value={form.quizlink}
                onChange={e => setForm({ ...form, quizlink: e.target.value })} />

              <input className="w-full border p-3 rounded-lg" placeholder="External Assignment Link" value={form.assignmentlink}
                onChange={e => setForm({ ...form, assignmentlink: e.target.value })} />

              <input type="number" className="w-full border p-3 rounded-lg" placeholder="Day" value={form.day}
                onChange={e => setForm({ ...form, day: e.target.value })} />

              <input type="file" accept="application/pdf"
                className="w-full p-2 border border-dashed border-gray-400 rounded-lg bg-gray-50"
                onChange={e => setPdfFile(e.target.files[0])} />

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
                onClick={handleSubmit}>
                {editingNoteId ? 'Update Note' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}
