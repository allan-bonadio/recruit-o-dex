/*
** App -- the main code for the RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import './App.css';
import $ from "jquery";

import {ControlPanel, CrudCurtain, setSelectedRecord, startNewRec} from './ControlPanel'
import {getBySerial} from './Model';


export function App() {
	return (
		<div className="App">
			<div>
				<ControlPanel></ControlPanel>
				<GlobalList></GlobalList>
			</div>
			<CrudCurtain></CrudCurtain>
		</div>
	);
}

/********************************************************************** Global List */

// these are the actual React components
export var allSummaries = [];

// each recruiter/job cell, shown in the Global List, the front page
class SummaryRec extends Component {
	constructor(props) {
		super(props);
		this.state = {serial: props.serial, record: props.record};
		allSummaries[props.serial] = this;
// 		eslint-disable-next-line
// 		this.state.serial = props.serial;
// 		eslint-disable-next-line
// 		this.state.record = props.record;
	}
	
	
	render() {
		if (! this.state) {
			// state not set yet
			return "Please wait...";
		}
		
		var summary = this;
		function clickHandler(ev) {
			var node = ev.currentTarget;
			var serial = node.getAttribute('serial');
			let record = getBySerial(serial);
			summary.select(node, serial, record);
		}
		
		// for each field, make a <div with the current value in it
		// note crashes if no state
		let sr = this;
		let Field = (props) => <div className={'summary-field '+ props.name}>	
			{sr.state.record[props.name]}
		</div>;

		return <section className='summary' onClick={clickHandler} serial={this.state.serial} key={this.state.serial}>
			<Field name='company_name' />
			<Field name='recruiter_name' />
			<br clear="left" />
			
			<Field name='recruiter_email' />
			<Field name='recruiter_phone' />
			<Field name='agency' />

			<Field name='status' />
			<Field name='notes' />
		</section>;
	}
	
	// select this record, for editing, and populate the edit and json boxes
	select(node, serial, record) {
		$('div.App section.summary').removeClass('selected');
		$(node).addClass('selected');
		setSelectedRecord(serial, record);
	}
}

export let theGlobalList;

// list of all recruiters, for click selecting
class GlobalList extends Component {
	constructor(props) {
		super(props);
		this.state = {recs: []};
		theGlobalList = this;
	}
	
	render() {
		console.log("render GlobalList");
		
		// header cell with image and New button
		let titleCell = <section className='summary title-cell' key='title-cell'>
			<h1>
				Recruit-O-Dex
				&nbsp; &nbsp; &nbsp;
				<button type='button' onClick={startNewRec} >New<br/>Rec</button>
			</h1>
		</section>;

		// all the other cells with records in them
		let list = this.state.recs.map(function(rec, ix) {
			return <SummaryRec key={ix.toString()} serial={ix} record={rec}></SummaryRec>;
		});
		
		list.unshift(titleCell);
		return list;
	}
	
	// trigger a repaint, using this list of raw data from mongo
	update(newList) {
		this.setState({recs: newList});
	}
}




