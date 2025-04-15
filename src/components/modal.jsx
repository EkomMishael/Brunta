import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';//used to specify the type of props passed to a component almost like typescript 
import classNames from 'classnames';// for multiple or conditional rendering

function Modal({ isOpen, onClose, title, children }) {
    // State to manage animation state
    const [isAnimating, setIsAnimating] = useState(false);

    // Manage the animation state when the modal opens or closes
    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            // Delay setting isAnimating to false to allow for close animation
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 300); // The same duration as the CSS transition

            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleTransitionEnd = () => {
        if (!isOpen) {
            setIsAnimating(false);
        }
    };
    // Return null if the modal is not open and not animating
    if (!isOpen && !isAnimating) return null;

    return (
        
        <div
            className={classNames('fixed inset-0 z-50 flex items-center justify-center', {
                'bg-gray-700 bg-opacity-50 ': isOpen || isAnimating,
            })}
            
        >
            <div
                className={classNames('modal bg-white dark:bg-gray-800 rounded-md shadow-lg ', {
                    'modal-open': isOpen,
                    'modal-closed': !isOpen,
                })}
                
            >
                {/* Close button AND title*/}
                <div className='pl-6 pr-2 py-4 flex items-center border-b border-slate-400 justify-between'>
                    <h2 className="font-semibold text-xl dark:text-gray-300 break-words">{title}</h2>
                    <button
                        className="text-gray-600 text-2xl dark:text-gray-300 hover:text-gray-800 ml-4 "
                        onClick={onClose}
                    >
                        <span>&times;</span>
                    </button>
                </div>

                {/* Modal content */}
                <div className="p-9 bg-gray-50 dark:bg-gray-700 rounded-b-md max-h-[95vh] overflow-y-auto custom-scroll-bar">
                    {children}
                </div>
            </div>
        </div>
    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default Modal;
