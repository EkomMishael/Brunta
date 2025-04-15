
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function CustomDropdown({
    name,
    values,
    selectedValue,
    handleValueChange,
    color = 'bg-blue-500',
    dependencies = [],
    toggleAddValue = null,
    deleteValue = null,
    fetchAvailableData, // Function to fetch available data
}) {
    const [isDropdownVisible, setDropdownVisibility] = useState(false);
    const [plusButton, setPlusButton] = useState(false);
    const dropdownRef = useRef(null);
    const [buttonVal,setButtonVal]=useState('')
    let buttonText = `Select ${name}`;
    let placeholderText = null;

    // Manage placeholder based on dependencies and selected values
    if (name === 'Subject' && !dependencies[0]) {
        placeholderText = 'Please select a level first';
    } else if (name === 'Year' && (!dependencies[0] || !dependencies[1])) {
        placeholderText = 'Please select a subject and level first';
    }else if (((name === 'Subject' || name === 'Year' || name==='a Level') && (values === null || values.length === 0))) {
        placeholderText = 'No data available';
    }


    const check=()=>{

        if (selectedValue.length > 0) {
            setButtonVal(selectedValue)
        } else {
            setButtonVal(buttonText);
        }
    
        if (name !== 'Level' && name !== 'yeara Level'  && !placeholderText) {
            setPlusButton(true);
        }else if(name !== 'Level' && name !== 'yeara Level' && placeholderText==='No data available'){
            setPlusButton(true)
        } else {
            setPlusButton(false);
        }
    }

    useEffect(() => {
        check()
    }, [check]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisibility(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleValueSelect = (val) => {
        handleValueChange(val);
        setDropdownVisibility(false);
    };

    const toggleDropdownVisibility = () => {
        setDropdownVisibility(!isDropdownVisible);
        console.log(values)
    };

    // Handle deleting a value
    const handleDeleteValue = async () => {
        if (deleteValue) {
            await deleteValue(); // Call the delete function
            // Refresh available data
            fetchAvailableData();
        }
    };

    return (
        <div className='flex flex-row items-start'>
            {plusButton && (
                <span onClick={toggleAddValue} className='py-2.5 rounded-lg text-slate-500 hover:text-blue-500 bg-transparent font-medium'>
                    <i className='fa-solid fa-plus add-subject-year'></i>
                </span>
            )}
            <div className='optionSelector' ref={dropdownRef}>
                <button
                    id='dropdownHoverButton'
                    className={`w-[168px]  text-white font-semibold hover:bg-blue-400 ${color} focus:ring-2 focus:outline-none focus:ring-blue-300  rounded-lg text-sm px-5 py-2.5 text-center inline-flex justify-around items-center shadow dark:shadow-gray-100`}
                    type='button'
                    onClick={toggleDropdownVisibility}
                >
                    {buttonVal}
                    <svg className={`w-2.5 h-2.5 ms-3 arrow-svg ${isDropdownVisible ? 'lookUp' : 'lookDown'}`}
                        aria-hidden='true' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 10 6'>
                        <path stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='m1 1 4 4 4-4'/>
                    </svg>
                </button>

                {isDropdownVisible && (
                    <div id='dropdownHover' className='z-10 bg-white dark:bg-gray-600 dark:shadow-gray-800 dark:shadow-lg divide-y divide-gray-100 rounded-lg shadow w-[168px]'>
                        <ul className='py-2 text-sm text-gray-700'>
                            {placeholderText ? (
                                <li>
                                    <span className='block px-4 py-2 text-red-400'>{placeholderText}</span>
                                </li>
                            ) : null}

                            {!placeholderText &&
                                values.map((val, index) => (
                                    <li key={index}>
                                        <Link
                                            className='block px-4  dark:shadow-md dark:shadow-gray-400 py-2 rounded dark:text-gray-200 dark:bg-gray-500 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-gray-500 '
                                            onClick={() => handleValueSelect(val)}
                                        >
                                            {val}
                                        </Link>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
            </div>
            
            { ((name !== 'Level' && name !=='a Level') && selectedValue) && ( <span onClick={handleDeleteValue} className='py-2.5 rounded-lg text-slate-500 hover:text-blue-500 bg-transparent font-medium mr-4'>
                <i className='fa-solid fa-minus add-subject-year'></i>
            </span>)}
        </div>
    );
}

export default CustomDropdown;
