#!/usr/bin/env ts-node

require('dotenv').config()

import * as program from 'commander'

const Twetch = require('@twetch/sdk');
const twetch = new Twetch({
  clientIdentifier: process.env.TWETCH_CLIENT_IDENTIFIER
});

program
  .command('authenticate')
  .action(async () => {

    twetch.wallet.restore(process.env.TWETCH_PRIVATE_KEY)

    let token = await twetch.authenticate()

    console.log(token)

    try {

    } catch(error) {

      console.error(error)

    }

  })

program
  .command('init')
  .action(async () => {

    try {

      twetch.init()

    } catch(error) {

      console.error(error)

    }

  })

program
  .parse(process.argv)
