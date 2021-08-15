const expressJwt = require('express-jwt');

async function isRevoked(req, payload, done){
    if(!payload.isAdmin) {
        done(null, true)
    }
    done();
}

const authJwt = () => {
    const secret = process.env.secret
    const api = process.env.API_URL
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked //limit user to edit products unless true isAdmin
    }).unless({
        path: [
            // {url: `${api}/products`, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`,
        ]
    })
}



module.exports = authJwt