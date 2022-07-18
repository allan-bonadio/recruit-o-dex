/*
** Model -- ajax calls for RecruitMan page
**
** Copyright (C) 2017-2019 Allan Bonadio   All Rights Reserved
*/

// same place we get the website from, just a different port
const RODEX_SERVER = window.location.protocol +'//'+ window.location.hostname +':5555';

export let simulateErrors = {};

// download the whole thing.
// Call the callback either like (null, allData) or (errorObj, null) depending on success
export function moGetAll(callback) {
	if (simulateErrors.getError) {
		setTimeout(() => callback(simulateErrors.getError, null), 100);
		return;
	}

	console.info(`------------------- RODEX_SERVER +'/getall`, RODEX_SERVER +'/getall);
	fetch(RODEX_SERVER +'/getall', {})
	.then(resp => resp.json(),
		err => {
			err.message = "loading from database: "+ err.message;
			console.error(err);
			callback(err, null);
		})
	.then(
		list => {
			// {error: "MongoError: blah blah"} is what we get back if an error on the server.
			if (! list) {
				callback({message: "loading from database: No data retrieved at all"}, null);
			}
			else if (! list.error) {
				callback(null, list);
			}
			else {
				console.error("Server Error loading from database: ", list.error);
				callback(list.error, null);
			}
		},
		err => {
			err.message = "reading json from from server: "+ err.message;
			// special case: cors errors - they give us no clue as to what went wrong in js
			console.error("Protocol Error reading from server: ", err);
			callback(err, null);
		}
	);
}

// put one to update an existing record.
export function moPutOne(record, callback) {
	if (simulateErrors.putError) {
		setTimeout(() => callback(simulateErrors.putError, 100));
		return;
	}

	let opts = {
		method: 'PUT',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(record),
    };

	fetch(RODEX_SERVER +'/one/'+ record._id, opts)
	.then(
		resp => {
			if (! resp.ok || 204 != resp.status)  // eslint-disable-line
				callback(new Error("Error updating: "+ resp.status +': '+ resp.statusText));
			else
				callback(null);  // success
		},
		err => {
			err.message = "updating database: "+ err.message;
			// special case: cors errors - they give us no clue as to what went wrong in js
			console.error("Error updating database: ", err);
			callback(err);
		}
	);

}

// a new one: add it in to the collection
export function moPostOne(record, callback) {
	console.log("moPostOne(%s, %s)", record.recruiter_name, callback.name);
	if (simulateErrors.postError) {
		setTimeout(() => callback(simulateErrors.postError, 100));
		return;
	}

	let opts = {
		method: 'POST',
        headers: {'Content-Type': 'application/json; charset=utf-8'},
        body: JSON.stringify(record),
    };

	console.log("moPostOne fetch (%s, %s)", record.recruiter_name, callback.name);
	fetch(RODEX_SERVER +'/one', opts)
	.then(
		resp => {
			console.log("moPostOne resp ok, status=", resp.ok, resp.status);
			if (! resp.ok || 201 != resp.status)  // eslint-disable-line
				callback(new Error("Error updating: "+ resp.status +': '+ resp.statusText));
			else
				callback(null);  // success
		},
		err => {
			err.message = "inserting into database: "+ err.message;
			// special case: cors errors - they give us no clue as to what went wrong in js
			console.error("inserting into database: ", err);
			callback(err);
		}
	);
}


// delete an existing record
export function moDeleteOne(record, callback) {
	throw new Error("never implemented");////

////	$.ajax({
////		url: RODEX_SERVER +'/one/'+ record._id,
////		method: 'delete',
////		contentType: 'application/json',
////		success: function(data, status, jqxhr) {
////			callback(null, jqxhr.status);
////		},
////		error: function(jqxhr, status, message) {
////			console.error("Error deleting doc: %s %s %s", jqxhr.status, status, message);
////
////			var er = createErrorObj("deleting a document", status, message, jqxhr);
////			callback(er, jqxhr.status ||  jqxhr.state());
////		},
////	});
}



