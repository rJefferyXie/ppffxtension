import "../styles/userProfile.css";

import { useState, useEffect } from 'react';
import { encryptData, decryptData } from "../utils/encryption";

import { TextField, Button, Checkbox, Alert, Snackbar } from "@mui/material";

import Navbar from "./navbar";
import AboutSection from "./aboutSection";
import ResumeSection from "./resumeSection";

interface UserProfileInterface {
  hideUserProfile: Function,
  setPassword: Function,
  password: string,
  setIsAuthenticated: Function,
  isAuthenticated: boolean,
}

const UserProfile = (props: React.PropsWithChildren<UserProfileInterface>) => {
  const { hideUserProfile, setPassword, password, isAuthenticated, setIsAuthenticated } = props;

  const [name, setName] = useState(localStorage.getItem('name') || '');
  const [passwordHelpText, setPasswordHelpText] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState("About");
  const [dataExists, setDataExists] = useState<boolean>(false);

  const createProfile = () => {
    if (passwordHelpText !== "Your password is secure.") {
      console.log(passwordHelpText);
      return;
    }

    if (!name) {
      console.log("Please enter your name.");
      return;
    }

    const encryptedName = encryptData(name, password);
    localStorage.setItem("name", encryptedName);
    setDataExists(true);
    setIsAuthenticated(true);
  }

  const login = () => {
    const decryptedName = decryptData(name, password);
    if (decryptedName) {
      setDataExists(true);
      setIsAuthenticated(true);
      return;
    }
  }

  const resetProfile = () => {
    localStorage.removeItem("name");
    localStorage.removeItem("location");
    setName("");
    setPassword("");
    setDataExists(false);
    setIsAuthenticated(false);
  }

  useEffect(() => {
    if (localStorage.getItem("name") || localStorage.getItem("location")) {
      setDataExists(true);
    }
  }, []);

  useEffect(() => {
    const isPasswordSecure = () => {
      const minLength = 8;
      const hasUpperCase = /[A-Z]/;
      const hasLowerCase = /[a-z]/;
      const hasNumber = /\d/;
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

      if (password.length < minLength) {
        return "Password must be at least 8 characters long.";
      }

      if (!hasUpperCase.test(password)) {
        return "Password must include at least one uppercase letter.";
      }

      if (!hasLowerCase.test(password)) {
        return "Password must include at least one lowercase letter.";
      }

      if (!hasNumber.test(password)) {
        return "Password must include at least one number.";
      }

      if (!hasSpecialChar.test(password)) {
        return "Password must include at least one special character.";
      }

      return "Your password is secure.";
    }    

    setPasswordHelpText(isPasswordSecure);
  }, [password]);
    
  return (
    <div className="overlay">
      <div className="profile-container">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isAuthenticated={isAuthenticated} hideUserProfile={hideUserProfile}></Navbar>

        {!isAuthenticated &&
          <div className="section-container">
            <div className="section-header">
              <h3 className="section-text">
                {dataExists ? 'Log In' : 'Profile Creation'}
              </h3>

              <p className="section-text">
                {dataExists ? 'Please enter your password to access your profile.' : 'Please enter your name and a secure password in order to create a profile.'}
              </p>
            </div>

            <div className="wrapper">
              {dataExists ? 
                <div>
                  <TextField
                    className="account-input-field"
                    label="Password"
                    placeholder="Enter your password..."
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <div className="login-wrapper">
                    <Button 
                      className="add-button" 
                      variant="outlined" 
                      onClick={login}
                    >
                      Log In
                    </Button>

                    <Button
                      className="exit-cv-button"
                      variant="outlined"
                      color="error"
                      onClick={resetProfile}
                    >
                      Reset Profile
                    </Button>
                    
                    <p>Enter yor password to access your profile. If you forgot it, you will have to reset your profile.</p>
                  </div>
                </div> :
                <div className="profile-wrapper">
                  <div className="profile-input-wrapper">
                    <TextField 
                      className="account-input-field"
                      multiline
                      label="Name"
                      placeholder="First and Last Name..."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    
                    <div className="password-wrapper">
                      <div className="password-input-wrapper">
                        <TextField
                          className="account-input-field"
                          label="Password"
                          placeholder="Enter your password..."
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />

                        <p className="show-password-text">Show Password</p>
                        <Checkbox onClick={() => setShowPassword(!showPassword)}/>
                      </div>

                      <p className="password-help-text">{passwordHelpText}</p>
                    </div>
                  </div>

                  <div className="profile-create-wrapper">
                    <Button 
                      className="add-button" 
                      variant="outlined" 
                      onClick={createProfile}
                    >
                      Create Profile
                    </Button>
                    
                    <p>Please remember your password in order to access your profile in the future. If you forget it, you will have to reset your profile.</p>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        {isAuthenticated &&
          <div className="section-container">
            <div className="section-header">
              <h3 className="section-text">
                {activeTab}
              </h3>

              <p className="section-text">
                {activeTab === 'About' && "This information will be used to personalize cover letters."} 
                {activeTab === 'Resume' && "Work experience, skills, and achievements that are relevant to the job description will be included in cover letters."}
              </p>
            </div>

            <div className="wrapper">
              {activeTab === "About" && <AboutSection password={password}/>}
              {activeTab === 'Resume' && <ResumeSection password={password}/>}
            </div>
          </div>        
        }
      </div>
    </div>
  )
}

export default UserProfile;