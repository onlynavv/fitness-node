import jwt from "jsonwebtoken"

export const auth = (request, response, next) =>{
    try{
        const token = request.header("x-auth-token")
        jwt.verify(token, process.env.SECRET_KEY, (err,user)=>{
            if(user){
                request.user = user
                next()
            }else{
                throw err
            }
        })
        
    }catch(err){
        response.status(401).send({error:err.message})
    }
}