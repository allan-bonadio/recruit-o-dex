/*
** Engagements -- manage interviews for control panel
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React, { Component } from 'react';
import {connect} from 'react-redux';

/********************************************************************** date formatting */
function two(n) { return (n + 100).toString().substr(-2) }

// given a Date() date, gimme the time part, local tz 24hr, like 14:00
function dateToLocalTime(date) {
	return date.toTimeString().substr(0, 5);
}

// convert a Date to the way the input[type=datetime-local] likes it
function dateToLocalDate(date) {
	return date.getFullYear() +'-'+ two(date.getMonth() + 1) +'-'+
			two(date.getDate());
}


/********************************************************************** date parsing */

// returns a date broken down with deconstructDate3() above
function parseDate(dateNTime) {
	let m = dateNTime.match(/\w\w\w \d+, 20\d\d/);
	if (m) {
		// it can parse these dates, but... got to combine it with the time
		let date3 = deconstructDate3(new Date(m[0]));
		if (! isNaN(date3.day))
			return date3;
	}

	console.error(`can't find date in '${dateNTime}, let's guess'`);
	return deconstructDate3(new Date());
}

function deconstructDate3(d) {
	return {
		year: d.getFullYear(),
		month: d.getMonth(),
		day: d.getDate(),
	};
}

const tzMap = {E: 3, C: 2, M: 1, P: 0, AK: -1, H: -2};
const ampmMap = {AM: 0, PM: 12};

// parse textual US or GMT time into Pacific time.  Will work with DST unless in the hours during which DST changes across the US.
// warning: this is a big hack and US & Pacific time specific.
function parseTimeInterval(dateNTime) {
	let m = dateNTime.match(/ at (\d+):(\d\d) (\wM) to (\d+):(\d\d) (\wM), ([\w/]+)/);
	if (m) {
		// timezone: this is what to subtract from the time in the timestamp to get Pac time
		let tzOffsetHrs = 0;
		let t = m[7].match(/(E|C|M|P|AK|H)[SD]T/)
		if (t) {
			// eastern cnetral mt pacific alaska hawaii timezones.  Assume the
			// Std/Daylight thing is current.  Hope it's not Indiana or Arizona.
			tzOffsetHrs = tzMap[t[1]];
		}
		if ('GMT' == m[7])
			tzOffsetHrs = (new Date()).getTimezoneOffset() / 60;
		// otherwise we just say screwit and pretend its local time

		return {
			startHrs: +m[1] + ampmMap[m[3]] - tzOffsetHrs,
			endHrs: +m[4] + ampmMap[m[6]] - tzOffsetHrs,
			startMins: +m[2],
			endMins: +m[5],
		};
	}

	// we just don't know
	return {
		startHrs: 13,
		endHrs: 14,
		startMins: 0,
		endMins: 0,
	};
}

function parseScheduledTime(dateNTime) {
	let da = parseDate(dateNTime);
	let ti = parseTimeInterval(dateNTime);
	let date = new Date(da.year, da.month, da.day, ti.startHrs, ti.startMins);
	let howLong = (ti.endHrs * 60 + ti.endMins) - (ti.startHrs * 60 + ti.startMins);
	return {date, howLong}
}

/********************************************************************** engagement fields */
// a row in the Engagements table, that lets users enter new engagements
function EngagementRow(props) {
	// console.info('executing EngagementRow');
	// console.log("EngagementRow:", props);
	let startTime = props.engagement.when;  // ISO datetime or local if no Z
	if (startTime && startTime.length <= 10)
		startTime = startTime.replace(/Z$/, '') + 'T21:00Z';

	let calStr = '';
	if (!startTime)
		startTime = '';
	else {
		// calculate the calendar string that i can cop/paste to Calendar + box.
		// SOme of these are ISO times (end in Z) and some pacific times (don't)
		// Date does the right thing
		let start = new Date(startTime);
		let end = new Date( (props.engagement.howLong || 60) * 60000 + start.getTime() )

		// separate date and time by space
		calStr = props.engagement.what +' '+
			(props.company_name || 'company') +' '+
			dateToLocalDate(start) +' '+ dateToLocalTime(start) +
			' to '+ dateToLocalTime(end);

		// control does NOT take a timezone!  And must have T separator
		//  The format is "yyyy-MM-ddThh:mm"
		startTime = dateToLocalDate(start) +'T'+ dateToLocalTime(start);
		if (startTime.substr(-1) == 'Z') debugger;////
	}

	//console.log("EngagementRow startTime: '%s'", startTime);

	return <tr className='engagement' serial={props.serial}>
		<td>
			<input name='what' list='engagement-whats' size='20' placeholder='choose what'
					defaultValue={props.engagement.what}
					onChange={props.changeEngagement}  onPaste={props.pasteEngagement} />
		</td>
		<td>
			<input type='datetime-local' name='when' size='22'
					value={startTime}
					min='2019-01-01T00:00' max='2030-01-01T00:00' step='300'
					onChange={props.changeEngagement}  onPaste={props.pasteEngagement} />
		</td>
		<td>
			<select name='howLong' value={props.engagement.howLong || 30}
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
				onClick={ev => ev.target.select()} size='5'/>
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
					twoDigit(tomorrow.getDate()) +'T13:00',
		howLong: '60',
		notes: '',
		// serial added at creation time
	}
}


// Yeah, this should be a Function component.  No state,
// no other functions besides Render and constructor
export class Engagements extends Component {
	constructor(props) {
		super(props);
		Engagements.me = this;

		this.changeEngagement = this.changeEngagement.bind(this);
		this.pasteEngagement = this.pasteEngagement.bind(this);
		//console.info('constructed Engagements');
	}


	render() {
		//console.info('rendering Engagements');
		let p = this.props;
		let es = p.engagements || [];  // the saved ones for this rec or empty if none

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
				<option value='msteams' >MS Teams Interview</option>
				<option value='onsite' >On-Site Interview</option>
				<option value='canceled' >canceled</option>
				<option value='deleted' >deleted</option>
			</datalist>
			<table>
				<tbody>
					{eRows}
				</tbody>
			</table>
			<small>To delete one, choose 'delete' type, or delete its type and the notes, and save.</small>
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
	static changeToEngagement(editPanel, action) {
		// find where it goes, creating stuff as needed
		if (! editPanel.editingRecord.engagements)
			editPanel.editingRecord.engagements = [defaultEngagement()]
		let q = editPanel.editingRecord.engagements
		if (! q[action.serial])
			q[action.serial] = defaultEngagement();  // used the bottom row = new row
		q = q[action.serial];

		// actually set the value into the engagement
		q[action.fieldName] = action.newValue;

		editPanel = {...editPanel,
			editingRecord: {...editPanel.editingRecord,
				engagements: [...editPanel.editingRecord.engagements]
			}
		};
		editPanel.editingRecord.engagements[action.serial] = q;

		return editPanel;
	}

	// clean out empty engagements including that 'new' one at the end;
	// this is done just before saving
	static cleanEngagementsList(engs) {
		if (!engs)
			return [];

		// deletion never seems to work; like it's a mongo server problem
		//let newEngs = engs.filter(eng => {
		//	let res = (eng.what || eng.notes) && eng.what != 'deleted';
		//	console.log(res);
		//	return res;
		//});
		let newEngs = engs.filter(eng => (eng.what || eng.notes) && eng.what != 'deleted');
		return newEngs;
	}


	// parses what was pasted, eg:
	//	Allan Bonadio  and Keith Swett
	//	Scheduled: Aug 16, 2022 at 10:30 PM to 10:45 PM, GMT
	//	Location: Google Meet (instructions in description)
	parsePastedEngagement(clipBoardData) {
		const ScheduledRegex =
			/^Scheduled: (\w\w\w \d\d?, \d\d\d\d) at (\d\d?:\d\d [AP]M) to (\d\d?:\d\d [AP]M)$/m;

		for (let i = 0; i < clipBoardData.items.length; i++) {
			let item = clipBoardData.items[i];
			console.log("a clipBoardData item: kind %s, type %s, '%s'",
				item.kind, item.type, clipBoardData.getData(item.type));
		}

		let pasteText = clipBoardData.getData('text/plain');
		console.log(`Pasted Text'${pasteText}'`);

		// don't depend on one big regex that'll probably not match cuz of a tiny discrepancy
		// look for stuff we recognize.  First line is the title.
		let m, subject = '', dateNTime = '';
		m = pasteText.match(/^(.*?)\n/);
		console.log(`pasted Subject: '${subject}'`);
		if (m)
			subject = m[1];

		// next the date time
		m = pasteText.match(/\n\s*Scheduled:\s*(.*)\n/)
		if (m) {
			dateNTime = m[1]
			console.log(`pasted dateNTime: '${dateNTime}'`);
			let {date, howLong} = parseScheduledTime(m[1]);
			console.log(`resulting time: '${date.toString()}' duration ${howLong} mins`);

			// figure how newWhat is
			let newWhat = 'interview';
			if (pasteText.match(/Location: Google Meet/i))
				newWhat = 'google v';
			if (pasteText.match(/Location: .*\.zoom\.us/i))
				newWhat = 'zoom';
			if (pasteText.match(/Location: .*teams/i))
				newWhat = 'ms teams';

			return {
				newWhat,
				newStart: date.toISOString(),  // ISO std
				newDuration: howLong,
				newNotes: subject,
			}
		}

		if (false) {
			// old code, didn't workwell
			let m = pasteText.match(ScheduledRegex);
			if (!m)
				return;  // Otherwise, let the paste continue.

			// m1 is the date, m2 and 3 are the time, each in a format Date() recognizes
			let startTime = new Date(m[1] +' '+ m[2]);
			let endTime = new Date(m[1] +' '+ m[3]);
			let duration = (endTime.getTime() - startTime.getTime()) / 60000;  // in minutes

			let notesText = pasteText.replace(m[0] + '\n', '');  // remove Scheduled: line

			// try to guess what kind of interview
			let newWhat = '';
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
				newStart: startTime.toISOString().replace(/:00\.00.*$/, 'Z'),  // ISO std
				newDuration: duration,
				newNotes: notesText,
			}
		}
	}

	// called whenuser pastes into an engagement row.  Note this gets attached to an
	// EngagementRow component, not this one (see above)
	pasteEngagement(ev) {
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
	static pasteToEngagement(editPanel, action) {
		// find where it goes, creating stuff as needed
		if (! editPanel.editingRecord.engagements)
			editPanel.editingRecord.engagements = [defaultEngagement()]
		let q = editPanel.editingRecord.engagements
		if (! q[action.serial])
			q[action.serial] = defaultEngagement();  // used the bottom row = new row
		q = q[action.serial];

		// actually set the value into the engagement
		q.what = action.newWhat;
		q.when = action.newStart;
		q.howLong = action.newDuration;
		q.notes = action.newNotes.trim();
		console.log("pasteToEngagement: new eng is ", q.when, q);

		editPanel = {...editPanel,
			editingRecord: {...editPanel.editingRecord,
				engagements: [...editPanel.editingRecord.engagements]
			}
		};
		editPanel.editingRecord.engagements[action.serial] = q;

		return editPanel;
	}

}

function mapStateToProps(state) {
	debugger;  // this never gets hit?
	console.log("|| Engagements#mapStateToProps: state=", state);
	let s = state.editPanel;
	return {
		editPanel: s,
		engagements: s.engagements,
	};
}

export default connect(mapStateToProps)(Engagements);

