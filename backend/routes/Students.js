const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

// Student Signup route
router.post('/signup', async (req, res) => {
  try {
    const { serviceId, name, groupNumber, username, password, token, workspaceName } = req.body;

    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({
      serviceId,
      name,
      groupNumber,
      username,
      password: hashedPassword,
      token,
      workspaceName,
    });

    await student.save();
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
