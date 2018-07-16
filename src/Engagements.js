import React, { Component } from 'react';
import _ from "lodash";

/********************************************************************** event fields */

// one row of the events table
function EventRow(props) {
	let event = props.event;
	return <tr key={event.key}>
		<td>{event.what}</td>
		<td>{event.when}</td>
		<td>{event.notes}</td>
	</tr>;
}

// the single bar, last row in the Events table, that lets users enter new events
class EventAddBar extends Component {
	constructor(props) {
		super(props);
		
		// Set defaults.  date for date input control
		function twoDigit(n) { return String(n + 100).substr(1) }
		let today = new Date();
		this.state = {
			what: '', 
			when: today.getFullYear() +'-'+ twoDigit(today.getMonth()+1) +'-'+ twoDigit(today.getDate()),
			notes: '',
			// key added at creation time
		}
		
		this.addClick = this.addClick.bind(this);
		this.uponChange = this.uponChange.bind(this);
		this.addNewEvent = props.addNewEvent;
	}
	
	// a keystroke or other change to that new event
	uponChange(ev) {
		var chobj = {};
		chobj[ev.target.name] = ev.target.value;
		this.setState(chobj);
		ev.stopPropagation();
	}
	
	// add this event to the list of events
	addClick(ev) {
		this.addNewEvent(this.state.what, this.state.when, this.state.notes);
	}
	
	render() {
		return <tr>
			<td><input name='what' list='event-whats' size='12' value={this.what} placeholder='what' onChange={this.uponChange} />
				<datalist id='event-whats'>
					<option value='hr phint' />Phone Interview, HR
					<option value='tech phint' />Phone Interview, technical
					<option value='onsite' />On-Site Interview
				</datalist>
			</td>
			<td><input type='date' name='when' value={this.state.when} min='2017-01-01' max='2030-01-01' onChange={this.uponChange} /></td>
			<td><textarea name='notes' value={this.state.notes} placeholder='enter notes' onChange={this.uponChange} /></td>
			<td><button type='button' onClick={this.addClick} >Add</button></td>
		</tr>
	}
}

export class EventTable extends Component {
	constructor(props) {
		super(props);
		this.addNewEvent = this.addNewEvent.bind(this);
	}
	
	// called by the Add bar to add it.  We do not hold the events list, we just display it.  Pass it up to really change
	addNewEvent(what, when, notes) {
		// events is a new feature; failover
		let newEvents = [];
		if (this.props.events)
			newEvents = _.clone(this.props.events);
		
		when = (new Date(when)).toLocaleDateString();
		newEvents.push({what: what, when: when, notes: notes, key: newEvents.length+1});
		this.props.changeEvents(newEvents);
	}
	
	render() {
		// generate the rows
		let rows =  this.props.events ? this.props.events.map(event => <EventRow key={event.key} event={event} />) : [];
	
		// assemble final table, with Add row at end
		return <div>
			<table>
				<tbody>
					{rows}
					<EventAddBar addNewEvent={this.addNewEvent} />
				</tbody>
			</table>
		</div>;
	}
}

