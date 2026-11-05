export type CampusType = 'boys' | 'girls';
export type Gender = 'male' | 'female';
export type ClassGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface Student {
  id: string;
  roll_no: string;
  full_name: string;
  father_name: string;
  gender: Gender;
  campus_id: CampusType;
  class_grade: ClassGrade;
  section: string;
  dob: string;
  phone: string;
  address: string;
  admission_date: string;
  status: 'active' | 'inactive';
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  qualification: string;
  subject: string;
  campus_id: 'boys' | 'girls' | 'both';
  phone: string;
  email: string;
  experience_years: number;
  bio: string;
  image_url: string;
}

export interface AdmissionInquiry {
  id: string;
  tracking_no: string;
  applicant_name: string;
  father_name: string;
  gender: Gender;
  campus_id: CampusType;
  applied_grade: ClassGrade;
  guardian_phone: string;
  guardian_cnic: string;
  address: string;
  previous_school: string;
  status: 'pending' | 'interview_scheduled' | 'approved' | 'rejected' | 'enrolled';
  created_at: string;
  notes?: string;
}

export interface FeeRecord {
  id: string;
  voucher_no: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  class_grade: ClassGrade;
  campus_id: CampusType;
  month: string;
  year: number;
  tuition_fee: number;
  exam_fee: number;
  misc_fee: number;
  total_amount: number;
  paid_amount: number;
  status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  paid_date?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  class_grade: ClassGrade;
  campus_id: CampusType;
  student_id: string;
  student_name: string;
  roll_no: string;
  status: 'present' | 'absent' | 'leave' | 'late';
}

export interface SubjectMarks {
  name: string;
  total_marks: number;
  obtained_marks: number;
}

export interface ExamResult {
  id: string;
  exam_title: string;
  term: 'First Term' | 'Mid Term' | 'Final Term' | 'Monthly Test';
  student_id: string;
  student_name: string;
  roll_no: string;
  class_grade: ClassGrade;
  campus_id: CampusType;
  subjects: SubjectMarks[];
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade: string;
  remarks: string;
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  category: 'academic' | 'sports' | 'admission' | 'event' | 'holiday';
  content: string;
  campus_id: 'all' | 'boys' | 'girls';
  publish_date: string;
  is_pinned: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
