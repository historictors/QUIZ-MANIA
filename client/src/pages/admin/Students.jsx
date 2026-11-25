import React, { useState, useEffect } from 'react';
import { Table, Input, Select, EmptyState, Loader } from '../../components';
import API from '../../services/api';
import toast from 'react-hot-toast';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);

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

  const fetchStudents = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (departmentFilter) params.department = departmentFilter;

      const res = await API.get('/admin/students', { params });
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, departmentFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-tight text-black">
            REGISTERED STUDENTS
          </h1>
          <p className="font-body text-sm text-neutral-600">
            Verified candidate records, departmental enrollments and batch years
          </p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            id="search-students"
            placeholder="Search by student name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <Select
            id="filter-dept-students"
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
        <Loader message="Loading student roster..." />
      ) : students.length === 0 ? (
        <EmptyState
          title="No students found"
          description="No candidate records match your current filter settings."
        />
      ) : (
        <Table headers={['Student Name', 'Roll Number', 'College Email', 'Department', 'Year']}>
          {students.map((s) => (
            <tr key={s._id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {s.name}
              </td>
              <td className="p-3.5 font-mono font-bold text-xs whitespace-nowrap">
                <span className="bg-[#FFF8E7] px-2 py-0.5 border border-black rounded">
                  {s.rollNumber || 'N/A'}
                </span>
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                {s.email}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span className="font-label text-xs font-bold bg-[#DCEBFF] px-2 py-0.5 border border-black rounded">
                  {s.department ? s.department.code : 'N/A'}
                </span>
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                Year {s.year || '1'}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Students;
