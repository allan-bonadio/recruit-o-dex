/*
** GlobalList -- the main display showing all records 
*/
import React, {Component} from 'react';
import {connect} from 'react-redux';

////import {startAddRecord} from './ControlPanel'
import SummaryRec from './SummaryRec';
//import {store, getStateSelection} from './Reducer';

export let theGlobalList;

// this is not the right way to pass this variable but I don't kno w what else to do
////export var thisSerial;



// list of all recruiters, for click selecting
class GlobalList extends Component {
	constructor(props) {
		super(props);
		////this.state = {recs: []};
		theGlobalList = this;
		
		this.clickNewRec = this.clickNewRec.bind(this);
	}
	
	render() {
		////console.log("render GlobalList");
		let p = this.props;
		
		// header cell with image and New button
		let titleCell = <section className='summary title-cell' key='title-cell'>
			<h1>
				Recruit-O-Dex
				&nbsp; &nbsp; &nbsp;
				<button type='button' onClick={this.clickNewRec} >New<br/>Rec</button>
			</h1>
		</section>;

		// all the other cells with records in them
		//let list = store.getState().recs.map(function(rec, ix) {
		let list = p.recs.map(function(rec, ix) {
			////thisSerial = ix;
			return <SummaryRec key={ix.toString()} serial={ix} 
				record={rec} selected={p.selectedSerial == ix} ></SummaryRec>;
		});
		
		// stick in the header cell in the upper left with the photo
		list.unshift(titleCell);
		
		return list;
	}
	
	// Call this when you retrieve all the data, as when the app starts.
	// triggers a repaint, using this list of raw data from mongo
	update(newList) {
		this.props.dispatch({type: 'SET_WHOLE_LIST', recs: newList})
		////this.setState({recs: newList});
	}
	
	// a click on the New Rec button to raise the control panel with a prospective rec
	clickNewRec(ev) {
		this.props.dispatch({type: 'START_ADD_RECORD'})
	}
}

export function setGlobalData(recs) {
	theGlobalList.update(recs);
}

function mapStateToProps(state) {
	console.log("|| GlobalList#mapStateToProps: state=", state);
	return {
		recs: (state ? state.recs : []), 
		selectedSerial: state ? state.selection.selectedSerial : -1,
	};
}

export default connect(mapStateToProps)(GlobalList);

