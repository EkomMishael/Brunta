import { getDocs, doc, getDoc, setDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Line, Pie, Bar } from 'react-chartjs-2';
import React, { useState, useEffect } from 'react';
import { firestore, storage } from '../config';
import Modal from '../components/modal';
import 'chart.js/auto';
import NavBar from '../components/NavBar';



export default function UserStatistics({user, setLoading, navBarData}){
    const [refresh,setRefresh] = useState (0)
    const [userProgress, setUserProgress] = useState({});

    const colorsForSubjects = [
        '#4BC0C0',
        '#FF6384',
        '#9966FF',
        '#FF6384',
        '#6A4C93',
        '#FFC3A0',
        '#FF7F50',
        '#FFD700',
        '#40E0D0',
        '#6495ED',
        '#FF9F40',
        '#FFD700',
        '#8A2BE2',
        '#20B2AA',
        '#87CEEB',
        '#FFCE56',
        '#ADFF2F',
        '#36A2EB',
    ]


        // Function to fetch user data
        const fetchUserData = async () => {
            // Fetch user achievements, goals, and progress
            const userDocRef = doc(firestore, `users/user${user.UserId}/quizzes-${user.userLevel}/results`);
            const userDoc = await getDoc(userDocRef);
            setRefresh(refresh + 1)
    
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserProgress(userData.resultData || {});
                console.log('Data',userProgress)
            }
        };
    
        const generateChartData = (userProgress) => {
            // Initialize data structures
            const subjectProgressOverTime = {};
            const quizModeProgressOverTime = {};
            const subjectScores = {};
            const quizModeScores = {};
            console.log(userProgress,'yalaaaaa')
        
            // Loop through each quiz in userProgress
            userProgress.forEach((quiz) => {
                const timestamp = quiz.timestamp.toDate().toLocaleDateString();
        
                // Aggregate subject progress over time
                for (const subject in quiz.performancePerSubject) {
                    if (!subjectProgressOverTime[subject]) {
                        subjectProgressOverTime[subject] = [];
                    }
                    subjectProgressOverTime[subject].push({
                        timestamp: timestamp,
                        score: quiz.performancePerSubject[subject].percentage,
                    });
                }
        
                // Aggregate quiz mode progress over time
                if (!quizModeProgressOverTime[quiz.quizMode]) {
                    quizModeProgressOverTime[quiz.quizMode] = [];
                }
                quizModeProgressOverTime[quiz.quizMode].push({
                    timestamp: timestamp,
                    score: quiz.score,
                });
        
                // Aggregate subject scores
                for (const subject in quiz.performancePerSubject) {
                    if (!subjectScores[subject]) {
                        subjectScores[subject] = [];
                    }
                    subjectScores[subject].push(quiz.performancePerSubject[subject].percentage);
                }
        
                // Aggregate quiz mode scores
                if (!quizModeScores[quiz.quizMode]) {
                    quizModeScores[quiz.quizMode] = [];
                }
                quizModeScores[quiz.quizMode].push(quiz.score);
            });


            const subjects = Object.keys(subjectProgressOverTime)
        
            // Generate chart data for subject progress over time
            const subjectChartData = {};
            for (const subject in subjectProgressOverTime) {
                const index = subjects.indexOf(subject);
                subjectChartData[subject] = {
                    labels: subjectProgressOverTime[subject].map((data) => data.timestamp),
                    datasets: [
                        {
                            label: `${subject} Progress Over Time`,
                            data: subjectProgressOverTime[subject].map((data) => data.score),
                            fill: true,
                            borderColor: colorsForSubjects[index],
                            backgroundColor: colorsForSubjects[index].concat('2e'),
                        },
                    ],
                };
            }
        
            // Generate chart data for quiz mode progress over time
            const quizModeChartData = {};
            for (const quizMode in quizModeProgressOverTime) {
                quizModeChartData[quizMode] = {
                    labels: quizModeProgressOverTime[quizMode].map((data) => data.timestamp),
                    datasets: [
                        {
                            label: `${quizMode} Progress Over Time`,
                            data: quizModeProgressOverTime[quizMode].map((data) => data.score),
                            fill: true,
                            borderColor: '#36A2EB',
                            backgroundColor: '#36A2EB2e',
                        },
                    ],
                };
            }
        
            // Generate chart data for subject scores
            const subjectScoresChartData = {
                labels: Object.keys(subjectScores),
                datasets: [
                    {
                        label: 'Average Score by Subject',
                        data: Object.values(subjectScores).map((scores) => {
                            const sum = scores.reduce((acc, curr) => acc + curr, 0);
                            return sum / scores.length;
                        }),
                        backgroundColor: '#FFCE56',
                    },
                ],
            };
        
            // Generate chart data for quiz mode scores
            const quizModeScoresChartData = {
                labels: Object.keys(quizModeScores),
                datasets: [
                    {
                        label: 'Average Score by Quiz Mode',
                        data: Object.values(quizModeScores).map((scores) => {
                            const sum = scores.reduce((acc, curr) => acc + curr, 0);
                            return sum / scores.length;
                        }),
                        backgroundColor: '#4BC0C0',
                    },
                ],
            };
            const combined = {
                labels: [...Object.keys(subjectChartData), ...Object.keys(quizModeChartData)],

                datasets: [
                    ...Object.keys(subjectChartData).map((subject) => subjectChartData[subject].datasets[0]),
                    // ...Object.keys(quizModeChartData).map((quizMode) => quizModeChartData[quizMode].datasets[0]),
                ],
            
            };
    // console.log('ONE',(subjectChartData),'TWO',combined.datasets,'three',subjectChartData.Biology.datasets)
            
            return {
                subjectChartData,
                quizModeChartData,
                subjectScoresChartData,
                quizModeScoresChartData,
                combined,
            };
        };
    
        // Fetch user data on component mount
        useEffect(() => {
            if(refresh < 2){
                setLoading(true)
            fetchUserData();
        }else{
            setLoading(false)
        }
            console.log('Data4',userProgress)
        }, [user.UserId,refresh]);
        // Function to display charts
const DisplayCharts = ( userProgress ) => {
    console.log(userProgress,{userProgress},'IYALA IYALA')
    const {
        subjectChartData,
        quizModeChartData,
        subjectScoresChartData,
        quizModeScoresChartData,
        combined,
    } = generateChartData(userProgress);
    return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800 lg:col-span-3 md:col-span-2 row-span-1 ">
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-400"> Combined Subject Progress Over Time</h3>
                        <Line  data={combined} />
                    </div>
                {/* Subject Progress Over Time */}
                {Object.keys(subjectChartData).map((subject) => (
                    <div key={subject} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">{subject} Progress Over Time</h3>
                        <Line data={subjectChartData[subject]} />
                    </div>
                ))}

                {/* Quiz Mode Progress Over Time */}
                {Object.keys(quizModeChartData).map((quizMode) => (
                    <div key={quizMode} className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
                        <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">{quizMode} Progress Over Time</h3>
                        <Line data={quizModeChartData[quizMode]} />
                    </div>
                ))}

                {/* Average Score by Subject */}
                <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Average Score by Subject</h3>
                    <Bar data={subjectScoresChartData} />
                </div>

                {/* Average Score by Quiz Mode */}
                <div className="bg-white p-4 rounded-lg shadow-md dark:bg-gray-800">
                    <h3 className="text-lg font-semibold mb-2 dark:text-gray-400">Average Score by Quiz Mode</h3>
                    <Bar data={quizModeScoresChartData} />
                </div>
            </div>
        );
};
return (
    <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser} toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode} >

    <div className="profile-container mx-auto max-w-screen-xl p-6 pb-36 md:pb-28 bg-gray-100 max-h-screen h-screen overflow-x-auto no-scroll-bar shadow-md dark:bg-gray-900">
        <h1 className="text-3xl font-semibold text-gray-800 dark:text-white mb-4">Statistics</h1>
        {userProgress.length > 0 && refresh > 1 ? (
            DisplayCharts(userProgress)
        ) : (
            <p className="text-gray-600 dark:text-gray-400">You have not completed any Quiz yet</p>
        )}
        <Modal />
    </div>
    </NavBar>
);
}