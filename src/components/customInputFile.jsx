import React, { useRef } from 'react';

function ImageFileInput() {
    // Create a ref for the file input element
    const fileInputRef = useRef(null);

    // Function to trigger the file input when the custom button is clicked
    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="file-input-container">
            {/* Hidden file input with accept="image/*" */}
            <input
                type="file"
                accept="image/*" // Only allow image files
                ref={fileInputRef} // Attach the ref
                style={{ display: 'none' }} // Hide the file input
                onChange={(event) => {
                    const file = event.target.files[0];
                    // Handle the selected file (e.g., upload or display it)
                    console.log('Selected file:', file);
                }}
            />

            {/* Custom styled button that triggers the file input */}
            <button
                type="button"
                onClick={handleButtonClick}
                className="custom-button"
            >
                Choose Image
            </button>
        </div>
    );
}

export default ImageFileInput;
