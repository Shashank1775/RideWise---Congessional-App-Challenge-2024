import { useState, useEffect } from "react";
import Link from "next/link";

const words = [
    "Safety",
    "Comfort",
    "Security",
    "Protection",
    "Guidance",
    "Connection",
    "Confidence",
];

export default function FinalCallToAction() {
    const [currentWord, setCurrentWord] = useState('');
    const [index, setIndex] = useState(0);
    const typeInterval = 105;
    const deleteInterval = 90;
    const waitInterval = 3000;

    useEffect(() => {
        let i = -1;
        setCurrentWord('');

        const timer = setInterval(() => {
            i++;
            if (i === words[index].length - 1) {
                clearInterval(timer);
                setTimeout(() => {
                    const deleteTimer = setInterval(() => {
                        i--;
                        if (i === -1) {
                            clearInterval(deleteTimer);
                            setIndex((prev) => (prev + 1) % words.length);
                        }
                        setCurrentWord((prev) => prev.slice(0, -1));
                    }, deleteInterval);
                }, waitInterval);
            }

            setCurrentWord((prev) => prev + words[index][i]);
        }, typeInterval);

        return () => clearInterval(timer);
    }, [index]);

    return (
    <div className="py-16 px-6 sm:px-12 ">
        <div className="flex flex-col items-center justify-center w-full h-auto mx-auto text-center space-y-6 rounded-lg shadow-xl p-8 sm:p-12 bg-[#e8eddf] border-4 border-[#2f4858]">
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-6 leading-tight text-[#33658a]">
                Ensure Your <b>Child&apos;s</b> <span className="text-[#f26419]">{currentWord}</span>
            </h1>
            <p className="text-base sm:text-xl text-[#2f4858] mb-4 sm:mb-6 mt-2">
                RideWise helps you track school buses and ensures your children&apos;'s safety with real-time tracking and notifications.
            </p>
            <div className="flex flex-col sm:flex-row sm:gap-4">
                <Link
                    href="/get-started"
                    className="bg-[#2f4858] text-white px-6 py-2 sm:px-8 sm:py-3 shadow-lg hover:bg-[#33658a] transition-all duration-300 text-sm sm:text-base font-semibold transform hover:scale-105 mb-4 sm:mb-0"
                >
                    Get Started
                </Link>
                <Link
                    href="/learn-more"
                    className="bg-[#2f4858] text-white px-6 py-2 sm:px-8 sm:py-3 shadow-lg hover:bg-[#33658a] transition-all duration-300 text-sm sm:text-base font-semibold transform hover:scale-105"
                >
                    Learn More
                </Link>
            </div>
            <p className="mt-4 text-[#2f4858] text-xs sm:text-sm">
                Providing safety and peace of mind for parents and schools.
            </p>
        </div>
    </div>
    );
}
