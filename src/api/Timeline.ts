import api from "./Api";
import {TimelineAndReview} from "../components/types/types.d";

export const GET_EMPLOYEE_PERIOD_BY_TYPE = async(employeePeriodUuid: string, reviewType: string) => {
    var response = await api.get(`/timeline/getByEmployeePeriodId/${employeePeriodUuid}/type/${reviewType}`);
    return response.data as TimelineAndReview;
}