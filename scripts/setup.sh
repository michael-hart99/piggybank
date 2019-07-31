#!/bin/bash

source $(dirname $0)/print_tools.sh;

info_msg "Setting up a new project...";

python3 $(dirname $0)/setup.py
