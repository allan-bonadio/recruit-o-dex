#!/bin/bash
# backs up your recruiter data.  The way I like it.  Use this for a cron job.
cd `dirname $0`

# default creates dump/jobs/twofiles
/dvl/mongo/mongodb-osx-x86_64-3.4.6/bin/mongodump \
	--db=jobs --collection=recruiters

# i also want a text json copy.  This isn't really json, it's json for each 
# document, separated by newlines.  
# Must convert it if you want to make it really json: \n => , wrap with [ ]
# but I think mongoimport will read this.
/dvl/mongo/mongodb-osx-x86_64-3.4.6/bin/mongoexport \
	--db=jobs --collection=recruiters --out=dump/jobs/recruiters.json

# make sure this works!
mkdir -pv ./dump ./archives

# so label and store them
d=`date +%Y-%m-%d,%H.%M`
mv ./dump/jobs ./archives/jobs$d

# now delete an old one.  Randomly chosen.
# lineNum=$(( $RANDOM * 20 / 32768 + 10 ))
# fileName=` ls -1t archives | tail -n +$lineNum | head -1 `
# /bin/rm -rf archives/$fileName



