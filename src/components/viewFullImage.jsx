import React, { useState, useRef } from 'react';


export default function ViewFullImage({ originalImage, setShowOGPic }) {
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const imageContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startCoords, setStartCoords] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);

    
    const handleCloseOGPic = () => setShowOGPic(false);

    const handleZoomIn = () => setZoom((prevZoom) => Math.min(prevZoom + 0.2, 3));
    const handleZoomOut = () => setZoom((prevZoom) => Math.max(prevZoom - 0.2, 0.5));

    const handleMouseDown = (event) => {
        setIsDragging(true);
        // Save the starting coordinates
        setStartCoords({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event) => {
        if (isDragging) {
            // Calculate the change in position
            const deltaX = (event.clientX - startCoords.x) / zoom;
            const deltaY = (event.clientY - startCoords.y) / zoom;

            // Update the offset
            setOffset((prevOffset) => ({
                x: prevOffset.x + deltaX,
                y: prevOffset.y + deltaY,
            }));

            // Update the starting coordinates
            setStartCoords({ x: event.clientX, y: event.clientY });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
            <div
                className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50 w-screen h-full"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div className="relative p-4 bg-white rounded-md shadow-lg">
                    <span class="flex justify-end mb-2">
                        <i className="fa fa-times text-gray-700 cursor-pointer" onClick={handleCloseOGPic}></i>
                    </span>
                    <div
                        ref={imageContainerRef}
                        className="flex items-center justify-center max-h-[70vh] overflow-hidden"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                    >
                        <div
                            className="relative"
                            style={{
                                transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`,
                                transformOrigin: 'center',
                            }}
                        >
                            <img
                                src={originalImage}
                                alt="Original"
                                className={` size-[70vh]`}
                            />
                        </div>
                    </div>
                    <div className="flex justify-center mt-4 space-x-2">
                        <button className="py-2 px-4 bg-blue-400 text-white rounded-md hover:bg-blue-500" onClick={handleZoomIn}>
                            Zoom In
                        </button>
                        <button className="py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500" onClick={handleZoomOut}>
                            Zoom Out
                        </button>
                    </div>
                </div>
            </div>
        
    );
}
