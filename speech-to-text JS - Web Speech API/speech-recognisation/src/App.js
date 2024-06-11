import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const App = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const infoRef = useRef();

  const recognition = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onstart = () => {
        setIsListening(true);
        infoRef.current.textContent = 'Voice activated, SPEAK';
      };

      recognition.current.onend = () => {
        setIsListening(false);
        infoRef.current.textContent = 'Speech recognition service disconnected';
      };

      recognition.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setPartialTranscript(interimTranscript);
        if (finalTranscript) {
          handleResult(finalTranscript.trim());
        }
      };
    } else {
      infoRef.current.textContent = 'Your Browser does not support Speech Recognition';
    }
  }, []);

  const handleMicClick = () => {
    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
  };

  const handleResult = (finalTranscript) => {
    if (finalTranscript.toLowerCase() === 'stop recording') {
      recognition.current.stop();
    } else if (finalTranscript.toLowerCase() === 'reset input') {
      setTranscript('');
    } else if (finalTranscript.toLowerCase() === 'go') {
      handleSubmit();
    } else {
      setTranscript((prev) => prev + ' ' + finalTranscript);
    }
  };

  const handleSubmit = async () => {
    console.log('Form submitted with transcript:', transcript);

    try {
      const postResponse = await fetch('http://127.0.0.1:5000/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      if (!postResponse.ok) {
        const errorResponse = await postResponse.json();
        throw new Error(errorResponse.error || 'Network response for POST was not ok');
      }

      const postData = await postResponse.json();
      console.log('Response from backend (POST):', postData);

    } catch (error) {
      console.error('Error:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <form id="search-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Speak to search..."
            value={partialTranscript || transcript}
            onChange={(e) => setTranscript(e.target.value)}
            style={{ paddingRight: '50px' }}
          />
          <button type="button" onClick={handleMicClick}>
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </form>
        <div className="info" ref={infoRef}></div>
        <p className="info">Voice Commands: "stop recording", "reset input", "go"</p>
        <button type="button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default App;
