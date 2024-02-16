const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const Sequelize=require('sequelize');
const multer=require('multer');
const armazenamento=multer.memoryStorage();
const upload=multer({storage: armazenamento});
const porta=3333;
const sequelize=new Sequelize('loja_celso','admin','mariadb13',{
    host: "database-1.cfeyqwoyorjz.sa-east-1.rds.amazonaws.com",
    dialect: "mariadb",
    port: 3306,
});
const rota=express.Router();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://18.230.134.155:80');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 
//Modelo tabela usuarios
const usuarios=sequelize.define('usuarios',{
    codigo: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    senha: {
        type: Sequelize.DataTypes.STRING(20),
        allowNull: false,
    }
});
//Modelo tabela fornecedores
const fornecedores=sequelize.define('fornecedores',{
    codigo: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fornecedor: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: Sequelize.DataTypes.STRING(40),
        allowNull: false,
    },
    telefone: {
        type: Sequelize.DataTypes.STRING(15),
        allowNull: false,
    }
});
// Criar modelo da tabela produtos
const produtos=sequelize.define('produtos',{
    codigo: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
    },
    produto: {
        type: Sequelize.DataTypes.STRING(100),
        allowNull: false,
    },
    quantidade: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
    },
    preco: {
        type: Sequelize.DataTypes.DECIMAL(10,2),
        allowNull: false,
    },
    codigo_fornecedor: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: fornecedores,
            key: 'codigo',
        }
    },
    imagem: {
        type: Sequelize.DataTypes.BLOB('long'),
        allowNull: true,
    },
});

//Rota para cadastrar usuario
rota.post('/api/novoUsuario',async(req,res)=>{
    try {
        const novoUsuario=await usuarios.create({
            usuario: req.body.usuario,
            senha: req.body.senha,
        });
        res.status(201).json(novoUsuario);
    } catch (error) {
        console.error('Erro ao criar usuario:',error);
        res.status(500).json({error: 'Erro ao criar usuario'});
    }
})
//Rota para autenticar usuario
rota.post('/api/login',async(req,res)=>{
    const {usuario,senha}=req.body;
    try {
        const usuarioAutenticado=await usuarios.findOne({
            where: {usuario: usuario, senha:senha}
        });
        if(!usuarioAutenticado){
            return res.status(401).json({error: 'Credenciais inválidas'})
        }
        res.status(200).json({mensagem: 'Login bem sucedido !'});
    } catch (error) {
        console.error('Erro ao criar usuario:',error);
        res.status(500).json({error: 'Erro ao criar usuario'});
    }
})
//Rota para cadastrar fornecedor
rota.post('/api/novoFornecedor',async(req,res)=>{
    try {
        const novoFornecedor=await fornecedores.create({
            fornecedor: req.body.fornecedor,
            email: req.body.email,
            telefone: req.body.telefone,
        });
        res.status(201).json(novoFornecedor);
    } catch (error) {
        console.error('Erro ao criar fornecedor:',error);
        res.status(500).json({error: 'Erro ao criar fornecedor'});
    }
})
//Rota para cadastrar produto
rota.post('/api/novoProduto', upload.single('imagem'), async(req,res)=>{
    try {
        const novoProduto=await produtos.create({
            codigo: req.body.codigo,
            produto: req.body.produto,
            quantidade: req.body.quantidade,
            preco: req.body.preco,
            codigo_fornecedor: req.body.codigo_fornecedor,
            imagem: Buffer.from(req.file.buffer),
        });
        res.status(201).json(novoProduto);
    } catch (error) {
        console.error('Erro ao criar produto:',error);
        res.status(500).json({error: 'Erro ao criar produto'});
    }
})
//rota para listar fornecedores
rota.get('/api/fornecedores',async(req,res)=>{
    try {
        const lista_fornecedores=await fornecedores.findAll();
        res.status(200).json(lista_fornecedores);
    } catch (error) {
        console.error('Erro ao listar fornecedores:',error);
        res.status(500).json({error: 'Erro ao listar fornecedores'});
    }
});
//rota para listar produtos
rota.get('/api/produtos',async(req,res)=>{
    try {
        const lista_produtos=await produtos.findAll();
        res.status(200).json(lista_produtos);
    } catch (error) {
        console.error('Erro ao listar produtos:',error);
        res.status(500).json({error: 'Erro ao listar produtos'});
    }
});

//rota para listar fornecedor pelo id
rota.get('/api/fornecedor/:id',async(req,res)=>{
    try {
        const fornecedor=await fornecedores.findByPk(req.params.id);
        if(!fornecedor){
            return res.status(404).json({error: 'Fornecedor não encontrado '});
        }
        res.status(200).json(fornecedor);
    } catch (error) {
        console.error('Erro ao autenticar o usuário',error);
        res.status(500).json({error: 'Erro ao autenticar o usuário '});
    }
});
//rota para listar produto pelo id
rota.get('/api/produto/:id',async(req,res)=>{
    try {
        const produto=await produtos.findByPk(req.params.id);
        if(!produto){
            return res.status(404).json({error: 'Produto não encontrado '});
        }
        res.status(200).json(produto);
    } catch (error) {
        console.error('Erro ao consultar produto:',error);
        res.status(500).json({error: 'Erro ao consultar produto'});
    }
});

//rota para apagar fornecedor pelo id
rota.delete('/api/fornecedor/:id',async(req,res)=>{
    try {
        const fornecedor=await fornecedores.findByPk(req.params.id);
        if(!fornecedor){
            return res.status(404).json({mensagem: 'Fornecedor não encontrado '});
        }
        await fornecedor.destroy();
        res.status(200).json({mensagem: 'Fornecedor apagado '});
    } catch (error) {
        console.error('Erro ao apagar fornecedor:',error);
        res.status(500).json({error: 'Erro ao apagar fornecedor'});
    }
});
//rota para apagar produto pelo id
rota.delete('/api/produto/:id',async(req,res)=>{
    try {
        const produto=await produtos.findByPk(req.params.id);
        if(!produto){
            return res.status(404).json({mensagem: 'Produto não encontrado '});
        }
        await produto.destroy();
        res.status(200).json({mensagem: 'Produto apagado '});
    } catch (error) {
        console.error('Erro ao apagar produto:',error);
        res.status(500).json({error: 'Erro ao apagar produto'});
    }
});
//Rota para atualizar fornecedor
rota.put('/api/fornecedor/:id',async(req,res)=>{
    const {fornecedor, email, telefone}=req.body;
    try {
            await fornecedores.update(
                {fornecedor, email, telefone},
                {
                    where: {codigo: req.params.id},
                    returning: true,
                }
            );
            res.status(200).json({mensagem: 'Fornecedor atualizado '});        
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:',error);
        res.status(500).json({error: 'Erro ao atualizar fornecedor'});
    }
});
//Rota para atualizar produto
rota.put('/api/produto/:id',async(req,res)=>{
    const {produto, quantidade, preco, codigo_fornecedor}=req.body;
    try {
            await produtos.update(
                {produto, quantidade, preco,codigo_fornecedor},
                {
                    where: {codigo: req.params.id},
                    returning: true,
                }
            );
            res.status(200).json({mensagem: 'Produto atualizado '});        
    } catch (error) {
        console.error('Erro ao atualizar produto:',error);
        res.status(500).json({error: 'Erro ao atualizar produto'});
    }
});
app.use(rota);
//sequelize.sync( {force : true});
//usuarios.sync();
app.listen(porta,()=>{
    console.log('Servidor rodando na porta',porta);
});
