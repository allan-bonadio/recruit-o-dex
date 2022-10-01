/*
** Edit Panel -- the floating blue box on the page
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq */

import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import $ from "jquery";

import {rxStore} from '../reducer';
//import RecField from './RecField';

import GlobalList, {globalListUpdateList} from '../globalList/GlobalList';
import BoxForm from './BoxForm';
import LoadSave from '../LoadSave';
import LittleDialog from '../LittleDialog';
import JsonForm from './JsonForm';
import RecForm from './RecForm';
import EmplForm from './EmplForm';
import {Engagements} from './Engagements';

import './EditPanel.scss';


/********************************************************************** Control Panel root */
export let theEditPanel;

class EditPanel extends Component {
	// all of these come from the redux store
	static propTypes = {
		// which rec being edited, or <0 if adding new one.  ignored if !editingRecord
		selectedSerial: PropTypes.number,

		// null if panel not displayed (and no rec is selected), otherwise, rec being edited
		editingRecord: PropTypes.object,
	};
	static defaultProps = {
		selectedSerial: null,
		editingRecord: null,
	};

	constructor(props) {
		super(props);

		theEditPanel = this;
		window.theEditPanel = this;

		this.state = {
			currentTab: 'recInfo',
			//editingRecord: null,
		};

		//this.mouseDown = this.mouseDown.bind(this);
		//this.mouseMove = this.mouseMove.bind(this);
		//this.mouseUp = this.mouseUp.bind(this);
		//
		//this.saveAddClick = this.saveAddClick.bind(this);
		//this.saveEditClick = this.saveEditClick.bind(this);
		//this.dupRecClick = this.dupRecClick.bind(this);

		this.cPanelX = 100;
		this.cPanelY = 200;  // for doing it quickly
		console.info('constructed EditPanel');
	}

	renderTabBar() {
		const aTab =
		name => {
			let isSelected = (name == this.state.currentTab) ? 'selected' : '';
			return <li className={`tab ${isSelected}`} onClick={ev => this.setState({currentTab: name})}>{name}</li>;
		}

		return (<ul className='tabBar'>
			{aTab('recInfo')}
			{aTab('emplInfo')}
			{aTab('jd')}
			{aTab('engagements')}
			{aTab('json')}
		</ul>);
	}

	renderTabs() {
		let p = this.props;
		let rec = p.editingRecord;
		if (!rec)
			return '';

		switch (this.state.currentTab) {
			// big form
			case 'recInfo': return <RecForm rec={rec} />;
			case 'emplInfo': return <EmplForm rec={rec} />;

			// big box
			case 'jd': return (<BoxForm rec={rec} label='JD:' fieldName='job_desc_url' lines={30}
				element='textarea' placeholder='whole job description' />);

			// big list of forms
			case 'engagements': return (
				<Engagements engagements={rec.engagements}
						dispatch={this.props.dispatch}
						rec={rec}
				 />);
;
			// big box; has everything
			case 'json': return <JsonForm/>;

			default: throw new Error(`bad currentTab '${this.state.currentTab}'`);
		}
	}

	renderButtonArea(sel) {
		return (<section className='button-area' >
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
							onClick={EditPanel.cancelEditPanel}>
					Cancel
				</button>
			</div>
			<div style={{display: 'block'}}>
				<button type='button'
							className='dup-button main-button'
							onClick={this.dupRecClick}>
					Dup
				</button>
			</div>
		</section>);
	}

	render() {
		//console.info('rendering EditPanel');
		let p = this.props;
		if (!p) return [];  // too early
		//if (!p.editingRecord) return [];  // right after EditPanel closed?
		//let rec = this.state.editingRecord;

		////console.log("control pan p:", p);

		// The top level organization of the control panel
		return <div
				id="edit-panel" onMouseDown={this.mouseDown}
				className={p.selectedSerial < 0 ? 'adding' : ''}
				style={{
					display: p.editingRecord ? 'block' : 'none',
				}}
			>

			{this.renderTabBar()}
			{this.renderTabs()}
			{this.renderButtonArea(p)}
		</div>
	}


	// a click event on Save, save existing rec, pre-dispatch
	saveEditClick =
	(ev) => {
		LoadSave.saveAddEditRecord(this.props.selectedSerial);
	}

	// a click event on Add to save a new rec, just click handler that dispatches
	saveAddClick =
	(ev) => {
		////console.log("saveAddClick starting...");
		LoadSave.saveAddEditRecord(-1);
	}

	dupRecClick =
	(ev) => {
		LoadSave.dupCurrentRecord(this.props.selectedSerial);
	}

	// Cancel current editing, either during edit or add.   Can be used as event handler or just a function to call
	static cancelEditPanel(ev) {
		// reload the screen. kindof overkill but works
		globalListUpdateList();

		rxStore.dispatch({type: 'CANCEL_EDIT_ADD'});
	}


	// got error during saving.  do dialog.
	static errorPutPost(editPanel, action) {
		let message = 'no message';
		if (action.httpStatus)
			message = "http status "+ action.httpStatus;
		if (action.errorObj)
			message = action.errorObj.message;

		LittleDialog.alert('Error Saving', message);

		// we put up a dialog but other than that no state change.
		return editPanel;
	}




	/****************************************************** drag around cpanel */

	// click down on the control panel - so user can drag it around
	mouseDown =
	(ev) => {
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
	mouseMove =
	(ev) => {
		GlobalList.mouseMoved();

		// through normal fast means
		this.cPanelX += ev.clientX - this.lastX;
		this.cPanelY += ev.clientY - this.lastY;
		$('#edit-panel').css({left: this.cPanelX + 'px', top: this.cPanelY + 'px'})

		// ready for next nudge
		this.lastX = ev.clientX;
		this.lastY = ev.clientY;

		ev.stopPropagation();
	}

	// called when it's the end and we're done, either by mouse up or mouse out of the page, or any other reason
	mouseUp =
	(ev) => {
		this.mouseMove(ev);

		// turn off event handlers and that'll disable dragging.  That's all, no cleanup needed; side effects all done.
		$(document.body).off('mousemove', this.mouseMove).off('mouseup mouseleave', this.mouseUp);
	}
}


function mapStateToProps(state) {
	//console.info("MS2P control panel");
	return state ? state.editPanel : {};  // i don't think i really use these props
}

export default connect(mapStateToProps)(EditPanel);


