import React, { Component } from 'react';
import {connect} from 'react-redux';
import _ from "lodash";

/********************************************************************** engagement fields */

// one row of the table, displayed, readonly
function EngagementRow(props) {
	let e = props.engagement;
	return <tr key={e.key}>
		<td>{e.what}</td>
		<td>{e.when}</td>
		<td>{e.notes}</td>
	</tr>;
}

// the single bar, last row in the Engagements table, that lets users enter new engagements
function EngagementAddBar(props) {
	return <tr className='engagement-add-bar'>
		<td>
			<input name='what' list='engagement-whats' size='12' value={props.what} 
						placeholder='what' onChange={props.uponChange} />
			<datalist id='engagement-whats'>
				<option value='hr phint' />Phone Interview, HR
				<option value='tech phint' />Phone Interview, technical
				<option value='onsite' />On-Site Interview
			</datalist>
		</td>
		<td>
			<input type='date' name='when' 
					value={props.when} min='2017-01-01' max='2030-01-01' 
					onChange={props.uponChange} />
		</td>
		<td>
			<textarea name='notes' value={props.notes} placeholder='enter notes' 
						onChange={props.uponChange} />
		</td>
		<td>
			<button type='button' onClick={props.addClick} >Add Eng</button>
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
		// key added at creation time
	}
}



export class Engagements extends Component {
	constructor(props) {
		super(props);

		this.addClick = this.addClick.bind(this);
		this.uponChange = this.uponChange.bind(this);
	}
	
	
	// a keystroke or other change to that new engagement
	uponChange(ev) {
		var targ = ev.target;
// 		let engs = state.selection.selectedRecord.engagements || [];  // all, for the selected rec
// 		let sel = state.selection.selectedEngagement || defaultEngagement();  // current kinetic state
		
		// appends or replaces one field only
		var rec = _.clone(this.props.selection.selectedRecord);
		rec[targ.name] = targ.value;
		this.props.dispatch({
					type: 'CHANGE_TO_RECORD', 
					fieldPrefix: 'selectedEngagement', 
					fieldName: targ.name, 
					newValue: targ.value,
				});


// 		var chobj = {};
// 		chobj[ev.target.name] = ev.target.value;
// 		this.setState(chobj);
		//ev.stopPropagation();
	}
	
	// add this engagement to the list of engagements
	addClick(ev) {
		this.addNewEngagement(this.props.what, this.props.when, this.props.notes);
	}
	
	// called by the Add bar to add it.  We do not hold the engagements list, we just display it.  Pass it up to really change
	addNewEngagement(what, when, notes) {
		// engagements is a new feature; failover
		let newEngagements = [];
		if (this.props.engagements)
			newEngagements = _.clone(this.props.engagements);
		
		when = (new Date(when)).toLocaleDateString();
		newEngagements.push({what: what, when: when, notes: notes, key: newEngagements.length+1});
		this.props.changeEngagements(newEngagements);
	}
	
	render() {
		let p = this.props;
		let sel = p.selectedEngagement || defaultEngagement();  // the unrecorded one the user is typing in
		let es = p.engagements || [];  // the saved ones for this rec or undefined if none
		
		// generate the rows for existing engs
		let rows =  es
				? es.map(
						engagement => <EngagementRow key={engagement.key} engagement={engagement} />
					)
				: [];
	
		// assemble final table, with Add row at end
		return <div>
			<table>
				<tbody>
					{rows}
					<EngagementAddBar uponChange={this.uponChange} addClick={this.addClick}
								what={sel.what} 
								when={sel.when} 
								notes={sel.notes} />
				</tbody>
			</table>
		</div>;
	}
}

function mapStateToProps(state) {
	console.log("|| Engagements#mapStateToProps: state=", state);
	return {selection: state.selection};
// 	return {
// 		recs: (state ? state.recs : []), 
// 		selectedSerial: state ? state.selection.selectedSerial : -1,
// 	};
}

export default connect(mapStateToProps)(Engagements);

