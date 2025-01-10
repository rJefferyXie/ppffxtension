import "../styles/userPopup.css";

import { useState, useEffect } from 'react';
import browser from 'webextension-polyfill';

import { Button } from "@mui/material";
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

  useEffect(() => {
    const handleStreamResponse = (streamResponse: any) : true | undefined => {
      if (streamResponse.streamChunk) {
        setCoverLetterText(prev => prev + streamResponse.streamChunk.replace(/<br>/g, '\n'));
      }

      return true;
    };

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

    clearCoverLetter();
  }

  const clearCoverLetter = () => {
    setCoverLetterText('');
  }

  return (
    <div>
      {showPopup ?
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
            
          {popupLocation.includes("top") && 
            <button className="popup-arrow bottom-arrow" onClick={() => movePopup("bottom")}>
              ↓
            </button>
          }

          {popupLocation.includes("right") && 
            <button className="popup-arrow left-arrow" onClick={() => movePopup("left")}>
              ←
            </button>
          }

          {popupLocation.includes("left") && 
            <button className="popup-arrow right-arrow" onClick={() => movePopup("right")}>
              →
            </button>
          }

          {popupLocation.includes("bottom") && 
            <button className="popup-arrow top-arrow" onClick={() => movePopup("top")}>
              ↑
            </button>
          }
        </div>
      }

      {coverLetterText && 
        <div className="cover-letter-div">
          <h3 className="section-title">
            GENERATED COVER LETTER
          </h3>

          <p className="cover-letter-text">
            {coverLetterText}
          </p>

          <div className="button-container">
            <Button
              className="exit-cv-button"
              variant="outlined"
              color="error"
              onClick={clearCoverLetter}
            >
              EXIT WITHOUT SAVING
            </Button>

            <Button 
              className="add-button" 
              variant="outlined"
              onClick={saveCoverLetter}
            >
              SAVE COVER LETTER
            </Button>
          </div>
        </div>
      }

    </div>
  )
}

export default UserPopup;