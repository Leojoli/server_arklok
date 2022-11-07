var express = require("express");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var DOMParser = require("xmldom").DOMParser;
var app = express();
var port = process.env.PORT || 30004;

const servicesDespachados = () => {
    setInterval(() => {
        // Hora atual
        var time = new Date()
        var hora = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })


        let horaDespachado = "10:00 PM"

        console.log(hora);

        if (horaDespachado === hora) {
            (function() {
                // Coletar periodo da requisição
                let time = new Date();
                let datatxt = time.toLocaleString({ hour: "numeric" })
                let dataAtual = datatxt.slice(0, 10).split("/");
                let data = dataAtual[2] + "-" + dataAtual[1] + "-" + dataAtual[0]
                let url = 'https://ws.goon.mobi/webservices/keeplefieldintegration.asmx?wsdl';
                let xhr = new XMLHttpRequest();
                let dataService = `   
   <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <GetAllocatedOrdersByAgentStrDate xmlns="http://www.equiperemota.com.br">
    <authCode>40CDFFB20A82FEBF852B636011C2133B55712C35</authCode>
    <clientCode>6WJDEXZI8DDPY9CRQITN</clientCode>
    <dataFinalizacaoCancelamento>${data.replace(",","")}T00:00:00</dataFinalizacaoCancelamento>
     <flowStateTag>DESP</flowStateTag>
    </GetAllocatedOrdersByAgentStrDate>
  </soap:Body>
</soap:Envelope>

    `;
                console.log(dataService);

                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let resp = JSON.stringify(this.responseText);
                        let inicio = resp.search('answersXML') + 13;
                        let fim = resp.search("</GetAllocatedOrdersByAgentStrDateResult>");
                        let respFormts = resp.substring(inicio, fim);
                        let respFormtsReplace = respFormts.replace(/u003c/gi, '<')
                            .replace(/u003e/gi, '>')
                            .replace(/\\/gi, '')
                            .replace(/}/gi, '')
                            .replace(/"/gi, '')
                            .replace('<?xml version=1.0 encoding=utf-8 ?>', '')
                        let xml = respFormtsReplace
                        let parser = new DOMParser();
                        let xmlDoc = parser.parseFromString(xml, "text/html")
                        let numeroOSGoon = xmlDoc.getElementsByTagName("NumeroOS")
                        for (let i = 0; i < numeroOSGoon.length; i++) {
                            const url =
                                "https://www.cervelloesmhomolog.com.br/Arklok/api/Atendimento/InserirAcao";
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
                                "LoginAnalistaDe": "Integracao_TrackerUp",
                                "LoginAnalistaPara": "NAO ATENDIDO",
                                "Estado": "Aguardando Atendimento",
                                "CodigoChamado": numeroOSGoon[i].textContent,
                                "Descricao": `Serviço não iniciado pelo técnico 01`,
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
                            inserirAcaoDescricao.open('POST', url, true);
                            inserirAcaoDescricao.setRequestHeader("Authorization", "Basic Y2VydmVsbG86Y2VydmVsbG8wMQ==");
                            inserirAcaoDescricao.setRequestHeader("Content-Type", "application/json");
                            inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Origin", "*")
                            inserirAcaoDescricao.setRequestHeader("Access-Control-Allow-Methods", "*")
                            inserirAcaoDescricao.send(inserirAcaoDescricaoData);
                            console.log(inserirAcaoDescricaoData);
                        }
                    }
                };

                xhr.open('POST', url, true);
                xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
                xhr.setRequestHeader("SOAPAction", "http://www.equiperemota.com.br/GetAllocatedOrdersByAgentStrDate");
                xhr.send(dataService);
            })()
        } else {
            console.log("Fora do Horário");
        }
    }, 60000);

}

servicesDespachados()
app.listen(port, console.log(`Conectado, localhost:${port}`), servicesDespachados());