const express = require('express');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Student = require('./models/Student');
const Admin = require('./models/Admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const BITBUCKET_API_URL = 'https://api.bitbucket.org/2.0';

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    status: err.statusCode || 500,
  });

  const status = err.statusCode || 500;
  const response = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  res.status(status).json(response);
});

const validateCredentials = async (workspace, accessToken) => {
  try {
    const response = await axios.get(`${BITBUCKET_API_URL}/repositories/${workspace}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || error.message;
    throw new AppError(`Validation failed: ${message}`, status);
  }
};
// Login route to validate username and password and fetch workspace and token
app.post(
  '/api/login',
  asyncHandler(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError('Username and password are required.', 400));
    }

    const student = await Student.findOne({ username });
    if (!student) {
      return next(new AppError('Invalid username or password.', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return next(new AppError('Invalid username or password.', 401));
    }

    // Validate workspace and token
    const isValid = await validateCredentials(student.workspaceName, student.token);
    if (!isValid) {
      return next(new AppError('Workspace or token validation failed.', 401));
    }

    res.json({
      success: true,
      message: 'Login successful',
      workspace: student.workspaceName,
      token: student.token,
    });
  })
);

app.get(
  '/api/projects',
  asyncHandler(async (req, res, next) => {
    const { workspace } = req.query;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!workspace || !accessToken) {
      return next(new AppError('Workspace and access token are required.', 400));
    }

    try {
      const response = await axios.get(`${BITBUCKET_API_URL}/repositories/${workspace}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const repositories = response.data.values.map((repo) => ({
        name: repo.name,
        slug: repo.slug,
        description: repo.description,
        updated_on: repo.updated_on,
      }));

      res.json({ success: true, repositories });
    } catch (error) {
      next(new AppError('Failed to fetch repositories. Check your workspace or token.', 500));
    }
  })
);

app.get(
  '/api/commits',
  asyncHandler(async (req, res, next) => {
    const { workspace, repoSlug } = req.query;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!workspace || !repoSlug || !accessToken) {
      return next(new AppError('Workspace, repoSlug, and access token are required.', 400));
    }

    try {
      const response = await axios.get(`${BITBUCKET_API_URL}/repositories/${workspace}/${repoSlug}/commits`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const commits = response.data.values.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author.raw,
        date: commit.date,
      }));

      res.json({ success: true, commits });
    } catch (error) {
      next(new AppError('Failed to fetch commits. Check your workspace, repoSlug, or token.', 500));
    }
  })
);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected Successfully"))
.catch(err => console.error("MongoDB Connection Error:", err));

const adminRoutes = require('./routes/Admins');
app.use('/api/admin', adminRoutes);


const studentRoutes = require('./routes/Students');
app.use('/api/students', studentRoutes);


app.get('/', (req, res) => {
  res.send('Bitbucket Dashboard Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
