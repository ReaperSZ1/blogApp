const express = require('express')
const router = express.Router() // para importar rotas
const categoria = require('../models/categoria')  // importa o: mongoose.model('categorias')  
const postagem = require('../models/postagens')
const {eAdmin} = require('../helpers/eadmin') // pega apenas a função eAdmin do objeto exportado

// routes
    router.get('/', eAdmin, (req, res) => {
        res.render('admin/index')
    })

    router.get('/posts', eAdmin, (req, res) => {
        res.send('Bem vindo a pagina de posts')
    })

    router.get('/categorias', eAdmin, (req, res) => {
        // listando todas as categorias existentes
        categoria.find().lean().sort({data: 'desc'}).then((categorias) => {
            res.render('admin/categorias', {categoria: categorias})
        }).catch((err) => { 
            req.flash("errorMsg", 'houve um erro ao criar a categoria')
            res.redirect("/admin")
        })
    })

    router.get('/categorias/add', eAdmin, (req, res) => {
        res.render('admin/addCategorias') // renderiza o arquivo .handlebars
    })

    router.post('/categorias/nova', eAdmin, (req, res) => {
        // validação de formulário
            let erros = []
            if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
                erros.push({texto: 'nome inválido'})
            } 
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto: 'texto slug inválido'})
            } 
            if(req.body.nome.length < 2){
                erros.push({texto: 'nome da categoria muito pequeno'})
            }
            if(erros.length > 0){
                res.render('admin/addCategorias', {erros: erros})
            } else {
                // colocando os dados da req no schema da categoria
                new categoria({ nome: req.body.nome, slug: req.body.slug }).save()
                    .then(() => { 
                        req.flash("successMsg", 'categoria criada com sucesso') // atribui a msg a variavel global successMsg
                        res.redirect('/admin/categorias') 
                    })
                    .catch((err) => { 
                        req.flash("errorMsg", 'houve um erro ao criar a categoria')
                        res.redirect("/admin/categorias")
                    })
            }
    }) 

    router.get('/categorias/edit/:id', eAdmin, (req, res) => {
        // colocando as informações da cat no campo de editar categoria
            categoria.findOne({_id: req.params.id}).then((categoria) => {
                res.render('admin/editCategoria', {categoria: categoria})
            }).catch((err) => {
                req.flash('errorMsg', 'categoria não encontrada')
                res.redirect('/admin/categorias')
            })
    })

    router.post('/categorias/edit', eAdmin, (req, res) => {
        // validação de formulário 
            let erros = []
            if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
                erros.push({texto: 'nome inválido'})
            } 
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto: 'texto slug inválido'})
            } 
            if(req.body.nome.length < 2){
                erros.push({texto: 'nome da categoria muito pequeno'})
            }
            if(erros.length > 0){
                categoria.findOne({_id: req.body.id}).then((categoria) => {
                    res.render('admin/editCategoria', {erros: erros, categoria: categoria})
                }).catch((err) => {
                    req.flash('errorMsg', 'categoria não encontrada, Tente novamente')
                    res.redirect('/admin/categorias')
                })
            } else {
                // procura a categoria na db e faz as alterações
                categoria.findOne({_id: req.body.id}).then((categoria) => {
                    // editando a categoria no db
                        categoria.nome = req.body.nome
                        categoria.slug = req.body.slug
                    categoria.save().then(() => {
                        req.flash("successMsg", 'categoria editada com sucesso') 
                        res.redirect('/admin/categorias')
                    }).catch((err) => {
                        req.flash('errorMsg', 'houve um erro ao editar a categoria')
                        res.redirect('/admin/categorias')
                    })
                }).catch((err) => {
                    req.flash('errorMsg', 'houve um erro ao editar a categoria')
                    res.redirect('/admin/categorias')
                })
            }
            
    })
    router.post('/categorias/deletar', eAdmin, (req, res) => {
        categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash("successMsg", 'categoria deletada com sucesso') 
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('errorMsg', 'houve um erro ao deletar a categoria')
            res.redirect('/admin/categorias')
        })
    })

    router.get('/postagens', eAdmin, (req, res) => {
        // listando todas as postagens existentes
        // ao usar o obejctid usa-se populate pra chamar o campo (categoria) no db, no handl... usa-se categoria.nome
            postagem.find().populate("categoria").sort({data:'desc'}).then((postagens) => {
                res.render('admin/postagens', {postagens:postagens})
            }).catch((err) => { 
                req.flash("errorMsg", 'houve um erro ao listar as postagens')
                res.redirect("/admin")
            })
    })

    router.get('/postagens/add', eAdmin, (req, res) => {
        categoria.find().lean().then((categorias) => {
            res.render('admin/addPostagens', {categoria: categorias})
        }).catch((err) => {
            req.flash('errorMsg', 'houve um erro ao carregar o formulário')
            res.redirect('/admin/postagens')
        })
    })
    router.post('/postagens/nova', eAdmin, (req, res) => {
        // validação de formulário
            let erros = []

            if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
                erros.push({texto: 'titulo inválido'})
            } 
            if(req.body.titulo.length < 2){
                erros.push({texto: 'titulo da Postagem muito pequeno'})
            }
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto: 'texto slug inválido'})
            } 
            if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
                erros.push({texto: 'Descrição inválida'})
            } 
            if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
                erros.push({texto: 'Conteúdo inválido'})
            } 
            if(req.body.categoria == '0'){ // caso nao encontre nenhuma categoria
                erros.push({texto: 'Categoria Invalida, Registre uma categoria'})
            }
            if(erros.length > 0){
                res.render('admin/addPostagens', {erros: erros})
            } else {
                const novaPostagem = {
                    titulo: req.body.titulo,
                    slug: req.body.slug,
                    descricao: req.body.descricao,
                    conteudo: req.body.conteudo,
                    categoria: req.body.categoria
                }
                new postagem(novaPostagem).save()
                    .then(() => { 
                        req.flash("successMsg", 'Postagem criada com sucesso') 
                        res.redirect('/admin/postagens') 
                    })
                    .catch((err) => { 
                        req.flash("errorMsg", 'houve um erro ao criar a postagem\n' + err)
                        res.redirect("/admin/postagens")
                    })
            }
    })
    router.get('/postagens/edit/:id', eAdmin, (req, res) => {
        postagem.findOne({_id: req.params.id}).then((postagem) => {
            categoria.find().lean().then((categorias) => {
                res.render('admin/editPostagens', {categoria:categorias, postagem:postagem})
            }).catch((err) => {
                req.flash('errorMsg', 'Houve um erro ao carregar as categorias')
                res.redirect('/admin/postagens')
            })
        }).catch((err) => {
            req.flash('errorMsg', 'Postagem não encontrada')
            res.redirect('/admin/postagens')
        })
    })

    router.post('/postagens/edit', eAdmin, (req, res) => {
        // validação de formulário
        let erros = []

        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: 'titulo inválido'})
        } 
        if(req.body.titulo.length < 2){
            erros.push({texto: 'titulo da Postagem muito pequeno'})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: 'texto slug inválido'})
        } 
        if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
            erros.push({texto: 'Descrição inválida'})
        } 
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: 'Conteúdo inválido'})
        } 
        if(req.body.categoria == '0'){ // caso nao encontre nenhuma categoria
            erros.push({texto: 'Categoria Invalida, Registre uma categoria'})
        }
        if(erros.length > 0){
            postagem.findOne({_id: req.body.id}).then((postagem) => {
                categoria.find().lean().then((categorias) => {
                    res.render('admin/editPostagens', {erros: erros, postagem: postagem, categoria:categorias})
                }).catch((err) => {
                    req.flash('errorMsg', 'Houve um erro ao carregar as categorias')
                    res.redirect('/admin/postagens')
                })
            }).catch((err) => {
                req.flash('errorMsg', 'postagem não encontrada, Tente novamente')
                res.redirect('/admin/postagens')
            })
        } else {
            postagem.findOne({_id: req.body.id}).then((postagem) => {
                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.descricao = req.body.descricao
                postagem.conteudo = req.body.conteudo
                postagem.categoria = req.body.categoria
        
                postagem.save().then(() => {
                    req.flash('successMsg', 'Postagem editada com sucesso')
                    res.redirect('/admin/postagens')
                }).catch((err) => {
                    req.flash('errorMsg', 'Houve um erro ao editar a postagem')
                    res.redirect('/admin/postagens')
                })
            }).catch((err) => {
                req.flash('errorMsg', 'Postagem não encontrada')
                res.redirect('/admin/postagens')
            })
        }
        
    })

    // metodo nao tao seguro de se deletar dados em uma db
    router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
        postagem.deleteOne({_id: req.params.id}).then(() =>{
            req.flash('successMsg', 'Postagem deletada com sucesso')
            res.redirect('/admin/postagens')
        })
    })

module.exports = router