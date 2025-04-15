import React, { useState } from 'react';
import '../assets/ToolPit.css'; 
import PropTypes from 'prop-types';

function Tooltip({ children, content, position = 'top',title = null,width = 20 ,zInd=20}) {
    const [isVisible, setIsVisible] = useState(false);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    return (
        <div className={`tooltip-wrapper `} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
            {/* The element that the tooltip is attached to */}
            {children}

            {/* The tooltip itself */}
            {isVisible && (
                <div className={`tooltip ${position} tooltip-show `} style={{width : `${width}px`, zIndex:`${zInd}`}}>
                    {title && <div className="tooltip-title">
                        {title}
                    </div>}
                    {content}
                </div>
            )}
        </div>
    );
}
Tooltip.propTypes={
    children : PropTypes.node.isRequired,
    width : PropTypes.number,
    title : PropTypes.node,
    content : PropTypes.node.isRequired,
}


export default Tooltip;
