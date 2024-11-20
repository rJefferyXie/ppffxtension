import "../styles/userProfile.css";

import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import Navbar from "./navbar";

interface UserProfileInterface {
  hideUserProfile: Function
}

const UserProfile = (props: React.PropsWithChildren<UserProfileInterface>) => {
  const { hideUserProfile } = props;
  
  const [activeTab, setActiveTab] = useState("About");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  
  useEffect(() => {
    const keywords = [
      "Python", 
      "JavaScript", 
      "AWS", 
      "Machine Learning", 
      "Node.js",
      "Angular",
      "SQL"
    ];

    // Load existing skills
    const loadSkills = () => {
      const result = localStorage.getItem("userInfo")
      
      let skills = JSON.parse(result || '[]');
      if (skills.length === 0) {
        skills = keywords;
        localStorage.setItem("userInfo", JSON.stringify(skills));
      }
    
      setSkills(skills);
    };

    loadSkills();
  }, []);

  const clearSkills = () => {
    localStorage.removeItem('userInfo');
    setSkills([]);
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = [...skills];
      if (!currentSkills.includes(skillInput)) {
        currentSkills.push(skillInput);
        localStorage.setItem("userInfo", JSON.stringify(currentSkills));
        setSkills(currentSkills);
      }

      setSkillInput('');
    }
  }
    
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
              {
                activeTab === 'About' ? "This information will be used to personalize cover letters." :
                activeTab === 'Skills' ? "Skills will be matched with job descriptions to assess fit and personalize cover letters." :
                "Work experience and achievements that are relevant to the job description will be included in cover letters."
               }
            </p>
          </div>

          <div className="wrapper">
            {activeTab === "About" && 
              <div className="about-section">
                <h3>ABOUT</h3>

                <div className="input-container">
                  <h4 className="input-header">Name - </h4>
                  <input placeholder="First and Last Name..."></input>
                </div>
                
                <div className="input-container">
                  <h4 className="input-header">Location - </h4>
                  <input placeholder="City, Province / State..."></input>
                </div>

                <div className="input-container">
                  <h4 className="input-header">Email Address - </h4>
                  <input placeholder="Your Email Address..."></input>
                </div>

                <div className="education-container">
                  <h3>EDUCATION</h3>

                  <div className="input-container">
                    <h4 className="input-header">Degree Title - </h4>
                    <input placeholder="Diploma / Degree..."></input>
                  </div>

                  <div className="input-container">
                    <h4 className="input-header">School / University - </h4>
                    <input placeholder="School / University..."></input>
                  </div>
                </div>

                <div>
                  <h3>CERTIFICATES</h3>
                </div>
              </div>
            }
        </div>

          {/* 

          <div className="skills-section">
            <h2
              className="skills-title"
              title="Skills will be matched with job descriptions to assess fit and personalize cover letters."
            >
              KEY SKILLS
            </h2>

            <div className="edit-skill-wrapper">
              <div className="add-skill-wrapper">
                <input 
                  className="add-skill-input"
                  placeholder='Add a skill... (ex. Microsoft Word)'
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addSkill();
                  }}
                />

                <button 
                  className="add-skill-button"
                  onClick={addSkill}
                >
                  Add Skill
                </button>
              </div>

              <button 
                className="clear-skills-button"
                onClick={clearSkills}
              >
                Clear Skills
              </button>
            </div>


            <div className="skills-wrapper">
              {skills.map((skill, index) => (
                <button
                  key={index}
                  className="skill"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="experience-section">
          <h2 
            className="experience-title" 
            title="Work experience and achievements that are relevant to the job description will be included in cover letters."
          >
            WORK EXPERIENCE AND ACHIEVEMENTS
          </h2>

          <div className="job-container">
            <input placeholder="Company Name..."></input>
            <input placeholder="Job Title..."></input>
          </div>

          <input placeholder="List work responsibilities and achievements..."></input>
        </div>

        <p 
          className="profile-explanation-button"
          title="Completing your profile helps the extension create more tailored cover letters and better match your skills with job descriptions. You can skip any input field that you want, but it may impact the performance of the extension."
        >
          Why fill this out?
        </p>

        <div className="button-container">
          <button 
            className="exit-profile-button"
            onClick={() => hideUserProfile()}
          >
            Exit Profile
          </button>

          <button
            className="save-changes-button"
            onClick={() => {}}
          >
            Save Changes
          </button> */}
        </div>
      </div>
    </div>
  )
}

export default UserProfile;