import React, { useState } from 'react';

const AddEventForm = ({ onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      title,
      start: new Date(start),
      end: new Date(end),
    };
    onAddEvent(newEvent);
    setTitle('');
    setStart('');
    setEnd('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <input
        type="text"
        placeholder="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border border-gray-300 p-2 rounded-md mb-2"
      />
      <input
        type="datetime-local"
        placeholder="Start Time"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="border border-gray-300 p-2 rounded-md mb-2"
      />
      <input
        type="datetime-local"
        placeholder="End Time"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="border border-gray-300 p-2 rounded-md mb-2"
      />
      <button
        type="submit"
        className="bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Event
      </button>
    </form>
  );
};

export default AddEventForm;