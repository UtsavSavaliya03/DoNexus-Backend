const express = require("express");
const router = new express.Router();
const authController = require('../../Controllers/Auth/AuthController.js');

router.post("/signup", authController?.signup);
router.post("/signin", authController?.login);

module.exports = router;