import StanderdizedFooter from "@/components/footerSection/standerdizedFooter";
import LandingPageNavbar from "@/components/landingPageNavbar/landingPageNavbar";
import CreateAccountDistrict from "@/components/createAccountDistrict/createAccountDistrict";

export default function DistrictMainAccountCreation() {
    return (
        <div className="flex flex-col h-screen bg-[#f6bd60]">
            <LandingPageNavbar />
            <div className="flex-grow bg-[#f6bd60] items-center justify-center flex">
                <div className="mt-4 h-[95vh] w-[90vh] items-center justify-center flex">
                    <CreateAccountDistrict />
                </div>
            </div>
            <div className="bg-[#f6bd60]">
                <StanderdizedFooter />
            </div>
        </div>
    );
}