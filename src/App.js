/*
** App -- the main code for the Recruit-O-Dex page
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/

import React from 'react';
import {Provider} from 'react-redux';


import GlobalList from './globalList/GlobalList';
import './App.scss';
import {rxStore} from './reducer';

import EditPanel from './editPanel/EditPanel';
import CrudCurtain from './editPanel/CrudCurtain';
////import {getBySerial} from './Model';

import LittleDialog from './LittleDialog';

// the app itself, pretty simple
export function App() {
console.info('executing App');
	return (
		<Provider store={rxStore}>
			<div className="App">
				<div>
					<EditPanel />
					<GlobalList />
				</div>
				<CrudCurtain />
				<LittleDialog />
			</div>
		</Provider>
	);
}

export default App;
