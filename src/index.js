/*
** index -- top level for the RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App, theGlobalList} from './App';
import {getAll} from './Model';
////import registerServiceWorker from './registerServiceWorker';

getAll(function(records) {
	// when the data is loaded for the first time, start the app.
	ReactDOM.render(<App />, document.getElementById('root'));
	
	theGlobalList.update(records)
});
//registerServiceWorker();


