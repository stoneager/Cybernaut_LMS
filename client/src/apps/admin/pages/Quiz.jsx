import React, { useEffect, useState, useCallback } from "react";
import API from "../api";
import { FaPlus, FaEdit, FaTimes } from "react-icons/fa";
import { useParams } from "react-router-dom";

export default function AdminQuizzes() {
  const { batchId } = useParams();
  const token = localStorage.getItem("token");

  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState({});
  const [selectedNote, setSelectedNote] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);

  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [adminId, setAdminId] = useState("");

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: { A: "", B: "", C: "", D: "" },
    answer: "A",
  });

  const [editIndex, setEditIndex] = useState(null);

  const fetchModules = useCallback(async () => {
    const res = await API.get(`/api/admin-batches/${batchId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload.id;
    setAdminId(id);

    const adminModules = res.data.admins.filter(a => a.admin === id).map(a => a.module);
    setModules(adminModules);
    setSelectedModule(adminModules[0]);
  }, [batchId, token]);

  const fetchNotes = useCallback(async () => {
  if (!selectedModule) return;
  try {
    const res = await API.get(`/notes/${batchId}/${selectedModule}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotes(res.data);
    fetchQuizzes(res.data);
  } catch (err) {
    console.error("Failed to fetch notes", err);
  }
}, [batchId, selectedModule, token]);


  useEffect(() => { fetchModules(); }, [fetchModules]);
  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const openQuizModal = async (noteId) => {
  // If quiz already exists for this note, just open the modal
  if (quizzes[noteId]) {
    setSelectedNote(noteId);
    setQuizModalOpen(true);
    return;
  }

  // Otherwise, create a new quiz
  try {
    const { data } = await API.post("/api/quiz/create", {
      noteId,
      createdBy: adminId,
    });
    setQuizzes(prev => ({ ...prev, [noteId]: data.quiz }));
    setSelectedNote(noteId);
    setQuizModalOpen(true);
  } catch (err) {
    console.error("Quiz creation failed", err);
  }
};


  const fetchQuizzes = async (noteList) => {
  const result = {};
  for (let note of noteList) {
    try {
      const { data } = await API.get(`/api/quiz/by-note/${note._id}`);
      result[note._id] = data;
    } catch {
      // no quiz for this note – skip silently
    }
  }
  setQuizzes(result);
};

useEffect(() => {
  const loadNotesAndQuizzes = async () => {
    await fetchNotes();
    await fetchQuizzes(notes);  // note: you might need to pass sorted or use .then()
  };
  loadNotesAndQuizzes();
}, [fetchNotes]);


  const handleAddOrUpdateQuestion = async () => {
    const quizId = quizzes[selectedNote]?._id;
    if (!quizId) return;

    try {
     if (editIndex !== null) {
  await API.put(
    `/api/quiz/${quizId}/question/${editIndex}`,
    newQuestion
  );
  const { data } = await API.get(`/api/quiz/${quizId}`);
  setQuizzes(prev => ({ ...prev, [selectedNote]: data }));
  setEditIndex(null);
}
else {
        await API.post(`/api/quiz/${quizId}/add-question`, newQuestion);
        const { data } = await API.get(`/api/quiz/${quizId}`);
        setQuizzes(prev => ({ ...prev, [selectedNote]: data }));
      }

      setNewQuestion({ question: "", options: { A: "", B: "", C: "", D: "" }, answer: "A" });
    } catch (err) {
      console.error("Failed to add/update question", err);
    }
  };

  const handleEditClick = (q, idx) => {
    setEditIndex(idx);
    setNewQuestion(q);
  };

  const closeModal = () => {
    setQuizModalOpen(false);
    setNewQuestion({ question: "", options: { A: "", B: "", C: "", D: "" }, answer: "A" });
    setEditIndex(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        Quiz Manager – <span className="text-indigo-600">{selectedModule}</span>
      </h2>

      {modules.length > 1 && (
        <div className="flex gap-2 mb-4">
          {modules.map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModule(mod)}
              className={`px-4 py-1 rounded-full border text-sm font-medium transition ${
                selectedModule === mod
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      )}

      {notes.map(note => (
        <div key={note._id} className="bg-white shadow p-4 rounded-xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Day {note.day}: {note.title}</h3>
            <button
  onClick={() => openQuizModal(note._id)}
  className="bg-black text-white px-4 py-2 rounded flex items-center gap-2"
>
  <FaPlus /> {quizzes[note._id] ? "Manage Quiz" : "Add Quiz"}
</button>

          </div>
        </div>
      ))}

      {quizModalOpen && selectedNote && quizzes[selectedNote] && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
              onClick={closeModal}
            >
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold mb-4">Quiz for Note</h3>

            <div className="space-y-4">
              {quizzes[selectedNote].questions.map((q, idx) => (
                <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                  <p className="font-medium mb-1">{idx + 1}. {q.question}</p>
                  {["A", "B", "C", "D"].map(opt => (
                    <p key={opt} className="ml-4 text-sm">
                      {opt}. {q.options[opt]} {q.answer === opt && <strong>(Answer)</strong>}
                    </p>
                  ))}
                  <button
                    className="mt-2 text-xs text-blue-600 hover:underline"
                    onClick={() => handleEditClick(q, idx)}
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </button>
                </div>
              ))}
            </div>

            {/* New/Edit Question Form */}
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold mb-2">{editIndex !== null ? "Edit Question" : "New Question"}</h4>
              <input
                type="text"
                placeholder="Question"
                className="border w-full p-2 my-1"
                value={newQuestion.question}
                onChange={(e) =>
                  setNewQuestion(prev => ({ ...prev, question: e.target.value }))
                }
              />
              {["A", "B", "C", "D"].map(opt => (
                <input
                  key={opt}
                  type="text"
                  placeholder={`Option ${opt}`}
                  className="border w-full p-2 my-1"
                  value={newQuestion.options[opt]}
                  onChange={(e) =>
                    setNewQuestion(prev => ({
                      ...prev,
                      options: { ...prev.options, [opt]: e.target.value },
                    }))
                  }
                />
              ))}
              <select
                className="border p-2 w-full my-2"
                value={newQuestion.answer}
                onChange={(e) =>
                  setNewQuestion(prev => ({ ...prev, answer: e.target.value }))
                }
              >
                {["A", "B", "C", "D"].map(opt => (
                  <option key={opt} value={opt}>Correct: {opt}</option>
                ))}
              </select>
              <button
                onClick={handleAddOrUpdateQuestion}
                className="bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                {editIndex !== null ? "Update Question" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
