'use strict'

const UAParser = require('ua-parser-js')

const quote = str => `"${str.replace(/"/g, '\\"')}"`

const generateBrandVersionList = (seed, brand, majorVersion) => {
  const permutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0]
  ]

  const escapedChars = ['\\', '"', ';']
  const permutation = permutations[seed % permutations.length]

  const greaseyBrand = `${escapedChars[permutation[0]]}Not${escapedChars[permutation[1]]}A${escapedChars[permutation[2]]}Brand`
  const greaseyBrandVersion = { brand: greaseyBrand, version: '99' }
  const chromiumBrandVersion = { brand: 'Chromium', version: majorVersion }

  const brandList = []

  if (brand) {
    const mainBrandVersion = { brand, version: majorVersion }
    brandList[permutation[0]] = greaseyBrandVersion
    brandList[permutation[1]] = chromiumBrandVersion
    brandList[permutation[2]] = mainBrandVersion
  } else {
    brandList[seed % 2] = greaseyBrandVersion
    brandList[(seed + 1) % 2] = chromiumBrandVersion
  }

  return brandList.filter(Boolean)
}

const getArchAndBitness = userAgent => {
  const uaLower = userAgent.toLowerCase()
  if (/x86_64|amd64|win64|x64/.test(uaLower)) return { arch: 'x86', bitness: '64' }
  if (/i686|i386|win32|x86/.test(uaLower)) return { arch: 'x86', bitness: '32' }
  if (/arm64|aarch64/.test(uaLower)) return { arch: 'arm', bitness: '64' }
  if (/arm/.test(uaLower)) return { arch: 'arm', bitness: '32' }
  return { arch: '', bitness: '' }
}

module.exports = userAgent => {
  const parser = new UAParser(userAgent)
  const { name: browserBrand = '', version: browserFullVersion = '' } = parser.getBrowser()
  const { name: platform = '', version: platformVersion = '' } = parser.getOS()
  const { model = '', type: deviceType = '' } = parser.getDevice()

  const isMobile = ['mobile', 'tablet'].includes(deviceType)
  const browserMajorVersion = browserFullVersion.split('.')[0] || ''

  const { arch, bitness } = getArchAndBitness(userAgent)
  const wow64 = userAgent.toLowerCase().includes('wow64') ? '?1' : '?0'
  const formFactors = isMobile ? '["Mobile"]' : '["Desktop"]'

  const brandsMap = {
    Chrome: 'Google Chrome',
    Chromium: 'Chromium',
    Edge: 'Microsoft Edge',
    Opera: 'Opera',
    Firefox: 'Mozilla Firefox',
    Safari: 'Safari'
  }
  const officialBrand = brandsMap[browserBrand] || browserBrand || undefined

  const seed = parseInt(browserMajorVersion, 10) || 0
  const brandList = generateBrandVersionList(seed, officialBrand, browserMajorVersion)

  const hints = {}

  if (brandList.length) {
    hints['Sec-CH-UA'] = brandList
      .map(({ brand, version }) => `${quote(brand)};v=${quote(version)}`)
      .join(', ')
  }

  hints['Sec-CH-UA-Mobile'] = isMobile ? '?1' : '?0'

  if (platform) {
    hints['Sec-CH-UA-Platform'] = quote(platform)
  }

  if (platformVersion) {
    hints['Sec-CH-UA-Platform-Version'] = quote(platformVersion)
  }

  if (arch) {
    hints['Sec-CH-UA-Arch'] = quote(arch)
  }

  if (bitness) {
    hints['Sec-CH-UA-Bitness'] = quote(bitness)
  }

  if (model) {
    hints['Sec-CH-UA-Model'] = quote(model)
  }

  if (browserFullVersion) {
    hints['Sec-CH-UA-Full-Version'] = quote(browserFullVersion)

    if (officialBrand) {
      hints['Sec-CH-UA-Full-Version-List'] = `${quote(officialBrand)};v=${quote(browserFullVersion)}`
    }
  }

  hints['Sec-CH-UA-WoW64'] = wow64
  hints['Sec-CH-UA-Form-Factors'] = formFactors

  return hints
}
