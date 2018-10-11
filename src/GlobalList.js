/*
** GlobalList -- the main display showing all records 
*/
import React, {Component} from 'react';
import {connect} from 'react-redux';

import SummaryRec from './SummaryRec';
import {moGetAll} from './Model';





/* *************************************************************************** sorters */

// one of these for each sort setting.  name in menu; comparison function used in actual sort
let sorters = [
	{
		name: 'Company Name',
		compare: function(aRec, bRec) {
			let aStr = (aRec.company_name || '').toLowerCase();
			let bStr = (bRec.company_name || '').toLowerCase();
			if (aStr < bStr) return -1;
			if (aStr > bStr) return 1;
			return 0;
		},
	},
	{
		name: 'Latest Activity',
		compare: function(aRec, bRec) {
			// haha!  ISO dates sort alphanumerically.  Older records don't have updated but they should all have created date
			let aDate = aRec.updated || aRec.created || '2017-01-01';
			let bDate = aRec.updated || aRec.created || '2017-01-01';
			if (aDate < bDate) return -1;
			if (aDate > bDate) return 1;
			return 0;
		},	
	},

];




/* *************************************************************************** Global List */

// having trouble getting GlobalList to exist at startup
export function globalListUpdateList() {
	GlobalList.me.updateList();
}

// list of all recruiters, for click selecting
export class GlobalList extends Component {
	constructor(props) {
		super(props);
		GlobalList.me = this;
		
		this.clickNewRec = this.clickNewRec.bind(this);
		this.changeSearchQuery = this.changeSearchQuery.bind(this);
		this.changeSortCriterion = this.changeSortCriterion.bind(this);
	}
	
	// header cell with image and New button
	renderTitleCell() {
		let p = this.props;
		
		// fills in the menu
		let sortOptions = sorters.map((s, ix) => <option key={ix} value={ix}>{s.name}</option>);
		///console.log("sort options", sortOptions.debug());
		
		return <section className='summary title-cell' key='title-cell'>
			<h1>Recruit-O-Dex</h1>
			<button type='button' className='add' onClick={this.clickNewRec} >New Rec</button>
			<aside>
				<big><span aria-label='search' role='img'>🔍</span></big>
				<input className='search-box' placeholder='search (not yet impl)'
					onChange={this.changeSearchQuery} defaultValue={p.searchQuery} />
				<br />
				sort:&nbsp;
				<select id='sort-criterion' onChange={this.changeSortCriterion} >
					{sortOptions}
				</select>
			</aside>
		</section>;
	}
	
	// the list of recs, or just a big message
	renderBodyCells() {
		let p = this.props;
		if (p.globalListErrorObj) {
			// no cells, just an error message
			return [<section className='error' key='err' >
				{p.globalListErrorObj.message}
			</section>];
		}
		else {
			// all the other cells with records in them
			return p.recs.map(function(rec, ix) {
				return <SummaryRec key={ix.toString()} serial={ix} 
					record={rec} selected={p.selectedSerial == ix} ></SummaryRec>;
			});
		}
	}
	
	// returns a naked array of all the cells
	render() {
		let titleCell = this.renderTitleCell();
		let list = this.renderBodyCells();
		
		// stick in the header cell in the upper left with the photo
		list.unshift(titleCell);

		return list;
	}
	
	// Call this when you retrieve all the data, as when the app starts.
	// triggers a repaint, using this list of new raw data presumably from mongo
	update(newList) {
		this.props.dispatch({type: 'SET_WHOLE_LIST', recs: newList})
	}

	// called at various times to re-read the jobs table and display it again
	updateList() {
		let p = this.props;
		moGetAll((err, newRecs) => {
			if (err)
				p.dispatch({type: 'ERROR_GET_ALL', errorObj: err})
			else
				this.update(newRecs)
		});
	}
	
	// a click on the New Rec button to raise the control panel with a prospective rec
	clickNewRec(ev) {
		this.props.dispatch({type: 'START_ADD_RECORD'})
	}

	// any input in the search box
	changeSearchQuery(ev) {
		this.props.dispatch({type: 'CHANGE_SEARCH_QUERY', newQuery: ev.target.value});
	}

	static changeSearchQuery(state, action) {
		return {
			...state,
			searchQuery: action.newQuery,
		};
	}

	// any change in the menu
	changeSortCriterion(ev) {
		this.props.dispatch({type: 'CHANGE_SORT_CRITERION', newCriterion: ev.target.value});
	}
	
	static changeSortCriterion(state, action) {
		// do the sort
		let newRecs = [...state.recs].sort(sorters[action.newCriterion].compare);
		
		// now set the state that way
		return {
			...state,
			sortCriterion: action.newCriterion,
			recs: newRecs,
		};
	}

}

function mapStateToProps(state) {
////	console.log("|| GlobalList#mapStateToProps: state=", state);
	if (state) {
		return {
			recs: state.recs, 
			selectedSerial: state.selection.selectedSerial,
			globalListErrorObj: state.globalListErrorObj,
			searchQuery: state.searchQuery, 
		};
	}
	else {
		return {recs: [], selectedSerial: -1, globalListErrorObj: null, searchQuery: ''};
	}
}

export default connect(mapStateToProps)(GlobalList);

