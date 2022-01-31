import express from "express"
const router = express.Router()
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import cors from "cors"
import { getByUserName, genPassword, createUser } from "./helper.js"

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

export const userAuthRouter = router