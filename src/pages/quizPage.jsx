import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';

import { doc, getDoc,setDoc ,collection} from 'firebase/firestore';
import { firestore } from '../config';

import CustomDropdown from '../components/newDropdown';

import RenderMultiSubjectSelectionModal from '../components/MultiSubjectComponent';
import Modal from '../components/modal';
import { ToastContainer, toast } from 'react-toastify'; // Import `react-toastify`
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for `react-toastify`
import NavBar from '../components/NavBar';
// Other imports and component code...



function Quiz({ user, selectedLevelData , navBarData }) {
    const navigate = useNavigate();

    // State management
    const [detailViewVisible, setDetailViewVisible] = useState(false);
    const [currentSubjectData, setCurrentSubjectData] = useState(null);
    const [currentSubjectDataYears, setCurrentSubjectDataYears] = useState([]);
    const [hoveredQuizType, setHoveredQuizType] = useState(null);
    const [selectedQuizMode, setSelectedQuizMode] = useState(null);
    const [selectedYear, setSelectedYear] = useState('');
    const [useTimer, setUseTimer] = useState(false);
    const [searchBarValue, setSearchBarData] = useState('');

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [multiSubjectModalVisible, setMultiSubjectModalVisible] = useState(false);

    //get all subject names from selectedLevelData
    const [showSearch, setShowSearch] = useState(false);

    // Get all subjects from selected level
    // useEffect(() => {
    //     const subjectNames = selectedLevelData.map
    //     setAllSubjectsNames(subjectNames);

    // }, [selectedLevelData]);



    // Handle list item click (opens detailed view)
    const handleListItemClick = (yearsData, key) => {
        const years = Object.keys(yearsData);
        setCurrentSubjectDataYears(years);
        setCurrentSubjectData({ key, yearsData });
        console.log('handle list item click subject',Object.keys(selectedLevelData),'currentSubjectData years',key)
        setDetailViewVisible(true);
    };

    // Close detailed view
    const closeDetailView = () => {
        setDetailViewVisible(false);
        setCurrentSubjectDataYears([]);
        setCurrentSubjectData(null);
        setHoveredQuizType(null);
        setSelectedQuizMode(null);
        setSelectedYear('');
        setUseTimer(false);
    };

    // Handle quiz type hover
    const handleQuizTypeHover = (quizType) => {
        setHoveredQuizType(quizType);
        console.log('selectedLevelData',selectedLevelData)
    };

    // Handle quiz mode selection
    const handleQuizModeSelection = (quizMode) => {
        setSelectedQuizMode(quizMode);
        console.log(quizMode,selectedQuizMode)
        // spaecial mode hahahahahahahaha...........
        if (quizMode === 'multi-subject') {
            setMultiSubjectModalVisible(true);
        }else{
            setMultiSubjectModalVisible(false);
        }
    };
    

    // Handle year selection
    const handleYearSelection = (year) => {
        setSelectedYear(year);
    };


    //shuffle array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
//--------------------------------------------------------------------------------------------------


    // Function to filter subjects based on search bar value
    const filterSubjects = (subjects) => {
        return subjects.filter((subject) =>
            subject.toLowerCase().includes(searchBarValue.toLowerCase())
        );
    };
    
    const actualDataDueToSearch = filterSubjects(Object.keys(selectedLevelData))


//--------------------------------------------------------------------------------------------------

    // Fetch questions from Firestore based on selected level, subject, year, and quiz mode
    const fetchQuestions = async (selectedLevel, selectedSubject, selectedYear, selectedQuizMode) => {
        try {
            const subjectDoc = doc(firestore, 'subjects', 'levels');
            const docSnap = await getDoc(subjectDoc);
    
            if (docSnap.exists()) {
                const levelData = docSnap.data()[selectedLevel];
                const subjectData = levelData.subjects[selectedSubject];
                let questionsData = [];
    
                if (selectedQuizMode === 'random' ) {
                    // For random mode, collect all questions from all years in the subject
                    for (const year in subjectData) {
                        if (subjectData[year].questions) {
                            const dtb=subjectData[year].questions.map(question => ({
                                ...question,
                                subject: currentSubjectData.key,
                            }));
                            questionsData = [...questionsData, ...dtb];
                        }
                    }
    
                    // Shuffle questions to randomize
                    questionsData = shuffleArray(questionsData);
    
                    // Take the first 50 questions (or all questions if fewer than 50)
                    questionsData = questionsData.slice(0, 50);
                    
                } else if (selectedYear && subjectData[selectedYear]) {
                    const dtb=subjectData[selectedYear].questions.map(question => ({
                        ...question,
                        subject: currentSubjectData.key,
                    }));
                    questionsData = [...dtb] || [];

                }else if(selectedQuizMode=== 'multi-subject'){
                    for (const year in subjectData) {
                        if (subjectData[year].questions) {
                          const taggedQuestions = subjectData[year].questions.map(question => ({
                            ...question, // Copy existing question properties
                            subject: selectedSubject, // Add the subject name as a tag helps to track questions based on subject when shuffled
                          }));
                          questionsData = [...questionsData, ...taggedQuestions];
                        }
                      }
                    
                            questionsData = questionsData.slice(0, 50);
                            console.log('pure fetched questions',questionsData)
                        }
    
                return questionsData;
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            toast.error('Error fetching questions: ' + error.message);
            return [];
        }
        return [];
    };

    



    const handleStartQuiz = async (_questions = []) => {
        // Generate a unique token
        const token = uuidv4();
        let fetchedQuestions = [];
    
        // Fetch questions and other data as per your existing logic
        if (_questions.length === 0) {
            fetchedQuestions = await fetchQuestions(user.userLevel, currentSubjectData.key, selectedYear, selectedQuizMode);
            console.log('fetced',fetchedQuestions ,'level', user.userLevel,'subject name',currentSubjectData.key,'selectedYear', selectedYear, selectedQuizMode)
        } else {
            fetchedQuestions = _questions;
            console.log('fetced',fetchedQuestions)
            console.log('questions',_questions)


        }
    
        console.log('SENT. GO AND CHECK ', fetchedQuestions, selectedQuizMode, selectedYear, currentSubjectData, selectedSubjects, useTimer, false);
    
        // Check if any questions were fetched
        if (fetchedQuestions.length > 0) {
            // Create a reference to the quiz data in Firestore
            
            const quizDataDocRef = doc(firestore, `users/user${user.UserId}/quizzes-${user.userLevel}`,token);
    
            // Save quiz data and token in Firestore
            let quizData = {};
            if (selectedQuizMode === 'multi-subject') {
                quizData = {
                    questions: fetchedQuestions,
                    quizMode: selectedQuizMode,
                    selectedSubjects,
                    useTimer,
                    taken: false, // Indicates whether the quiz has been taken
                    
                };
            } else {
                quizData = {
                    questions: fetchedQuestions,
                    quizMode: selectedQuizMode,
                    subjectYear: selectedYear,
                    currentSubjectData,
                    useTimer,
                    taken: false, // Indicates whether the quiz has been taken
                    
                };
            }
    
            try {
                await setDoc(quizDataDocRef, quizData);
    
                // Use the navigate function to include the token as a query parameter
                navigate(`/quiz/interface?token=${token}`, {
                    state: {
                        // Include other data to pass to the QuizInterface if needed
                    },
                });
    
                closeDetailView();
            } catch (error) {
                console.error('Error saving quiz data:', error);
                toast.error('Error saving quiz data: ' + error.message);
            }
        } else {
            toast.error('No questions fetched for the selected mode and subject.');
        }
    };
    

    

    // Render detailed view popup
    const renderDetailPopup = () => {
        if (detailViewVisible && currentSubjectData) {
            const { key } = currentSubjectData;
            return (
                <Modal isOpen={detailViewVisible} onClose={closeDetailView} title={key}>

                        
                        <span>
                            <p className='dark:text-gray-300'>Please select a quiz mode: </p>
                        </span>

                        {/* Quiz mode buttons */}
                        <div className="grid grid-cols-2 gap-4 mb-4 mt-4 relative">
                        {/* Timed Quiz */}

                        {/* At Your Pace */}
                        <button
                            className={`flex flex-col items-center justify-center p-3 rounded-lg shadow-sm dark:shadow-lg shadow-slate-400 dark:shadow-gray-800   hover:bg-green-200 ${
                                selectedQuizMode === 'pace' ? 'bg-green-500' : 'bg-white dark:bg-gray-600'
                            }`}
                            
                            onMouseEnter={() => handleQuizTypeHover('pace')}
                            onMouseLeave={() => setHoveredQuizType(null)}
                            onClick={() => handleQuizModeSelection('pace')}
                        >
                            {hoveredQuizType === 'pace' ? (
                                <div className='flex flex-wrap items-center justify-center w-[120px]  '>
                                    <h3 className="text-xl font-semibold">At Your Pace</h3>
                                    <p>Complete the quiz at your own pace.</p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center'>
                                    <i className="fa-solid fa-otter text-2xl mb-2 dark:text-gray-200"></i>
                                    <span className='dark:text-gray-200'>At Your Pace</span>
                                </div>
                            )}
                        </button>

                        {/* VS Mode */}
                        <button
                            className={`flex flex-col items-center justify-center p-3 rounded-lg  shadow-sm dark:shadow-lg shadow-slate-400 dark:shadow-gray-800 hover:bg-red-200 ${
                                selectedQuizMode === 'vs' ? 'bg-red-500' : 'bg-white dark:bg-gray-600'
                            }`}
                            
                            onMouseEnter={() => handleQuizTypeHover('vs')}
                            onMouseLeave={() => setHoveredQuizType(null)}
                            onClick={() => handleQuizModeSelection('vs')}
                        >
                            {hoveredQuizType === 'vs' ? (
                                <div className='flex flex-wrap items-center justify-center w-[120px] '>
                                    <h3 className="text-xl font-semibold">VS Mode</h3>
                                    <p>Compete against other users in real-time.</p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center'>
                                    <i className="fa-solid fa-khanda text-2xl mb-2 dark:text-gray-200"></i>
                                    <span className='dark:text-gray-200'>VS Mode</span>
                                </div>
                            )}
                        </button>

                        {/* Random Mode */}
                        <button
                            className={`flex flex-col items-center justify-center p-3 rounded-lg  shadow-sm dark:shadow-lg shadow-slate-400 dark:shadow-gray-800 hover:bg-yellow-200 ${
                                selectedQuizMode === 'random' ? 'bg-yellow-500' : 'bg-white dark:bg-gray-600'
                            }`}
                            
                            onMouseEnter={() => handleQuizTypeHover('random')}
                            onMouseLeave={() => setHoveredQuizType(null)}
                            onClick={() => handleQuizModeSelection('random')}
                        >
                            {hoveredQuizType === 'random' ? (
                                <div className='flex flex-wrap items-center justify-center w-[120px] '>
                                    <h3 className="text-xl font-semibold">Random Mode</h3>
                                    <p className=' md:text-base'>Questions are picked randomly from all available years in this subject.</p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center'>
                                    <i className="fa-solid fa-random text-2xl mb-2 dark:text-gray-200"></i>
                                    <span className='dark:text-gray-200'>Random Mode</span>
                                </div>
                            )}
                        </button>

                        {/* New Mode: Three Subject Selection */}
                        <button
                            className={`flex flex-col items-center justify-center p-3 rounded-lg shadow-sm dark:shadow-lg shadow-slate-400 dark:shadow-gray-800 dark:hover:bg-violet-600 hover:bg-purple-200 ${
                                selectedQuizMode === 'multi-subject' ? 'bg-purple-500' : 'bg-white dark:bg-gray-600'
                            }`}
                            
                            onMouseEnter={() => handleQuizTypeHover('multi-subject')}
                            onMouseLeave={() => setHoveredQuizType(null)}
                            onClick={() => handleQuizModeSelection('multi-subject')}
                        >
                            {hoveredQuizType === 'multi-subject' ? (
                                <div className='flex flex-wrap items-center justify-center w-[149px] '>
                                    <h3 className="md:text-xl text-lg font-semibold">Multi-Subject Quiz</h3>
                                    <p className=' md:text-base'>Questions are selected from three different subjects of your choice.</p>
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center'>
                                    <i class="fa-solid fa-cubes text-2xl mb-2 dark:text-gray-200"></i>
                                    <span className='dark:text-gray-200'>Multi-Subject Quiz</span>
                                </div>
                            )}
                        </button>
                    </div>

                    <span className='flex flex-row items-center justify-between mx-2 md:mx-0'>
                        {/* Timer option for timed quiz */}
                        {(selectedQuizMode && selectedQuizMode !== 'multi-subject')  && (
                            <div className="flex items-center my-4">
                                <label className="mr-2 hidden md:block dark:text-gray-300">Use Timer:</label>
                                <button className={`p-2 w-12 h-12 rounded-lg shadow hover:bg-blue-200 shadow-slate-300 dark:shadow-gray-800  dark:bg-gray-600  ${useTimer? 'useTime' : 'noTime' }`} onClick={()=>setUseTimer(!useTimer)}>
                                    <i class={`${useTimer ? 'fa-regular' : 'fa-solid'} fa-clock dark:text-gray-100` }></i>
                                </button>
                            </div>
                        )}
                            {/* Display year selection after choosing a quiz mode (except "random mode") */}
                            {selectedQuizMode && selectedQuizMode !== 'random' && selectedQuizMode !== 'multi-subject' && (
                                <CustomDropdown
                                    name="year"
                                    values={currentSubjectDataYears}
                                    selectedValue={selectedYear}
                                    handleValueChange={handleYearSelection}
                                />
                            )}
                        </span>

                        {/* "Go" button */}
                        {(selectedQuizMode && (selectedQuizMode === 'random' || selectedYear !== '') && (
                            <button
                                className="mt-4 w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors"
                                onClick={()=>handleStartQuiz()}
                            >
                                Start
                            </button>
                        ))}
                    
                </Modal>
            );
        }
        return null;
    };


    return (
        <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser} searchBarValue={searchBarValue} setSearchBarData={setSearchBarData} setShowSearch={setShowSearch} showSearch={showSearch} toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode} >
        
            
        <div className="questionAndAnswer bg-gray-100 dark:bg-gray-900 flex flex-col pt-4 pb-20 md:pb-10 mx-auto max-w-screen-xl h-screen max-h-[90vh] overflow-y-auto no-scroll-bar ">
            <ol className="list-none md:mx-6 mx-4 ">
                {actualDataDueToSearch && Object.keys(selectedLevelData).length > 0 ? (
                    
                    actualDataDueToSearch.length === 0 ? (
                        <p className="text-gray-600">No questions available.</p>
                    ) :
                    
                    actualDataDueToSearch.map((key, index) => {
                        const subject = selectedLevelData[key];
                        return (
                            <li
                                key={index}
                                className={`w-full rounded-md shadow-md  dark:bg-gray-800 dark:hover:bg-gray-600 bg-white p-6 mb-4 cursor-pointer transition-transform transform duration-500 hover:scale-105 hover:bg-gray-200`}
                                onClick={() => handleListItemClick(subject, key)}
                            >
                                <div className="font-bold text-blue-600">{key}</div>
                                <div className="mt-2 text-xs font-medium text-gray-400">
                                    <span>Years available: {Object.keys(subject).length}</span>
                                </div>
                            </li>
                        );
                    })
                ) : (
                    <p className="text-gray-600">No subjects available.</p>
                )}
            </ol>

            {/* Render detailed view popup */}
            {renderDetailPopup()}

            <RenderMultiSubjectSelectionModal
                multiSubjectModalVisible={multiSubjectModalVisible}
                selectedSubjects={selectedSubjects}
                selectedLevelData={selectedLevelData}
                setMultiSubjectModalVisible={setMultiSubjectModalVisible}
                setSelectedSubjects={setSelectedSubjects}
                fetchQuestions={fetchQuestions}
                shuffleArray={shuffleArray}
                navigate={navigate}
                user={user}
                
                setUseTimer={setUseTimer}
                useTimer={useTimer}
                handleStartQuiz= {handleStartQuiz}
                currentSubjectData={currentSubjectData}
            />
            {/* ToastContainer for managing toasts */}
            <ToastContainer />
        </div>
        </ NavBar>
    );
}

export default Quiz;
