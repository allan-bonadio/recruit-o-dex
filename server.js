// the mongo interface

/**************************************************** http interface */
let express = require('express');
let app = express();
let portNum = 5555;
let mongoUrl = "mongodb://localhost/jobs";


// this parses our json.  and it knows where to get the raw text.  recommended plugin.
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Cross Origin Request System
let cors = require('cors');
app.use(cors())
app.options('*', cors())


app.get('/getall', function (req, res) {
	getAllRecords(function(records) {
		res.json(records);  // an array
	});
})

// pass it a body on a PUT or POST request.  returns true if it failed.
function isBodyBad(req, res) {
	if (! req.body) {
		res.status(415).send("no body sent");
		console.error(">> isBodyBad no body sent");
		return true;
	}
	var noFields = true;
	for (var k in req.body)
		noFields = false;
	if (noFields) {
		res.status(422).send("no data in body");
		console.error(">> isBodyBad no data in body");
		return true;
	}
	console.log(">> isBodyBad ... OK!  it's not.");
	return false;  // ok
}


// put.  update.  
app.put('/one/:id', function (req, res) {
	console.log("|| app.put /one: req started");    // too much text     , req);
	console.log("|| %s %s %s", req.method, req.hostname, req.path);
	console.log("    req.params: %j", req.params);
	console.log("    req.body: %j", req.body);
	//console.log("    req.headers: %j", req.headers);
	//console.log("|| the whole req: ", req, '------');
	
	if (isBodyBad(req, res))
		return;
	
	delete req.body._id;
	saveOneRecord(req.body, req.params.id, function(results) {
		console.log("    saveOneRecord() gave me results %j", results);
		res.sendStatus(204);
	});
})

// add.  insert.  post.  
app.post('/one', function (req, res) {
	console.log("|| app.post /one: req started");    // too much text     , req);
	console.log("|| %s %s %s", req.method, req.hostname, req.path);
	console.log("    req.params: %j", req.params);
	console.log("    req.body: %j", req.body);
	//console.log("    req.headers: %j", req.headers);
	
	if (isBodyBad(req, res))
		return;
	
	addOneRecord(req.body, function(overall, results) {
		console.log("    addOneRecord() gave me results ‹%s› %j", overall, results);
		res.sendStatus(201);
	});
})




app.listen(portNum, function() {
	console.info("Server now accepting connections on http://localhost:"+ portNum +
		'\n\n\n');
});






/**************************************************** mongo interface */

var ObjectID = require('mongodb').ObjectID;

// var idString = '4e4e1638c85e808431000003';
// collection.findOne({_id: new ObjectID(idString)}, console.log)  // ok
// collection.findOne({_id: idString}, console.log)  // wrong! callback gets undefined





var MongoClient = require('mongodb').MongoClient;

function getAllRecords(callback) {
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) {
			console.error(err);
			process.exit(9);
		}
	
		var col = db.collection('recruiters');
		col.find({}).sort({company_name:1}).toArray(function(err, docs) {
			if (err) {
				console.error(err);
				process.exit(3);
			}
	
			callback(docs);
		});
	
		db.close();
	});
}


function saveOneRecord(record, id, callback) {
	var debug = false;
	if (debug) {
		console.log("saveOneRecord: pretending to save this record %j", record);
		setTimeout(function() {
			callback({});
		}, 300);
		return;
	}
	
// 	if (record._id != id)
// 		console.error("@@@ record ids differ, record.id=%s, while id=%s on record %j", record._id, id, record);
	console.log("\n\nsaveOneRecord: actually saving this record %j", record);
	
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) {
			console.error(err);
			process.exit(9);
		}

		// the collection we do queries against
		var col = db.collection('recruiters');
		
		// it took me half a day to write the following line of code cuz it's nowhere in the docs
		//var query = {recruiter_name: record.recruiter_name};
		//var query =  {_id: id};  // selects which one
		//var query =  {_id: ObjectId(id)};
		//var query =  {'_id.str': id};
		var query =  {_id: new ObjectID(id)};
		// as in db.getCollection('recruiters').find({"_id" : ObjectId("5a0e0e81a45ced6059aa145d")})
	
		console.log("|| Gonna search for same id="+ record._id +".");
		col.find(
			query
		).toArray(function(err, docs) {
			if (err) {
				console.error(err);
				process.exit(3);
			}
	
			console.log("|| saveOneRecord: RETRIEVED %d records, first record %j", docs.length, docs);
		});


		console.log("|| Gonna updateOne on company_name="+ record.company_name +".");
		col.updateOne(
			query,
			{$set: record}, // what to change it to
			function(err, result) {  // when done
				if (err) {
					console.error(err);
					process.exit(5);
				}
	
				callback(result);
			});

		db.close();
	});
}

function addOneRecord(record, callback) {
	console.log("\n\n|| addOneRecord: actually saving this record %j", record);
	
	MongoClient.connect(mongoUrl, function(err, db) {
		if (err) {
			console.error(err);
			process.exit(19);
		}

		// the collection we do queries against
		var col = db.collection('recruiters');
	

		console.log("|| Gonna addOne on company_name="+ record.company_name +".");
		col.insertOne(
			record,
			function(err, result) {  // when done
				if (err) {
					console.error(err);
					process.exit(5);
				}
	
				callback('success', result);
			});

		db.close();
	});
}


