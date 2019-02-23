FROM alpine

RUN adduser -S challenger
RUN rm /bin/ls

USER challenger
WORKDIR /home/challenger
ENV ENV="/home/challenger/.ashrc"
RUN echo "echo Did someone really break ls?" >> ~/.ashrc
RUN echo "flag{missingls}" >> !totallynottheflag