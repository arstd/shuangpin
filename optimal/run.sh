#!/bin/bash

cat << EOF
Please Select:
    1) node optimal/equivalent.js
    2) node optimal/group.js > output/groups.txt
    3) node optimal/assequiv.js > output/assequivs.txt
    4) node optimal/assign.js > output/assigns.txt
    5) node optimal/stat.js
    9) node optimal/hungary.js
EOF

read -p 'Select (1): ' -t 5 opt
if [ -z "$opt" ]; then
    opt='1'
fi

while [ $opt -lt 6 ] || [ $opt -eq 9 ]
do
    case "$opt" in
        1) node optimal/equivalent.js
            echo 'Equivalent saved in file optimal/equivalent.txt.'
            ;;
        2) node  optimal/group.js > output/groups.txt
            echo 'Groups saved in file output/groups.txt.'
            ;;
        3) node optimal/assequiv.js > output/assequivs.txt
            echo 'Assequivs saved in file output/assequivs.txt.'
            ;;
        4) node optimal/assign.js  > output/assigns.txt
            echo 'Assigns saved in file output/assigns.txt.'
            ;;
        5) node optimal/stat.js;;
        9) node optimal/hungary.js;;
    esac
    opt=$(( $opt + 1 ))
#    read -p 'Press any key to continue...'
    echo
done

exit 0
