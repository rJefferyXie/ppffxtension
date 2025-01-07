import { useState, useEffect } from "react";
import { Button, Divider, TextField } from "@mui/material";
import { Add, Clear } from "@mui/icons-material";
import "../styles/resumeSection.css";

interface Entry {
  title: string;
  company?: string;
  description: string;
  startDate: string;
  endDate: string;
}

interface Skill {
  name: string;
  experience: string;
}

const ResumeSection: React.FC = () => {
  const defaultEntry: Entry = {
    title: "",
    company: "",
    description: "",
    startDate: "",
    endDate: "",
  };

  const defaultSkill: Skill = {
    name: "",
    experience: ""
  }

  const initializeEntries = (key: string, defaultEntry: Entry | Skill) => {
    const savedData = localStorage.getItem(key);

    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        return parsedData;
      }
    }

    return [defaultEntry];
  };

  const [workExperiences, setWorkExperiences] = useState<Entry[]>(
    initializeEntries("workExperiences", defaultEntry)
  );

  const [projects, setProjects] = useState<Entry[]>(
    initializeEntries("projects", defaultEntry)
  );

  const [skills, setSkills] = useState<Skill[]>(
    initializeEntries("skills", defaultSkill)
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("workExperiences", JSON.stringify(workExperiences));
      localStorage.setItem("projects", JSON.stringify(projects));
      localStorage.setItem("skills", JSON.stringify(skills));
    }, 500);
    return () => clearTimeout(timeout);
  }, [workExperiences, projects, skills]);

  const addSkill = () => {
    setSkills([...skills, { name: "", experience: "" }]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updated = [...skills];

    if (field === "experience") {
      // Allow only numbers from 1 to 99
      const isValidExperience = /^([1-9]|[1-9][0-9])?$/.test(value);
      if (isValidExperience) {
        updated[index][field] = value;
      }
    } else {
      updated[index][field] = value;
    }
    
    setSkills(updated);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const updated = [...skills];
      updated.splice(index, 1);
      setSkills(updated);
    }
  };

  const updateList = (
    entries: Entry[],
    setter: React.Dispatch<React.SetStateAction<Entry[]>>,
    index: number,
    field: keyof Entry,
    value: string
  ) => {
    setter(entries.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  };

  const addToList = (
    setter: React.Dispatch<React.SetStateAction<Entry[]>>,
    template: Entry = defaultEntry
  ) => {
    if (setter === setWorkExperiences && workExperiences.length >= 3) return;
    if (setter === setProjects && projects.length >= 3) return;
    setter((prev) => [...prev, { ...template }]);
  };

  const removeFromList = (
    entries: Entry[],
    setter: React.Dispatch<React.SetStateAction<Entry[]>>,
    index: number
  ) => {
    setter(entries.filter((_, i) => i !== index));
  };

  const renderEntries = (
    entries: Entry[],
    setter: React.Dispatch<React.SetStateAction<Entry[]>>,
    isWorkExperience: boolean
  ) => (
    entries.map((entry, index) => (
      <div key={index} className="input-container">
        <div className="experience-input-wrapper">
          <p className="entry-number">{'#' + (index + 1)}</p>
          <TextField
            className="experience-input-field"
            label={isWorkExperience ? "Job Title" : "Project Name"}
            value={entry.title}
            onChange={(e) => updateList(entries, setter, index, "title", e.target.value)}
          />
          {isWorkExperience && (
            <TextField
              className="experience-input-field"
              label="Company"
              value={entry.company || ""}
              onChange={(e) => updateList(entries, setter, index, "company", e.target.value)}
            />
          )}
          <TextField
            className="experience-input-field-date"
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={entry.startDate}
            onChange={(e) => updateList(entries, setter, index, "startDate", e.target.value)}
          />
          <TextField
            className="experience-input-field-date"
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={entry.endDate}
            onChange={(e) => updateList(entries, setter, index, "endDate", e.target.value)}
          />
          {entries.length > 1 && index > 0 &&
            <Button
              className="remove-button"
              variant="outlined"
              color="error"
              onClick={() => removeFromList(entries, setter, index)}
            >
              <Clear/>
            </Button>
          }
          <TextField
            className="experience-input-field-description"
            label={isWorkExperience ? "Job Description" : "Project Description"}
            placeholder={
              isWorkExperience
              ? "Please provide a brief summary of your role in this job (1-2 sentences). \n\n⋆ Highlight your most important contributions in this role (1-3 bullet points)."
              : "Please provide a brief summary of the project (1-2 sentences). \n\n⋆ Highlight your key contributions to the project (1-3 bullet points)."
            }
            multiline
            minRows={3}
            value={entry.description}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                updateList(entries, setter, index, "description", e.target.value);
              }
            }}
          />
          <p>{entry.description.length}/1000 characters</p>
        </div>
      </div>
    ))
  );

  return (
    <div className="resume-container">
      <div className="experience-section">
        <div className="sub-wrapper">
          <h3 className="section-title">WORK EXPERIENCE</h3>
          {renderEntries(workExperiences, setWorkExperiences, true)}
          <Button
            variant="outlined"
            className="add-button"
            startIcon={<Add/>}
            onClick={() => addToList(setWorkExperiences)}
            disabled={workExperiences.length >= 3}
          >
            Add Work Experience
          </Button>
        </div>

        <div className="sub-wrapper">
          <h3 className="section-title">PROJECTS</h3>
          {renderEntries(projects, setProjects, false)}
          <Button
            variant="outlined"
            className="add-button"
            startIcon={<Add/>}
            onClick={() => addToList(setProjects)}
            disabled={projects.length >= 3}
          >
            Add Project
          </Button>
        </div>
      </div>

      <Divider orientation="vertical" className="divider"/> 

      <div className="skill-section">
        <h3 className="skill-title">SKILLS</h3>

        {skills.map((skill, index) => (
          <div key={index} className="skill-wrapper">
            <TextField
              className="skill-input-field"
              label="Skill"
              placeholder="Skill (ex., JavaScript, Microsoft Word...)"
              value={skill.name}
              onChange={(e) => updateSkill(index, "name", e.target.value)}
            />
            <TextField
              className="skill-input-field-yoe"
              label="YOE"
              placeholder="1-99"
              value={skill.experience}
              onChange={(e) => updateSkill(index, "experience", e.target.value)}
            />
            {skills.length > 1 && (
              <Button
                className="remove-button"
                variant="outlined"
                color="error"
                onClick={() => removeSkill(index)}
              >
                <Clear/>
              </Button>
            )}
          </div>
        ))}

        <Button
          variant="outlined"
          className="add-button"
          startIcon={<Add/>}
          onClick={() => addSkill()}
        >
          Add Skill
        </Button>
      </div>
    </div>
  );
};

export default ResumeSection;