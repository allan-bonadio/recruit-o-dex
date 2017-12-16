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
import {ControlPanel, theRecForm, theJsonRec, CrudCurtain, selectedSerial, setSelectedRecord} from './ControlPanel'
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
	
	/****************************************************** drag around cpanel */
// 
// 	// click down on the control panel - so user can drag it around
// 	mouseDown(ev) {
// 		// a click on the panel, not in its text blanks
// 		let nn = ev.target.nodeName;
// 		if (nn != 'INPUT' && nn != 'TEXTAREA') {
// 			this.lastX = ev.clientX;
// 			this.lastY = ev.clientY;
// 		
// 			$(document.body).on('mousemove', this.mouseMove).on('mouseup mouseleave', this.mouseUp);
// 
// 			//ev.preventDefault();
// 			//ev.stopPropagation();
// 		}
// 	}
// 	
// 	mouseMove(ev) {
// 		// through react
// // 		let o = this.state;
// // 		this.setState({
// // 			cPanelX: o.cPanelX + ev.clientX - this.lastX, 
// // 			cPanelY: o.cPanelY + ev.clientY - this.lastY,
// // 		});
// 
// 		// through normal means
// 		this.cPanelX += ev.clientX - this.lastX;
// 		this.cPanelY += ev.clientY - this.lastY;
// 		$('#control-panel').css({left: this.cPanelX + 'px', top: this.cPanelY + 'px'})
// 
// 		// ready for next nudge
// 		this.lastX = ev.clientX;
// 		this.lastY = ev.clientY;
// 		
// 		ev.stopPropagation();
// 	}
// 	
// 	mouseUp(ev) {
// 		this.mouseMove(ev);
// 		
// 		// turn off event handlers and that'll disable dragging.  That's all, no cleanup needed.
// 		$(document.body).off('mousemove', this.mouseMove).off('mouseup mouseleave', this.mouseUp);
// 	}
// 
}



/********************************************************************** Global List */

// these are the actual React components
export var allSummaries = [];

// try this, SummaryRec as a functional component
function SummaryRec2(props) {
		console.log("render SummaryRec2");

}

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
		console.log("render SummaryRec");

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
		let Field = (props) => <div className={'summary-field '+ props.name}>{sr.state.record[props.name]}</div>;

		return <section className='summary' onClick={clickHandler} serial={this.state.serial}>
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

// list of all recruiters, for click selecting
class GlobalList extends Component {
	render() {
		console.log("render GlobalList");
		return  allRecruiters.map(function(rec, ix) {
			return <SummaryRec key={ix.toString()} serial={ix} record={rec}></SummaryRec>;
		});
	}
}




