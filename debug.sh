docker build . -t shipyard
docker run -it -v `pwd`:/shipyard -v /var/run/docker.sock:/var/run/docker.sock -v /usr/bin/docker:/usr/bin/docker shipyard