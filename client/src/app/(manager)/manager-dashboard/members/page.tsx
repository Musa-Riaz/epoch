"use client";

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function ManagerMembers() {
  useEffect(() => {
    // Redirect to main dashboard which has the members tab
    redirect("/manager-dashboard");
  }, []);

  return null;
}
