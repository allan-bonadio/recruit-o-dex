/*
** SummaryRec -- per-rec summary box
*/

import React, {Component} from 'react';

import {getBySerial} from './Model';
import {rxStore} from './Reducer';

// these are the actual React components
export var allSummaryRecs = [];

// each recruiter/job cell, shown in the Global List, the front page.
// This is NOT a redux component because I need multiple ones of them.
export class SummaryRec extends Component {
	constructor(props) {
		super(props);
		//this.state = {};  //this.state = {serial: props.serial, record: props.record};
		////console.log("Constructing SummaryRec #%d", props.serial)
		this.serial = props.serial;
		allSummaryRecs[props.serial] = this;
// 		eslint-disable-next-line
// 		this.state.serial = props.serial;
// 		eslint-disable-next-line
// 		this.state.record = props.record;
	}
	
	
	render() {
// 		if (! this.state) {
// 			// state not set yet
// 			return "Please wait...";
// 		}
		
		// the only thing you can do is click one to open it in control panel
		let clickHandler =  (ev) => {
			let act = {
				type: 'START_EDIT_RECORD', 
				node: ev.currentTarget,
				summary: this,
			};
			act.serial = act.node.getAttribute('serial');
			act.record = getBySerial(act.serial);

			rxStore.dispatch(act);
			////this.select(node, serial, record);
		};
		
		// for each field, make a <div with the current value in it
		let Field = (props) => {
			////console.info("rec & name:", props.record, props.name);
			return <div className={'summary-field '+ props.name}>	
						{props.record ? props.record[props.name] : ''}
					</div>;
		}

		////debugger;////
		let r = this.props.record;
		return <section className={'summary '+ (this.props.selectedSerial == this.serial ? 'selected' : '')}
					onClick={clickHandler} 
					serial={this.props.serial} key={this.props.serial} >
			<Field record={r} name='company_name' />
			<Field record={r} name='recruiter_name' />
			<br clear="left" />
			
			<Field record={r} name='recruiter_email' />
			<Field record={r} name='recruiter_phone' />
			<Field record={r} name='agency' />

			<Field record={r} name='status' />
			<Field record={r} name='notes' />
		</section>;
	}
	
// 	select this record, for editing, and populate the edit and json boxes
// 	select(node, serial, record) {
// 		$('div.App section.summary').removeClass('selected');
// 		$(node).addClass('selected');
// 		editRecord(serial, record);
// 	}
}

export default SummaryRec;

