import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import AppProvider from './AppProvider';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<AppProvider />, document.getElementById('root'));
serviceWorker.register();
