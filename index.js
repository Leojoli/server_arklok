var express = require("express");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var DOMParser = require("xmldom").DOMParser;
var cors = require("cors");
const fs = require('fs');
var app = express();
var port = process.env.PORT || 30003;

app.use(
    cors({
        origin: "https://www.cervelloesm.com.br",
    })
);


// Inicio função criar serviço
async function criaServico() {
    var data = new Date();
     var data = new Date();
    data.setDate(data.getDate());
    let diaSplit = data.toLocaleString().slice(0, 10).split("/")
    let diaAtual = diaSplit[2].replace(/,/,'') + "-" +(diaSplit[0] < 10 ? "0" + diaSplit[0] : diaSplit[0]) + "-" + (diaSplit[1] < 10 ? "0" + diaSplit[1] : diaSplit[1])
    console.log(diaAtual)
    data.setDate(data.getDate() - 59);
    let diaAnteriorSplit = data.toLocaleString().slice(0, 10).split("/")
    console.log(diaAnteriorSplit)
    let diaAnterior = diaAnteriorSplit[2].replace(/,/,'') + "-" +(diaAnteriorSplit[0] < 10 ? "0" + diaAnteriorSplit[0] : diaAnteriorSplit[0]) + "-" + (diaAnteriorSplit[1] < 10 ? "0" + diaAnteriorSplit[1] : diaAnteriorSplit[1])
    console.log("Anterior", diaAnterior, " Atual ",diaAtual)


    const obterDados = require('./obterDadosCriar')
    const transResp = await obterDados({ diaAnterior, diaAtual, fila: "FILA_CHAMADOS ROTEIRIZADOS" })
    console.log(transResp);
    //alterado data


    for (let i = 0; i < transResp.length; i++) {
        // Limpeza dos Arrays para construção do XML
        let numeroOS = transResp[i].numero;
        let categoria = transResp[i].categoria;
        let tipo = transResp[i].tipo;
        let subItem = transResp[i].subcategoria;
        let nomeDoFavorecido = transResp[i].favorecido;
        let dataDeAberturaGoon = transResp[i].data;
        console.log(transResp[i].data);
        let arrayDataHora = dataDeAberturaGoon.split(" ");
        let descricaoChamado = transResp[i].descricao;
        console.log("aqui 5", arrayDataHora);

        // Macro para coletar o endereço do cliente
        let dataEndereco = JSON.stringify({
            nomeMacroFuncao: "sp_clsWF_CadastroEmpresaNome_Definir_1",
            parametros: [nomeDoFavorecido],
        });
        console.log("endereco" + dataEndereco);
        // Requisição endereço
        let URLEndereco = `https://www.cervelloesm.com.br/Arklok/Api/FuncaoMacro/ExecutaMacroFuncao?Authorization=Basic Y2VydmVsbG86IGNlcnZlbGxvMDE=`;
        let xhrEndereco = new XMLHttpRequest();
        xhrEndereco.onreadystatechange = function() {
            if (xhrEndereco.readyState == 4 && xhrEndereco.status == 200) {
                // Reposta da requisição e tratamento
                let res = JSON.stringify(this.responseText);
                const resformt = res
                    .replace(/\\\\/gi, "")
                    .replace(/\\/gi, "")
                    .replace(/\""{"dados":{"table":/gi, "")
                    .replace(/\}}""/gi, "")
                const resformtJSONs = JSON.parse(resformt);
                console.log("aqui 6", resformtJSONs);
                //Verificar se trouxe as infomações do endereço para criação do serviço
                if (resformt == "" || resformtJSONs == "") {
                    // Requisição para alterar a fila de FILA_CHAMADOS ROTEIRIZADO para FILA_ROTEIRIZACAO
                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";
                    let inserirAcaoDescricao = new XMLHttpRequest();
                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (
                            inserirAcaoDescricao.readyState == 4 &&
                            inserirAcaoDescricao.status == 200
                        ) {
                            console.log(inserirAcaoDescricao.responseText);
                        }
                    };
                    // XML da requisição para inserir informação no chamado da cervello de que não foi encontrado o endereço
                    let inserirAcaoDescricaoData = JSON.stringify({
                        TipoAcao: "Atendimento",
                        LoginAnalistaDe: "FILA_ROTEIRIZACAO",
                        LoginAnalistaPara: "fila_n1",
                        Estado: "Aguardando Atendimento",
                        CodigoChamado: numeroOS,
                        Descricao: `Não encontrado o endereço do cliente ${nomeDoFavorecido}, 
 por favor cadastrar o endereço e colocar na fila FILA_CHAMADOS ROTEIRIZADOS - ${data.toLocaleString().replace(/\//gi, "-")}`,
                        FormaDeAtendimento: "Telefone",
                        Causa: "",
                        DataInicio: "",
                        HoraInicio: "",
                        DataTermino: "",
                        HoraTermino: "",
                        DataInicioAgendamento: "",
                        HoraInicioAgendamento: "",
                        DataTerminoAgendamento: "",
                        HoraTerminoAgendamento: "",
                        Percentual: "0",
                        PrimeiroAtendimento: "0",
                        UsuarioLiberado: "0",
                        Publica: "1",
                        EnvioUsuario: "0",
                        EnvioAnalista: "0",
                        IncluirDica: "0",
                        EnvioObservador: "0",
                    });
                    // Envio do XML
                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader(
                        "Authorization",
                        "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ=="
                    );
                    inserirAcaoDescricao.setRequestHeader(
                        "Content-Type",
                        "application/json"
                    );
                    inserirAcaoDescricao.setRequestHeader(
                        "Access-Control-Allow-Origin",
                        "*"
                    );
                    inserirAcaoDescricao.setRequestHeader(
                        "Access-Control-Allow-Methods",
                        "*"
                    );
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                } else {
                    // Caso encontre o cliente
                    // Limpeza da reposta endereço para contrução do xml de abertura do serviço no GOON
                    const resformtJSON = JSON.parse(resformt);
                    const endereco = resformtJSON[0].endereco;
                    const textEndereco = String(endereco);
                    const arrayTextEndereco = textEndereco.split(",");
                    const rua = arrayTextEndereco[0];
                    const numeroEnd = arrayTextEndereco[1];
                    const urlServico =
                        "https://ws.goon.mobi/webservices/keeplefieldintegration.asmx?wsdl";
                    let openOrdemServico = new XMLHttpRequest();
                    openOrdemServico.open("POST", urlServico);
                    openOrdemServico.setRequestHeader(
                        "Content-Type",
                        "text/xml; charset=utf-8"
                    );
                    openOrdemServico.setRequestHeader(
                        "SOAPAction",
                        "http://www.equiperemota.com.br/OpenOrdemServicoWithClienteInfo"
                    );
                    // Limpeza das datas para contrução do xml de abertura do serviço no GOON
                    const dataCervelo = dataDeAberturaGoon;
                    const hour = dataCervelo.substring(11, 16);
                    const data = dataCervelo.substring(" ", 10).split("/", 3);
                    const dataAbertura =
                        data[2] + "-" + data[1] + "-" + data[0] + "T" + hour + ":00";
                    const inputDescricao = `${categoria} - ${tipo} - ${subItem}
                           
    \n____________________________________
    \n${descricaoChamado}
 
    `;

                    // adicionado em costantes as informações que vao no XML
                    const numero = numeroOS;
                    const authCode = "3D43565E84AABB3D7128925233AFEA946FF40C50";
                    const clientCode = "6WJDEXZI8DDPY9CRQITN";
                    const clientID = resformtJSON[0].codigo
                    const externalTipoServicoID = 1;
                    const externalID = numeroOS;
                    const externalClienteID = 1;
                    const prioridade = "N";
                    const contato = nomeDoFavorecido;
                    const dataSolicitacao = dataAbertura;
                    const descricao = inputDescricao;
                    const dataCriacao = dataAbertura;
                    const enderecos = rua;
                    const enderecoNumero = numeroEnd;
                    const enderecoBairro = resformtJSON[0].bairro;
                    const cidade = resformtJSON[0].cidade;
                    const uF = resformtJSON[0].uf;
                    const cEP = resformtJSON[0].cep;


                    let nome = nomeDoFavorecido

                    let teclado = "1234567890-=qwertyuiop`´{[ªasdfghjklç}]º\|zxcvbnm,<.>;:"
                    let arrayNome = [...nome.toLowerCase()]
                    let arrayTeclado = [...teclado]
                    console.log(arrayTeclado);

                    let codCliente = []
                    for (let i = 0; i < arrayNome.length; i++) {
                        codCliente += arrayTeclado.indexOf(arrayNome[i])

                    }
                    console.log(codCliente.toString().substring(0, 5));


                    // XML de abertura de serviço no GOON
                    let dataOrderService = `
                                    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
                                    <soap:Body>
                                    <OpenOrdemServicoWithClienteInfo xmlns="http://www.equiperemota.com.br">
                                    <authCode>${authCode}</authCode>
                                    <clientCode>${clientCode}</clientCode>
                                    <externalClienteID>${clientID}</externalClienteID>
                                    <clienteMatricula>${clientID}</clienteMatricula>
                                    <clienteNome>${nomeDoFavorecido}</clienteNome>
                                    <clienteEndereco>>${enderecos}</clienteEndereco>
                                    <clienteEnderecoNumero>${enderecoNumero}</clienteEnderecoNumero>
                                    <clienteEnderecoBairro>${enderecoBairro}</clienteEnderecoBairro>
                                    <clienteCidade>${cidade}</clienteCidade>
                                    <clienteUF>${uF}</clienteUF>
                                    <clienteCEP>${cEP}</clienteCEP>     
                                    <clienteAtivo>true</clienteAtivo>
                                    <clienteAtendidoEmTodosTiposServicos>true</clienteAtendidoEmTodosTiposServicos>
                                    <externalID>${externalID}</externalID>
                                    <externalClienteID>${externalClienteID}</externalClienteID>
                                    <externalTipoServicoID>${externalTipoServicoID}</externalTipoServicoID>
                                    <dataSolicitacao>${dataSolicitacao}</dataSolicitacao>
                                    <prioridade>${prioridade}</prioridade>
                                    <contatoNome>${contato.substring(0, 29)}</contatoNome>
                                    <endereco>${enderecos}</endereco>
                                    <enderecoNumero>${enderecoNumero}</enderecoNumero>
                                    <enderecoBairro>${enderecoBairro}</enderecoBairro>
                                    <cidade>${cidade}</cidade>
                                    <uF>${uF}</uF>
                                    <cEP>${cEP}</cEP>  
                                    <descricao>${descricao}</descricao>    
                                    <dataCriacao>${dataCriacao}</dataCriacao>
                                    <numeroOS>${numero}</numeroOS>
                                </OpenOrdemServicoWithClienteInfo>
                               </soap:Body>
                                    </soap:Envelope>
  `;
                    openOrdemServico.send(dataOrderService);
                    console.log(dataOrderService);

                    if (openOrdemServico.readyState == 4 && openOrdemServico.status == 200) {
                        console.log("criou?" + openOrdemServico.responseText);
                    }

                    //colocar o serviço para que possa ter o agendamento flexível
                    const urlServicoAcompanhamento =
                        "https://ws.goon.mobi/webservices/keeplefieldintegration.asmx?wsdl";
                    let acompanhamentoOrdemServico = new XMLHttpRequest();
                    acompanhamentoOrdemServico.open("POST", urlServicoAcompanhamento);
                    acompanhamentoOrdemServico.setRequestHeader(
                        "Content-Type",
                        "text/xml; charset=utf-8"
                    );
                    acompanhamentoOrdemServico.setRequestHeader(
                        "SOAPAction",
                        "http://www.equiperemota.com.br/SetAcompanhamentoOrdemServicoByNumeroOS"
                    );
                    let acompanhamentoOrdemServicoByNumeroOS = `
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<SetAcompanhamentoOrdemServicoByNumeroOS xmlns="http://www.equiperemota.com.br">
<authCode>9D56B9C66D047A4F46D66BEC3C3FB51C801E4A21</authCode>
<clientCode>6WJDEXZI8DDPY9CRQITN</clientCode>
<numeroOs>${numeroOS}</numeroOs>
<dataHoraAgendamento>${dataCriacao}</dataHoraAgendamento>
<dataHoraAgendamentoFlexivel>true</dataHoraAgendamentoFlexivel>
</SetAcompanhamentoOrdemServicoByNumeroOS>
</soap12:Body>
</soap12:Envelope>`;

                    acompanhamentoOrdemServico.send(acompanhamentoOrdemServicoByNumeroOS);
                    console.log(acompanhamentoOrdemServicoByNumeroOS);

                    //colocar o serviço para que possa ter o agendamento flexível
                    const urlServicoAcompanhamento2 =
                        "https://ws.goon.mobi/webservices/keeplefieldintegration.asmx?wsdl";
                    let acompanhamentoOrdemServico2 = new XMLHttpRequest();
                    acompanhamentoOrdemServico2.open("POST", urlServicoAcompanhamento2);
                    acompanhamentoOrdemServico2.setRequestHeader(
                        "Content-Type",
                        "text/xml; charset=utf-8"
                    );
                    acompanhamentoOrdemServico2.setRequestHeader(
                        "SOAPAction",
                        "http://www.equiperemota.com.br/SetAcompanhamentoOrdemServicoByNumeroOS"
                    );
                    let acompanhamentoOrdemServicoByNumeroOS2 = `
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
<soap12:Body>
<SetAcompanhamentoOrdemServicoByNumeroOS xmlns="http://www.equiperemota.com.br">
<authCode>9D56B9C66D047A4F46D66BEC3C3FB51C801E4A21</authCode>
<clientCode>6WJDEXZI8DDPY9CRQITN</clientCode>
<numeroOs>${numeroOS}</numeroOs>
<dataHoraAgendamento>${dataCriacao}</dataHoraAgendamento>
<dataHoraAgendamentoFlexivel>true</dataHoraAgendamentoFlexivel>
</SetAcompanhamentoOrdemServicoByNumeroOS>
</soap12:Body>
</soap12:Envelope>`;

                    acompanhamentoOrdemServico2.send(acompanhamentoOrdemServicoByNumeroOS2);
                    console.log(acompanhamentoOrdemServicoByNumeroOS2);

                    // inserir descrição do serviço criado
                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";
                    let inserirAcaoDescricao = new XMLHttpRequest();
                    inserirAcaoDescricao.onreadystatechange = function() {
                            // Reposta da requisição
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                console.log(inserirAcaoDescricao.responseText);
                            }
                        }
                        // XML da requisição
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": "FILA_ROTEIRIZACAO",
                        "Estado": "Aguardando Atendimento",
                        "CodigoChamado": numeroOS,
                        "Descricao": `Serviço criado no GOON \n <p hidden>GOON</p>`,
                        "FormaDeAtendimento": "Telefone",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"
                    });
                    // Envio do XML
                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                }
            }
        }

        // Cabeçalho da requisição do endereço

        xhrEndereco.open('POST', URLEndereco, true, "integracao", "G@Gebbgjtxtep5M");
        xhrEndereco.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
        xhrEndereco.setRequestHeader("Content-Type", "application/json");
        xhrEndereco.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhrEndereco.setRequestHeader("Access-Control-Allow-Methods", "*");
        xhrEndereco.send(dataEndereco);
    }
}
criaServico()

// Final função criar serviço

//         // Inicio das atualizações do serviço
async function atualizaServico() {
    var data = new Date();
    data.setDate(data.getDate());
    let diaSplit = data.toLocaleString().slice(0, 10).split("/")
    let diaAtual = diaSplit[2].replace(/, /,'') + "-" +(diaSplit[1] < 10 ? "0" + diaSplit[1] : diaSplit[1]) + "-" + (diaSplit[0] < 10 ? "0" + diaSplit[0] : diaSplit[0])
    console.log(diaAtual)
    data.setDate(data.getDate() - 59);
    let diaAnteriorSplit = data.toLocaleString().slice(0, 10).split("/")
    console.log(diaAnteriorSplit)
       let diaAnterior = diaAnteriorSplit[2].replace(/, /,'') + "-" +(diaAnteriorSplit[0] < 10 ? "0" + diaAnteriorSplit[0] : diaAnteriorSplit[0]) + "-" + (diaAnteriorSplit[1] < 10 ? "0" + diaAnteriorSplit[1] : diaAnteriorSplit[1])
    console.log("Anterior", diaAnterior, " Atual ",diaAtual)

    const obterDados = require('./obterDadosServico')
    const transResp = await obterDados({ diaAnterior, diaAtual})


    let arrayChamado = []
    for (let i = 0; i < transResp.length; i++) {
        arrayChamado += `{"numero":"${transResp[i].chamado}","fila":"${transResp[i].analista_Atual}","estado":"${transResp[i].estado}","analista":"${transResp[i].ultimo_Analista_De}"},`
    }

    console.log(arrayChamado);
    let arrayGrupoUltimoAnalistaDeGoon1 = [arrayChamado]
    let jsonLimpo = JSON.stringify(arrayGrupoUltimoAnalistaDeGoon1).replace(/\\/gi, '').replace(/\["/gi, '[').replace(/\,"]/gi, ']').replace(/[\u0000-\u001F]+/g, "")
    let resp = jsonLimpo

    let contentJSON = JSON.parse(resp)
    let array = [contentJSON][0]

    let filtro = array.filter(array => array.analista == "AGENTE_ROTEIRIZADOR")

    for (let i = 0; i < filtro.length; i++) {
        // Limpeza dos Arrays para construção do XML    
        let numeroOS = filtro[i].numero
        let categoria = filtro[i].categoria
        let tipo = filtro[i].tipo
        let subItem = filtro[i].subcategoria
        let nomeDoFavorecido = filtro[i].favorecido
        let dataDeAberturaGoon = filtro[i].data
        let arrayDataHora = dataDeAberturaGoon
        let descricaoChamado = filtro[i].descricao
        let estado = filtro[i].estado
        const url =
            "https://ws.goon.mobi/webservices/keeplefieldintegration.asmx?wsdl";

        let getAnswerFormBySevice = new XMLHttpRequest();
        getAnswerFormBySevice.open("POST", url, true);
        getAnswerFormBySevice.setRequestHeader(
            "Content-Type",
            "text/xml; charset=utf-8"
        );
        getAnswerFormBySevice.setRequestHeader(
            "SOAPAction",
            "http://www.equiperemota.com.br/GetAnswerFormByListOfOrdemServicoExternalID"
        );
        let getAnswerFormData = `
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
<soap:Body>
<GetAnswerFormByListOfOrdemServicoExternalID xmlns="http://www.equiperemota.com.br">
<authCode>0BBDB007766B96883955D694778E9EA30972FEF2</authCode>
<clientCode>6WJDEXZI8DDPY9CRQITN</clientCode>
<externalIDList>
<int>${numeroOS}</int>
</externalIDList>
</GetAnswerFormByListOfOrdemServicoExternalID>
</soap:Body>
</soap:Envelope>`;

        getAnswerFormBySevice.send(getAnswerFormData);
        console.log(getAnswerFormData);

        getAnswerFormBySevice.onreadystatechange = function() {
            if (getAnswerFormBySevice.readyState === 4) {
                let responseForm = getAnswerFormBySevice.responseText
                let res = JSON.stringify(responseForm)

                let resformt = res.replace(/u003c/gi, '<')
                    .replace(/u003e/gi, '>')
                    .replace(/\\/gi, '')
                    .replace('<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><soap:Body><GetAnswerFormByListOfOrdemServicoExternalIDResponse xmlns="http://www.equiperemota.com.br"><GetAnswerFormByListOfOrdemServicoExternalIDResult>{"success":true,"message":"","answersXML":"<?xml version="1.0" encoding="utf-8" ?>', '')
                    .replace('}</GetAnswerFormByListOfOrdemServicoExternalIDResult></GetAnswerFormByListOfOrdemServicoExternalIDResponse></soap:Body></soap:Envelope>"', '')
                let xml = resformt
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(xml, "text/html")
                console.log(xmlDoc);
                var numeroOSGoon = xmlDoc.getElementsByTagName("NumeroOS")[0]

                var nameGoon = xmlDoc.getElementsByTagName("MobileAgentName")
                let nameForGoon = "";
                for (let i = 0; i < nameGoon.length; i++) {
                    nameForGoon += nameGoon[i].textContent + ","
                }
                let nameArrayGoon = nameForGoon.split(',')
                let resNameArrayGoon = [nameArrayGoon][0]

                var dataHoraGoon = xmlDoc.getElementsByTagName("DataHora")
                let dataHoraForGoon = "";
                for (let i = 0; i < dataHoraGoon.length; i++) {
                    dataHoraForGoon += dataHoraGoon[i].textContent + ","
                }
                let dataHoraGoonArrayGoon = dataHoraForGoon.split(',')
                let resDataHoraGoonArrayGoon = [dataHoraGoonArrayGoon]
                console.log(resDataHoraGoonArrayGoon);

                let statusGoon = xmlDoc.getElementsByTagName("Status")
                let statusForGoon = "";
                for (let i = 0; i < statusGoon.length; i++) {
                    statusForGoon += statusGoon[i].textContent + ","
                }
                let statusArrayGoon = statusForGoon.split(',')
                let resStatusArrayGoon = [statusArrayGoon]
                let ultimoStatusGoon = resStatusArrayGoon[0].slice(-2)[0]
                console.log(numeroOS);
                console.log(resStatusArrayGoon);
                console.log(ultimoStatusGoon + "qro")
                console.log(estado);
                console.log(estado.includes("EM ATENDIMENTO"));
                let teste = ultimoStatusGoon.includes("FIOK1") === true ? "A" : "B"
                console.log(teste);

                if (ultimoStatusGoon.includes("COPE") === true && estado.includes("CANCELAR ATENDIMENTO") === false && estado.includes("NÃO ATENDIDO") == false) {
                    console.log('CANCELADO');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("COPE")
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon]

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("COPE")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": "FILA_NAO ATENDIDO",
                        "Estado": "NÃO ATENDIDO",
                        "CodigoChamado": numero,
                        "Descricao": `CANCELADO: ${dataStatusGOON} ${horaSatusGOON}\n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log("01" + inserirAcaoDescricaoData)

                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                            let res = JSON.parse(this.responseText)
                            let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/\"}/gi, '')
                            console.log("01" + resformt);

                            if (resformt == "ERRO: Chamado já está fechado!") {
                                console.log("01 Cancelado");
                            }
                        }
                    }

                } else if (ultimoStatusGoon.includes("CTEC") === true && estado.includes("CANCELAR ATENDIMENTO") === false && estado.includes("NÃO ATENDIDO") == false) {
                    console.log('CANCELADO');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("CTEC")
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon]

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("CTEC")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": "FILA_NAO ATENDIDO",
                        "Estado": "NÃO ATENDIDO",
                        "CodigoChamado": numero,
                        "Descricao": `CANCELADO: ${dataStatusGOON} ${horaSatusGOON}\n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log("02" + inserirAcaoDescricaoData)

                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                            let res = JSON.parse(this.responseText)
                            let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/\"}/gi, '')
                            console.log("a" + resformt);

                            if (resformt == "ERRO: Chamado já está fechado!") {
                                console.log("Cancelado");

                            }
                        }
                    }

                } else if (ultimoStatusGoon.includes("CCLI") === true && estado.includes("CANCELAR ATENDIMENTO") === false && estado.includes("NÃO ATENDIDO") == false) {
                    console.log('CANCELADO');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("CCLI")
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon]

                    let numero = numeroOSGoon.textContent
                    CTEC
                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("CCLI")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": "FILA_NAO ATENDIDO",
                        "Estado": "NÃO ATENDIDO",
                        "CodigoChamado": numero,
                        "Descricao": `CANCELADO: ${dataStatusGOON} ${horaSatusGOON}\n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log("03" + inserirAcaoDescricaoData);

                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                            let res = JSON.parse(this.responseText)
                            let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/\"}/gi, '')
                            console.log("a" + resformt);

                            if (resformt == "ERRO: Chamado já está fechado!") {
                                console.log("Cancelado");
                            }
                        }
                    }

                } else if (ultimoStatusGoon.includes("AGEN") === true && estado.includes("AGUARDANDO ATENDIMENTO") === false) {
                    console.log('AGUARDANDO ATENDIMENTO01');

                    let indiceNameGoon = resStatusArrayGoon.indexOf("AGEN")
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon]

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("AGEN")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": "FILA_ROTEIRIZACAO",
                        "Estado": "AGUARDANDO ATENDIMENTO",
                        "CodigoChamado": numero,
                        "Descricao": `AGUARDANDO ATENDIMENTO: ${dataStatusGOON} ${horaSatusGOON} - ${indeceNameGOONArray}
                                \n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                        }
                    }

                } else if (ultimoStatusGoon.includes("ACTE") === true && estado.includes("ACIONADO TECNICO PARCEIRO") === false) {
                    console.log('ACIONADO TECNICO PARCEIRO02');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("ACTE")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    console.log("nome do agente " + indeceNameGOONArray);

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("ACTE")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                        "Estado": "ACIONADO TECNICO PARCEIRO",
                        "CodigoChamado": numero,
                        "Descricao": `ACIONADO TECNICO PARCEIRO: ${dataStatusGOON} ${horaSatusGOON} - ${indeceNameGOONArray}
                                \n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                        }
                    }

                } else if (ultimoStatusGoon.includes("TACM") === true && estado.includes("EM DESLOCAMENTO") === false) {
                    console.log('EM DESLOCAMENTO03');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("TACM")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("TACM")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                        "Estado": "EM DESLOCAMENTO",
                        "CodigoChamado": numero,
                        "Descricao": `EM DESLOCAMENTO: ${dataStatusGOON} ${horaSatusGOON} - ${indeceNameGOONArray}
                                \n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                        }
                    }

                } else if (ultimoStatusGoon.includes("NOLO") === true && estado.includes("NO LOCAL DO CLIENTE") === false) {
                    console.log('NO LOCAL DO CLIENTE04');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("NOLO")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("NOLO")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                        "Estado": "NO LOCAL DO CLIENTE",
                        "CodigoChamado": numero,
                        "Descricao": `${dataStatusGOON} ${horaSatusGOON} - ${indeceNameGOONArray}
                                        \n<p style="color:white;">GOON</p>`,
                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })

                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                        }
                    }
                } else if (ultimoStatusGoon.includes("INIC") === true && estado.includes("EM ATENDIMENTO") === false) {
                    console.log('EM ATENDIMENTO');

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("INIC")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    let numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].indexOf("INIC")
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    const url =
                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                    let inserirAcaoDescricao = new XMLHttpRequest();
                    let inserirAcaoDescricaoData = JSON.stringify({
                        "TipoAcao": "Atendimento",
                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                        "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                        "Estado": "EM ATENDIMENTO",
                        "CodigoChamado": numero,
                        "Descricao": `${dataStatusGOON} ${horaSatusGOON} - ${indeceNameGOONArray}
                                \n<p style="color:white;">GOON</p>`,
                        "Causa": "",
                        "DataInicio": "",
                        "HoraInicio": "",
                        "DataTermino": "",
                        "HoraTermino": "",
                        "DataInicioAgendamento": "",
                        "HoraInicioAgendamento": "",
                        "DataTerminoAgendamento": "",
                        "HoraTerminoAgendamento": "",
                        "Percentual": "0",
                        "PrimeiroAtendimento": "0",
                        "UsuarioLiberado": "0",
                        "Publica": "1",
                        "EnvioUsuario": "0",
                        "EnvioAnalista": "0",
                        "IncluirDica": "0",
                        "EnvioObservador": "0"

                    })
                    inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                    console.log(inserirAcaoDescricaoData);
                    inserirAcaoDescricao.onreadystatechange = function() {
                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                            // Reposta da requisição e tratamento
                            console.log(this.responseText)
                        }
                    }
                } else if (ultimoStatusGoon.includes("FIOK1") === true && estado.includes("IMPRODUTIVO") === false) {

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("FIOK1")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    var numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].lastIndexOf("FIOK1") - 1
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    let fotoAntesValid = xmlDoc.getElementsByTagName("picture1")[0]
                    let fotoAntes = fotoAntesValid == undefined ? "" : fotoAntesValid.textContent
                    let fotoAntesCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoAntes.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let fotoDepoisValid = xmlDoc.getElementsByTagName("picture1")[1]
                    let fotoDepois = fotoDepoisValid == undefined ? "" : fotoDepoisValid.textContent
                    console.log(fotoDepois + "foto 02");
                    let fotoDepoisCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoDepois.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let textoXML = String(xmlDoc);
                    console.log(textoXML);
                    let assinatura = textoXML.substring(textoXML.search("ASSINATURA_DO_CLIENTE</Item><Answer>") + 36, textoXML.search("3d</Answer>") + 2)
                    console.log("assinatura:" + assinatura);
                    let assinaturaCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + assinatura.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    console.log(textoXML);
                    let descricaoFinalizado = textoXML.substring(textoXML.search("DESCRICAO_DO_SERVICO_REALIZADO</Item><Answer>") + 45, textoXML.search("</Answer></ItemAnswer><ItemAnswer><Item>FOTOS_DEPOIS"))

                    if (descricaoFinalizado != assinatura.search("FOTOS_DEPOIS") && assinatura != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoDepois != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoAntes != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=") {

                        const url =
                            "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                        let inserirAcaoDescricao = new XMLHttpRequest();
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/}}/gi, '').replace(/(^,)|(,$)/g, '')
                                console.log(resformt);
                                let transResp = JSON.parse(resformt)
                                console.log(transResp);

                            }
                        }

                        let inserirAcaoDescricaoData = JSON.stringify({
                            "TipoAcao": "Atendimento",
                            "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                            "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                            "Estado": "IMPRODUTIVO",
                            "CodigoChamado": numero,
                            "Descricao": `
                                    IMPRODUTIVO - ${indeceNameGOONArray} - ${dataStatusGOON} ${horaSatusGOON}
                                    \n_________________________________________________________
                                    Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                    \n Descrição: ${descricaoFinalizado}
                                    \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                    \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                    \n _________________________________________________________
                                    
                                    `,
                            "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                            "Causa": "OUTROS",
                            "DataInicio": "",
                            "HoraInicio": "",
                            "DataTermino": "",
                            "HoraTermino": "",
                            "DataInicioAgendamento": "",
                            "HoraInicioAgendamento": "",
                            "DataTerminoAgendamento": "",
                            "HoraTerminoAgendamento": "",
                            "Percentual": "0",
                            "PrimeiroAtendimento": "0",
                            "UsuarioLiberado": "0",
                            "Publica": "1",
                            "EnvioUsuario": "0",
                            "EnvioAnalista": "0",
                            "IncluirDica": "0",
                            "EnvioObservador": "0"

                        })
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                            }
                        }

                        inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                        inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                        inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                        inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                        console.log(inserirAcaoDescricaoData);


                    }
                } else if (ultimoStatusGoon.includes("FIOK2") === true && estado.includes("NÃO ATENDIDO") === false) {

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("FIOK2")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    var numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].lastIndexOf("FIOK2") - 1
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    let fotoAntesValid = xmlDoc.getElementsByTagName("picture1")[0]
                    let fotoAntes = fotoAntesValid == undefined ? "" : fotoAntesValid.textContent
                    let fotoAntesCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoAntes.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let fotoDepoisValid = xmlDoc.getElementsByTagName("picture1")[1]
                    let fotoDepois = fotoDepoisValid == undefined ? "" : fotoDepoisValid.textContent
                    console.log(fotoDepois + "foto 02");
                    let fotoDepoisCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoDepois.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let textoXML = String(xmlDoc);
                    console.log(textoXML);
                    let assinatura = textoXML.substring(textoXML.search("ASSINATURA_DO_CLIENTE</Item><Answer>") + 36, textoXML.search("3d</Answer>") + 2)
                    console.log("assinatura:" + assinatura);
                    let assinaturaCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + assinatura.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    console.log(textoXML);
                    let descricaoFinalizado = textoXML.substring(textoXML.search("DESCRICAO_DO_SERVICO_REALIZADO</Item><Answer>") + 45, textoXML.search("</Answer></ItemAnswer><ItemAnswer><Item>FOTOS_DEPOIS"))

                    if (descricaoFinalizado != assinatura.search("FOTOS_DEPOIS") && assinatura != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoDepois != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoAntes != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=") {

                        const url =
                            "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                        let inserirAcaoDescricao = new XMLHttpRequest();
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/}}/gi, '').replace(/(^,)|(,$)/g, '')
                                console.log(resformt);
                                let transResp = JSON.parse(resformt)
                                console.log(transResp);

                            }
                        }

                        let inserirAcaoDescricaoData = JSON.stringify({
                            "TipoAcao": "Atendimento",
                            "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                            "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                            "Estado": "NÃO ATENDIDO",
                            "CodigoChamado": numero,
                            "Descricao": `
                                            NÃO ATENDIDO - ${indeceNameGOONArray} - ${dataStatusGOON} ${horaSatusGOON}
                                    \n_________________________________________________________
                                    Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                    \n Descrição: ${descricaoFinalizado}
                                    \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                    \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                    \n _________________________________________________________
                                    
                                    `,
                            "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                            "Causa": "OUTROS",
                            "DataInicio": "",
                            "HoraInicio": "",
                            "DataTermino": "",
                            "HoraTermino": "",
                            "DataInicioAgendamento": "",
                            "HoraInicioAgendamento": "",
                            "DataTerminoAgendamento": "",
                            "HoraTerminoAgendamento": "",
                            "Percentual": "0",
                            "PrimeiroAtendimento": "0",
                            "UsuarioLiberado": "0",
                            "Publica": "1",
                            "EnvioUsuario": "0",
                            "EnvioAnalista": "0",
                            "IncluirDica": "0",
                            "EnvioObservador": "0"

                        })

                        inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                        inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                        inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                        inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                        console.log(inserirAcaoDescricaoData);

                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                            }
                        }
                    }
                } else if (ultimoStatusGoon.includes("FIOK3") === true && estado.includes("PENDENTE RETORNO DE EQUIPAMENTO") === false) {

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("FIOK3")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    var numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].lastIndexOf("FIOK3") - 1
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    let fotoAntesValid = xmlDoc.getElementsByTagName("picture1")[0]
                    let fotoAntes = fotoAntesValid == undefined ? "" : fotoAntesValid.textContent
                    let fotoAntesCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoAntes.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let fotoDepoisValid = xmlDoc.getElementsByTagName("picture1")[1]
                    let fotoDepois = fotoDepoisValid == undefined ? "" : fotoDepoisValid.textContent
                    console.log(fotoDepois + "foto 02");
                    let fotoDepoisCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoDepois.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let textoXML = String(xmlDoc);
                    console.log(textoXML);
                    let assinatura = textoXML.substring(textoXML.search("ASSINATURA_DO_CLIENTE</Item><Answer>") + 36, textoXML.search("3d</Answer>") + 2)
                    console.log("assinatura:" + assinatura);
                    let assinaturaCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + assinatura.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    console.log(textoXML);
                    let descricaoFinalizado = textoXML.substring(textoXML.search("DESCRICAO_DO_SERVICO_REALIZADO</Item><Answer>") + 45, textoXML.search("</Answer></ItemAnswer><ItemAnswer><Item>FOTOS_DEPOIS"))

                    if (descricaoFinalizado != assinatura.search("FOTOS_DEPOIS") && assinatura != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoDepois != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoAntes != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=") {

                        const url =
                            "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                        let inserirAcaoDescricao = new XMLHttpRequest();
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/}}/gi, '').replace(/(^,)|(,$)/g, '')
                                console.log(resformt);
                                let transResp = JSON.parse(resformt)
                                console.log(transResp);

                            }
                        }

                        let inserirAcaoDescricaoData = JSON.stringify({
                            "TipoAcao": "Atendimento",
                            "LoginAnalistaDe": "FILA_PENDENTE",
                            "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                            "Estado": "PENDENTE RETORNO DE EQUIPAMENTO",
                            "CodigoChamado": numero,
                            "Descricao": `
                                    PENDENTE RETORNO DE EQUIPAMENTO - ${indeceNameGOONArray} - ${dataStatusGOON} ${horaSatusGOON}
                                    \n_________________________________________________________
                                    Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                    \n Descrição: ${descricaoFinalizado}
                                    \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                    \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                    \n _________________________________________________________
                                    
                                    `,
                            "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                            "Causa": "OUTROS",
                            "DataInicio": "",
                            "HoraInicio": "",
                            "DataTermino": "",
                            "HoraTermino": "",
                            "DataInicioAgendamento": "",
                            "HoraInicioAgendamento": "",
                            "DataTerminoAgendamento": "",
                            "HoraTerminoAgendamento": "",
                            "Percentual": "0",
                            "PrimeiroAtendimento": "0",
                            "UsuarioLiberado": "0",
                            "Publica": "1",
                            "EnvioUsuario": "0",
                            "EnvioAnalista": "0",
                            "IncluirDica": "0",
                            "EnvioObservador": "0"

                        })

                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                            }
                        }
                        inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                        inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                        inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                        inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                        console.log(inserirAcaoDescricaoData);


                    }
                } else if (ultimoStatusGoon.includes("FIOK4") === true && estado.includes("PENDENTE DE PECA") === false) {

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("FIOK4")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    var numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].lastIndexOf("FIOK4") - 1
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    let fotoAntesValid = xmlDoc.getElementsByTagName("picture1")[0]
                    let fotoAntes = fotoAntesValid == undefined ? "" : fotoAntesValid.textContent
                    let fotoAntesCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoAntes.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let fotoDepoisValid = xmlDoc.getElementsByTagName("picture1")[1]
                    let fotoDepois = fotoDepoisValid == undefined ? "" : fotoDepoisValid.textContent
                    console.log(fotoDepois + "foto 02");
                    let fotoDepoisCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoDepois.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let textoXML = String(xmlDoc);
                    console.log(textoXML);
                    let assinatura = textoXML.substring(textoXML.search("ASSINATURA_DO_CLIENTE</Item><Answer>") + 36, textoXML.search("3d</Answer>") + 2)
                    console.log("assinatura:" + assinatura);
                    let assinaturaCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + assinatura.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    console.log(textoXML);
                    let descricaoFinalizado = textoXML.substring(textoXML.search("DESCRICAO_DO_SERVICO_REALIZADO</Item><Answer>") + 45, textoXML.search("</Answer></ItemAnswer><ItemAnswer><Item>FOTOS_DEPOIS"))

                    if (descricaoFinalizado != assinatura.search("FOTOS_DEPOIS") && assinatura != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoDepois != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoAntes != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=") {

                        const url =
                            "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                        let inserirAcaoDescricao = new XMLHttpRequest();
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/}}/gi, '').replace(/(^,)|(,$)/g, '')
                                console.log(resformt);
                                let transResp = JSON.parse(resformt)
                                console.log(transResp);

                            }
                        }

                        let inserirAcaoDescricaoData = JSON.stringify({
                            "TipoAcao": "Atendimento",
                            "LoginAnalistaDe": "FILA_PENDENTE",
                            "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                            "Estado": "PENDENTE DE PECA",
                            "CodigoChamado": numero,
                            "Descricao": `
                                    PENDENTE DE PECA - ${indeceNameGOONArray} - ${dataStatusGOON} ${horaSatusGOON}
                                    \n_________________________________________________________
                                    Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                    \n Descrição: ${descricaoFinalizado}
                                    \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                    \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                    \n _________________________________________________________                                    
                                    `,
                            "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                            "Causa": "OUTROS",
                            "DataInicio": "",
                            "HoraInicio": "",
                            "DataTermino": "",
                            "HoraTermino": "",
                            "DataInicioAgendamento": "",
                            "HoraInicioAgendamento": "",
                            "DataTerminoAgendamento": "",
                            "HoraTerminoAgendamento": "",
                            "Percentual": "0",
                            "PrimeiroAtendimento": "0",
                            "UsuarioLiberado": "0",
                            "Publica": "1",
                            "EnvioUsuario": "0",
                            "EnvioAnalista": "0",
                            "IncluirDica": "0",
                            "EnvioObservador": "0"

                        })

                        inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                        inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                        inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                        inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                        console.log(inserirAcaoDescricaoData);

                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                            }
                        }
                    }
                } else if (ultimoStatusGoon.includes("FIOK5") === true && estado.includes("PENDENTE SOFTWARE") === false) {

                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("FIOK5")
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon[indiceNameGoon].split(re)

                    var numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].lastIndexOf("FIOK5") - 1
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON].split(" ")
                    let dataStatusGOON = indeceStatusGOONArray[0]
                    let horaSatusGOON = indeceStatusGOONArray[1]

                    let fotoAntesValid = xmlDoc.getElementsByTagName("picture1")[0]
                    let fotoAntes = fotoAntesValid == undefined ? "" : fotoAntesValid.textContent
                    let fotoAntesCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoAntes.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let fotoDepoisValid = xmlDoc.getElementsByTagName("picture1")[1]
                    let fotoDepois = fotoDepoisValid == undefined ? "" : fotoDepoisValid.textContent
                    console.log(fotoDepois + "foto 02");
                    let fotoDepoisCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoDepois.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let textoXML = String(xmlDoc);
                    console.log(textoXML);
                    let assinatura = textoXML.substring(textoXML.search("ASSINATURA_DO_CLIENTE</Item><Answer>") + 36, textoXML.search("3d</Answer>") + 2)
                    console.log("assinatura:" + assinatura);
                    let assinaturaCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + assinatura.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    console.log(textoXML);
                    let descricaoFinalizado = textoXML.substring(textoXML.search("DESCRICAO_DO_SERVICO_REALIZADO</Item><Answer>") + 45, textoXML.search("</Answer></ItemAnswer><ItemAnswer><Item>FOTOS_DEPOIS"))

                    if (descricaoFinalizado != assinatura.search("FOTOS_DEPOIS") && assinatura != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoDepois != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoAntes != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=") {

                        const url =
                            "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                        let inserirAcaoDescricao = new XMLHttpRequest();
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/}}/gi, '').replace(/(^,)|(,$)/g, '')
                                console.log(resformt);
                                let transResp = JSON.parse(resformt)
                                console.log(transResp);

                            }
                        }

                        let inserirAcaoDescricaoData = JSON.stringify({
                            "TipoAcao": "Atendimento",
                            "LoginAnalistaDe": "FILA_PENDENTE",
                            "LoginAnalistaPara": `${indeceNameGOONArray[0]}.${indeceNameGOONArray.pop()}`,
                            "Estado": "PENDENTE SOFTWARE",
                            "CodigoChamado": numero,
                            "Descricao": `
                                    PENDENTE SOFTWARE - ${indeceNameGOONArray} - ${dataStatusGOON} ${horaSatusGOON}
                                    \n_________________________________________________________
                                    Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                    \n Descrição: ${descricaoFinalizado}
                                    \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                    \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                    \n _________________________________________________________                                    
                                    `,
                            "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                            "Causa": "OUTROS",
                            "DataInicio": "",
                            "HoraInicio": "",
                            "DataTermino": "",
                            "HoraTermino": "",
                            "DataInicioAgendamento": "",
                            "HoraInicioAgendamento": "",
                            "DataTerminoAgendamento": "",
                            "HoraTerminoAgendamento": "",
                            "Percentual": "0",
                            "PrimeiroAtendimento": "0",
                            "UsuarioLiberado": "0",
                            "Publica": "1",
                            "EnvioUsuario": "0",
                            "EnvioAnalista": "0",
                            "IncluirDica": "0",
                            "EnvioObservador": "0"

                        })

                        inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                        inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                        inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                        inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                        console.log(inserirAcaoDescricaoData);

                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                            }
                        }
                    }
                } else if (ultimoStatusGoon.includes("FIOK") === true && estado.includes("CONCLUIDO") === false) {

                    console.log("e este" + resStatusArrayGoon);
                    let indiceNameGoon = resStatusArrayGoon[0].indexOf("FIOK")
                    console.log(indiceNameGoon);
                    let re = [" "];
                    let indeceNameGOONArray = resNameArrayGoon


                    var numero = numeroOSGoon.textContent

                    let indiceStatusGOON = resStatusArrayGoon[0].lastIndexOf("FIOK") - 1
                    console.log("e menos dois" + indiceStatusGOON[0]);
                    let indeceStatusGOONArray = resDataHoraGoonArrayGoon[0][indiceStatusGOON]
                    let dataStatusGOON = indeceStatusGOONArray
                    let horaSatusGOON = indeceStatusGOONArray


                    let fotoAntesValid = xmlDoc.getElementsByTagName("picture1")[0]
                    let fotoAntes = fotoAntesValid == undefined ? "" : fotoAntesValid.textContent
                    let fotoAntesCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoAntes.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let fotoDepoisValid = xmlDoc.getElementsByTagName("picture1")[1]
                    let fotoDepois = fotoDepoisValid == undefined ? "" : fotoDepoisValid.textContent
                    console.log(fotoDepois + "foto 02");
                    let fotoDepoisCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + fotoDepois.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    let textoXML = String(xmlDoc);
                    console.log(textoXML);
                    let assinatura = textoXML.substring(textoXML.search("ASSINATURA_DO_CLIENTE</Item><Answer>") + 36, textoXML.search("3d</Answer>") + 2)
                    console.log("assinatura:" + assinatura);
                    let assinaturaCod = 'https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=' + assinatura.replace("http://app.goon.mobi/external-services/form-image/", "") + '&isThumb=false'

                    console.log(textoXML);
                    let descricaoFinalizado = textoXML.substring(textoXML.search("DESCRICAO_DO_SERVICO_REALIZADO</Item><Answer>") + 45, textoXML.search("</Answer></ItemAnswer><ItemAnswer><Item>FOTOS_DEPOIS"))

                    if (descricaoFinalizado != assinatura.search("FOTOS_DEPOIS") && assinatura != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoDepois != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=" && fotoAntes != "https://api.goon.mobi/api/Service/Form/FormAnswer/Picture/Get?imageId=") {

                        const url =
                            "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                        let inserirAcaoDescricao = new XMLHttpRequest();
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/}}/gi, '').replace(/(^,)|(,$)/g, '')
                                console.log(resformt);
                                let transResp = JSON.parse(resformt)
                                console.log(transResp);

                            }
                        }
                        let nomeAgente = indeceNameGOONArray[0].split(" ")
                        console.log(nomeAgente);
                        let inserirAcaoDescricaoData = JSON.stringify({
                            "TipoAcao": "Atendimento",
                            "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                            "LoginAnalistaPara": `${nomeAgente[0]}.${nomeAgente[nomeAgente.length -1]}`,
                            "Estado": "CONCLUIDO",
                            "CodigoChamado": numero,
                            "Descricao": `
                                    Concluido - ${nomeAgente} - ${dataStatusGOON} 
                                    \n_________________________________________________________
                                    Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                    \n Descrição: ${descricaoFinalizado}
                                    \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                    \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                    \n _________________________________________________________
                                    
                                    `,
                            "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                            "Causa": "OUTROS",
                            "DataInicio": "",
                            "HoraInicio": "",
                            "DataTermino": "",
                            "HoraTermino": "",
                            "DataInicioAgendamento": "",
                            "HoraInicioAgendamento": "",
                            "DataTerminoAgendamento": "",
                            "HoraTerminoAgendamento": "",
                            "Percentual": "0",
                            "PrimeiroAtendimento": "0",
                            "UsuarioLiberado": "0",
                            "Publica": "1",
                            "EnvioUsuario": "0",
                            "EnvioAnalista": "0",
                            "IncluirDica": "0",
                            "EnvioObservador": "0"

                        })

                        inserirAcaoDescricao.open('POST', url, true, "integracao", "G@Gebbgjtxtep5M");
                        inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                        inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                        inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                        inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                        console.log(inserirAcaoDescricaoData);
                        inserirAcaoDescricao.onreadystatechange = function() {
                            if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                // Reposta da requisição e tratamento
                                console.log(this.responseText)
                                let res = JSON.parse(this.responseText)
                                let resformt = res.replace(/\\\\/gi, '').replace(/\\/gi, '').replace(/{"dados":"ERRO: /gi, '').replace(/\"}/gi, '')
                                console.log(resformt);

                                if (resformt == -59) {

                                    const url =
                                        "https://www.cervelloesm.com.br/Arklok/api/Atendimento/InserirAcao";

                                    let inserirAcaoDescricao = new XMLHttpRequest();
                                    inserirAcaoDescricao.onreadystatechange = function() {
                                        if (inserirAcaoDescricao.readyState == 4 && inserirAcaoDescricao.status == 200) {
                                            // Reposta da requisição e tratamento
                                            console.log("finalizado" + this.responseText)
                                        }
                                    }

                                    let inserirAcaoDescricaoData = JSON.stringify({
                                        "TipoAcao": "Atendimento",
                                        "LoginAnalistaDe": "TECNICA_ROTEIRIZADA",
                                        "LoginAnalistaPara": `${nomeAgente[0]}.${nomeAgente[nomeAgente.length -1]}`,
                                        "Estado": "CONLUÍDO – PAI",
                                        "CodigoChamado": numero,
                                        "Descricao": `
                                        Concluido - ${nomeAgente} - ${dataStatusGOON} ${horaSatusGOON}
                                        \n_________________________________________________________
                                        Foto antes:<img src="${fotoAntesCod}" style="height:300px; width:300px">
                                        \n Descrição: ${descricaoFinalizado}
                                        \nFoto depois:<img src="${fotoDepoisCod}" style="height:300px; width:300px">   
                                        \n Assinatura:<img src="${assinaturaCod}" style="height:300px; width:300px"> 
                                        \n _________________________________________________________
                                        
                                        `,
                                        "FormaDeAtendimento": "ATENDIMENTO LOCAL",
                                        "Causa": "OUTROS",
                                        "DataInicio": "",
                                        "HoraInicio": "",
                                        "DataTermino": "",
                                        "HoraTermino": "",
                                        "DataInicioAgendamento": "",
                                        "HoraInicioAgendamento": "",
                                        "DataTerminoAgendamento": "",
                                        "HoraTerminoAgendamento": "",
                                        "Percentual": "0",
                                        "PrimeiroAtendimento": "0",
                                        "UsuarioLiberado": "0",
                                        "Publica": "1",
                                        "EnvioUsuario": "0",
                                        "EnvioAnalista": "0",
                                        "IncluirDica": "0",
                                        "EnvioObservador": "0"

                                    })

                                    inserirAcaoDescricao.open('POST', URLServicos, true, "integracao", "G@Gebbgjtxtep5M");
                                    inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                                    inserirAcaoDescricao.withCredentials = true;
                                    inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                                    inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                                    inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                                    console.log(inserirAcaoDescricaoData);
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

atualizaServico()
    // Final das atualizações do serviço
const services = () => {
    setInterval(() => {
        atualizaServico()
        criaServico()
    }, 60000);
}

app.listen(port, console.log(`Conectado, localhost:${port}`), services);
