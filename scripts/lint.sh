#!/bin/bash

source $(dirname $0)/print_tools.sh;

info_msg "Linting Typescript files...";

tsc -p ./config/tsconfig.json
