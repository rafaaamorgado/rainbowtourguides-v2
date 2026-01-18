import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: ReactNode;
  sidebar: ReactNode;
  mainClassName?: string;
  contentClassName?: string;
}

export function DashboardShell({
  children,
  sidebar,
  mainClassName,
  contentClassName,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {sidebar}

      <div className="lg:pl-64">
        <main className={cn("p-8", mainClassName)}>
          <div className={cn("max-w-7xl mx-auto", contentClassName)}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
