#!/bin/bash

tmux send-key -t kraken_web:cpanel C-c
sleep 5
tmux send-key -t kraken_web:cpanel C-d
