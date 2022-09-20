/*
** BoxForm -- any form that's just one big text box
**
** Copyright (C) 2017-2022 Allan Bonadio   All Rights Reserved
*/
/* eslint-disable eqeqeq, default-case */

import React from 'react';
import PropTypes from 'prop-types';

import RecField from './RecField';


// a single text area, kindof like a wrapper for RecField
export function BoxForm(props) {
	let p = props;
	let rec = p.rec;
	if (! rec)
		return [];

	return (
		<section className={`edit-col edit-form box-${p.fieldName}`}
				onChange={RecField.typeInBlank} onBlur={RecField.deFocusBlank}>
			<RecField element='textarea' fieldName={p.fieldName}   label={p.label}
				 placeholder={p.placeholder} rec={rec} />
		</section>);
}

BoxForm.propTypes = {
	fieldName: PropTypes.string.isRequired,
	label: PropTypes.string,
	placeholder: PropTypes.string,
	rec: PropTypes.object.isRequired,
};
BoxForm.defaultProps = {
};

export default BoxForm;
