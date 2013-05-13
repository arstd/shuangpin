#!/bin/bash

cat << EOF
Please Select:
    1) node optimal/equivalent.js
    2) node optimal/matrix.js
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
        2) node optimal/matrix.js;;
        9) node optimal/hungary.js;;
    esac
    opt=$(( $opt + 1 ))
done

exit 0
