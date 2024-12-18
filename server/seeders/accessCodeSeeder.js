const dotenv = require("dotenv");
const connectDB = require("../database/connectDB");
const AccessCode = require("../models/AccessCode");

// Load environment variables
dotenv.config();

// Seed function
const seedAccessCodes = async () => {
  try {
    // Connect to the database
    await connectDB();

    console.log("Seeding access codes...");
    await AccessCode.deleteMany();

    const accessCodes = [];
    const day = new Date().getDate().toString().padStart(2, "0");
    const seededCodes = accessCodes.map((code) => ({
      accessCode: `${code}${day}`,
    }));

    await AccessCode.insertMany(seededCodes);
    console.log("Access codes seeded successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding access codes:", error.message);
    process.exit(1);
  }
};

seedAccessCodes();
