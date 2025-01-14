import React, { useState, useContext } from "react";
import { Button, Link } from "@nextui-org/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Context } from "../../main";
import GoogleIcon from './../../images/authGoogle.svg';
import video from './../video/12788303_1920_1080_30fps.mp4';
import './styleLogin.scss';

const Auth = () => {
  const [type, setType] = useState("login");
  const { auth } = useContext(Context);

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      // Handle successful login here
    } catch (error) {
      console.error("Google login error:", error);
      // Handle error here
    }
  };

  const toggleAuthType = () => {
    setType(prevType => prevType === 'login' ? 'register' : 'login');
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Video */}
      <video 
        src={video} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        autoPlay 
        loop 
        muted 
      />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md px-6 py-8">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome
            </h1>
            <p className="text-gray-300">
              Create your account to get started
            </p>
          </div>

          {/* Auth Container */}
          <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">
              {type === "login" ? "Log In" : "Sign Up"}
            </h2>

            {/* Google Login Button */}
            <Button
              variant="bordered"
              onClick={handleGoogleLogin}
              className="w-full bg-white/20 hover:bg-white/30 transition-all duration-300 py-6 mb-6"
            >
              <img 
                src={GoogleIcon} 
                alt="Google Icon" 
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </Button>

            {/* Auth Toggle Link */}
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                {type === "login" 
                  ? "Don't have an account?" 
                  : "Already have an account?"}
              </p>
              <Link
                href="#"
                onClick={toggleAuthType}
                className="text-white hover:text-blue-400 transition-colors duration-300 text-lg font-medium"
              >
                {type === "login" ? "Sign Up" : "Sign In"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;