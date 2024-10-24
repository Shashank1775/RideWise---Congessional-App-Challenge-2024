import { useState } from "react";

const researchStudies = [
    {
        title: "Innovative AI Techniques: Redefining App Intelligence",
        description: "This comprehensive study delves into the most advanced artificial intelligence techniques that have been integrated into the app...",
        image: "https://via.placeholder.com/150" // Replace with your image URL
    },
    {
        title: "User Behavior Analysis: A Data-Driven Approach to Engagement",
        description: "This research focuses on understanding how users interact with the app at scale...",
        image: "https://via.placeholder.com/150" // Replace with your image URL
    },
    {
        title: "Performance Optimization: Enhancing Efficiency at Scale",
        description: "Through this detailed exploration of performance bottlenecks...",
        image: "https://via.placeholder.com/150" // Replace with your image URL
    },
    {
        title: "Future Trends in Development: Anticipating the Next Big Innovations",
        description: "Focusing on the future of mobile and web development, this study identifies several trends...",
        image: "https://via.placeholder.com/150" // Replace with your image URL
    },
];

export default function ResearchSection() {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    return (
        <div className="p-8 bg-[#f6bd60] w-full h-full flex flex-col items-center">
            {/* Styled Title */}
            <div className="bg-[#e8eddf] rounded-full p-3 shadow-md w-full max-w-xl text-center mb-8 border-4 border-[#2f4858]">
                <h1 className="text-5xl font-extrabold text-[#2f4858] tracking-wide">
                    Why Us?
                </h1>
            </div>
            {/* Vertically Stacked Cards */}
            <div className="w-5/6 flex flex-col space-y-6">
                {researchStudies.map((study, index) => (
                    <div
                        key={index}
                        className={`bg-[#e8eddf] border-4 border-[#2f4858] p-4 flex flex-col items-start shadow-lg rounded-lg transform transition-all duration-300 ease-in-out overflow-hidden ${
                            hoveredIndex === index ? "h-48" : "h-20"
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* SVG and Title (always visible) */}
                        <div className="flex items-center justify-center space-x-4">
                            {/* Placeholder for SVG */}
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center transform transition-transform duration-300 ease-in-out">
                                {
                                    hoveredIndex === index ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#2f4858]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
                                    </svg>
                                    ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#2f4858]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
                                    </svg>
                                    )
                                }
                            </div>

                            <h2
                                className={`text-xl font-bold ${
                                    hoveredIndex === index
                                        ? "text-orange-500"
                                        : "text-[#2f4858]"
                                } transition-colors duration-300`}
                            >
                                {study.title}
                            </h2>
                        </div>

                        {/* Expanded Content (Image and Description) */}
                        {hoveredIndex === index && (
                            <div className="mt-4 flex">
                                {/* Image */}
                                <div className="w-24 h-24 mr-4">
                                    <img
                                        src={study.image}
                                        alt={study.title}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-600">
                                    {study.description}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
