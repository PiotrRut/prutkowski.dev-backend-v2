# Backend for prutkowski.dev

This repository holds the functions used to run backend for my personal website. The architecture is fully serverless, with lambda functions being exposed via public HTTP endpoints in API Gateway.

## Functions 🛠

See below for brief overview of each function in this project.

#### writeReposToDb

This function is responsible for fetching my repositories from the public GitHub API, and writing them to a DynamoDB table. It is scheduled to run with 3 hours intervals through EventBridge.

#### getRepos

This function, which is triggered by an HTTP GET request, returns all items from the DynamoDB table which stores my repositories, and is read directly by my Next.js frontend.

## Background

This code replaces my old backend, which was an express server running constantly on a Heroku container.

The main reasons for migrating to serverless was mostly learning about various AWS services and how they work together, as well as driving down costs (thanks to the nature of lambda functions and the free tier model of AWS, operating this API currently costs me nothing).
