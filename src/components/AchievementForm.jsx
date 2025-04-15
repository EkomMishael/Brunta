import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../config';

function AddAchievementForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(firestore, 'achievements'), {
        name,
        description,
        criteria,
      });
      setName('');
      setDescription('');
      setCriteria('');
    } catch (error) {
      console.error('Error adding achievement:', error);
    }
  };

  return (
    <div className="section dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="dark:text-gray-100 mb-6 text-2xl font-semibold text-gray-800">Add Achievement</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-800 dark:text-gray-100 mb-2">Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-800 dark:text-gray-100 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-700"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-gray-800 dark:text-gray-100 mb-2">Criteria</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-700"
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none"
        >
          Add Achievement
        </button>
      </form>
    </div>
  );
}

export default AddAchievementForm;
