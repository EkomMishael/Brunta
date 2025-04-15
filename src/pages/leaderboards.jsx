import NavBar from "../components/NavBar";


export default function Leaderboards({navBarData}){
    return(
    <NavBar userClone={navBarData.user} realUser={navBarData.realUser} setUser={navBarData.setUser}  toggleDarkMode={navBarData.toggleDarkMode} isDarkMode={navBarData.isDarkMode}>
        <div className="profile-container custom-scroll-bar mt-[60px] md:mt-12 mx-auto max-w-screen-xl p-6 pb-28 md:pb-20 bg-gray-100 dark:bg-gray-900 max-h-screen overflow-x-auto no-scroll-bar h-screen shadow-md">
            <div className="flex items-center justify-center w-full h-[80%] ">
                <h1 className=" text-gray-600 dark:text-gray-400 text-5xl "> Coming Soon... </h1>
            </div>
        </div>
    </NavBar>
    )
}