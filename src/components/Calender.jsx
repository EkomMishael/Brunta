import React, { useState } from 'react';
import AddEventForm from '../components/calender/addEvent';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';

const localizer = momentLocalizer(moment);

const initialEvents = [
  {
    title: 'Quiz: Math',
    start: new Date(2023, 3, 15, 10, 0),
    end: new Date(2023, 3, 15, 11, 0),
  },
  {
    title: 'Achievement: Quiz Master',
    start: new Date(2023, 3, 16, 12, 0),
    end: new Date(2023, 3, 16, 13, 0),
  },
];

const CalendarComponent = () => {
  const [events, setEvents] = useState(initialEvents);

  const handleAddEvent = (newEvent) => {
    setEvents([...events, newEvent]);
  };

  const handleRemoveEvent = (eventId) => {
    setEvents(events.filter((event) => event.title !== eventId));
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <h2 className="text-3xl font-bold mb-4">Calendar</h2>
      <div className="flex-grow overflow-y-auto">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          className="bg-white shadow-md rounded-lg p-4"
        />
      </div>

      <div className="flex justify-center my-4">
        <AddEventForm onAddEvent={handleAddEvent} />
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4"
          onClick={() => handleRemoveEvent('Quiz: Math')}
        >
          Remove Event
        </button>
      </div>
    </div>
  );
};

export default CalendarComponent;