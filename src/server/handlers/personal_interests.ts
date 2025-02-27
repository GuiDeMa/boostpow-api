
import * as bsv from 'bsv'

import models from '../../models'

import { badRequest } from 'boom'

import { detectInterestsFromTxid, detectInterestsFromTxHex } from '../../../contracts/personal-interest/src'

import {findOrImportPersonalInterests }from '../../personal_interests'

export async function show(req, h) {

  try {

    const txid = req.params.txid

   let personal_interests = await findOrImportPersonalInterests(txid)

    return { personal_interests }

  } catch(error) {

    console.error(error)

    return badRequest(error)

  }

}


export async function create(req, h) {

  try {

      let personal_interests = await detectInterestsFromTxHex(req.params.txid)

      return { personal_interests }

  } catch(error) {

    return badRequest(error)

  }

}



export async function index(req, h) {

  try {

    const owner = req.params.owner

    let personal_interests = await models.PersonalInterest.findAll({
      where: { owner }
    })

    return { owner, personal_interests }

  } catch(error) {

    return badRequest(error)

  }

}

