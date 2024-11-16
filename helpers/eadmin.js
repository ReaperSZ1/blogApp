// verifica se o usuario é admin ou não
module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        } else {
            req.flash('errorMsg', 'Acesso Exclusivo para Administradores')
            res.redirect('/')
        }
    }
}