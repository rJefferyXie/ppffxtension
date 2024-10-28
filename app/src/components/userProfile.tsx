import "../styles/userProfile.css";

import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

const UserProfile = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');

    const keywords = [
    "Python", 
    "JavaScript", 
    "AWS", 
    "Machine Learning", 
    "Node.js",
    "Angular",
    "SQL"
  ];
  
  const clearSkills = () => {
    localStorage.removeItem('userInfo');
    setSkills([]);
  }

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

  const addSkill = () => {
    if (skillInput.trim()) {
      const currentSkills = [...skills];
      if (!currentSkills.includes(skillInput)) {
        currentSkills.push(skillInput);
        localStorage.setItem("userInfo", JSON.stringify(currentSkills));
        setSkills(currentSkills);
      }

      setSkillInput(''); // Clear input field
    }
  }
    

  return (
    <div className="profile-container">
      <div className="skills-section">
        <input placeholder='Add a skill'></input>

        <button onClick={addSkill}>
          Add Skill
        </button>

        <ul>
          {skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>

        <button onClick={clearSkills}>
          Clear Skills
        </button>
      </div>

      <div className="resume-section">

      </div>
    </div>
  )
}

export default UserProfile;