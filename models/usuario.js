const mongoose = require('mongoose')

const usuario = new mongoose.Schema({
    nome:{ type: String, required: true},
    email:{ type: String, required: true},
    senha:{ type: String, required: true},
    eAdmin:{ type: Number, default: 0} // todo usuario recebe 0(Não é admin), caso seja isso será 1
})

module.exports = mongoose.model('usuarios', usuario)