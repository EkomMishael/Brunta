import React, { useState, useRef } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { storage } from '../config';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';

export default function TextEditor({ onSave }) {
    //---------------------------------------------states-------------------------------------------------
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [answerOptions, setAnswerOptions] = useState([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
    ]);
    const [image, setImage] = useState(null);

    // Create a reference for the file input
    const fileInputRef = useRef(null);

    const handleEditorChange = (newEditorState) => {
        setEditorState(newEditorState);
    };

    const handleAnswerChange = (index, value) => {
        const updatedOptions = [...answerOptions];
        updatedOptions[index].text = value;
        setAnswerOptions(updatedOptions);
    };

    const handleCheckboxChange = (index) => {
        const updatedOptions = [...answerOptions];
        updatedOptions.forEach((option, i) => {
            if (i === index) {
                option.isCorrect = !option.isCorrect;
            } else {
                option.isCorrect = false;
            }
        });
        setAnswerOptions(updatedOptions);
    };

    const handleSubmit = async () => {
        const questionContent = editorState.getCurrentContent().getPlainText().trim();
        if (!questionContent) {
            console.error('Question cannot be empty');
            return;
        }

        const filledOptions = answerOptions.filter(option => option.text.trim() !== '');
        if (filledOptions.length !== 4) {
            console.error('Please fill all four answer options');
            return;
        }

        const correctAnswer = answerOptions.find(option => option.isCorrect);

        let imageUrl = '';
        if (image) {
            const storageRef = ref(storage, `images/${image.name}`);
            try {
                await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error('Error uploading image:', error);
                return;
            }
        }

        onSave({
            id: Date.now(),
            question: questionContent,
            answers: answerOptions.map(option => ({ text: option.text, isCorrect: option === correctAnswer })),
            correctAnswer,
            imageUrl
        });

        setEditorState(EditorState.createEmpty());
        setAnswerOptions([
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]);
        setImage(null);
    };

    const handleCustomButtonClick = () => {
        // Trigger the file input click event when the custom button is clicked
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="bg-slate-100 dark:bg-gray-800 rounded-md m-4">
            <Editor
                editorState={editorState}
                onEditorStateChange={handleEditorChange}
                toolbar={{
                    options: ['image'],
                }}
            />
            <div className="flex flex-row flex-wrap justify-evenly mt-4">
                {answerOptions.map((answer, index) => (
                    <div key={index} className="flex flex-col mb-6">
                        <input
                            className="border-slate-300 rounded-md w-72"
                            name="answers"
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            value={answer.text}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                        />
                        <span className="flex justify-between items-center">
                            <label htmlFor={`isCorrect${index}`} className="text-slate-400">Correct Answer</label>
                            <input
                                id={`isCorrect${index}`}
                                type="checkbox"
                                checked={answer.isCorrect}
                                onChange={() => handleCheckboxChange(index)}
                                className="rounded-full border-slate-300"
                            />
                        </span>
                    </div>
                ))}
            </div>
            <div className="flex justify-between ml-2 mr-2">
                {/* Hidden file input for images */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef} // Attach the ref
                    style={{ display: 'none' }} // Hide the file input
                    onChange={(e) => setImage(e.target.files[0])}
                />

                {/* Custom button to trigger file input */}
                <button
                    type="button"
                    onClick={handleCustomButtonClick}
                    className="rounded-md choose-file bg-gray-300 hover:bg-gray-400 px-4 py-2"
                >
                    Choose Image
                </button>

                <button
                    onClick={handleSubmit}
                    className="bg-blue-400 text-white px-4 py-1 rounded text-sm"
                >
                    Add Question
                </button>
            </div>
        </div>
    );
}
