#!/bin/bash

source $(dirname $0)/print_tools.sh;

info_msg "Opening..." &&

cd build &&
clasp open &&
cd ..;
