import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, FileText, Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/jobs", label: "Jobs" },
    { href: "/submit-cv", label: "Submit CV" },
    { href: "/post-job", label: "For Employers" },
  ];

  const isActive = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="TechCorner" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (user?.role === "recruiter" || user?.role === "admin") && (
              <Link
                href="/recruiter"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith("/recruiter") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Recruiter Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    {user?.name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/my-profile" className="flex items-center gap-2 cursor-pointer">
                      <FileText className="h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  {(user?.role === "recruiter" || user?.role === "admin") && (
                    <DropdownMenuItem asChild>
                      <Link href="/recruiter" className="flex items-center gap-2 cursor-pointer">
                        <Briefcase className="h-4 w-4" />
                        Recruiter Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <a href={getLoginUrl()}>Login</a>
                </Button>
                <Button size="sm" className="bg-[oklch(0.70_0.18_25)] hover:bg-[oklch(0.65_0.18_25)]" asChild>
                  <a href={getLoginUrl()}>Sign Up</a>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (user?.role === "recruiter" || user?.role === "admin") && (
                <Link
                  href="/recruiter"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    location.startsWith("/recruiter")
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Recruiter Dashboard
                </Link>
              )}
              <div className="pt-2 mt-2 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/my-profile"
                      className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 px-3">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={getLoginUrl()}>Login</a>
                    </Button>
                    <Button size="sm" className="flex-1 bg-[oklch(0.70_0.18_25)]" asChild>
                      <a href={getLoginUrl()}>Sign Up</a>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
