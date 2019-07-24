#!/bin/bash

source $(dirname $0)/print_tools.sh;

info_msg "Building...";

webpack --config ./config/webpack.config.js
