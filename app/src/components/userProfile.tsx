import "../styles/userProfile.css";

import { useState, useEffect } from 'react';
import { encryptData, decryptData } from "../utils/encryption";

import { TextField, Button, Alert, Snackbar, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton } from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarText, setSnackbarText] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [activeTab, setActiveTab] = useState("About");
  const [dataExists, setDataExists] = useState<boolean>(false);

  const closeSnackbar = () => {
    setShowSnackbar(false);
    setSnackbarText('');
  }

  const createProfile = () => {
    if (passwordHelpText !== "Your password is secure.") {
      setSnackbarSeverity("error");
      setSnackbarText(passwordHelpText);
      setShowSnackbar(true);
      return;
    }

    if (!name) {
      setSnackbarSeverity("error");
      setSnackbarText("Please enter your name.");
      setShowSnackbar(true);
      return;
    }

    const encryptedName = encryptData(name, password);
    localStorage.setItem("name", encryptedName);
    setDataExists(true);
    setIsAuthenticated(true);

    setSnackbarSeverity("success");
    setSnackbarText("Your profile was successfully created.");
    setShowSnackbar(true);
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
    localStorage.removeItem("education");
    localStorage.removeItem("certificates");
    localStorage.removeItem("workExperiences");
    localStorage.removeItem("projects");
    localStorage.removeItem("skills");

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

        <Snackbar open={showSnackbar} onClose={closeSnackbar} autoHideDuration={6000}>
          <Alert severity={snackbarSeverity === "success" ? "success" : "error"}>{snackbarText}</Alert>
        </Snackbar>

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
                <div className="profile-wrapper">
                  <FormControl className="account-input-field" variant="outlined">
                    <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-password"
                      type={showPassword ? 'text' : 'password'}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showPassword ? 'hide the password' : 'display the password'
                            }
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                      placeholder="Enter your password..."
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </FormControl>

                  <div className="login-wrapper">
                    <Button 
                      className="add-button" 
                      variant="outlined" 
                      onClick={login}
                    >
                      Log In
                    </Button>
                    
                    <p className="password-help-text">
                      Enter your password to access your profile. 
                    </p>

                    <p className="reset-profile-text">
                      If you forgot it, you will have to reset your profile.
                    </p>

                    <Button
                      className="add-button"
                      variant="outlined"
                      color="error"
                      onClick={resetProfile}
                    >
                      Reset Profile
                    </Button>
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
                    
                    <FormControl className="account-input-field" variant="outlined">
                      <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-password"
                        type={showPassword ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showPassword ? 'hide the password' : 'display the password'
                              }
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                        placeholder="Enter your password..."
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </FormControl>

                    <p 
                      className="password-help-text"
                      style={{color: passwordHelpText === "Your password is secure." ? "blue" : "red"}}
                    >
                      {passwordHelpText}
                    </p>
                  </div>

                  <div className="profile-create-wrapper">
                    <Button 
                      className="add-button" 
                      variant="outlined" 
                      onClick={createProfile}
                    >
                      Create Profile
                    </Button>
                    
                    <p>
                      Please remember your password in order to access your profile in the future. 
                      <br></br>
                      If you forget it, you will have to reset your profile.
                    </p>
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