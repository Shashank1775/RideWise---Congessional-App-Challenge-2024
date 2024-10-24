import CongressionalAppChallengeVideo from "@/components/congressionalAppChallenge/congressionalAppChallengeVideo";
import FinalCallToAction from "@/components/finalCallToAction/finalCallToAction";
import StanderdizedFooter from "@/components/footerSection/standerdizedFooter";
import HowDoesItWorkOverall from "@/components/howDoesItWork/howDoesItWorkOverall";
import LandingPageHeader from "@/components/landingPage/landingPageHeader";
import LandingPageNavbar from "@/components/landingPageNavbar/landingPageNavbar";
import { Separator } from "@/components/ui/separator";
import WhyUsOverall from "@/components/whyUs/whyUsOverall";

export default function userLandingPage(){
    return(
        <div className="bg-[#f6bd60]">
        <LandingPageNavbar />           
        <div className="h-dvh bg-[#f6bd60]">
            <div className="mt-4 h-4/5">
                <LandingPageHeader />
            </div>
            <div className="flex items-center justify-center h-4/6 bg-gray-200 pt-8 pb-8 py-2">
                <div className="h-120vh w-full flex items-center justify-center">
                    <HowDoesItWorkOverall />
                </div>
            </div>

            <div className="flex flex items-center justify-center h-5/6 bg-[#f6bd60]">
                <div className="h-4/5 w-full flex items-center justify-center">
                    <WhyUsOverall />
                </div>
            </div>
            <div className="bg-">
                <CongressionalAppChallengeVideo />
            </div>
            <div className="bg-gray-200 items-center flex justify-center pt-8 h-4/5">
                <FinalCallToAction />
            </div>
            <div className="bg-gray-200 items-center flex justify-center pt-8">
                <StanderdizedFooter />
            </div>
        </div>
        </div>
    )
}