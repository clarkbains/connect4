FROM mhart/alpine-node
WORKDIR /app
COPY package.json .
RUN npm install
COPY  ./connect4 ./connect4
COPY *.json ./
COPY *.js ./
RUN npm run build
RUN npm prune --production
ENV NODE_ENV production
RUN npx clean-node-modules
CMD npm run deploy:local
EXPOSE 9000/tcp
