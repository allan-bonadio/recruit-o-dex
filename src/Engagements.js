/*
** Engagements -- manage interviews for control panel
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {connect} from 'react-redux';
import _ from "lodash";
////import {rxStore} from './reducer'

////let changeEngagementsCallback;

/********************************************************************** engagement fields */

// a row in the Engagements table, that lets users enter new engagements
function EngagementRow(props) {
	let startTime = props.engagement.when;
	if (startTime && startTime.length <= 10)
		startTime += 'T06:00:00';  // compat with legacy data (6am=legacy)

	let calStr = '';
	if (props.engagement.what && startTime) {
		// calculate the calendar string that i can cop/paste to Calendar + box
		let start = new Date(startTime);
		let end = new Date( (props.engagement.howLong || 60) * 60000 + start.getTime() )

		calStr = props.engagement.what +' '+ 
			(props.company_name || 'company') +' '+
			start.toLocaleDateString() +' '+ start.toTimeString().substr(0, 5) +
			' to '+ end.toTimeString().substr(0, 5);
	}
	
	return <tr className='engagement' serial={props.serial}>
		<td>
			<input name='what' list='engagement-whats' size='12' placeholder='choose what' 
					defaultValue={props.engagement.what}
					onChange={props.changeEngagement} />
		</td>
		<td>
			<input type='datetime-local' name='when' size='22'
					defaultValue={startTime} 
					min='2017-01-01T00:00:00Z' max='2030-01-01T00:00:00Z' 
					onChange={props.changeEngagement} />
		</td>
		<td>
			<select name='howLong' defaultValue={props.engagement.howLong || 60} >
				<option value='30'>30 m</option>
				<option value='60'>1 hr</option>
				<option value='90'>1.5 hr</option>
				<option value='120'>2 hr</option>
				<option value='180'>3 hr</option>
				<option value='240'>4 hr</option>
				<option value='300'>5 hr</option>
				<option value='360'>6 hr</option>
			</select>
		</td>
		<td>
			<textarea name='notes' rows='1'
					defaultValue={props.engagement.notes} placeholder='enter notes'
					onChange={props.changeEngagement} />
		</td>
		<td>
			<input readOnly='1' className='calendarDesc' value={calStr}
				onClick={ev => ev.target.select()} size='2'/>
		</td>
	</tr>;
}


// construct the default 'environments' state, not what's stored in the record, 
// but instead just today's date in the date box
function defaultEngagement() {
	function twoDigit(n) { return String(n + 100).substr(1) }
	let tomorrow = new Date(Date.now() + 86400000)
	return {
		what: '', 
		when: tomorrow.getFullYear() +'-'+ twoDigit(tomorrow.getMonth()+1) +'-'+ 
					twoDigit(tomorrow.getDate()) +'T11:00',
		howLong: '60',
		notes: '',
		// serial added at creation time
	}
}



export class Engagements extends Component {
	constructor(props) {
		super(props);
		Engagements.me = this;
		
		this.changeEngagement = this.changeEngagement.bind(this);
	}
	
	
	render() {
		let p = this.props;
		////let sel = p.editingEngagement || defaultEngagement();  // the unrecorded one the user is typing in
		let es = p.engagements || [];  // the saved ones for this rec or undefined if none

		// additional row at the bottom so you can make a new one
		// will be inserted into engagements array upon first keystroke or change
		// but don't show it in the json panel
		es = [...es];
		es.push({what: '', date: '', notes: ''});
		
		// generate the rows for existing engs
		let eRows =  es
				? es.map((engagement, serial) => 
					<EngagementRow serial={serial} key={serial} 
							engagement={engagement} company_name={p.rec.company_name}
							changeEngagement={this.changeEngagement}/>
					)
				: [];
				
		// assemble final table
		return <div>
			<datalist id='engagement-whats'>
				<option value='recruiter call' >recruiter call</option>
				<option value='intro' >Intro Phone Int</option>
				<option value='phint' >Phone Interview</option>
				<option value='skype' >Skype Interview</option>
				<option value='zoom' >Zoom Interview</option>
				<option value='webex' >Webex Interview</option>
				<option value='onsite' >On-Site Interview</option>
			</datalist>
			<table>
				<tbody>
					{eRows}
				</tbody>
			</table>
		</div>;
	}

	// event handler for a keystroke or other change to that new engagement
	changeEngagement(ev) {
		var targ = ev.target;
		
		var tr = targ.parentElement.parentElement;
		var serial = tr.getAttribute('serial');
// 		let engs = state.controlPanel.editingRecord.engagements || [];  // all, for the selected rec
// 		let sel = state.controlPanel.editingEngagement || defaultEngagement();  // current kinetic state
		
		// this field is two levels down: editingRecord.engagements[4].fieldName
		this.props.dispatch({
					type: 'CHANGE_TO_ENGAGEMENT', 
					serial: serial,
					fieldName: targ.name,
					newValue: targ.value,
				});


// 		var chobj = {};
// 		chobj[ev.target.name] = ev.target.value;
// 		this.setState(chobj);
		ev.stopPropagation();
	}
	
	static changeToEngagement(controlPanel, action) {
		// action.fieldName and .newValue tells you what changed, .fieldPrefix is for subfields like selection
		////state = _.cloneDeep(state);////state = {...state}
		
		// find where it goes, creating stuff as needed
		if (! controlPanel.editingRecord.engagements)
			controlPanel.editingRecord.engagements = [defaultEngagement()]
		let q = controlPanel.editingRecord.engagements
		if (! q[action.serial])
			q[action.serial] = defaultEngagement();
		q = q[action.serial];

		// actually set the value into the engagement
		q[action.fieldName] = action.newValue;
		
		// // now's a good time to insert the 'new' engagement if needed
// 		let engs = controlPanel.editingRecord.engagements;
// 		let lastEng = engs[engs.length - 1];
// 		if (lastEng.what || lastEng.notes) {
// 			engs.push(defaultEngagement())
// 		}
		
		return controlPanel;
	}
	
	// clean out empty engagements including that 'new' one at the end
	static cleanEngagementsList(engs) {
		if (!engs)
			return undefined;
		
		let newEngs = engs.filter(eng => eng.what || eng.notes);
		if (newEngs.length <= 0)
			return undefined;
		else
			return newEngs;
	}

	// action handler, called by the Add bar to add it.
	static addNewEngagement(controlPanel, action) {
		// what, when, notes was old arg list
		// engagements is a new feature; failover
		let newEngagements = [];
		if (controlPanel.engagements)
			newEngagements = {...controlPanel.engagements};
		
		newEngagements.push({
			what: action.what, 
			when: action.when, 
			howLong: action.howLong, 
			notes: action.notes, 
			serial: newEngagements.length
		});
		return controlPanel;
	}
	
}

function mapStateToProps(state) {
	debugger;  // this never gets hit?
	console.log("|| Engagements#mapStateToProps: state=", state);
	let s = state.controlPanel;
	return {
		controlPanel: s,
		engagements: s.engagements,
	};
}

export default connect(mapStateToProps)(Engagements);

