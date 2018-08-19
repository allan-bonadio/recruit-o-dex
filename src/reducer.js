//import React from 'react';
import { createStore } from 'redux';
import _ from "lodash";

import LoadSave from './LoadSave';
import Engagements from './Engagements';
import {theControlPanel} from './ControlPanel';
import ScrapeDrawer from './ScrapeDrawer';
import RecForm from './RecForm';
import JsonForm from './JsonForm';
import GlobalList from './GlobalList';
import LittleDialog from './LittleDialog';

const initialState = {
	selection: {
		// the record being edited by the ControlPanel; a separate copy.  
		// Null means no rec selected.
		editingRecord: null,
		selectedSerial: -1,  // index into allRecruiters, or New if <0
		didChange: false,  // and editingRecord should be saved
		originalBeforeChanges: null,  // save this for Cancel or Undo
	},
	
	// stuff about the control panel, not directly related to the selected record
	controlPanel: {
		scrapeDrawerOpen: false,
		
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
////	console.log("|| reducer() action: ", action);
	
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
				editingRecord: null,
				selectedSerial: -1,  // index into allRecruiters, or New if <0
				didChange: false,  // and should be saved
				originalBeforeChanges: null,  // save this for Cancel or Undo
			},

			// all new data
			recs: action.recs,
		};
		break;
	
	
	/*********************************************** control panel operations */
	case 'START_EDIT_RECORD':
		// select and load a record into control panel (after user clicks it in the GlobalList)
		state = LoadSave.startEditRecord(state, action);
		state = _.cloneDeep(state);
		break;
		
	case 'SAVE_EDIT_REQ':
		// initiate save after START_EDIT_RECORD (after user clicked Save)
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
		////state.selection.editingRecord = state.selection.originalBeforeChanges;
		break;
		
	case 'APPEND_ENGAGEMENT':
		// user clicked add in the engagements panel
		state = Engagements.addNewEngagement(state, action);
		break;
	
	case 'CHANGE_TO_RECORD':
		// user typed, backspaced, cut or pasted inside one of those text blanks, or equivalent		
		state = RecForm.changeToRecord(state, action);
		break;

	case 'CHANGE_TO_ENGAGEMENT':
		// inside a text blank in an engagement
		state = Engagements.changeToEngagement(state, action);
		break;

	case 'CHANGE_TO_JSON':
		// user typed etc into the JSON box
		state = JsonForm.changeToJson(state, action);
		break;

	case 'CHANGE_TO_SEARCH_QUERY':
		// user typed etc into the JSON box
		state = GlobalList.changeToSearchQuery(state, action);
		break;

	
	case 'ERROR_GET_ALL':
		// any error from retrieval from mongo
		console.error("ERROR_GET_ALL", action);
		// why do i have to do this??@?@?@////
////		if ('undefined' != typeof GlobalList)
////			state = GlobalList.me.errorGetAll(state, action);
////		else
////			alert(action.errorObj.toString());
		// if mongo & server aren't started,
		// GlobalList is undefined and I can't even check for it!!
		state = {
			...state,
			globalListErrorObj: action.errorObj,
		};

		break;
	
	case 'ERROR_PUT_POST':
		// any error from saving to mongo
		console.error("ERROR_PUT_POST", action);
		state = theControlPanel.errorPutPost(state, action);
		break;
		
	case 'SET_SCRAPE_DRAWER_OPEN':
		state = ScrapeDrawer.setScrapeDrawerOpen(state, action);
		break;
		
	case 'OPEN_LITTLE_DIALOG':
		state = LittleDialog.openLittleDialog(state, action);
		break;
		
	case 'CLOSE_LITTLE_DIALOG':
		state = LittleDialog.closeLittleDialog(state, action);
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
////console.log("rxStore = ", rxStore);

