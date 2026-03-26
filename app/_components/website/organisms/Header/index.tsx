"use client";
import React, { useState, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { AdaptiveIcon } from '@/shared/atoms/AdaptiveIcon';
import { Menu, X, Rocket, User } from 'lucide-react';

/**
 * Header Organism
 * 
 * A premium, glassmorphic navigation bar.
 * Features:
 * - Dynamic scroll behavior (transparency to blur)
 * - Responsive mobile menu
 * - Adaptive authentication state links
 */
export const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Services', href: '/services' },
        { name: 'About', href: '/about' },
        { name: 'Quote', href: '/quote' },
    ];

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            isScrolled 
                ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' 
                : 'bg-transparent py-5'
        }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-blue-600 rounded-xl group-hover:rotate-12 transition-transform">
                        <AdaptiveIcon lucide={Rocket} size={24} color="white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Swiss<span className="text-blue-600">Move</span>
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-4 w-px bg-gray-200" />
                    <Link 
                        href="/login" 
                        className="text-sm font-medium text-gray-600 hover:text-blue-600 px-4 py-2"
                    >
                        Sign In
                    </Link>
                    <Link 
                        href="/get-started" 
                        className="bg-blue-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden p-2 text-gray-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <AdaptiveIcon lucide={isMobileMenuOpen ? X : Menu} size={24} />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full w-full bg-white border-b border-gray-100 p-6 space-y-4 animate-in slide-in-from-top duration-300">
                    {navLinks.map(link => (
                        <Link 
                            key={link.name} 
                            href={link.href}
                            className="block text-lg font-medium text-gray-700"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="pt-4 flex flex-col gap-3">
                        <Link href="/login" className="text-center py-3 border border-gray-200 rounded-xl">Sign In</Link>
                        <Link href="/get-started" className="text-center py-3 bg-blue-600 text-white rounded-xl">Get Started</Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

// export default Header; (Removed for named export consistency)
