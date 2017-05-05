<p align="center"><img src="/docs/assets/boldr-text-logo.png" width="200"></p>

[![Build Status](https://drone.boldr.io/api/badges/boldr/boldr-api/status.svg)](https://drone.boldr.io/boldr/boldr-api)
[![Build Status](https://travis-ci.org/boldr/boldr-api.svg?branch=master)](https://travis-ci.org/boldr/boldr-api)   [![codecov](https://codecov.io/gh/boldr/boldr-api/branch/master/graph/badge.svg)](https://codecov.io/gh/boldr/boldr-api)
 [![Code Climate](https://codeclimate.com/github/boldr/boldr-api/badges/gpa.svg)](https://codeclimate.com/github/boldr/boldr-api)  [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)


Boldr is a modern content management framework. Think of Boldr as the solid foundation for building your next great web application. Unlike other CMS platforms, Boldr is entirely JavaScript. Boldr features Universal / Isomorphic rendering for improved performance and Search Engine Optimization.

This repository contains the backend. The backend for Boldr, BoldrAPI, is comprised of a node.js REST API, a Postgres database, and Redis for caching and sessions.

Full documentation can be found at https://docs.boldr.io


Have questions or want to help with development? Join us on <a href="https://slack.boldr.io" target="blank"><img src="/docs/assets/slack-logo.png" height="25" /></a>



## Boldr Repositories

- [Boldr](https://github.com/strues/boldr)
- [Boldr UI](https://github.com/boldr/boldr-ui)
- [Boldr Tools](https://github.com/boldr/boldr-tools)


## TL;DR Setup Guide

First you must somehow get the files to your machine. Below outlines two options.  

**Using Boldr-CLI:**  

```shell
   yarn global --add boldr-cli
   boldr-cli init
   cd boldr-api
   yarn
   mv boldrrc.example .boldrrc
```  

**Using git:**  

```shell
  git clone git@github.com:boldr/boldr-api.git <DIR_NAME>
  cd <DIR_NAME>
  yarn
  mv boldrrc.example .boldrrc
```  

#### Service Setup

BoldrAPI requires a Postgres database and a Redis server to connect to. Using the `docker-compose.yml` file
included in the repo is the quickest way.  

`docker-compose up --build -d` starts the necessary services (postgres and redis).  

Ensure the database is setup with the proper tables and seed data.  
Use the command `yarn migrate && yarn seed`.
