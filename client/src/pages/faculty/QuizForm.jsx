import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Select, Button, ConfirmDialog } from '../../components';
import { mockDepartments, mockQuizzes } from '../../data/sampleData';
import { ArrowLeft, Plus, Trash2, CheckCircle, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const existingQuiz = isEditing ? mockQuizzes.find((q) => q._id === id) : null;

  const [formData, setFormData] = useState({
    title: existingQuiz?.title || '',
    subject: existingQuiz?.subject || '',
    department: existingQuiz?.department || 'dept1',
    year: existingQuiz?.year || '3',
    timeLimit: existingQuiz?.timeLimit || '30',
    startTime: existingQuiz ? new Date(existingQuiz.startTime).toISOString().slice(0, 16) : '',
    endTime: existingQuiz ? new Date(existingQuiz.endTime).toISOString().slice(0, 16) : ''
  });

  const [questions, setQuestions] = useState(
    existingQuiz?.questions && existingQuiz.questions.length > 0
      ? existingQuiz.questions
      : [
          {
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: 0
          }
        ]
  );

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subject || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all basic quiz details');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error('End time must be strictly after start time');
      return;
    }

    if (Number(formData.timeLimit) <= 0) {
      toast.error('Time limit must be greater than zero');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is empty`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Question ${i + 1}, option ${j + 1} cannot be empty`);
          return;
        }
      }
    }

    toast.success(isEditing ? 'Quiz updated successfully!' : 'Quiz published successfully!');
    navigate('/faculty/quizzes');
  };

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
              {mockDepartments.map((d) => (
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
                Provide exactly 4 options per question and select the radio button for the correct option
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
            className="px-8"
          >
            <Save size={18} />
            <span>{isEditing ? 'SAVE QUIZ CHANGES' : 'PUBLISH QUIZ'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
