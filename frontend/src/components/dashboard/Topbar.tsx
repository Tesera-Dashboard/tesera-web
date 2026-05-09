"use client";

import { useEffect, useState } from "react";
import { Bell, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { logout, getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TopbarProps {
  pageTitle?: string;
}

export function Topbar({ pageTitle }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser().then(data => {
      if (data) {
        if (!data.is_verified) {
          router.push("/pending-verification");
          return;
        }
        setUser(data);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const initials = user?.full_name 
    ? user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() 
    : "U";

  return (
    <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-6 gap-4">
      {/* Title */}
      <h1 className="text-base font-semibold mr-auto">{pageTitle ?? "Dashboard"}</h1>

      {/* Search */}
      <div className="relative hidden md:block w-56">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-9 h-8 text-sm bg-muted/50 border-0 focus-visible:ring-1"
        />
      </div>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
      </Button>

      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      {/* User menu */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar className="h-8 w-8 cursor-pointer" aria-label="User menu">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="end">
          <div className="px-2 py-1.5 text-sm">
            <div className="font-medium">{user?.full_name || "Loading..."}</div>
            <div className="text-xs text-muted-foreground">{user?.email || ""}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive cursor-pointer"
            onClick={handleLogout}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
