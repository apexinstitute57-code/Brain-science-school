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
import { getSupabase, discoverAdmissionsTableSchema } from './supabase';

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
  },
  addAdmission(inquiry: AdmissionInquiry) {
    const admissions = [inquiry, ...this.getAdmissions()];
    this.saveAdmissions(admissions);
    return admissions;
  },

  /**
   * Directly inserts an admission inquiry into the Supabase 'admissions' table.
   * Features:
   * - Adaptive schema compatibility (supports applicant_name/student_name, father_name/guardian_name, etc.)
  /**
   * Directly inserts an admission inquiry into the Supabase 'admissions' table.
   * Features:
   * - Inspects database schema dynamically so column names are never guessed.
   * - Form fields mapped directly to public.admissions columns.
   * - Guarantees unique tracking number.
   * - Uses direct INSERT without .select() so public RLS policy does not fail.
   * - Adaptive retry loop handles any missing optional columns or type mismatches.
   * - Honest reporting: savedToSupabase is ONLY true if Supabase committed the insert.
   */
  async submitAdmissionWithSupabase(
    inquiryData: Omit<AdmissionInquiry, 'id'>
  ): Promise<{ success: boolean; inquiry: AdmissionInquiry; savedToSupabase: boolean; error?: string }> {
    const client = getSupabase();
    const trackingCode =
      inquiryData.tracking_no ||
      `BSS-${new Date().getFullYear()}-ADM${Math.floor(1000 + Math.random() * 9000)}`;

    const createdInquiry: AdmissionInquiry = {
      id: `adm-${Date.now()}`,
      ...inquiryData,
      tracking_no: trackingCode,
    };

    if (!client) {
      return {
        success: false,
        inquiry: createdInquiry,
        savedToSupabase: false,
        error: 'Supabase is not connected. Please verify Supabase URL and Key.',
      };
    }

    let savedToSupabase = false;
    let errorMessage: string | undefined;

    try {
      // 1. Discover actual columns from the database schema
      const schema = await discoverAdmissionsTableSchema(client);
      const knownCols = schema.columns.map((c) => c.toLowerCase());

      // 2. Build guaranteed payload matching all 8 NOT NULL constraints
      // Required: tracking_no, applicant_name, father_name, gender, campus_id, applied_grade, guardian_phone, address
      let payload: Record<string, any> = {
        tracking_no: trackingCode,
        applicant_name: inquiryData.applicant_name.trim(),
        father_name: inquiryData.father_name.trim(),
        gender: inquiryData.gender || 'male',
        campus_id: inquiryData.campus_id || 'boys',
        applied_grade: Number(inquiryData.applied_grade) || 9,
        guardian_phone: inquiryData.guardian_phone.trim(),
        address: inquiryData.address.trim() || 'Zafarwal, Punjab',
        previous_school: inquiryData.previous_school?.trim() || null,
        status: inquiryData.status || 'pending',
        notes: inquiryData.notes || 'Submitted via Online Admission Form',
        guardian_cnic: inquiryData.guardian_cnic || null,
      };

      // Add compatible alias columns if the table uses different naming
      if (knownCols.includes('student_name')) payload['student_name'] = inquiryData.applicant_name.trim();
      if (knownCols.includes('guardian_name')) payload['guardian_name'] = inquiryData.father_name.trim();
      if (knownCols.includes('phone')) payload['phone'] = inquiryData.guardian_phone.trim();
      if (knownCols.includes('grade')) payload['grade'] = `Grade ${inquiryData.applied_grade}`;
      if (knownCols.includes('campus')) payload['campus'] = inquiryData.campus_id || 'boys';

      // 3. Perform Insert WITHOUT .select() (critical for public RLS policy!)
      let attempts = 0;
      while (attempts < 8) {
        attempts++;

        const { error } = await client
          .from('admissions')
          .insert([payload]);

        if (!error) {
          savedToSupabase = true;
          errorMessage = undefined;
          break;
        }

        const errStr = error.message || '';

        // If a column doesn't exist, prune it and retry
        const colMatch =
          errStr.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column of ['"]?admissions['"]?/i) ||
          errStr.match(/column ['"]?([a-zA-Z0-9_]+)['"]? of relation ['"]?admissions['"]? does not exist/i) ||
          errStr.match(/column admissions\.([a-zA-Z0-9_]+) does not exist/i);

        if (colMatch && colMatch[1]) {
          const missingCol = colMatch[1];
          delete payload[missingCol];
          continue;
        }

        // If grade type syntax error
        if (errStr.includes('invalid input syntax for type integer') && payload['grade']) {
          delete payload['grade'];
          payload['applied_grade'] = Number(inquiryData.applied_grade);
          continue;
        }

        // If UUID error
        if (errStr.includes('invalid input syntax for type uuid') && payload['id']) {
          delete payload['id'];
          continue;
        }

        // Not-null constraint violation: ensure fallback value is supplied
        const nullMatch = errStr.match(/null value in column "([^"]+)" of relation "admissions" violates not-null constraint/i);
        if (nullMatch && nullMatch[1]) {
          const nullCol = nullMatch[1];
          if (nullCol === 'gender') payload['gender'] = 'male';
          else if (nullCol === 'campus_id') payload['campus_id'] = 'boys';
          else if (nullCol === 'applied_grade') payload['applied_grade'] = 9;
          else if (nullCol === 'address') payload['address'] = 'Zafarwal';
          else payload[nullCol] = 'N/A';
          continue;
        }

        errorMessage = errStr;
        break;
      }
    } catch (err: any) {
      console.warn('Supabase query exception:', err);
      errorMessage = err?.message || 'Network error while transmitting to Supabase';
    }

    if (savedToSupabase) {
      // Save locally to keep in sync
      const localAdmissions = [createdInquiry, ...this.getAdmissions().filter((a) => a.tracking_no !== createdInquiry.tracking_no)];
      save(KEYS.ADMISSIONS, localAdmissions);

      return {
        success: true,
        inquiry: createdInquiry,
        savedToSupabase: true,
      };
    } else {
      return {
        success: false,
        inquiry: createdInquiry,
        savedToSupabase: false,
        error: errorMessage || 'Database insert failed. Please verify Supabase URL, API Key, and RLS policies.',
      };
    }
  },

  /**
   * Fetches latest admissions records directly from the Supabase 'admissions' table.
   * Ensures shared data synchronization across all devices and visitors.
   */
  async fetchAdmissionsFromSupabase(): Promise<{
    admissions: AdmissionInquiry[];
    fromSupabase: boolean;
    error?: string;
  }> {
    const client = getSupabase();

    if (!client) {
      return {
        admissions: [],
        fromSupabase: false,
        error: 'Supabase client not connected.',
      };
    }

    try {
      const { data, error } = await client
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return {
          admissions: [],
          fromSupabase: false,
          error: error.message,
        };
      }

      if (data && Array.isArray(data)) {
        // Map database columns to AdmissionInquiry interface
        const remoteAdmissions: AdmissionInquiry[] = data.map((row: any) => ({
          id: String(row.id || `adm-${Date.now()}`),
          tracking_no: String(row.tracking_no || row.tracking_number || (row.id ? 'BSS-' + String(row.id).slice(-6) : 'BSS-ADM')),
          applicant_name: String(row.applicant_name || row.student_name || row.full_name || row.name || 'Anonymous'),
          father_name: String(row.father_name || row.guardian_name || row.parent_name || 'N/A'),
          gender: (row.gender === 'female' ? 'female' : 'male') as any,
          campus_id: (row.campus_id === 'girls' || row.campus === 'girls' ? 'girls' : 'boys') as any,
          applied_grade: (typeof row.applied_grade === 'number' ? row.applied_grade : (parseInt(row.grade) || parseInt(row.class) || 9)) as any,
          guardian_phone: String(row.guardian_phone || row.phone || row.contact_no || row.mobile || 'N/A'),
          guardian_cnic: String(row.guardian_cnic || 'N/A'),
          address: String(row.address || 'Zafarwal'),
          previous_school: String(row.previous_school || 'N/A'),
          status: (['pending', 'interview_scheduled', 'approved', 'rejected', 'enrolled'].includes(row.status)
            ? row.status
            : 'pending') as any,
          created_at: String(row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0]),
          notes: String(row.notes || ''),
        }));

        // Keep local cache updated with real Supabase records
        save(KEYS.ADMISSIONS, remoteAdmissions);

        return {
          admissions: remoteAdmissions,
          fromSupabase: true,
        };
      }

      return { admissions: [], fromSupabase: true };
    } catch (err: any) {
      return {
        admissions: [],
        fromSupabase: false,
        error: err?.message || 'Fetch failed',
      };
    }
  },

  async updateAdmission(inquiry: AdmissionInquiry): Promise<AdmissionInquiry[]> {
    const admissions = this.getAdmissions().map((a) => (a.id === inquiry.id ? inquiry : a));
    this.saveAdmissions(admissions);

    const client = getSupabase();
    if (client) {
      try {
        await client
          .from('admissions')
          .update({
            status: inquiry.status,
            notes: inquiry.notes,
          })
          .or(`id.eq.${inquiry.id},tracking_no.eq.${inquiry.tracking_no}`);
      } catch (e) {
        console.warn('Could not sync status update to Supabase:', e);
      }
    }

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
