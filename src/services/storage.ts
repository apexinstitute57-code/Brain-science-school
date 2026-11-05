import {
  Student,
  Teacher,
  AdmissionInquiry,
  FeeRecord,
  AttendanceRecord,
  ExamResult,
  Announcement,
  ContactMessage,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_ADMISSIONS,
  INITIAL_FEES,
  INITIAL_RESULTS,
  INITIAL_ATTENDANCE,
  INITIAL_ANNOUNCEMENTS,
} from './initialData';
import { getSupabase } from './supabase';

const KEYS = {
  STUDENTS: 'bss_data_students',
  TEACHERS: 'bss_data_teachers',
  ADMISSIONS: 'bss_data_admissions',
  FEES: 'bss_data_fees',
  ATTENDANCE: 'bss_data_attendance',
  RESULTS: 'bss_data_results',
  ANNOUNCEMENTS: 'bss_data_announcements',
  MESSAGES: 'bss_data_messages',
};

function load<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return defaultValue;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

export const StorageService = {
  // Students
  getStudents(): Student[] {
    return load<Student[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudents(students: Student[]) {
    save(KEYS.STUDENTS, students);
    const client = getSupabase();
    if (client) {
      // Background async attempt
      client.from('students').upsert(students).then(() => {});
    }
  },
  addStudent(student: Student) {
    const students = this.getStudents();
    const updated = [student, ...students];
    this.saveStudents(updated);
    return updated;
  },
  updateStudent(student: Student) {
    const students = this.getStudents().map((s) => (s.id === student.id ? student : s));
    this.saveStudents(students);
    return students;
  },
  deleteStudent(id: string) {
    const students = this.getStudents().filter((s) => s.id !== id);
    this.saveStudents(students);
    return students;
  },

  // Teachers
  getTeachers(): Teacher[] {
    return load<Teacher[]>(KEYS.TEACHERS, INITIAL_TEACHERS);
  },
  saveTeachers(teachers: Teacher[]) {
    save(KEYS.TEACHERS, teachers);
    const client = getSupabase();
    if (client) {
      client.from('teachers').upsert(teachers).then(() => {});
    }
  },
  addTeacher(teacher: Teacher) {
    const teachers = [teacher, ...this.getTeachers()];
    this.saveTeachers(teachers);
    return teachers;
  },
  updateTeacher(teacher: Teacher) {
    const teachers = this.getTeachers().map((t) => (t.id === teacher.id ? teacher : t));
    this.saveTeachers(teachers);
    return teachers;
  },
  deleteTeacher(id: string) {
    const teachers = this.getTeachers().filter((t) => t.id !== id);
    this.saveTeachers(teachers);
    return teachers;
  },

  // Admissions
  getAdmissions(): AdmissionInquiry[] {
    return load<AdmissionInquiry[]>(KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
  },
  saveAdmissions(admissions: AdmissionInquiry[]) {
    save(KEYS.ADMISSIONS, admissions);
    const client = getSupabase();
    if (client) {
      client.from('admissions').upsert(admissions).then(() => {});
    }
  },
  addAdmission(inquiry: AdmissionInquiry) {
    const admissions = [inquiry, ...this.getAdmissions()];
    this.saveAdmissions(admissions);
    return admissions;
  },
  updateAdmission(inquiry: AdmissionInquiry) {
    const admissions = this.getAdmissions().map((a) => (a.id === inquiry.id ? inquiry : a));
    this.saveAdmissions(admissions);
    return admissions;
  },

  // Fees
  getFees(): FeeRecord[] {
    return load<FeeRecord[]>(KEYS.FEES, INITIAL_FEES);
  },
  saveFees(fees: FeeRecord[]) {
    save(KEYS.FEES, fees);
    const client = getSupabase();
    if (client) {
      client.from('fees').upsert(fees).then(() => {});
    }
  },
  addFee(fee: FeeRecord) {
    const fees = [fee, ...this.getFees()];
    this.saveFees(fees);
    return fees;
  },
  updateFee(fee: FeeRecord) {
    const fees = this.getFees().map((f) => (f.id === fee.id ? fee : f));
    this.saveFees(fees);
    return fees;
  },

  // Attendance
  getAttendance(): AttendanceRecord[] {
    return load<AttendanceRecord[]>(KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  },
  saveAttendance(records: AttendanceRecord[]) {
    save(KEYS.ATTENDANCE, records);
    const client = getSupabase();
    if (client) {
      client.from('attendance').upsert(records).then(() => {});
    }
  },
  recordDailyAttendance(records: AttendanceRecord[]) {
    const current = this.getAttendance();
    // Remove duplicates for the same student on the same date
    const date = records[0]?.date;
    const filtered = date ? current.filter((r) => r.date !== date || !records.some((rec) => rec.student_id === r.student_id)) : current;
    const updated = [...records, ...filtered];
    this.saveAttendance(updated);
    return updated;
  },

  // Exam Results
  getResults(): ExamResult[] {
    return load<ExamResult[]>(KEYS.RESULTS, INITIAL_RESULTS);
  },
  saveResults(results: ExamResult[]) {
    save(KEYS.RESULTS, results);
    const client = getSupabase();
    if (client) {
      client.from('exam_results').upsert(results).then(() => {});
    }
  },
  addResult(result: ExamResult) {
    const results = [result, ...this.getResults()];
    this.saveResults(results);
    return results;
  },
  updateResult(result: ExamResult) {
    const results = this.getResults().map((r) => (r.id === result.id ? result : r));
    this.saveResults(results);
    return results;
  },
  deleteResult(id: string) {
    const results = this.getResults().filter((r) => r.id !== id);
    this.saveResults(results);
    return results;
  },

  // Announcements
  getAnnouncements(): Announcement[] {
    return load<Announcement[]>(KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
  },
  saveAnnouncements(announcements: Announcement[]) {
    save(KEYS.ANNOUNCEMENTS, announcements);
    const client = getSupabase();
    if (client) {
      client.from('announcements').upsert(announcements).then(() => {});
    }
  },
  addAnnouncement(ann: Announcement) {
    const announcements = [ann, ...this.getAnnouncements()];
    this.saveAnnouncements(announcements);
    return announcements;
  },
  updateAnnouncement(ann: Announcement) {
    const announcements = this.getAnnouncements().map((a) => (a.id === ann.id ? ann : a));
    this.saveAnnouncements(announcements);
    return announcements;
  },
  deleteAnnouncement(id: string) {
    const announcements = this.getAnnouncements().filter((a) => a.id !== id);
    this.saveAnnouncements(announcements);
    return announcements;
  },

  // Contact Messages
  getMessages(): ContactMessage[] {
    return load<ContactMessage[]>(KEYS.MESSAGES, []);
  },
  addMessage(message: ContactMessage) {
    const messages = [message, ...this.getMessages()];
    save(KEYS.MESSAGES, messages);
    return messages;
  },

  // Export to CSV helper
  exportToCSV(filename: string, rows: Record<string, any>[]) {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map((row) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
              return cell;
            })
            .join(separator)
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
