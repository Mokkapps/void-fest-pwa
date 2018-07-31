import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { PushNotification } from './push-notification';
import registerServiceWorker from './registerServiceWorker';

const pushNotifcation = new PushNotification();
ReactDOM.render(<App push={pushNotifcation} />, document.getElementById('root'));
registerServiceWorker();
