const express = require('express')
const router = express.Router()
const usuario = require('../models/usuario')
const bcrypt = require('bcryptjs') // isto serve para proteger senhas contra hackers, encriptando-as
const passport = require('passport')

// routes
    router.get('/registro', (req, res) => {
        res.render('usuarios/registro')
    })

    router.post('/registro/novo', (req, res) => {
        // validação de formulário
            let erros = []

            if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
                erros.push({texto: 'Nome Inválido'})
            } 
            if(req.body.nome.length < 2){
                erros.push({texto: 'Nome muito pequeno'})
            }
            if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
                erros.push({texto: 'Email inválido'})
            } 
            if(req.body.email.length < 10){
                erros.push({texto: 'Email muito pequeno'})
            }
            if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
                erros.push({texto: 'Senha inválida'})
            } 
            if(req.body.senha.length < 4){
                erros.push({texto: 'Senha muito curta'})
            }
            if(req.body.senha != req.body.senha2){
                erros.push({texto: 'as senhas são diferentes, Tente Novamente'})
            }
            if(erros.length > 0){            
                res.render('usuarios/registro', {erros: erros})
            } else {
                // verificar se o email do usuario já existe na db
                    usuario.findOne({email: req.body.email}).then((conta) => {
                        if(conta){
                            req.flash('errorMsg', 'Já existe uma conta com este e-mail no nosso sistema!')
                            res.redirect('/usuarios/registro')
                        } else {
                            const novoUsuario = new usuario({
                                nome: req.body.nome,
                                email: req.body.email,
                                senha: req.body.senha
                            }) // antes de registrar o usuario usando o .save(), encripte a senha
                            
                            //  Gera um valor aleatório para adicionar à senha antes de criptografá-la.
                            bcrypt.genSalt(10, (erro, salt) => {
                                bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{
                                    //caso encontre algum erro
                                    if(erro){
                                        req.flash('errorMsg', 'Houve um erro durante o salvamento do usuario')
                                        res.redirect('/usuarios/registro')
                                    } else {
                                        // encripta a senha
                                        novoUsuario.senha = hash

                                        novoUsuario.save().then(() => {
                                            req.flash('successMsg', 'Usuário criado com sucesso!')
                                            res.redirect('/')
                                        }).catch((err) => {
                                            req.flash('errorMsg', 'Houve um Erro ao criar o usuario tente novamente')
                                            res.redirect('/usuarios/registro')
                                        })
                                    }
                                })
                            })
                        }
                    }).catch((err) => {
                        req.flash('errorMsg', 'Houve um Erro interno')
                        res.redirect('/')
                    })
            }
    })

    router.get('/login', (req, res) => {
        res.render('usuarios/login')
    })

    router.post('/login/novo', (req, res, next) => {    
        // vai autenticar a partir da configuração do arquivo ./config/auth.js
        passport.authenticate('local', {
            successRedirect: '/', // caminho que vai direcionar caso funcione com sucesso
            failureRedirect: '/usuarios/login', // caminho que vai direcionar caso não funcione
            failureFlash: true // mensagens flash
        })(req, res, next)
    })
    // logout do usuario logado
    router.get('/logout', (req, res) => {
        req.logout((err) => {
            if(err){ 
                return next(err) 
            } else {
                req.flash("successMsg", 'Conta Deslogada!')
                res.redirect('/')
            }
        })
    })
module.exports = router
