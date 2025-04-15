import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../config';

function UserGoals({ user }) {
  const [userGoals, setUserGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState('');
  const [showAddGoalInput, setShowAddGoalInput] = useState(false);

  const goalsDocRef = doc(firestore, `users/user${user.UserId}/${user.userLevel}-goals/goal`);

  useEffect(() => {
    const fetchUserGoals = async () => {
      try {
        const docSnap = await getDoc(goalsDocRef);
        if (docSnap.exists()) {
          setUserGoals(docSnap.data().goals || []);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
      }
    };

    fetchUserGoals();
  }, [user]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoalName.trim()) return;

    try {
      const newGoal = { id: Date.now().toString(), name: newGoalName, completed: false };
      const updatedGoals = [...userGoals, newGoal];
      await setDoc(goalsDocRef, { goals: updatedGoals });

      setUserGoals(updatedGoals);
      setNewGoalName('');
      setShowAddGoalInput(false);
    } catch (error) {
      console.error('Error adding goal:', error);
    }
  };

  const handleMarkGoalComplete = async (goalId) => {
    try {
      const updatedGoals = userGoals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: true } : goal
      );
      await setDoc(goalsDocRef, { goals: updatedGoals });
      setUserGoals(updatedGoals);
    } catch (error) {
      console.error('Error marking goal complete:', error);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const updatedGoals = userGoals.filter((goal) => goal.id !== goalId);
      await setDoc(goalsDocRef, { goals: updatedGoals });
      setUserGoals(updatedGoals);
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="section dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className=" dark:text-gray-100 mb-6 text-2xl font-semibold text-gray-800 ">User Goals</h2>
      <div className="flex justify-between mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none transition-colors"
          onClick={() => setShowAddGoalInput(!showAddGoalInput)}
        >
          {showAddGoalInput ? 'Close' : '+ Add Goal'}
        </button>
      </div>
      {showAddGoalInput && (
        <form onSubmit={handleAddGoal} className="mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Add a new goal"
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-700 outline-none transition"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded focus:outline-none transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      )}
      {userGoals.length > 0 ? (
        <ul className="space-y-4">
          {userGoals.map((goal) => (
            <li key={goal.id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:scale-105">
              <p className={`flex-grow ${goal.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'} transition-colors`}>{goal.name}</p>
              <button
                className={`ml-4 py-2 px-4 rounded focus:outline-none transition-colors ${
                  goal.completed ? 'text-green-500 dark:text-green-700' : 'text-gray-500 dark:text-gray-100 '
                }`}
                onClick={() => handleMarkGoalComplete(goal.id)}
              >
                {goal.completed ? <i class="fa-solid fa-check"></i> : <i class="fa-solid fa-question"></i>}
              </button>
              <button
                className="ml-4 text-gray-600 dark:text-red-400  font-bold py-2 px-4 rounded focus:outline-none transition-colors"
                onClick={() => handleDeleteGoal(goal.id)}
              >
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-300">No goals found.</p>
      )}
    </div>
  );
}

export default UserGoals;
