const axios = require('axios');
const source = axios.CancelToken.source();
const apicervello = axios.create({
    cancelToken: source.token,
    baseURL: 'https://www.cervelloesm.com.br/Arklok/Api/',
    auth: {
        username: 'integracao',
        password: 'i4a0I8sCmUJzgMrxEyAwxUL7NaMKnrp3lWeWmW1oKY4='
    }
});
module.exports = apicervello;
