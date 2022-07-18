#!/bin/bash

# backs up your recruiter data.  The way I like it.  Use this for a cron job.
# maybe like this: 47 11,18 * * 1-5 /dvl/recruit-o-dex/backups/backup.sh
# '--onceTodayOnly' will make it quit if there's already an archive today.

cd `dirname $0`

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

# if the database has no changes since the last BU archive, bag it
if [ /usr/local/var/mongodb -ot /tibusiness/recruit-o-dex/backups/archives ]
then
	# OR, no output means no email, right?
	echo "backup not needed: " `date '+%F %R'`
	ls -lt /usr/local/var/mongodb  /tibusiness/recruit-o-dex/backups/archives
	exit 0
fi


echo "backup needed.  now backing up..." `date`

# default creates dump/Jobs/twofiles
/usr/local/bin/mongodump \
	--db=Jobs --collection=recruiters

# i also want a text json copy.  This isn't really json, it's json for each
# document, separated by newlines.
# Must convert it if you want to make it really json: \n => , wrap with [ ]
# but I think mongoimport will read this.
#/dvl/mongodb/mongodb-osx-ssl/bin/
/usr/local/bin/mongoexport \
	--db=Jobs --collection=recruiters --out=dump/Jobs/recruiters.json

# make sure this works!
mkdir -pv ./dump ./archives

# so label and store them
d=`date +%Y-%m-%d,%H.%M`
mv ./dump/Jobs ./archives/Jobs$d

# now delete an old one.  Randomly chosen, but keep around the most recent 2.
# NO NO NO I just deleted my whole archive directory. cuz $fileName was empty.
#lineNum=$(( $RANDOM * 8 / 32768 + 2 ))
#fileName=` ls -1t archives | tail -n +$lineNum | head -1 `
#/bin/rm -rfv archives/$fileName

# tell Allan
open -a "Google Chrome" backedUp.html

