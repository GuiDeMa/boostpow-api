FROM node:12

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/

RUN npm install -g typescript
RUN npm install -g ts-node
RUN npm install -g rabbi
RUN npm install 

# Bundle app source
COPY . /usr/src/app

CMD rabbi start
