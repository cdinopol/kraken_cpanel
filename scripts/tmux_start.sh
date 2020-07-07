#!/bin/bash

tmux new-session -A -d -s kraken_web
tmux new-window -t kraken_web -n "cpanel"
tmux send-key -t kraken_web:cpanel "cd ~/app/kraken_cpanel" C-m
tmux send-key -t kraken_web:cpanel "docker-compose up --build" C-m
