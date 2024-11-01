import UserPopup from "./components/userPopup";

import { useState, useEffect } from 'react';
import UserProfile from "./components/userProfile";


// Constants
const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000; // Expiration time for job data (3 days in milliseconds)

const App = () => {
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  /**
   * Analyze the selected job posting, cross-reference with user skills,
   * and display the relevance score and matched keywords.
   */
  const analyzeJobPosting = (selectedJobDiv: HTMLElement, selectedJobLink: string) => {
    const jobDescriptionDiv: HTMLElement | null = document.querySelector('.jobsearch-JobComponent-description');
    const jobDescription = jobDescriptionDiv?.innerText || "No job description found.";

    const userSkills: string[] = JSON.parse(localStorage.getItem("userInfo") || '[]');

    const matchedKeywords = userSkills.filter(keyword => jobDescription.includes(keyword));
    const relevanceScore = matchedKeywords.length / userSkills.length;

    displayResultBox(selectedJobDiv, matchedKeywords, relevanceScore);
    saveJobResult(selectedJobLink, matchedKeywords, relevanceScore);
  };

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
   * Observe the job description pane and trigger analysis when it is fully loaded.
   */
  const observeJobDescriptionLoad = (selectedJobDiv: HTMLElement, selectedJobLink: string) => {
    if (selectedJobDiv.querySelector('.result-box')) return; // Skip if already analyzed

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
   * Clean up expired job results from localStorage based on the expiration time.
   */
  const cleanUpExpiredResults = () => {
    const currentTime = Date.now();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      continue;

      // const jobData = JSON.parse(localStorage.getItem(key) || '{}');
      // if (jobData.timestamp && currentTime - jobData.timestamp > EXPIRATION_TIME) {
      //   localStorage.removeItem(key); // Remove expired data
      // }
    }
  };

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

  // Run the necessary functions when the app starts
  cleanUpExpiredResults();
  observeJobList();
  displaySavedResults();
  
  return (
    <div className="App">
      {!showUserProfile && <UserPopup showUserProfile={() => setShowUserProfile(true)}/>}
      {showUserProfile && <UserProfile hideUserProfile={() => setShowUserProfile(false)}/>}
    </div> 
  )
};

export default App;
