import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config"; // Import Firebase auth
import { signInWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth and signInWithEmailAndPassword


function LoginPage({setLoad, realUser}) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading1, setLoading1] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading1(true);
      // Sign in the user with email and password
      const userCred=await signInWithEmailAndPassword(auth, email, password);
      // User signed in successfully
      if(userCred.user){setLoad();navigate("/dashboard");} // Redirect to dashboard after login
    } catch (error) {
      setError("Invalid email or password"); // Display error message
      console.error("Error signing in:", error);
    } finally {
      setLoading1(false);
      
    }
  };
  useEffect(()=>{
    if(realUser !== null){
      navigate('/dashboard')
    }},[])

  return (
    <main className="bg-gradient-to-b from-blue-400 to-purple-400 w-full h-screen flex justify-center items-center">
      <form
        className="bg-white rounded-lg shadow-lg p-6 min-h-[40%] min-w-[40%] flex flex-col items-center"
        onSubmit={handleLogin}
      >
        <div className="w-full mt-2 mb-4">
          <span className="w-full    flex flex-row justify-end items-center ">
            <span className="flex flex-row items-center justify-center" onClick={()=>navigate(-1)}>

            <i class="fa-solid fa-caret-left  text-purple-400" ></i>
            <p className="text-purple-400 text-sm"> Back</p>
            </span>
            
          </span>
          <h3 className="text-2xl font-bold text-purple-400">Log In</h3>
          <p className="text-[.76rem] text-gray-400 font-bold">
            Enter your credentials
          </p>
        </div>

        <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm">Email</h4>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            required
            className="rounded-md border-2 text-xs py-1 px-2 w-full mt-2  focus:border-purple-400 focus:outline-none"
            placeholder="Your Email..."
          />
        </div>

        <div className="w-full mb-4">
          <h4 className="text-purple-400 font-bold text-sm ">Password</h4>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            required
            className="rounded-md border-2 border-slate-200 text-xs py-1 px-2 w-full mt-2 focus:border-purple-400 focus:outline-none"
            type="password"
            placeholder="Your password..."
          />
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <button
          className="w-full border-2 text-white text-sm bg-gradient-to-r from-purple-400 to-blue-400 rounded-md py-1 px-4 mt-8 font-bold active:ring-2 focus:border-purple-400 focus:outline-none active:ring-blue-200"
          type="submit"
          disabled={loading1} // Disable button during loading state
        >
          {loading1 ? "Logging in..." : "Log In"}
        </button>
        <br></br>
        <p>
          Don't have an account?{" "}
          <span className="text-purple-400 font-bold">
            <Link to="/signup">Sign Up</Link>
          </span>
        </p>
      </form>
    </main>
  );
}

export default LoginPage;
