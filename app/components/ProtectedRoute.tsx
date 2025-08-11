"use client";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

import type { ReactNode } from "react";

interface UserType {
  user_id?: string | number;
  role_id?: string | number;
  [key: string]: any;
}

interface ProtectedRouteProps {
  allowedRoleIds?: string[];
  children: ReactNode;
}

export default function ProtectedRoute({ allowedRoleIds = [], children }: ProtectedRouteProps) {
  const currentUser: UserType = useSelector((state: any) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (
      !currentUser?.user_id ||
      !currentUser?.role_id ||
      (allowedRoleIds.length > 0 && !allowedRoleIds.includes(String(currentUser.role_id)))
    ) {
      toast.error("You must be logged in with proper access to view this page.");
        router.replace("/auth/signin");
    //   setTimeout(() => {
    //     router.replace("/auth/signin");
    //   }, 1000);
    }
  }, [currentUser, router, allowedRoleIds]);

  return <>{children}</>;
}