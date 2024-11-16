// Carregando modulos
    const express = require('express')
    const app = express()
    const handlebars = require('express-handlebars') 
    const MongoStore = require('connect-mongo');
    const session = require("express-session")
    const flash = require("connect-flash") 
    const mongoose = require('mongoose')
    const path = require('path') 
    const admin = require('./routes/admin') // carregando as rotas admin
    const usuarios = require('./routes/usuario') 
    const postagem = require('./models/postagens') // carregando os modulos postagens
    const categoria = require('./models/categoria') 
    const passport = require('passport')
    require('./config/auth')(passport)
    require('dotenv').config();
    
// Settings
    // MongoURI - verifica se vou rodar o server no local ou no render
        // verifica se estou conectando via localhost
        const isProduction = process.env.HOSTNAME && !process.env.HOSTNAME.includes('localhost');
        process.env.NODE_ENV = isProduction ? 'production' : 'development';
        // alterna o valor do connect
        const mongoURI = process.env.NODE_ENV === 'production' 
            ? process.env.MONGO_URI_PROD 
            : process.env.MONGO_URI_DEV;

        if (!mongoURI) {
            console.error("Error: MongoDB URI is not defined.");
            process.exit(1); // Interrompe a execução se a URI não estiver definida
        }
    // Mongoose 
        mongoose.connect(mongoURI) // esse mongouri determina se vai conectar pelo local ou pelo server
            .then(() => { console.log('conectado ao mongo'); })
            .catch((err) => { console.log('erro ao se conectar: ' + err); })
    // Body-Parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json()) 
    // Handlebars
        app.engine('handlebars', handlebars.engine({ 
            defaultLayout: 'main',
            partialsDir: path.join(__dirname, 'views/partials'),  // Define o diretório de partials
            runtimeOptions: { // config do each
                allowProtoPropertiesByDefault: true,
                allowProtoMethodsByDefault: true
            }
         }))
        app.set('views', path.join(__dirname, 'views')); // Defina o caminho absoluto para o diretório de views
        app.set('view engine', 'handlebars')
    // Public  
        app.use(express.static(path.join(__dirname, 'public'))) 
    // Session (siga essa orde recomendada)
        app.use(session({ // configuração da session
            secret:'aicalica', // isso é usado para garantir que o ID da sessão seja seguro.
            resave: true, // salva a session automaticamente mesmo sem alterações
            saveUninitialized: true, // salva a session automaticamente mesmo sem dados ou que nao se iniciou
            store: MongoStore.create({ // configuração do connect-mongo
                mongoUrl: mongoURI, // caminho da conexão com a db do mongo
                collectionName: 'sessions' // Nome da coleção onde as sessões serão armazenadas
            })
        }))
        app.use(passport.initialize()) // configurações do passport (não mexa)
        app.use(passport.session()) // Passport
        app.use(flash()) // inicializa o middleware do connect-flash para usar mensagens flash
    // MiddleWare (váriaveis globais)
        app.use((req, res, next) => {
            res.locals.successMsg = req.flash('successMsg') // armazena mensagens de sucesso temporárias
            res.locals.errorMsg = req.flash('errorMsg') // armazena mensagens de erro personalizadas
            res.locals.error = req.flash('error') // armazena mensagens de erro padrão, especialmente para o Passport
            res.locals.user = req.user || null // armazena o usuário logado, ou null se não houver nenhum logado
            next() // continuar o trafégo normal
        })
// Routes
    // listando postagens e puxando o nome da categoria correspondente
    app.get('/', (req, res) => { 
        postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens:postagens})
        }).catch((err) => {
            req.flash('errorMsg', 'Houve um erro interno')
            res.redirect('/404') // error
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })
    app.get("/postagem/:slug", (req, res) => {
        postagem.findOne({slug: req.params.slug}).populate('categoria').then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            } else {
                req.flash('errorMsg', 'Postagem não encontrada')
                res.redirect('/') 
            }
        }).catch((err) => {
            req.flash('errorMsg', 'Houve um erro interno')
            res.redirect('/') 
        })
    })
    app.get("/categorias", (req, res) => {
        categoria.find().then((categorias) => {
            res.render("categorias/index", {categorias:categorias})
        }).catch((err) => {
            req.flash('errorMsg', 'Houve um erro ao exibir as categorias')
            res.redirect('/') 
        })
    })
    app.get('/categorias/:slug', (req, res) => {
    //procurar as postagens que pertencem a uma categoria
        categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash('errorMsg', 'Houve um erro ao listar as postagens')
                    res.redirect('/') 
                })
            } else {
                req.flash('errorMsg', 'essa categoria não existe')
                res.redirect('/') 
            }
        }).catch((err) => {
            req.flash('errorMsg', 'Houve um erro ao encontrar a categoria')
            res.redirect('/') 
        })
    })
    app.use('/admin', admin) // todas as rotas do arquivo routes/admin, terão como prefixo /admin antes de cada rota
    app.use('/usuarios', usuarios) // e junta /usuarios ao localhost/server -> http://localhost:8081/usuarios/registro
// Others
    const PORT = process.env.PORT || 8081 // fazer a conexão com o server ou como local
    app.listen(PORT, () => { console.log('servidor do pai ta on \nacesse: http://localhost:8081'); })
    