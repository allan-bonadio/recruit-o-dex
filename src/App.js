/*
** App -- the main code for the Recruit-O-Dex page
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import {Provider} from 'react-redux';


import GlobalList from './globalList/GlobalList';
import './App.scss';
import {rxStore} from './reducer';

import ControlPanel from './controlPanel/ControlPanel';
import CrudCurtain from './controlPanel/CrudCurtain';
////import {getBySerial} from './Model';

import LittleDialog from './LittleDialog';

// the app itself, pretty simple
export function App() {
console.info('executing App');
	return (
		<Provider store={rxStore}>
			<div className="App">
				<div>
					<ControlPanel />
					<GlobalList />
				</div>
				<CrudCurtain />
				<LittleDialog />
			</div>
		</Provider>
	);
}

export default App;
