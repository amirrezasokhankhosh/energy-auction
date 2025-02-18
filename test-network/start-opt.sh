./network.sh down
./network.sh up
./network.sh createChannel -c main
./network.sh deployCC -ccp ../auction-control/auction-control-optimized-chaincode -ccn auctionCC -c main -ccl javascript 