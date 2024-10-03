const keywords = [
  "Python", 
  "JavaScript", 
  "AWS", 
  "Machine Learning", 
  "Node.js",
  "Angular",
  "SQL"
];

const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '10px';
container.style.right = '10px';
container.style.backgroundColor = 'white';
container.style.border = '1px solid black';
container.style.padding = '10px';
container.style.zIndex = '9999';
document.body.appendChild(container);

// Add a title
const title = document.createElement('h3');
title.textContent = 'Skills Manager';
container.appendChild(title);

// Input for adding skills
const skillInput = document.createElement('input');
skillInput.placeholder = 'Add a skill';
container.appendChild(skillInput);

const addButton = document.createElement('button');
addButton.textContent = 'Add Skill';
container.appendChild(addButton);

// List for displaying skills
const skillsList = document.createElement('ul');
container.appendChild(skillsList);

const generateButton = document.createElement('button');
generateButton.textContent = "Generate Cover Letter";
container.appendChild(generateButton)

const coverLetterDiv = document.createElement('div');
coverLetterDiv.id = "result-div";
document.body.appendChild(coverLetterDiv);

const coverLetterText = document.createElement('p');
coverLetterText.innerHTML = "Dear Hiring Manager, I am writing to express my interest in the Software Developer position at your esteemed company, as advertised. With over five years of experience in software development, specializing in Python and JavaScript, I am confident that my skills and passion align perfectly with the role's requirements. I have a proven track record of designing, developing, and maintaining efficient, reusable, and reliable code using these languages. In my previous role at XYZ Corporation, I led a team to successfully migrate our core platform to Python, resulting in a 30% improvement in performance. I am also proficient in various frameworks and libraries, including Django, Flask, React, and Node.js. I am particularly drawn to your company because of its reputation for fostering innovation and continuous learning. I am eager to bring my unique blend of technical expertise and problem-solving skills to your team, contributing to the development of cutting-edge software solutions. Thank you for considering my application. I look forward to the possibility of discussing how my background and skills would make me a strong fit for your position. Sincerely, [Your Name]";
coverLetterDiv.appendChild(coverLetterText)

generateButton.addEventListener('click', () => {
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
                Only cite the data from the user's data if it directly relates to the job description.` 
    },

    { role: 'user', content: prompt }
  ];

  coverLetterText.innerHTML = ''

  chrome.runtime.sendMessage({ messages }, (response) => {
    if (response.error) {
      console.error(response.error);
    } else {
      console.log("finished streaming.")
    }
  });
});

// Listen for streamed chunks sent from the background script
chrome.runtime.onMessage.addListener((streamResponse) => {
  if (streamResponse.streamChunk) {
    coverLetterText.innerHTML += streamResponse.streamChunk.replace(/\n/g, '<br>');  // Append chunk to the displayed text  
  }
});

// Save the cover letter as a text file
const saveButton = document.createElement('button');
saveButton.id = 'save-button';
saveButton.textContent = 'Save Cover Letter';
coverLetterDiv.appendChild(saveButton);

saveButton.addEventListener('click', () => {
    const blob = new Blob([coverLetterDiv.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.txt'; // Specify the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Free up memory
  }
);

// Load existing skills
const loadSkills = () => {
  const result = localStorage.getItem("userInfo")
  
  let skills = JSON.parse(result) || [];
  if (skills.length === 0) {
    skills = keywords;
    localStorage.setItem("userInfo", JSON.stringify(skills));
  }

  displaySkills(skills);
};

const displaySkills = (skills) => {
  skillsList.innerHTML = '';
  skills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    skillsList.appendChild(li);
  });
};

// Handle adding skills
addButton.addEventListener('click', () => {
  const skill = skillInput.value.trim();
  if (skill) {
    const result = localStorage.getItem('userInfo');
    const currentSkills = JSON.parse(result) || [];
    if (!currentSkills.includes(skill)) {
      currentSkills.push(skill)
      localStorage.setItem("userInfo", JSON.stringify(currentSkills));
      displaySkills(currentSkills);
    }
    skillInput.value = '';
  }
});

// Clear skills button
const clearButton = document.createElement('button');
clearButton.textContent = 'Clear Skills';
container.appendChild(clearButton);

clearButton.addEventListener('click', () => {
  localStorage.removeItem('userInfo');
  displaySkills([]);
});

loadSkills();