FROM node:21-alpine3.18

COPY package.json ./
COPY dist/ ./

RUN apk add --no-cache postgresql-client rsync sshpass openssh tzdata \
      && npm install --force --production

ENV TZ Europe/Berlin

CMD ["node", "esm/index.mjs", "--cron"]
