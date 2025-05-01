import api from "./Api";
import {EmployeePeriodAndTimeline} from "../components/types/types.d";

export const GET_ALL_ELIGIBLE_YEARS = async (userId: string) => {
    const response = await api.get(`/employeePeriod/getAllEligibleYears/${userId}`);
    return response.data as number[];
};

export const GET_EMPLOYEE_PERIOD_BY_YEAR = async(userId: string, year: number) =>  {
    const response = await api.get(`/employeePeriod/getByYear/${userId}?year=${year}`);
    return response.data as EmployeePeriodAndTimeline;
}