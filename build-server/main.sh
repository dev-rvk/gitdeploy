#!/bin/bash

export GIT_REPO_URL="$GIT_REPO_URL"

git clone "$GIT_REPO_URL" /home/app/dist/output

chmod +x ./dist/script.js

node ./dist/script.js