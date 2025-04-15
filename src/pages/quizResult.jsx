import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { doc, getDoc,setDoc,updateDoc ,collection, Timestamp, getDocs} from 'firebase/firestore';
import { firestore } from '../config';

import Tooltip from '../components/customToolPit';

import profilePic from '../assets/default-pfp.jpg';

function QuizResult({ user, realUser }) {
    const location = useLocation();
    const state = location.state || {};

    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    // Destructure the state object to get the needed data
    const {
        score,
        totalQuestions,
        timeTaken,
        userAnswers,
        questions,
        quizMode,
        currentSubject,
        selectedSubjects,
        subjectYear,
        performancePerSubject,
    } = state;

    const navigate = useNavigate();
    const [showQuestionResults, setShowQuestionResults] = useState(false);
    const [profilePicture, setProfilePicture] = useState(user.profilePic || profilePic);

    // const evaluateCriteria = (criteria, quizScore) => {
    //     // Example criteria evaluation
    //     if (criteria === 'chemistry_score_1' && quizScore >= 1) return true;
    //     // Add more criteria evaluations as needed
    //     return false;
    //   };

    // const checkAndAwardAchievements = async (userId, quizScore) => {
    //     try {
    //       const achievementsCollection = collection(firestore, 'achievements');
    //       const achievementsSnapshot = await getDocs(achievementsCollection);
    //       const achievements = achievementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
    //       const userAchievementsDocRef = doc(firestore, `users/user${userId}/userAchievements/achiv`);
    //       const userAchievementsSnap = await getDoc(userAchievementsDocRef);
    //       const userAchievements = userAchievementsSnap.exists() ? userAchievementsSnap.data().achievements : [];
      
    //       achievements.forEach(async (achievement) => {
    //         if (!userAchievements.includes(achievement.id) && evaluateCriteria(achievement.criteria, quizScore)) {
    //           userAchievements.push(achievement.id);
    //           await updateDoc(userAchievementsDocRef, { achievements: userAchievements });
    //         }
    //       });
    //     } catch (error) {
    //       console.error('Error checking and awarding achievements:', error);
    //     }
    //   };
      
      
      
   

    const saveDataToFirestore = async () => {
        const userDocRef = doc(firestore, `users/user${user.UserId}/quizzes-${user.userLevel}/results`);
        const snapshot = await getDoc(userDocRef);
        const existingData = snapshot.data()?.resultData || [];
    
        try {
            // Ensure state is an array before spreading it
            const resultsDt = Array.isArray(state) ? state : [state];
            console.log(resultsDt)
            
            // Transform the new results array
            const updatedResults = resultsDt.map(result => ({
                ...result, // Spread existing result properties
                id: token, // Generate a unique ID for each result
                timestamp: Timestamp.now(), // Add a timestamp for each result
            }));
    
            // Filter out existing results with the same ID
            const filteredResults = existingData.filter(result => result.id !== token);
            
            // Concatenate the filtered existing results with the new results
            const combinedResults = [...filteredResults, ...updatedResults];
    
            // Update Firestore with the combined results array
            await setDoc(userDocRef, { resultData: combinedResults });
            
            toast.success('Quiz results saved successfully.');
    //            // Usage example: Call this function after saving quiz results
    //   await checkAndAwardAchievements(user.UserId, resultsDt[0].score);
            console.log(combinedResults);
        } catch (error) {
            console.error('Error saving quiz results:', error);
            toast.error('Error saving quiz results: ' + error.message);
        }
    };
    
    // Redirect to the dashboard if there is no state or any missing required data
    useEffect(() => {
        if (!state || score === null || score === undefined || !totalQuestions || !questions) {
            toast.error('Error processing results.')
            navigate('/dashboard', { replace: true });
        }else{
            saveDataToFirestore()
        }
        
    }, [state, score, totalQuestions, questions, navigate,]);

    // Handle navigation back to the dashboard
    const handleBackToDashboard = () => {
        toast.success('Quiz results saved.')
        navigate('/dashboard', { replace: true });

    };




    const toggleQuestionResults = () => {
        setShowQuestionResults(!showQuestionResults);
    };

    // Calculate percentage score
    const percentageScore = ((score / totalQuestions) * 100).toFixed(2);







    return (
        <div className="results-page custom-scroll-bar mt-[60px] md:mt-12 bg-slate-50 min-h-screen p-6 flex flex-col items-center overflow-y-auto max-h-screen pb-40">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Quiz Results</h1>

            {/* User Information */}
            <div className="flex flex-col md:flex-row items-center justify-center mb-8">
                {/* Profile Picture */}
                <div className="relative mx-4">
                    <img
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                        src={user.profilePic ? user.profilePic : profilePicture}
                        alt="Profile"
                    />
                </div>

                {/* User Details */}
                <div className="flex flex-col md:ml-8 mt-4 md:mt-0">
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">Username: {user.FullName}</h2>
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">Email: {user.Email}</h2>
                    <h2 className="text-lg font-semibold mb-2 text-gray-700">Status: {user.status}</h2>
                </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary w-full md:w-3/4 lg:w-2/3 bg-white p-6 rounded-lg shadow-md mb-8">
                {currentSubject !== null && currentSubject !== undefined && (
                    <p className="text-lg font-medium text-gray-700 mb-2">
                        Subject: {currentSubject}
                    </p>
                )}
                {selectedSubjects !== null && selectedSubjects !== undefined && (
                    <p className="text-lg font-medium text-gray-700 mb-2">
                        Subjects: {selectedSubjects.map((subject) => subject).join(", ")}
                    </p>
                )}
                <p className="text-lg font-medium text-gray-700 mb-2">Quiz-Mode: {quizMode}</p>
                <p className="text-lg font-medium text-gray-700 mb-2">Score: {score} out of {totalQuestions}</p>
                <p className="text-lg font-medium text-gray-700 mb-2">Percentage: {percentageScore}%</p>
                {timeTaken !== null && (
                    <p className="text-lg font-medium text-gray-700 mb-4">Time Taken: {Math.floor(timeTaken / 60)} minutes and {timeTaken % 60} seconds</p>
                )}
            </div>

            {/* Show Question Results */}
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 mb-4"
                onClick={toggleQuestionResults}
            >
                {showQuestionResults ? 'Hide Question Results' : 'Show Question Results'}
            </button>

            {showQuestionResults && (
                <div className="question-results w-full md:w-3/4 lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4">Question Results:</h3>
                    {questions.map((question, index) => {
                        const isCorrect = userAnswers[index] === question.answers.findIndex(answer => answer.isCorrect);
                        const answerClass = isCorrect ? 'bg-green-100 border-md border-green-400' : 'bg-red-100 border-md border-red-400';
                        const answerColorClass = isCorrect ? 'text-green-400' : 'text-red-400';
                        
                        
                        
                        //my answer for question with index 'index'
                        const myAnswerIndex = userAnswers[index]
                        // the actual correct answer for question with index 'index'
                        const correctAnswerIndex = question.answers.findIndex(answer => answer.isCorrect)
                        // find out if i passed the question
                        const isMyAnswerCorrect = myAnswerIndex === correctAnswerIndex
                        // colors for my answer
                        const myAnswerColor = isMyAnswerCorrect ? 'text-green-600' : 'text-red-600' 
                        // colors for correct answer
                        const correctAnswerColor = 'text-green-600'
                        //color of border and background of questions depending on my answer and correct answer
                        const myAnswerBorder = isMyAnswerCorrect ? 'border-green-300 bg-green-100' : 'bg-red-100 border-red-300'
                        
                        
                        return (
                            <div key={index} className={`mb-6 p-4 border rounded-lg shadow-sm ${myAnswerBorder}`}>
                                <h4 className="text-lg font-semibold text-gray-800 mb-3">Question {index + 1}</h4>
                                <p className="text-gray-700 mb-2">{question.question}</p>

                                {/* Display question image */}
                                {question.imageUrl && (
                                    <img className="rounded-md h-[250px] w-full mb-3" src={question.imageUrl} alt="" />
                                )}

                                {/* Display user's answer and whether it was correct */}
                                <ul className="space-y-2">
                                    {question.answers.map((answer, idx) => {
                                        // const isUserAnswer = idx === userAnswers[index];
                                         return (
                                            <li key={idx}>
                                                <span
                                                    className={`break-words font-semibold ${myAnswerIndex===idx ? myAnswerColor: correctAnswerIndex === idx ? correctAnswerColor : 'text-gray-700'}`}
                                                >
                                                    {answer.text}
                                                </span>
                                                {(myAnswerIndex===idx) && (
                                                    answer.isCorrect ? (
                                                        <span className="text-green-500 ml-2">&#10003;</span>
                                                    ) : (
                                                        <span className="text-red-500 ml-2">&#10007;</span>
                                                    )
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                                
                                {/* Tooltip for unanswered questions */}
                                {userAnswers[index] === undefined  && (
                                    <Tooltip content="You did not answer this question" position='top' width={280}>
                                        <span className="relative left-[98%] -bottom-2">
                                            <i className="fa-solid fa-circle-question text-red-600"></i>
                                        </span>
                                    </Tooltip>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Back to Dashboard Button */}
            <button
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 mt-8"
                onClick={handleBackToDashboard}
            >
                Back to Dashboard
            </button>

            {/* Toast container for notifications */}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default QuizResult;





