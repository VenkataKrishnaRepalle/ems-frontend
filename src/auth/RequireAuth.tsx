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
  const hasEmployee = !!employee?.uuid;
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (hasEmployee) {
        setState("allowed");
        return;
      }

      if (configured) {
        if (!initialized) {
          setState("checking");
          return;
        }
        if (!authenticated) {
          setState("denied");
          return;
        }
      }

      setState("checking");
      try {
        const me = await ME_API();
        if (cancelled) return;

        if (me?.uuid) {
          dispatch(setEmployee(me));
          setState("allowed");
        } else {
          dispatch(clearEmployee());
          setState("denied");
        }
      } catch {
        if (cancelled) return;
        dispatch(clearEmployee());
        setState("denied");
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [authenticated, configured, dispatch, hasEmployee, initialized]);

  if (hasEmployee) return children;
  if (configured && !initialized) return <FullPageLoader loading={true} />;
  if (state === "checking") return <FullPageLoader loading={true} />;
  if (state === "denied") return <Navigate to="/" replace />;
  return children;
}
