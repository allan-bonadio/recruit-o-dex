//import React from 'react';
import { createStore } from 'redux';
import _ from "lodash";

import ControlPanel
	from './ControlPanel';
import LoadSave from './LoadSave';

/****************************************************** Redux */
const initialState = {
	selection: {
		// the record being edited by the ControlPanel; a separate copy.  Null means no rec selected.
		selectedRecord: null,
		selectedSerial: -1,  // index into allRecruiters, or New if <0
		didChange: false,  // and should be saved
		originalBeforeChanges: null,  // save this for Cancel or Undo
	},
	
	// all the records, for the GlobalList
	recs: [],
};


// get me just the .selection property of the state
export function getStateSelection() {
	let state = rxStore.getState();
	//console.warn("|| getStateSelection from state", state);
	if (state)
		return state.selection;
	else
		return null;  // too early during strtup?
}

// THE main dispatcher for this whole app
function reducer(state = initialState, action) {
	console.log("|| reducer() action: ", action);
	
	/*
	actions:
	- keystrokes in RecForm
	- keystrokes in JsonForm
	- keystrokes in ScrapeDrawer
	- keystrokes in EventTable
	
	*/

	// redux starting up
	if (/@@redux.INIT/.test(action.type))
		return;
	
	switch (action.type) {
	/*********************************************** init */
	case 'SET_WHOLE_LIST':
		// retrieve all records from mongo, set into GlobalList and render.  called during page load.
		state = {
			...state,
			
			// well we no longer have the old selection so drop that
			selection: {
				selectedRecord: null,
				selectedSerial: -1,  // index into allRecruiters, or New if <0
				didChange: false,  // and should be saved
				originalBeforeChanges: null,  // save this for Cancel or Undo
			},

			// all new data.  everything you knew is now false.
			recs: action.recs,
		};
		break;
	
	
	/*********************************************** control panel operations */
	case 'EDIT_RECORD':
		// select and load a record into control panel (after user clicks it in the GlobalList)
		state = LoadSave.startEditRecord(state, action);
		state = _.cloneDeep(state);
		break;
		
	case 'SAVE_EDIT_REQ':
		// initiate save after EDIT_RECORD (after user clicked Save)
		//return theControlPanel.saveEditReq(state, action);
		state = LoadSave.saveEditReq(state, action);
		break;
		
	case 'SAVE_EDIT_DONE':
		// save of existing record in CP was a success
		// select and load a record into control panel
		////return theControlPanel.saveEditDone(state, action);
// 		state = {
// 			...state,
// 			selection: LoadSave.saveEditDone(state, action),
// 		};
		state = LoadSave.saveEditDone(state, action);
		break;
		
	case 'START_ADD_RECORD':
		// create and load a new record into control panel (after user clicked New Rec)
		state = LoadSave.startAddRecord(state, action);
		break;
		
	case 'SAVE_ADD_REQ':
		// initiate save after START_ADD_RECORD (after user clicks Add or on drapes
		// create and load a record into control panel
		state = LoadSave.saveAddReq(state, action);
		break;
// 		return {
// 			...state,
// 			selection: LoadSave.saveAddReq(state, action),
// 		};
		
	case 'SAVE_ADD_DONE':
		// success
		state = LoadSave.saveAddDone(state, action);
		break;
// 		};
		
	/********************************************************************** misc */

	case 'CANCEL_EDIT_ADD':
		// user clicked Cancel button after opening control panel
		state = LoadSave.cancelEditAdd(state, action);
		////state.selection.selectedRecord = state.selection.originalBeforeChanges;
		break;
	
	case 'CHANGE_TO_RECORD':
		// user typed, backspaced, cut or pasted inside one of those text blanks, or equivalent
		state = _.cloneDeep(state);////state = {...state}
		state.selection.selectedRecord[action.fieldName] = action.newValue;
		break;

	
	case 'DB_ERROR':
		// any error from saving/reading from mongo
		console.error("DB Error", action);
		break;
		
	default:
		console.warn("unfound action ", action.type);
		break;
	}
	window.rst = state;//// for debugging
	//console.log("|| state will be: ", state);
	return state;
}

// the one and only redux store
export const rxStore = createStore(reducer, initialState);
