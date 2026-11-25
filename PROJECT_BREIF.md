# Project: Campus Quiz App (MERN Stack)

Act as a senior MERN stack developer. Build a complete, functional, role-based Campus Quiz Application for a college.

The application must be simple, maintainable, responsive, and fully functional.

Do not overengineer the project. Avoid unnecessary abstractions, advanced security implementations, complex state management, and unnecessary libraries.

## 1. Technology Stack

### Frontend
- React.js with Vite
- JavaScript (not TypeScript)
- Tailwind CSS
- React Router DOM
- Axios
- React Icons or Lucide React
- React Toastify or Sonner for notifications

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt for password hashing
- dotenv
- cors
- json2csv for CSV exports

Use JavaScript throughout the project.

## 2. Project Architecture

Create two separate folders:

```text
campus-quiz/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── faculty/
│   │   │   └── student/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── scripts/
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

Maintain a clear separation between frontend, backend, database models, routes, and controllers.

## 3. User Roles

Implement three roles:

### Admin
- Admin account is created through a database seed script.
- Admin can log in.
- Admin can create faculty accounts.
- Admin can manage departments.
- Admin can view registered students.
- Admin can view dashboard statistics.

### Faculty
- Faculty accounts are created by admin.
- Faculty can log in.
- Faculty can create quizzes.
- Faculty can edit and delete their own quizzes.
- Faculty can view student results.
- Faculty can view the top-5 leaderboard.
- Faculty can download CSV reports.

### Student
- Students can register independently.
- Students can log in.
- Students can view quizzes matching their department and year.
- Students can attempt live quizzes.
- Students can submit answers.
- Students can immediately view results.
- Students can view their attempt history.

## 4. Authentication and Authorization

Implement authentication using JWT.

Requirements:

1. Student registration with email and password.
2. Admin login using seeded credentials.
3. Faculty login using admin-created credentials.
4. Store hashed passwords using bcrypt.
5. Store JWT in an HTTP-only cookie.
6. Create authentication middleware.
7. Create role-based authorization middleware.
8. Redirect users to their respective dashboards after login.
9. Prevent students from accessing faculty and admin pages.
10. Prevent faculty from accessing admin pages.

Create a seed script:

```text
server/scripts/seedAdmin.js
```

Admin credentials should come from environment variables:

```env
ADMIN_NAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

Do not create a public admin registration page.

## 5. Admin Module

Create the following pages:

### Admin Dashboard
Display:
- Total Faculty
- Total Students
- Total Departments
- Total Quizzes

### Faculty Management
Features:
- Display faculty in a table.
- Add faculty.
- Edit faculty details.
- Delete faculty.
- Search faculty by name or email.
- Filter by department.

Faculty fields:
- Name
- Email
- Password
- Department

### Department Management
Features:
- Add department.
- Edit department.
- Delete department.
- View all departments.

Department fields:
- Department Name
- Department Code

Prevent deleting departments that are currently being used by students, faculty, or quizzes.

### Student Management
Display:
- Name
- Email
- Roll Number
- Department
- Year

Allow searching and filtering.

## 6. Faculty Module

Create the following pages:

### Faculty Dashboard

Display:
- Total Quizzes Created
- Upcoming Quizzes
- Live Quizzes
- Closed Quizzes
- Total Student Attempts

Include a section showing recently created quizzes.

### My Quizzes

Display quizzes in cards or a table.

Each quiz should display:
- Title
- Subject
- Department
- Year
- Start Time
- End Time
- Time Limit
- Status

Provide actions:
- View
- Edit
- Delete
- View Results

### Create Quiz

Create a form containing:

- Quiz Title
- Subject
- Department (dropdown populated from database)
- Year (1st, 2nd, 3rd, 4th)
- Time Limit in Minutes
- Start Date and Time
- End Date and Time
- Questions

Validate that:
- All required fields are completed.
- End time is after start time.
- Time limit is greater than zero.
- At least one question exists.

### Question Builder

Allow faculty to:
- Add questions.
- Remove questions.
- Edit questions.
- Enter four options.
- Select exactly one correct option.

Provide an easy-to-use question editor.

Example:

Question: What does MERN stand for?

A. MongoDB, Express, React, Node.js
B. MySQL, Express, React, Next.js
C. MongoDB, Ember, React, Node.js
D. MySQL, Express, Redux, Node.js

Correct Answer: A

### Edit and Delete Quiz

Faculty can only edit or delete quizzes they created.

Important:
Once a quiz has any student attempt, prevent changes to its questions, timing, department, year, or time limit. This keeps existing attempts and results consistent.

Allow editing or deletion only when there are no attempts.

### Quiz Results

Display a table containing:

- Student Name
- Roll Number
- Email
- Correct Answers
- Wrong Answers
- Unanswered
- Score
- Percentage
- Submission Time

Include:
- Search
- Sorting
- CSV Download

### Leaderboard

Display the top five students.

Sort by:
1. Highest score.
2. Earliest submission time when scores are equal.

Show:
- Rank
- Student Name
- Roll Number
- Score
- Percentage

## 7. Student Module

Create the following pages:

### Student Registration

Fields:
- Full Name
- Email
- Password
- Roll Number
- Department
- Year

Department dropdown must load departments from MongoDB.

Validation:
- Required fields.
- Valid email.
- Unique email.
- Unique roll number.
- Password required.
- Valid department.
- Year between 1 and 4.

### Student Dashboard

Display:
- Welcome message with student name.
- Total Available Quizzes.
- Upcoming Quizzes.
- Live Quizzes.
- Completed Quizzes.

Display assigned quizzes in cards.

Each card should contain:
- Quiz Title
- Subject
- Department
- Year
- Duration
- Start Time
- End Time
- Status

### Quiz Status Logic

Calculate status using the current server time.

Upcoming:
Current time < start time.

Live:
Current time >= start time AND current time < end time.

Closed:
Current time >= end time.

Completed:
Student has already submitted the quiz.

Completed status takes priority for an individual student.

Do not rely exclusively on frontend status calculations.

### Quiz Instructions Page

Before starting the quiz, display:
- Quiz Title
- Subject
- Number of Questions
- Time Limit
- Start and End Time

Show basic instructions:
- Only one attempt is allowed.
- The timer starts when the quiz starts.
- Answers are submitted when the timer expires.
- The quiz cannot be restarted after submission.

Include a Start Quiz button.

### Quiz Attempt Page

This is an important part of the application.

Requirements:

1. Display one question at a time.
2. Display four answer options.
3. Allow selecting one answer.
4. Previous and Next buttons.
5. Display question navigation numbers.
6. Highlight answered questions.
7. Highlight unanswered questions.
8. Display total questions.
9. Display a countdown timer.
10. Display a Submit Quiz button.

Timer behavior:

- Start timer using the deadline returned by the backend.
- Do not trust a frontend-only countdown.
- Calculate remaining time from the server-provided deadline.
- Automatically submit when the deadline is reached.
- Prevent submission after the quiz's end time.
- On browser refresh, resume the existing attempt with the correct remaining time.
- Do not allow another attempt after submission.

### Quiz Result Page

Immediately after submission, display:

- Total Questions
- Correct Answers
- Wrong Answers
- Unanswered Questions
- Final Score
- Percentage

Example:

Score: 8/10
Correct: 8
Wrong: 1
Unanswered: 1
Percentage: 80%

Show a button to return to the dashboard.

### Attempt History

Display a table:

- Quiz Title
- Subject
- Attempt Date
- Score
- Percentage
- Status

Allow students to view their previous results.

## 8. MongoDB Models

Create four main models:

1. User
2. Department
3. Quiz
4. Attempt

Use the following data structure.

### User Model

```javascript
{
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["admin", "faculty", "student"]
  },
  rollNumber: String,
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  year: Number
}
```

Add timestamps and appropriate unique indexes.

Roll number should be unique among students.

### Department Model

```javascript
{
  name: String,
  code: String
}
```

Both name and code must be unique.

### Quiz Model

```javascript
{
  title: String,
  subject: String,

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  year: Number,
  timeLimit: Number,

  startTime: Date,
  endTime: Date,

  questions: [
    {
      questionText: String,
      options: [String],
      correctAnswer: Number
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}
```

### Attempt Model

Use these fields:

```javascript
{
  quiz: ObjectId,
  student: ObjectId,

  answers: [
    {
      questionIndex: Number,
      selectedAnswer: Number
    }
  ],

  totalQuestions: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  unanswered: Number,

  score: Number,
  percentage: Number,

  startedAt: Date,
  submittedAt: Date,

  status: {
    type: String,
    enum: [
      "in-progress",
      "submitted",
      "auto-submitted"
    ]
  }
}
```

Create a compound unique index on:

```javascript
{ student: 1, quiz: 1 }
```

An attempt document should be created when a student starts a quiz, not only when the quiz is submitted.

This allows the application to:
- Store the original start time.
- Prevent duplicate attempts.
- Resume attempts after refresh.
- Calculate the remaining time correctly.

## 9. REST API Development

Implement the following API structure.

### Authentication

```text
POST   /api/auth/student/register
POST   /api/auth/admin/login
POST   /api/auth/faculty/login
POST   /api/auth/student/login
GET    /api/auth/me
POST   /api/auth/logout
```

### Admin

```text
GET    /api/admin/dashboard

GET    /api/admin/faculty
POST   /api/admin/faculty
GET    /api/admin/faculty/:id
PUT    /api/admin/faculty/:id
DELETE /api/admin/faculty/:id

GET    /api/admin/departments
POST   /api/admin/departments
GET    /api/admin/departments/:id
PUT    /api/admin/departments/:id
DELETE /api/admin/departments/:id

GET    /api/admin/students
GET    /api/admin/students/:id
DELETE /api/admin/students/:id
```

### Faculty

```text
GET    /api/faculty/dashboard

GET    /api/faculty/quizzes
POST   /api/faculty/quizzes
GET    /api/faculty/quizzes/:id
PUT    /api/faculty/quizzes/:id
DELETE /api/faculty/quizzes/:id

GET    /api/faculty/quizzes/:id/results
GET    /api/faculty/quizzes/:id/leaderboard
GET    /api/faculty/quizzes/:id/export
```

### Student

```text
GET    /api/student/dashboard

GET    /api/student/quizzes
GET    /api/student/quizzes/:id

POST   /api/student/quizzes/:id/start
GET    /api/student/quizzes/:id/attempt
POST   /api/student/quizzes/:id/submit

GET    /api/student/results
GET    /api/student/results/:id
```

## 10. Quiz Attempt Logic

Implement this carefully.

### Starting a Quiz

When the student clicks Start Quiz:

1. Verify student authentication.
2. Fetch quiz from MongoDB.
3. Verify department and year eligibility.
4. Verify current time is within quiz schedule.
5. Check whether an attempt already exists.
6. If an existing attempt is in progress, return that attempt and its original deadline.
7. If an existing attempt is submitted, reject the request.
8. Otherwise create a new attempt with `startedAt` and `in-progress` status.
9. Return questions without correct answers.

Calculate the deadline as:

```javascript
const deadline = new Date(
  Math.min(
    startedAt.getTime() + quiz.timeLimit * 60 * 1000,
    quiz.endTime.getTime()
  )
);
```

Return the deadline to the frontend.

### Submitting a Quiz

When the student submits:

1. Fetch the quiz and attempt.
2. Verify attempt ownership.
3. Verify that the attempt is still in progress.
4. Validate submitted answers.
5. Compare answers with correct answers stored in MongoDB.
6. Calculate correct, wrong, and unanswered questions.
7. Calculate score and percentage.
8. Save results in the Attempt collection.
9. Change status to submitted or auto-submitted.
10. Return the final result.

Reject late submissions and prevent duplicate submissions.

The server must enforce the deadline even if the frontend timer is manipulated.

Do not send correct answers to the student before submission.

## 11. Frontend Design Requirements

Create a modern, clean, professional college dashboard interface.

Design direction:

- Minimal and modern UI.
- Professional academic dashboard appearance.
- White or light background.
- Dark navy or slate text.
- Blue or indigo primary color.
- Soft borders and subtle shadows.
- Rounded cards.
- Clear typography.
- Consistent spacing.
- Responsive layouts.

Use a consistent design system across all three roles.

### Dashboard Layout

Use:
- Sidebar navigation on desktop.
- Top navigation bar.
- User profile section.
- Main content area.
- Responsive mobile navigation.

### Tables

All tables should have:
- Clear headings.
- Proper spacing.
- Search functionality where applicable.
- Empty states.
- Loading states.
- Responsive behavior.

### Forms

All forms should have:
- Labels.
- Appropriate input types.
- Validation messages.
- Loading states.
- Success and error notifications.

### Quiz Interface

The quiz interface should prioritize readability and distraction-free answering.

Use:
- Large question text.
- Clearly separated answer options.
- Visible countdown timer.
- Question navigation panel.
- Clear submit confirmation dialog.

Avoid unnecessary animations and decorative elements.

## 12. Validation and Error Handling

Implement basic validation on both frontend and backend.

Validate:
- Required fields.
- Email format.
- Duplicate email.
- Duplicate roll number.
- Department existence.
- Valid year.
- Exactly four options per question.
- Exactly one correct answer.
- Valid start and end times.
- Positive time limit.

Use consistent API responses:

Success:

```javascript
{
  success: true,
  message: "Operation successful",
  data: {}
}
```

Error:

```javascript
{
  success: false,
  message: "Something went wrong"
}
```

Create centralized error-handling middleware.

Show appropriate frontend notifications.

## 13. Environment Configuration

Create `.env.example`.

Backend:

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173

ADMIN_NAME=Administrator
ADMIN_EMAIL=admin@college.com
ADMIN_PASSWORD=
```

Frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

Never hardcode database credentials or secrets.

## 14. Development Phases

Build the application in the following order.

### Phase 1: Project Setup

- Initialize React with Vite.
- Initialize Express backend.
- Configure MongoDB connection.
- Install dependencies.
- Configure Tailwind CSS.
- Create folder structure.
- Configure environment variables.

### Phase 2: Database and Authentication

- Create all four MongoDB models.
- Implement admin seed script.
- Implement student registration.
- Implement login for all roles.
- Implement JWT authentication.
- Implement role-based middleware.
- Test authentication APIs.

### Phase 3: Admin Module

- Admin dashboard.
- Faculty management.
- Department management.
- Student management.

### Phase 4: Faculty Module

- Faculty dashboard.
- Quiz creation.
- Dynamic question builder.
- Quiz editing and deletion.
- Quiz listing.
- Results page.
- Leaderboard.
- CSV export.

### Phase 5: Student Module

- Registration and login.
- Student dashboard.
- Assigned quizzes.
- Quiz status.
- Quiz instructions.
- Quiz attempt interface.
- Countdown timer.
- Quiz submission.
- Immediate result.
- Attempt history.

### Phase 6: Integration and Finalization

- Connect all frontend pages with backend APIs.
- Test complete workflows.
- Fix API integration issues.
- Fix navigation and role-based access.
- Verify responsive design.
- Add loading and empty states.
- Write README documentation.

## 15. Important Development Instructions

Follow these rules throughout development:

1. Build working features, not just UI mockups.
2. Connect every form to its respective API.
3. Do not use hardcoded dummy data once backend integration is complete.
4. Do not create buttons that have no functionality.
5. Do not duplicate components unnecessarily.
6. Keep the code readable and beginner-friendly.
7. Use reusable components where appropriate.
8. Keep business logic in backend controllers/services.
9. Use proper loading, success, and error states.
10. Do not expose correct answers to students during quizzes.
11. Enforce quiz timing on the backend.
12. Ensure one attempt per student per quiz.
13. Make the application responsive on desktop, tablet, and mobile.
14. Do not add a payment gateway.
15. Do not add unnecessary features outside the specified scope.
16. Do not implement advanced security, automated tests, or performance optimization.

## 16. Expected Final Deliverable

The final application must have:

- A working Admin Dashboard.
- A working Faculty Dashboard.
- A working Student Dashboard.
- Working authentication for all roles.
- Working department management.
- Working faculty management.
- Working quiz creation and management.
- Working student registration.
- Department and year-based quiz assignment.
- Working countdown timer.
- One-attempt restriction.
- Automatic quiz submission.
- Immediate score calculation.
- Student attempt history.
- Faculty results dashboard.
- Top-5 leaderboard.
- CSV result export.
- MongoDB persistence.
- Responsive frontend.

Provide clear instructions in README.md explaining:

- How to install dependencies.
- How to configure environment variables.
- How to connect MongoDB.
- How to seed the admin account.
- How to start the frontend.
- How to start the backend.
- How to log in as admin, faculty, and student.

**Final instruction:**

First inspect the existing project directory. If the project is empty, initialize it. If code already exists, understand and reuse the existing structure instead of unnecessarily overwriting files.

Implement the application phase by phase. After completing each phase, verify that the code is connected properly before moving to the next phase.

Prioritize a complete, working application over unnecessary complexity or excessive code generation.