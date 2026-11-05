import React, { useState, useEffect } from 'react';
import { AttendanceRecord, CampusType, ClassGrade, Student } from '../../types';
import { StorageService } from '../../services/storage';
import { Calendar, CheckCircle2, UserCheck, AlertCircle, Save } from 'lucide-react';

interface AttendanceManagerProps {
  campusFilter: 'all' | CampusType;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ campusFilter }) => {
  const [selectedCampus, setSelectedCampus] = useState<CampusType>(
    campusFilter === 'girls' ? 'girls' : 'boys'
  );
  const [selectedGrade, setSelectedGrade] = useState<ClassGrade>(10);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const allStudents = StorageService.getStudents();
  const classStudents = allStudents.filter(
    (s) => s.campus_id === selectedCampus && s.class_grade === selectedGrade && s.status === 'active'
  );

  // Current attendance map: student_id -> status
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord['status']>>({});

  useEffect(() => {
    // Load existing records for this date, campus, and grade
    const allAttendance = StorageService.getAttendance();
    const existing = allAttendance.filter(
      (a) => a.date === selectedDate && a.campus_id === selectedCampus && a.class_grade === selectedGrade
    );

    const map: Record<string, AttendanceRecord['status']> = {};
    classStudents.forEach((st) => {
      const rec = existing.find((e) => e.student_id === st.id);
      map[st.id] = rec ? rec.status : 'present';
    });

    setAttendanceMap(map);
  }, [selectedDate, selectedCampus, selectedGrade]);

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const map: Record<string, AttendanceRecord['status']> = {};
    classStudents.forEach((st) => {
      map[st.id] = 'present';
    });
    setAttendanceMap(map);
  };

  const handleSaveAttendance = () => {
    const records: AttendanceRecord[] = classStudents.map((st) => ({
      id: `att-${selectedDate}-${st.id}`,
      date: selectedDate,
      class_grade: selectedGrade,
      campus_id: selectedCampus,
      student_id: st.id,
      student_name: st.full_name,
      roll_no: st.roll_no,
      status: attendanceMap[st.id] || 'present',
    }));

    StorageService.recordDailyAttendance(records);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Metrics
  const total = classStudents.length;
  const presentCount = Object.values(attendanceMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === 'absent').length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === 'leave').length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === 'late').length;
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Daily Student Attendance Register</h2>
          <p className="text-xs text-slate-400">
            Record, update and monitor class attendance records with automated daily percentage tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleMarkAllPresent}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 hover:border-slate-500 rounded-lg cursor-pointer transition-colors"
          >
            Mark All Present
          </button>

          <button
            onClick={handleSaveAttendance}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg cursor-pointer shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Attendance records for Class {selectedGrade} ({selectedCampus} Campus) saved successfully!</span>
        </div>
      )}

      {/* Control Bar: Date, Campus & Grade */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Campus Wing</label>
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value as CampusType)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            <option value="boys">Boys Campus Wing</option>
            <option value="girls">Girls Campus Wing</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">Class / Grade</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(Number(e.target.value) as ClassGrade)}
            className="w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((gr) => (
              <option key={gr} value={gr}>Grade {gr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</div>
          <div className="text-xl font-bold text-white font-mono">{total}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-emerald-400">Present</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{presentCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-red-400">Absent</div>
          <div className="text-xl font-bold text-red-400 font-mono">{absentCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
          <div className="text-[10px] uppercase font-bold text-amber-400">On Leave</div>
          <div className="text-xl font-bold text-amber-400 font-mono">{leaveCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase font-bold text-blue-400">Attendance Rate</div>
          <div className="text-xl font-bold text-white font-mono">{attendanceRate}%</div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Father Name</th>
                <th className="py-3 px-4 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500">
                    No active students enrolled in Grade {selectedGrade} ({selectedCampus} Campus).
                  </td>
                </tr>
              ) : (
                classStudents.map((st) => {
                  const currentStatus = attendanceMap[st.id] || 'present';
                  return (
                    <tr key={st.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-amber-400">
                        {st.roll_no}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {st.full_name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {st.father_name}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {(['present', 'absent', 'leave', 'late'] as const).map((stat) => (
                            <button
                              key={stat}
                              type="button"
                              onClick={() => handleStatusChange(st.id, stat)}
                              className={`px-3 py-1 text-[11px] font-bold uppercase rounded cursor-pointer transition-all ${
                                currentStatus === stat
                                  ? stat === 'present'
                                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                                    : stat === 'absent'
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : stat === 'leave'
                                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                                    : 'bg-blue-400 text-slate-950 shadow-sm'
                                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                              }`}
                            >
                              {stat}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
