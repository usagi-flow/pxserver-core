FROM node:alpine

WORKDIR /opt/src

COPY package*.json yarn.lock ./

RUN apk add sudo shadow yarn && \
	mkdir -p /opt/app /opt/cache && \
	chown -R node:node /opt/app /opt/cache /opt/src && \
	chmod 777 /opt && \
	echo 'alias l="ls -alh"' >> /etc/profile && \
	echo 'alias install="apk add --no-cache"' >> /etc/profile

USER node

RUN yarn install

COPY --chown=node:node . .

# Build output goes to /opt/app
RUN yarn run build && \
	mv node_modules ../cache && \
	cd .. && \
	rm -rf src && \
	cd app && \
	echo '#!/bin/sh' > start.sh && \
	echo 'set -e' >> start.sh && \
	echo 'if [ -d /opt/app/node_modules ]; then' >> start.sh && \
	echo '	export uid=$(ls -dn /opt/app/node_modules/ | tr -s " " | cut -d" " -f3)' >> start.sh && \
	echo '	export gid=$(ls -dn /opt/app/node_modules/ | tr -s " " | cut -d" " -f4)' >> start.sh && \
	echo '	echo "Adapting to UID #$uid / GID #$gid of externally mounted node_modules directory"' >> start.sh && \
	echo '	usermod -u $uid node' >> start.sh && \
	echo '	groupmod -g $gid node' >> start.sh && \
	echo '	echo "Synchronizing mounted host cache"' >> start.sh && \
	echo '	sudo -E -H -u node cp -r -u /opt/cache/node_modules/* /opt/app/node_modules/' >> start.sh && \
	echo 'else' >> start.sh && \
	echo '	echo "No host cache mounted"' >> start.sh && \
	echo '	sudo -E -H -u node mv /opt/cache/node_modules /opt/app/' >> start.sh && \
	echo 'fi' >> start.sh && \
	echo 'sudo -E -H -u node yarn run start' >> start.sh && \
	chmod 755 start.sh

WORKDIR /opt/app

USER root

ENV ENV=/etc/profile
ENTRYPOINT sleep 3 && ./start.sh