const notFound = (req,res)=>{
    console.log(`url not found${req.originalUrl}`)
    res.status(404).json({success : false,
        msg: `url not found${req.originalUrl}`
    })
}


module.exports = notFound