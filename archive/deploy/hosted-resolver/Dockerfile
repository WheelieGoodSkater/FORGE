FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV IDB_RESOLVER_HOST=0.0.0.0
ENV IDB_RESOLVER_PORT=8787

COPY package.json ./
COPY tools ./tools

EXPOSE 8787

CMD ["node", "tools/website_resolver_hosted_service.js"]
