# recruitment-node-private 1.2.0

This task is to implement a “feature” **based on the current setup**. Is not really about show off, but about deliver a solid piece of work.<br/>
We will look into the whole code and how the current setup is used, not just if it is working or not.<br/>
If you disagree on conventions used by the setup. Please comment on them, instead of changing the given setup.

Please make sure to provide all data needed to start the app.

Good luck!

## Installation

- Install [NodeJS](https://nodejs.org/en/) lts or latest version
- Install [Docker](https://www.docker.com/get-started/)

- In root dir run `npm install`
- In root dir run `docker-compose up` to setup postgres docker image for local development

- Create a .env file with the content from .env.test

## Running the app

- To build the project, run `npm run build`
- To start the project, run `npm run start`

- To run the test, run `npm run test`
- To run the lint, run `npm run lint`

Application runs on [localhost:3000](http://localhost:3000) by default.

## Migrations

Migration scripts:

- `npm run migration:generate --path=moduleName --name=InitialMigration` - automatically generates migration files with
  schema changes made
- `npm run migration:create --path=moduleName --name=CreateTableUsers` - creates new empty migration file
- `npm run migration:run` - runs migration
- `npm run migration:revert` - reverts changes

# Small code exercises

1. Please write a function to transform array to containing number and strings.

    - e.g `['super', '20.5', 'test', '23' ]` -> `['super', 20.5, 'test', 23 ]`

2. Please write a function to return an array of all files with `csv` extension in folder `/files`

3. Please write a function to return if a string contains a digit
    - e.g `'test-string'` -> `false`
    - e.g `'test-string23'` -> `true`

# Farms Task - API

## Setup

- Use created app
- Free to add additional packages
- Use existing user authentication
- Make sure all added endpoints are only accessible for authenticated users (jwt needs to be validated & checked against DB)

## Requirements

### General

1. Need to have test

### Model

1. User should have following properties: `address` & `coordinates`. 
2. Farm should belong to specific user & have following properties: `name`,  `address`, `coordinates`, `size` (e.g 21.5) & `yield` (e.g. 8.5)

### API

_Add API that supports following requirements:_

- There should be versioning endpoints (f.e. /api/v1/..)

- As a user I want to be able to create my **own** farms
    - Coordinates can't be set manually, have to be populated automatically based on the address

- As a user I want to be able to delete my **own** farms

- As a user I want to be able to retrieve a list of all farms **of all users**.
    - The list should contain following properties: 
      - `name`
      - `address`
      - `owner` (email)
      - `size`
      - `yield`
      - `driving distance` (travel distance from farm to requesting user's address)<br/>
          For **driving distance** you can use Distance-Matrix API of *Google*, *Microsoft*, *here* or https://distancematrix.ai/nonprofit .
          You are also welcome to use other service.

    - The user should be able to get list **sorted** by
        - **name** (a to z)
        - **date** (newest first)
        - **driving distance** (closest first)

    - The user should be able to get list **filtered** by
        - **outliers** (Boolean) (outliers = the yield of a farm is 30% below or above of the average yield of all farms).

### Seed

- Add seed that will create 4 users and 30 farms each.

<br/>
<br/>
<br/>
