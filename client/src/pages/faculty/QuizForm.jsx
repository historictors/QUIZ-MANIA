import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, Loader } from '../../components';
import API from '../../services/api';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    department: '',
    year: '1',
    timeLimit: '30',
    startTime: '',
    endTime: ''
  });

  const [questions, setQuestions] = useState([
    {
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);

  // Convert Date to local datetime-local string
  const toLocalISOString = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    const pad = (num) => num.toString().padStart(2, '0');
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
  };

  // Load departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await API.get('/departments');
        if (res.data?.success && Array.isArray(res.data?.data)) {
          setDepartments(res.data.data);
          if (!isEditing && res.data.data.length > 0) {
            setFormData((prev) => ({
              ...prev,
              department: res.data.data[0]._id
            }));
          }
        }
      } catch (err) {
        toast.error('Failed to load departments');
      }
    };

    fetchDepts();
  }, [isEditing]);

  // If in edit mode, load the existing quiz with questions & correct answers
  useEffect(() => {
    if (!isEditing) return;

    const fetchQuiz = async () => {
      try {
        const res = await API.get(`/faculty/quizzes/${id}`);
        if (res.data?.success && res.data?.data) {
          const q = res.data.data;
          setFormData({
            title: q.title || '',
            subject: q.subject || '',
            department: q.department?._id || q.department || '',
            year: q.year?.toString() || '1',
            timeLimit: q.timeLimit?.toString() || '30',
            startTime: toLocalISOString(q.startTime),
            endTime: toLocalISOString(q.endTime)
          });

          if (Array.isArray(q.questions) && q.questions.length > 0) {
            setQuestions(
              q.questions.map((item) => ({
                questionText: item.questionText || '',
                options: item.options || ['', '', '', ''],
                correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0
              }))
            );
          }
        }
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load quiz details';
        toast.error(msg);
        navigate('/faculty/quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, isEditing]);

  const handleFieldChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, val) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = val;
    setQuestions(updated);
  };

  const handleCorrectAnswerSelect = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = optIndex;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length <= 1) {
      toast.error('Quiz must contain at least one question');
      return;
    }
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validations
    if (!formData.title || !formData.subject || !formData.department || !formData.startTime || !formData.endTime) {
      toast.error('Please complete all required quiz fields');
      return;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (endDate <= startDate) {
      toast.error('End time must be after start time');
      return;
    }

    const timeLimitNum = Number(formData.timeLimit);
    if (timeLimitNum <= 0 || isNaN(timeLimitNum)) {
      toast.error('Time limit must be greater than zero');
      return;
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      toast.error('At least one question is required');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        toast.error(`Question ${i + 1} must have exactly 4 options`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          toast.error(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} cannot be empty`);
          return;
        }
      }
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        toast.error(`Question ${i + 1} must have a valid correct answer`);
        return;
      }
    }

    setSubmitting(true);
    const payload = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      department: formData.department,
      year: Number(formData.year),
      timeLimit: timeLimitNum,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      questions: questions.map((q) => ({
        questionText: q.questionText.trim(),
        options: q.options.map((opt) => opt.trim()),
        correctAnswer: q.correctAnswer
      }))
    };

    try {
      if (isEditing) {
        const res = await API.put(`/faculty/quizzes/${id}`, payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Quiz updated successfully!');
          navigate('/faculty/quizzes');
        }
      } else {
        const res = await API.post('/faculty/quizzes', payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Quiz created successfully!');
          navigate('/faculty/quizzes');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save quiz';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading quiz details for editing..." />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/faculty/quizzes')}
          >
            <ArrowLeft size={16} />
            <span>BACK</span>
          </Button>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
            {isEditing ? 'EDIT QUIZ' : 'CREATE NEW QUIZ'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Basic Details Card */}
        <Card className="flex flex-col gap-5 border-[3px] shadow-[6px_6px_0_#000000]">
          <h2 className="font-headline text-lg sm:text-xl uppercase font-bold text-black border-b-2 border-black pb-2">
            1. BASIC QUIZ INFORMATION
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="title"
              label="Quiz Title"
              required
              placeholder="e.g. Operating Systems Mid-Term"
              value={formData.title}
              onChange={handleFieldChange}
            />
            <Input
              id="subject"
              label="Subject / Topic"
              required
              placeholder="e.g. Computer Science"
              value={formData.subject}
              onChange={handleFieldChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              id="department"
              label="Department"
              required
              value={formData.department}
              onChange={handleFieldChange}
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.code} - {d.name}
                </option>
              ))}
            </Select>

            <Select
              id="year"
              label="Target Year"
              required
              value={formData.year}
              onChange={handleFieldChange}
            >
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </Select>

            <Input
              id="timeLimit"
              type="number"
              min="1"
              label="Time Limit (Minutes)"
              required
              value={formData.timeLimit}
              onChange={handleFieldChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="startTime"
              type="datetime-local"
              label="Start Date & Time"
              required
              value={formData.startTime}
              onChange={handleFieldChange}
            />
            <Input
              id="endTime"
              type="datetime-local"
              label="End Date & Time"
              required
              value={formData.endTime}
              onChange={handleFieldChange}
            />
          </div>
        </Card>

        {/* Question Builder Card */}
        <Card className="flex flex-col gap-6 border-[3px] shadow-[6px_6px_0_#000000]">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div>
              <h2 className="font-headline text-lg sm:text-xl uppercase font-bold text-black">
                2. QUESTION BUILDER ({questions.length})
              </h2>
              <p className="font-body text-xs text-neutral-600">
                Provide exactly 4 options per question and click the radio button to select the correct answer
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addQuestion}
            >
              <Plus size={16} />
              <span>ADD QUESTION</span>
            </Button>
          </div>

          {/* List of Questions */}
          <div className="flex flex-col gap-6">
            {questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="bg-[#FFF8E7] border-2 border-black p-4 sm:p-5 rounded nb-card-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-label text-sm uppercase font-bold bg-[#FFDE59] px-2.5 py-1 border border-black rounded">
                    QUESTION {qIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    className="text-[#FF6B6B] hover:text-black font-label text-xs uppercase font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={16} />
                    <span>REMOVE</span>
                  </button>
                </div>

                <Input
                  id={`q-${qIdx}-text`}
                  label="Question Stem"
                  required
                  placeholder="Enter the question text here..."
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                />

                {/* 4 Options with radio selector */}
                <div className="flex flex-col gap-2.5">
                  <span className="font-label text-xs uppercase font-bold text-neutral-700">
                    Options & Correct Answer
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isCorrect = q.correctAnswer === optIdx;

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 p-2 border-2 border-black rounded bg-white ${
                            isCorrect ? 'ring-2 ring-black bg-[#E6F8EA]' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={isCorrect}
                            onChange={() => handleCorrectAnswerSelect(qIdx, optIdx)}
                            className="w-4 h-4 cursor-pointer accent-[#6BCB77]"
                            title="Mark as correct answer"
                          />
                          <span className="font-label text-xs font-bold w-4 text-center">
                            {letter}.
                          </span>
                          <input
                            type="text"
                            placeholder={`Option ${letter}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                            className="w-full text-xs sm:text-sm font-body px-2 py-1 outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={addQuestion}
            className="w-full py-3 border-dashed"
          >
            <Plus size={18} />
            <span>ADD ANOTHER QUESTION</span>
          </Button>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pb-12">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/faculty/quizzes')}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            className="px-8"
          >
            <Save size={18} />
            <span>{submitting ? 'SAVING...' : isEditing ? 'SAVE CHANGES' : 'PUBLISH QUIZ'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
