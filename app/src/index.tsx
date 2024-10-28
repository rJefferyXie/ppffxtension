import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/styles.css';
import App from '../src/App';

// Create the #root element dynamically if it doesn't exist
const rootElement = document.createElement('div');
rootElement.id = 'root';
document.body.appendChild(rootElement); // Attach to the body of the webpage

// Render the React app into this root element
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);