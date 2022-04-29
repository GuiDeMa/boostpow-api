

import { Server } from '@hapi/hapi'

import { log } from './log'

const Joi = require('joi')

import { join } from 'path'

const Inert = require('@hapi/inert');

const Vision = require('@hapi/vision');

const HapiSwagger = require('hapi-swagger');

const Pack = require('../package');

import { load } from './server/handlers'

const handlers = load(join(__dirname, './server/handlers'))

export const server = new Server({
  host: process.env.HOST || "0.0.0.0",
  port: process.env.PORT || 8000,
  routes: {
    cors: true,
    validate: {
      options: {
        stripUnknown: true
      }
    }
  }
});

// POST /node/api/boost_jobs
// POST /node/api/boost_job_transactions
// GET /node/api/content/:txid
//
// POST /node/api/jobs
//
// POST /api/v1/work
// POST /v1/main/boost/jobs/:txid/proof
// GET /v1/main/boost/jobs/:txid
// POST /v1/main/boost/jobs/scripts
// GET /node/v1/ranking/value
// GET /node/v1/ranking
// GET /node/v1/ranking-timeframes
// GET /node/v1/content/:content/rankings
// GET /v1/main/boost/search
// GET /v1/main/boost/id/:id

server.route({
  method: 'POST',
  path: '/api/v1/boost/jobs',
  handler: handlers.BoostJobs.create,
  options: {
    description: 'Submit Jobs To Index',
    notes: 'Receives boost job transactions in hex form and indexes them if they are valid bitcoin transactions',
    tags: ['api'],
    response: {
      failAction: 'log'
    },
    validate: {
      payload: Joi.object({
        transaction: Joi.string().required()
      })
    }
  }
})

server.route({
  method: 'POST',
  path: '/api/v1/boost/scripts',
  handler: handlers.Scripts.create,
  options: {
    description: 'Get New Job Script',
    notes: 'Provide a Boost Job data structure and receive a boost job script in response. Useful for clients that do not want to include a boostpow sdk',
    tags: ['api'],
    response: {
      failAction: 'log',
      schema: Joi.object({
        script: Joi.object({
          hex: Joi.string().required()
        }).required()
      })
    },
    validate: {
      payload: Joi.object({
        content: Joi.string().required(),
        diff: Joi.number().required(),
        category: Joi.string().optional(),
        tag: Joi.string().optional(),
        additionalData: Joi.string().optional(),
        userNonce: Joi.string().optional()
      })
    }
  }
})

server.route({
  method: 'POST',
  path: '/api/v1/work',
  handler: () => {},
  options: {
    description: 'Submit New Work',
    notes: 'When work is completed submit it here to be indexed. Accepts valid transactions which spend the work. The transaction may or may not be already broadcast to the Bitcoin network',
    tags: ['api'],
    response: {
      failAction: 'log'
    },
    validate: {
    }
  }
})

server.route({
  method: 'GET',
  path: '/api/v1/boost/jobs',
  handler: handlers.BoostJobs.index,
  options: {
    description: 'List Available Jobs',
    notes: 'For miners looking to mine new jobs, list available jobs filtered by content, difficulty, reward, tag and category',
    tags: ['api'],
    response: {
      failAction: 'log',
      schema: Joi.object({
        jobs: Joi.array().items(Joi.object({
          id: Joi.number(),
          content: Joi.string().required(),
          difficulty: Joi.number().required(),
          category: Joi.string().required(),
          tag: Joi.string().required(),
          additionalData: Joi.string().required(),
          userNonce: Joi.string().required(),
          vout: Joi.number().required(),
          value: Joi.number().required(),
          timestamp: Joi.date().required(),
          spent: Joi.boolean().required(),
          script: Joi.string().required(),
          spent_txid: Joi.string().optional(),
          spent_vout: Joi.number().optional(),
          createdAt: Joi.date().optional(),
          updatedAt: Joi.date().optional()
        }))
      })
    },
    validate: {
      query: Joi.object({
        limit: Joi.number().optional()
      })
    }
  }
})

server.route({
  method: 'GET',
  path: '/api/v1/boost/jobs/{txid}',
  handler: handlers.BoostJobs.show,
  options: {
    description: 'Get Job From Txid',
    notes: 'Get information about a job from a transaction id. Optionally postfix with _v0, _v1, etc to specify the output containing the job',
    tags: ['api'],
    response: {
      failAction: 'log',
      schema: Joi.object({
        job: Joi.object({
          id: Joi.number().required()
        }).required()
      }).required()
    },
    validate: {
      params: Joi.object({
        txid: Joi.string().required()
      }).required()
    }
  }
})

server.route({
  method: 'POST',
  path: '/api/v1/boost/jobs/{txid}',
  handler: handlers.BoostJobs.createByTxid,
  options: {
    description: 'Import Existing Job Transaction By Txid',
    notes: 'For any job that has not already been indexed by the system but has already been broadcast through the peer to peer network',
    tags: ['api'],
    response: {
      failAction: 'log',
      schema: Joi.object({
        job: Joi.object({
          id: Joi.number().required()
        }).required()
      }).required()
    },
    validate: {
      params: Joi.object({
        txid: Joi.string().required()
      }).required()
    }
  }
})



server.route({
  method: 'GET',
  path: '/api/v1/content/{txid}',
  handler: () => {},
  options: {
    description: 'Show Content Jobs & Work',
    notes: 'For applications looking to display work for a given piece of content, or miners looking to mine specific content. Includes jobs, work, and content metadata',
    tags: ['api'],
    response: {
      failAction: 'log'
    },
    validate: {
      params: Joi.object({
        txid: Joi.string().required()
      })
    }
  }
})

server.route({
  method: 'GET',
  path: '/api/v1/tx/{txid}',
  handler: handlers.Transactions.show,
  options: {
    description: 'Get Bitcoin Transaction by Txid',
    notes: 'Returns the transaction in hex, json, and includes a merkleproof',
    tags: ['experimental'],
    response: {
      failAction: 'log',
      schema: Joi.object({
        txhex: Joi.string().required(),
        txjson: Joi.object().required(),
        merkleproof: Joi.object().required()
      })
    },
    validate: {
      params: Joi.object({
        txid: Joi.string().required()
      })
    }
  }
})

server.route({
  method: 'GET',
  path: '/api/v1/utxo/{address}',
  handler: handlers.UnspentOutputs.index,
  options: {
    description: 'List Unspent Outputs For Address',
    notes: 'PREMIUM ENDPOINT! Only available to paying clients',
    tags: ['experimental'],
    response: {
      failAction: 'log'
    },
    validate: {
      params: Joi.object({
        address: Joi.string().required()
      })
    }
  }
})

const swaggerOptions = {
  info: {
    title: 'Pow.co API Documentation',
    version: Pack.version,
  },
  schemes: ['https'],
  host: 'pow.co'
}

export async function start() {

  await server.register([
      Inert,
      Vision,
      {
          plugin: HapiSwagger,
          options: swaggerOptions
      }
  ]);

  await server.start();

  log.info(server.info)

}

if (require.main === module) {

  start()

}
