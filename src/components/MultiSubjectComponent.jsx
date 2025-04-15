import React, { useState, useEffect } from 'react';
import Modal from '../components/modal';
import { ToastContainer, toast } from 'react-toastify'; // Import `react-toastify`
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for `react-toastify`

function RenderMultiSubjectSelectionModal(props) {
    const {
        multiSubjectModalVisible,
        selectedSubjects,
        selectedLevelData,
        setMultiSubjectModalVisible,
        setSelectedSubjects,
        fetchQuestions,
        shuffleArray,
        
        user,
        setUseTimer,
        useTimer,
        handleStartQuiz,
        
    } = props;

    const [availableSubjects, setAvailableSubjects] = useState([]);

    // Fetch available subjects when the component mounts or when `selectedLevelData` changes
    useEffect(() => {
        if (selectedLevelData) {
            const availableSubjects = Object.keys(selectedLevelData);
            setAvailableSubjects(availableSubjects);
        }
    }, [selectedLevelData]);

    const handleSubjectSelection = (event, subjectName) => {
        const { checked } = event.target;
        if (checked) {
            if (selectedSubjects.length < 5) {
                setSelectedSubjects([...selectedSubjects, subjectName]);
                console.log('subjectName',subjectName)
            } else {
                toast.error('You can select up to 5 subjects.');
            }
        } else {
            //filter all subjects in the array that are not equal to the subjectName that was unchecked or deselected
            setSelectedSubjects(selectedSubjects.filter(key => key !== subjectName));
        }
    };

    const handleMultiSubjectQuizStart = async () => {
        // Initialize an array to hold all fetched questions
        let allQuestions = [];

        try {
            // Iterate over each selected subject
            for (const subjectName of selectedSubjects) {
                // Fetch questions randomly from each available year for the subject
                console.log(selectedSubjects)
                console.log(subjectName)
                const fetchedQuestions = await fetchQuestions(user.userLevel, subjectName, null, 'multi-subject');
                
                // Add the fetched questions to the allQuestions array
                allQuestions = [...allQuestions, ...fetchedQuestions];
                console.log(allQuestions)
            }

            // Shuffle the combined questions
            allQuestions = shuffleArray(allQuestions);

            // Limit the number of questions to 50
            allQuestions = allQuestions.slice(0, 50);

            // send data to handleStartQuiz function from quiz page
            handleStartQuiz(allQuestions)

            // Close the subject selection modal and reset selection
            setMultiSubjectModalVisible(false);
            setSelectedSubjects([]);
        } catch (error) {
            console.error('Error fetching questions for multi-subject quiz:', error);
            toast.error('Error fetching questions for multi-subject quiz: ' + error.message);
        }
    };

    if (multiSubjectModalVisible) {
        return (
            <Modal
                isOpen={multiSubjectModalVisible}
                onClose={() => setMultiSubjectModalVisible(false)}
                title="Select Subjects for Multi-Subject Quiz"
            >
                <div className="flex flex-col space-y-2">
                    {/* Display available subjects as checkboxes */}
                    {availableSubjects.map((subject, index) => (
                        <div key={index} className='w-full bg-white rounded-md shadow flex flex-row items-center shadow-slate-300 py-2 px-2'>
                            <div>
                                <input
                                type="checkbox"
                                id={`subject-${index}`}
                                className='rounded-full'
                                name="subjects"
                                value={subject}
                                checked={selectedSubjects.includes(subject)}
                                onChange={(e) => handleSubjectSelection(e, subject)}
                            />
                            </div>
                            
                            <label htmlFor={`subject-${index}`} className="ml-2">
                                {subject}
                            </label>
                        </div>
                    ))}
                    
                    

                    {/* "Start" button */}
                    {selectedSubjects.length >= 2 && selectedSubjects.length <= 5 && (
                        <>
                        <div className="flex items-center my-4">
                            <label className="mr-2 hidden md:block">Use Timer:</label>
                            <button className={`p-2 w-12 h-12 rounded-lg shadow hover:bg-blue-200 shadow-slate-300  ${useTimer? 'useTime' : 'noTime' }`} onClick={()=>setUseTimer(!useTimer)}>
                                <i class={`${useTimer ? 'fa-regular' : 'fa-solid'} fa-clock`}></i>
                            </button>
                        </div>
                        <button
                            className="mt-4 w-full bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors"
                            onClick={handleMultiSubjectQuizStart}
                        >
                            Start
                        </button>
                    </>
                    )}
                </div>
            </Modal>
        );
    }

    return null;
}

export default RenderMultiSubjectSelectionModal;
