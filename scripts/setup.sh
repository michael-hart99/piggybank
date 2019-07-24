#!/bin/bash

source $(dirname $0)/print_tools.sh;

info_msg "Setting up a new project...";

python setup.py
