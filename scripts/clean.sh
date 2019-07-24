#!/bin/bash

source $(dirname $0)/print_tools.sh;

info_msg "Removing generated files...";

rm ./build/bundle.js >/dev/null 2>&1;

exit 0;
