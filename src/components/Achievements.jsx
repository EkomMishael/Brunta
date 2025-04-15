import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore } from '../config';

function Achievements({ userId }) {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchUserAchievements = async () => {
      try {
        const userAchievementsDocRef = doc(firestore, `users/user${userId}/userAchievements/achiv`);
        const userAchievementsSnap = await getDoc(userAchievementsDocRef);
        if (userAchievementsSnap.exists()) {
          const userAchievements = userAchievementsSnap.data().achievements || [];
          const achievementsCollection = collection(firestore, 'achievements');
          const achievementsSnapshot = await getDocs(achievementsCollection);
          const allAchievements = achievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const userAchievementsDetails = allAchievements.filter(achievement => userAchievements.includes(achievement.id));
          setAchievements(userAchievementsDetails);
        }
      } catch (error) {
        console.error('Error fetching user achievements:', error);
      }
    };

    fetchUserAchievements();
  }, [userId]);

  return (
    <div className="section dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="dark:text-gray-100 mb-6 text-2xl font-semibold text-gray-800">Achievements & Badges</h2>
      {achievements.length > 0 ? (
        <ul className="space-y-4">
          {achievements.map((achievement, index) => (
            <li key={index} className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
              <p className="text-lg text-gray-800 dark:text-gray-100">{achievement.name}</p>
              <p className="text-gray-600 dark:text-gray-400">Date: {achievement.date}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No achievements found.</p>
      )}
    </div>
  );
}

export default Achievements;
