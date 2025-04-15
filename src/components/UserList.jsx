import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase/auth';
import { db } from '../firebaseConfig'; // Replace with your Firebase config

function UserList() {
  const [users, setUsers] = useState([]);
  const [currentUser] = useAuthState();

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const q = query(usersCollection, where('uid', '!=', currentUser.uid)); // Exclude current user
      const querySnapshot = await getDocs(q);
      setUsers(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    fetchUsers();
  }, [currentUser]); // Refetch on user change

  const handleUserClick = (userId) => {
    // Handle showing user details and connect button (logic in next component)
  };

  return (
    <div>
      <h2>Online Users</h2>
      {users.map((user) => (
        <div key={user.id} onClick={() => handleUserClick(user.id)}>
          {user.username} {user.onlineStatus && <span>(Online)</span>}
        </div>
      ))}
    </div>
  );
}

export default UserList;
