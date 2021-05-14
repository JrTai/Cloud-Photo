# FROM node as nodejs

FROM nginx
LABEL maintainer = "Henry Tai <photoniclaser@gmail.com>"
WORKDIR /home/app
# COPY --from=nodejs /usr/local/bin/node /usr/local/bin/node
COPY nginx.config /etc/nginx/conf.d/default.conf
COPY package*.json ./
RUN apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && curl -L https://www.npmjs.com/install.sh | sh \
    && npm install
COPY . .
EXPOSE 3000
CMD [ "node", "app.js" ]

