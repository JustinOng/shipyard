FROM node:10-alpine

ENV APP_DIR /shipyard

VOLUME [ ${APP_DIR} ]

WORKDIR ${APP_DIR}

CMD [ "/bin/sh" ]