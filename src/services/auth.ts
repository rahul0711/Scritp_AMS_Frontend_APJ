import axios from 'axios';

export type UserData = {
  userId: number;
  facultyId: number;
  facultyName: string;
  userName: string;
  userType: string;
  courseName: string;
  semesterName: string;
  subjectName: string;
  contactNo: string;
  emailId: string | null;
};

export type AuthResult = {
  user: UserData;
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
): Promise<UserData | null> {
  const { data } = await api.post<UserData[]>('/FacultyAuthentication', {
    UserName: username,
    Password: password,
    UserType: userType,
  });
  return Array.isArray(data) && data.length > 0 ? data[0] : null;
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const faculty = await loginWithType(username, password, '2');
  if (faculty) return { user: faculty, role: 'faculty' };

  const student = await loginWithType(username, password, '3');
  if (student) return { user: student, role: 'student' };

  throw new Error('Invalid username or password.');
}
