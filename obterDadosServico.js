const { default: axios } = require('axios');
const fs = require('fs');
const apicervello = require("./services/apiCervello")

// function formatandoDados(arrayChamado) {
//     // formatando dados
//     let arrayChamadoFormatado = [];
//     arrayChamado.map((chamado) => {
//         arrayChamadoFormatado.push({
//             numero: chamado.chamado,
//             data: chamado.data_de_Abertura,
//             fila: chamado.analista_Atual,
//             favorecido: chamado.nome_do_Favorecido,
//             tipo: chamado.tipo,
//             categoria: chamado.categoria,
//             subcategoria: chamado.item_Subcategoria,
//             descricao: chamado.descricao_Chamado,
//             estado: chamado.estado
//         });
//     })
//     console.log(arrayChamadoFormatado);
//     return arrayChamadoFormatado
// }

module.exports = async function obterDados({ diaAnterior, diaAtual, fila }) {
    const data = await apicervello.post('FuncaoMacro/ExecutaMacroFuncao', {
            nomeMacroFuncao: "ConsultaChamado_PorPeriodo",
            parametros: [diaAnterior, diaAtual]
        })
        .then(function(response) {
            return response.data
        })
        .catch(function(error) {
            refreshToken(error)
                // if (error.response) {
                //     // The client was given an error response (5xx, 4xx)
                //     console.log(error.response.data);
                //     console.log(error.response.status);
                //     console.log(error.response.headers);
                //     (async function (error) {
                //        if (error.response.status === 401) {
                //           const response = await refreshToken(error);
                //           return response;
                //         }
                //         return Promise.reject(error);
                //       })()
                // }        
        });
    if (data) {
        const formattedData = JSON.parse(data.replace(/\"/g, '"'))
        const arrayChamado = formattedData.dados.table
        console.log(arrayChamado);
        if (fila) {
            let filtro = arrayChamado.filter(
                (chamado) => chamado.fila === fila
            );
            return filtro
        }
        return arrayChamado
    }
}