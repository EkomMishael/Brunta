import React, { useState, useEffect } from 'react';
import { firestore } from '../config';
import Modal from '../components/modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../components/NavBar';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

const VSModeQuizInterface = ({ quizData, user, opponent, navBarData }) => {
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const opponentScoreRef = doc(firestore, 'scores', opponent);
    const unsubscribe = onSnapshot(opponentScoreRef, (doc) => {
      if (doc.exists()) {
        setOpponentScore(doc.data().score);
      }
    });
    return () => unsubscribe();
  }, [opponent]);

  const handleAnswerSelection = (questionIndex, answerIndex) => {
    if (quizSubmitted) return;
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answerIndex,
    }));
    if (quizData[questionIndex].options[answerIndex].isCorrect) {
      setUserScore((prevScore) => prevScore + 1);
    }
  };

  const handleSubmit = async () => {
    setQuizSubmitted(true);
    setShowResults(true);
    try {
      await setDoc(doc(firestore, 'scores', user.uid), { score: userScore });
    } catch (error) {
      toast.error('Error submitting score.');
      console.error('Error updating score:', error);
    }
  };

  const handleCloseModal = () => {
    setShowResults(false);
  };

  return (
    <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser}  toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode}>
      <div className="quiz-interface bg-gray-50 min-h-screen p-6 flex flex-col items-center">
        <div className="question-container w-full md:w-3/4 lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
          {quizData.length > 0 &&
            quizData.map((question, index) => (
              <div key={index} className="mb-6 p-4 border rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Question {index + 1}</h2>
                <p className="text-gray-700 mb-4">{question.question}</p>
                <ul className="space-y-2">
                  {question.options.map((answer, idx) => (
                    <li key={idx} className="p-2 rounded-md bg-gray-100">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={idx}
                          checked={userAnswers[index] === idx}
                          onChange={() => handleAnswerSelection(index, idx)}
                          className="mr-2"
                        />
                        <span>{answer}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          <button
            onClick={handleSubmit}
            className="btn btn-primary mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            disabled={quizSubmitted}
          >
            Submit Quiz
          </button>
        </div>
        <Modal isOpen={showResults} onClose={handleCloseModal}>
          <div className="modal-content p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <p>Your Score: {userScore}</p>
            <p>Opponent's Score: {opponentScore}</p>
            <button
              onClick={handleCloseModal}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </Modal>
        <ToastContainer />
      </div>
    </NavBar>
  );
};

export default VSModeQuizInterface;
