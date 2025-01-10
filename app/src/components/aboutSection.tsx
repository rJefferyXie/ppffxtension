import "../styles/aboutSection.css";

import { useState, useEffect } from "react";
import { encryptData, decryptData } from "../utils/encryption";

import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { Add, Clear } from "@mui/icons-material";

interface EducationInterface {
  degree: string;
  school: string;
}

interface CertificateInterface {
  name: string;
  issuer: string;
}

interface AboutSectionInterface {
  password: string
}

const AboutSection = (props: React.PropsWithChildren<AboutSectionInterface>) => {
  const { password } = props;

  const [name, setName] = useState(decryptData(localStorage.getItem("name") || '', password) || "");
  const [location, setLocation] = useState(decryptData(localStorage.getItem("location") || '', password) || "");

  const [education, setEducation] = useState<EducationInterface[]>(
    JSON.parse(decryptData(localStorage.getItem("education") || '', password) || '[{"degree":"","school":""}]')
  );
  
  const [certificates, setCertificates] = useState<CertificateInterface[]>(
    JSON.parse(decryptData(localStorage.getItem("certificates") || '', password) || '[{"name":"","issuer":""}]')
  );

  // Auto-save changes to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("name", encryptData(name, password));
      localStorage.setItem("location", encryptData(location, password));
      localStorage.setItem("education", encryptData(JSON.stringify(education), password));
      localStorage.setItem("certificates", encryptData(JSON.stringify(certificates), password));
    }, 500); // Save after 500ms of no typing
    return () => clearTimeout(timeout);
  }, [name, location, education, certificates, password]);

  const addEducation = () => {
    setEducation([...education, { degree: "", school: "" }]);
  };

  const updateEducation = (index: number, field: keyof EducationInterface, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      const updated = [...education];
      updated.splice(index, 1);
      setEducation(updated);
    }
  };

  const addCertificate = () => {
    setCertificates([...certificates, { name: "", issuer: "" }]);
  };

  const updateCertificate = (index: number, field: keyof CertificateInterface, value: string) => {
    const updated = [...certificates];
    updated[index][field] = value;
    setCertificates(updated);
  };

  const removeCertificate = (index: number) => {
    if (certificates.length > 1) {
      const updated = [...certificates];
      updated.splice(index, 1);
      setCertificates(updated);
    }
  };

  return (
    <div className="about-section">
      <div className="sub-wrapper">
        <h3 className="section-title">ABOUT</h3>

        <p className="input-info">
          To protect your privacy, this extension does not ask for your email or phone number. Please add them to your cover letters as needed.
        </p>

        <div className="input-wrapper">
          <TextField 
            className="input-field"
            multiline
            label="Name"
            placeholder="First and Last Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <TextField
            className="input-field"
            multiline
            label="Location"
            placeholder="City, Province/State..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="sub-wrapper">
        <h3 className="section-title">EDUCATION</h3>
        {education.map((entry, index) => (
          <div key={index} className="input-wrapper">
            <TextField
              className="input-field"
              label="Degree Title"
              placeholder="Diploma / Degree..."
              value={entry.degree}
              onChange={(e) =>
                updateEducation(index, "degree", e.target.value)
              }
            />
            <TextField
              className="input-field"
              label="School / University"
              placeholder="School / University..."
              value={entry.school}
              onChange={(e) =>
                updateEducation(index, "school", e.target.value)
              }
            />
            {education.length > 1 && index > 0 && (
              <Button className="remove-button" variant="outlined" color="error" onClick={() => removeEducation(index)}>{<Clear/>}</Button>
            )}
          </div>
        ))}

        <Button className="add-button" variant="outlined" startIcon={<Add />} onClick={addEducation}>
          Add Education
        </Button>
      </div>

      <div className="sub-wrapper">
        <h3 className="section-title">AWARDS / CERTIFICATIONS</h3>
        {certificates.map((entry, index) => (
          <div key={index} className="input-wrapper">
            <TextField
              className="input-field"
              label="Award / Certificate"
              placeholder="Award / Certificate Name..."
              value={entry.name}
              onChange={(e) => updateCertificate(index, "name", e.target.value)}
            />
            <TextField
              className="input-field"
              label="Issuer / Institution"
              placeholder="Issuing Organization..."
              value={entry.issuer}
              onChange={(e) => updateCertificate(index, "issuer", e.target.value)}
            />
            {certificates.length > 1 && index > 0 && (
              <Button className="remove-button" variant="outlined" color="error" onClick={() => removeCertificate(index)}>{<Clear/>}</Button>
            )}
          </div>
        ))}

        <Button className="add-button" variant="outlined" startIcon={<Add />} onClick={addCertificate}>
          Add Award / Certificate
        </Button>
      </div>
    </div>
  );
};

export default AboutSection;