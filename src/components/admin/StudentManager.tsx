import React, { useState } from 'react';
import { Student, CampusType, ClassGrade, Gender } from '../../types';
import { StorageService } from '../../services/storage';
import { Search, Plus, Download, Edit2, Trash2, X, Check, Filter, User } from 'lucide-react';

interface StudentManagerProps {
  campusFilter: 'all' | CampusType;
}

export const StudentManager: React.FC<StudentManagerProps> = ({ campusFilter }) => {
  const [students, setStudents] = useState<Student[]>(StorageService.getStudents());
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState<'all' | number>('all');
  const [internalCampus, setInternalCampus] = useState<'all' | CampusType>(campusFilter);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [formData, setFormData] = useState({
    roll_no: '',
    full_name: '',
    father_name: '',
    gender: 'male' as Gender,
    campus_id: 'boys' as CampusType,
    class_grade: 10 as ClassGrade,
    section: 'A',
    dob: '2010-01-01',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Filter students
  const filteredStudents = students.filter((s) => {
    const campusMatch =
      internalCampus === 'all'
        ? campusFilter === 'all' || s.campus_id === campusFilter
        : s.campus_id === internalCampus;
    const gradeMatch = gradeFilter === 'all' || s.class_grade === gradeFilter;
    const searchLower = searchQuery.toLowerCase();
    const searchMatch =
      !searchQuery ||
      s.full_name.toLowerCase().includes(searchLower) ||
      s.roll_no.toLowerCase().includes(searchLower) ||
      s.father_name.toLowerCase().includes(searchLower);

    return campusMatch && gradeMatch && searchMatch;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const nextRoll = `BSS-10-B0${students.length + 1}`;
    setFormData({
      roll_no: nextRoll,
      full_name: '',
      father_name: '',
      gender: 'male',
      campus_id: 'boys',
      class_grade: 10,
      section: 'A',
      dob: '2010-01-01',
      phone: '',
      address: 'Zafarwal',
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      roll_no: student.roll_no,
      full_name: student.full_name,
      father_name: student.father_name,
      gender: student.gender,
      campus_id: student.campus_id,
      class_grade: student.class_grade,
      section: student.section,
      dob: student.dob,
      phone: student.phone,
      address: student.address,
      status: student.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete student ${name}?`)) {
      const updated = StorageService.deleteStudent(id);
      setStudents(updated);
    }
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.roll_no.trim()) return;

    if (editingStudent) {
      const updatedStudent: Student = {
        ...editingStudent,
        ...formData,
      };
      const updatedList = StorageService.updateStudent(updatedStudent);
      setStudents(updatedList);
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        ...formData,
        admission_date: new Date().toISOString().split('T')[0],
      };
      const updatedList = StorageService.addStudent(newStudent);
      setStudents(updatedList);
    }

    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    const exportRows = filteredStudents.map((s) => ({
      Roll_Number: s.roll_no,
      Full_Name: s.full_name,
      Father_Name: s.father_name,
      Gender: s.gender,
      Campus: s.campus_id === 'girls' ? 'Girls Campus' : 'Boys Campus',
      Class_Grade: `Grade ${s.class_grade}`,
      Section: s.section,
      Phone: s.phone,
      Address: s.address,
      Admission_Date: s.admission_date,
      Status: s.status,
    }));
    StorageService.exportToCSV('Brain_Science_School_Students', exportRows);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Student Enrollment Directory</h2>
          <p className="text-xs text-slate-400">
            Showing {filteredStudents.length} registered students across Grade 1 to Grade 10
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, roll no, father name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={internalCampus}
            onChange={(e) => setInternalCampus(e.target.value as any)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Campuses</option>
            <option value="boys">Boys Campus Only</option>
            <option value="girls">Girls Campus Only</option>
          </select>
        </div>

        <div className="sm:col-span-4">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Grades (1–10)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((gr) => (
              <option key={gr} value={gr}>
                Class / Grade {gr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Campus Wing</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No student records found matching the active filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {student.roll_no}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {student.full_name}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {student.father_name}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      Grade {student.class_grade} ({student.section})
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-xs">
                        {student.campus_id === 'girls' ? 'Girls Campus' : 'Boys Campus'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {student.phone || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          student.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded cursor-pointer"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id, student.full_name)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded cursor-pointer"
                          title="Delete Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">
              {editingStudent ? 'Edit Student Record' : 'Register New Student'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">Brain Science School Student Registry</p>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                  <input
                    type="text"
                    required
                    value={formData.roll_no}
                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Father's Name</label>
                  <input
                    type="text"
                    required
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Wing</label>
                  <select
                    value={formData.campus_id}
                    onChange={(e) => {
                      const campus = e.target.value as CampusType;
                      setFormData({
                        ...formData,
                        campus_id: campus,
                        gender: campus === 'girls' ? 'female' : 'male',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="boys">Boys Campus</option>
                    <option value="girls">Girls Campus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Class / Grade</label>
                  <select
                    value={formData.class_grade}
                    onChange={(e) => setFormData({ ...formData, class_grade: Number(e.target.value) as ClassGrade })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((gr) => (
                      <option key={gr} value={gr}>Class {gr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="03401212046"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address in Zafarwal"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                >
                  {editingStudent ? 'Update Student' : 'Save & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
