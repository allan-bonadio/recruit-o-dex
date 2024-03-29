/*
** SummaryRec -- per-rec summary box, displayed in yellow, seen in global list
*/
/* eslint-disable eqeqeq, default-case */

import React, {Component} from 'react';
import {rxStore} from '../reducer';

import GlobalList from './GlobalList';

// return an integer that's a mix of creation and update age
export function decideItsAge(rec) {
	// Older records don't have updated but they should all have created date
	let itsAge = (new Date(rec.created.replace('.','T'))).getTime();
	if (rec.updated)
		itsAge = (itsAge + 2 * (new Date(rec.updated.replace('.','T'))).getTime()) / 3;
	itsAge = Date.now() - itsAge;
	return itsAge / 86400000;  // to days
}

// each recruiter/job cell, shown in the Global List, the front page.
// This is NOT a redux component because I need multiple ones of them.
export class SummaryRec extends Component {
	constructor(props) {
		super(props);
		this.mouseDownEv = this.mouseDownEv.bind(this);
		this.mouseMoveEv = this.mouseMoveEv.bind(this);
		this.mouseUpEv = this.mouseUpEv.bind(this);
		//console.info('constructed SummaryRec');
	}

	render() {
		//console.info('rendering SummaryRec');

		// for each field, make a <div with the current value in it
		let Field = (props) => {
			//console.info('executing Field');

			return <div className={'summary-field '+ props.name + (props.exCls ?? '')}>
						{props.record ? props.record[props.name] : ''}
					</div>;
		}

		let r = this.props.record;

		// bg color based on date.  Average created & updated if possible.
		let itsAge = decideItsAge(r);

		let ageClass = itsAge > 90 ? 'quarterOld'
			: itsAge > 30 ? 'monthOld'
				: itsAge > 7 ? 'weekOld'
					: itsAge > 1 ? 'dayOld'
						: itsAge > .08 ? 'hoursOld' : 'minutesOld';

		let company_long_name = r.company_name?.length > 20 ? ' long_name' : '';
		let recruiter_long_name = r.recruiter_name?.length > 20 ? ' long_name' : '';

		return <section
				className={'summary '+
					(this.props.selectedSerial == this.props.serial
						? 'selected '
						: '') +
					ageClass}
				onMouseDown={this.mouseDownEv} onMouseMove={this.mouseMoveEv}
				onMouseUp={this.mouseUpEv} onMouseLeave={this.mouseUpEv}
				serial={this.props.serial} key={this.props.record._id} >
			<Field record={r} name='company_name' exCls={company_long_name} />
			<Field record={r} name='recruiter_name' exCls={recruiter_long_name} />
			<br clear="left" />

			<Field record={r} name='recruiter_email' />
			<Field record={r} name='recruiter_phone' />
			<Field record={r} name='agency' />

			<Field record={r} name='status' />
			<Field record={r} name='notes' />
		</section>;
	}

	/* ******************************************************** clicking */
	// distinguish between a click and a drag.  If there's any moving, it's a drag.
	// Then, ignore the drags; probably user selecting text.

	// remember where
	mouseDownEv(ev) {
		this.down = {x: ev.clientX, y: ev.clientY};
	}

	// see if it moved
	mouseMoveEv(ev) {
		GlobalList.mouseMoved();

		if (!this.down)
			return;
		if (Math.abs(this.down.x - ev.clientX) + Math.abs(this.down.y - ev.clientY) > 5)
			this.down = null;
	}

	// start edit only if no movement
	mouseUpEv(ev) {
		if (!this.down)
			return;

		// yes this was a click - open the edit panel
		//debugger;
		this.down = null;
		rxStore.dispatch({
			type: 'START_EDIT_RECORD',
			serial: this.props.serial,
			record: this.props.record,
		});
	}
}

export default SummaryRec;

