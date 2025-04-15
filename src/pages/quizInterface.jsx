import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { firestore } from '../config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import Modal from '../components/modal';

function QuizInterface({setLoading,loading,user}) {
    const location = useLocation();
    const navigate = useNavigate();
    const [quizData, setQuizData] = useState(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [userAnswers, setUserAnswers] = useState({});
    const [quizTimer, setQuizTimer] = useState(90 * 60); // Timer set to 90 minutes
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState();
    const [timeTaken, setTimeTaken] = useState(0);
    const [overallPerformance, setOverallPerformance] = useState({});
    const [answerProgress, setAnswerProgress] = useState(0); 

    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                setLoading(true)
                const quizDataDocRef = doc(firestore, `users/user${user.UserId}/quizzes-${user.userLevel}`,token);
                const docSnap = await getDoc(quizDataDocRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.taken) {
                        toast.error('Invalid token. The quiz has already been taken.');
                        navigate('/dashboard');
                        return;
                    }
                    setQuizData(data);
                    console.log(data,'DATA')
                } else {
                    toast.error('Invalid token. Quiz data not found.');
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching quiz data:', error);
                toast.error('Error fetching quiz data: ' + error.message);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchQuizData();
    }, [navigate, token]);

    useEffect(() => {
       
        const timer = setInterval(() => {
            setQuizTimer((prevTimer) => prevTimer - 1);
        }, 1000);
        return () => clearInterval(timer);
        
    }, [quizTimer, quizSubmitted]);

    
 // Log score whenever it changes
    
    const calculateResults = () => {
        let calculatedScore = 0;
        let overallPerformanceData = {};
        let totalTimeTaken = (90 * 60) - quizTimer;
        console.log(totalTimeTaken)
    
        quizData.questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            
            const subject = question.subject;
            
        
    
            // Initialize performance data for the subject if not already present
            if (!overallPerformanceData[subject]) {
                overallPerformanceData[subject] = { correct: 0, total: 0, percentage: 0 };
            }
    
            // Check if the question is answered
            if (userAnswer !== undefined && userAnswer !== null) {
                // Increment total questions attempted for the subject
                overallPerformanceData[subject].total++;
                
                // Check if the answer is correct
                if (question.answers[userAnswer].isCorrect) {
                    calculatedScore++;
                    console.log('frrttttt',calculatedScore)
                    // Increment correct answers for the subject
                    overallPerformanceData[subject].correct++;
                }
            }
        });
    
        // Calculate percentage for each subject
        Object.keys(overallPerformanceData).forEach((subject) => {
            const { correct, total } = overallPerformanceData[subject];
            overallPerformanceData[subject].percentage = total > 0 ? (correct / total) * 100 : 0;
        });
    
        
        const result= {
            score: calculatedScore,
            timeTaken: totalTimeTaken,
            overallPerformance: overallPerformanceData,
            showResults:true,
        }

        console.log('result',result)
        
        return result
    };
    

    
    
    const handleQuizSubmission = async () => {
        try {
            const quizDataDocRef = doc(firestore, `users/user${user.UserId}/quizzes-${user.userLevel}`,token);
            await updateDoc(quizDataDocRef, { taken: true });
             // Calculate results before navigating
        } catch (error) {
            console.error('Error updating quiz data:', error);
            toast.error('Error updating quiz data: ' + error.message);
        }
    };


    const handleSubmit = () => {
        setShowResults(true); // Show the confirmation modal
    };
    
    const handleConfirmation = (confirmed) => {
        if (confirmed) {
            setQuizSubmitted(true);
            handleQuizSubmission();
            console.log(score);
             // Call navigateToResultsPage when the user confirms
        } else {
            setShowResults(false); // Hide the results modal if the user doesn't confirm
        }
    };
    

    const handleAnswerSelection = (questionIndex, answerIndex) => {
        if (quizSubmitted) return;
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionIndex]: answerIndex,
        }));
        const totalQuestionsAnswered = Object.keys(userAnswers).length + 1;
        const totalQuestions = quizData.questions.length;
        setAnswerProgress((totalQuestionsAnswered / totalQuestions) * 100);
    };

    const navigateToResultsPage = () => {
        console.log('score',score,'quizData.questions.length',
         quizData.questions.length,
         'timeTaken',timeTaken,
         'userAnswers',userAnswers,
         'quizData.questions',quizData.questions,
         'quizData.quizMode',quizData.quizMode,
         'overallPerformance',overallPerformance,)
        navigate(`/quiz/result?token=${token}`, {
            state: {
                score,
                totalQuestions: quizData.questions.length,
                timeTaken,
                userAnswers,
                questions: quizData.questions,
                quizMode: quizData.quizMode,
                performancePerSubject: overallPerformance,
            },
        });
    };
    
    useEffect(() => {
        
        // calculate results only if quiz is submitted
        if(quizSubmitted){
            const result = calculateResults();
            
            setOverallPerformance(result.overallPerformance);
            setTimeTaken(result.timeTaken);
            setScore(result.score);
            setShowResults(result.showResults);
            if(score !== undefined ){
                navigateToResultsPage();
                setQuizSubmitted(false)    
                toast.success('quiz submited successfully')
            }

        }
        
    }, [score,quizSubmitted,calculateResults,navigateToResultsPage]);
    

    
    if (!quizData) {
        return null;
    }

    const handleCloseModal = () => {
        setShowResults(false);
    };

    
    
    return (
        <div className="quiz-interface bg-gray-50 min-h-screen p-6 flex flex-col items-center overflow-y-auto max-h-screen pb-40">
            {quizData.useTimer && (
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4 fixed top-0 left-0 z-10">
                    <div
                        className={`h-4 rounded-full transition-all ${
                            quizTimer <= 900 ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{
                            width: `${(quizTimer / (90 * 60)) * 100}%`,
                        }}
                    ></div>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div
                    className="h-4 rounded-full bg-blue-500"
                    style={{
                        width: `${answerProgress}%`,
                    }}
                ></div>
            </div>
            <div className="question-container w-full md:w-3/4 lg:w-2/3 bg-white p-6 rounded-lg shadow-md">
                {quizData.questions.length > 0 &&
                    quizData.questions.map((question, index) => (
                        <div key={index} className="mb-6 p-4 border rounded-lg shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">Question {index + 1}</h2>
                            <p className="text-gray-700 mb-4 break-words">{question.question}</p>
                            {question.imageUrl && (
                                <div className="mb-4">
                                    <img src={question.imageUrl} alt="Question" className="rounded-md h-[250px] w-full" />
                                </div>
                            )}
                            <ul className="space-y-2">
                                {question.answers.map((answer, idx) => (
                                    <li key={idx} className="p-2 rounded-md bg-gray-100">
                                        {quizSubmitted ? (
                                            <span className="break-words">{answer.text}</span>
                                        ) : (
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`question-${index}`}
                                                    value={idx}
                                                    checked={userAnswers[index] === idx}
                                                    onChange={() => handleAnswerSelection(index, idx)}
                                                    className="mr-2"
                                                />
                                                <span className="break-words">{answer.text}</span>
                                            </label>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
            </div>
            <button
                onClick={handleSubmit}
                className={`btn btn-primary mt-4 ${showResults ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={showResults}
            >
                Submit Quiz
            </button>
            <Modal isOpen={showResults} onClose={handleCloseModal}>
                <div className="modal-content">
                    <h2 className="text-2xl font-bold dark:text-gray-100">Confirm Submission</h2>
                    <p className='dark:text-gray-100'>Are you sure you want to submit the quiz?</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={() => handleConfirmation(true)} className="btn btn-primary mr-4 dark:text-gray-100">Yes</button>
                        <button onClick={() => handleConfirmation(false)} className="btn btn-secondary dark:text-gray-100">No</button>
                    </div>
                </div>
            </Modal>
            <ToastContainer />
        </div>
    );
}

export default QuizInterface;
