"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ManagerProjects() {
  useEffect(() => {
    // Redirect to main dashboard which has the projects tab
    redirect("/manager-dashboard");
  }, []);

  return null;
}
