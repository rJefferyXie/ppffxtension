import UserPopup from "./components/userPopup";
import browser from 'webextension-polyfill';

import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import UserProfile from "./components/userProfile";


interface ResponseType {
  error?: string;
}

interface StreamResponse {
  streamChunk?: string;
}

interface Skill {
  name: string;
  experience: string;
}

// Constants
const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000; // Expiration time for job data (3 days in milliseconds)

const App = () => {
  const defaultSkill: Skill = {
    name: "",
    experience: ""
  }

  const [showUserProfile, setShowUserProfile] = useState(false);
  
  const [skills, setSkills] = useState<Skill[]>(
    JSON.parse(localStorage.getItem("skills") || "[]") || [defaultSkill]
  );

  const generateCoverLetter = () => {
    const userdata = `WORK EXPERIENCE VRETTA | SOFTWARE DEVELOPER SEP 2022 to APR 2023 
      Enhanced the e-learning experience for students across Canada through a web application that runs standardized
      provincial tests, supporting thousands of daily users with varying devices, browsers, and learning accommodations.
  
      Developed Python, SQL, and shell scripts to automatically create and insert thousands of student and
      teacher accounts into the database every semester, significantly reducing the data processing time by 32%.
  
      Implemented real-time features including chat systems, user presence detection, and online/offline
      indicators, scaling to hundreds of concurrent users utilizing AWS Lambda, DynamoDB, and WebSockets.
  
      Conducted load testing on critical application components with K6 and automated tests with Selenium and
      Browser Stack, optimizing regression testing efficiency by saving 2-3 hours of manual effort per cycle.`
  
    const jobDescription = `Full job description
    
      About EMS:

      At EMS Inc., we protect the world’s most productive resource – Soil. We are achieving this by combining exceptional talent with clean technology built on the values of creativity, reliability, and environmental responsibility. We are building a sustainable future with smart technologies by providing high-tech remote sensing solutions for the oil, gas, and agricultural industries.

      Position Overview:

      We are looking for a passionate and skilled Backend Developer to join our growing software team. As a Backend Developer at EMS Inc., you will be responsible for deploying our advanced soil models into production and maintaining the backend for our various dashboards and internal tools. You will also help build, optimize, and maintain our data pipelines. At EMS Inc., we thrive in a dynamic and fast-paced environment where meeting tight deadlines and tackling challenges are part of our daily routine. If you enjoy a stimulating and collaborative workplace, you'll feel right at home with us. Note that this position is on-site first in Saskatoon, SK with potential for some hybrid work-days.

      Key Responsibilities:

          Collaborate with data scientists to deploy our models into production environments.
          Maintain (includes troubleshooting & debugging) and enhance the backend systems for various dashboards and internal tools.
          Design, develop, and maintain efficient and scalable data pipelines.
          Optimize data storage solutions and ensure data integrity and security.
          Collaborate with cross-functional teams to define and implement new features and improvements.
          Document processes and maintain clear team communication.

      Requirements:

          Bachelor's degree in Computer Science, Engineering, or a related field.
          3+ years of experience in back-end development, data engineering, or related position.
          Proficiency in database management (SQL and NoSQL databases).
          Experience with cloud services such as AWS, GCP, or Azure.
          Familiarity with data pipeline tools and frameworks (e.g., Apache Kafka, Airflow).
          Strong understanding of machine learning concepts and deployment.
          Strong problem-solving skills and attention to detail.
          Self-starter with the ability to work independently and as part of a team.
          Excellent communication and documentation skills.
          Bonus: Experience with mathematical modeling and/or a background in environmental science.

      Why Join EMS Inc.?

        Challenging, fast-paced startup environment.
        Competitive salary and benefits package.
        Opportunity to work with cutting-edge technology in the environmental sector.
        A collaborative and innovative work environment.
        Professional development opportunities.
        Flexible working hours and hybrid work options.
    `
  
    const prompt = `Write a professional cover letter for a software developer. User Data: ${userdata}, Job Description: ${jobDescription}`;
  
    // Create structured messages for the Mistral API
    const messages = [
      { 
        role: 'system', 
        content: `You are a helpful assistant that writes professional cover letters. 
                  The cover letters should be two to three short paragraphs in length depending on the job relevancy, and you do not need to include the address portions. 
                  When listing the bullet points from the users data you do not need to cite it word for word.
                  Try to make the cover letter look like a human wrote it and make it readable and easy to understand.
                  Only use the data from the user's data if it directly relates to the job description.` 
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

  /**
   * Save the analyzed job result in localStorage with a timestamp.
   */
  const saveJobResult = (selectedJobLink: string, matchedKeywords: string[], relevanceScore: number) => {
    const jobData = {
      keywords: matchedKeywords,
      relevance: relevanceScore,
      timestamp: Date.now()
    };

    localStorage.setItem(selectedJobLink, JSON.stringify(jobData));
  };

  /**
   * Clean up expired job results from localStorage based on the expiration time.
   */
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

  /**
   * Helper function to display the result box with relevance and matched keywords.
   */
  const displayResultBox = (jobDiv: HTMLElement, matchedKeywords: string[], relevanceScore: number) => {
    const resultBox = document.createElement('div');
    resultBox.classList.add('result-box');
    resultBox.innerHTML = `
      <strong>Relevance:</strong> ${(relevanceScore * 100).toFixed(2)}%<br>
      <em>Keywords:</em> ${matchedKeywords.join(', ')}
    `;
    
    jobDiv.style.position = 'relative'; // Ensure relative positioning for result box
    jobDiv.appendChild(resultBox);
  };

  useEffect(() => {
    /**
     * Display saved results from localStorage for each job in the current list.
     */
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

    /**
     * Observe the job listings and display saved results for each job in the list.
     */
    const observeJobList = () => {
      const targetNode = document.querySelector('#mosaic-jobResults');
      if (!targetNode) return;

      const observer = new MutationObserver(displaySavedResults);
      observer.observe(targetNode, { childList: true, subtree: true });
    };

    /**
     * Analyze the selected job posting, cross-reference with user skills,
     * and display the relevance score and matched keywords.
     */
    const analyzeJobPosting = (selectedJobDiv: HTMLElement, selectedJobLink: string) => {
      const jobDescriptionDiv: HTMLElement | null = document.querySelector('.jobsearch-JobComponent-description');
      const jobDescription = jobDescriptionDiv?.innerText || "No job description found.";

      const skillNames = skills.map(skill => skill.name).filter(skill => skill)
      const matchedKeywords = skillNames.filter(keyword => jobDescription.includes(keyword));
      const relevanceScore = matchedKeywords.length / skills.length;

      displayResultBox(selectedJobDiv, matchedKeywords, relevanceScore);
      saveJobResult(selectedJobLink, matchedKeywords, relevanceScore);
    };

    /**
     * Observe the job description pane and trigger analysis when it is fully loaded.
     */
    const observeJobDescriptionLoad = (selectedJobDiv: HTMLElement, selectedJobLink: string) => {
      // if (selectedJobDiv.querySelector('.result-box')) return; // Skip if already analyzed

      const targetNode = document.querySelector('.jobsearch-RightPane');
      if (!targetNode) return;

      const observer = new MutationObserver((mutations, observer) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && document.querySelector('.jobsearch-JobComponent-description')) {
            observer.disconnect(); // Stop observing after job description loads


            const jobOptionsDiv: HTMLElement | null = document.querySelector('.css-1jzia5w');
            if (jobOptionsDiv && !jobOptionsDiv.querySelector('.generate-cv-button')) {
              const generateCVDiv = document.createElement('div');
              generateCVDiv.className = 'generate-cv-button-container';

              ReactDOM.render(
                <Button 
                  className="generate-cv-button" 
                  variant="outlined"
                  onClick={generateCoverLetter}
                >
                  Generate Cover Letter
                </Button>, generateCVDiv
              )

              jobOptionsDiv.appendChild(generateCVDiv);
            }

            analyzeJobPosting(selectedJobDiv, selectedJobLink);
          }
        }
      });

      observer.observe(targetNode, { childList: true, subtree: true });
    };

    // Run the necessary functions when the app starts
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
      {showUserProfile && <UserProfile hideUserProfile={() => setShowUserProfile(false)}/>}

                        <Button 
                  className="generate-cv-button" 
                  variant="outlined"
                  onClick={generateCoverLetter}
                >
                  Generate Cover Letter
                </Button>
    </div> 
  )
};

export default App;
