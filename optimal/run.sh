#!/bin/bash

cat << ELERT
Please Select:
    1) node optimal/group.js
    2) node optimal/assign.js
ELERT

read -p 'Select (1):' -t 5 opt
if [ -z "$opt" ]; then
    opt='1'
    echo
fi
echo
case "$opt" in
    '1') node  optimal/group.js;;
    '2') node optimal/assign.js;;
esac