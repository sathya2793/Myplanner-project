let appConfig = {};

appConfig.port = 3000;
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.db = {
    uri: 'mongodb://127.0.0.1:27017/myplanner'
  }
appConfig.apiVersion = '/api/v1';
appConfig.name ="Sathya Narayanan";
appConfig.email='sathyainfotechpro@gmail.com';
appConfig.password='Balu@007';
appConfig.url="https://myplanner.sathyainfotechpro.com"


module.exports = {
    port: appConfig.port,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db :appConfig.db,
    apiVersion : appConfig.apiVersion,
    name : appConfig.name,
    email :appConfig.email,
    password :appConfig.password,
    url:appConfig.url
};