import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import log from "loglevel";

log.setLevel('error')
const loglevel = new URLSearchParams(window.location.search).get('loglevel');
if(loglevel) {
    log.setLevel(loglevel)
}

ReactDOM.render(<App />, document.getElementById('root'));
