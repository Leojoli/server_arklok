const axios = require('axios');
const source = axios.CancelToken.source();
const apicervello = axios.create({
    cancelToken: source.token,
    baseURL: 'https://www.cervelloesm.com.br/Arklok/Api/',
    auth: {
        username: 'integracao',
        password: 'G@Gebbgjtxtep5M'
    }
});
module.exports = apicervello;
