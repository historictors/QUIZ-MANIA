import React, { useState } from 'react';
import { Table, Button, Input, Select, Modal, ConfirmDialog, EmptyState } from '../../components';
import { mockFacultyList, mockDepartments } from '../../data/sampleData';
import { PlusCircle, Search, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Faculty = () => {
  const [faculty, setFaculty] = useState(mockFacultyList);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'dept1'
  });

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter ? f.department._id === departmentFilter : true;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: '', email: '', password: '', department: 'dept1' });
    setModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingId(f._id);
    setForm({
      name: f.name,
      email: f.email,
      password: '',
      department: f.department._id
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!editingId && !form.password)) {
      toast.error('Please complete required fields');
      return;
    }

    const deptObj = mockDepartments.find((d) => d._id === form.department) || mockDepartments[0];

    if (editingId) {
      setFaculty(
        faculty.map((f) =>
          f._id === editingId
            ? { ...f, name: form.name, email: form.email, department: deptObj }
            : f
        )
      );
      toast.success('Faculty updated successfully');
    } else {
      const newFaculty = {
        _id: `fac_${Date.now()}`,
        name: form.name,
        email: form.email,
        department: deptObj
      };
      setFaculty([newFaculty, ...faculty]);
      toast.success('Faculty created successfully');
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    // If faculty has created quizzes, block deletion
    if (deleteId === 'fac1') {
      toast.error('Cannot delete: this faculty has created quizzes');
      setDeleteId(null);
      return;
    }

    setFaculty(faculty.filter((f) => f._id !== deleteId));
    toast.success('Faculty deleted successfully');
    setDeleteId(null);
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
            {mockDepartments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Faculty Table */}
      {filteredFaculty.length === 0 ? (
        <EmptyState
          title="No faculty members found"
          description="Try adjusting your search query or department filter."
          actionLabel="ADD FACULTY"
          onAction={handleOpenAdd}
        />
      ) : (
        <Table headers={['Name', 'Email Address', 'Department', 'Actions']}>
          {filteredFaculty.map((f) => (
            <tr key={f._id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {f.name}
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                {f.email}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span className="font-label text-xs font-bold bg-[#FFE885] px-2 py-0.5 border border-black rounded">
                  {f.department.code} - {f.department.name}
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
            {mockDepartments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </Select>
          <Input
            id="fac-password"
            type="password"
            label={editingId ? 'New Password (leave blank to keep current)' : 'Password'}
            required={!editingId}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'SAVE CHANGES' : 'CREATE ACCOUNT'}
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
        message="Are you sure you want to delete this faculty account? Action will be blocked if quizzes have been authored by this faculty."
        confirmText="DELETE"
        cancelText="CANCEL"
        variant="danger"
      />
    </div>
  );
};

export default Faculty;
