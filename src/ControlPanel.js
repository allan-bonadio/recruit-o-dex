/*
** Control Panel -- the floating blue box on the page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {connect} from 'react-redux';
import $ from "jquery";
import _ from "lodash";

import ScrapeDrawer from './ScrapeDrawer';
//import {EventTable} from './EventTable';
import RecForm from './RecForm';
import JsonForm from './JsonForm';
import {rxStore, getStateSelection} from './Reducer';


/********************************************************************** Control Panel root */
export let theControlPanel;

class ControlPanel extends Component {
	constructor() {
		super();
		theControlPanel = this;
		window.theControlPanel = this;
		
		this.mouseDown = this.mouseDown.bind(this);
		this.mouseMove = this.mouseMove.bind(this);
		this.mouseUp = this.mouseUp.bind(this);
		
		this.saveEditClick = this.saveEditClick.bind(this);
		this.saveAddClick = this.saveAddClick.bind(this);
		this.cancelEditAdd = this.cancelEditAdd.bind(this);

// 		this.state = {display: 'none'};
		this.cPanelX = 100;
		this.cPanelY = 200;  // for doing it quickly
	}

	render() {
		let sel = getStateSelection();
		if (!sel) return [];  // too early
		console.log("control pan sel:", sel);

		let ButtonArea = () => <section className='button-area' >
			<div style={{display: sel.selectedSerial >= 0 ? 'block' :  'none'}}>
				<button type='button' 
							className='save-button main-button' 
							onClick={this.saveEditClick}>
					Save
				</button>
			</div>
			<div style={{display: sel.selectedSerial < 0 ? 'block' :  'none'}}>
				<button type='button' 
							className='add-button main-button' 
							onClick={this.saveAddClick}>
					Add
				</button>
			</div>
			<div style={{display: 'block'}}>
				<button type='button' 
							className='cancel-button main-button' 
							onClick={this.cancelEditAdd}>
					Cancel
				</button>
			</div>
		</section>;


		// The top level organization of the control panel
		return <div 
						id="control-panel" onMouseDown={this.mouseDown}  
						style={{display: sel.selectedRecord ? 'block' : 'none'}} >
				<RecForm></RecForm>
				<JsonForm></JsonForm>
				<ScrapeDrawer></ScrapeDrawer>
				<ButtonArea></ButtonArea>
			</div>
	}
	
// 	sets the rec passed in as the "this" record for the control panel.
// 	rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
// 	This funciton sets internal vars and populates text blanks. 
// 	setCPRecord(rec) {
// 		this should set the state of both components and show the info
// 		theRecForm.setRecordState(rec);
// 		theJsonForm.setRecordState(rec);
// 		return this;
// 	}
	
	// set mode to Idle where the control panel is hidden.
// 	setIdle() {
// 		////theCrudCurtain.hide();
// 		////theControlPanel.hide();
// // 		theButtonArea.saveButton$.hide();
// // 		theButtonArea.addButton$.hide();
// // 		theControlPanel.adding = theControlPanel.editing = false;
// 		return this;
// 	}
	
	
	/************************************************************* crud */
	// // set mode to Edit so user can select an existing record
// 	// sets the rec passed in as the selectedRecord for the control panel.
// 	// This funciton sets internal vars and populates text blanks. 
// 	setEdit(rec) {
// 		// rec is presumed to be a raw record in the Global List.  It will not be changed, just cloned.
// 		////theCrudCurtain.show();
// // 		theButtonArea.saveButton$.show();
// // 		theButtonArea.addButton$.hide();
// // 		theControlPanel.adding = false;
// // 		theControlPanel.editing = true;
// 		$('#control-panel').removeClass('adding');
// 		////theControlPanel.setCPRecord(rec).show();
// 		return this;
// 	}
	
	////  set control panel look to Add so user can start a new record
// 	setAdd() {
// 		// the template for a new Recruiter
// 		let initial = {status: 'applied', created: (new Date()).toISOString().replace(/T/, '.')};
// 		
// 		theCrudCurtain.show();
// // 		theButtonArea.saveButton$.hide();
// // 		theButtonArea.addButton$.show();
// // 		theControlPanel.adding = true;
// // 		theControlPanel.editing = false;
// 		$('#control-panel').addClass('adding');
// 		//theControlPanel.setCPRecord(initial).show();
// 		return this;
// 	}
	
	// a click event on Save, save existing rec, pre-dispatch
	saveEditClick(ev) {
		rxStore.dispatch({
			type: 'SAVE_EDIT_REQ',
		});
	}
	
	// a click event on Add to save a new rec, just click handler that dispatches
	saveAddClick(ev) {
		////console.log("saveAddClick starting...");
		rxStore.dispatch({
			type: 'SAVE_ADD_REQ',
		});
	}
	
	// a click event on Cancel
	cancelEditAdd(ev) {
		////console.log("cancelEditAdd starting...");
		rxStore.dispatch({
			type: 'CANCEL_EDIT_ADD',
		});
		
		// all we have to do is return the two edit widgets to the original
		////cleanChanges(rxStore.getState());
		//startEditRecord(rxStore.originalBeforeChanges);
		////theControlPanel.setIdle();
	}

	
	/****************************************************** drag around cpanel */

	// click down on the control panel - so user can drag it around
	mouseDown(ev) {
		// a click on the panel, not in its text blanks
		let nn = ev.target.nodeName;
		if (nn != 'INPUT' && nn != 'TEXTAREA') {  // eslint-disable-line
			this.lastX = ev.clientX;
			this.lastY = ev.clientY;
		
			$(document.body).on('mousemove', this.mouseMove)
							.on('mouseup mouseleave', this.mouseUp);

			//ev.preventDefault();
			//ev.stopPropagation();
		}
	}
	
	// every yank of the sleeve comes through here
	mouseMove(ev) {
		// through normal fast means
		this.cPanelX += ev.clientX - this.lastX;
		this.cPanelY += ev.clientY - this.lastY;
		$('#control-panel').css({left: this.cPanelX + 'px', top: this.cPanelY + 'px'})

		// ready for next nudge
		this.lastX = ev.clientX;
		this.lastY = ev.clientY;
		
		ev.stopPropagation();
	}
	
	// called when it's the end and we're done, either by mouse up or mouse out of the page, or any other reason
	mouseUp(ev) {
		this.mouseMove(ev);
		
		// turn off event handlers and that'll disable dragging.  That's all, no cleanup needed; side effects all done.
		$(document.body).off('mousemove', this.mouseMove).off('mouseup mouseleave', this.mouseUp);
	}
}


/********************************************************************** button-area */
// Save and cancel buttons and some others i guess

// export let theButtonArea;
// 
// export class ButtonArea extends Component {
// 	constructor(props) {
// 		super(props);
// 		theButtonArea = this;
// 		
// // 		this.saveButton$ = $('.button-area .save-button');
// // 		this.addButton$ = $('.button-area .add-button');
// // 		this.cancelButton$ = $('.button-area .cancel-button');
// 		
// 		// show either the edit buttons (save cancel) or the adding buttons (add) use for css display
// 		////this.state = {editing: 'none', adding: 'none'};
// 		
// 		this.saveEditClick = this.saveEditClick.bind(this);
// 		this.cancelEditAdd = this.cancelEditAdd.bind(this);
// 		this.saveAddClick = this.saveAddClick.bind(this);
// 	}
// 	
// 	render() {
// 		let sel = getStateSelection();
// 		if (!sel) return [];
// 
// 		return <section className='button-area' >
// 			<div style={{display: sel.selectedSerial >= 0 ? 'block' :  'none'}}>
// 				<button type='button' className='save-button main-button' 
// 							onClick={this.saveEditClick}>
// 					Save
// 				</button>
// 			</div>
// 			<div style={{display: sel.selectedSerial < 0 ? 'block' :  'none'}}>
// 				<button type='button' className='add-button main-button' 
// 							onClick={this.saveAddClick}>
// 					Add
// 				</button>
// 			</div>
// 			<div style={{display: 'block'}}>
// 				<button type='button' className='cancel-button main-button' 
// 							onClick={this.cancelEditAdd}>
// 					Cancel
// 				</button>
// 			</div>
// 		</section>;
// 	}
// 	
// 	// a click event on Save, save existing rec, pre-dispatch
// 	saveEditClick(ev) {
// 		rxStore.dispatch({
// 			type: 'SAVE_EDIT_REQ',
// 		});
// 	}
// 	
// 	// a click event on Add to save a new rec, just click handler that dispatches
// 	saveAddClick(ev) {
// 		////console.log("saveAddClick starting...");
// 		rxStore.dispatch({
// 			type: 'SAVE_ADD_REQ',
// 		});
// 	}
// 	
// 	// a click event on Cancel
// 	cancelClick(ev) {
// 		////console.log("cancelClick starting...");
// 		rxStore.dispatch({
// 			type: 'CANCEL_EDIT_ADD',
// 		});
// 		
// 		// all we have to do is return the two edit widgets to the original
// 		////cleanChanges(rxStore.getState());
// 		//startEditRecord(rxStore.originalBeforeChanges);
// 		theControlPanel.setIdle();
// 	}
// 
// }
// 

function mapStateToProps(state) {
	return state ? state.selection : {};  // i don't think i really use these props
}

export default connect(mapStateToProps)(ControlPanel);




/********************************************************************** selection */

// export var selectedRecord = null;  // null if no selection
// export var selectedSerial = -1;  // Model.allRecruiters[selectedSerial] == selectedRecord was cloned from it
// export var didChange = false;  // and should be saved
// export var originalBeforeChanges = null;  // save this for Cancel


// call when the user has made a change, probably typing or backspacing.
// ok to call every time.
// make sure user doesn't forget about it
// export function userChangedRecord(state) {
// 	let sel = state.selection;
// 	if (sel.didChange) return;
// 	
// 	////theCrudCurtain.show();
// 	sel.didChange = true;
// }

//  set the flag back to Clean - there are no changes need saving/backing out
// export function cleanChanges(state) {
// 	console.warn("cleanChanges called on state ", state);
// 	let sel = state.selection;
// 	if (! sel.didChange) return;
// 	
// 	//theCrudCurtain.hide();
// 	sel.didChange = false;//// no bad bad
// }



