import "../styles/userPopup.css";
import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';

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
  const [coverLetterText, setCoverLetterText] = useState('dwhauidhaiudawhduiwahdui');

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

  useEffect(() => {
    // Listen for streamed chunks sent from the background script
    const handleStreamResponse = (streamResponse: any) : true | undefined => {
      if (streamResponse.streamChunk) {
        setCoverLetterText(prev => prev + streamResponse.streamChunk.replace(/<br>/g, '\n'));
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
          <div className="popup-text">
            <h3 className="logo-name">PALLAS</h3>
          </div>

          <div className="button-container">
            <button className="hide-popup-button" onClick={togglePopup}>
              Hide Popup
            </button>

            <button className="view-profile-button" onClick={() => showUserProfile()}>
              View Profile
            </button>
          </div>
        </div> :
        <div className={`show-popup-container ${popupLocation}`}>
          <button className='show-popup-button' onClick={togglePopup}>
            <h2 className="show-popup-logo">
              <EmojiNatureIcon></EmojiNatureIcon>
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

      {coverLetterText}
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