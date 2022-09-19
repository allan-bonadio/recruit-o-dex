#!/bin/bash

# do ALL the daily scripts at the same time so I don't get a half dozen
# emails every day.
# Coordinate the time with the Energy Saver schedule , several minutes after daily wakeup
# This might not be done every day, or once a day, but that's the name I chose.

# backup Rodex db
echo
echo "Rodex backups"
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
