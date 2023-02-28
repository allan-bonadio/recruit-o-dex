/*
** GlobalList -- the main display showing all records
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import SummaryRec, {decideItsAge} from './SummaryRec';
import {moGetAll} from '../Model';
import {rxStore, initialState} from '../reducer';
import {} from '../reducer';
import './GlobalList.scss';

/* eslint-disable no-self-assign  */

// refresher timing
const CHECKING_PERIOD = 3600 * 1000;
const MOUSE_INACTION_DELAY = 60 * 1000 ;
const PAGE_LOAD_AGE = 3 * 3600 * 1000;

const ONLY_RECENT_MONTHS = 2;
const ONLY_RECENT_TIME = ONLY_RECENT_MONTHS * (60000 * 60 * 24 * 30);

let traceMustBeAfter = false;

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
		name: 'Recruiter Name',
		compare: function(aRec, bRec) {
			let aStr = (aRec.recruiter_name || '').toLowerCase();
			let bStr = (bRec.recruiter_name || '').toLowerCase();
			if (aStr < bStr) return -1;
			if (aStr > bStr) return 1;
			return 0;
		},
	},
	{
		name: 'Latest Activity',
		compare: function(aRec, bRec) {
			let aAge = decideItsAge(aRec);
			let bAge = decideItsAge(bRec);
			if (aAge > bAge) return 1;
			if (aAge < bAge) return -1;
			return 0;
		},
	},

];




/* *************************************************************************** Global List */

// having trouble getting GlobalList to exist at startup
export function globalListUpdateList() {
	const gl = GlobalList.me;
	gl.updateList();
	//gl.updateList(gl.props.wholeList.collectionName);
}

// list of all recruiters, for click selecting
export class GlobalList extends Component {
	constructor(props) {
		super(props);
		GlobalList.me = this;

		console.info('constructed GlobalList');////
	}

	componentDidMount() {
		this.props.dispatch({type: 'CHANGE_SORT_CRITERION',
			newCriterion: localStorage.sortCriterion || 0});
// 		this.props.dispatch({type: 'CHANGE_COLLECTION_NAME',
// 			newName: localStorage.collectionName || 'recruiters'});
		this.setupRefresher();
	}


	// reducer handler
	static setWholeList(wholeList, action) {
		return {
			...wholeList,

			// all new data
			recs: action.recs,
		};
	}

	static resetSelection(editPanel, action) {
		return initialState.editPanel;
	}

	// called at various times to re-read the jobs table and display it again,
	// and to set the displayed collection.  Often the collection
	// name is as stored in the Store
	updateList() {
		let p = this.props;
		moGetAll((err, newRecs) => {
			if (err)
				p.dispatch({type: 'ERROR_GET_ALL', errorObj: err})
			else {
				let list = GlobalList.sortRecords(newRecs, p.wholeList.sortCriterion);

			 	// triggers a repaint, using this list of new raw data presumably from mongo
				p.dispatch({type: 'SET_WHOLE_LIST', recs: list});
				p.dispatch({type: 'RESET_SELECTION'});
			}
		});
	}

	static errorGetAll(wholeList, action) {
		console.error("ERROR_GET_ALL", action);
		// if mongo & server aren't started,
		// GlobalList is undefined and I can't even check for it!!
		return {
			...wholeList,
			globalListErrorObj: action.errorObj,
		};
	}

	// a click on the New Rec button to raise the control panel with a prospective rec
	clickNewRec=
	(ev) => this.props.dispatch({type: 'START_ADD_RECORD'});


	/* *********************************************************** refresher */
	// reload the page every so often so the colors don't misrepresent the ages

	// called once when page reloads
	setupRefresher() {
		GlobalList.pageLoaded = Date.now();
		setInterval(GlobalList.checkTheTime, CHECKING_PERIOD);
		GlobalList.latestMouseMove = GlobalList.pageLoaded = Date.now();
	}

	// called by several places
	static mouseMoved() {
		//console.info(`mouse moves  ⏰`);
		GlobalList.latestMouseMove = Date.now();
	}

	// called when we decide it's time to refresh
	static tryRefresh() {
		// not while control panel is up!!
		if (rxStore.getState().editPanel.editingRecord) {
			console.info(`not while control panel is up!!  ⏰`);
			return;
		}

		window.location = window.location;
	}

	// runs every hour or so
	static checkTheTime() {
		let now = Date.now();

		console.info(`checkTheTime  ⏰   at ${(new Date()).toLocaleTimeString()}, page load age: ${(now - GlobalList.pageLoaded)/1000}, mouse inaction: ${(now - GlobalList.latestMouseMove)/1000}`);

		if (now - GlobalList.pageLoaded > PAGE_LOAD_AGE &&
			now - GlobalList.latestMouseMove > MOUSE_INACTION_DELAY) {
			GlobalList.tryRefresh();
		}
	}

	/* *********************************************************** searching */
	// any input in the search box
	changeSearchQueryEv =
	(ev) => this.props.dispatch({type: 'CHANGE_SEARCH_QUERY', newQuery: ev.target.value});

	static changeSearchQuery(wholeList, action) {
		return {
			...wholeList,
			searchQuery: action.newQuery,
		};
	}

	/* *********************************************************** only recent */

	changeOnlyRecentEv =
	(ev) => this.props.dispatch({type: 'CHANGE_ONLY_RECENT', newOnlyRecent: ev.target.checked});


	static changeOnlyRecent(wholeList, action) {
		return {
			...wholeList,
			onlyRecent: action.newOnlyRecent,
		};
	}


	/* *********************************************************** sorting */
	static sortRecords(recs, criterion) {
		return [...recs].sort(sorters[criterion].compare);
	}

	// any change in the menu, direct event handler
	changeSortCriterionEv =
	(ev) => this.props.dispatch({type: 'CHANGE_SORT_CRITERION',
			newCriterion: ev.target.value});

	// same, called from the resolver
	static changeSortCriterion(wholeList, action) {
		// do the sort
		let newRecs = GlobalList.sortRecords(wholeList.recs,
			action.newCriterion);

		localStorage.sortCriterion = action.newCriterion;

		// now set the state that way
		return {
			...wholeList,
			sortCriterion: action.newCriterion,
			recs: newRecs,
		};
	}

	/* *********************************************************** which collection */
//	changeCollectionNameEv =
// (ev) => {
// 		this.props.dispatch({type: 'CHANGE_COLLECTION_NAME',
// 			newName: ev.target.value});
//	}

	// same, called from the resolver
// 	static changeCollectionName(wholeList, action) {
// 		// re-retrieve with different collection
//
// 		GlobalList.me.updateList(action.newName);
//
// 		localStorage.collectionName = action.newName;
//
// 		return {
// 			...wholeList,
// 			collectionName: action.newName,
// 			////recs: newRecs,
// 		};
// 	}

	/* *********************************************************** rendering */

	// header cell with image and New button
	renderTitleCell() {
		let p = this.props;

		// fills in the menu.  Name is displayed, value is just a serial 0, 1, 2...
		let sortOptions = sorters.map((s, ix) => <option key={ix} value={ix}>{s.name}</option>);
		///console.log("sort options", sortOptions.debug());

		return <section className='summary title-cell' key='title-cell'>
			<h1>Recruit-O-Dex</h1>
			<button type='button' className='add' onClick={this.clickNewRec} >New Rec</button>
			<aside>
				<p>
					<big><span aria-label='search' role='img'>🔍</span></big>
					<input className='search-box' placeholder='search (not yet impl)'
						onChange={this.changeSearchQueryEv} value={p.searchQuery} />
				</p>
				<div>
					<label>
						<input type='checkbox' className='only-recent' aria-label='Only Recent'
							onChange={this.changeOnlyRecentEv} checked={p.wholeList.onlyRecent} />
						&nbsp; Only Recent ({ONLY_RECENT_MONTHS} months)
					</label>
				</div>
				<p>
					sort:&nbsp;
					<select id='sort-criterion' onChange={this.changeSortCriterionEv}
						value={localStorage.sortCriterion} >
						{sortOptions}
					</select>
				</p>
				<p>
{/*					database:&nbsp;
					<select id='database-name' onChange={this.changeCollectionNameEv}
						value={localStorage.collectionName || 'recruiters'} >
						<option key='recruiters' value='recruiters'>recruiters</option>
						<option key='rec2020' value='rec2020'>rec2020</option>

					</select>
*/}

				</p>

			</aside>
		</section>;
	}

	// the list of recs, or just a big message
	renderBodyCells() {
		let p = this.props;
		if (p.wholeList.globalListErrorObj) {
			// no cells, just an error message
			return [<section className='error' key='err' >
				{p.wholeList.globalListErrorObj.message}
			</section>];
		}
		else {
			let mustBeAfter = p.wholeList.onlyRecent
				? (new Date(Date.now() - ONLY_RECENT_TIME)).toISOString().replace(/T/, '.')
				: '1970-01-01.01:01:01.001Z';

			if (traceMustBeAfter) {
				console.info(`the mustBeAfter = ${mustBeAfter}, whole list length is `, p.wholeList.recs.length)

				console.info(`\nwhole list::::::::::::::::::::::::::::::::::: ${p.wholeList.recs.length} total`)
				p.wholeList.recs
				.forEach((rec, i) => console.info(`${i} co name: ${rec.company_name} updated{} ${(rec.updated || rec.created)}`))
				let llist = p.wholeList.recs
				.filter(rec => {
					console.info(`rec.updated=${rec.updated} || rec.created=${rec.created}) > mustBeAfter=${mustBeAfter}`);
					let res = (rec.updated || rec.created) > mustBeAfter;
					console.info(`rec.updated || rec.created=${rec.updated || rec.created}   res=${res}`);
					return res;
				});

				console.info(`\njust selected ::::::::::::::::::::::::::::::::::: ${llist.length}`)
				llist.forEach((rec, i) => console.info(`${i} co name: ${rec.company_name} updated: ${(rec.updated || rec.created)}`))
			}

			// all the other cells with records in them
			return p.wholeList.recs
			.filter(rec => (rec.updated || rec.created) > mustBeAfter)
			.map(function(rec, ix) {
				return <SummaryRec key={ix.toString()} serial={ix}
					record={rec} selectedSerial={p.selectedSerial} ></SummaryRec>;
			});
		}
	}

	// returns a naked array of all the cells
	render() {
		//console.info('rendering GlobalList');
		let titleCell = this.renderTitleCell();
		let list = this.renderBodyCells();
		//console.info(`renderBodyCells returned length = ${list.length}`)

		// stick in the header cell in the upper left with the photo
		list.unshift(titleCell);

		return list;
	}

}

GlobalList.propTypes = {
	wholeList: PropTypes.object,
	selectedSerial: PropTypes.number,
	dispatch: PropTypes.func,
	onlyRecent: PropTypes.bool,
};

function mapStateToProps(state) {
	//console.info("MS2P global list");
	if (state) {
		return {
			wholeList: state.wholeList,
			selectedSerial: state.editPanel.selectedSerial,
		};
	}
	else {
		// during startup, no state in place yet so fake it
		return {
			wholeList:  {
				recs: [],
				globalListErrorObj: null,
				searchQuery: '',
				sortCriterion: 0,
				//collectionName: 'recruiters'
			},
			selectedSerial: -1,
		};
	}
}

export default connect(mapStateToProps)(GlobalList);

