docker build . -t shipyard
docker run -it \
  -v `pwd`:/shipyard \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -p 8080:3000 \
  shipyard