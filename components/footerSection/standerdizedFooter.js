import Link from "next/link";

export default function StandardizedFooter() {
    return (
        <footer className="bg-gray-800 text-white py-8 w-full ">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Section with Multiple Links */}
                <div className="flex flex-col md:flex-row justify-between mb-8">
                    {/* Company Info */}
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-xl font-semibold mb-3">RideWise</h2>
                        <p className="text-sm">
                            Empowering parents and schools with real-time bus tracking and safety features.
                        </p>
                    </div>
                    {/* Links */}
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Company</h3>
                            <ul className="text-sm space-y-2">
                                <li>
                                    <Link href="/get-started" className="hover:underline">
                                        Get Started
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/learn-more" className="hover:underline">
                                        Learn More
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Resources</h3>
                            <ul className="text-sm space-y-2">
                                <li>
                                    <Link href="/help-center" className="hover:underline">
                                        Help Center
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/guides" className="hover:underline">
                                        Guides
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faqs" className="hover:underline">
                                        FAQs
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Support</h3>
                            <ul className="text-sm space-y-2">
                                <li>
                                    <Link href="/privacy" className="hover:underline">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="hover:underline">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/support" className="hover:underline">
                                        Support Center
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                            <ul className="text-sm space-y-2">
                                <li>
                                    <Link href="https://facebook.com" className="hover:underline" target="_blank" rel="noreferrer">
                                        Facebook
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://twitter.com" className="hover:underline" target="_blank" rel="noreferrer">
                                        Twitter
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://linkedin.com" className="hover:underline" target="_blank" rel="noreferrer">
                                        LinkedIn
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://instagram.com" className="hover:underline" target="_blank" rel="noreferrer">
                                        Instagram
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                {/* Bottom Section */}
                <div className="border-t border-gray-700 pt-6">
                    <div className="flex justify-between items-center">
                        <p className="text-sm">© {new Date().getFullYear()} RideWise. All rights reserved.</p>
                        <div className="text-sm">
                            <Link href="/privacy" className="hover:underline mx-2">
                                Privacy Policy
                            </Link>
                            |
                            <Link href="/terms" className="hover:underline mx-2">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
