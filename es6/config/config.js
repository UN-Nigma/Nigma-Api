var env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    apiUrl: "http://localhost:4000",
    regex: /http:\/\/localhost:4000\/static\/.*?\/images\//g
  },
  stage: {
  	apiUrl: "http://www.nigma.api.grupo-guiame.org/",
    regex: /http:\/\/www\.nigma\.api\.grupo-guiame\.org\/static\/.*?\/images\//g
  },
  production: {
    apiUrl: "http://104.131.58.229:4000",
    regex: /http:\/\/104.131.58.229:4000\/static\/.*?\/images\//g
  }
};

module.exports = config[env];
