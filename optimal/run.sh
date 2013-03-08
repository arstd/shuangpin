#!/bin/bash

cat << ELERT
Please Select:
    1) node optimal/group.js > output/groups.txt
    2) node optimal/assequiv.js > output/assequivs.txt
    3) node optimal/hungary.js
    4) node optimal/assign.js > output/assigns.txt
ELERT

read -p 'Select (4):' -t 5 opt
if [ -z "$opt" ]; then
    opt='4'
fi
echo
case "$opt" in
    '1') 
        node  optimal/group.js > output/groups.txt
        echo 'Groups saved in file output/groups.txt.'
        ;;
    '2') node optimal/assequiv.js > output/assequivs.txt
        echo 'Groups saved in file output/assequivs.txt.'
        ;;
    '3') node optimal/hungary.js;;
    '4') node optimal/assign.js  > output/assigns.txt
        echo 'Groups saved in file output/assigns.txt.'
        ;;
esac