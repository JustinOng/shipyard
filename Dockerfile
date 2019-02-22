FROM node:10-alpine

ENV APP_DIR /shipyard

WORKDIR ${APP_DIR}

EXPOSE 3000

CMD [ "/bin/sh" ]