import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { Add, Clear } from "@mui/icons-material";
import "../styles/skillsSection.css";

interface SkillInterface {
  name: string;
  experience: string;
}

const SkillsSection = () => {
  const [skills, setSkills] = useState<SkillInterface[]>(
    JSON.parse(localStorage.getItem("skills") || '[{"name":"","experience":""}]')
  );

  // Auto-save changes to localStorage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("skills", JSON.stringify(skills));
    }, 500); // Save after 500ms of no typing
    return () => clearTimeout(timeout);
  }, [skills]);

  const addSkill = () => {
    setSkills([...skills, { name: "", experience: "" }]);
  };

  const updateSkill = (index: number, field: keyof SkillInterface, value: string) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      const updated = [...skills];
      updated.splice(index, 1);
      setSkills(updated);
    }
  };

  return (
    <div className="skills-section">
      <div className="sub-wrapper">
        <h3 className="section-title">SKILLS</h3>
        {skills.map((skill, index) => (
          <div key={index} className="input-wrapper">
            <TextField
              className="input-field"
              label="Skill"
              placeholder="Skill (e.g., JavaScript, Microsoft Word...)"
              value={skill.name}
              onChange={(e) => updateSkill(index, "name", e.target.value)}
            />
            <TextField
              className="input-field"
              label="Years of Experience"
              placeholder="Optional (e.g., 2 years)..."
              value={skill.experience}
              onChange={(e) => updateSkill(index, "experience", e.target.value)}
            />
            {skills.length > 1 && (
              <Button
                className="remove-button"
                variant="outlined"
                color="error"
                startIcon={<Clear />}
                onClick={() => removeSkill(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <Button
          className="add-button"
          variant="outlined"
          startIcon={<Add />}
          onClick={addSkill}
        >
          Add Skill
        </Button>
      </div>
    </div>
  );
};

export default SkillsSection;