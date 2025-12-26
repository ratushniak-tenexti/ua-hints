'use strict'

const uaHints = require('..')

const test = require('ava')

test('get client hints', t => {
  const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36'

  const headers = uaHints(userAgent)

  console.log(headers)

  t.truthy(headers['Sec-CH-UA-Arch'])
  t.truthy(headers['Sec-CH-UA-Bitness'])
  t.truthy(headers['Sec-CH-UA-Form-Factors'])
  t.truthy(headers['Sec-CH-UA-Full-Version-List'])
  t.truthy(headers['Sec-CH-UA-Full-Version'])
  t.truthy(headers['Sec-CH-UA-Mobile'])
  t.truthy(headers['Sec-CH-UA-Model'])
  t.truthy(headers['Sec-CH-UA-Platform-Version'])
  t.truthy(headers['Sec-CH-UA-Platform'])
  t.truthy(headers['Sec-CH-UA-WoW64'])
  t.truthy(headers['Sec-CH-UA'])
})

test.only('sets `Sec-CH-UA`', t => {
  const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36'
  const headers = uaHints(userAgent)
  console.log(headers)
  t.is(
    headers['Sec-CH-UA'],
    '"Google Chrome";v="135", "\\"Not;A\\Brand";v="99", "Chromium";v="135"'
  )
})
