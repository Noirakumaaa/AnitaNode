import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import OpenAI from 'openai';

const Chatbot = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [assistantName] = useState('Anita: Personal Assistance');
  const [loading, setLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const openai = new OpenAI({
    apiKey: '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',
    dangerouslyAllowBrowser: true,
  });

  useEffect(() => {
    setLiveTranscript(transcript);
    console.log('Live Transcript:', transcript);
  }, [transcript]);

  const makeOpenAIRequest = async (userInput) => {
    try {
      const systemMessage = 'You are Anita. A teacher that teaches coding';

      const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userInput },
        ],
        model: 'gpt-3.5-turbo',
      });

      console.log('OpenAI Response:', completion);

      if (completion && completion.choices && completion.choices.length > 0) {
        const responseText = completion.choices[0].message.content.trim();
        console.log('Assistant Response:', responseText);
        return responseText;
      } else {
        console.error('Error: Invalid OpenAI response structure');
        throw new Error('Invalid OpenAI response structure');
      }
    } catch (error) {
      console.error('Error in OpenAI request:', error.message);
      throw error;
    }

  };




  const speak = (text) => {
    if (!text || text.trim() === '') {
      console.error('Error: No text to speak');
      return Promise.reject(new Error('No text to speak'));
    }
  
    // Adjust the chunk size based on your requirements
    const chunkSize = 200;
    const chunks = [];
  
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
  
    const speakChunk = (index) => {
      if (index < chunks.length) {
        return new Promise((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(chunks[index]);
          utterance.onend = () => {
            console.log(`SpeechSynthesis: Chunk ${index + 1}/${chunks.length} finished.`);
            resolve();
          };
          utterance.onerror = (error) => {
            console.error('SpeechSynthesis: Error during speech.', error);
            reject(error);
          };
  
          window.speechSynthesis.speak(utterance);
        })
          .then(() => speakChunk(index + 1))
          .catch((error) => console.error('Error during speech:', error));
      }
  
      return Promise.resolve();
    };
  
    return speakChunk(0);
  };
  
  
  
  
const handleUserInput = async () => {
  try {
    setLoading(true);

    const userInput = liveTranscript.trim();
    console.log('Live Transcript:', liveTranscript);

    if (userInput !== '') {
      setChatHistory([...chatHistory, { role: 'user', content: userInput }]);

      const completionText = await makeOpenAIRequest(userInput);

      if (completionText.trim() !== '') {
        // Speak the assistant's response
        await speak(completionText);
        console.log('Assistant Response:', completionText);
        setChatHistory([...chatHistory, { role: 'assistant', content: completionText }]);
      } else {
        // NEED TO PARA TULOY TULOY UNG SPEECH NIYA
        await speak('');
      }

      resetTranscript();

      if (userInput.toLowerCase() === 'exit') {
        // Handle exit logic if needed
      }
    }
  } catch (error) {
    console.error('Error in handleUserInput:', error.message);
  } finally {
    setLoading(false);
  }
};
  
  return (
    <div>
      <h1>Welcome to the Chatbot Program!</h1>
      <p>You can start chatting with the bot.</p>

      <div>
        {chatHistory.map(({ role, content }, index) => (
          <div key={index} style={{ color: role === 'user' ? 'blue' : 'green' }}>
            {`${role === 'user' ? 'You' : assistantName}: ${content}`}
          </div>
        ))}
      </div>

      <button onClick={() => browserSupportsSpeechRecognition && SpeechRecognition.startListening()}>Start</button>
      <button
        onClick={() => {
          browserSupportsSpeechRecognition && SpeechRecognition.stopListening();
          handleUserInput();
        }}
      >
        Stop
      </button>

      <button onClick={resetTranscript}>Reset</button>

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Chatbot;
