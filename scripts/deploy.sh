#!/bin/bash

source $(dirname $0)/print_tools.sh;

./scripts/build.sh &&

info_msg "Deploying..." &&

cd build &&
clasp push &&
cd ..;
