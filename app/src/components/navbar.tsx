import "../styles/navbar.css";

import { Button } from "@mui/material";
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface NavbarProps {
  activeTab: string,
  setActiveTab: Function,
  isAuthenticated: boolean,
  hideUserProfile: Function
}

const Navbar = (props: React.PropsWithChildren<NavbarProps>) => {
  const { activeTab, setActiveTab, isAuthenticated, hideUserProfile } = props;

  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <EmojiNatureIcon></EmojiNatureIcon>
        <h3 className="logo-name">PALLAS</h3>
      </div>

      {isAuthenticated &&
        <div className="navbar-item-container">
          <div className={`${activeTab === "About" ? 'active-tab' : 'navbar-item'}`} onClick={() => setActiveTab("About")}>
            <AccountCircleIcon></AccountCircleIcon>
            <p className="item-text">About Me</p>
          </div>

          <div className={`${activeTab === "Resume" ? 'active-tab' : 'navbar-item'}`} onClick={() => setActiveTab("Resume")}>
            <WorkIcon></WorkIcon>
            <p className="item-text">Resume</p>
          </div>

          <p 
            className="profile-explanation-text"
            title="Completing your profile helps the extension create more detailed cover letters and better match your skills with job descriptions. You may skip any input field as you please, but it may impact the extension's performance."
          >
            Why fill this out?
          </p>

          <Button 
            className="exit-button" 
            color="error"
            variant="outlined"
            onClick={() => hideUserProfile()}
          >
            EXIT
          </Button>
        </div>
      }
    </div>
  )
}

export default Navbar;