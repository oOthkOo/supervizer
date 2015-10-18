
var pkg = require('../package.json')
var settings = require('../settings.json')

module.exports.pkg = pkg

const results = {
	SPZ_OK: 'SPZ_OK',
	SPZ_FAILED: 'SPZ_FAILED'
}

module.exports.results = results

settings.host = settings.host || 'http://localhost'
settings.port = settings.port || 8200
module.exports.settings = settings
