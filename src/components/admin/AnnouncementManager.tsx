import React, { useState } from 'react';
import { Announcement, CampusType } from '../../types';
import { StorageService } from '../../services/storage';
import { Plus, Edit2, Trash2, Pin, Calendar, X, Bell } from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(StorageService.getAnnouncements());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'academic' as Announcement['category'],
    content: '',
    campus_id: 'all' as 'all' | 'boys' | 'girls',
    is_pinned: false,
  });

  const handleOpenAdd = () => {
    setEditingAnn(null);
    setFormData({
      title: '',
      category: 'academic',
      content: '',
      campus_id: 'all',
      is_pinned: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: Announcement) => {
    setEditingAnn(ann);
    setFormData({
      title: ann.title,
      category: ann.category,
      content: ann.content,
      campus_id: ann.campus_id,
      is_pinned: ann.is_pinned,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      const updated = StorageService.deleteAnnouncement(id);
      setAnnouncements(updated);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    if (editingAnn) {
      const updated = StorageService.updateAnnouncement({
        ...editingAnn,
        ...formData,
      });
      setAnnouncements(updated);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        ...formData,
        publish_date: new Date().toISOString().split('T')[0],
      };
      const updated = StorageService.addAnnouncement(newAnn);
      setAnnouncements(updated);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Announcements & Event Circulars</h2>
          <p className="text-xs text-slate-400">
            Publish circulars, holiday notices, and date sheets to the school public portal
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Notice</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`p-5 rounded-xl bg-slate-900 border transition-all ${
              ann.is_pinned ? 'border-amber-400/60 shadow-lg shadow-amber-950/20' : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono">{ann.publish_date}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase text-[11px] font-bold text-slate-300">{ann.category}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize text-slate-300">
                  {ann.campus_id === 'all' ? 'Both Wings' : `${ann.campus_id} Wing`}
                </span>
                {ann.is_pinned && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-1 text-slate-400 hover:text-amber-400 rounded cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="p-1 text-slate-400 hover:text-red-400 rounded cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-base font-bold text-white mb-2">{ann.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{ann.content}</p>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-4">
              {editingAnn ? 'Edit School Announcement' : 'Publish New Circular'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notice Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Winter Vacation Dates Announced"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="academic">Academic & Exams</option>
                    <option value="admission">Admissions</option>
                    <option value="sports">Sports & Athletics</option>
                    <option value="event">Campus Event</option>
                    <option value="holiday">Holiday Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Campus Scope</label>
                  <select
                    value={formData.campus_id}
                    onChange={(e) => setFormData({ ...formData, campus_id: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="all">Both Campuses</option>
                    <option value="boys">Boys Campus Only</option>
                    <option value="girls">Girls Campus Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Content</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed circular text for parents and students..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded text-amber-400 focus:ring-amber-400 bg-slate-950 border-slate-800"
                />
                <label htmlFor="pinCheck" className="text-xs text-slate-300 cursor-pointer">
                  Pin to top of website bulletin as a priority circular
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
