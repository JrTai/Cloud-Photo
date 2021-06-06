# FROM node as nodejs

FROM nginx
LABEL maintainer = "Henry Tai <photoniclaser@gmail.com>"
WORKDIR /home/app
# COPY --from=nodejs /usr/local/bin/node /usr/local/bin/node

# Remove the default nginx.conf
RUN rm /etc/nginx/conf.d/default.conf

# Replace with our own nginx.conf
COPY nginx.conf /etc/nginx/conf.d/

COPY ssl.csr /etc/nginx/ssl.csr
COPY ssl.key /etc/nginx/ssl.key

# COPY nginx.config /etc/nginx/conf.d/default.conf
COPY package*.json ./
RUN apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && curl -L https://www.npmjs.com/install.sh | sh \
    && npm install \
    && npm install pm2 -g 
COPY . .
EXPOSE 443
CMD [ "pm2-runtime", "app.js", "serive", "nginx", "start" ]

