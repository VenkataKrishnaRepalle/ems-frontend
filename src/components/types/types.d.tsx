export const APPLICATION_URL = `http://localhost:8082/api/`;

export interface Login {
    email: string;
    password: string;
    requestQuery: {}
}

export interface Employee {
    uuid: string;
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    username: string;
    email: string;
    department: string;
    managerUuid: string;
    managerFirstName: string;
    managerLastName: string;
    managerAccountStatus: string;
    joiningDate: string;
    leavingDate: string;
    status: string;
}

export interface EmployeeMeResponse {
    employee: Employee;
    roles: [string];
}

export interface EmployeeRequest {
    firstName: string;
    lastName: string;
    gender: string;
    dateOfBirth: string;
    phoneNumber: string;
    email: string;
    joiningDate: string;
    leavingDate?: string;
    departmentName: string;
    isManager: string;
    managerUuid: string;
    jobTitle: string;
    password: string;
    confirmPassword: string;
}

export interface Manager {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface Department {
    name: string;
    value: string;
}

export interface Education {
    uuid: string;
    employeeUuid: string;
    degree: string;
    schoolName: string;
    grade: string;
    startDate: string;
    endDate: string;
    createdTime: Date;
    updatedTime: Date;
}

export interface Attendance {
    uuid: string;
    employeeUuid: string;
    workMode: string;
    type: string;
    status: string;
    date: Date;
    createdTime: Date;
    updatedTime: Date;
}

export interface Period {
    uuid: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    status: string;
    createdBy: string;
    createdTime: string;
    updatedTime: string;
}

export interface EmployeePeriodAndTimeline {
    employeeId: string;
    employeeCycleId: string;
    period: Period;
    Q1: Review;
    Q2: Review;
    Q3: Review;
    Q4: Review;
}

export interface Review {
    uuid: string;
    timelineUuid: string;
    type: string;
    whatWentWell: string;
    whatDoneBetter: string;
    wayForward: string;
    overallComments: string;
    managerWhatWentWell: string;
    managerWhatDoneBetter: string;
    managerWayForward: string;
    managerOverallComments: string;
    rating: string;
    status: string;
    createdTime: string;
    updatedTime: string;
}

export interface TimelineAndReview {
    uuid: string;
    employeePeriodUuid: string;
    type: string;
    startTime: string;
    overdueTime: string;
    lockTime: string;
    endTime: string;
    status: string;
    summaryStatus: string;
    review: Review;
    createdTime: string;
    updatedTime: string;
}

export interface Error {
    code: String;
    message: String;
}

export interface ErrorResponse {
    status: String;
    error: Error;
}

export interface ForgotPasswordRequest {
    email: string;
    otp: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordRequest {
    email: string;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface EmployeeSession {
    uuid: string;
    employeeUuid: string;
    token: string;
    latitude: string;
    longitude: string;
    browserName: string;
    osName: string;
    platform: string;
    location: string;
    isActive: boolean;
    loginTime: string;
}