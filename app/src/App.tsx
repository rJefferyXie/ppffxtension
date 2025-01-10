import UserPopup from "./components/userPopup";
import browser from 'webextension-polyfill';

import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import UserProfile from "./components/userProfile";

import { Skill } from './components/resumeSection';

import { decryptData } from "./utils/encryption";

interface ResponseType {
  error?: string;
}

// Constants
const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000; // Expiration time for job data (3 days in milliseconds)

const App = () => {
  const [password, setPassword] = useState('');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // TODO: refactor all of this below
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [education, setEducation] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const encryptedName = localStorage.getItem("name") || '';
    setName(decryptData(encryptedName, password) || '');

    const encryptedLocation = localStorage.getItem("location") || '';
    setLocation(decryptData(encryptedLocation, password) || '');

    const encryptedEducation = localStorage.getItem("education") || '';
    setEducation(JSON.parse(decryptData(encryptedEducation, password) || '[]'));

    const encryptedCertificates = localStorage.getItem("certificates") || '';
    setCertificates(JSON.parse(decryptData(encryptedCertificates, password) || '[]'));

    const encryptedWorkExperiences = localStorage.getItem("workExperiences") || '';
    setWorkExperiences(JSON.parse(decryptData(encryptedWorkExperiences, password) || '[]'));

    const encryptedProjects = localStorage.getItem("projects") || '';
    setProjects(JSON.parse(decryptData(encryptedProjects, password) || '[]'));

    const encryptedSkills = localStorage.getItem("skills") || '';
    setSkills(JSON.parse(decryptData(encryptedSkills, password) || '[]'));

  }, [isAuthenticated, password]);

  const generateCoverLetter = (jobDescription: string) => {
    const userdata = {
      name: name,
      location: location,
      education: education,
      certificates: certificates,
      skills: skills,
      projects: projects,
      workExperiences: workExperiences
    }
    
    const prompt = `
      Write a professional cover letter for this job posting. 
      This is the user information that was provided: ${JSON.stringify(userdata)} 
      This is the job description: ${jobDescription}
    `;
  
    // Create structured messages for the Mistral API
    const messages = [
      { 
        role: 'system', 
        content: `You are a helpful assistant that writes professional cover letters. 
                  Never make up fake information about what the user knows or their experiences. 
                  Do not include any skills, projects, or work experiences that the user did not explicitly provide.
                  
                  If the user has relevant work experience or projects related to the job description, write a professional cover letter of two to three short paragraphs highlighting these aspects.
                  Prioritize showcasing the user's work experiences and projects over their general skills, ensuring a human-like tone and readability.

                  If the user's data does not contain any relevant work experience, projects, or skills specific to the job description, write a very brief and concise cover letter.
                  In such cases, acknowledge the user's interest in the role and briefly mention their motivation or willingness to learn, but do not fabricate details or attempt to stretch unrelated data.

                  Always ensure the cover letter is tailored to the job description provided by the user.
                  Do not include address headers or other formalities unless explicitly instructed.
                  If the user's name is provided, sign the cover letter with their name.` 
      },

      { role: 'user', content: prompt }
    ];

    browser.runtime.sendMessage({messages: messages}).then((response) => {
      const typedResponse = response as ResponseType;

      if (typedResponse.error) {
        console.error(typedResponse.error);
      } else {
        console.log("finished streaming.")
      }
    });
  }

  const saveJobResult = (selectedJobLink: string, matchedKeywords: string[], relevanceScore: number) => {
    const jobData = {
      keywords: matchedKeywords,
      relevance: relevanceScore,
      timestamp: Date.now()
    };

    localStorage.setItem(selectedJobLink, JSON.stringify(jobData));
  };

  const cleanUpExpiredResults = () => {
    const currentTime = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      const item = localStorage.getItem(key);
      if (typeof item !== 'object') continue;

      const jobData = JSON.parse(localStorage.getItem(key) || '{}');
      if (jobData.timestamp && currentTime - jobData.timestamp > EXPIRATION_TIME) {
        localStorage.removeItem(key); // Remove expired data
      }
    }
  };

  const displayResultBox = (jobDiv: HTMLElement, matchedKeywords: string[], relevanceScore: number) => {
    const resultBox = document.createElement('div');
    resultBox.classList.add('result-box');
    resultBox.innerHTML = `
      <strong>Relevance:</strong> ${(relevanceScore * 100).toFixed(2)}%<br>
      <em>Keywords:</em> ${matchedKeywords.join(', ')}
    `;
    
    jobDiv.style.position = 'relative';
    jobDiv.appendChild(resultBox);
  };

  useEffect(() => {
    const displaySavedResults = () => {
      document.querySelectorAll('div.job_seen_beacon').forEach(jobDiv => {
        if (jobDiv.querySelector('.result-box')) return; // Skip if result already exists

        const jobElement = jobDiv as HTMLElement;
        const jobLinkDiv: HTMLElement | null = jobElement.querySelector('a.jcs-JobTitle');
        const jobLink = jobLinkDiv?.dataset.jk;
        if (!jobLink) return;

        const savedData = JSON.parse(localStorage.getItem(jobLink) || '{}');
        if (savedData.keywords) {
          displayResultBox(jobElement, savedData.keywords, savedData.relevance);
        }
      });
    };

    const observeJobList = () => {
      const targetNode = document.querySelector('#mosaic-jobResults');
      if (!targetNode) return;

      const observer = new MutationObserver(displaySavedResults);
      observer.observe(targetNode, { childList: true, subtree: true });
    };

    const analyzeJobPosting = (selectedJobDiv: HTMLElement, selectedJobLink: string) => {
      const jobDescriptionDiv: HTMLElement | null = document.querySelector('.jobsearch-JobComponent-description');
      const jobDescription = jobDescriptionDiv?.innerText || "No job description found.";

      const skillNames = skills.map(skill => skill.name).filter(skill => skill);
      const matchedKeywords = skillNames.filter(keyword => jobDescription.includes(keyword));
      const relevanceScore = matchedKeywords.length / skills.length;

      displayResultBox(selectedJobDiv, matchedKeywords, relevanceScore);
      saveJobResult(selectedJobLink, matchedKeywords, relevanceScore);
      addGenerateButton(selectedJobDiv, jobDescription);
    };

    const addGenerateButton = (selectedJobDiv: HTMLElement, jobDescription: string) => {
      const jobOptionsDiv: HTMLElement | null = document.querySelector('.css-1jzia5w');
      if (jobOptionsDiv && !jobOptionsDiv.querySelector('.generate-cv-button')) {
        const generateCVDiv = document.createElement('div');
        generateCVDiv.className = 'generate-cv-button-container';

        ReactDOM.render(
          <Button 
            className="generate-cv-button" 
            variant="outlined"
            onClick={() => generateCoverLetter(jobDescription)}
          >
            Generate Cover Letter
          </Button>, generateCVDiv
        );

        jobOptionsDiv.appendChild(generateCVDiv);
      }
    };

    const observeJobDescriptionLoad = (selectedJobDiv: HTMLElement, selectedJobLink: string) => {
      const targetNode = document.querySelector('.jobsearch-RightPane');
      if (!targetNode) return;

      const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && document.querySelector('.jobsearch-JobComponent-description')) {
            observer.disconnect(); // Stop observing after job description loads
            analyzeJobPosting(selectedJobDiv, selectedJobLink);
          }
        }
      });

      observer.observe(targetNode, { childList: true, subtree: true });
    };

    cleanUpExpiredResults();
    observeJobList();
    displaySavedResults();

    /**
     * Event listener to detect when a job posting is clicked, and trigger analysis.
     */
    document.addEventListener('click', (event) => {
      const eventTarget = event.target as HTMLElement;
      const selectedJobDiv = eventTarget?.closest('div.job_seen_beacon') as HTMLElement | null;
      const jobLinkDiv = selectedJobDiv?.querySelector('a.jcs-JobTitle') as HTMLAnchorElement | null;

      if (selectedJobDiv && jobLinkDiv?.dataset.jk) {
        observeJobDescriptionLoad(selectedJobDiv, jobLinkDiv.dataset.jk);
      }
    });
  }, [skills])
  
  return (
    <div className="App">
      {!showUserProfile && <UserPopup showUserProfile={() => setShowUserProfile(true)}/>}
      
      {showUserProfile && 
        <UserProfile 
          isAuthenticated={isAuthenticated} 
          setIsAuthenticated={setIsAuthenticated} 
          password={password} 
          setPassword={setPassword} 
          hideUserProfile={() => setShowUserProfile(false)}
        />
      }
    </div> 
  )
};

export default App;
