import { useState, useEffect, useRef } from 'react';
import profilePic from '../assets/default-pfp.jpg';
import { auth } from '../config';

import { Link, useNavigate, useLocation } from 'react-router-dom';

// NetworkStatusIndicator component
const NetworkStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className={`flex items-center mr-2 ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
      <i className={`fa-solid ${isOnline ? 'fa-wifi' : 'fa-wifi-slash'} text-sm`}></i>
      <span className="ml-1 text-xs hidden sm:inline">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
};

export default function NavBar({ userClone, realUser, setUser, toggleDarkMode, isDarkMode, children, setSearchBarData, searchBarValue, setShowSearch, showSearch }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [activePage, setActivePage] = useState('');
    const [dp, setDp] = useState(profilePic);
    const [fullNav, setFullNav] = useState(false);
    const [blockOrHidden, setBlockOrHidden] = useState(false);
    
    const buttonRef = useRef(null);
    
    const Quiz = <i className="fa-solid fa-list-check"></i> 
    const Stats = <i className="fa-solid pr-3 fa-chart-simple"></i> 
    const Setting = <i className="fa-solid pr-3 fa-gears"></i>
    const navIcons = `w-5 h-5 hover:text-gray-900 group-hover:text-gray-900 dark:group-hover:text-white`
    // Navigation links
    const navigationLinks = [
        { path: '/dashboard', name: 'Home', icon: 'home' },
        { path: '/quiz', name: 'Start Quiz', icon: 'list' },
        { path: '/quiz/vs-mode', name: 'Versus Mode', icon: 'user-friends' },
        // userClone.status && {path: '/dashboard/admin', name:'Admin Dashboard', icon:'tachometer-alt'},
        { path: '/user/statistics', name: 'Stats', icon: 'chart-bar' },
        // { path: '/user-progress', name: 'Progress', icon: 'cog' },
        { path: '/user/settings', name: 'Settings', icon: 'cog' },
        { path: '/events', name: 'Events', icon: 'calendar-alt' },
        { path: '/leaderboards', name: 'Leaderboards', icon: 'trophy' },
        { path: '/help', name: 'Help', icon: 'info' },
        { path: '/terms', name: 'Terms', icon: 'file-alt' },
        { path: '/privacy', name: 'Privacy Policy', icon: 'lock' },
    ];
      
    const userLinks = [
        { path: '/quiz', name: 'Start Quiz', icon: <i className="fas pr-3 fa-list"></i> },
        { path: '/user/statistics', name: 'Statistics', icon: <i className="fas pr-3 fa-chart-bar"></i> },
        { path: '/user/settings', name: 'Settings', icon: <i className="fas pr-3 fa-cog"></i> },
    ];
    // Dark mode state
    
    
    // Map paths to pages for setting the active page
    useEffect(() => {
        const currentPath = location.pathname;
        const activeLink = navigationLinks.find(link => link.path === currentPath);
        setActivePage(activeLink ? activeLink.name : '');
    }, [location.pathname, navigationLinks]);

    // Check profile picture
    useEffect(() => {
        if (userClone?.profilePic) {
            setDp(userClone.profilePic);
        } else {
            setDp(profilePic);
        }
    }, [userClone]);

    // Sign out function
    const signOut = async () => {
        
        try {
            await auth.signOut();
            localStorage.removeItem('color-theme')
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Toggle the main navigation menu on mobile
    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    // Toggle the user dropdown menu
    const toggleUserDropdown = () => {
        setIsUserDropdownOpen(prevState => !prevState);
    };
    // Function to close the mobile menu and user dropdown when clicking outside
    const closeMenu = (event) => {
        if (!buttonRef.current.contains(event.target)) {
            setIsMenuOpen(false);
            setIsUserDropdownOpen(false);
            setFullNav(false)
            setBlockOrHidden(false)
        }
    };

    // Add event listener on document load to close menus on outside click
    useEffect(() => {
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    // Define active and dormant class styles for navigation links
    const activeClass = "block py-2 px-3 text-white bg-blue-400 rounded lg:bg-transparent lg:text-blue-400 lg:p-0 lg:dark:text-blue-400";
    const dormantClass = "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 lg:hover:bg-transparent lg:hover:text-blue-400 lg:p-0 dark:text-white lg:dark:hover:text-blue-500 dark:hover:bg-gray-600 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700";

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 640) {
                setIsMenuOpen(false); // Set to false on larger screens
            }
        };
        //even listener for onResize 
        window.addEventListener('resize', handleResize);
      
        // Cleanup function to remove event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, [window.innerWidth]);

    const showFullNavView = () => {
        if(fullNav === false){
            setFullNav(true)
            setTimeout(() => {
                setBlockOrHidden(true)
            }, 200);
        }
        else if(fullNav === true){
            setFullNav(false)
            setBlockOrHidden(false)
        }
    }
    return (
        <>
        <span ref={buttonRef}>
        <nav className={`fixed top-0 z-50 w-full ${(isMenuOpen && (window.innerWidth < 640)) ? 'border-b border-gray-100 sm:border-none bg-white dark:bg-gray-800 dark:border-gray-700' : 'bg-transparent'}  `}>
        <div className="px-2 py-2 top-nav">
        <div className="flex items-center justify-between">
        <div className="flex items-center justify-start rtl:justify-end">
        <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" onClick={toggleMenu}>
            <span className="sr-only">Open sidebar</span>
            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
               <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
            </svg>
         </button>
        <Link to={'/dashboard'} className="flex ms-2 md:me-24">
          <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 me-3" alt="FlowBite Logo" />
          <span className={`self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ${ blockOrHidden ? 'sm:block' : 'sm:hidden' } xl:block`}>Brunta</span>
        </Link>
        </div>
        <div className="flex items-center">
          <div className="flex items-center ms-3">
          {(showSearch === false || showSearch === true) && <i onClick={()=>setShowSearch(!showSearch)} className={`fa-solid fa-magnifying-glass text-gray-500 mr-1`}></i>}
            
            <div className='flex flex-row'>
            <NetworkStatusIndicator />
            <button
                id="theme-toggle"
                type="button"
                className="p-2 rounded-full mr-1"
                onClick={toggleDarkMode}
            >
                {isDarkMode ? (
                    //---------------------------------------ligth svg---------------------------------------
                    <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
                    </svg>
                ) : (
                    //----------------------------------dark svg -------------------------------------------
                    <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                )}
            </button>
            <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user" onClick={toggleUserDropdown}>
                <span className="sr-only">Open user menu</span>
                <img className="w-9 rounded-full" src={dp} alt="DP"/>
            </button>
            </div>
            {isUserDropdownOpen && (
                        <div
                            className="absolute right-2 top-[50px] md:top-[46px] mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 dark:bg-gray-800 dark:border-gray-700"
                        >
                            <div className="p-2 text-sm text-gray-800 dark:text-white">
                                <div>{realUser?.displayName}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-300">{realUser?.email}</div>
                            </div>
                            <ul className="p-2 space-y-1 text-sm text-gray-800 dark:text-white">
                              {userLinks.map((link,index)=>
                                (<li key={index}>
                                    <Link to={link.path} className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                        <span className='flex flex-row items-center'>
                                            {link.icon}
                                            {link.name}
                                        </span>
                                    </Link>
                                </li>)
                              )}

                                {userClone?.status === 'admin' && (
                                    <li>
                                        <Link
                                            to="/dashboard/admin"
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        >
                                            Admin Page
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <button
                                        onClick={signOut}
                                        className="block px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full"
                                    >
                                        Sign out
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
            </div>
            
          </div>
        </div>


        </div>
        </nav>

        <aside
          className={`fixed top-0 left-0 z-40 ${
            fullNav ? 'sm:w-64' : 'sm:w-[67px]'
          } xl:w-64 w-64 h-screen pt-20 transition-width duration-300 ease-in-out  origin-left ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-gray-50 border-r border-gray-200 sm:translate-x-0 dark:bg-blue-800 dark:border-gray-700`}
          aria-label="Sidebar"
        >
                <div className="h-full px-3 pb-4 overflow-y-auto bg-gray-50 duration-300 ease-in-out transition dark:bg-blue-800  custom-scroll-bar">
                <button className={`xl:hidden hidden w-full pb-4 duration-300 ease-in-out sm:flex transition ${fullNav ? ' sm:justify-end pr-3' : 'sm:justify-center'} `}>
                    <i className={`fa-solid fa-caret-right text-gray-400 ${ fullNav ? 'rotate-180' : 'rotate-0' } `} onClick={showFullNavView}></i>
                </button>
        <ul className="space-y-2 font-medium mt-1 ">
        {navigationLinks.map((link,ind) => (
         <li key={ind} className='relative'>
            <Link to={link.path} className={` h-[40px] flex items-center p-[10px] hover:text-gray-900 group-hover:text-gray-900 dark:group-hover:text-white transition duration-300 ease-in-out xl:rounded-lg rounded-lg ${ !blockOrHidden && 'sm:rounded-full'}  dark:hover:bg-blue-600 group ${
                        activePage === link.name ? 'bg-blue-700 text-white' : 'text-gray-500 dark:text-gray-300'
                      }`}>
                        <span className='w-6 '>
                            <i className={`fas w-full flex justify-center items-center transition duration-300 ease-in-out ${navIcons} ${activePage === link.name ? ' text-white' : 'text-gray-500 dark:text-gray-300'} fa-${link.icon}`}></i>
                        </span>
                
               <span
          className={`pl-4 block ${
            fullNav ? 'sm:block' : 'sm:hidden'
          } xl:opacity-100 xl:block ${blockOrHidden ? 'delay-3000' : ''}`}
        >
            <span className={`${blockOrHidden ? 'sm:block' : 'sm:hidden'} block xl:block`}>

                {link.name}
            </span>
        </span>
            </Link>
         </li>))}
        </ul>
        </div>
        </aside>
        </span>
        <div className="custom-scroll-bar mt-[60px] md:mt-12 sm:ml-[62px] max-h-screen overflow-x-auto h-screen px-4 xl:ml-64">
           <div className="pb-14 ">
            {(showSearch === true) && (
                <span className={`w-[70vh] flex pl-4 z-50 ${showSearch ? ' ' : 'chill justify-between' } items-center justify-center pt-4 ] bg-transparent max-w-screen-xl mx-auto mb-6`}>
                                {/* Search bar */}
                                <input
                                    type="text"
                                    placeholder="Search subjects..."
                                    id="default-search"
                                    className={`p-2 px-6 z-50 searchBar ${showSearch ? 'showSearch fixed' : 'hidden' } text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                                    value={searchBarValue}
                                    onChange={(e) => setSearchBarData(e.target.value)}
                                />
                    </span>

            )}
                {children}
            </div>
        </div>
        </>
    );
}


