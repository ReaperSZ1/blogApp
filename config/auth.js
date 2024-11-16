const localStr = require('passport-local').Strategy
const passport = require('passport')
const bcrypt = require('bcryptjs') // comparar as senhas
const usuario = require('../models/usuario')

// autenticação local
    module.exports = function(passport){
        // configura o Passport para usar email e senha como método de autenticação
        passport.use(new localStr({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
            // Busca um usuário com o email fornecido no banco de dados.
            usuario.findOne({email: email}).then((usuario) => {

                if(!usuario){ // caso não exista
                    return done(null, false, {message: 'Conta não encontrada'})
                }
                // compara a senha fornecida com a senha do usuario encriptada
                bcrypt.compare(senha, usuario.senha, (erro, ok) => {
                    // verifica se as senhas batem
                    if(ok) 
                        return done(null, usuario)
                    else 
                        return done(null, false, {message: 'Senha incorreta'})
                })
            })
        }))
    }

// salvando os dados do usuario na sessão de forma simples
    // isso armazena uma pequena informação (id) do usuario, pra facilitar
    passport.serializeUser((usuario,done)=>{ 
        done(null, usuario.id) // Salva apenas o ID do usuário, para manter a sessão.
    })
    // usa o id do usuário para buscar os dados completos no banco e passá-los para o Passport.
    passport.deserializeUser((id, done)=>{
        // Busca o usuário no banco de dados usando o ID salvo na sessão.
        usuario.findById(id).then((usuario)=>{
            done(null, usuario)
        }).catch((err)=>{
             done(null, false, {message:'algo deu errado'})
        })
    })