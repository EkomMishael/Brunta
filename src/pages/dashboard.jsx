import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore, storage ,auth } from '../config';
import { getDocs, doc, getDoc, setDoc, collection, query, orderBy, limit } from 'firebase/firestore';
import { Line, Pie, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import ViewFullImage from '../components/viewFullImage';
import CustomDropdown from '../components/newDropdown';
import Modal from '../components/modal';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import profilePic from '../assets/default-pfp.jpg';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import Tooltip from '../components/customToolPit';
import Badge from '../assets/badge.jpg'
import Protein from '../assets/protein-svgrepo-com.svg'
import Carbon from '../assets/genetic-algorithm-svgrepo-com.svg'
import NavBar from '../components/NavBar';
import CalendarComponent from '../components/Calender';
import UserGoals from '../components/UserGoals';
import Achievements from '../components/Achievements';


export default function UserProfile({ user, setLoading, levels, levelsData, setSelectedLevel, setSelectedLevelData, selectedLevel, navBarData }) {

useEffect(()=>{
    
},[user])

    const [profilePicture, setProfilePicture] = useState(user.profilePic || profilePic);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showOGPic, setShowOGPic] = useState(false);
    const [recentQuizzes, setRecentQuizzes] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [userGoals, setUserGoals] = useState([]);
    const [upcomingQuizzes, setUpcomingQuizzes] = useState([]);
    const [feedback, setFeedback] = useState([]);

    const [chartLabels,setChartLabels] = useState ([])

    // Event handlers for profile picture update modal
    const openProfilePic = () => setIsPopupOpen(true);
    const closePopup = () => setIsPopupOpen(false);
    const handleCropChange = (newCrop) => setCrop(newCrop);
    const handleZoomChange = (newZoom) => setZoom(newZoom);
    const onCropComplete = (croppedArea, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels);
    
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

    const badges = [
        {
          name: "Quiz Master",
          description: "Awarded for completing 10 quizzes with a score of 80% or higher.",
          image: Carbon
        },
        {
          name: "Top Performer",
          description: "Awarded for achieving the highest score in a quiz competition.",
          image: Protein
        },
        {
          name: "Dedicated Learner",
          description: "Awarded for consistently participating in learning activities.",
          image: Badge
        },
        {
          name: "Knowledge Seeker",
          description: "Awarded for completing 5 quizzes with a score of 90% or higher.",
          image: Badge
        },
        {
          name: "Master of Subjects",
          description: "Awarded for achieving high scores across multiple subjects.",
          image: Badge
        },
        {
          name: "Brainiac",
          description: "Awarded for demonstrating exceptional knowledge in challenging quizzes.",
          image: Badge
        },
        {
          name: "Perseverance",
          description: "Awarded for completing 20 quizzes despite challenges and setbacks.",
          image: Badge
        },
        {
          name: "Quick Thinker",
          description: "Awarded for answering 10 questions correctly within a short time frame.",
          image: Badge
        },
        {
          name: "Problem Solver",
          description: "Awarded for solving complex quiz questions with innovative solutions.",
          image: Badge
        },    
      ];
      

    // Add a new profile picture
    const handleAddPic = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target.result;
                    setProfilePicture(result);
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    };

    // Function to upload cropped image
    const uploadCroppedImage = async (croppedImageBlob) => {
        try {
            const filename = `profile_pic-${Date.now()}.jpeg`;
            const storageRef = ref(storage, `profile/${filename}`);
            await uploadBytes(storageRef, croppedImageBlob);
            const downloadUrl = await getDownloadURL(storageRef);
            return downloadUrl;
        } catch (error) {
            toast.error('Error uploading image to Firebase Storage.');
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    // Function to update the user's profile picture
    const updateProfilePicture = async (userId, downloadUrl) => {
        try {
            const userDocRef = doc(firestore, `users/user${userId}`);
            await setDoc(userDocRef, { profilePic: downloadUrl }, { merge: true });
            toast.success('Profile picture updated successfully!');
        } catch (error) {
            toast.error('Error updating profile picture in Firestore.');
            console.error('Error updating profile picture:', error);
            throw error;
        }
    };

    // Handle saving cropped image and updating profile picture
    const handleSave = async () => {
        if (croppedAreaPixels) {
            try {
                // Generate the cropped image Blob
                const croppedImageBlob = await getCroppedImg(profilePicture, croppedAreaPixels);

                // Check if the cropped image Blob is available
                if (!croppedImageBlob) {
                    toast.error('Failed to crop the image. Please try again.');
                    return;
                }

                // Upload the cropped image Blob to Firebase Storage and get the download URL
                const downloadUrl = await uploadCroppedImage(croppedImageBlob);

                // Update the user's profile picture URL in Firestore
                await updateProfilePicture(user.UserId, downloadUrl);

                // Set the profile picture state and show a success message
                setProfilePicture(downloadUrl);
                toast.success('Profile picture updated successfully!');
            } catch (error) {
                // Handle errors appropriately and show an error message
                toast.error('Error updating profile picture.');
                console.error('Error updating profile picture:', error);
            }
        }
        // Close the modal once the process is complete
        closePopup();
    };

    // User interaction with profile picture
    const handleProfilePictureClick = () => setShowOGPic(true);

    // Handle removing the profile picture
    const handleRemovePic = () => {
        setProfilePicture(profilePic);
        closePopup();
    };

    // // Handle level selection change
    // const handleValueChange = async (value) => {
    //     try {
    //         setSelectedLevel(value);
    //         const userDocRef = doc(firestore, `users/user${user.UserId}`);
    //         await setDoc(userDocRef, { userLevel: value }, { merge: true });
    //         setSelectedLevelData(levelsData[value].subjects);

    //         toast.success('Level updated successfully');
    //     } catch (error) {
    //         toast.error('Error updating level in Firestore.');
    //         console.error('Error updating level:', error);
    //         throw error;
    //     }
    // };

    // Fetch user data on component mount
    useEffect(() => {
        if (selectedLevel) {
            setSelectedLevel(selectedLevel);
        } else if(user.userLevel){
            setSelectedLevel(user.userLevel);
        }else{
            setSelectedLevel('O-Level')   
        }

    }, [user.UserId]);
    const realUser = auth.currentUser

    const getRecentQuizes = async (user) => {
        const userDocRef = doc(firestore, `users/user${user.UserId}/quizzes-${user.userLevel}/results`);
        const snapshot = await getDoc(userDocRef);
        const existingData = snapshot.data()?.resultData || [];
    
        try {
            if (existingData.length === 0) {
                console.log('No quiz data found');
                return;
            }
    
            // Sort the quizzes by timestamp to get the most recent one
            existingData.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

            console.log(existingData)

            const threeMostRecent = existingData.filter((element,ind) => ind < 3);//or existingData.slice(0,3)
            setRecentQuizzes(threeMostRecent)

        } catch (error) {
            console.error('Error fetching recent quizzes:', error);
            toast.error('Error fetching recent quizzes');
        }
    };

    const handlePreviousQuiz = () => {
        if (currentQuizIndex > 0) {
          setCurrentQuizIndex(currentQuizIndex - 1);
        }
      };
    
      const handleNextQuiz = () => {
        if (currentQuizIndex < recentQuizzes.length - 1) {
          setCurrentQuizIndex(currentQuizIndex + 1);
        }
      };
    
    useEffect(() => {
        if (user?.UserId) {
            getRecentQuizes(user);
        }
    }, [user]);

    return (
        <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser} toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode}>
        <div className="profile-container  p-6 bg-gray-100 dark:bg-gray-900  shadow-md">


{/*----------------------------------------------------------first part-------------------------------------------------------------------  */}


            <div className=' py-5 px-6  lg:grid grid-cols-2 mb-10 section dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg'>
            <span>
            {/* Profile Picture and User Details */}
            <div className="user-details flex flex-col md:flex-row items-center md:space-x-8 mb-8 ">
                <div className="profile-picture-container relative mb-4 md:mb-0 ">
                    <img
                        className="profile-picture w-32 h-32 rounded-full shadow-lg border-4 border-blue-500 "
                        src={user.profilePic ? user.profilePic : profilePicture}
                        alt="Profile"
                        onClick={handleProfilePictureClick}
                    />
                    <div
                        className="edit-icon absolute bottom-0 right-0 bg-white hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                        onClick={openProfilePic}
                    >
                        <i className="fas fa-edit text-gray-800 hover:text-white px-2 py-2 rounded-full " />
                    </div>
                </div>
                <div className="user-info w-full md:w-auto">
                    <span className="flex  flex-col ">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Hi, {realUser.displayName}!</h2>
                        <p className="text-gray-600 dark:text-gray-400">Email: {realUser.email}</p>
                        <p className="text-gray-600 dark:text-gray-400">Leaderboard Position: {user.leaderboardPosition}</p>
                        <p className="text-gray-600 dark:text-gray-400">Grade: {user.userLevel}</p>
                    </span>
                </div>
            </div>

            {/* Profile Picture Update Modal */}
            {isPopupOpen && (
                <Modal
                    title="Update Profile Picture"
                    onClose={closePopup}
                    isOpen={isPopupOpen}
                >
                    <div className="crop-container relative h-64 w-full rounded-lg overflow-hidden">
                        <Cropper
                            image={profilePicture}
                            crop={crop}
                            zoom={zoom}
                            onCropChange={handleCropChange}
                            onZoomChange={handleZoomChange}
                            onCropComplete={onCropComplete}
                            aspect={1}
                        />
                    </div>
                    <div className="action-buttons flex justify-end                         space-x-4 mt-4">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            onClick={handleAddPic}
                        >
                            Add Picture
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                            onClick={handleRemovePic}
                        >
                            Remove Picture
                        </button>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </Modal>
            )}

            {/* View Full Image Popup */}
            {showOGPic && (
                <ViewFullImage
                    originalImage={profilePicture}
                    setShowOGPic={setShowOGPic}
                />
            )}

            
            </span>
            <span className='  flex-col items-end hidden lg:flex'>
                <h2 className= 'dark:text-gray-100 mb-6 text-2xl font-semibold text-gray-800 '>Badges & Achievements</h2>
                {/* Badges */}
                <div className='badges'>
                    <ul className='grid grid-cols-5 gap-6' >
                    {/* Badge 1 */}
                    {badges.map(badge=>( 
                        <Tooltip width={200} content={<p className='text-xs  text-gray-400 text-wrap '>{badge.description}</p>} position ='left' title={<p className='font-semibold text-xs break-words'>{badge.name}</p>} >
                            <li className='flex flex-col items-center'>
                                <span >
                                    <img className='w-[50px] h-[50px] rounded-full' src={badge.image} alt={badge.name} />  
                                </span>
                                
                                
                            </li>
                        </Tooltip>
                        ))}
                    </ul>
                </div>
            </span>
            </div>

{/* --------------------------------------------------second part----------------------------------------------------- */}


        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10  '>

        <div className="section dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="dark:text-gray-100 mb-6 text-2xl font-semibold text-gray-800 ">Recent Quizzes</h2>
      {recentQuizzes.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              className="disabled:opacity-50 bg-blue-600 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-900 transition duration-300 text-white font-bold py-2 px-4 rounded-full focus:outline-none"
              disabled={currentQuizIndex === 0}
              onClick={handlePreviousQuiz}
            >
              <i className="fa-solid fa-caret-left"></i>
            </button>

            <p className="text-lg text-gray-900 dark:text-gray-100 font-semibold capitalize">
              Quiz Mode: {recentQuizzes[currentQuizIndex].quizMode}
            </p>

            <button
              className="disabled:opacity-50 bg-blue-600 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-900 transition duration-300 text-white font-bold py-2 px-4 rounded-full focus:outline-none"
              disabled={currentQuizIndex === recentQuizzes.length - 1}
              onClick={handleNextQuiz}
            >
              <i className="fa-solid fa-caret-right"></i>
            </button>
          </div>
          <div className="p-6 bg-white dark:bg-gray-600 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <p className="text-gray-700 dark:text-gray-400">Score: {recentQuizzes[currentQuizIndex].score} / 50</p>
            <p className="text-gray-700 dark:text-gray-400">Date: {recentQuizzes[currentQuizIndex].timestamp.toDate().toDateString()}</p>
            <p className="text-gray-700 dark:text-gray-400">Time: {recentQuizzes[currentQuizIndex].timestamp.toDate().toLocaleTimeString()}</p>
          </div>
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No recent quizzes found.</p>
      )}
    </div>



            <UserGoals user={user} />
            {/* Achievements */}
            <Achievements userId={user.UserId}/>

            {/* User Goals */}

            {/* Feedback */}
            <div className="section dark:bg-gray-800 bg-gray-100 p-6 rounded-lg shadow-lg">
                <h2 className="dark:text-gray-100 mb-6 text-2xl font-semibold text-gray-800 ">Feedback & Reviews</h2>
                {feedback.length > 0 ? (
                    <ul className="space-y-4">
                        {feedback.map((feedbackItem) => (
                            <li key={feedbackItem.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                <p className="text-lg text-gray-800">{feedbackItem.message}</p>
                                <p className="text-gray-600">Date: {feedbackItem.date}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">Coming Soon...</p>
                )}
            </div>
        </div>

            <ToastContainer limit={1} progressStyle={{ backgroundColor: 'blue' }} position="top-right" className={'rounded-md'} autoClose={3000} />
        </div>
        </NavBar>
    );
}


