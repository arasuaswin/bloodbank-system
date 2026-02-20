import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-red-500">❤️</span> BloodBank
                        </h3>
                        <p className="text-sm leading-relaxed">
                            Connecting donors with those in need. Join our mission to save lives through voluntary blood donation.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-red-500 transition-colors">Home</Link></li>
                            <li><Link href="/register" className="hover:text-red-500 transition-colors">Donate Blood</Link></li>
                            <li><Link href="/search" className="hover:text-red-500 transition-colors">Find Blood</Link></li>
                            <li><Link href="/request" className="hover:text-red-500 transition-colors">Request Blood</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-red-500" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-red-500" />
                                <span>support@bloodbank.com</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span>123 Life Street, MedCity</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
                    <p>© {new Date().getFullYear()} BloodBank Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
