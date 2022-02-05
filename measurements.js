import express from "express"
import { auth } from "./customauth.js"
const router = express.Router()
import {addMeasurementsType, addUsersWeight, getUserByIdFromMeasurements, updateUsersWeight, getUserActivityByDate} from "./helper.js"
import { ObjectId } from "mongodb";

router.route("/addMeasurementsType")
.post(async(request, response)=>{
    
    const result = await addMeasurementsType(request.body)
    response.send({msg:"measurements type added", result})
})

router.route("/addUserWeights")
.put(auth,async(request, response)=>{
    const userId = request.user.id
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    
    const {weight, onDate} = request.body
    const weightInt = parseFloat(weight)
    const dateData = new Date(parseInt(onDate) * 1000).toISOString()
    const weightInfoData = {id: new ObjectId(), weightInt, dateData}

    if(userFromMeasureInfo){
        const result = await updateUsersWeight(userId, weightInfoData)
        response.send(result)
    }else{
        const weightData = [weightInfoData]
        const userMeasureInfo = {userId, weightData}
        const result = await addUsersWeight(userMeasureInfo)
        response.send(result)
    }
})

router.route('/getUsersMeasurementInfo')
.get(auth, async(request, response)=>{
    const userId = request.user.id
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    response.send(userFromMeasureInfo)
})

router.route("/getUserActivityByDate/:dateParam")
.get(auth, async(request, response)=>{
    const {dateParam} = request.params
    
    const dateData = new Date(parseInt(dateParam) * 1000).toISOString()
    
    const result = await getUserActivityByDate(dateData)
    
    response.send(request.params.dateParam)
})

export const measurementsTypeRouter = router