"use client";
"use client";
import React from 'react';
import { Link } from '@/i18n/routing';
import { AdaptiveIcon } from '@/shared/atoms/AdaptiveIcon';
import { MoveRight, ShieldCheck, Zap } from 'lucide-react';

/**
 * Hero Organism
 * 
 * The main high-impact section of the homepage.
 * Features:
 * - Stunning gradient background
 * - Micro-animations on interactive elements
 * - Clear, bold value proposition
 */
export const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
                <div className="absolute top-20 left-0 w-72 h-72 bg-blue-400 rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-0 w-72 h-72 bg-cyan-400 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    <AdaptiveIcon lucide={Zap} size={16} />
                    <span>Seamless Swiss Relocation Expert</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6 p-1">
                    Your Next Chapter in <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                        Switzerland Simplified.
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
                    We take the complexity out of moving. From documentation to settling in, 
                    SwissMove ensures your relocation is smooth, safe, and professional.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link 
                        href="/quote" 
                        className="group flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transform transition-all active:scale-95"
                    >
                        <span>Start Your Move</span>
                        <AdaptiveIcon lucide={MoveRight} size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link 
                        href="/about" 
                        className="px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        View Services
                    </Link>
                </div>

                {/* Trust Badges */}
                <div className="mt-20 flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 font-semibold">
                        <AdaptiveIcon lucide={ShieldCheck} size={24} />
                        <span>Trusted by 500+ Families</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

// export default Hero;
