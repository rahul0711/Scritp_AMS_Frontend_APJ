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
  baseURL: 'https://demo.scriptindia.in:8059',
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
