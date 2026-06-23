import axios from 'axios';

export type UserData = {
  userId: number;
  facultyId: number;
  facultyName: string;
  userName: string;
  userType: string;
  courseId: number;
  subjectId: number;
  semesterId: number;
  courseName: string;
  semesterName: string;
  subjectName: string;
  contactNo: string;
  emailId: string | null;
};

export type AuthResult = {
  /** All allotted records for the user (each with a course/semester/subject combo) */
  allRecords: UserData[];
  role: 'faculty' | 'student';
};

const api = axios.create({
  baseURL: 'https://apjapi.scriptindia.in/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

async function loginWithType(
  username: string,
  password: string,
  userType: '2' | '3',
): Promise<UserData[]> {
  const { data } = await api.post<UserData[]>('/FacultyAuthentication', {
    UserName: username,
    Password: password,
    UserType: userType,
  });
  return Array.isArray(data) && data.length > 0 ? data : [];
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const facultyRecords = await loginWithType(username, password, '2');
  if (facultyRecords.length > 0) return { allRecords: facultyRecords, role: 'faculty' };

  const studentRecords = await loginWithType(username, password, '3');
  if (studentRecords.length > 0) return { allRecords: studentRecords, role: 'student' };

  throw new Error('Invalid username or password.');
}

export type SemesterOption = {
  semesterId: number;
  semesterName: string;
};

export type SubjectOption = {
  subjectId: number;
  subjectName: string;
};

export async function fetchSemesters(userId: number, courseId: number): Promise<SemesterOption[]> {
  const { data } = await api.get<SemesterOption[]>('/GetSemester', {
    params: { UserId: userId, CourseId: courseId },
  });
  return Array.isArray(data) ? data : [];
}

export async function fetchSubjects(userId: number, courseId: number, semesterId: number): Promise<SubjectOption[]> {
  const { data } = await api.get<SubjectOption[]>('/GetSubject', {
    params: { UserId: userId, CourseId: courseId, SemesterId: semesterId },
  });
  return Array.isArray(data) ? data : [];
}


export type TimeSlotOption = {
  timeSlotId: number;
  timeSlotName: string;
};

export async function fetchTime(): Promise<TimeSlotOption[]> {
  const { data } = await api.get<TimeSlotOption[]>('/GetTimeSlot');
  return Array.isArray(data) ? data : [];
}


export type Student = {
  studentRegistrationId: number;
  enrollmentNo: string;
  nameAsPerMarksheet: string;
};

export type GetStudentsResponse = {
  success: boolean;
  message?: string;
  students?: Student[];
};

export async function fetchStudents(
  userId: number,
  courseId: number,
  semesterId: number,
  subjectId: number,
  timeSlotId: number
): Promise<GetStudentsResponse> {
  const { data } = await api.get<GetStudentsResponse>('/GetStudents', {
    params: {
      UserId: userId,
      CourseId: courseId,
      SemesterId: semesterId,
      SubjectId: subjectId,
      TimeSlotId: timeSlotId
    },
  });
  return data;
}

export async function facultyInAttendance(payload: {
  userId: number;
  courseId: number;
  semesterId: number;
  subjectId: number;
  timeSlotId: number;
  remarks: string;
 
}): Promise<{ success: boolean; message?: string }> {
  const { data } = await api.post<{ success: boolean; message?: string }>('/FacultyInAttendance', payload);
  return data;
}

export type StudentAttendanceInput = {
  StudentRegistrationId: number;
  status: 'P' | 'A';
};

export type SaveAttendancePayload = {
  userId: number;
  courseId: number;
  semesterId: number;
  subjectId: number;
  attendanceDate: string;
  students: StudentAttendanceInput[];
};

export async function saveAttendance(
  payload: SaveAttendancePayload
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>('/SaveAttendance', payload);
  return data;
}






