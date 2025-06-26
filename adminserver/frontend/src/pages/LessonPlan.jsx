import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

export default function LessonPlan() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', meetlink: '', quizlink: '', assignmentlink: '', day: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modules, setModules] = useState([]); // all modules this admin teaches
  const [selectedModule, setSelectedModule] = useState(''); // current selected module


  const [batchDetails, setBatchDetails] = useState({});
  const backendBase = 'http://localhost:5002';
  const token = localStorage.getItem('token');

  const fetchBatchModule = useCallback(async () => {
  try {
    const res = await axios.get(`${backendBase}/api/admin-batches/${batchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const batch = res.data;
    setBatchDetails({ batchName: batch.batchName, courseName: batch.course.courseName });

    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentAdminId = payload.id;
    const adminModules = batch.admins.filter(a => a.admin === currentAdminId).map(a => a.module);

    if (!adminModules.length) return navigate('/unauthorized');
    
    setAdminId(currentAdminId);
    setModules(adminModules);
    setSelectedModule(adminModules[0]);
  } catch (e) {
    console.error(e);
    window.location.href = 'http://localhost:3000/login';
  }
}, [batchId, navigate, token]);


  const fetchNotes = useCallback(async () => {
    if (!selectedModule) return;

    try {
      const res = await axios.get(`${backendBase}/notes/${batchId}/${selectedModule}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by day descending: latest first
      const sorted = res.data.sort((a,b) => b.day - a.day);
      setNotes(sorted);
    } catch (e) { console.error(e); }
  }, [batchId, selectedModule, token]);

  useEffect(() => { fetchBatchModule(); }, [fetchBatchModule]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const openModalForAdd = () => {
    setEditingNoteId(null);
    setForm({ title: '', meetlink: '', quizlink: '', assignmentlink: '', day: '' });
    setPdfFile(null);
    setShowModal(true);
  };

  const openModalForEdit = note => {
    setForm({
      title: note.title, meetlink: note.meetlink,
      quizlink: note.quizlink, assignmentlink: note.assignmentlink, day: note.day
    });
    setEditingNoteId(note._id);
    setPdfFile(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.day) return alert('Please fill title and day');
    try {
      let assignmentFilePath = '';
      if (pdfFile) {
        const fd = new FormData();
        fd.append('file', pdfFile);
        await axios.post(
          `${backendBase}/upload-assignment?batch=${batchId}&module=${selectedModule}&title=${form.title}`,
          fd, { headers: {'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}`}}
        );
      }
      const payload = { ...form, batch: batchId, module: selectedModule, admin: adminId, assignmentFilePath };

      if (editingNoteId) {
        await axios.put(`${backendBase}/notes/${editingNoteId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${backendBase}/notes`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      setShowModal(false);
      fetchNotes();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Error saving note');
    }
  };

  const highlightNote = id => {
    setNotes(notes => {
      const idx = notes.findIndex(n => n._id === id);
      if (idx <= 0) return notes;
      const updated = [...notes];
      const [moved] = updated.splice(idx,1);
      updated.unshift(moved);
      return updated;
    });
  };


  return (
  
    <div className="max-w-5xl mx-auto p-6">
      {modules.length > 1 && (
  <div className="flex gap-3 mb-4">
    {modules.map((mod) => (
      <button
        key={mod}
        onClick={() => setSelectedModule(mod)}
        className={`px-4 py-1 rounded-full border ${
          selectedModule === mod ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
        }`}
      >
        {mod}
      </button>
    ))}
  </div>
)}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-blue-900">
          Lesson Plan – {batchDetails.batchName}
          <span className="text-gray-500 text-xl"> ({batchDetails.courseName})</span>
          <span className="text-sm text-indigo-600 ml-2 font-medium">– Module: {selectedModule}</span>
        </h2>
        <button
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2 rounded-lg hover:shadow-md transition-all"
          onClick={openModalForAdd}
        >
          + Add Note
        </button>
      </div>

   {notes.length > 0 && (
  <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-xl font-semibold text-gray-800">
        📘 Day {notes[0].day}: {notes[0].title}
      </h3>
      <a
        href={notes[0].meetlink}
        target="_blank"
        rel="noreferrer"
        className="px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-700 transition"
      >
        Join Meeting
      </a>
    </div>

    <div className="space-y-1 text-sm text-gray-700 mt-2">
      <p>📝 Quiz: <a href={notes[0].quizlink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Take Quiz</a></p>
      {notes[0].assignmentlink && (
        <p>🔗 Assignment: <a href={notes[0].assignmentlink} target="_blank" rel="noreferrer" className="text-green-600 hover:underline">View</a></p>
      )}
      {notes[0].assignmentFilePath && (
        <p>📄 PDF: <a href={notes[0].assignmentFilePath} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Download</a></p>
      )}
    </div>

    <button
      onClick={() => openModalForEdit(notes[0])}
      className="mt-3 text-sm text-blue-600 hover:underline"
    >
      ✏️ Edit
    </button>
  </div>
)}

      {/* Older Notes */}
      <div className="space-y-4">
        {notes.slice(1).map((note) => (
          <div
            key={note._id}
            className="bg-white border hover:shadow-md cursor-pointer transition-all p-4 rounded-lg"
            onClick={() => {
              setNotes((prev) => {
                const updated = [...prev];
                const idx = updated.findIndex((n) => n._id === note._id);
                if (idx > -1) {
                  const [moved] = updated.splice(idx, 1);
                  updated.unshift(moved);
                }
                return [...updated];
              });
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">📘 Day {note.day}: {note.title}</p>
                <p className="text-xs text-gray-500">Added on {new Date(note.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openModalForEdit(note);
                }}
                className="text-sm text-blue-700 underline"
              >
                ✏️ Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-blue-900">
              {editingNoteId ? 'Edit Note' : 'Add Note'} – {selectedModule}
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

              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:shadow-lg"
                onClick={handleSubmit}>
                {editingNoteId ? 'Update Note' : 'Add Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

);

}
