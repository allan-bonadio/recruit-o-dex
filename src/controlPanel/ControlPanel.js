/*
** Control Panel -- the floating blue box on the page
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {connect} from 'react-redux';
import $ from "jquery";

import GlobalList, {globalListUpdateList} from '../globalList/GlobalList';
import LoadSave from '../LoadSave';
import LittleDialog from '../LittleDialog';
import JsonForm from './JsonForm';
import RecForm from './RecForm';
import {rxStore} from '../reducer';

import './ControlPanel.scss';


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

// 		this.state = {display: 'none'};
		this.cPanelX = 100;
		this.cPanelY = 200;  // for doing it quickly
console.info('constructed ControlPanel');
	}

	render() {
		//console.info('rendering ControlPanel');
		let sel = this.props;
		if (!sel) return [];  // too early
		////console.log("control pan sel:", sel);

		let ButtonArea = <section className='button-area' >
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
							onClick={ControlPanel.cancelControlPanel}>
					Cancel
				</button>
			</div>
			<div style={{display: 'block'}}>
				<button type='button'
							className='dup-button main-button'
							onClick={ControlPanel.dupRec}>
					Dup
				</button>
			</div>
		</section>;


		// The top level organization of the control panel
		return <div
						id="control-panel" onMouseDown={this.mouseDown}
						className={sel.selectedSerial < 0 ? 'adding' : ''}
						style={{
							display: sel.editingRecord ? 'block' : 'none',
						}} >
				<RecForm></RecForm>
				<JsonForm></JsonForm>
				{ButtonArea}
			</div>
	}


	// a click event on Save, save existing rec, pre-dispatch
	saveEditClick(ev) {
		LoadSave.saveAddEditRecord(this.props.selectedSerial);
	}

	// a click event on Add to save a new rec, just click handler that dispatches
	saveAddClick(ev) {
		////console.log("saveAddClick starting...");
		LoadSave.saveAddEditRecord(-1);
	}

	// Cancel current editing, either during edit or add.   Can be used as event handler or just a function to call
	static cancelControlPanel(ev) {
		// reload the screen. kindof overkill but works
		globalListUpdateList();

		rxStore.dispatch({type: 'CANCEL_EDIT_ADD'});
	}


	dupRec(ev) {

	}

	// got error during saving.  do dialog.
	static errorPutPost(controlPanel, action) {
		let message = 'no message';
		if (action.httpStatus)
			message = "http status "+ action.httpStatus;
		if (action.errorObj)
			message = action.errorObj.message;

		LittleDialog.alert('Error Saving', message);

		// we put up a dialog but other than that no state change.
		return controlPanel;
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
		GlobalList.mouseMoved();

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


function mapStateToProps(state) {
	//console.info("MS2P control panel");
	return state ? state.controlPanel : {};  // i don't think i really use these props
}

export default connect(mapStateToProps)(ControlPanel);


