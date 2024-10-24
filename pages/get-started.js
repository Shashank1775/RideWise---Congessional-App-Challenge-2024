import StanderdizedFooter from "@/components/footerSection/standerdizedFooter";
import LoginButtons from "@/components/getstarted/loginButtons";
import LandingPageNavbar from "@/components/landingPageNavbar/landingPageNavbar";
import SignUpParents from "@/components/signUpParents/signUpParents";

export default function GetStartedPage() {
    return (
        <div className="flex flex-col h-screen bg-[#f6bd60]">
            <LandingPageNavbar />
            <div className="flex-grow bg-[#f6bd60]">
                <div className="mt-4 h-[85vh] items-center justify-center flex">
                    <SignUpParents />
                </div>
                <div className="bg-[#f6bd60] items-center flex justify-center pt-8">
                    {/* Content can go here if needed */}
                </div>
            </div>
            <div className="bg-[#F5EAD6]">
                <StanderdizedFooter />
            </div>
        </div>
    );
}
