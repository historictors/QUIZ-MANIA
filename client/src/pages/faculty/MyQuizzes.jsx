import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Badge, Button, Input, ConfirmDialog, EmptyState, Loader } from '../../components';
import API from '../../services/api';
import { PlusCircle, Edit3, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const res = await API.get('/faculty/quizzes');
      if (res.data?.success) {
        setQuizzes(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load your quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await API.delete(`/faculty/quizzes/${deleteId}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Quiz deleted successfully');
        fetchQuizzes();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete quiz';
      toast.error(msg);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
            MY QUIZZES
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Create, manage, and monitor status of your college quizzes
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/faculty/quizzes/new')}
        >
          <PlusCircle size={18} />
          <span>CREATE QUIZ</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          id="search-quiz"
          placeholder="Search by quiz title or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader message="Loading quizzes..." />
      ) : filteredQuizzes.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          description={search ? 'No quizzes match your search criteria.' : 'You have not created any quizzes yet.'}
          actionLabel="CREATE NEW QUIZ"
          onAction={() => navigate('/faculty/quizzes/new')}
        />
      ) : (
        <Table
          headers={[
            'Title',
            'Subject',
            'Duration',
            'Start Time',
            'End Time',
            'Attempts',
            'Status',
            'Actions'
          ]}
        >
          {filteredQuizzes.map((quiz) => {
            const isLocked = quiz.attemptCount > 0;

            return (
              <tr key={quiz._id} className="hover:bg-[#FFF8E7] transition-colors">
                <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                  {quiz.title}
                </td>
                <td className="p-3.5 text-neutral-700 whitespace-nowrap">
                  {quiz.subject}
                </td>
                <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                  {quiz.timeLimit} mins
                </td>
                <td className="p-3.5 font-mono text-xs text-neutral-700 whitespace-nowrap">
                  {new Date(quiz.startTime).toLocaleString()}
                </td>
                <td className="p-3.5 font-mono text-xs text-neutral-700 whitespace-nowrap">
                  {new Date(quiz.endTime).toLocaleString()}
                </td>
                <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                  {quiz.attemptCount || 0}
                </td>
                <td className="p-3.5 whitespace-nowrap">
                  <Badge status={quiz.status} />
                </td>
                <td className="p-3.5 whitespace-nowrap flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/faculty/quizzes/${quiz._id}/results`)}
                    title="View Results"
                  >
                    <Eye size={14} />
                    <span>RESULTS</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={isLocked}
                    title={isLocked ? 'Locked: students have attempted' : 'Edit Quiz'}
                    onClick={() => navigate(`/faculty/quizzes/${quiz._id}/edit`)}
                  >
                    <Edit3 size={14} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={isLocked}
                    title={isLocked ? 'Locked: students have attempted' : 'Delete Quiz'}
                    onClick={() => setDeleteId(quiz._id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </Table>
      )}

      {/* Confirm Deletion */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="DELETE QUIZ?"
        message="Are you sure you want to delete this quiz? If students have already attempted it, deletion will be blocked by the server."
        confirmText="YES, DELETE"
        cancelText="CANCEL"
        variant="danger"
      />
    </div>
  );
};

export default MyQuizzes;
