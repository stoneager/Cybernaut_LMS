import React, { useState } from 'react';
import { FaTrash, FaCheck } from 'react-icons/fa';

function NotesWidget() {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Revise Linked Lists', done: false },
    { id: 2, text: 'Prepare for DSA quiz', done: true },
  ]);
  const [noteInput, setNoteInput] = useState('');

  const addNote = () => {
    if (!noteInput.trim()) return;
    const newNote = {
      id: Date.now(),
      text: noteInput,
      done: false,
    };
    setNotes([newNote, ...notes]);
    setNoteInput('');
  };

  const toggleDone = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, done: !note.done } : note
      )
    );
  };

  const deleteNote = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-md shadow max-w-sm mx-auto mt-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
         Your Reminders
      </h3>

      {/* Input area */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={noteInput}
          onChange={(e) => setNoteInput(e.target.value)}
          placeholder="Write a note..."
          className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={addNote}
          className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Add
        </button>
      </div>

      {/* Notes list */}
      <ul className="space-y-3">
        {notes.length === 0 ? (
          <li className="text-sm text-gray-400">No notes yet.</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="flex justify-between items-start p-3 border rounded-md bg-gray-50"
            >
              <span
                className={`text-sm flex-1 break-words whitespace-normal ${
                  note.done ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {note.text}
              </span>
              <div className="flex space-x-3 ml-4 mt-1 shrink-0">
                <button
                  onClick={() => toggleDone(note.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Mark as done"
                >
                  <FaCheck />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default NotesWidget;
