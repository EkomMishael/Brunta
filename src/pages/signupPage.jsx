import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword,onAuthStateChanged,updateProfile } from "firebase/auth";
import { firestore } from "../config";
import { doc, setDoc } from "firebase/firestore";
import CustomDropdown from "../components/newDropdown";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignupPage({realUser}) {
  const [email, setEmail] = useState("");
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [Level, setLevel] = useState(""); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault();
    if (Level == ""){
      setError("Please select a level")
      } else if (email == "") {
        setError("Please enter an email")
        } else if (password == "") {
          setError("Please enter a password")
          } else if (fullname == "") {
            setError("Please enter a fullname") 
    }else{
    setError("");
    setLoading(true);

    try {
      const auth = getAuth();
      await createUserWithEmailAndPassword(auth, email, password);
        onAuthStateChanged(auth,(user) => {
          if (user && Level !== '' ) {
            const uid=user.uid
            updateProfile(auth.currentUser, {
              displayName: fullname, 
            }).then(() => {
              toast.success('User profile updated successfully ')
            }).catch((error) => {
              toast.error('Failed to update user profile')
            });
            saveUserInfoToFirestore(uid,fullname,Level);
            console.log(user)
          } else {
              console.log('User is signed out')
              toast.error('Please select a user Level ')
              auth.signOut()
              return;
          }
        });


      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      console.log(error)
      setError(error.message);
    }}
  };
  async function saveUserInfoToFirestore(Uid,fullName,Level){
    const docRef= String(`user${Uid}`)
    await setDoc(doc(firestore, "users",docRef), {
      UserId:Uid,
      FullName: fullName,
      userLevel: Level,
    },{merge:true})
    .then(() => {
        console.log('User information saved to Firestore');
        
    })
    .catch((error) => {
        console.error('Error saving user information to Firestore:', error);
    });
};
useEffect(()=>{
  if(realUser !== null){
    console.log(realUser)
    navigate('/dashboard')
  }
},[])
  return (
    <main className="bg-gradient-to-b from-blue-400 to-purple-400 w-full h-screen flex justify-center items-center" >
      <form className="bg-white rounded-lg shadow-lg p-6 min-h-[40%] min-w-[40%] flex flex-col items-center mt-4 mb-4 overflow-x-scroll custom-scroll-bar" onSubmit={handleSignup} style={{'max-height': '-webkit-fill-available'}}>
        <div className="w-full mt-2 mb-4">
        <span className="w-full    flex flex-row justify-end items-center ">
            <span className="flex flex-row items-center justify-center" onClick={()=>navigate(-1)}>

            <i class="fa-solid fa-caret-left  text-purple-400" ></i>
            <p className="text-purple-400 text-sm"> Back</p>
            </span>
            
          </span>
          <h3 className="text-2xl font-bold text-purple-400">Sign Up</h3>
          <p className="text-[.76rem] text-gray-400 font-bold">Fill in your details</p>
        </div>

        <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm">Fullname</h4>
          <input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            className="rounded-md border-2 text-xs py-1 px-2 w-full mt-2 focus:border-purple-400 focus:outline-none"
            placeholder="Your firstname..."
          />
        </div>

        {/* <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm">Username</h4>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-md border-2 text-xs py-1 px-2 w-full mt-2 focus:border-purple-400 focus:outline-none"
            placeholder="Your username..."
          />
        </div> */}

        <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm">Email</h4>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-md border-2 text-xs py-1 px-2 w-full mt-2 focus:border-purple-400 focus:outline-none"
            placeholder="Your Email..."
          />
        </div>

        <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm">Password</h4>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-md border-2 text-xs py-1 px-2 w-full mt-2 focus:border-purple-400 focus:outline-none"
            placeholder="Your password..."
          />
        </div>

        <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm">Level</h4>
          <CustomDropdown name={'Level'} values={['A-Level','O-Level']} selectedValue={Level} handleValueChange={setLevel} color="bg-gradient-to-r from-purple-400 to-blue-400"/>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          className="w-full text-white text-sm bg-gradient-to-r from-purple-400 to-blue-400 rounded-md py-1 px-4 mt-8 font-bold active:ring-2 active:ring-blue-200"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <br />
        <p>
          Already have an account?{" "}
          <span className="text-purple-400 font-bold">
            <Link to="/login">Login</Link>
          </span>
        </p>
      </form>
    <ToastContainer limit={1} progressStyle={{ backgroundColor: 'blue' }} position="top-right" className={'rounded-md'} autoClose={3000} />
    </main>
   
  );
}

export default SignupPage;
