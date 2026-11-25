import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Input, Loader } from '../../components';
import API from '../../services/api';
import { Download, ArrowLeft, Trophy, Users, Award, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const QuizResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResultsData = async () => {
    try {
      const [quizRes, resultsRes, lbRes] = await Promise.all([
        API.get(`/faculty/quizzes/${id}`),
        API.get(`/faculty/quizzes/${id}/results`, { params: { search } }),
        API.get(`/faculty/quizzes/${id}/leaderboard`)
      ]);

      if (quizRes.data?.success) setQuiz(quizRes.data.data);
      if (resultsRes.data?.success) setResults(resultsRes.data.data);
      if (lbRes.data?.success) setLeaderboard(lbRes.data.data);
    } catch (err) {
      toast.error('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsData();
  }, [id]);

  // Debounced search on results
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await API.get(`/faculty/quizzes/${id}/results`, { params: { search } });
        if (res.data?.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search results failed');
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, id]);

  const handleDownloadCSV = async () => {
    try {
      const response = await API.get(`/faculty/quizzes/${id}/export`, {
        responseType: 'blob'
      });

      // Extract filename from Content-Disposition header if present
      let filename = `quiz_${id}_results.csv`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error('Failed to export CSV report');
    }
  };

  if (loading) {
    return <Loader message="Compiling quiz assessment results..." />;
  }

  // Compute summary stats from results
  const totalAttempts = results.length;
  const highestScore = results.length > 0 ? Math.max(...results.map((r) => r.score || 0)) : 0;
  const avgPercentage =
    results.length > 0
      ? (results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length).toFixed(1)
      : 0;

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
              {quiz?.title || 'QUIZ'} — RESULTS
            </h1>
            <p className="font-body text-sm text-neutral-600">
              Subject: {quiz?.subject} | Department: {quiz?.department?.code || 'CSE'} | Total Submissions: {totalAttempts}
            </p>
          </div>
        </div>

        <Button
          variant="success"
          size="md"
          onClick={handleDownloadCSV}
          className="shrink-0"
        >
          <Download size={18} />
          <span>DOWNLOAD CSV REPORT</span>
        </Button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#4D96FF] border-[3px] border-black p-4 rounded nb-card flex items-center justify-between">
          <div>
            <span className="font-label text-xs uppercase font-bold text-black block">Total Attempts</span>
            <span className="font-mono text-3xl font-bold text-black">{totalAttempts}</span>
          </div>
          <Users size={28} className="text-black" />
        </div>
        <div className="bg-[#FFDE59] border-[3px] border-black p-4 rounded nb-card flex items-center justify-between">
          <div>
            <span className="font-label text-xs uppercase font-bold text-black block">Highest Score</span>
            <span className="font-mono text-3xl font-bold text-black">{highestScore} pts</span>
          </div>
          <Award size={28} className="text-black" />
        </div>
        <div className="bg-[#6BCB77] border-[3px] border-black p-4 rounded nb-card flex items-center justify-between">
          <div>
            <span className="font-label text-xs uppercase font-bold text-black block">Average Score</span>
            <span className="font-mono text-3xl font-bold text-black">{avgPercentage}%</span>
          </div>
          <BarChart3 size={28} className="text-black" />
        </div>
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

        {leaderboard.length === 0 ? (
          <p className="font-body text-sm text-neutral-700 p-2">
            No submissions recorded yet for this quiz.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {leaderboard.map((item) => (
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
                  <span>{item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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

        {results.length === 0 ? (
          <p className="font-body text-sm text-neutral-600 bg-white p-6 border-2 border-black rounded text-center">
            {search ? 'No student attempts match your search.' : 'No attempts submitted yet.'}
          </p>
        ) : (
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
            {results.map((r, idx) => (
              <tr key={r._id || idx} className="hover:bg-[#FFF8E7] transition-colors">
                <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                  #{idx + 1}
                </td>
                <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                  {r.student?.name || 'N/A'}
                </td>
                <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                  {r.student?.rollNumber || 'N/A'}
                </td>
                <td className="p-3.5 font-mono text-xs text-green-700 font-bold whitespace-nowrap">
                  {r.correctAnswers}
                </td>
                <td className="p-3.5 font-mono text-xs text-red-600 font-bold whitespace-nowrap">
                  {r.wrongAnswers}
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
                  {r.submittedAt ? new Date(r.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
};

export default QuizResults;
