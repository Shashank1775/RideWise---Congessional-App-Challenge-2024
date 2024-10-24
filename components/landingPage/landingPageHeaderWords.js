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


export default function HeadlineWords() {
    const [currentWord, setCurrentWord] = useState('');
    const [index, setIndex] = useState(0);
    const typingSpeed = 105;
    const deletingSpeed = 90;
    const pauseDuration = 3000;

    useEffect(() => {
        let charIndex = -1;
        setCurrentWord('');

        const typingEffect = setInterval(() => {
            charIndex++;
            if (charIndex === words[index].length - 1) {
                clearInterval(typingEffect);
                setTimeout(() => {
                    const deletingEffect = setInterval(() => {
                        charIndex--;
                        if (charIndex === -1) {
                            clearInterval(deletingEffect);
                            setIndex((prevIndex) => (prevIndex + 1) % words.length);
                        }
                        setCurrentWord((prevWord) => prevWord.slice(0, -1));
                    }, deletingSpeed);
                }, pauseDuration);
            }

            setCurrentWord((prevWord) => prevWord + words[index][charIndex]);
        }, typingSpeed);

        return () => clearInterval(typingEffect);
    }, [index]);

    return (
        <div className="flex flex-col justify-center w-full h-full p-6 sm:p-12 bg-[#e8eddf] h-[50vh]">
            <span className="w-[60vh] h-[13vh]">
                <h1 className="text-4xl sm:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-[#33658a]">
                    Ensure Your <b>Child&apos;s</b> <span className="text-[#f26419]">{currentWord}</span>
                </h1>
            </span>
            <p className="text-lg sm:text-2xl text-[#2f4858] mb-4 sm:mb-6 mt-2">
                RideWise helps you track school buses and ensures your children&apos;s safety with real-time tracking and notifications.
            </p>
            <div className="flex flex-col sm:flex-row sm:gap-4">
                <Link
                    href="/get-started"
                    className="bg-[#2f4858] text-white px-6 py-2 sm:px-8 sm:py-3 shadow-lg hover:bg-[#33658a] transition-all duration-300 text-base sm:text-lg font-semibold transform hover:scale-105 mb-4 sm:mb-0"
                >
                    Get Started
                </Link>
                <Link
                    href="/learn-more"
                    className="bg-[#2f4858] text-white px-6 py-2 sm:px-8 sm:py-3 shadow-lg hover:bg-[#33658a] transition-all duration-300 text-base sm:text-lg font-semibold transform hover:scale-105"
                >
                    Learn More
                </Link>
            </div>
            <p className="mt-4 text-[#2f4858] text-sm sm:text-base">
                Providing safety and peace of mind for parents and schools.
            </p>
        </div>
    );
}
