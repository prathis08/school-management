import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default grades available across all schools
const DEFAULT_GRADES = [
  "Pre-Primary",
  "Primary",
  "LKG",
  "UKG",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

class GradeConfigService {
  constructor() {
    this.configPath = path.join(__dirname, "../../../config/school-grades.yml");
    this.config = null;
    this.loadConfig();
  }

  // Load configuration from YAML file
  loadConfig() {
    try {
      const fileContents = fs.readFileSync(this.configPath, "utf8");
      this.config = yaml.load(fileContents);
    } catch (error) {
      console.error("Error loading grade configuration:", error);
      this.config = this.getDefaultConfig();
    }
  }

  // Get default configuration if file is not available
  getDefaultConfig() {
    return {
      schools: {},
    };
  }

  // Get grade list for a specific school
  getGradeList(schoolId) {
    if (!schoolId) {
      return DEFAULT_GRADES;
    }

    const schoolConfig = this.config.schools?.[schoolId];
    if (schoolConfig && schoolConfig["grade list"]) {
      return schoolConfig["grade list"];
    }

    // Return default grades if school not configured
    return DEFAULT_GRADES;
  }

  // Check if a grade is valid for a school
  isValidGrade(schoolId, grade) {
    const grades = this.getGradeList(schoolId);
    return grades.includes(grade);
  }

  // Get grade configuration with metadata for a school
  getSchoolGrades(schoolId) {
    const grades = this.getGradeList(schoolId);

    return {
      schoolId,
      grades,
      totalGrades: grades.length,
    };
  }

  // Update school grade configuration (for admin use)
  updateSchoolGrades(schoolId, gradeList) {
    if (!this.config.schools) {
      this.config.schools = {};
    }

    if (!Array.isArray(gradeList) || gradeList.length === 0) {
      throw new Error("Grade list must be a non-empty array");
    }

    this.config.schools[schoolId] = {
      "grade list": gradeList,
    };

    this.saveConfig();
  }

  // Save configuration back to YAML file
  saveConfig() {
    try {
      const yamlStr = yaml.dump(this.config, {
        indent: 2,
        lineWidth: 120,
        noRefs: true,
      });
      fs.writeFileSync(this.configPath, yamlStr, "utf8");
    } catch (error) {
      console.error("Error saving grade configuration:", error);
      throw error;
    }
  }

  // Reload configuration from file
  reloadConfig() {
    this.loadConfig();
  }

  // Get all configured schools
  getConfiguredSchools() {
    return Object.keys(this.config.schools || {});
  }

  // Get default grades
  getDefaultGrades() {
    return [...DEFAULT_GRADES];
  }
}

// Create singleton instance
const gradeConfigService = new GradeConfigService();

export default gradeConfigService;
