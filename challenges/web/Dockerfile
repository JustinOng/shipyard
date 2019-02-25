FROM alpine

RUN apk update && apk add --no-cache lighttpd
RUN echo "Hello!" > /var/www/localhost/htdocs/index.html
EXPOSE 80

ENTRYPOINT [ "/usr/sbin/lighttpd", "-D", "-f", "/etc/lighttpd/lighttpd.conf" ]
