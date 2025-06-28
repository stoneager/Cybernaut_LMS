import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css'; // <-- custom CSS override

function CalendarWidget({ date, setDate }) {
  return (
    <div className="rounded-lg shadow p-6 bg-white max-w-sm mx-auto">
      <Calendar onChange={setDate} value={date} />
    </div>
  );
}

export default CalendarWidget;
