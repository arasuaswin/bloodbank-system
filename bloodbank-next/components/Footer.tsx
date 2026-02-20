import Link from "next/link"
import { Mail, Phone, MapPin, Shield } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4 md:col-span-2">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-red-500">❤️</span> BloodBank India
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Connecting voluntary blood donors with patients in need across India.
                            Built in alignment with NBTC (National Blood Transfusion Council) and
                            ICMR blood donation guidelines.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 text-xs px-3 py-1 rounded-full text-gray-300">
                                <Shield className="w-3 h-3 text-green-400" /> NBTC Compliant
                            </span>
                            <span className="inline-flex items-center gap-1 bg-gray-800 border border-gray-700 text-xs px-3 py-1 rounded-full text-gray-300">
                                🇮🇳 Made for India
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-red-400 transition-colors">Home</Link></li>
                            <li><Link href="/eligibility" className="hover:text-red-400 transition-colors">Check Eligibility</Link></li>
                            <li><Link href="/register" className="hover:text-red-400 transition-colors">Become a Donor</Link></li>
                            <li><Link href="/search" className="hover:text-red-400 transition-colors">Find Blood</Link></li>
                            <li><Link href="/request" className="hover:text-red-400 transition-colors">Request Blood</Link></li>
                        </ul>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Emergency Helplines</h4>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <a href="tel:104" className="text-white font-bold hover:text-red-400">104</a>
                                    <span className="text-gray-500 text-xs block">NBTC Toll-Free, 24x7</span>
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <Phone className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <div>
                                    <a href="tel:18001801104" className="text-white font-bold hover:text-red-400 text-xs">1800-180-1104</a>
                                    <span className="text-gray-500 text-xs block">National Blood Helpline</span>
                                </div>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-red-500 shrink-0" />
                                <span className="text-xs">support@bloodbank.in</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                <span className="text-xs">Blood Bank, Tamil Nadu, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} BloodBank India Management System. All rights reserved.</p>
                    <p className="text-center sm:text-right">
                        Governed by Drugs & Cosmetics Act, 1940 (Schedule F) &nbsp;|&nbsp;
                        <span className="text-gray-400">Ministry of Health & Family Welfare, Govt. of India</span>
                    </p>
                </div>
            </div>
        </footer>
    )
}
