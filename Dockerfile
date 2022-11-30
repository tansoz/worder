# 运行下面的命令, 构建worder镜像
# docker build -t worder .
# 下面的命令运行镜像, 访问localhost:8990访问应用, 8990可修改成你未占有的端口
# docker run -d -p 8990:3000 --name worderapp worder:latest

FROM node:14

MAINTAINER sevenyoungairye<lel.ng.top@gmail.com>

WORKDIR /app/worder

COPY package*.json .

COPY yarn.lock .

RUN npm config set registry https://registry.npm.taobao.org

RUN npm install yarn -g --force

RUN yarn install

COPY . .

EXPOSE 3000

CMD yarn start


