FROM node:20-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/engine/package.json packages/engine/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/server/package.json packages/server/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build && pnpm --filter @commons-sim/web build

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html/commons-sim

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
