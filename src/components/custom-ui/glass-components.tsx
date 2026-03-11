"use client";

import { ReactNode, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface GlassHeaderProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function GlassHeader({ children, className }: GlassHeaderProps) {
  return (
    <header className={cn("sticky top-0 z-50 glass border-b", className)}>
      {children}
    </header>
  );
}

interface GlassSidebarProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

export function GlassSidebar({ children, className }: GlassSidebarProps) {
  return <aside className={cn("glass border-r", className)}>{children}</aside>;
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "destructive" | "outline";
}

export function GlassButton({
  children,
  variant = "default",
  className,
  ...props
}: GlassButtonProps) {
  const variants = {
    default:
      "bg-[oklch(68%_0.22_260_/_0.8)] hover:bg-[oklch(60%_0.22_260_/_0.9)] text-white",
    destructive:
      "bg-[oklch(62%_0.24_25_/_0.8)] hover:bg-[oklch(58%_0.24_25_/_0.9)] text-white",
    outline:
      "bg-[oklch(98%_0.01_240_/_0.4)] hover:bg-[oklch(96%_0.03_200_/_0.6)] border border-white/20",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
        "backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
