import LandingNavBar from "../components/landingNav"
import NavBar from "../components/NavBar"
import { termsOfService } from "../utils/privacyPolicyandTermsDATA"


export default function TermsPage({navBarData}){
    console.log(navBarData)

    return(
 navBarData.realUser !== null ? 
    (<NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser}  toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode}>

        <div className=" dark:bg-gray-800 bg-gray-200 py-5 px-6 rounded-md ">
        <div className=" mx-auto max-w-screen-xl p-6 pb-28 md:pb-28 bg-gray-100 dark:bg-gray-900 max-h-screen overflow-x-auto no-scroll-bar h-screen shadow-md grid grid-cols-1 gap-10">
            <h1 className="font-bold md:text-2xl text-2xl dark:text-blue-500">{termsOfService.title}</h1>
            <hr className="dark:text-gray-300 text-black"></hr>
        {termsOfService.sections.map((title)=>{
            return(
                <div>
                    <h1 className="font-semibold md:text-xl text-xl dark:text-blue-400 ">{title.title}</h1>
                    <p className="font-medium md:text-base text-sm dark:text-gray-300 text-gray-500">{title.content}</p>
                </div>
                    )
                })}
        </div>
        </div>
        </NavBar>) : (
        <>
        <LandingNavBar />
                <div className=" dark:bg-gray-800 bg-gray-200 py-5 px-6 rounded-md ">
                <div className=" mx-auto max-w-screen-xl p-6 pb-28 md:pb-28 bg-gray-100 dark:bg-gray-900 max-h-screen overflow-x-auto no-scroll-bar h-screen shadow-md grid grid-cols-1 gap-10">
                    <h1 className="font-bold md:text-2xl text-2xl dark:text-blue-500">{termsOfService.title}</h1>
                    <hr className="dark:text-gray-300 text-black"></hr>
                {termsOfService.sections.map((title)=>{
                    return(
                        <div>
                            <h1 className="font-semibold md:text-xl text-xl dark:text-blue-400 ">{title.title}</h1>
                            <p className="font-medium md:text-base text-sm dark:text-gray-300 text-gray-500">{title.content}</p>
                        </div>
                            )
                        })}
                </div>
                </div>
        </>)
    )
}

 