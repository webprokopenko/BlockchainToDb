FROM debian
RUN apt-get update 
RUN apt-get install -y build-essential pkg-config libc6-dev m4 g++-multilib
RUN apt-get -y install sudo nano
RUN apt-get install -y autoconf libtool ncurses-dev unzip git python python-zmq
RUN apt-get install zlib1g-dev wget curl bsdmainutils automake
RUN apt install -y software-properties-common
RUN add-apt-repository ppa:ubuntu-toolchain-r/test  
RUN apt-get install g++-4 -y
WORKDIR /var
RUN git clone https://github.com/zcash/zcash.git
WORKDIR /var/zcash
RUN git checkout v2.0.0
RUN ./zcutil/fetch-params.sh
RUN ./zcutil/build.sh -j$(nproc)

RUN mkdir -p ~/.zcash
RUN echo "testnet=1 addnode=testnet.z.cash rpcuser=u rpcpassword=p rpcport=18531" >~/.zcash/zcash.conf
RUN ./src/zcashd
# RUN useradd -m docker && echo "docker:docker" | chpasswd && adduser docker sudo
# USER docker
EXPOSE 18531
