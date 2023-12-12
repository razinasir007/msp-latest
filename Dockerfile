# # ---- Base Node ----
# FROM node:16-alpine AS base

# # Set the build environment
# ARG BUILD_ENV
# ENV NODE_ENV $BUILD_ENV

# # Set working directory
# WORKDIR /app
# # Copy project file
# COPY package.json .

# # ---- Dependencies ----
# FROM base AS dependencies  
# # Install app dependencies
# RUN apk add --no-cache yarn && yarn install

# # ---- Copy Files/Build ----
# FROM dependencies AS build  
# WORKDIR /app
# COPY . /app
# RUN yarn generate
# RUN yarn build 

# # ---- Fileserver build ----
# FROM build AS fileserver-build
# WORKDIR /app/fileserver
# COPY ./fileserver/package.json ./
# RUN yarn install
# RUN yarn build

# # ---- Release ----
# FROM node:16-alpine AS release
# # Set working directory
# WORKDIR /app
# # Copy built app and fileserver
# COPY --from=build /app/dist ./dist
# COPY --from=fileserver-build /app/fileserver/dist ./fileserver/dist
# # Expose port 3000
# EXPOSE 3000
# # Start fileserver
# CMD ["node", "./fileserver/dist/index.js"]

