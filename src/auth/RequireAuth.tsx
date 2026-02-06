import * as React from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import FullPageLoader from "../components/loader/FullPageLoader";
import { useAuth } from "./AuthContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { ME_API } from "../api/Employee";
import { clearEmployee, setEmployee } from "../redux/employeeSlice";

export function RequireAuth({ children }: { children: React.ReactElement }) {
  const { configured, initialized, authenticated } = useAuth();
  const dispatch = useAppDispatch();
  const employee = useAppSelector((state) => state.employee.employee);
  const [checkingMe, setCheckingMe] = useState(false);
  const [meChecked, setMeChecked] = useState(false);

  const hasEmployee = !!employee?.uuid;
  const authModeKey = configured
    ? `kc:${initialized ? (authenticated ? "auth" : "noauth") : "init"}`
    : "legacy";

  useEffect(() => {
    setCheckingMe(false);
    setMeChecked(false);
  }, [authModeKey]);

  useEffect(() => {
    if (hasEmployee) return;

    if (configured) {
      if (!initialized) return;
      if (!authenticated) return;
    }

    if (checkingMe || meChecked) return;

    setCheckingMe(true);
    ME_API()
      .then((me) => {
        if (me?.uuid) dispatch(setEmployee(me));
        else dispatch(clearEmployee());
      })
      .catch(() => {
        dispatch(clearEmployee());
      })
      .finally(() => {
        setCheckingMe(false);
        setMeChecked(true);
      });
  }, [
    authenticated,
    checkingMe,
    configured,
    dispatch,
    hasEmployee,
    initialized,
    meChecked,
  ]);

  if (hasEmployee) return children;

  if (configured && !initialized) return <FullPageLoader loading={true} />;

  if (configured && !authenticated) return <Navigate to="/" replace />;

  if (checkingMe || !meChecked) return <FullPageLoader loading={true} />;

  return <Navigate to="/" replace />;
}
