const { Product } = require('../models/product'); //by using {} to return object 
const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');


const FILE_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');
        if(isValid){
            uploadError = null
        }
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extension = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
})

const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res)=>{
    // const productList = await Product.find().select('name image -_id');
    //localhost:3000/api/v1/products?categories=3413134,235235
    let filter = {};
    if (req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    
    const productList = await Product.find(filter).select('name image id').populate('category');
    if(!productList){
        res.status(500).json({success: false})
    }
    res.send(productList);
})

router.get(`/:id`, async (req, res)=>{
    const product = await Product.findById(req.params.id).populate('category');//
    if(!product){
        res.status(500).json({success: false})
    }
    res.send(product);
})

router.post(`/`, uploadOptions.single('image'), async (req, res)=>{
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')
    
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    const fileName = req.file.filename
    
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,  //"http://localhost:3000/public/upload/image-12341"
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    });

    product = await product.save();
    if (!product) return res.status(500).send('The product cannot be created!')
    res.send(product);
});

router.put('/:id', async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },{ new: true }
    );
    if (!product) return res.status(400).send('the product cannot be updated!')
    res.send(product);
})

router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product => {
        if (product){
            return res.status(200).json({
                success: true,
                message: 'the product is deleted'
            })
        }else{
            return res.status(404).json({
                success: false,
                message: 'the product not found'
            })
        }
    }).catch(err=>{
        return res.status(400).json({
            success: false,
            error: err
        })
    })
});

router.get('/get/count', async (req, res)=>{
    const productCount = await Product.countDocuments(count => count);

    if(!productCount){
        res.status(500).json({success: false})
    }
    
    res.send({
        productCount: productCount
    });
})

router.get('/get/featured/:count', async (req, res)=>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({isFeatured: true}).limit(+count)

    if(!products){
        res.status(500).json({success: false})
    }

    res.send(products)
})

module.exports = router;