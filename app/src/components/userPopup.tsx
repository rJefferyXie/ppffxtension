import "../styles/userPopup.css";
import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

interface ResponseType {
  error?: string;
}

interface StreamResponse {
  streamChunk?: string;
}

interface ArrowDirectionMap {
  [key: string]: string
}

const arrowDirections: ArrowDirectionMap = {
  "left": "right",
  "right": "left",
  "top": "bottom",
  "bottom": "top"
}

interface UserPopupInterface {
  showUserProfile: Function
}

const UserPopup = (props: React.PropsWithChildren<UserPopupInterface>) => {
  const { showUserProfile } = props;

  const [showPopup, setShowPopup] = useState(true);
  const [popupLocation, setPopupLocation] = useState("top-right");
  const [coverLetterText, setCoverLetterText] = useState('');

  useEffect(() => {
    const shouldShowPopup = localStorage.getItem("showPopup");
    if (shouldShowPopup === "true") setShowPopup(true);
    if (shouldShowPopup === "false") setShowPopup(false);

    const savedPopupLocation = localStorage.getItem("popupLocation");
    if (savedPopupLocation) setPopupLocation(savedPopupLocation);
  }, []);

  const togglePopup = () => {
    localStorage.setItem("showPopup", (!showPopup).toString());
    setShowPopup(!showPopup);
  }

  const movePopup = (direction: string) => {
    const newPopupLocation = popupLocation.replace(arrowDirections[direction], direction);
    setPopupLocation(newPopupLocation);
    localStorage.setItem("popupLocation", newPopupLocation);
  }

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
                  Only use the data from the user's data if it directly relates to the job description.` 
      },
  
      { role: 'user', content: prompt }
    ];
  
    setCoverLetterText('');
  
    browser.runtime.sendMessage(messages).then((response) => {
      const typedResponse = response as ResponseType;

      if (typedResponse.error) {
        console.error(typedResponse.error);
      } else {
        console.log("finished streaming.")
      }
    });
  }

  useEffect(() => {
    // Listen for streamed chunks sent from the background script
    const handleStreamResponse = (streamResponse: any) : true | undefined => {
      if (streamResponse.streamChunk) {
        setCoverLetterText(prev => prev + streamResponse.streamChunk.replace(/\n/g, '<br>'));
      }

      return true;
    };

    // Listen for streamed chunks sent from the background script
    browser.runtime.onMessage.addListener(handleStreamResponse);

    // Cleanup the event listener on component unmount
    return () => {
      browser.runtime.onMessage.removeListener(handleStreamResponse);
    };
  }, []);

  const saveCoverLetter = () => {
    const blob = new Blob([coverLetterText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.txt'; // Specify the file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Free up memory
  }

  return (
    <div>
      {
        showPopup ?
        <div className={`popup-container ${popupLocation}`}>
          <h3 className="popup-title">
            Profile Information
          </h3>

          <div className="button-container">
            <button className="view-profile-button" onClick={() => showUserProfile()}>
              View Profile
            </button>

            <button className="hide-popup-button" onClick={togglePopup}>
              Hide Popup
            </button>
          </div>
        </div> :
        <div className={`show-popup-container ${popupLocation}`}>
          <button className='show-popup-button' onClick={togglePopup}>
            <h2 className="show-popup-logo">
              𝓹
            </h2>
          </button>
            
          {
            popupLocation.includes("top") && 
            <button className="popup-arrow bottom-arrow" onClick={() => movePopup("bottom")}>
              ↓
            </button>
          }

          {
            popupLocation.includes("right") && 
            <button className="popup-arrow left-arrow" onClick={() => movePopup("left")}>
              ←
            </button>
          }

          {
            popupLocation.includes("left") && 
            <button className="popup-arrow right-arrow" onClick={() => movePopup("right")}>
              →
            </button>
          }

          {
            popupLocation.includes("bottom") && 
            <button className="popup-arrow top-arrow" onClick={() => movePopup("top")}>
              ↑
            </button>
          }
        </div>

      }
{/* 
      <div className="cover-letter-div">
        <p>
          Dear Hiring Manager, I am writing to express my interest in the Software Developer position at your esteemed company, as advertised. With over five years of experience in software development, specializing in Python and JavaScript, I am confident that my skills and passion align perfectly with the role's requirements. I have a proven track record of designing, developing, and maintaining efficient, reusable, and reliable code using these languages. In my previous role at XYZ Corporation, I led a team to successfully migrate our core platform to Python, resulting in a 30% improvement in performance. I am also proficient in various frameworks and libraries, including Django, Flask, React, and Node.js. I am particularly drawn to your company because of its reputation for fostering innovation and continuous learning. I am eager to bring my unique blend of technical expertise and problem-solving skills to your team, contributing to the development of cutting-edge software solutions. Thank you for considering my application. I look forward to the possibility of discussing how my background and skills would make me a strong fit for your position. Sincerely, [Your Name]
        </p>

        <button className="save-button" onClick={saveCoverLetter}>
          Save Cover Letter
        </button>
      </div> */}
    </div>
  )
}

export default UserPopup;