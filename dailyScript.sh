#!/bin/bash

echo "Good morning!  daily script starting"
resumeDir=/opt/tibusiness/jobsearching/resume

# do ALL the daily scripts at the same time so I don't get a half dozen
# emails every day.
# Coordinate the time with the Energy Saver schedule , several minutes after daily wakeup
# This might not be done every day, or once a day, but that's the name I chose.

# backup Rodex db
echo
echo "doing Rodex backups... calling backup.sh"
/opt/tibusiness/recruit-o-dex/backups/backup.sh

# see if nakoda is serving pages as it should.
# if no problems, never shows html file.
echo
echo "test jobsearching server"
/opt/dvl/nakoda/testing/test.sh

# I really have to upload alreadyAppliedTo regularly.
echo
echo "upload AAT"
/opt/tibusiness/jobsearching/resume/uploadAAT.sh

# and the resume in case I made some changes
echo
echo "upload Resume"
/opt/tibusiness/jobsearching/resume/uploadResume.sh

# always float to the top left of the window please if sort by mod date
# which its usually set to
touch /opt/tibusiness/jobsearching/resume/BonadioResume.docx
# this will also set the date, and set the dot to Red
cd $resumeDir
./setToRed.sh BonadioResume.docx

