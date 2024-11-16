const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postagem = new Schema({
    titulo: { type: String, required: true},
    slug: { type: String, required: true},
    descricao: { type: String, required: true},
    conteudo: { type: String, required: true},
    categoria: {
        // referenciar uma categoria que já exista
        type: Schema.Types.ObjectId, // id de uma categoria na collection categoria
        ref: "categorias", // chama o model categoria criado no documento: c:\nodejs\blogapp\models\categoria.js
        required: true
    },
    data: { type: Date, default: Date.now() }
})
module.exports = mongoose.model('postagens', postagem)