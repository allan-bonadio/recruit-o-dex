/*
** Engagements -- manage interviews for control panel
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import {connect} from 'react-redux';

/********************************************************************** engagement fields */

// a row in the Engagements table, that lets users enter new engagements
function EngagementRow(props) {
	let startTime = props.engagement.when;  // ISO datetime
	if (startTime && startTime.length <= 10)
		startTime += 'T06:00';  // compat with legacy data (6am=legacy)

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
					onChange={props.changeEngagement}  onPaste={props.pasteEngagement} />
		</td>
		<td>
			<input type='datetime-local' name='when' size='22'
					defaultValue={startTime} 
					min='2019-01-01T00:00:00Z' max='2030-01-01T00:00:00Z' step='300'
					onChange={props.changeEngagement}  onPaste={props.pasteEngagement} />
		</td>
		<td>
			<select name='howLong' defaultValue={props.engagement.howLong || 30} 
						onChange={props.changeEngagement} onPaste={props.pasteEngagement} >
				<option value='15'>15 m</option>
				<option value='30'>30 m</option>
				<option value='45'>45 m</option>
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
					onChange={props.changeEngagement} onPaste={props.pasteEngagement} />
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
		this.pasteEngagement = this.pasteEngagement.bind(this);
	}
	
	
	render() {
		let p = this.props;
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
							changeEngagement={this.changeEngagement}
							pasteEngagement={this.pasteEngagement} />
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
				<option value='googlev' >Google Video Interview</option>
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
		
		// this field is two levels down: editingRecord.engagements[4].fieldName
		this.props.dispatch({
					type: 'CHANGE_TO_ENGAGEMENT', 
					serial: serial,
					fieldName: targ.name,
					newValue: targ.value,
				});
		ev.stopPropagation();
	}
	
	// reducer for such change
	static changeToEngagement(controlPanel, action) {
		// find where it goes, creating stuff as needed
		if (! controlPanel.editingRecord.engagements)
			controlPanel.editingRecord.engagements = [defaultEngagement()]
		let q = controlPanel.editingRecord.engagements
		if (! q[action.serial])
			q[action.serial] = defaultEngagement();  // used the bottom row = new row
		q = q[action.serial];

		// actually set the value into the engagement
		q[action.fieldName] = action.newValue;
		
		controlPanel = {...controlPanel, 
			editingRecord: {...controlPanel.editingRecord,
				engagements: [...controlPanel.editingRecord.engagements]
			}
		};
		controlPanel.editingRecord.engagements[action.serial] = q;
		
		return controlPanel;
	}
	
	// clean out empty engagements including that 'new' one at the end;
	// this is done just before saving
	static cleanEngagementsList(engs) {
		if (!engs)
			return undefined;
		
		let newEngs = engs.filter(eng => eng.what || eng.notes);
		if (newEngs.length <= 0)
			return undefined;
		else
			return newEngs;
	}
	
	// parses what was pasted
	parsePastedEngagement(clipBoardData) {
debugger;////
		const ScheduledRegex = 
			/^Scheduled: (\w\w\w \d\d?, \d\d\d\d) at (\d\d?:\d\d [AP]M) to (\d\d?:\d\d [AP]M)$/m;

		for (let i = 0; i < clipBoardData.items.length; i++) {
			let item = clipBoardData.items[i];
			console.log("a clipBoardData item: kind %s, type %s, '%s'", 
				item.kind, item.type, clipBoardData.getData(item.type));
		}
			
		let pasteText = clipBoardData.getData('text/plain');
		console.log("Pasted TExt\n", pasteText, '\n');
		
		// look for stuff we recognize.
		let m = pasteText.match(ScheduledRegex);
		if (!m)
			return;  // Otherwise, let the paste continue.
		
		// m1 is the date, m2 and 3 are the time, each in a format Date() recognizes
		let startTime = new Date(m[1] +' '+ m[2]);
		let endTime = new Date(m[1] +' '+ m[3]);
		let duration = (endTime.getTime() - startTime.getTime()) / 60000;  // in minutes
		
		pasteText = pasteText.replace(m[0] + '\n', '');  // remove Scheduled: line
		
		// try to guess what kind of interview
		let newWhat = 'phint';
		if (pasteText.match(/skype/im))
			newWhat = 'skype';
		else if (pasteText.match(/zoom/im))
			newWhat = 'zoom';
		else if (pasteText.match(/webex/im))
			newWhat = 'webex';
		else if (pasteText.match(/google v/im))
			newWhat = 'googlev';
		else if (pasteText.match(/on-?site/im))
			newWhat = 'onsite';
		else if (pasteText.match(/f2f/im))
			newWhat = 'onsite';

		return {
			newWhat,
			newStart: startTime.toISOString().replace(/:00\.00.*$/, ''),  // datetime input so pickey
			newDuration: duration,
			newNotes: pasteText,
		}
	}
	
	// called whenuser pastes into an engagement row.  Note this gets attached to an
	// EngagementRow component, not this one (see above)
	pasteEngagement(ev) {
debugger;////
		
		let eng = this.parsePastedEngagement(ev.clipboardData);
		if (!eng)
			return;
		
		var targ = ev.target;
		var tr = targ.parentElement.parentElement;
		var serial = tr.getAttribute('serial');
		
		// this field is two levels down: editingRecord.engagements[4].fieldName
		this.props.dispatch({
					type: 'PASTE_TO_ENGAGEMENT', 
					serial: serial,
					...eng,
				});
		ev.preventDefault();
	}

	// reducer for above
	static pasteToEngagement(controlPanel, action) {
debugger;////
		// find where it goes, creating stuff as needed
		if (! controlPanel.editingRecord.engagements)
			controlPanel.editingRecord.engagements = [defaultEngagement()]
		let q = controlPanel.editingRecord.engagements
		if (! q[action.serial])
			q[action.serial] = defaultEngagement();  // used the bottom row = new row
		q = q[action.serial];

		// actually set the value into the engagement
		q.what = action.newWhat;
		q.when = action.newStart;
		q.howLong = action.newDuration;
		q.notes = action.newNotes;
		
		controlPanel = {...controlPanel, 
			editingRecord: {...controlPanel.editingRecord,
				engagements: [...controlPanel.editingRecord.engagements]
			}
		};
		controlPanel.editingRecord.engagements[action.serial] = q;
		
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

