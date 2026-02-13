'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, User as UserIcon, LogOut, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Book Now', href: '/book' },
    { name: 'About Us', href: '/about' },
    { name: 'Picture Gallery', href: '/gallery' },
    { name: 'Join Our Driving Team', href: '/driver-application' },
    ...(user?.isAdmin ? [{ name: 'Admin', href: '/admin' }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white dark:bg-gray-900 shadow-2xl border-b border-gray-200/20 dark:border-gray-700/20' 
          : 'bg-white dark:bg-gray-900'
      }`}
    >
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.jpeg"
                  alt="King Taxi Logo"
                  width={160}
                  height={80}
                  className="rounded-lg"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-2">
                {navItems.map((item, index) => (
                  <div key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative group hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {item.name}
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Auth Buttons and Theme Toggle */}
            <div className="hidden md:flex items-center space-x-3">
              <ThemeToggle />
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback className="text-xs">
                          {(user?.identifier?.[0] || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[180px] truncate">
                        {user?.identifier || (user?.isAdmin ? 'Admin' : 'Account')}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      <span className="truncate">{user?.isAdmin ? 'Admin Account' : 'Account'}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/bookings" className="cursor-pointer">
                        <History className="h-4 w-4 mr-2" />
                        Booking History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    asChild
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold"
                  >
                    <Link href="/signin">
                      Sign In
                    </Link>
                  </Button>
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Link href="/signup">
                      Sign Up
                    </Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Button key={item.name} variant="ghost" asChild className="justify-start">
                        <Link href={item.href} onClick={() => setIsOpen(false)}>
                          {item.name}
                        </Link>
                      </Button>
                    ))}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-center pb-2">
                        <ThemeToggle />
                      </div>
                      {isAuthenticated ? (
                        <>
                          <Button variant="ghost" asChild className="w-full justify-start">
                            <Link href="/account" onClick={() => setIsOpen(false)}>
                              Account
                            </Link>
                          </Button>
                          <Button variant="ghost" asChild className="w-full justify-start">
                            <Link href="/bookings" onClick={() => setIsOpen(false)}>
                              Booking History
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              logout();
                              setIsOpen(false);
                            }}
                          >
                            Logout
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" asChild className="w-full justify-start">
                            <Link href="/signin" onClick={() => setIsOpen(false)}>
                              Sign In
                            </Link>
                          </Button>
                          <Button asChild className="w-full">
                            <Link href="/signup" onClick={() => setIsOpen(false)}>
                              Sign Up
                            </Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
