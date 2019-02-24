FROM alpine

RUN apk add --no-cache nmap

RUN adduser -S challenger

#USER challenger
WORKDIR /home/challenger
ENV ENV="/home/challenger/.ashrc"
RUN echo "echo Hello!" >> ~/.ashrc
