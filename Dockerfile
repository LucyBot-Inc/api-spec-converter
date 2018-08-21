FROM node
ADD . api-spec-converter/
RUN cd api-spec-converter && npm install
RUN npm i -g ./api-spec-converter
