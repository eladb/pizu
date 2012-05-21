#!/bin/bash
source ./exports.sh
ssh ubuntu@$PIZU_HOST tail -f /var/log/node.log

