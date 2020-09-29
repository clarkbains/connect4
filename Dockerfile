FROM mhart/alpine-node
WORKDIR /app
COPY package.json .
RUN npm install
copy  ./connect4 ./connect4
COPY *.json ./
COPY *.js ./
RUN npm run build
CMD npm run deploy:local
EXPOSE 9000/tcp
