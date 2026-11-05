import React, { useState } from 'react';
import { Teacher, CampusType } from '../../types';
import { StorageService } from '../../services/storage';
import { Plus, Edit2, Trash2, Search, X, GraduationCap, BookOpen, Mail, Phone } from 'lucide-react';

interface TeacherManagerProps {
  campusFilter: 'all' | CampusType;
}

export const TeacherManager: React.FC<TeacherManagerProps> = ({ campusFilter }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(StorageService.getTeachers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    qualification: '',
    subject: '',
    campus_id: 'both' as 'boys' | 'girls' | 'both',
    phone: '',
    email: '',
    experience_years: 5,
    bio: '',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
  });

  const filteredTeachers = teachers.filter((t) => {
    const campusMatch =
      campusFilter === 'all' || t.campus_id === campusFilter || t.campus_id === 'both';
    const searchMatch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.qualification.toLowerCase().includes(search.toLowerCase());
    return campusMatch && searchMatch;
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      designation: 'Senior Faculty Member',
      qualification: 'M.Sc Physics / B.Ed',
      subject: 'Physics & General Science',
      campus_id: 'both',
      phone: '03401212046',
      email: 'teacher@brainscienceschool.edu.pk',
      experience_years: 6,
      bio: 'Dedicated educator specializing in hands-on science pedagogy and character formation.',
      image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      designation: t.designation,
      qualification: t.qualification,
      subject: t.subject,
      campus_id: t.campus_id,
      phone: t.phone,
      email: t.email,
      experience_years: t.experience_years,
      bio: t.bio,
      image_url: t.image_url,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove faculty member ${name}?`)) {
      const updated = StorageService.deleteTeacher(id);
      setTeachers(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subject.trim()) return;

    if (editingTeacher) {
      const updatedList = StorageService.updateTeacher({
        ...editingTeacher,
        ...formData,
      });
      setTeachers(updatedList);
    } else {
      const updatedList = StorageService.addTeacher({
        id: `tch-${Date.now()}`,
        ...formData,
      });
      setTeachers(updatedList);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Faculty & Class Assignment Directory</h2>
          <p className="text-xs text-slate-400">
            Manage teacher profiles, qualifications, and campus department assignments
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-6 top-5.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teachers by name, subject, or qualification..."
          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
        />
      </div>

      {/* Teacher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 shrink-0">
                    <img
                      src={teacher.image_url}
                      alt={teacher.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{teacher.name}</h3>
                    <div className="text-xs text-amber-400">{teacher.designation}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher.id, teacher.name)}
                    className="p-1 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 mb-4 bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{teacher.qualification}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{teacher.subject}</span>
                </div>
                <div className="text-slate-400 text-[11px] pt-1">
                  Campus: <strong className="text-white capitalize">{teacher.campus_id}</strong> · {teacher.experience_years} Years Exp.
                </div>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {teacher.bio}
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{teacher.phone}</span>
              <span className="text-[11px] text-slate-500">{teacher.email}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8 text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingTeacher ? 'Edit Faculty Record' : 'Add New Teacher'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Assignment</label>
                  <select
                    value={formData.campus_id}
                    onChange={(e) => setFormData({ ...formData, campus_id: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="both">Both Campuses</option>
                    <option value="boys">Boys Campus Only</option>
                    <option value="girls">Girls Campus Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Qualification</label>
                  <input
                    type="text"
                    required
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Specialization</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Short Bio</label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
                  {editingTeacher ? 'Update Faculty' : 'Save Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
