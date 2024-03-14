# Little Heureka

Minimalistic version of heureka.

## Tech stack

- React
- Vite
- Zod
- TypeScript
- Zustand

## First start

`npm install
npm run generateApiTypes
npm run start`

- vite tells you url and the port where to find the app (highly likely it will be http://localhost:5173)

## convertion open api to TypeScript

`npm run generateApiTypes`

## Zustand

Plan was heavily use global state management. After a while I decied to store maximum informations to the url.

## styles

I do use css modules without sass/less

## Improvement idea

- caching (use a cache API)
- adds unit/e2e tests
- create a placeholder/skeleton for production to avoid flickering
- refactor to comply with the wet principle and removes hardcoded data
  --- e.g. better dealing with className
- better error handling (i.e. error boundries)
- data loading is cumbersome >> to many request to the api
- more standard styling like https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb
