import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, firestore } from '../config';
import { collection, doc,getDoc,setDoc, updateDoc } from 'firebase/firestore';
import { verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword, updateProfile } from 'firebase/auth';
import CustomDropdown from '../components/newDropdown';
import Modal from '../components/modal';
import NavBar from '../components/NavBar';

const SettingsPage = ({setLoading,user,setUser,levels,setSelectedLevel,selectedLevel,setSelectedLevelData,levelsData,navBarData}) => {

useEffect(()=>{
  
},[selectedLevel])

  const [newEmail, setNewEmail] = useState('');
  const [showPopUp, setshowPopUp] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentSetting, setCurrentSetting] = useState('');
  
  const navigate=useNavigate()
  const realUser = auth.currentUser;

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

//   const changeEmail = async () => {
//     if (!newEmail) {
//       setError('Please enter a new email address.');
//       return;
//     }
//     console.log( auth.currentUser   )
//        updateEmail(auth.currentUser,newEmail).then(()=>{
//            setError(null);
//            setNewEmail('');
//            toast.success('Email address updated successfully!');

//        }).catch ((error)=>setError(error.message))
//   };
const signOut = async () => {
  try {
      await auth.signOut();
      setUser(null);
      navigate('/login');
  } catch (error) {
      console.error('Error signing out:', error);
  }
};

const askPassword = () => {
  setshowPopUp(true)
  setCurrentPassword('');
}
const clearEverything = () => {
  setshowPopUp(false)
  setError(null);
  setCurrentPassword('')
  setPasswordVisible(false)
  setNewEmail('');
}

const VerifyPassword = () => {
  setError(null)
  if(currentPassword !== '' && currentPassword ){
    if(currentSetting === 'change-email'){
      setshowPopUp(false)
      changeEmail();
    }else if(currentSetting === 'change-password'){
      setshowPopUp(false)
      changePassword();
    }
    else if(currentSetting === 'change-username'){
      setshowPopUp(false)
      resetUsername();
    }

  }else{
    setError('Please enter your current password.');
  }
}

const changeEmail = async () => {
  if (!newEmail) {
    setError('Please enter a new email address.');
    return;
  }

  try {
    // Create credential object with current password (replace with secure input)
    const passwordCredential = EmailAuthProvider.credential(realUser.email, currentPassword);

    // Re-authenticate the user
    await reauthenticateWithCredential(realUser, passwordCredential);
    // Update the user's email address
    await verifyBeforeUpdateEmail(realUser, newEmail);
    toast.info('A verification email has been sent to your new email address.');
    const userRef = firestore.collection('users').doc(realUser.uid);
    // Update the user's email in firestore
    if(realUser.email !== user.Email)
      await userRef.update({
            email: newEmail,
    });
    // Update the user's email in firestore
    
  } catch (error) {
    console.error('Error changing email:', error);
    const errorMessage = handleError(error); // Implement error handling logic (optional)
    setError(errorMessage);
  }
};

// Optional function to handle different error types and return user-friendly messages
function handleError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'The new email address is already in use.';
    case 'auth/network-request-failed':
      return 'There was a network error. Please try again later.';
    case 'auth/invalid-credential':
      return 'Invalid Password. Please try again.';
    default:
      return 'Error changing email. Please try again.';
  }
}
  
  
  
  

  const changePassword = async () => {
    if (!newPassword) {
      setError('Please enter a valid password.');
      return;
    }

    try {
      const passwordCredential = EmailAuthProvider.credential(realUser.email, currentPassword);
      await reauthenticateWithCredential(realUser, passwordCredential);
      await updatePassword(realUser,newPassword);
      setError(null);
      setNewPassword('');
      toast.success('Password updated successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  // Implement password reset functionality (assuming separate component)
  const handleResetPassword = () => {
    // Handle password reset logic (e.g., send reset email)
    // You can display a modal or redirect to a password reset page
  };

  const resetUsername = async () => {
    if (!newUsername) {
      setError('Please enter a new username.');
      return;
    }

      const userID = `user${auth.currentUser.uid}`;
      const docRef = doc(firestore, 'users', userID);
    try {
      await updateProfile(realUser,{displayName:newUsername})
      await updateDoc(docRef,{ FullName: newUsername });
      setError(null);
      setNewUsername('');
      toast.success('Username updated successfully!');
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);

    const userRef = firestore.collection('users').doc(auth.currentUser.uid);
    userRef.update({ emailNotifications: !emailNotifications }).catch((error) => {
      setError(error.message);
    });
  };

  const sendSupportMessage = () => {
    // Use a backend service (e.g., email service) to send the support message
    // Display a confirmation message to the user
    // Clear the support message input field
    toast.success('Message sent successfully!')
    setSupportMessage('');
  };
  const refreshUser= async ()=>{
  try{
      const userID = `user${auth.currentUser.uid}`;
      const docRef = doc(firestore, 'users', userID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists) {
        setUser(docSnap.data());
      } else {
        console.error('Error fetching updated user data');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      toast.error('Error updating user details');
    }
  };

   // Handle level selection change
   const handleValueChange = async (value) => {
    try {
        setSelectedLevel(value);
        const userDocRef = doc(firestore, `users/user${user.UserId}`);
        await setDoc(userDocRef, { userLevel: value }, { merge: true });
        setSelectedLevelData(levelsData[value].subjects);
        // Update user data in state
        refreshUser();

        // Show success toast

        toast.success('Level updated successfully');
    } catch (error) {
        toast.error('Error updating level in Firestore.');
        console.error('Error updating level:', error);
        throw error;
    }
};

// Fetch user data on component mount
useEffect(() => {
    if (selectedLevel) {
        setSelectedLevel(selectedLevel);
    } else if(user.userLevel){
        setSelectedLevel(user.userLevel);
    }else{
        setSelectedLevel('O-Level')   
    }
    setError(null)
}, [user.UserId]);


  return (
    <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser}  toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode}>

    <div className="profile-container custom-scroll-bar mt-[60px] md:mt-12 mx-auto max-w-screen-xl p-6 pb-28 md:pb-20 bg-gray-100 dark:bg-gray-900 max-h-screen overflow-x-auto no-scroll-bar h-screen shadow-md">
      <h2 className="text-4xl font-semibold text-gray-800 mb-8 dark:text-white">Settings</h2>
                  {/* Level Selection Dropdown */}
            <p className='mb-2'>Change your Level</p>
            <div className="mb-4">
                <CustomDropdown
                    name="Level"
                    values={levels}
                    selectedValue={selectedLevel}
                    handleValueChange={handleValueChange}
                />
            </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
            {/* Change Email */}
            <div className="mb-4">
        <label className="block mb-1 dark:text-gray-400">Change Email:</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-3 w-full"
        />
        <button onClick={()=>{askPassword() ; setCurrentSetting('change-email') }} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Change Email
        </button>
      </div>

      {/* Change Password */}
      <div className="mb-4">
        <label className="block mb-1 dark:text-gray-400">Change Password:</label>
        <div className='relative'>
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border border-gray-300 rounded-md py-2 px-3 w-full"
          />
          <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 px-3 py-2"
              >
                <i className={`fa-solid ${passwordVisible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
              </button>
        
        </div>
        <button onClick={()=>{askPassword() ; setCurrentSetting('change-password') }} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Change Password
        </button>
      </div>

      {/* Reset Username */}
      <div className="mb-4">
        <label className="block mb-1 dark:text-gray-400">Reset Username:</label>
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="border border-gray-300 rounded-md py-2 px-3 w-full"
        />
        <button onClick={()=>{askPassword() ; setCurrentSetting('change-username') }} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Reset Username
        </button>
      </div>

      {/* Contact Support */}
      <div>
        <label className="block mb-1 dark:text-gray-400">Contact Support:</label>
        <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} className="border border-gray-300 rounded-md py-2 px-3 w-full h-24"></textarea>
        <button onClick={sendSupportMessage} className="mt-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600">
          Send Message
        </button>
      </div>


      <Modal isOpen={showPopUp} onClose={clearEverything} title={'Verify User'} >
        <div className="">
          <p className="text-gray-600">Please enter your current password to permit us to know it is really you making these changes.</p>
          <label className=" mb-1 dark:text-gray-400 hidden">Enter Your Current Password:</label>
          <div className="relative pt-4">
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="border border-gray-300 rounded-md py-2 px-3 w-full pr-10"
              placeholder='Please enter your password'
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-0 h-10
              "
            >
            <span className='flex items-center justify-center h-full mr-4 text-gray-400'>{passwordVisible ? 'Hide' : 'Show'}</span>
            </button>
          </div>
        </div>
        <button onClick={VerifyPassword} className="bg-blue-500 text-white py-2 px-4 mt-4 rounded-md hover:bg-blue-600">
          Verify
        </button>
      </Modal>

      <ToastContainer limit={1} progressStyle={{ backgroundColor: 'blue' }} position="top-right" className={'rounded-md'} autoClose={3000} />
    </div>
    </NavBar>
  );
};

export default SettingsPage;
