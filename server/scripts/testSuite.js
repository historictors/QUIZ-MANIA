const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const http = require('http');
const app = require('../app');
const connectDB = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let parsed;
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            try {
              parsed = JSON.parse(data);
            } catch (e) {
              parsed = data;
            }
          } else {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  await connectDB();
  const PORT = 5005;
  server = app.listen(PORT);
  baseUrl = `http://127.0.0.1:${PORT}`;
  console.log(`Test server running at ${baseUrl}`);

  try {
    // Clean up test data (keep departments and admin)
    await User.deleteMany({ email: { $ne: 'admin@college.com' } });
    await Quiz.deleteMany({});
    await Attempt.deleteMany({});

    console.log('\n--- 1. Testing Departments Endpoint ---');
    const deptsRes = await request('GET', '/api/departments');
    assert(deptsRes.status === 200, 'GET /api/departments returns 200');
    assert(deptsRes.body.success === true, 'GET /api/departments success is true');
    assert(Array.isArray(deptsRes.body.data) && deptsRes.body.data.length >= 6, 'Departments seeded properly');
    const cseDept = deptsRes.body.data.find((d) => d.code === 'CSE');
    const eceDept = deptsRes.body.data.find((d) => d.code === 'ECE');
    assert(!!cseDept && !!eceDept, 'Found CSE and ECE departments');

    console.log('\n--- 2. Testing Admin Login ---');
    const adminLoginRes = await request('POST', '/api/auth/login', {
      email: 'admin@college.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPass123!'
    });
    assert(adminLoginRes.status === 200, 'Admin login returns 200');
    assert(adminLoginRes.body.data.token, 'Admin login returns JWT token');
    const adminToken = adminLoginRes.body.data.token;
    assert(adminLoginRes.body.data.user.role === 'admin', 'Admin role returned');

    console.log('\n--- 3. Testing Admin Dashboard ---');
    const adminDashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(adminDashRes.status === 200, 'GET /api/admin/dashboard returns 200');
    assert(typeof adminDashRes.body.data.faculty === 'number', 'Admin dashboard has faculty count');
    assert(typeof adminDashRes.body.data.departments === 'number', 'Admin dashboard has departments count');

    console.log('\n--- 4. Testing Faculty Creation & Two Faculty Accounts Without Roll Number ---');
    const fac1Res = await request(
      'POST',
      '/api/admin/faculty',
      {
        name: 'Dr. Alan Turing',
        email: 'alan@college.com',
        password: 'Password123!',
        department: cseDept._id
      },
      adminToken
    );
    assert(fac1Res.status === 201, 'Faculty 1 created');
    const fac1Id = fac1Res.body.data._id;

    const fac2Res = await request(
      'POST',
      '/api/admin/faculty',
      {
        name: 'Dr. Ada Lovelace',
        email: 'ada@college.com',
        password: 'Password123!',
        department: cseDept._id
      },
      adminToken
    );
    assert(fac2Res.status === 201, 'Faculty 2 created (no roll number conflict with Faculty 1)');
    const fac2Id = fac2Res.body.data._id;

    // Faculty login
    const fac1Login = await request('POST', '/api/auth/login', {
      email: 'alan@college.com',
      password: 'Password123!'
    });
    assert(fac1Login.status === 200, 'Faculty 1 login successful');
    const fac1Token = fac1Login.body.data.token;

    const fac2Login = await request('POST', '/api/auth/login', {
      email: 'ada@college.com',
      password: 'Password123!'
    });
    assert(fac2Login.status === 200, 'Faculty 2 login successful');
    const fac2Token = fac2Login.body.data.token;

    console.log('\n--- 5. Testing Student Registration & Duplicate Validations ---');
    const student1Res = await request('POST', '/api/auth/student/register', {
      name: 'John Doe',
      email: 'john@college.com',
      password: 'password123',
      rollNumber: 'CS001',
      department: cseDept._id,
      year: 3
    });
    assert(student1Res.status === 201, 'Student 1 registered successfully');
    const student1Token = student1Res.body.data.token;
    assert(student1Res.body.data.user.role === 'student', 'Student role is "student"');

    // Duplicate email
    const dupEmailRes = await request('POST', '/api/auth/student/register', {
      name: 'John Clone',
      email: 'john@college.com',
      password: 'password123',
      rollNumber: 'CS002',
      department: cseDept._id,
      year: 3
    });
    assert(dupEmailRes.status === 400, 'Duplicate email rejected with 400');
    assert(dupEmailRes.body.message.includes('Email is already registered'), 'Duplicate email error message verified');

    // Duplicate roll number
    const dupRollRes = await request('POST', '/api/auth/student/register', {
      name: 'John Clone 2',
      email: 'john2@college.com',
      password: 'password123',
      rollNumber: 'CS001',
      department: cseDept._id,
      year: 3
    });
    assert(dupRollRes.status === 400, 'Duplicate roll number rejected with 400');
    assert(dupRollRes.body.message.includes('Roll number is already registered'), 'Duplicate roll number error message verified');

    // Student 2 (ECE, Year 3)
    const student2Res = await request('POST', '/api/auth/student/register', {
      name: 'Bob Smith',
      email: 'bob@college.com',
      password: 'password123',
      rollNumber: 'EC001',
      department: eceDept._id,
      year: 3
    });
    assert(student2Res.status === 201, 'Student 2 (ECE) registered successfully');
    const student2Token = student2Res.body.data.token;

    console.log('\n--- 6. Testing Role-Based Access Control (403 Forbidden) ---');
    const studentAdminAccess = await request('GET', '/api/admin/dashboard', null, student1Token);
    assert(studentAdminAccess.status === 403, 'Student cannot access admin dashboard (403)');

    const studentFacultyAccess = await request('GET', '/api/faculty/dashboard', null, student1Token);
    assert(studentFacultyAccess.status === 403, 'Student cannot access faculty dashboard (403)');

    const facultyAdminAccess = await request('GET', '/api/admin/dashboard', null, fac1Token);
    assert(facultyAdminAccess.status === 403, 'Faculty cannot access admin dashboard (403)');

    console.log('\n--- 7. Testing Quiz Creation & Validation ---');
    const now = Date.now();
    const liveStartTime = new Date(now - 10 * 60 * 1000); // started 10 mins ago
    const liveEndTime = new Date(now + 50 * 60 * 1000); // ends in 50 mins

    const quizPayload = {
      title: 'Operating Systems Quiz',
      subject: 'Computer Science',
      department: cseDept._id,
      year: 3,
      timeLimit: 30, // 30 minutes
      startTime: liveStartTime.toISOString(),
      endTime: liveEndTime.toISOString(),
      questions: [
        {
          questionText: 'What is a process?',
          options: ['A program in execution', 'A static file', 'A hardware component', 'None of the above'],
          correctAnswer: 0
        },
        {
          questionText: 'Which algorithm is non-preemptive?',
          options: ['Round Robin', 'FCFS', 'SRTF', 'Priority Preemptive'],
          correctAnswer: 1
        }
      ]
    };

    const createQuizRes = await request('POST', '/api/faculty/quizzes', quizPayload, fac1Token);
    assert(createQuizRes.status === 201, 'Faculty 1 created quiz successfully');
    const quizId = createQuizRes.body.data._id;

    // Faculty A cannot read, edit or see results of Faculty B's quiz
    const fac2AccessQuiz = await request('GET', `/api/faculty/quizzes/${quizId}`, null, fac2Token);
    assert(fac2AccessQuiz.status === 404, "Faculty 2 cannot view Faculty 1's quiz (404)");

    const fac2UpdateQuiz = await request(
      'PUT',
      `/api/faculty/quizzes/${quizId}`,
      { title: 'Hacked Title' },
      fac2Token
    );
    assert(fac2UpdateQuiz.status === 404, "Faculty 2 cannot update Faculty 1's quiz (404)");

    console.log('\n--- 8. Testing Student Quiz Eligibility ---');
    // Student 2 is ECE, quiz is CSE
    const ineligibleStart = await request('POST', `/api/student/quizzes/${quizId}/start`, null, student2Token);
    assert(ineligibleStart.status === 403, 'Student with different department cannot start quiz (403)');

    console.log('\n--- 9. Testing Student Start Quiz & Payload Sanitization ---');
    const startRes = await request('POST', `/api/student/quizzes/${quizId}/start`, null, student1Token);
    assert(startRes.status === 200, 'Eligible student starts quiz successfully');
    assert(startRes.body.data.attemptId, 'Attempt ID returned');
    assert(startRes.body.data.deadline, 'Deadline returned');
    assert(startRes.body.data.serverTime, 'ServerTime returned');
    assert(Array.isArray(startRes.body.data.questions), 'Questions returned');
    assert(startRes.body.data.questions[0].correctAnswer === undefined, 'Quiz payload NEVER contains correctAnswer');

    // Second start returns same attempt and deadline
    const secondStart = await request('POST', `/api/student/quizzes/${quizId}/start`, null, student1Token);
    assert(secondStart.status === 200, 'Second start succeeds');
    assert(secondStart.body.data.attemptId === startRes.body.data.attemptId, 'Returns the exact same attempt ID');
    assert(secondStart.body.data.deadline === startRes.body.data.deadline, 'Returns the exact same original deadline');

    console.log('\n--- 10. Testing Save Answers & Resume Attempt ---');
    const saveAnsRes = await request(
      'PUT',
      `/api/student/quizzes/${quizId}/answers`,
      {
        answers: [
          { questionIndex: 0, selectedAnswer: 0 }, // correct
          { questionIndex: 1, selectedAnswer: 2 }  // wrong (correct is 1)
        ]
      },
      student1Token
    );
    assert(saveAnsRes.status === 200, 'Answers saved successfully');

    const resumeRes = await request('GET', `/api/student/quizzes/${quizId}/attempt`, null, student1Token);
    assert(resumeRes.status === 200, 'Attempt resumed');
    assert(resumeRes.body.data.savedAnswers.length === 2, 'Saved answers preserved');

    console.log('\n--- 11. Testing Quiz Lock (Editing/Deleting Quiz With Attempts) ---');
    const editQuizBlocked = await request(
      'PUT',
      `/api/faculty/quizzes/${quizId}`,
      { title: 'Attempted edit' },
      fac1Token
    );
    assert(editQuizBlocked.status === 400, 'Editing quiz with attempts is blocked (400)');
    assert(editQuizBlocked.body.message.includes('Locked: students have already attempted this quiz'), 'Lock error message verified');

    const deleteQuizBlocked = await request('DELETE', `/api/faculty/quizzes/${quizId}`, null, fac1Token);
    assert(deleteQuizBlocked.status === 400, 'Deleting quiz with attempts is blocked (400)');
    assert(deleteQuizBlocked.body.message.includes('Locked: students have already attempted this quiz'), 'Lock error message verified');

    console.log('\n--- 12. Testing Quiz Submission & Grading ---');
    const submitRes = await request('POST', `/api/student/quizzes/${quizId}/submit`, {}, student1Token);
    assert(submitRes.status === 200, 'Quiz submitted successfully');
    assert(submitRes.body.data.totalQuestions === 2, 'Total questions is 2');
    assert(submitRes.body.data.correctAnswers === 1, 'Correct answers is 1');
    assert(submitRes.body.data.wrongAnswers === 1, 'Wrong answers is 1');
    assert(submitRes.body.data.score === 1, 'Score is 1');
    assert(submitRes.body.data.percentage === 50, 'Percentage is 50%');

    // Starting or submitting again after submission is rejected
    const startAfterSubmit = await request('POST', `/api/student/quizzes/${quizId}/start`, null, student1Token);
    assert(startAfterSubmit.status === 400, 'Start after submission is rejected (400)');

    const submitAgain = await request('POST', `/api/student/quizzes/${quizId}/submit`, {}, student1Token);
    assert(submitAgain.status === 400, 'Second submission is rejected (400)');

    console.log('\n--- 13. Testing Results, Leaderboard, and CSV Export ---');
    const resultsRes = await request('GET', `/api/faculty/quizzes/${quizId}/results`, null, fac1Token);
    assert(resultsRes.status === 200, 'Faculty quiz results returned 200');
    assert(resultsRes.body.data.length === 1, 'Results include student attempt');

    const lbRes = await request('GET', `/api/faculty/quizzes/${quizId}/leaderboard`, null, fac1Token);
    assert(lbRes.status === 200, 'Faculty quiz leaderboard returned 200');
    assert(lbRes.body.data[0].rank === 1 && lbRes.body.data[0].score === 1, 'Leaderboard correct');

    const exportRes = await request('GET', `/api/faculty/quizzes/${quizId}/export`, null, fac1Token);
    assert(exportRes.status === 200, 'CSV export returned 200');
    assert(exportRes.headers['content-type'].includes('text/csv'), 'Content-Type is text/csv');
    assert(exportRes.body.includes('Student Name,Roll Number,Email'), 'CSV contains header columns');
    assert(exportRes.body.includes('John Doe'), 'CSV contains student record');

    console.log('\n--- 14. Testing Grace Period and Overdue Submission ---');
    // Create an expired attempt for student 2 to verify grace period & overdue
    const expiredStartTime = new Date(now - 40 * 60 * 1000);
    const expiredEndTime = new Date(now + 10 * 60 * 1000);
    const quiz2 = await Quiz.create({
      title: 'ECE Quiz',
      subject: 'Electronics',
      department: eceDept._id,
      year: 3,
      timeLimit: 1, // 1 min
      startTime: expiredStartTime,
      endTime: expiredEndTime,
      questions: [
        {
          questionText: 'What is Ohm’s law?',
          options: ['V=IR', 'P=VI', 'F=ma', 'E=mc^2'],
          correctAnswer: 0
        }
      ],
      createdBy: fac1Id
    });

    // Start quiz for student 2
    const s2Start = await request('POST', `/api/student/quizzes/${quiz2._id}/start`, null, student2Token);
    assert(s2Start.status === 200, 'Student 2 started quiz 2');

    // Force attempt deadline to 20 seconds in the past (> 15 seconds grace period)
    await Attempt.findByIdAndUpdate(s2Start.body.data.attemptId, {
      deadline: new Date(now - 20 * 1000)
    });

    const lateSubmit = await request('POST', `/api/student/quizzes/${quiz2._id}/submit`, {}, student2Token);
    assert(lateSubmit.status === 400, 'Submit after deadline + 15 seconds is rejected');
    assert(lateSubmit.body.message.includes('Time is over'), 'Rejected with "Time is over"');

    // Test inside grace period (deadline 5 seconds ago)
    const quiz3 = await Quiz.create({
      title: 'Grace Period Quiz',
      subject: 'Electronics',
      department: eceDept._id,
      year: 3,
      timeLimit: 1,
      startTime: expiredStartTime,
      endTime: expiredEndTime,
      questions: [
        {
          questionText: 'Q1',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0
        }
      ],
      createdBy: fac1Id
    });
    const s2StartQuiz3 = await request('POST', `/api/student/quizzes/${quiz3._id}/start`, null, student2Token);
    await Attempt.findByIdAndUpdate(s2StartQuiz3.body.data.attemptId, {
      deadline: new Date(now - 5 * 1000) // 5s ago, within 15s grace
    });
    const graceSubmit = await request(
      'POST',
      `/api/student/quizzes/${quiz3._id}/submit`,
      { answers: [{ questionIndex: 0, selectedAnswer: 0 }] },
      student2Token
    );
    assert(graceSubmit.status === 200, 'Submit inside grace period is accepted');
    const checkedAttempt = await Attempt.findById(s2StartQuiz3.body.data.attemptId);
    assert(checkedAttempt.status === 'auto-submitted', 'Status marked as auto-submitted for grace period submission');

    console.log('\n--- 15. Testing Deletion Blocks for Department in Use & Faculty with Quizzes ---');
    const deleteDeptBlocked = await request('DELETE', `/api/admin/departments/${cseDept._id}`, null, adminToken);
    assert(deleteDeptBlocked.status === 400, 'Deleting department in use is blocked (400)');
    assert(deleteDeptBlocked.body.message.includes('Cannot delete: department is in use'), 'Department in use error message verified');

    const deleteFacBlocked = await request('DELETE', `/api/admin/faculty/${fac1Id}`, null, adminToken);
    assert(deleteFacBlocked.status === 400, 'Deleting faculty with quizzes is blocked (400)');
    assert(deleteFacBlocked.body.message.includes('Cannot delete: this faculty has created quizzes'), 'Faculty with quizzes error message verified');

    console.log('\n🎉 ALL BACKEND TEST CASES PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('Test suite encountered an error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    process.exit(process.exitCode || 0);
  }
}

runTests();
