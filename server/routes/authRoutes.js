const express = require("express");
const { login } = require("../controllers/authController");

const router = express.Router();

// POST: Login and get JWT
router.post("/login", login);

module.exports = router;
