import { useState } from "react";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
  

export default function LoginButtons() {
    const [activeTab, setActiveTab] = useState("parent");

    return (
        <div className="w-full max-w-6xl mx-auto mt-10 p-8 bg-[#e8eddf] rounded-xl shadow-lg border-4 border-[#2f4858]">
            {/* Tabs */}
            <div className="flex justify-around mb-8">
                <button
                    onClick={() => setActiveTab("parent")}
                    className={`py-2 px-8 font-semibold transition-all duration-300 ease-in-out text-3xl ${
                        activeTab === "parent"
                            ? "text-[#33658a] border-b-4 border-[#33658a]"
                            : "text-[#2f4858] hover:text-[#33658a]"
                    }`}
                >
                    Parent
                </button>
                <button
                    onClick={() => setActiveTab("admin")}
                    className={`py-2 px-8 font-semibold transition-all duration-300 ease-in-out text-3xl ${
                        activeTab === "admin"
                            ? "text-[#33658a] border-b-4 border-[#33658a]"
                            : "text-[#2f4858] hover:text-[#33658a]"
                    }`}
                >
                    Admin
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex space-x-8">
                {/* Parent Form */}
                <div
                    className={`w-1/2 transition-all duration-500 transform p-2 ${
                        activeTab === "parent"
                            ? "opacity-100"
                            : "opacity-30 bg-[#f0f0f0] blur-sm"
                    }`}
                >
                    <h2 className="text-2xl font-bold mb-6 text-[#2f4858]">
                        Parent Login
                    </h2>
                    <form className="space-y-6">
                        <label className="block">
                            <span className="text-lg font-medium text-[#2f4858]">
                                Email or Phone Number
                            </span>
                            <input
                                type="text"
                                placeholder="Enter email or phone"
                                className="mt-2 block w-full p-3 bg-gray-100 text-[#2f4858] border-0 rounded-md focus:ring-2 focus:ring-blue-400 focus:bg-opacity-80"
                            />
                        </label>
                        <label className="block">
                            <span className="text-lg font-medium text-[#2f4858]">
                                Password
                            </span>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="mt-2 block w-full p-3 bg-gray-100 text-[#2f4858] border-0 rounded-md focus:ring-2 focus:ring-blue-400 focus:bg-opacity-80"
                            />
                        </label>

                        <button
                            type="submit"
                            className="w-full py-3 bg-[#2f4858] text-white font-semibold rounded-md hover:bg-[#33658a] transition-colors duration-300"
                        >
                            Submit
                        </button>
                    </form>
                </div>

                {/* Admin Form */}
                <div
                    className={`w-1/2 transition-all duration-500 transform p-2 ${
                        activeTab === "admin" ? "opacity-100" : "opacity-30 bg-[#f0f0f0] blur-sm"
                    }`}
                >
                    <h2 className="text-2xl font-bold mb-6 text-[#2f4858]">
                        Admin Login
                    </h2>
                    <form className="space-y-6">
                        <label className="block">
                            <span className="text-lg font-medium text-[#2f4858]">
                                Email
                            </span>
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="mt-2 mb-2 block w-full p-3 bg-gray-100 text-[#2f4858] border-0 rounded-md focus:ring-2 focus:ring-green-400 focus:bg-opacity-80"
                            />
                        </label>
                        <label className="block">
                            <span className="text-lg font-medium text-[#2f4858]">
                                Password
                            </span>
                            <input
                                type="password"
                                placeholder="Enter password"
                                className="mt-2 block w-full p-3 bg-gray-100 text-[#2f4858] border-0 rounded-md focus:ring-2 focus:ring-blue-400 focus:bg-opacity-80"
                            />
                        </label>
                        <button
                            type="submit"
                            className="w-full py-3 bg-[#2f4858] text-white font-semibold rounded-md hover:bg-[#33658a] transition-colors duration-300 mt-4"
                        >
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
