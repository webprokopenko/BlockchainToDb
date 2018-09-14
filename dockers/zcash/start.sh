#!/bin/bash

/var/zcash/src/zcashd -testnet=1 -server=1 -addnode=testnet.z.cash -rpcuser=u -rpcpassword=p -rpcport=1531 -rpcallowip=$(route | grep default|awk '{ print $2 }')