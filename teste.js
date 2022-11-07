var data = new Date();
data.setDate(data.getDate());
let diaAtual = data.toLocaleString().slice(0, 10)
data.setDate(data.getDate() - 14);
let diaAnterior = data.toLocaleString().slice(0, 10)
console.log(diaAnterior, diaAtual)