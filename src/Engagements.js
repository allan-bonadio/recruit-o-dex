import React, { Component } from 'react';
import {connect} from 'react-redux';
import _ from "lodash";
////import {rxStore} from './reducer'

////let changeEngagementsCallback;

/********************************************************************** engagement fields */

// a row in the Engagements table, that lets users enter new engagements
function EngagementRow(props) {
	return <tr className='engagement' serial={props.serial}>
		<td>
			<input name='what' list='engagement-whats' size='12' placeholder='choose what' 
					defaultValue={props.engagement.what}
					onChange={props.changeEngagement} />
		</td>
		<td>
			<input type='date' name='when' 
					defaultValue={props.engagement.when} min='2017-01-01' max='2030-01-01' 
					onChange={props.changeEngagement} />
		</td>
		<td>
			<textarea name='notes' rows='1'
					defaultValue={props.engagement.notes} placeholder='enter notes'
					onChange={props.changeEngagement} />
		</td>
	</tr>
}


// construct the default 'environments' state, not what's stored in the record, 
// but instead just variable values in the widget boxes
function defaultEngagement() {
	function twoDigit(n) { return String(n + 100).substr(1) }
	let today = new Date();
	return {
		what: '', 
		when: today.getFullYear() +'-'+ twoDigit(today.getMonth()+1) +'-'+ twoDigit(today.getDate()),
		notes: '',
		// serial added at creation time
	}
}



export class Engagements extends Component {
	constructor(props) {
		super(props);
		Engagements.me = this;
		
		////changeEngagementsCallback = props.changeEngagements;
		this.clickAdd = this.clickAdd.bind(this);
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
		let rows =  es
				? es.map((engagement, serial) => 
					<EngagementRow serial={serial} key={serial} engagement={engagement} 
							changeEngagement={this.changeEngagement}/>
					)
				: [];
				
		// assemble final table
		return <div>
			<datalist id='engagement-whats'>
				<option value='recruiter call' >recruiter call</option>
				<option value='hr phint' >Phone Interview, HR</option>
				<option value='semitech phint' >Phone Interview, semitechnical</option>
				<option value='tech phint' >Phone Interview, technical</option>
				<option value='onsite' >On-Site Interview</option>
			</datalist>
			<button type='button' className='add-engagement' onClick={p.clickAdd} >+</button>
			<table>
				<tbody>
					{rows}
				</tbody>
			</table>
		</div>;
	}
// 					<EngagementAddBar changeEngagement={this.changeEngagement} clickAdd={this.clickAdd}
// 								what={sel.what} 
// 								when={sel.when} 
// 								notes={sel.notes} />

	// event handler for a keystroke or other change to that new engagement
	changeEngagement(ev) {
		var targ = ev.target;
		
		var tr = targ.parentElement.parentElement;
		var serial = tr.getAttribute('serial');
// 		let engs = state.selection.editingRecord.engagements || [];  // all, for the selected rec
// 		let sel = state.selection.editingEngagement || defaultEngagement();  // current kinetic state
		
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
	
	static changeToEngagement(state, action) {
		// action.fieldName and .newValue tells you what changed, .fieldPrefix is for subfields like selection
		state = _.cloneDeep(state);////state = {...state}
		
		// find where it goes, creating stuff as needed
		if (! state.selection.editingRecord.engagements)
			state.selection.editingRecord.engagements = [defaultEngagement()]
		let q = state.selection.editingRecord.engagements
		if (! q[action.serial])
			q[action.serial] = defaultEngagement();
		q = q[action.serial];

		// actually set the value into the engagement
		q[action.fieldName] = action.newValue;
		
		// // now's a good time to insert the 'new' engagement if needed
// 		let engs = state.selection.editingRecord.engagements;
// 		let lastEng = engs[engs.length - 1];
// 		if (lastEng.what || lastEng.notes) {
// 			engs.push(defaultEngagement())
// 		}
		
		return state;
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

	// event handler for button to add this engagement to the list of engagements for the currently selected record
	clickAdd(ev) {
		let p = this.props;
		p.dispatch({
					type: 'ADD_NEW_ENGAGEMENT', 
					what: p.what,
					when: p.when,
					notes: p.notes,
				});
		////this.addNewEngagement(p.what, p.when, p.notes);
	}
	
	// action handler, called by the Add bar to add it.
	static addNewEngagement(state, action) {
		// what, when, notes was old arg list
		// engagements is a new feature; failover
		let newEngagements = [];
		if (this.props.engagements)
			newEngagements = {...this.props.engagements};
		
		newEngagements.push({what: action.what, when: action.when, notes: action.notes, serial: newEngagements.length});
		//changeEngagementsCallback(newEngagements);
		return state;
	}
	
}

function mapStateToProps(state) {
	debugger;
	console.log("|| Engagements#mapStateToProps: state=", state);
	let s = state.selection;
	return {
		selection: s,
		engagements: s.engagements,
		////editingEngagement: s.editingEngagement,
		////changeEngagements: changeEngagementsCallback,
	};
// 	return {
// 		recs: (state ? state.recs : []), 
// 		selectedSerial: state ? state.selection.selectedSerial : -1,
// 	};
}

export default connect(mapStateToProps)(Engagements);

