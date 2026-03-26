"use client";
import React from 'react';
import { Link } from '@/i18n/routing';
import { AdaptiveIcon } from '@/website/atoms/AdaptiveIcon';
import { Globe, Mail, MessageSquare, Briefcase, Rocket } from 'lucide-react';

/**
 * Footer Organism
 * 
 * A comprehensive, modern footer.
 * Features:
 * - Multi-column information layout
 * - Social media integration
 * - Trust-building copyright and legal links
 */
export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const sections = [
        {
            title: 'Services',
            links: [
                { name: 'Relocation Planning', href: '/services/planning' },
                { name: 'Document Handling', href: '/services/documents' },
                { name: 'Home Search', href: '/services/homes' },
            ]
        },
        {
            title: 'Company',
            links: [
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Careers', href: '/careers' },
            ]
        },
        {
            title: 'Legal',
            links: [
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
            ]
        }
    ];

    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="p-2 bg-blue-600 rounded-xl">
                                <AdaptiveIcon lucide={Rocket} size={24} color="white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">
                                Swiss<span className="text-blue-600">Move</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 max-w-sm leading-relaxed">
                            Premium relocation services for professionals moving to Switzerland. 
                            We handle the complexity so you can focus on your new beginning.
                        </p>
                        <div className="flex gap-4">
                            {[Globe, Mail, MessageSquare, Briefcase].map((Icon, idx) => (
                                <a key={idx} href="#" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                    <AdaptiveIcon lucide={Icon} size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Sections */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <h4 className="font-bold text-gray-900 mb-6">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map(link => (
                                    <li key={link.name}>
                                        <Link href={link.href} className="text-gray-500 hover:text-blue-600 transition-colors">
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
                    <p>© {currentYear} SwissMove Global Services AG. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

// export default Footer;
