import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import FirebaseMessenger from './firebaseMessenger';
import registerServiceWorker from './registerServiceWorker';

const firebaseMessenger = new FirebaseMessenger();
ReactDOM.render(<App messenger={firebaseMessenger} />, document.getElementById('root'));
registerServiceWorker();
