import "../styles/userProfile.css";

import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

import Navbar from "./navbar";
import AboutSection from "./aboutSection";
import SkillsSection from "./skillsSection";
import ExperienceSection from "./experienceSection";

interface UserProfileInterface {
  hideUserProfile: Function
}

const UserProfile = (props: React.PropsWithChildren<UserProfileInterface>) => {
  const { hideUserProfile } = props;
  
  const [activeTab, setActiveTab] = useState("Work Experience");
  // const [coverLetterText, setCoverLetterText] = useState('');
    
  return (
    <div className="overlay">
      <div className="profile-container">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab}></Navbar>

        <div className="section-container">
          <div className="section-header">
            <h3 className="section-text">
              {activeTab}
            </h3>

            <p className="section-text">
              {activeTab === 'About' && "This information will be used to personalize cover letters."} 
              {activeTab === 'Skills' && "Skills will be matched with job descriptions to assess fit and personalize cover letters."} 
              {activeTab === 'Work Experience' && "Work experience and achievements that are relevant to the job description will be included in cover letters."}
            </p>
          </div>

          <div className="wrapper">
            {activeTab === "About" && <AboutSection/>}
            {activeTab === "Skills" && <SkillsSection/>}
            {activeTab === 'Work Experience' && <ExperienceSection/>}
          </div>

          {/* <button 
            className="exit-profile-button"
            onClick={() => hideUserProfile()}
          >
            Exit Profile
          </button> */}
        </div>
      </div>
    </div>
  )
}

export default UserProfile;