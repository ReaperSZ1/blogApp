const mongoose = require('mongoose')

const CategoriaSchema = new mongoose.Schema({
    nome: { type: String, required: true},
    slug: { type: String, required: true},
    data: { type: Date, default: Date.now()}
})

module.exports = mongoose.model('categorias', CategoriaSchema)