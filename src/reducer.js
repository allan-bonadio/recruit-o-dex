/*
** reducer -- redux reducer case stmts
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import {createStore, combineReducers} from 'redux';

import LoadSave from './LoadSave';
import Engagements from './Engagements';
import ControlPanel from './ControlPanel';
import RecForm from './RecForm';
import JsonForm from './JsonForm';
import GlobalList from './GlobalList';
import LittleDialog from './LittleDialog';

// the initial, default state.  Try to put in normally-absent fields so we can document them here.
export const initialState = {
	// stuff about the control panel, including the selected record
	controlPanel: {
		// the record being edited by the ControlPanel; a separate copy.  
		// Null means no rec selected.
		editingRecord: null,
		selectedSerial: -1,  // index into state.recs or New if <0
		originalBeforeChanges: null,  // save this for Cancel or Undo

		saving: false,
		editingEngagement: {what: '', when: '', notes: '',},

		// the text in json box, ONLY if it's unparsable.  
		// If it's parsable, it's all loaded into editingRecord and this is null.
		jsonText: null,
		jsonError: null,  // any error while parsing jsonText, or null if jsonText is null
	},
	
	// LittleDialog is for alerts and little prompts or 'save' reminder dialogs
	// has more fields when in use
	littleDialog: {
		modal: false,  // whether it's open or hidden
	},
	
	// data in the whole list aka global list, the background of all the data
	wholeList: {
		sortCriterion: 0,  // default is first in menu, Company Name presently
		
		searchQuery: '',  // someday
	
		// all the records, for the GlobalList
		recs: [],
		
		globalListErrorObj: null,
	}
};
Object.freeze(initialState);


////// get me just the .controlPanel property of the state
////export function getStateSelection() {
////	let state = rxStore.getState();
////	//console.warn("|| getStateSelection from state", state);
////	if (state)
////		return state.controlPanel;
////	else
////		return null;  // too early during strtup?
////}

// THE main dispatcher for this whole app
////export function reducer(state = initialState, action) {
////	
////	// redux starting up
////	if (/@@redux.INIT/.test(action.type))
////		return state;
////	
////	switch (action.type) {
////	return state;
////}

function wholeListReducer(wholeList = initialState.wholeList, action) {
	switch (action.type) {
	/*********************************************** init */
	case 'SET_WHOLE_LIST':
		// set all records, set into GlobalList.  called during page load.
		return GlobalList.setWholeList(wholeList, action);

	case 'CHANGE_SEARCH_QUERY':
		// user typed etc into the JSON box
		return GlobalList.changeSearchQuery(wholeList, action);

	case 'CHANGE_SORT_CRITERION':
		return GlobalList.changeSortCriterion(wholeList, action);
	
	case 'ERROR_GET_ALL':
		// any error from retrieval from mongo
		return GlobalList.errorGetAll(wholeList, action);
	}
	return wholeList;
}

function controlPanelReducer(controlPanel = initialState.wholeList, action) {
	switch (action.type) {
	case 'RESET_SELECTION':
		// set to no control panel, no record selected
		return GlobalList.resetSelection(controlPanel, action);
	
	/*********************************************** control panel operations */
	case 'START_EDIT_RECORD':
		// select and load a record into control panel (after user clicks it in the GlobalList)
		return LoadSave.startEditRecord(controlPanel, action);
		//return {...state};  // ??
		
	case 'SAVE_EDIT_START':
		// initiate save after START_EDIT_RECORD (after user clicked Save)
		//return theControlPanel.saveEditStart(state, action);
		return LoadSave.saveEditStart(controlPanel, action);
		
	case 'SAVE_EDIT_DONE':
		// save of existing record in CP was a success
		// select and load a record into control panel
		return LoadSave.saveEditDone(controlPanel, action);
		
	case 'START_ADD_RECORD':
		// create and load a new record into control panel (after user clicked New Rec)
		return LoadSave.startAddRecord(controlPanel, action);
		
	case 'SAVE_ADD_START':
		// initiate save after START_ADD_RECORD (after user clicks Add or on drapes
		// create and load a record into control panel
		return LoadSave.saveAddStart(controlPanel, action);
		
	case 'SAVE_ADD_DONE':
		// success
		return LoadSave.saveAddDone(controlPanel, action);
		
	/********************************************************************** misc */

	case 'CANCEL_EDIT_ADD':
		// user clicked Cancel button after opening control panel
		return LoadSave.cancelEditAdd(controlPanel, action);
		
	case 'CHANGE_TO_RECORD':
		// user typed, backspaced, cut or pasted inside one of those text blanks, or equivalent		
		return RecForm.changeToRecord(controlPanel, action);

	case 'CHANGE_TO_ENGAGEMENT':
		// inside a text blank in an engagement
		return Engagements.changeToEngagement(controlPanel, action);

	case 'CHANGE_TO_JSON':
		// user typed etc into the JSON box
		return JsonForm.changeToJson(controlPanel, action);

	case 'PASTE_TO_ENGAGEMENT':
		// paste an appointment (copy out of Calendar) into an engagement
		return Engagements.pasteToEngagement(controlPanel, action);

	case 'ERROR_PUT_POST':
		// any error from saving to mongo
		console.error("ERROR_PUT_POST", action);
		return ControlPanel.errorPutPost(controlPanel, action);
	}
	return controlPanel;
}

function littleDialogReducer(littleDialog = initialState.littleDialog, action) {
	switch (action.type) {
	case 'OPEN_LITTLE_DIALOG':
		return LittleDialog.openLittleDialog(littleDialog, action);
		
	case 'CLOSE_LITTLE_DIALOG':
		return LittleDialog.closeLittleDialog(littleDialog, action);
	}
	return littleDialog;
}

// unify the reducers
export const reducer = combineReducers({
	wholeList: wholeListReducer,
	controlPanel: controlPanelReducer,
	littleDialog: littleDialogReducer,
});

// the one and only redux store
export const rxStore = createStore(reducer, initialState);

