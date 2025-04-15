import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { firestore } from '../config'; // Import Firebase firestore
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import TextEditor from "./textEditor"; // Import your text editor component
import '../assets/adminStyle.css'
import CustomDropdown from "./newDropdown";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from "./NavBar";
import AddAchievementForm from "./AchievementForm";

export default function AdminDashboard({navBarData}) {
    const [loading, setLoading] = useState(true);
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState('');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [questions, setQuestions] = useState([]);
    const [editing, setEditing] = useState(false);
    const [ind, setInd] = useState(0);
    const [newQuest, setNewQuest] = useState("");
    const [newAnswers, setNewAnswers] = useState([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
    const [newSubject, setNewSubject] = useState('');
    const [newYear, setNewYear] = useState('');
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [showAddYear, setShowAddYear] = useState(false);
    const navigate = useNavigate();
    const databaseSnapshot = useCallback(() => getDoc(doc(firestore, 'subjects', 'levels')), []);
        // Refs for tracking input fields and plus icons
    const subjectRef = useRef(null);
    const yearRef = useRef(null);



    const getDBSnapshot = useCallback(() => {
        databaseSnapshot().then(snapshot => {
            setLoading(false);
        }).catch(() => {
            setLoading(true);
        });
    }, [databaseSnapshot]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if click is outside of the input fields and plus icons
            if (showAddSubject && subjectRef.current && !subjectRef.current.contains(event.target)) {
                setShowAddSubject(false);
            }
            if (showAddYear && yearRef.current && !yearRef.current.contains(event.target)) {
                setShowAddYear(false);
            }
        };

        // Add event listener for clicks outside of the input fields and plus icons
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup event listener on unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAddSubject, showAddYear]);

    // Fetch levels from Firestore
    const fetchLevels = useCallback(async () => {
        try {
            const levelsSnapshot = await databaseSnapshot();
            const levelsData = levelsSnapshot.data();
            const levelsArray = Object.keys(levelsData);
            setLevels(levelsArray);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching levels:', error);
        }
    }, [databaseSnapshot]);


    const toggeAddSubject=()=>{
        setShowAddSubject(!showAddSubject)
    }
    const toggeAddYear=()=>{
        setShowAddYear(!showAddYear)
    }

    // Fetch subjects from Firestore
    const fetchSubjects = async (level) => {
        try {
            if (level) {
                const subjectsSnapshot = await databaseSnapshot();
                if (subjectsSnapshot.exists()) {
                    let levelData = subjectsSnapshot.data();
                    levelData = levelData[level];
                    if (levelData) {
                        const subj = levelData.subjects || [];
                        setSubjects(Object.keys(subj));
                        setLoading(false);
                        return subj;
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    // Fetch years from Firestore
    const fetchYears = async (subje) => {
        try {
            if (subje) {
                const yearsSnapshot = await databaseSnapshot();
                const dt = yearsSnapshot.data()[selectedLevel].subjects[subje];
                const years = dt ? Object.keys(dt) : [];
                setYears(years);
                setLoading(false);
                return years;
            }
        } catch (error) {
            console.error('Error fetching years:', error);
        }
    };

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const docRef = doc(firestore, "subjects", 'levels');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const levelData = docSnap.data()[selectedLevel];
                const subjectData = levelData.subjects[selectedSubject];
                const yearData = subjectData[selectedYear];
                const questionsData = yearData ? yearData.questions || [] : [];
                setQuestions(questionsData);
            } else {
                console.log("Document does not exist");
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
            toast.success('Questions Fetched Successfully')
        }
    }, [selectedLevel, selectedSubject, selectedYear]);

    useEffect(() => {
        getDBSnapshot();
        fetchLevels();
    }, [getDBSnapshot, fetchLevels]);
//fetch questions if level year subject are choosen
    useEffect(() => {
        if (selectedLevel && selectedSubject && selectedYear) {
            fetchQuestions();
        }
    }, [selectedLevel, selectedSubject, selectedYear, fetchQuestions]);

    const handleLevelChange = async (level) => {
        setSelectedLevel(level);
        setSelectedSubject('');
        setSubjects([]);
        setSelectedYear('');
        setYears([]);
        if (level) {
            await fetchSubjects(level);
        } else {
            setSubjects([]);
        }
    };

    const handleSubjectChange = async (subject) => {
        setLoading(true);
        setSelectedSubject(subject);
        setSelectedYear('');
        if (subject) {
            await fetchYears(subject);
        } else {
            setYears([]);
        }
    };

    const handleYearChange = (year) => {
        setSelectedYear(year);
    };

    const addQuestionToFirestore = async (newQuestion) => {
        try {
            const docRef = doc(firestore, "subjects", 'levels');
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : {};
            const levelData = existingData[selectedLevel];
            const subjectData = levelData.subjects[selectedSubject];
            const yearData = subjectData[selectedYear];
            const updatedData = {
                ...existingData,
                [selectedLevel]: {
                    subjects: {
                        ...levelData.subjects,
                        [selectedSubject]: {
                            ...subjectData,
                            [selectedYear]: {
                                questions: [...(yearData.questions || []), newQuestion]
                            }
                        }
                    }
                }
            };
            await setDoc(docRef, updatedData);
            setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
            toast.success('Question successfully added.')
        } catch (error) {
            console.error('Error adding question:', error);
        }
    };

    const openEditor = async (index) => {
        setInd(index);
        setEditing(true);
        const questionToEdit = questions[index];
        setNewQuest(questionToEdit.question);
        const existingAnswers = questionToEdit.answers.map(answer => ({ ...answer }));
        setNewAnswers(existingAnswers);
        const existingCorrectAnswerIndex = questionToEdit.correctAnswer || null;
        setCorrectAnswerIndex(existingCorrectAnswerIndex);
    };

    const closeEditor = () => {
        setEditing(false);
        setNewQuest("");
        setNewAnswers([
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
        ]);
        setCorrectAnswerIndex(null);
    };

    const updateQuestion = async () => {
        setLoading(true);
        try {
            const docRef = doc(firestore, "subjects", 'levels');
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : {};
            const updatedQuestions = existingData[selectedLevel]?.subjects?.[selectedSubject]?.[selectedYear]?.questions || [];
            if (updatedQuestions.length > ind) {
                updatedQuestions[ind].question = newQuest;
                updatedQuestions[ind].answers = newAnswers;
                updatedQuestions[ind].correctAnswer = correctAnswerIndex;
                const updatedData = {
                    ...existingData,
                    [selectedLevel]: {
                        subjects: {
                            ...existingData[selectedLevel]?.subjects,
                            [selectedSubject]: {
                                ...existingData[selectedLevel]?.subjects?.[selectedSubject],
                                [selectedYear]: {
                                    ...existingData[selectedLevel]?.subjects?.[selectedSubject]?.[selectedYear],
                                    questions: updatedQuestions,
                                }
                            }
                        }
                    }
                };
                await setDoc(docRef, updatedData);
                console.log("Questions updated successfully.");
                toast.success("Questions updated successfully.")
            } else {
                console.log("Invalid question index.");
            }
        } catch (error) {
            console.log(`Error updating question: ${error}`);
        } finally {
            setEditing(false);
            setNewQuest("");
            setNewAnswers([
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
                { text: '', isCorrect: false },
            ]);
            setCorrectAnswerIndex(null);
            fetchQuestions();
        }
    };

    const handleInputChange = (event, index) => {
        const inputedValue = event.target.value;
        const updatedAnswers = [...newAnswers];
        updatedAnswers[index].text = inputedValue;
        setNewAnswers(updatedAnswers);
    };

    const handleCheckboxChange = (index) => {
        const updatedAnswers = [...newAnswers];
        updatedAnswers.forEach((option, i) => {
            option.isCorrect = (i === index);
        });
        setNewAnswers(updatedAnswers);
    };

    const handleAddSubject = async () => {
        if (newSubject) {
            try {
                const docRef = doc(firestore, "subjects", "levels");
                const docSnap = await getDoc(docRef);
                const existingData = docSnap.exists() ? docSnap.data() : {};
                
                const levelData = existingData[selectedLevel];
                levelData.subjects = levelData.subjects || {};
                levelData.subjects[newSubject] = {}; // Initialize the new subject with an empty object
                
                const updatedData = {
                    ...existingData,
                    [selectedLevel]: levelData
                };
                
                await setDoc(docRef, updatedData );
                setSubjects([...subjects, newSubject]);
                setNewSubject('');
                console.log("Subject added successfully.");
                toast.success("Subject added successfully.")
            } catch (error) {
                console.error('Error adding subject:', error);
                toast.error("Error adding subject")
            }
        }
    };

    const handleAddYear = async () => {
        if (newYear) {
            try {
                const docRef = doc(firestore, "subjects", "levels");
                const docSnap = await getDoc(docRef);
                const existingData = docSnap.exists() ? docSnap.data() : {};
                
                const levelData = existingData[selectedLevel];
                const subjectData = levelData.subjects[selectedSubject];
                
                subjectData[newYear] = {}; // Initialize the new year with an empty object
                
                const updatedData = {
                    ...existingData,
                    [selectedLevel]: {
                        ...existingData[selectedLevel],
                        subjects: {
                            ...existingData[selectedLevel].subjects,
                            [selectedSubject]: subjectData
                        }
                    }
                };
                
                await setDoc(docRef, updatedData);
                setYears([...years, newYear]);
                setNewYear('');
                console.log("Year added successfully.");
            } catch (error) {
                console.error('Error adding year:', error);
            }
        }
    };

    const deleteQuestion = async (index) => {
        try {
            const docRef = doc(firestore, "subjects", 'levels');
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : {};
            const levelData = existingData[selectedLevel]?.subjects?.[selectedSubject]?.[selectedYear];
            
            // Remove the question from the list
            const updatedQuestions = [...(levelData.questions || [])];
            updatedQuestions.splice(index, 1);
            
            // Update the data
            const updatedData = {
                ...existingData,
                [selectedLevel]: {
                    subjects: {
                        ...existingData[selectedLevel].subjects,
                        [selectedSubject]: {
                            ...existingData[selectedLevel].subjects[selectedSubject],
                            [selectedYear]: {
                                ...existingData[selectedLevel].subjects[selectedSubject][selectedYear],
                                questions: updatedQuestions
                            }
                        }
                    }
                }
            };
            
            // Set the updated data to Firestore
            await setDoc(docRef, updatedData);
            
            // Update the local state
            setQuestions(updatedQuestions);
            console.log("Question deleted successfully.");
        } catch (error) {
            console.error('Error deleting question:', error);
        }
    };

    const handleDeleteYear = async () => {
        try {
            // Delete year from Firestore
            const docRef = doc(firestore, "subjects", "levels");
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : {};
    
            const levelData = existingData[selectedLevel];
            const subjectData = levelData.subjects[selectedSubject];
    
            delete subjectData[selectedYear];
    
            const updatedData = {
                ...existingData,
                [selectedLevel]: {
                    ...levelData,
                    subjects: {
                        ...levelData.subjects,
                        [selectedSubject]: subjectData,
                    },
                },
            };
    
            // Update Firestore document
            await setDoc(docRef, updatedData);
    
            // Update local state
            setYears((prevYears) => prevYears.filter((y) => y !== selectedYear));
            setSelectedYear('')
            console.log('selected yearssss',selectedYear)
            console.log("Year deleted successfully.");
        } catch (error) {
            console.error("Error deleting year:", error);
        }
    };
    const handleDeleteSubject = async () => {
        try {
            // Delete subject from Firestore
            const docRef = doc(firestore, "subjects", "levels");
            const docSnap = await getDoc(docRef);
            const existingData = docSnap.exists() ? docSnap.data() : {};
    
            const levelData = existingData[selectedLevel];
            delete levelData.subjects[selectedSubject];
    
            const updatedData = {
                ...existingData,
                [selectedLevel]: levelData,
            };
    
            // Update Firestore document
            await setDoc(docRef, updatedData);
    
            // Update local state
            setSubjects((prevSubjects) => prevSubjects.filter((subj) => subj !== selectedLevel));
            setSelectedSubject('')
            console.log("Subject deleted successfully.");
        } catch (error) {
            console.error("Error deleting subject:", error);
        }
    };    

    return (
        <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser}  toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode}>

        <div className="max-w-screen-xl h-screen flex flex-col mx-auto max-h-screen overflow-x-auto no-scroll-bar pb-16 bg-gray-100 dark:bg-gray-900 custom-scroll-bar mt-[60px] md:mt-12">

            <section className="flex justify-center items-center flex-col mt-6 " >
                <div id="SELECTOR" className="flex flex-wrap flex-col items-center justify-between w-full mb-6 sm:flex-row sm:items-start">
                    
                    <CustomDropdown 
                        name='Level' 
                        values={levels} 
                        selectedValue={selectedLevel} 
                        handleValueChange={handleLevelChange} 
                    />
                    <CustomDropdown 
                        name='Subject'
                        values={subjects}
                        selectedValue={selectedSubject}
                        handleValueChange={handleSubjectChange}
                        dependencies={ [selectedLevel] }
                        toggleAddValue={toggeAddSubject}
                        deleteValue={handleDeleteSubject}
                        fetchAvailableData={fetchSubjects}
                    />
                    <CustomDropdown 
                        name='Year' 
                        values={years} 
                        selectedValue={selectedYear} 
                        handleValueChange={handleYearChange} 
                        dependencies={[selectedLevel, selectedSubject]} 
                        toggleAddValue={toggeAddYear} 
                        deleteValue={handleDeleteYear}
                        fetchAvailableData={fetchSubjects}
                    />

                </div>
                            {/* Add Subject and Year buttons */}
            <div className="flex flex-col w-full mb-4 items-center">
                {showAddSubject &&
                (<div ref={subjectRef} className="add-subject-container flex flex-col md:flex-row items-center">
                    <input
                        type="text"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="New Subject"
                        className="p-2 border border-gray-300 rounded mr-2"
                    />
                    <button onClick={handleAddSubject} className="bg-blue-500 w-[135px] text-white px-4 py-2 rounded">
                        Add Subject
                    </button>
                </div>)}

                {showAddYear && 
                (<div ref={yearRef} className="add-year-container flex flex-col md:flex-row items-center">
                    <input
                        type="number"
                        
                        value={newYear}
                        onChange={(e) => setNewYear(e.target.value)}
                        placeholder="New Year"
                        className="p-2 border border-gray-300 rounded md:mr-2 mr-0 "
                    />
                    <button onClick={handleAddYear} className="bg-blue-500 w-[135px] text-white px-4 py-2 rounded mt-4 md:mt-0">
                        Add Year
                    </button>
                </div>)}
            </div>
                <div id="textEditor" className="w-[90%] rounded-md shadow-gray-400 shadow-inner mx-4">
                    <TextEditor onSave={addQuestionToFirestore} />
                </div>

                <div className="questionAndAnswer flex flex-col mt-8 w-full ">
                    <ol style={{ padding: '0 20px' }}>
                        {questions && Array.isArray(questions) && questions.length > 0 ? (
                            questions.map((question, index) => (
                                <li key={index} style={{ marginBottom: "20px" }} className=" w-full rounded-md shadow shadow-slate-300 p-6 dark:bg-gray-800">
                                    <div className="title text-slate-600 dark:text-white">{index + 1}. Question:</div>
                                    <div className="question font-semibold dark:text-gray-200">{question.question}</div>
                                    <div className=" flex flex-row flex-wrap justify-between mt-2 items-center">

                                        <div className="answers">
                                            <div style={{ marginTop: "10px" }} className="title text-slate-600 dark:text-white">Answers:</div>
                                            <ul style={{ listStyle: 'upper-alpha', padding: 0 }} className="list-disc">
                                                {question.answers && Array.isArray(question.answers) ? (
                                                    question.answers.map((answer, ind) => (
                                                        <li key={ind} style={{ marginLeft: "20px" }} className="font-semibold dark:text-gray-200">
                                                            {answer.text}
                                                        </li>
                                                    ))
                                                ) : null}
                                            </ul>
                                        </div>

                                        <div className="questionImage">
                                            {question.imageUrl ? (
                                                <img className="w-32 h-32 rounded" src={question.imageUrl} alt='Image_of_Question' />
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="update-delete-buttons flex flex-row justify-between mt-4 ">
                                        <button onClick={() => openEditor(index)} className=" bg-blue-400 text-white pl-4 pr-4 pt-1 pb-1 rounded">UPDATE</button>
                                        <button onClick={() => deleteQuestion(index)} className=" bg-red-400 text-white pl-4 pr-4 pt-1 pb-1 rounded-md ml-2">DELETE</button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>No questions available.</p>
                        )}
                    </ol>

                    {editing ? (
                        <div
        className="fixed inset-0 flex justify-center items-center z-50 max-h-screen overflow-x-auto no-scroll-bar" 
        style={{
            backdropFilter: 'blur(8px)', // Apply a blur effect to the backdrop
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Add a semi-transparent background for a dimming effect
        }}
    >
        <div
            className="edit-container flex justify-center items-center flex-col w-[80vw] max-w-[50rem] p-5 my-auto"
            style={{
                zIndex: 1000, // Set a higher z-index to ensure it is above other elements
                backgroundColor: 'white', // Optional: set background color
                padding: '20px', // Optional: add padding for spacing
               
                borderRadius: '8px', // Optional: add rounded corners
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Optional: add shadow for better visibility
            }}
        >     
        {/* ---------------UPDATE QUESTIONS-------------#### ADD POSSIBILITY TO CHANGE OR DELETE IMAGE IN A QUESTION ####----------------------------------------------- */}
        <h1 className="text-blue-400 mb-4 text-2xl font-semibold">Update Question</h1>
                               <div className="inputs flex flex-col items-center w-full">
                                <input
                                    type="text"
                                    value={newQuest}
                                    onChange={(e) => setNewQuest(e.target.value)}
                                    placeholder="New question"
                                    className="border-slate-300 rounded-md w-full mb-4"
                                />
                                {newAnswers.map((value, index) => (
                                    <div key={index} className="flex flex-row justify-center items-center w-full">
                                        <input
                                            type="text"
                                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                            value={value.text}
                                            onChange={(event) => handleInputChange(event, index)}
                                            className="border-slate-300 rounded-md mt-4 w-full"
                                        />
                                        <input
                                            type="checkbox"
                                            checked={value.isCorrect}
                                            onChange={() => handleCheckboxChange(index)}
                                            className="border-slate-300 rounded-[50%] ml-2 mt-4"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="buttons flex items-center justify-between mt-4 w-full sm:w-3/5">
                                <button onClick={updateQuestion} className=" bg-blue-400 text-white pl-4 pr-4 pt-1 pb-1 rounded">Save</button>
                                <button onClick={closeEditor} className=" bg-red-400 text-white pl-4 pr-4 pt-1 pb-1 rounded-md ml-2">Cancel</button>
                            </div>
                        </div>
                        </div>
                    ) : null}
                </div>
            <AddAchievementForm />
            </section>
            <hr />
            <ToastContainer limit={1} progressStyle={{ backgroundColor: 'blue' }} position="top-right" className={'rounded-md'} autoClose={3000} />

        </div>
        </NavBar>
    );
}
