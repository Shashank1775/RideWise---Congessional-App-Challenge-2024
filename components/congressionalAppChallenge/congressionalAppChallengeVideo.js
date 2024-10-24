export default function CongressionalAppChallengeVideo() {
    return (
        <div className="p-8 bg-gray-800 w-full h-auto flex flex-col items-center justify-center">
            {/* Title */}
            <h1 className="mb-8 text-3xl font-bold text-[#e8eddf] px-4 py-2 rounded-lg shadow-md">
                Congressional App Challenge Submission
            </h1>

            {/* Video Container */}
            <div className="w-full md:w-3/4 lg:w-1/2 h-auto border-4 border-[#2f4858] rounded-lg overflow-hidden shadow-lg">
                {/* You can replace the src with your actual video link */}
                <video
                    controls
                    className="w-full h-auto"
                    poster="https://via.placeholder.com/800x450" // Optional poster image before video starts playing
                >
                    <source src="your-video-link.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}
