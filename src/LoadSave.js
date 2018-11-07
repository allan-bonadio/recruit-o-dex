/*
** LoadSave -- code to mediate between Redux state and the Model and ultimately the DB
**
** Copyright (C) 2017-2018 Tactile Interactive
*/

import $ from "jquery";
import _ from "lodash";

import {moPutOne, moPostOne} from './Model';
import {rxStore} from './reducer';
import {globalListUpdateList} from './GlobalList';
import Engagements from './Engagements';


// the prototype object for a selection, so I don't forget some fields
export let bareSelection = {
	editingRecord: null, 
	selectedSerial: -1, 
	didChange: false, 
	saving: false,
	editingEngagement: {what: '', when: '', notes: '',},
};
Object.freeze(bareSelection);

// return the current timestamp like "2018-09-23.01:23:45Z"
function timestampString() {
	 return (new Date()).toISOString().replace(/T/, '.')
}


export class LoadSave {


	// just before saving, clear out stuff, mostly empty fields
	// has side effects on passed in record and returns same object
	static cleanupRecord(record) {
		// this was making it impossible to delete eg company name; 
		// would always come back
////		for (let k in record) {
////			if (! record[k])
////				delete record[k];
////		}
		
		// clean out engagements; there's always at least one empty engagement
		let e = Engagements.cleanEngagementsList(record.engagements);
		if (e)
			record.engagements = e
		else
			delete record.engagements;
		
		return record;
	}
	
	static selectNothing(state) {
		return {...state, selection: {...bareSelection}};
	}
	
	/********************************************** Edit Existing */

	// sets the existing rec passed in as the selected record for the control panel.
	// called by reducer()
	static startEditRecord(state, action) {
		if (state.selection.didChange)
			throw "Cannot set new selection while old one has changes";  // eslint-disable-line

		$('div.App section.summary').removeClass('selected');
		let node$ = $('section[serial='+ action.serial +']');
		node$.addClass('selected');
		
		let record = state.recs[action.serial];

		// unmanaged, the scrape pit is just a textarea.  Clear it out when CP opens again.
		$('.scrape-pit').val('');

		// the NEW selection to be handed in to state
		let selection = {
			...bareSelection,
			originalBeforeChanges: record,  // this is in the big record list

			// setting the editingRecord will cause the control panel to appear
			editingRecord: _.cloneDeep(record),  // this copy gets changed during editing
			selectedSerial: action.serial,
			didChange: false,
		};
		//window.editingRecord = selection.editingRecord;  // so i can get at it in the debugger

		$('#control-panel').removeClass('adding');

		state = {...state,
			selection,
			controlPanel: {scrapeDrawerOpen: false},
		};

		return state;
	}
	
	
	// a click event on Save, post dispatch
	static saveEditReq(state, action) {
		// wait!  has there been any changes?  If not, don't actually save, leave it.
		// I don't have a lot of faith in this but it seems to work well.
		let obc = JSON.stringify(state.selection.originalBeforeChanges);
		let cur = JSON.stringify(state.selection.editingRecord);
		//console.log(obc, cur);
		if (obc == cur) {
			// cannot dispatch from a reducer function.
			setTimeout(() => rxStore.dispatch({type: 'SAVE_EDIT_DONE'}));
			return state;
		}
		
		// update
		let sel = state.selection;
		var rec = LoadSave.cleanupRecord(sel.editingRecord);
		rec.updated = timestampString();

		moPutOne(rec, function(errorObj) {
			// these are done later so no problem running from within a reducer
			if (errorObj)  // eslint-disable-line
				rxStore.dispatch({type: 'ERROR_PUT_POST', errorObj});
			else
				rxStore.dispatch({type: 'SAVE_EDIT_DONE'});
		});
		
		state = {...state};
		state.selection.saving = true;  // is this ever turned off?
		return state;
	}

	static saveEditDone(state, action) {
		
// 		replace the newly edited thing
// 		state.recs[sel.selectedSerial] = {...sel.editingRecord};

		// reload the screen. kindof overkill but works
		globalListUpdateList();
// 		moGetAll((err, newRecs) => {
// 			GlobalList.me.update(newRecs)
// 		});

		$('div.App section.summary').removeClass('selected');

		// replace the whole selection
		return LoadSave.selectNothing(state);
	}
	

	/********************************************** Add New */
	// start editing a new blank record.  Called when user clicks New Rec.
	static startAddRecord(state, action) {
		// the template for a new Recruiter
		let initial = {status: 'applied', created: timestampString()};

		$('#control-panel').addClass('adding');
		//theControlPanel.setCPRecord(initial).show();
		
		
		// unmanaged, the scrape pit is just a textarea.  Clear it out when CP opens again.
		$('.scrape-pit').val('');
	
		// most important, make a selection pointing to the new prototype rec
		return {
			...state,
			selection: {
				...state.selection,
				editingRecord: initial,
				saving: true,
			},
			controlPanel: {scrapeDrawerOpen: true},
		};
	}

	// a click event on Add to save a new rec: actually start save
	static saveAddReq(state, action) {
		// create
		let sel = state.selection;
		var rec = LoadSave.cleanupRecord(sel.editingRecord);
		moPostOne(rec, function(errorObj) {
			if (! errorObj) {
				rxStore.dispatch({
					type: 'SAVE_ADD_DONE',
					errorObj,
				});
			}
			else {
				// error dialog
				rxStore.dispatch({
					type: 'ERROR_PUT_POST',
					errorObj,
				});
				
			}
		});
		
		state = {...state};
		state.selection.saving = true;
		return state;
	}

	static saveAddDone(state, action) {
		// reload the screen. kindof overkill but works
		globalListUpdateList();

		$('div.App section.summary').removeClass('selected');

		return LoadSave.selectNothing(state);
	}
	
	/********************************************************************** other */
	static cancelEditAdd(state, action) {

		// reload the screen. kindof overkill but works
		globalListUpdateList();

		return LoadSave.selectNothing(state);
	}
}

export default LoadSave;
