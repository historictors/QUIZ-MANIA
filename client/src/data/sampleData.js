// Sample mock data for CampusQuiz development
export const mockDepartments = [
  { _id: 'dept1', name: 'Computer Science and Engineering', code: 'CSE' },
  { _id: 'dept2', name: 'Electronics and Communication Engineering', code: 'ECE' },
  { _id: 'dept3', name: 'Electrical and Electronics Engineering', code: 'EEE' },
  { _id: 'dept4', name: 'Mechanical Engineering', code: 'ME' },
  { _id: 'dept5', name: 'Civil Engineering', code: 'CIVIL' },
  { _id: 'dept6', name: 'Information Technology', code: 'IT' }
];

export const mockCurrentUser = {
  student: {
    _id: 'user_s1',
    name: 'Arjun Verma',
    email: 'arjun@college.com',
    role: 'student',
    rollNumber: '21CSE045',
    department: 'dept1',
    year: 3
  },
  faculty: {
    _id: 'user_f1',
    name: 'Prof. Sharma',
    email: 'sharma@college.com',
    role: 'faculty',
    department: 'dept1'
  },
  admin: {
    _id: 'user_a1',
    name: 'Dr. Nair',
    email: 'admin@college.com',
    role: 'admin'
  }
};

export const mockQuizzes = [
  {
    _id: 'quiz1',
    title: 'Data Structures & Algorithms',
    subject: 'Computer Science',
    department: 'dept1',
    year: 3,
    timeLimit: 30,
    startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),   // in 45 mins
    status: 'live',
    numberOfQuestions: 5,
    questions: [
      {
        questionText: 'What is the time complexity of searching in a balanced Binary Search Tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1
      },
      {
        questionText: 'Which data structure works on the LIFO (Last In First Out) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Array'],
        correctAnswer: 1
      },
      {
        questionText: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
        correctAnswer: 2
      },
      {
        questionText: 'Which graph traversal algorithm uses a Queue?',
        options: ['Depth First Search (DFS)', 'Breadth First Search (BFS)', 'Dijkstra Algorithm', 'Topological Sort'],
        correctAnswer: 1
      },
      {
        questionText: 'What data structure is typically used to implement LRU Cache?',
        options: ['Stack + Array', 'Doubly Linked List + Hash Map', 'Queue + Stack', 'Binary Heap'],
        correctAnswer: 1
      }
    ],
    createdBy: 'user_f1',
    attemptCount: 14
  },
  {
    _id: 'quiz2',
    title: 'Database Management Systems',
    subject: 'Computer Science',
    department: 'dept1',
    year: 3,
    timeLimit: 45,
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // in 2 hours
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    numberOfQuestions: 10,
    questions: [],
    createdBy: 'user_f1',
    attemptCount: 0
  },
  {
    _id: 'quiz3',
    title: 'Computer Networks Quiz',
    subject: 'Computer Science',
    department: 'dept1',
    year: 3,
    timeLimit: 20,
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'closed',
    numberOfQuestions: 4,
    questions: [],
    createdBy: 'user_f1',
    attemptCount: 38
  },
  {
    _id: 'quiz4',
    title: 'Operating Systems Mid-Term',
    subject: 'Computer Science',
    department: 'dept1',
    year: 3,
    timeLimit: 25,
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    numberOfQuestions: 4,
    questions: [],
    createdBy: 'user_f1',
    attemptCount: 22
  }
];

export const mockAttempts = [
  {
    _id: 'att1',
    quiz: {
      _id: 'quiz4',
      title: 'Operating Systems Mid-Term',
      subject: 'Computer Science',
      timeLimit: 25,
      startTime: '2026-11-24T10:00:00Z',
      endTime: '2026-11-25T18:00:00Z'
    },
    student: {
      _id: 'user_s1',
      name: 'Arjun Verma',
      rollNumber: '21CSE045',
      email: 'arjun@college.com'
    },
    totalQuestions: 4,
    correctAnswers: 3,
    wrongAnswers: 1,
    unanswered: 0,
    score: 3,
    percentage: 75.0,
    status: 'submitted',
    startedAt: '2026-11-24T10:05:00Z',
    submittedAt: '2026-11-24T10:22:15Z'
  },
  {
    _id: 'att2',
    quiz: {
      _id: 'quiz3',
      title: 'Computer Networks Quiz',
      subject: 'Computer Science',
      timeLimit: 20,
      startTime: '2026-11-22T09:00:00Z',
      endTime: '2026-11-23T18:00:00Z'
    },
    student: {
      _id: 'user_s1',
      name: 'Arjun Verma',
      rollNumber: '21CSE045',
      email: 'arjun@college.com'
    },
    totalQuestions: 4,
    correctAnswers: 4,
    wrongAnswers: 0,
    unanswered: 0,
    score: 4,
    percentage: 100.0,
    status: 'submitted',
    startedAt: '2026-11-22T11:10:00Z',
    submittedAt: '2026-11-22T11:24:45Z'
  }
];

export const mockLeaderboard = [
  { rank: 1, name: 'Ananya Roy', rollNumber: '21CSE012', score: 5, percentage: 100.0, submittedAt: '10:14 AM' },
  { rank: 2, name: 'Arjun Verma', rollNumber: '21CSE045', score: 4, percentage: 80.0, submittedAt: '10:18 AM' },
  { rank: 3, name: 'Kavita Das', rollNumber: '21CSE088', score: 4, percentage: 80.0, submittedAt: '10:21 AM' },
  { rank: 4, name: 'Rohan Mehra', rollNumber: '21CSE034', score: 3, percentage: 60.0, submittedAt: '10:15 AM' },
  { rank: 5, name: 'Siddharth Jain', rollNumber: '21CSE099', score: 3, percentage: 60.0, submittedAt: '10:25 AM' }
];

export const mockFacultyList = [
  {
    _id: 'fac1',
    name: 'Prof. Sharma',
    email: 'sharma@college.com',
    department: { _id: 'dept1', name: 'Computer Science and Engineering', code: 'CSE' }
  },
  {
    _id: 'fac2',
    name: 'Dr. Priya Sundaram',
    email: 'priya@college.com',
    department: { _id: 'dept2', name: 'Electronics and Communication Engineering', code: 'ECE' }
  },
  {
    _id: 'fac3',
    name: 'Prof. Rajesh Gupta',
    email: 'rajesh@college.com',
    department: { _id: 'dept3', name: 'Electrical and Electronics Engineering', code: 'EEE' }
  }
];

export const mockStudentList = [
  {
    _id: 'stu1',
    name: 'Arjun Verma',
    email: 'arjun@college.com',
    rollNumber: '21CSE045',
    department: { _id: 'dept1', name: 'Computer Science and Engineering', code: 'CSE' },
    year: 3
  },
  {
    _id: 'stu2',
    name: 'Ananya Roy',
    email: 'ananya@college.com',
    rollNumber: '21CSE012',
    department: { _id: 'dept1', name: 'Computer Science and Engineering', code: 'CSE' },
    year: 3
  },
  {
    _id: 'stu3',
    name: 'Kavita Das',
    email: 'kavita@college.com',
    rollNumber: '21CSE088',
    department: { _id: 'dept1', name: 'Computer Science and Engineering', code: 'CSE' },
    year: 3
  },
  {
    _id: 'stu4',
    name: 'Rahul Sen',
    email: 'rahul@college.com',
    rollNumber: '22ECE019',
    department: { _id: 'dept2', name: 'Electronics and Communication Engineering', code: 'ECE' },
    year: 2
  }
];
