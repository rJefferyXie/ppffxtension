import "../styles/navbar.css";

import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import WorkIcon from '@mui/icons-material/Work';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface NavbarProps {
  activeTab: string,
  setActiveTab: Function;
}

const Navbar = (props: React.PropsWithChildren<NavbarProps>) => {
  const { activeTab, setActiveTab } = props;

  return (
    <div className="navbar-container">
      <div className="navbar-logo">
        <EmojiNatureIcon></EmojiNatureIcon>
        <h3 className="logo-name">PALLAS</h3>
      </div>

      <ul className="navbar-item-container">
        <div className={`${activeTab === "About" ? 'active-tab' : 'navbar-item'}`} onClick={() => setActiveTab("About")}>
          <AccountCircleIcon></AccountCircleIcon>
          <p className="item-text">About Me</p>
        </div>

        <div className={`${activeTab === "Skills" ? 'active-tab' : 'navbar-item'}`} onClick={() => setActiveTab("Skills")}>
          <EqualizerIcon></EqualizerIcon>
          <p className="item-text">Skills</p>
        </div>

        <div className={`${activeTab === "Work Experience" ? 'active-tab' : 'navbar-item'}`} onClick={() => setActiveTab("Work Experience")}>
          <WorkIcon></WorkIcon>
          <p className="item-text">Work Experience</p>
        </div>
      </ul>

      <p 
        className="profile-explanation-text"
        title="Completing your profile helps the extension create more detailed cover letters and better match your skills with job descriptions. You may skip any input field as you please, but it may impact the extension's performance."
      >
        Why fill this out?
      </p>
    </div>
  )
}

export default Navbar;