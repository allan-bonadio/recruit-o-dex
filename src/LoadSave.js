/*
** LoadSave -- code to mediate between Redux state and the Model and ultimately the DB
**
** Copyright (C) 2017-2018 Tactile Interactive
*/

import $ from "jquery";
import _ from "lodash";

import {putOne, postOne} from './Model';
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

export class LoadSave {

	// just before saving, clear out stuff, mostly empty fields
	// has side effects on passed in record and returns same object
	static cleanupRecord(record) {
		for (let k in record) {
			if (! record[k])
				delete record[k];
		}
		
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

	// sets the existing rec passed in as the state record for the control panel.
	// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
	// called by reducer()
	static startEditRecord(state, action) {
		if (state.selection.didChange)
			throw "Cannot set new selection while old one has changes";  // eslint-disable-line

		$('div.App section.summary').removeClass('selected');
		$(action.node).addClass('selected');

		// unmanaged, the scrape pit is just a textarea.  Clear it out when CP opens again.
		$('.scrape-pit').val('');

		// the NEW selection to be handed in to state
		let selection = {
			...bareSelection,
			originalBeforeChanges: action.record,  // this is in the big record list

			// setting the editingRecord will cause the control panel to appear
			editingRecord: _.cloneDeep(action.record),  // this copy gets changed during editing
			selectedSerial: action.serial,
			didChange: false,
		};
		window.editingRecord = selection.editingRecord;  // so i can get at it in the debugger

		$('#control-panel').removeClass('adding');


		state = {...state,
			selection,
			controlPanel: {scrapeDrawerOpen: false},
		};

		return state;
	}
	
	
	// a click event on Save, post dispatch
	static saveEditReq(state, action) {
		////console.log("saveEditClick starting...");
		
		// update
		let sel = state.selection;
		var rec = LoadSave.cleanupRecord(sel.editingRecord);
		putOne(rec, function(errorObj, httpStatus) {
			////console.log("...saveEditClick done");
			if (! errorObj) {  // eslint-disable-line
				rxStore.dispatch({
					type: 'SAVE_EDIT_DONE',
					httpStatus,
				});
			}
		});
		
		state = {...state};
		state.selection.saving = true;
		return state;
	}

	static saveEditDone(state, action) {
		
// 		replace the newly edited thing
// 		state.recs[sel.selectedSerial] = {...sel.editingRecord};

		// reload the screen. kindof overkill but works
		globalListUpdateList();
// 		getAll((err, newRecs) => {
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
		let initial = {status: 'applied', created: (new Date()).toISOString().replace(/T/, '.')};

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
		postOne(rec, function(errorObj, httpStatus) {
			////console.log("...saveEditClick done");
			if (! errorObj) {
				rxStore.dispatch({
					type: 'SAVE_ADD_DONE',
					httpStatus: httpStatus,
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
