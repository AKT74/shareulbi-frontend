"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  BookOpen,
  FileText,
  User,
  CheckSquare,
  LogOut,
  MessageSquare,
  History,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import LogoutDialog from "../dialogs/logout-dialog";
import ReportFeedbackDialog from "../dialogs/report-feedback-dialog";
import { useAuth } from "@/app/context/auth-context";
import { useAdminStore } from "@/store/admin.store";

type SidebarActive =
  | "dashboard"
  | "e-learning"
  | "works"
  | "profile"
  | "validation"
  | "admin-contents"
  | "admin-users"
  | "admin-categories"
  | "admin-reports"
  | "admin-activity-logs";

interface AppSidebarProps {
  active?: SidebarActive;
}

export default function AppSidebar({ active }: AppSidebarProps) {
  const { user } = useAuth();
  const [openLogout, setOpenLogout] = useState(false);
  const [openReport, setOpenReport] = useState(false);

  const pendingUserCount = useAdminStore((state) => state.pendingUserCount);

  console.log("USER SIDEBAR:", user);

  if (!user) return null;
  const isDosen = user.role.name === "dosen";
  const isAdmin = user.role.name === "admin";

  return (
    <>
      <aside className="w-[12rem] border-r flex flex-col justify-between h-screen sticky top-0">
        <div>
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex h-16 items-center justify-center border-b"
          >
            <img
              src="/images/logo/shareulbi_logo.png"
              className="h-8"
              alt="ShareULBI"
            />
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-2">
            <Link href="/dashboard">
              <Button
                variant={active === "dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <Home size={18} /> Home
              </Button>
            </Link>

            <Link href="/e-learning">
              <Button
                variant={active === "e-learning" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <BookOpen size={18} /> E-Learning
              </Button>
            </Link>

            <Link href="/works">
              <Button
                variant={active === "works" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <FileText size={18} /> Works
              </Button>
            </Link>

            <Link href="/profile">
              <Button
                variant={active === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
              >
                <User size={18} /> Profile
              </Button>
            </Link>

            {/* ROLE-BASED */}

            {isDosen && (
              <Link href="/validation">
                <Button
                  variant={active === "validation" ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <CheckSquare size={18} /> Validation
                </Button>
              </Link>
            )}

            {/* DIVIDER ADMIN */}
            {isAdmin && (
              <>
                <div className="my-2 border-t" />

                <p className="px-3 text-xs text-muted-foreground uppercase">
                  Admin
                </p>
                <Link href="/admin/contents">
                  <Button
                    variant={
                      active === "admin-contents" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-2"
                  >
                    <FileText size={18} /> Kelola Konten
                  </Button>
                </Link>

                <Link href="/admin/users">
                  <Button
                    variant={active === "admin-users" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 relative"
                  >
                    <User size={18} />
                    <span className="flex-1 text-left">Kelola Users</span>

                    {pendingUserCount > 0 && (
                      <span
                        className="
                                  ml-auto
                                  bg-red-500 text-white
                                  text-xs px-2 py-0.5
                                  rounded-full
                                  "
                      >
                        {pendingUserCount}
                      </span>
                    )}
                  </Button>
                </Link>

                <Link href="/admin/categories">
                  <Button
                    variant={
                      active === "admin-categories" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-2"
                  >
                    <FileText size={18} /> Kategori & Jurusan
                  </Button>
                </Link>

                <Link href="/admin/reports">
                  <Button
                    variant={active === "admin-reports" ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                  >
                    <MessageSquare size={18} /> Reports & Feedback
                  </Button>
                </Link>
                <Link href="/admin/activity-logs">
                  <Button
                    variant={
                      active === "admin-activity-logs" ? "secondary" : "ghost"
                    }
                    className="w-full justify-start gap-2"
                  >
                    <History size={18} /> Activity Logs
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-3 border-t">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full text-left">
                <p className="text-sm font-medium">{user.fullname}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-44 p-1 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setOpenReport(true)}
              >
                <MessageSquare size={16} /> Reports & Feedback
              </Button>

              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setOpenLogout(true)}
              >
                <LogOut size={16} /> Logout
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      <LogoutDialog open={openLogout} onOpenChange={setOpenLogout} />
      <ReportFeedbackDialog open={openReport} onOpenChange={setOpenReport} />
    </>
  );
}
