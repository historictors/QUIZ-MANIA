import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Badge, Button, Input } from '../../components';
import { mockQuizzes, mockLeaderboard } from '../../data/sampleData';
import { Download, ArrowLeft, Trophy, Search, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const quiz = mockQuizzes.find((q) => q._id === id) || mockQuizzes[0];

  // Mock results list
  const resultsData = [
    { id: '1', name: 'Ananya Roy', rollNumber: '21CSE012', email: 'ananya@college.com', correct: 5, wrong: 0, unanswered: 0, score: 5, percentage: 100, submittedAt: '10:14 AM' },
    { id: '2', name: 'Arjun Verma', rollNumber: '21CSE045', email: 'arjun@college.com', correct: 4, wrong: 1, unanswered: 0, score: 4, percentage: 80, submittedAt: '10:18 AM' },
    { id: '3', name: 'Kavita Das', rollNumber: '21CSE088', email: 'kavita@college.com', correct: 4, wrong: 1, unanswered: 0, score: 4, percentage: 80, submittedAt: '10:21 AM' },
    { id: '4', name: 'Rohan Mehra', rollNumber: '21CSE034', email: 'rohan@college.com', correct: 3, wrong: 2, unanswered: 0, score: 3, percentage: 60, submittedAt: '10:15 AM' },
    { id: '5', name: 'Siddharth Jain', rollNumber: '21CSE099', email: 'sid@college.com', correct: 3, wrong: 1, unanswered: 1, score: 3, percentage: 60, submittedAt: '10:25 AM' },
    { id: '6', name: 'Pooja Rao', rollNumber: '21CSE055', email: 'pooja@college.com', correct: 2, wrong: 3, unanswered: 0, score: 2, percentage: 40, submittedAt: '10:28 AM' }
  ];

  const filteredResults = resultsData.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportCSV = () => {
    // Generate simple CSV download
    const headers = ['Student Name', 'Roll Number', 'Email', 'Correct', 'Wrong', 'Unanswered', 'Score', 'Percentage', 'Submitted At'];
    const rows = filteredResults.map((r) => [
      `"${r.name}"`,
      `"${r.rollNumber}"`,
      `"${r.email}"`,
      r.correct,
      r.wrong,
      r.unanswered,
      r.score,
      `"${r.percentage}%"`,
      `"${r.submittedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quiz_${quiz._id}_results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Results exported as CSV successfully!');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/faculty/quizzes')}
          >
            <ArrowLeft size={16} />
            <span>BACK</span>
          </Button>
          <div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
              {quiz.title} — RESULTS
            </h1>
            <p className="font-body text-sm text-neutral-600">
              Department: CSE | Total Submissions: {resultsData.length}
            </p>
          </div>
        </div>

        <Button
          variant="success"
          size="md"
          onClick={handleExportCSV}
          className="shrink-0"
        >
          <Download size={18} />
          <span>EXPORT CSV REPORT</span>
        </Button>
      </div>

      {/* Top 5 Leaderboard Card */}
      <Card className="flex flex-col gap-4 border-[3px] bg-[#FFE885] shadow-[6px_6px_0_#000000]">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <h2 className="font-headline text-lg sm:text-xl uppercase font-bold text-black flex items-center gap-2">
            <Trophy size={22} className="text-black" />
            TOP 5 LEADERBOARD
          </h2>
          <span className="font-label text-xs uppercase font-bold bg-white px-2 py-0.5 border border-black rounded">
            RANKED BY SCORE & TIME
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {mockLeaderboard.map((item) => (
            <div
              key={item.rank}
              className={`p-3 border-2 border-black rounded flex flex-col justify-between ${
                item.rank === 1 ? 'bg-[#FFDE59] shadow-[3px_3px_0_#000000]' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-label font-bold text-xs bg-black text-white px-1.5 py-0.5 rounded">
                  #{item.rank}
                </span>
                <span className="font-mono text-xs font-bold">{item.score} PTS</span>
              </div>
              <div className="mt-2">
                <span className="font-headline font-bold text-sm block truncate">{item.name}</span>
                <span className="font-mono text-xs text-neutral-600 block">{item.rollNumber}</span>
              </div>
              <div className="mt-2 pt-1 border-t border-black text-[11px] font-mono flex justify-between">
                <span>{item.percentage}%</span>
                <span>{item.submittedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* All Submissions Table */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-headline text-xl uppercase font-bold text-black">
            ALL STUDENT SUBMISSIONS
          </h2>
          <div className="w-full sm:w-72">
            <Input
              id="search-results"
              placeholder="Search by student name or roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table
          headers={[
            'Rank',
            'Student Name',
            'Roll Number',
            'Correct',
            'Wrong',
            'Unanswered',
            'Score',
            'Percentage',
            'Submitted At'
          ]}
        >
          {filteredResults.map((r, idx) => (
            <tr key={r.id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                #{idx + 1}
              </td>
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {r.name}
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                {r.rollNumber}
              </td>
              <td className="p-3.5 font-mono text-xs text-green-700 font-bold whitespace-nowrap">
                {r.correct}
              </td>
              <td className="p-3.5 font-mono text-xs text-red-600 font-bold whitespace-nowrap">
                {r.wrong}
              </td>
              <td className="p-3.5 font-mono text-xs text-neutral-500 whitespace-nowrap">
                {r.unanswered}
              </td>
              <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                {r.score}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span className="font-label text-xs font-bold bg-[#FFDE59] px-2 py-0.5 border border-black rounded">
                  {r.percentage}%
                </span>
              </td>
              <td className="p-3.5 font-mono text-xs text-neutral-700 whitespace-nowrap">
                {r.submittedAt}
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
};

export default QuizResults;
