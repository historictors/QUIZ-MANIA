import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, ConfirmDialog, EmptyState, Loader } from '../../components';
import API from '../../services/api';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Faculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });

  // Fetch faculty and departments from API
  const fetchFaculty = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (departmentFilter) params.department = departmentFilter;

      const res = await API.get('/admin/faculty', { params });
      if (res.data?.success) {
        setFaculty(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load faculty list');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments');
      if (res.data?.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFaculty();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, departmentFilter]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      email: '',
      password: '',
      department: departments[0]?._id || ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingId(f._id);
    setForm({
      name: f.name,
      email: f.email,
      password: '',
      department: f.department?._id || f.department || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!editingId && (!form.password || form.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingId) {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          department: form.department
        };
        if (form.password && form.password.trim()) {
          payload.password = form.password;
        }

        const res = await API.put(`/admin/faculty/${editingId}`, payload);
        if (res.data?.success) {
          toast.success(res.data.message || 'Faculty updated successfully');
          setModalOpen(false);
          fetchFaculty();
        }
      } else {
        const res = await API.post('/admin/faculty', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          department: form.department
        });
        if (res.data?.success) {
          toast.success(res.data.message || 'Faculty created successfully');
          setModalOpen(false);
          fetchFaculty();
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await API.delete(`/admin/faculty/${deleteId}`);
      if (res.data?.success) {
        toast.success(res.data.message || 'Faculty deleted successfully');
        fetchFaculty();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete faculty member';
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
            FACULTY MANAGEMENT
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Create instructor accounts, update assignments, and oversee faculty
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <PlusCircle size={18} />
          <span>ADD FACULTY</span>
        </Button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            id="search-faculty"
            placeholder="Search by faculty name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Select
            id="filter-department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading faculty roster..." />
      ) : faculty.length === 0 ? (
        <EmptyState
          title="No faculty members found"
          description="Try adjusting your search query or department filter."
          actionLabel="ADD FACULTY"
          onAction={handleOpenAdd}
        />
      ) : (
        <Table headers={['Name', 'Email Address', 'Department', 'Actions']}>
          {faculty.map((f) => (
            <tr key={f._id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {f.name}
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                {f.email}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span className="font-label text-xs font-bold bg-[#FFE885] px-2 py-0.5 border border-black rounded">
                  {f.department ? `${f.department.code} - ${f.department.name}` : 'Unassigned'}
                </span>
              </td>
              <td className="p-3.5 whitespace-nowrap flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(f)}>
                  <Edit3 size={14} />
                  <span>EDIT</span>
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(f._id)}>
                  <Trash2 size={14} />
                  <span>DELETE</span>
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'EDIT FACULTY' : 'ADD NEW FACULTY'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            id="fac-name"
            label="Full Name"
            required
            placeholder="e.g. Prof. Ramesh Verma"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="fac-email"
            type="email"
            label="College Email"
            required
            placeholder="ramesh@college.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Select
            id="fac-department"
            label="Department"
            required
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </Select>
          <Input
            id="fac-password"
            type="password"
            label={editingId ? 'New Password (optional on update)' : 'Password'}
            required={!editingId}
            placeholder={editingId ? 'Leave blank to keep unchanged' : '••••••••'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary" disabled={formSubmitting}>
              {formSubmitting ? 'SAVING...' : editingId ? 'SAVE CHANGES' : 'CREATE ACCOUNT'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="DELETE FACULTY ACCOUNT?"
        message="Are you sure you want to delete this faculty account? Action will be blocked if this faculty has authored any quizzes."
        confirmText="DELETE"
        cancelText="CANCEL"
        variant="danger"
      />
    </div>
  );
};

export default Faculty;
