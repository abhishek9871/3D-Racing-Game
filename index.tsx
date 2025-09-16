// FIX: Add a triple-slash directive to include DOM library types.
// This resolves the error from 'document' being undefined by providing
// the correct TypeScript definitions for browser environments.
/// <reference lib="dom" />

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);