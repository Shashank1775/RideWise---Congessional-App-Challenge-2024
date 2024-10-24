import { useState } from "react";

const tabContent = {
    gps: {
        title: "GPS Tracking Device",
        subtitle: "The Hardware",
        description: "The GPS tracking device, equipped with a NEO6M GPS chip and an 800L SIM Card Slot, is installed on the school bus to provide real-time tracking. This device sends location updates to the server every 1 minute, ensuring accurate and timely monitoring of the bus's whereabouts. It is powered by a battery pack or charger and managed by an Arduino Uno or Nano, all housed in a protective 3D-printed case. This setup also includes an RF-ID scanner for additional functionality.",
        imageUrl: "/img5.png", // Add your image URL here
    },
    software: {
        title: "Software System",
        subtitle: "The Software",
        description: "Our software system receives and processes data from the GPS device and RF-ID scanner. The data is transferred to a backend server, which processes and stores it in MongoDB Atlas. This system provides real-time tracking and notifications to parents, allowing them to stay informed about their child's location and bus status. It also features a live update function using Websockets to ensure that the tracking information on the website is always current.",
        imageUrl: "/img3.png", // Add your image URL here
    },
    ai: {
        title: "Artificial Intelligence",
        subtitle: "The AI",
        description: "Our AI algorithms leverage the tracking data to enhance the system's functionality. They predict bus arrival times, optimize routes to improve efficiency, and contribute to the overall performance of the tracking system. By analyzing historical and real-time data, the AI helps in providing accurate arrival predictions and better route management. Morover, our AI features are capable of finding the best path given a set of stops to both maximize student safety but also effciency.",
        imageUrl: "/img4.png", // Add your image URL here
    },
};

export default function HowDoesItWorkOverall() {
    const [activeTab, setActiveTab] = useState('gps');

    return (
        <div className="flex flex-col items-center justify-center bg-gray-200 w-full mt-2">
            <div className="flex flex-col sm:flex-row gap-8 items-center w-full sm:w-4/5">
                {/* Text Content Section */}
                <div className="relative flex-1 bg-[#e8eddf] p-8 rounded-lg shadow-md border-4 border-[#2f4858]">
                    <div className="flex gap-6 mb-8">
                        {Object.keys(tabContent).map((key) => (
                            <button
                                key={key}
                                className={`px-6 py-3 text-base font-semibold rounded-lg ${activeTab === key ? 'bg-[#33658a] text-white' : 'bg-gray-200 text-gray-700'} transition-colors border-2 border-[#2f4858]`}
                                onClick={() => setActiveTab(key)}
                            >
                                {key.charAt(0).toUpperCase() + key.slice(1)}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-base text-gray-600 uppercase">{tabContent[activeTab].subtitle}</h2>
                        <h1 className={`text-3xl font-semibold ${activeTab ? 'text-[#f26419]' : 'text-[#f26419]'} transition-colors duration-300`}>{tabContent[activeTab].title}</h1>
                        <div className="overflow-hidden transition-all duration-500">
                            <p className="text-gray-600 text-lg">{tabContent[activeTab].description}</p>
                        </div>
                    </div>
                </div>
                
                {/* Image Section */}
                <div className="flex-1 bg-gray-300 rounded-lg shadow-md h-[45vh] border-4 border-[#2f4858]">
                    <div className="h-full flex items-center justify-center">
                        <img
                            src={tabContent[activeTab].imageUrl}
                            alt={tabContent[activeTab].title}
                            className="max-h-full max-w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
