/*
** SummaryRec -- per-rec summary box
*/

import React, {Component} from 'react';

import {rxStore} from './reducer';

// each recruiter/job cell, shown in the Global List, the front page.
// This is NOT a redux component because I need multiple ones of them.
export class SummaryRec extends Component {
	constructor(props) {
		super(props);
		this.clickEv = this.clickEv.bind(this);
	}
	
	
	render() {
		
		// for each field, make a <div with the current value in it
		let Field = (props) => {
			return <div className={'summary-field '+ props.name}>	
						{props.record ? props.record[props.name] : ''}
					</div>;
		}

		let r = this.props.record;
		return <section 
				className={'summary '+ (this.props.selectedSerial == this.props.serial ? 'selected' : '')}
				onClick={this.clickEv} 
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


	// the only thing you can do is click one to open it in control panel
	clickEv(ev) {
		rxStore.dispatch({
			type: 'START_EDIT_RECORD', 
			serial: this.props.serial,
			record: this.props.record,
		});
	};

}

export default SummaryRec;

