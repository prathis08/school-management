import { School, UserPreferences } from "../models/index.js";

class SettingsService {
  async getSchoolBySchoolId(schoolId) {
    if (!schoolId) {
      throw new Error("School ID is required");
    }
    const [school] = await School.findOrCreate({
      where: { schoolId },
      defaults: {
        schoolId,
        schoolName: schoolId,
        schoolCode: schoolId,
      },
    });
    return school;
  }

  async updateSchoolBySchoolId(schoolId, data) {
    const school = await this.getSchoolBySchoolId(schoolId);

    const allowedFields = [
      "schoolName",
      "phone",
      "email",
      "website",
      "address",
      "principalName",
      "principalPhone",
      "principalEmail",
      "establishedYear",
      "schoolType",
      "board",
      "affiliationNumber",
    ];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates[field] = data[field];
      }
    }

    await school.update(updates);
    return school.reload();
  }

  async getUserPreferences(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const [prefs] = await UserPreferences.findOrCreate({
      where: { userId },
      defaults: { userId },
    });
    return prefs;
  }

  async updateUserPreferences(userId, data) {
    const prefs = await this.getUserPreferences(userId);

    const allowedFields = ["theme", "primaryColor", "sidebarStyle", "language"];
    const updates = {};
    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        updates[field] = data[field];
      }
    }

    await prefs.update(updates);
    return prefs.reload();
  }
}

export default new SettingsService();
