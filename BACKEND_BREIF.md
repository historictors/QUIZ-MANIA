Act as a senior MERN developer. Build ONLY the backend for the Campus Quiz App in a "server" directory. The React frontend already exists in the "client" directory; do not change it in this step. Read PROJECT_SPEC.md in the project root for the full feature description. This prompt takes priority where they differ.

This is a working demo, not a production system. Keep the code simple and beginner-friendly. Put logic directly in controllers. Do not create services/ or utils/ folders unless truly needed. Do not add features that are not listed here. Skip automated tests, rate limiting, pagination and advanced security.

TECH
Node.js, Express, MongoDB with Mongoose, JWT, bcrypt, dotenv, cors. JavaScript only (CommonJS or ES modules, pick one and stay consistent). No CSV package: generate CSV manually.

FOLDER STRUCTURE
server/
  config/db.js
  controllers/ (auth, admin, faculty, student)
  middleware/ (auth.js with protect and authorize(...roles), errorHandler.js)
  models/ (User, Department, Quiz, Attempt)
  routes/ (auth, admin, faculty, student)
  scripts/seed.js
  app.js, server.js, package.json, .env.example

MODELS
1. Department: name (unique), code (unique, uppercase).
2. User: name, email (unique, lowercase, trimmed), password (hashed with bcrypt, never returned in responses), role ("admin" | "faculty" | "student"), rollNumber, department (ref Department), year (1 to 4, students only), timestamps.
   - rollNumber must be unique ONLY for students. Use a partial unique index: { rollNumber: 1 } with partialFilterExpression { role: "student", rollNumber: { $type: "string" } }. Admin and faculty must be able to exist without a roll number without duplicate key errors.
3. Quiz: title, subject, department (ref), year (1 to 4), timeLimit (minutes), startTime, endTime, questions[] ({ questionText, options: [String] exactly 4, correctAnswer: Number 0 to 3 }), createdBy (ref User), timestamps.
4. Attempt: quiz (ref), student (ref), answers[] ({ questionIndex, selectedAnswer }), totalQuestions, correctAnswers, wrongAnswers, unanswered, score, percentage, startedAt, deadline, submittedAt, status ("in-progress" | "submitted" | "auto-submitted"), timestamps. Add a compound unique index on { student: 1, quiz: 1 }.

AUTHENTICATION
- JWT stored by the frontend in localStorage and sent as "Authorization: Bearer <token>". Do NOT use cookies.
- Token expires in 1 day. Payload contains the user id and role.
- protect middleware verifies the token and loads the user. authorize(...roles) checks the role.
- Student registration always creates role "student". There is no public admin or faculty registration.

CONSISTENT RESPONSES
Success: { success: true, message, data }. Error: { success: false, message }. Use one error-handling middleware that also converts Mongoose validation errors, duplicate key errors (say which field: email or roll number) and invalid ObjectId errors into clear messages with the right status codes.

API ENDPOINTS

Auth
POST /api/auth/student/register  (name, email, password min 6, rollNumber, department id, year)
POST /api/auth/login  (single login for all roles, returns { token, user } where user includes role, name, email, department, year, rollNumber)
GET  /api/auth/me
GET  /api/departments  (public, used by the registration form and quiz form)

Admin (admin only)
GET  /api/admin/dashboard  (counts: faculty, students, departments, quizzes)
GET/POST /api/admin/faculty ; GET/PUT/DELETE /api/admin/faculty/:id
  - Faculty fields: name, email, password, department. Password is optional on update.
  - GET list supports ?search= (name or email) and ?department=
  - Block deleting a faculty member who has created quizzes: "Cannot delete: this faculty has created quizzes".
GET/POST /api/admin/departments ; PUT/DELETE /api/admin/departments/:id
  - Block deleting a department used by any user or quiz: "Cannot delete: department is in use".
GET  /api/admin/students  (view only, supports ?search= for name, email or roll number, and ?department=)

Faculty (faculty only, and only for quizzes they created)
GET  /api/faculty/dashboard  (total quizzes, upcoming, live, closed, total attempts, 5 recent quizzes)
GET/POST /api/faculty/quizzes ; GET/PUT/DELETE /api/faculty/quizzes/:id
  - Each quiz in the list includes a computed status (upcoming, live, closed) and attemptCount.
  - GET /:id includes correct answers (needed for editing).
  - PUT and DELETE are blocked if the quiz has any attempt: "Locked: students have already attempted this quiz".
  - Validation: all fields required, department exists, year 1 to 4, timeLimit > 0, endTime after startTime, at least one question, exactly 4 options per question (non-empty), correctAnswer between 0 and 3.
GET  /api/faculty/quizzes/:id/results  (supports ?search= by name or roll number; before returning, finalize overdue attempts, see below)
GET  /api/faculty/quizzes/:id/leaderboard  (top 5 sorted by score descending, then earliest submittedAt; includes rank, name, rollNumber, score, percentage; finalize overdue attempts first)
GET  /api/faculty/quizzes/:id/export  (CSV download with columns: Student Name, Roll Number, Email, Correct, Wrong, Unanswered, Score, Percentage, Submitted At; set Content-Type text/csv and Content-Disposition attachment; escape commas and quotes in values; finalize overdue attempts first)
  - Results include only submitted and auto-submitted attempts.

Student (student only)
GET  /api/student/dashboard  (counts of available, upcoming, live, completed quizzes for the student's department and year)
GET  /api/student/quizzes  (only quizzes matching the student's department and year; each with computed status)
GET  /api/student/quizzes/:id  (instructions info only: title, subject, number of questions, timeLimit, startTime, endTime, status; NO questions)
POST /api/student/quizzes/:id/start
GET  /api/student/quizzes/:id/attempt  (resume: returns questions without correctAnswer, saved answers, deadline, and server time)
PUT  /api/student/quizzes/:id/answers  (save current answers into the in-progress attempt)
POST /api/student/quizzes/:id/submit
GET  /api/student/results  (history, finalize this student's overdue attempts first)
GET  /api/student/results/:id  (one result summary, own attempts only)

QUIZ STATUS LOGIC (computed on the server using server time)
- upcoming: now < startTime
- live: startTime <= now < endTime
- closed: now >= endTime
- completed: the student has a submitted or auto-submitted attempt (takes priority for that student)
Always include serverTime in quiz attempt responses so the frontend timer uses the server clock.

START QUIZ (POST /api/student/quizzes/:id/start)
1. Quiz must exist and match the student's department and year.
2. Current time must be within startTime and endTime.
3. If an attempt exists: if in-progress, return it with the ORIGINAL deadline and saved answers; if submitted or auto-submitted, reject with "You have already attempted this quiz".
4. Otherwise create an Attempt with startedAt = now, status "in-progress" and deadline = min(startedAt + timeLimit minutes, quiz.endTime).
5. Return questions (questionText and options only, NEVER correctAnswer), attempt id, deadline, serverTime and any saved answers. Handle the duplicate key error from the unique index gracefully (return the existing attempt).

SAVE ANSWERS (PUT /api/student/quizzes/:id/answers)
Body: { answers: [{ questionIndex, selectedAnswer }] }. Only for the student's own in-progress attempt. Reject if now > deadline + 15 seconds. Validate indexes. Replace the saved answers.

SUBMIT (POST /api/student/quizzes/:id/submit)
1. Find the student's attempt; it must be in-progress.
2. Accept answers in the body (if missing, use the saved answers).
3. Allow a 15-second grace period: reject only if now > deadline + 15 seconds ("Time is over"). If now > deadline (but inside the grace period), save status "auto-submitted"; otherwise "submitted". The frontend may also send { auto: true } for timer-triggered submits; treat that as "auto-submitted" as long as the grace period is respected.
4. Grade: 1 mark per correct answer, no negative marking. Unanswered = questions without a valid selected answer. score = correctAnswers, percentage = score / totalQuestions * 100 rounded to 2 decimals.
5. Save everything, set submittedAt, and return { totalQuestions, correctAnswers, wrongAnswers, unanswered, score, percentage }. Do not return correct answers or a per-question review.
6. Never allow a second submission.

FINALIZING OVERDUE ATTEMPTS
Create one small helper function (in the controller file or a single shared file) that finds in-progress attempts whose deadline + 15 seconds has passed, grades their saved answers, sets status "auto-submitted" and submittedAt = deadline. Call it only from the faculty results, leaderboard, export and student results endpoints (scoped to the relevant quiz or student).

SEED SCRIPT (npm run seed)
Create server/scripts/seed.js that:
- Creates the admin from ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in .env (skip if that email exists).
- Creates default departments if missing: CSE, ECE, EEE, ME, Civil, IT (with codes).
- Is safe to run multiple times.

ENVIRONMENT
Create .env.example with placeholders only:
PORT=5000
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@college.com
ADMIN_PASSWORD=
Never hardcode secrets. Make sure .env is in .gitignore. CORS: allow CLIENT_URL (no credentials or cookies needed).

SCRIPTS
package.json scripts: "start": "node server.js", "dev": "nodemon server.js" (add nodemon as a dev dependency), "seed": "node scripts/seed.js".

WORKING METHOD
1. Inspect the project first and reuse what exists.
2. Install dependencies, create the files, and start the server.
3. Test every endpoint yourself (using a small script, curl, or Node fetch) for the main flows: register, login for each role, department CRUD, faculty CRUD, quiz create/edit/delete, student start, save answers, submit, resume, results, leaderboard, CSV export, and the error cases below. Fix every failure.
4. Do NOT touch the frontend in this step.
5. At the end, tell me exactly which values I must put in server/.env, the commands to run, and a short list of what you tested with the actual results (not just "it works").

ERROR CASES YOU MUST VERIFY
- Duplicate email and duplicate roll number on registration
- Creating two faculty accounts without roll numbers (no duplicate key error)
- Student cannot call faculty or admin endpoints (403)
- Faculty A cannot read, edit or see the results of Faculty B's quiz
- Student from a different department or year cannot start a quiz
- Starting before startTime or after endTime fails
- Second start returns the same attempt and deadline; start after submission is rejected
- Submit after deadline + 15 seconds is rejected; submit inside the grace period is accepted as auto-submitted
- The quiz payload for students never contains correctAnswer
- Editing or deleting a quiz with attempts is blocked
- Deleting a department in use or a faculty with quizzes is blocked