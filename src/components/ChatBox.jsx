import React, { useState, useEffect } from 'react';
import { ref, push, onValue, off, set } from 'firebase/database';
import { database } from '../config';

const ChatBox = ({ pairedUserId, user }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const messagesRef = ref(database, `messages`);

  useEffect(() => {
    const fetchMessages = () => {
      onValue(messagesRef, (snapshot) => {
        const messagesData = snapshot.val();
        if (messagesData) {
          const messagesArray = Object.values(messagesData);
          console.log(messagesArray)
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      });
    };

    fetchMessages();

    return () => {
      off(messagesRef);
    };
  }, [pairedUserId]);

  const sendMessage = () => {
    if (message.trim() === '') return;
  
    // Push the new message under the paired user's ID
    const newMessageRef = push(ref(database, `messages`)); // Generate a unique key for the new message
    const newMessageKey = newMessageRef.key; // Get the generated key
  
    // Now set the message under the generated key
    set(newMessageRef, {
      sender: user.displayName , // You can add the sender's name or id here
      content: message,
      timestamp: Date.now(),
    });
  
    setMessage('');
  };
  

  return (
    <div style={{ display: pairedUserId ? 'block' : 'none' }}>
      <h2>Chat Box</h2>
      <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid black', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}: </strong>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatBox;
