import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
// Entry point: mounts the React app into the #root div in index.html
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
