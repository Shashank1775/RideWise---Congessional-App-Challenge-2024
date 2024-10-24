import StanderdizedFooter from "@/components/footerSection/standerdizedFooter";
import LandingPageNavbar from "@/components/landingPageNavbar/landingPageNavbar";
import CreateAccountParents from "@/components/createAccountParents/createAccountParents";

export default function GetStartedPage() {
    return (
        <div className="flex flex-col h-screen bg-[#f6bd60]">
            <LandingPageNavbar />
            <div className="flex-grow bg-[#f6bd60] items-center justify-center flex">
                <div className="mt-4 h-[95vh] w-[90vh] items-center justify-center flex">
                    <CreateAccountParents />
                </div>
            </div>
            <div className="bg-[#f6bd60]">
                <StanderdizedFooter />
            </div>
        </div>
    );
}
