#!/bin/bash

# backs up your recruiter data.  The way I like it.  Use this for a cron job.
# maybe like this: 47 11,18 * * 1-5 /opt/dvl/recruit-o-dex/backups/backup.sh
# '--onceTodayOnly' will make it quit if there's already an archive today.

cd `dirname $0`

myPath=/opt/dvl/mongo/mongodb-database-tools-macos-x86_64-100.6.0/bin/

# canceled always
# if [ "$1" == '--onceTodayOnly' ]
# then
# 	today=`date +%Y-%m-%d`
# 	hits=./archives/Jobs$today*
# 	if [ -n "$hits" ]
# 	then
# 		echo "Already did it today, quitting."
# 		exit 0
# 	fi
# fi

# if the database has no changes since the last BU archive, skip it
if [ /usr/local/var/mongodb -ot /tibusiness/recruit-o-dex/backups/archives ]
then
	# OR, no output means no email, right? someday when I'm more confident about it
	echo "backup not needed: " `date '+%F %R'`
	ls -ltT /usr/local/var/mongodb  /tibusiness/recruit-o-dex/backups/archives
	exit 0
fi


echo "Rodex backup needed.  now backing up..." `date '+%F %R'`


if ! ps gax | grep '/bin\/mongod'
then
	echo "MongoDB server seems to be down.  Skipping backup."
	exit 0
fi




# make sure this works!
mkdir -pv ./dump ./archives

# default creates dump/Jobs/recruiters.bson and recruiters.metadata.json
/opt/dvl/mongo/mongoTools/mongodump \
	--db=Jobs --collection=recruiters \
 || echo "💔💔💔 😱😱😱  🧨🧨🧨   Error during mongodump   ‼️‼‼ ️💣💣💣 🔥🔥🔥"


# i also want a text json copy.  This isn't really json, it's json for each
# document, separated by newlines.
# Must convert it if you want to make it really json: \n => , wrap with [ ]
# but I think mongoimport will read this.
echo •••••••••••••••••••••••••••••••••••••••••••••••••• mongoexport
/opt/dvl/mongo/mongoTools/mongoexport \
	--verbose \
	--db=Jobs --collection=recruiters --out=dump/Jobs/recruiters.json \
 || echo "💔💔💔 😱😱😱  🧨🧨🧨   Error during mongoexport   ‼️‼‼ ️💣💣💣 🔥🔥🔥"


# so label and store them
d=`date +%Y-%m-%d,%H.%M`
mv ./dump/Jobs ./archives/Jobs$d

# so allan can read it on email
ls -l@a archives/Jobs$d

# let allan see it cuz he's almost certainly hunting and
# needs to search recent rodex data
#NOT Version Specific open -a BBEdit14 archives/Jobs$d/recruiters.json
/usr/local/bin/bbedit --new-window archives/Jobs$d/recruiters.json

# now delete an old one.  Randomly chosen, but keep around the most recent 2.
# NO NO NO I just deleted my whole archive directory. cuz $fileName was empty.
#lineNum=$(( $RANDOM * 8 / 32768 + 2 ))
#fileName=` ls -1t archives | tail -n +$lineNum | head -1 `
#/bin/rm -rfv archives/$fileName

# tell Allan.  He'll get rid of old ones ... someday.
open -a "Google Chrome" backedUp.html

