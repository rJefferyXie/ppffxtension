
// Time before saved job descriptions expire (3 days in milliseconds)
const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000;

const analyzeJobPosting = (selectedJobDiv, selectedJobLink) => {
  const jobDescription = document.querySelector('.jobsearch-JobComponent-description')?.innerText || 'No description found';

  const userSkills = JSON.parse(localStorage.getItem("userInfo")) || [];

  // Cross-reference job description with user keywords
  let matchedKeywords = [];
  userSkills.forEach(keyword => {
    if (jobDescription.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  });

  // Calculate relevance rating (number of matches / total keywords)
  const relevanceScore = matchedKeywords.length / userSkills.length;

  const resultBox = document.createElement('div');
  resultBox.classList.add('result-box');
  resultBox.innerHTML = `
    <strong>Relevance:</strong> ${(relevanceScore * 100).toFixed(2)}%<br>
    <em>Keywords:</em> ${matchedKeywords.join(', ')}
  `;

  selectedJobDiv.style.position = 'relative';
  selectedJobDiv.appendChild(resultBox);

  saveJobResult(selectedJobLink, matchedKeywords, relevanceScore);
}

const saveJobResult = (selectedJobLink, matchedKeywords, relevanceScore) => {
  const jobData = {
    keywords: matchedKeywords,
    relevance: relevanceScore,
    timestamp: Date.now()
  };

  // Save the data in localStorage with the jobLink as the key
  localStorage.setItem(selectedJobLink, JSON.stringify(jobData));
}

const observeJobDescriptionLoad = (selectedJobDiv, selectedJobLink) => {
  // Check if a result box already exists in the selected job div
  if (selectedJobDiv.querySelector('.result-box')) {
    return;
  }

  const targetNode = document.querySelector('.jobsearch-RightPane');
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        const jobDescription = document.querySelector('.jobsearch-JobComponent-description');
        if (jobDescription) {
          observer.disconnect();
          analyzeJobPosting(selectedJobDiv, selectedJobLink);
        }
      }
    }
  });

  observer.observe(targetNode, { childList: true, subtree: true });
}

const observeJobList = () => {
  const targetNode = document.querySelector('#mosaic-jobResults');
  if (!targetNode) return;

  const observer = new MutationObserver(() => {
    displaySavedResults();
  });

  observer.observe(targetNode, { childList: true, subtree: true });
};

const cleanUpExpiredResults = () => {
  const currentTime = Date.now();

  // Loop through localStorage and remove any jobs older than 3 days
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    const jobData = localStorage.getItem(key);
    if (jobData && currentTime - jobData?.timestamp > EXPIRATION_TIME) {
      localStorage.removeItem(key);
    }
  }
}

const displaySavedResults = () => {
  document.querySelectorAll('div.job_seen_beacon').forEach(jobDiv => {
    if (jobDiv.querySelector('.result-box')) return;

    const jobLink = jobDiv.querySelector('a.jcs-JobTitle').dataset.jk;

    const savedData = JSON.parse(localStorage.getItem(jobLink));
    if (savedData) {
      const resultBox = document.createElement('div');
      resultBox.classList.add('result-box');
      resultBox.innerHTML = `
        <strong>Relevance:</strong> ${(savedData.relevance * 100).toFixed(2)}%<br>
        <em>Keywords:</em> ${savedData.keywords.join(', ')}
      `;

      jobDiv.style.position = 'relative';
      jobDiv.appendChild(resultBox);
    }
  });
}

// Event listener to detect when a job posting is clicked and displayed
document.addEventListener('click', (event) => {
  const selectedJobDiv = event.target.closest('div.job_seen_beacon');  // Detects when a job link is clicked
  const selectedJobLink = selectedJobDiv?.querySelector('a.jcs-JobTitle').dataset.jk;
  
  if (selectedJobDiv) {
    observeJobDescriptionLoad(selectedJobDiv, selectedJobLink);
  }
});

cleanUpExpiredResults();
observeJobList();
displaySavedResults();