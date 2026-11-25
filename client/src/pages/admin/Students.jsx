import React, { useState } from 'react';
import { Table, Input, Select, EmptyState } from '../../components';
import { mockStudentList, mockDepartments } from '../../data/sampleData';
import { GraduationCap } from 'lucide-react';

export const Students = () => {
  const [students] = useState(mockStudentList);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept = departmentFilter ? s.department._id === departmentFilter : true;
    return matchesSearch && matchesDept;
  });

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
            {mockDepartments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.code} - {d.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Students Table */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="No students found"
          description="No candidate records match your current filter settings."
        />
      ) : (
        <Table headers={['Student Name', 'Roll Number', 'College Email', 'Department', 'Year']}>
          {filteredStudents.map((s) => (
            <tr key={s._id} className="hover:bg-[#FFF8E7] transition-colors">
              <td className="p-3.5 font-bold font-headline text-black whitespace-nowrap">
                {s.name}
              </td>
              <td className="p-3.5 font-mono font-bold text-xs whitespace-nowrap">
                <span className="bg-[#FFF8E7] px-2 py-0.5 border border-black rounded">
                  {s.rollNumber}
                </span>
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                {s.email}
              </td>
              <td className="p-3.5 whitespace-nowrap">
                <span className="font-label text-xs font-bold bg-[#DCEBFF] px-2 py-0.5 border border-black rounded">
                  {s.department.code}
                </span>
              </td>
              <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                Year {s.year}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Students;
