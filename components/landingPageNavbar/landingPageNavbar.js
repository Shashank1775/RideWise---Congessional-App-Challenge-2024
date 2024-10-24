import Link from "next/link";

export default function LandingPageNavbar() {
    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-gray-800 text-white">
            <Link href='/'>
                <h1 className="text-2xl font-bold">
                    Ridewise
                </h1>
            </Link>
            <ul className="flex gap-6 text-lg">
                <li>
                    <Link href="/learn-more" className="hover:text-[#f6ae2d] transition-colors duration-300">
                        Learn More
                    </Link>
                </li>
                <li>
                    <Link href="/get-started" className="hover:text-[#f6ae2d] transition-colors duration-300">
                        Get Started
                    </Link>
                </li>
            </ul>
        </nav>
    );
}
