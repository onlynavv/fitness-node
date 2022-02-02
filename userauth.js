import express from "express"
const router = express.Router()
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cors from "cors"
import { getByUserName, genPassword, createUser, getByUserId, updatePassword } from "./helper.js"
import { transporter } from "./index.js"

const app = express()
app.use(cors())

router.route("/signup")
.post(async(request, response)=>{
    const {username, password,email,firstname,lastname, plan} = request.body
    const userFromDB = await getByUserName(username)
    console.log(userFromDB)

    if(userFromDB){
        response.status(400).send({msg:"username already exists"})
        return
    }

    if(password.length < 8){
        response.status(400).send({msg: "password must be longer"})
        return
    }

    if(!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@!#%&]).{8,}$/g.test(password)){
		response.status(400).send({msg: "pattern does not match"})
		return
	}

    const hashedPassword = await genPassword(password)

    const result = await createUser({username, password:hashedPassword, plan, email, firstname, lastname})

    if(result.acknowledged === true){
        response.send({msg:"user created sucessfully"})
    }
    else{
        response.status(400).send({msg:"try again.."})
    }

})

router.route("/login")
.post(async(request, response)=>{
    const {username, password} = request.body
    const userFromDB = await getByUserName(username)

    if(!userFromDB){
        response.status(401).send({msg:"incorrect credentials"})
        return
    }

    const storedPassword = userFromDB.password

    const isPasswordMatch = await bcrypt.compare(password, storedPassword)

    if(isPasswordMatch){
        const token = jwt.sign({id:userFromDB._id, plan:userFromDB.plan}, process.env.SECRET_KEY)
        response.send({msg:"successfull login",token:token,userFromDB})
    }else{
        response.status(401).send({msg: "incorrect credentials"})
    }
})

router.route("/forgot-password")
.post(async(request, response)=>{
    const {username} = request.body
    const userFromDB = await getByUserName(username)

    if(!userFromDB){
        response.status(401).send({msg:"user does not exist"})
        return
    }

    // token
    const secret = process.env.SECRET_KEY + userFromDB.password
    const token = jwt.sign({email:userFromDB.email, id:userFromDB._id, username:userFromDB.username},secret,{expiresIn: "15m"})
    

    const link = `https://fitness-logger-node-app.herokuapp.com/workouts/user/reset-password/${userFromDB._id}/${token}`
    

    transporter.sendMail({
        to:userFromDB.email,
        from: process.env.FROM_MAIL,
        subject:"password reset",
        html:`
            <h4>You have requested for the password reset</h4>
            <h4>click this <a href=${link}>link</a> to reset password</h4>

        `
    })

    response.send({msg:"password reset link has been sent to your email address"})
})

// verify the token
router.route("/reset-password/:id/:token")
.get(async(request, response, next)=>{
    const {id, token} = request.params
    const userFromDB = await getByUserId(id)
    

    if(!userFromDB){
        response.send({msg:"invalid credentials"})
        return
    }

    const secret = process.env.SECRET_KEY + userFromDB.password
    try{
        const result = jwt.verify(token, secret)
        response.redirect(`https://fitness-logger-reactapp.netlify.app/reset/${userFromDB._id}/${token}`)
    }catch(error){
        
        response.send(error.message)
    }
})

router.route("/reset-password/:id/:token")
.put(async(request, response, next)=>{
    const {id, token} = request.params
    const {password} = request.body
    const userFromDB = await getByUserId(id)
    
    if(!userFromDB){
        response.send({msg:"invalid credentials"})
        return
    }

    const secret = process.env.SECRET_KEY + userFromDB.password
    
    try{
        const result = jwt.verify(token, secret)
        if(password.length < 8){
            response.status(400).send({msg: "password must be longer"})
            return
        }

        if(!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@!#%&]).{8,}$/g.test(password)){
            response.status(400).send({msg: "pattern does not match"})
            return
        }

        const hashedPassword = await genPassword(password)
        const data  = await updatePassword(id,hashedPassword)
        response.send({msg:"password changed successfully, wait for 5 secs the page to redirect..."})
    }catch(error){
        
        response.send(error.message)
    }

})

export const userAuthRouter = router