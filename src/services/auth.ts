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

export type StudentSubject = {
  subjectId: number;
  subjectName: string;
  subjectType: string;
};

export type StudentData = {
  studentRegistrationId: number;
  name: string;
  enrollmentNo: string;
  courseId: number;
  courseName: string;
  semesterId: number;
  semesterName: string;
  mobile: string;
  emailId: string;
  subjects: StudentSubject[];
};

export type StudentLoginResponse = {
  success: boolean;
  message: string;
  studentRegistrationId: number;
  name: string;
  enrollmentNo: string;
  courseId: number;
  courseName: string;
  semesterId: number;
  semesterName: string;
  mobile: string;
  emailId: string;
  subjects: StudentSubject[];
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
  attendanceStatus?: string;
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
  timeSlotId: number;
  attendanceDate: string;
  students: StudentAttendanceInput[];
};

export async function saveAttendance(
  payload: SaveAttendancePayload
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.post<{ success: boolean; message: string }>('/SaveAttendance', payload);
  return data;
}

export async function loginStudent(enrollmentNo: string, password: string): Promise<StudentData> {
  const { data } = await api.post<StudentLoginResponse>('/StudentAuthentication', {
    EnrollmentNo: enrollmentNo,
    Password: password,
  });
  const rawData = data as any;
  const isSuccess = data.success || rawData.Success || false;
  if (isSuccess) {
    return {
      studentRegistrationId: data.studentRegistrationId || rawData.StudentRegistrationId || rawData.studentRegistrationID || rawData.StudentRegistrationID || rawData.studentregistrationid || 0,
      name: data.name || rawData.Name || "",
      enrollmentNo: data.enrollmentNo || rawData.EnrollmentNo || "",
      courseId: data.courseId || rawData.CourseId || 0,
      courseName: data.courseName || rawData.CourseName || "",
      semesterId: data.semesterId || rawData.SemesterId || 0,
      semesterName: data.semesterName || rawData.SemesterName || "",
      mobile: data.mobile || rawData.Mobile || "",
      emailId: data.emailId || rawData.EmailId || rawData.EmailID || "",
      subjects: data.subjects || rawData.Subjects || [],
    };
  }
  throw new Error(data.message || rawData.Message || 'Login Failed');
}

export type StudentAttendance = {
  subjectId: number;
  subjectName: string;
  totalLectures: number;
  presentLectures: number;
  absentLectures: number;
  attendancePercentage: number;
};

export type OverallAttendance = {
  totalLectures: number;
  presentLectures: number;
  absentLectures: number;
  attendancePercentage: number;
};

export type GetStudentAttendanceResponse = {
  overallAttendance: OverallAttendance;
  subjectAttendance: StudentAttendance[];
};

export async function fetchStudentAttendance(studentRegistrationId: number): Promise<GetStudentAttendanceResponse> {
  const { data } = await api.get<GetStudentAttendanceResponse>('/GetStudentAttendance', {
    params: {
      StudentRegistrationId: studentRegistrationId,
      studentRegistrationId: studentRegistrationId
    },
  });
  return data;
}

export type FacultyChangePasswordPayload = {
  UserId: number;
  OldPassword: string;
  NewPassword: string;
  ConfirmNewPassword: string;
};

export type StudentChangePasswordPayload = {
  StudentRegistrationId: number;
  OldPassword: string;
  NewPassword: string;
  ConfirmNewPassword: string;
};

export type ChangePasswordResponse = {
  success: boolean;
  message: string;
};

export async function changeFacultyPassword(payload: FacultyChangePasswordPayload): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>('/FacultyChangePassword', payload);
  return data;
}

export async function changeStudentPassword(payload: StudentChangePasswordPayload): Promise<ChangePasswordResponse> {
  const { data } = await api.post<ChangePasswordResponse>('/StudentsChangePassword', payload);
  return data;
}







