import LandingPageHeaderWords from "./landingPageHeaderWords";

export default function LandingPageHeader(){
    return (
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 p-4 lg:p-8 items-center">
            <div className="flex-1 lg:w-2/5 flex items-center justify-center lg:justify-start bg-[#f6ae2d] border-4 border-[#2f4858] rounded-lg shadow-xl ">
                <LandingPageHeaderWords />
            </div>

            <div className="flex-shrink-0 w-full lg:w-3/5">
                <img
                    src="/img1.png"
                    alt="Dummy Image"
                    className="w-full h-auto object-cover rounded-lg border-4 border-[#2f4858] shadow-xl"
                />
            </div>
        </div>
    );
}
