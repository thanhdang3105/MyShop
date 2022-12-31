const express = require('express');
const formidable = require('formidable');
const cors = require('cors')
const fs = require('fs')
const app = express();
const Products = require('./models/Products')
const Catalog = require('./models/Catalog');
const Category = require('./models/Category');
require('dotenv').config()

const db = require('./connectDB');
const CartList = require('./models/CartList');
const OdersList = require('./models/OdersList');
const { auth } = require('./admin');
const { main } = require('./sendEmail');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
db.connect();


app.post('/api/handleProducts', async (req, res,next) => {
        const value = req.body.data
        const catalog = value.catalog
        const category = value.category
        const collections = value.collections
        let status
        await Catalog.find({name: {$in: catalog}}).then(result => {
            if(!result.length){
                const newCollection = catalog.map(newCata => {
                    const data = new Catalog({name: newCata,path: '/danh-muc/'+newCata.toLowerCase().split(' ').join('-'),category})
                    return data
                })
                Catalog.insertMany(newCollection,(error) => {
                    if(error) console.log(error)
                    status = {message: 'reloadCatalog'}
                })
            }
            else{
                const listCata = result.map(item => item.name)
                const newCata = catalog.filter(item => (!listCata.includes(item)))
                const oldCata = catalog.filter(item => (listCata.includes(item)))
                if(newCata.length > 0){
                    const newCollection = newCata.map(item => {
                        const data = new Catalog({name: item,path: '/danh-muc/'+item.toLowerCase().split(' ').join('-'),category})
                        return data
                    })
                    Catalog.insertMany(newCollection,(err) => {
                        if(err) console.log(err)
                        status = {message: 'reloadCatalog'}
                    })
                }
                if(oldCata.length > 0){
                    const newCollection = []
                    oldCata.map(item => {
                        const catalogFind = result.find(cate => cate.name === item)
                        const newCategory = category.filter(item => (!catalogFind.category.includes(item)))
                        newCategory.length && newCollection.push({catalogID: catalogFind._id,newCategory: catalogFind.category.concat(newCategory) })
                    })
                    if(newCollection.length){
                        newCollection.map(item => {
                            Catalog.findByIdAndUpdate(item.catalogID,{category: item.newCategory})
                            .catch(err => console.log(err))
                        })
                    }
                }
            }
        })
        .catch(err => console.log(err))
        await Category.find({name: {$in: category}}).then(result => {
            if(!result.length) {
                const newCollection = category.map(item => {
                    const data = new Category({name: item,path: '/' + item.split(' ').join('-').toLowerCase(),children: collections.map(item => ({
                            name: item,
                            path: '?collections=' + item.split(' ').join('-').toLowerCase(),
                            catalog
                        }))
                    })
                    return data
                })
                Category.insertMany(newCollection,(err) => {
                    if(err) console.log(err)
                    status = {message: 'reloadCatalog'}
                })
            }
            else{
                const listCate = result.map(item => item.name)
                const newCate = category.filter(item => (!listCate.includes(item)))
                const oldCate = category.filter(item => (listCate.includes(item)))
                if(newCate.length > 0){
                    const newCollection = newCate.map(item => {
                        const data = new Category({name: item,path: '/' + item.split(' ').join('-').toLowerCase(),children: collections.map(item => ({
                                name: item,
                                path: '?collections=' + item.split(' ').join('-').toLowerCase(),
                                catalog
                            }))
                        })
                        return data
                    })
                    Category.insertMany(newCollection,(err) => {
                        if(err) console.log(err)
                        status = {message: 'reloadCatalog'}
                    })
                }
                if(oldCate.length > 0){
                    oldCate.map(item => {
                        const collectionFind = result.find(cate => cate.name === item)
                        const check = collectionFind.children.map(collection => collection.name)
                        let newChildren = collections.filter(item => (!check.includes(item)))
                        const oldChildren = collections.filter(item => (check.includes(item)))
                        if(oldChildren.length) {
                            collectionFind.children.map(collection => {
                                if(oldChildren.includes(collection.name)){
                                    catalog.map(item => {
                                        if(!collection.catalog.includes(item)){
                                            collection.catalog.push(item)
                                        }
                                    })
                                }
                            })
                        }
                        if(newChildren.length) {
                            newChildren = newChildren.map(item =>({name:item,path:'?collections=' + item.split(' ').join('-').toLowerCase(),catalog}))
                            Category.findByIdAndUpdate(collectionFind._id,{children: collectionFind.children.concat(newChildren)})
                            .then(result => {
                                status = {message: 'reloadCatalog'}
                            })
                            .catch(err => console.log(err))
                        }
                        else if(!newChildren.length){
                            Category.findByIdAndUpdate(collectionFind._id,{children:collectionFind.children})
                            .catch(err => console.log(err))
                        }
                    })
                }
                
            }
        })
        .catch(err => console.log(err))
        value.catalog = value.catalog.join(',')
        value.category = category.join(',')
        value.collections = collections.join(',')
        switch(req.body.action){
            case 'create':
                const data = new Products(value)
                data.save((err,doc) => {
                    if (err) return console.log(err)
                    if(status?.message){
                        res.status(200).json({...status})
                    }
                    else{
                        res.status(200).json(doc)
                    }
                })
                break;
            case 'update':
                const listImage = value.listImage.concat(value.newImage)
                Products.findByIdAndUpdate({_id: value._id},{...value,listImage},{new:true},(err,doc) => {
                    if(err) return console.log(err)
                    if(status?.message){
                        res.status(200).json({...status})
                    }
                    else{
                        res.status(200).json(doc)
                    }
                })
                break;
            default:
                throw new Error(`Invalid Action`);
        }
});

app.delete('/api/deleteProduct/:id',(req, res) => {
    Products.findByIdAndDelete({_id:req.params.id})
    .then(result => res.status(200).json())
    .catch(err => res.status(500).json(err))
})

app.get('/api/database',(req, res) => {
    const products = Products.find({})
    const catalogs = Catalog.find({})
    const category = Category.find({})
    Promise.all([products,catalogs,category])
    .then(([data1,data2,data3]) => {
        res.json({
            products: data1,
            catalogs: data2,
            categorys: data3,
        })
    })
    .catch(err => console.log(err))
})

app.get('/api/cartList/:id', (req, res) => {
    CartList.find({user:req.params.id})
    .then(result => res.json(result))
    .catch(err => console.log(err))
})

app.post('/api/OdersList',(req, res,next) => {
       switch(req.body.action) {
        case 'create':
            //fields:{action:'create',data:data}
            const data = new OdersList(req.body.data)
            data.save((err,value) =>{
                if(err) return next()
                res.status(200).json(value)
            })
            req.body.data.items.map(item=>{
                Products.findOne({name: item.name})
                .then(doc => {
                    doc.sell += item.amount
                    doc.save(err => {
                        if(err) console.log(err)
                    })
                })
            })
            break
        case 'getByUserId':
            //fields:{action:'getByUserId',userId:userId}
            OdersList.find({user: req.body.userId})
            .then(data => res.status(200).json(data))
            .catch(err => res.status(500).json(err))
            break
        case 'getAll':
            //fields:{action:'getAll'}
            OdersList.find({}).then(data => res.status(200).json(data))
            .catch(err => res.status(500).json(err))
            break
        case 'updateStatusById': 
            //fields:{action:'updateStatusById',_id:_id,status:data}
            OdersList.findByIdAndUpdate({_id: req.body._id},{status: req.body.status}).then(result => {
                res.status(200).json()
            })
            .catch(err => res.status(404).json(err))
            break
        // case 'removeById':
        //     //fields:{action:'removeById',_id:_id}
        //     OdersList.findByIdAndRemove({_id: fields._id}).then(result => res.status(200).json({message: 'remove success!'}))
        //     .catch(err => res.status(404).json(err))
        //     break
        default:
            throw new Error(`Invalid Action`)
       }
})

app.post('/api/cartList',(req, res, next) => {
        const data = req.body.data
        switch(req.body.action) {
            case 'create': 
                new CartList({
                    name: data.name,
                    path: '/san-pham/'+data.slug,
                    price: data.price,
                    imageURL: data.listImage[0].url,
                    size: data.size,
                    color: data.color,
                    user: data.user,
                    slug: data.slug
                }).save((err,data)=>{
                    if(err) return next()
                    res.json(data)
                })
                break;
            case 'update':
                CartList.findByIdAndUpdate(data._id,{amount: data.amount}).then(result => {
                    res.status(200).json()
                })
                .catch(err => res.status(404).json(err))
                break
            case 'delete':
                CartList.findByIdAndDelete(data._id)
                .then(result => res.status(200).json())
                .catch(err => res.status(500).json(err))
                break
            case 'deleteByUserId':
                CartList.deleteMany({user: data.userId})
                .then(result => res.status(200).json())
                .catch(err => res.status(500).json(err))
                break
            default:
                throw new Error('Invalid request')
        }
})

app.post('/api/admin/users',(req, res, next) => {
        const actionCodeSettings = {
            url: 'http://localhost:3000/',
            handleCodeInApp: true,
        };
        switch(req.body.action) {
            case 'verifyEmail':
                auth.generateEmailVerificationLink(req.body.data, actionCodeSettings)
                    .then((link) => {
                      // Construct email verification template, embed the link and send
                      // using custom SMTP server.
                      const start = link.search('oobCode=') + 'oobCode='.length
                      const end = link.search('&continueUrl')
                      const oobCode = link.slice(start, end)
                      main('Xác thực tài khoản',req.body.data,oobCode)
                      .then(result => res.status(200).json())
                      .catch(err => console.log(err))
                    })
                    .catch((error) => {
                        console.log(error)
                      // Some error occurred.
                    });
                break
            case 'deleteUser':
                auth.deleteUser(req.body.uid)
                .then(result => res.status(200).json())
                .catch(err => res.status(500).json(err))
                break
            case 'updatePwd':
                auth.updateUser(req.body.uid,{ password: req.body.newPassword })
                .then(userRecord => {
                    res.status(200).json()
                })
                .catch(err => res.status(500).json(err))
                break
            case 'resetPassword':
                auth.generatePasswordResetLink(req.body.data, actionCodeSettings)
                    .then((link) => {
                      // Construct email verification template, embed the link and send
                      // using custom SMTP server.
                      const start = link.search('oobCode=') + 'oobCode='.length
                      const end = link.search('&continueUrl')
                      const oobCode = link.slice(start, end)
                      main('Xác thực và đổi mật khẩu',req.body.data,oobCode)
                      .then(result => res.status(200).json())
                      .catch(err => console.log(err))
                    })
                    .catch((error) => {
                        console.log(error)
                      // Some error occurred.
                    });
                break
            case 'checkAdmin':
                if(req.body.method === 'phone'){
                    auth.getUserByPhoneNumber(req.body.data)
                    .then(UserRecord => {
                        if(UserRecord.customClaims['admin']) {
                            res.status(200).json()
                        }
                        else{
                            res.status(200).json({message: 'Không phải Admin!'})
                        }
                    })
                    .catch(err => {
                        res.status(500).json(err.code)
                    })
                }else if(req.body.method === 'email'){
                    auth.getUserByEmail(req.body.data)
                        .then(UserRecord => {
                            if(UserRecord.customClaims && UserRecord.customClaims['admin']) {
                                if(req.body.status === 'login'){
                                    auth.generateEmailVerificationLink(req.body.data, actionCodeSettings)
                                    .then((link) => {
                                    // Construct email verification template, embed the link and send
                                    // using custom SMTP server.
                                        const start = link.search('oobCode=') + 'oobCode='.length
                                        const end = link.search('&continueUrl')
                                        const oobCode = link.slice(start, end)
                                        main('Xác thực tư cách admin',req.body.data,oobCode)
                                            .then(() => {
                                                auth.createCustomToken(UserRecord.uid).then((token) => {
                                                    res.status(200).json(token)
                                                })
                                            })
                                            .catch(err => console.log(err))
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    });
                                }
                                else{
                                    res.status(200).json()
                                }
                            }
                            else{
                                res.status(200).json({message: 'Không phải Admin!'})
                            }
                    }).catch((err) => res.status(500).json(err.code))
                }
                break
            case 'setAdmin':
                auth.getUser(req.body.uid).then(UserRecord => {
                    if(req.body.data){
                        auth.setCustomUserClaims(UserRecord.uid,{admin: req.body.data})
                        .then(() => res.status(200).json())
                        .catch(err => res.status(500).json(err))
                    }
                    else{
                        auth.setCustomUserClaims(UserRecord.uid,null)
                        .then((res) => res.status(200).json())
                        .catch(err => res.status(500).json(err))
                    }
                })
                break
            default:
                throw new Error(`Invalid action ${req.body.action}`)
        }
})

app.listen(process.env.PORT || 8080);

module.exports = app;