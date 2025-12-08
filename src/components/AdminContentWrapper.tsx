"use client";

import { AdminGate } from "@/components/AdminGate";

type AdminContentWrapperProps = {
  children: React.ReactNode;
};

export function AdminContentWrapper({ children }: AdminContentWrapperProps) {
  return <AdminGate>{children}</AdminGate>;
}
