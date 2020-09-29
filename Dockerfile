FROM mhart/alpine-node
WORKDIR /app
COPY package.json .
RUN npm install
copy . .
RUN npm run build
CMD npm run deploy:local
EXPOSE 9000/tcp
