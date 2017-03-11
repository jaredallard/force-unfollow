/**
 * Force a twitter user, or a list of Twitter users to unfollow you.
 *
 * @author Jared Allard <jaredallard@outlook.com>
 * @license MIT
 * @version 1
 **/

'use strict';

const twit  = require('twit')
const debug = require('debug')('force-unfollow')
const csv   = require('csv')
const fs    = require('fs-promise')
const path  = require('path');
const async = require('async');

const config = require('./config/config.js')

const loadUsers = async () => {
  debug('reading csv file')

  const namesBuffer = await fs.readFile(path.join(__dirname, 'names.csv'), 'utf8')
  const names = namesBuffer.toString()

  return new Promise((resolve, reject) => {
    csv.parse(names, (err, data) => {
      if(err) return reject(err);

      return resolve(data);
    })
  })
}

const init = async function() {
  debug('started')

  const namesParsed = await loadUsers();
  const names = namesParsed[0];

  debug('preparing to force-unfollow', names.length, 'users')

  const T = new twit(config.twitter)

  debug('logging in to account')
  const resp = await T.get('account/verify_credentials', { skip_status: true })
  debug(`Account is @${resp.data.screen_name}`)

  let pos = 0;
  async.eachSeries(names, async (preName, next) => {
    pos++;

    const name = preName.replace(/\@/g, '');

    debug('force-unfollowing', name, `(${pos}/${names.length})`);
    let redo = async () => {
      await new Promise(async resolve => {
        try {
          debug('--> creating block')
          await T.post('blocks/create', {
            screen_name: name
          })

          debug('--> destroying block')
          await T.post('blocks/destroy', {
            screen_name: name
          })
        } catch(e) {
          debug('failed with', e);
          debug('waiting for a second (rate limit?)')
          setTimeout(() => {
            redo();
          }, 60 * 1000)
        }

        // success
        return resolve();
      })
    }

    // Run once.
    await redo();

    return next();
  })
}

init();

debug('done')
