import "../styles/userProfile.css";

import { useState } from 'react';

import Navbar from "./navbar";
import AboutSection from "./aboutSection";
import ResumeSection from "./resumeSection";

interface UserProfileInterface {
  hideUserProfile: Function
}

const UserProfile = (props: React.PropsWithChildren<UserProfileInterface>) => {  
  const [activeTab, setActiveTab] = useState("Resume");

  const { hideUserProfile } = props;
    
  return (
    <div className="overlay">
      <div className="profile-container">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} hideUserProfile={hideUserProfile}></Navbar>

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
            {activeTab === "About" && <AboutSection/>}
            {activeTab === 'Resume' && <ResumeSection/>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile;