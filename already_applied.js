
NO LONGER USED.  I guess I should delete it...  this is mongo v3 anyway.
july 2022



#!/usr/bin/env node
// already_applied - generate the alreadyappliedto.txt file");
// generates it out stdout
// this file will be obsolete by Jan 2018

var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://localhost/jobs";
MongoClient.connect(uri, function(err, db) {
	if (err) {
		console.error(err);
		process.exit(9);
	}

	// find, in the recruiters collection, all records, but just take the company names, sort, and then...
	var col = db.collection('recruiters');
	col.find({}, {company_name: 1}).sort({company_name:1}).toArray(function(err, docs) {
		if (err) {
			console.error(err);
			process.exit(3);
		}

		// docs is all of them now print on stdout
		//console.log(docs);
		docs.forEach(function(rec) {
			if (rec.company_name)
				console.log(rec.company_name);
		});
	});

	db.close();
});
