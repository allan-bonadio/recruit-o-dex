/*
** App -- the main code for the RecruitMan page
**
** Copyright (C) 2017 Allan Bonadio   All Rights Reserved
*/

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from "jquery";
import _ from "lodash";
import {ControlPanel, theControlPanel, theRecForm, theJsonRec, CrudCurtain, selectedSerial, setSelectedRecord, startNewRec} from './ControlPanel'
import {getBySerial, allRecruiters} from './Model';



// let curRecruiter = {
// 	// just for testing
// 	"_id" : "59c1410e23f647bb25a33d6d",	  // ObjectId("59c1410e23f647bb25a33d6d"),
// 	"recruiter_name" : "David Sibrian",
// 	"recruiter_email" : "dsibrian@jivaroinc.com",
// 	"recruiter_phone" : "(408) 733-5082",
// 	"recruiter_cell" : "",
// 	"agency" : "Jivaro",
// 	"company_name" : "SixUp",
// 	"first_contact" : "9/18/17",
// 	"status" : "active",
// 	"notes" : " don't know co name."
// };
// 
// 

class App extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header" style={{display: 'none'}}>
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Welcome to React</h1>
				</header>
				<Main></Main>
				<CrudCurtain></CrudCurtain>
			</div>
		);
	}
}
export default App;


class Main extends Component {
	constructor() {
		super();
		//MainInstance = this;
// 		this.mouseDown = this.mouseDown.bind(this);
// 		this.mouseMove = this.mouseMove.bind(this);
// 		this.mouseUp = this.mouseUp.bind(this);
// 		
// 		this.state = {cPanelX: 100, cPanelY: 200};  // for doing through react
// 		this.cPanelX = 100; this.cPanelY = 200;  // for doing it quickly
	}
	
	render() {
		// append this to the control panel to do it through react.  but it's slower.
		// style={{left: this.state.cPanelX +'px', top: this.state.cPanelY +'px'}}
		return <div>
			<ControlPanel></ControlPanel>
			<GlobalList></GlobalList>
		</div>;
	}
	
}



/********************************************************************** Global List */

// these are the actual React components
export var allSummaries = [];

// each recruiter/job in the Global List
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
		let list = allRecruiters.map(function(rec, ix) {
			return <SummaryRec key={ix.toString()} serial={ix} record={rec}></SummaryRec>;
		});
		
		list.unshift(titleCell);
		return list;
	}
}




