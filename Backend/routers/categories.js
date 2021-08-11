const {Category} = require('../models/category'); //by using {} to return object 
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res)=>{
    const categoryList = await Category.find();
    if(!categoryList){
        res.status(500).json({success: false})
    }
    res.send(categoryList);
})

module.exports = router;