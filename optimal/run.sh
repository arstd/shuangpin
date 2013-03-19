#!/bin/bash

cat << ELERT
Please Select:
    0) Run all below...
    1) node optimal/group.js > output/groups.txt
    2) node optimal/assequiv.js > output/assequivs.txt
    3) node optimal/hungary.js
    4) node optimal/assign.js > output/assigns.txt
    5) node optimal/stat.js
    6) node public/collect/statequiv.js
ELERT

read -p 'Select (0):' -t 5 opt
if [ -z "$opt" ]; then
    opt='0'
fi

case "$opt" in
    '0') 
        node  optimal/group.js > output/groups.txt
        echo 'Groups saved in file output/groups.txt.'
        node optimal/assequiv.js > output/assequivs.txt
        node optimal/assequiv.js > output/assequivs.txt
        echo 'Assequivs saved in file output/assequivs.txt.'
        node optimal/assign.js  > output/assigns.txt
        echo 'Assigns saved in file output/assigns.txt.'
        node optimal/stat.js
        ;;
    '1') 
        node  optimal/group.js > output/groups.txt
        echo 'Groups saved in file output/groups.txt.'
        ;;
    '2') node optimal/assequiv.js > output/assequivs.txt
        echo 'Assequivs saved in file output/assequivs.txt.'
        ;;
    '3') node optimal/hungary.js;;
    '4') node optimal/assign.js  > output/assigns.txt
        echo 'Assigns saved in file output/assigns.txt.'
        ;;
    '5') node optimal/stat.js;;
    '6') node optimal/statequiv.js
        echo 'Statequiv saved in file output/statequiv.txt.'
        ;;
esac

exit 0