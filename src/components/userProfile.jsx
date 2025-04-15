import { useState } from "react";
import profilePic from "../assets/default-pfp.jpg";
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage'; // Import crop image utility
import ViewFullImage from "./viewFullImage";

import { firestore } from '../config'; // Import Firebase firestore
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

import { storage } from '../config';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import NavBar from "./NavBar";

export default function UserProfile({ navBarData }) {
    const [originalImage, setOriginalImage] = useState(profilePic); // State for the full image in its original dimensions
    const [profilePicture, setProfilePicture] = useState(profilePic); // State for the cropped image
    const [uploadedImage, setUploadedImage] = useState(null); // State for the current image being worked on in the popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [crop, setCrop] = useState({ x : 0, y : 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showOGPic, setShowOGPic] = useState(false); // State to control the display of the original image popup



    
    // Handle opening and closing the profile picture update popup
    const openProfilePic = () => setIsPopupOpen(true);
    const closePopup = () => {
        setIsPopupOpen(false);
        setUploadedImage(null);
    };

    // Handle cropping
    const handleCropChange = (newCrop) => {
        if (newCrop && newCrop.x !== undefined && newCrop.y !== undefined) {
            setCrop(newCrop);
        }
    };
    const handleZoomChange = (zoom) => setZoom(zoom);

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropImage = async () => {
        if (croppedAreaPixels) {
            const croppedImage = await getCroppedImg(uploadedImage || originalImage, croppedAreaPixels);
            setUploadedImage(croppedImage);
            setOriginalImage()
        }
    };

    // Add a new profile picture
    const handleAddPic = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const result = e.target.result;
                    
                    // Save the full original image
                    setOriginalImage(result);
                    // Save the uploaded image
                    setUploadedImage(result);
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    };
  
    const uploadCroppedImage = async (croppedImageBlob) => {
        try {
          // Initialize Firebase Storage (assuming you have it configured)
      
          // Create a unique filename using Date.now()
          const filename = `profile_pic-${Date.now()}.jpeg`;
      
          // Create a reference to the storage location
          const storageRef = ref(storage, `profile/${filename}`);
      
          // Upload the cropped image Blob to Firebase Storage
          await uploadBytes(storageRef, croppedImageBlob);
      
          // Get the download URL for the uploaded image
          const downloadUrl = await getDownloadURL(storageRef);
      
          console.log('Uploaded cropped image:', downloadUrl);
          return downloadUrl; // Return the download URL for further use
        } catch (error) {
          console.error('Error uploading image to Firebase Storage:', error);
          throw error; // Re-throw the error for handling in the calling function
        }
      };

const updateProfilePicture = async (userId, downloadUrl) => {
  try {
    // Access your Firestore reference (replace with your specific setup)
        const docRef= String(`user${userId}`)
    await setDoc(doc(firestore, "users",docRef), {
        profilePic: downloadUrl
    },{merge:true}); // Get your Firestore reference

    // Update the user's profile picture field
    
    console.log('Profile picture updated successfully in Firestore.');
  } catch (error) {
    console.error('Error updating profile picture in Firestore:', error);
    throw error; // Re-throw the error for handling in the calling function
  }
};
    // Save the final picture based on whether it was cropped
    const handleSave = async () => {
        if (croppedAreaPixels) {
            // Crop the image and save it
            const croppedImage = await getCroppedImg(uploadedImage || originalImage, croppedAreaPixels);
            const croppedImageBlob = await getCroppedImg(uploadedImage, croppedAreaPixels);
            console.log(croppedImage,'yoooooooooooooooooo',croppedImageBlob)
            try {
              const downloadUrl = await uploadCroppedImage(croppedImageBlob);
              await updateProfilePicture(navBarData.user.UserId, downloadUrl);
                console.log(downloadUrl,'Download URL')
              // Update profile picture state and display success message
              setProfilePicture(downloadUrl);
              console.log('Saved cropped image and updated profile picture in Firestore.');
              window.location.reload();
            } catch (error) {
              console.error('Error saving and updating image:', error);
              // Handle errors appropriately, e.g., display error message to user
            }
        } else if (uploadedImage) {
            // Save the uploaded image without cropping
            setProfilePicture(uploadedImage);
        }
        closePopup();
    };

    // Remove the current profile picture
    const handleRemovePic = () => {
        setProfilePicture(profilePic);
        setOriginalImage(profilePic);
        closePopup();
    };

    return (
            <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser} toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode} >
                <div className="p-4 max-w-screen-xl mx-auto">
                    <h1 className="text-2xl font-bold mb-4">User Profile</h1>
                    
                    <div className="flex flex-row items-center space-x-4">
                        <div className="relative">
                            <img
                                className="w-14 h-14 rounded-full"
                                src={navBarData.user.profilePic ? navBarData.user.profilePic : profilePicture }
                                alt="Profile"
                                onClick={() => setShowOGPic(true)}
                            />
                            <div
                                className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-blue-400 flex items-center justify-center hover:cursor-pointer"
                                onClick={openProfilePic}
                            >
                                <i className="fas fa-plus text-white text-xs"></i>
                            </div>
                        </div>
                        <div>
                            <h2>Username: {navBarData.user.FullName}</h2>
                            <h2>Email: {navBarData.user.Email}</h2>
                            <h2>Status: {navBarData.user.status}</h2>
                        </div>
                    </div>

                    {/* Popup for profile picture update */}
                    {isPopupOpen && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50 w-screen">
                            <div className="bg-white p-6 rounded-md shadow-lg">
                                <span className="flex justify-between">
                                    <h3 className="text-xl font-bold mb-4 text-slate-400">Update Profile Picture</h3>
                                    <i className="fa-xmark fa-solid text-black" onClick={closePopup}></i>
                                </span>
                                <div className="flex flex-col items-center mb-4">
                                    <div className="w-64 h-64 relative">
                                    <Cropper
                                        image={uploadedImage || (navBarData.user.profilePic ? navBarData.user.profilePic : profilePic)}
                                        crop={crop}
                                        zoom={zoom}
                                        aspect={1}
                                        onCropChange={handleCropChange}
                                        onZoomChange={handleZoomChange}
                                        onCropComplete={onCropComplete}
                                    />
                                    </div>
                                    <div className="space-x-2 mt-4">
                                        <i
                                            className="fa-regular fa-image py-2 px-4 bg-blue-400 text-white rounded-md hover:bg-blue-500"
                                            onClick={handleAddPic}
                                        >
                                        </i>
                                        <i
                                            className="fa-regular fa-trash-can py-2 px-4 bg-red-400 text-white rounded-md hover:bg-red-500"
                                            onClick={handleRemovePic}
                                        >
                                            
                                        </i>
                                        <i
                                            className=" fa-solid fa-crop-simple py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                                            onClick={handleCropImage}
                                        >
                                        </i>
                                        <i
                                            className=" fa-solid fa-check py-2 px-4 bg-green-400 text-white rounded-md hover:bg-green-500"
                                            onClick={handleSave}
                                        >
                                            
                                        </i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quiz Selection Form */}
                    <div className="mt-6">
                        <h2 className="text-xl font-bold mb-4">Start a Quiz</h2>
                        <div className="mb-4">
                            <label htmlFor="level" className="block font-semibold">Select Level:</label>
                            <select id="level" className="mt-2 p-2 border border-gray-300 rounded">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="subject" className="block font-semibold">Select Subject:</label>
                            <select id="subject" className="mt-2 p-2 border border-gray-300 rounded">
                                <option value="math">Math</option>
                                <option value="science">Science</option>
                                <option value="history">History</option>
                                <option value="language">Language</option>
                            </select>
                        </div>
                        <button className="py-2 px-4 bg-blue-400 text-white rounded-md hover:bg-blue-500">
                            Start Count-Down Exam
                        </button>
                        <button className="py-2 px-4 bg-green-400 text-white rounded-md hover:bg-green-500 ml-2">
                            Start At-Your-Pace Test
                        </button>
                        <button className="py-2 px-4 bg-red-400 text-white rounded-md hover:bg-red-500 ml-2">
                            Start Versus Mode
                        </button>
                    </div>

                    {/* Popup for original image */}
                    {showOGPic && 
                        <ViewFullImage originalImage={navBarData.user.profilePic ? navBarData.user.profilePic : profilePic} setShowOGPic={setShowOGPic} />
                    }
                </div>
            </NavBar>
    );
}
