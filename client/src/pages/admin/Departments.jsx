import React, { useState } from 'react';
import { Table, Button, Input, Modal, ConfirmDialog, EmptyState } from '../../components';
import { mockDepartments } from '../../data/sampleData';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Departments = () => {
  const [departments, setDepartments] = useState(mockDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    code: ''
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ name: '', code: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingId(dept._id);
    setForm({ name: dept.name, code: dept.code });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error('Department name and code are required');
      return;
    }

    if (editingId) {
      setDepartments(
        departments.map((d) =>
          d._id === editingId ? { ...d, name: form.name, code: form.code.toUpperCase() } : d
        )
      );
      toast.success('Department updated successfully');
    } else {
      const newDept = {
        _id: `dept_${Date.now()}`,
        name: form.name,
        code: form.code.toUpperCase()
      };
      setDepartments([...departments, newDept]);
      toast.success('Department created successfully');
    }

    setModalOpen(false);
  };

  const handleDelete = () => {
    // If department in use, block deletion
    if (deleteId === 'dept1' || deleteId === 'dept2') {
      toast.error('Cannot delete: department is in use');
      setDeleteId(null);
      return;
    }

    setDepartments(departments.filter((d) => d._id !== deleteId));
    toast.success('Department deleted successfully');
    setDeleteId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
            DEPARTMENT MANAGEMENT
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Define academic branches and course code prefixes
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <PlusCircle size={18} />
          <span>ADD DEPARTMENT</span>
        </Button>
      </div>

      {/* Department Table */}
      <Table headers={['Department Code', 'Department Name', 'Actions']}>
        {departments.map((dept) => (
          <tr key={dept._id} className="hover:bg-[#FFF8E7] transition-colors">
            <td className="p-3.5 font-mono font-bold text-black whitespace-nowrap">
              <span className="bg-[#FFDE59] px-2.5 py-1 border border-black rounded text-xs">
                {dept.code}
              </span>
            </td>
            <td className="p-3.5 font-headline font-bold text-black whitespace-nowrap">
              {dept.name}
            </td>
            <td className="p-3.5 whitespace-nowrap flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleOpenEdit(dept)}>
                <Edit3 size={14} />
                <span>EDIT</span>
              </Button>
              <Button variant="danger" size="sm" onClick={() => setDeleteId(dept._id)}>
                <Trash2 size={14} />
                <span>DELETE</span>
              </Button>
            </td>
          </tr>
        ))}
      </Table>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'EDIT DEPARTMENT' : 'ADD NEW DEPARTMENT'}
      >
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            id="dept-name"
            label="Department Name"
            required
            placeholder="e.g. Artificial Intelligence and Data Science"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            id="dept-code"
            label="Department Code (Uppercase)"
            required
            placeholder="e.g. AIDS"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t-2 border-black">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              CANCEL
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'SAVE CHANGES' : 'CREATE DEPARTMENT'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="DELETE DEPARTMENT?"
        message="Are you sure you want to delete this department? If any faculty, students, or quizzes reference this branch, deletion will be blocked."
        confirmText="DELETE"
        cancelText="CANCEL"
        variant="danger"
      />
    </div>
  );
};

export default Departments;
