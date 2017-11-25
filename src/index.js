import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Model from './Model';
////import registerServiceWorker from './registerServiceWorker';

function repaint() {
	ReactDOM.render(<App />, document.getElementById('root'));
}

Model.getAll(function(records) {
	repaint();
});
//registerServiceWorker();


