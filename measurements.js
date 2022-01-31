import express from "express"
import { auth } from "./customauth.js"
const router = express.Router()
import {addMeasurementsType, addUsersWeight, getUserByIdFromMeasurements, updateUsersWeight, getUserActivityByDate} from "./helper.js"
import { ObjectId } from "mongodb";

router.route("/addMeasurementsType")
.post(async(request, response)=>{
    console.log(request.body)
    const result = await addMeasurementsType(request.body)
    response.send({msg:"measurements type added", result})
})

router.route("/addUserWeights")
.put(auth,async(request, response)=>{
    const userId = request.user.id
    const userFromMeasureInfo = await getUserByIdFromMeasurements(userId)
    console.log(request.body)
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
    console.log(request.params.dateParam)
    const dateData = new Date(parseInt(dateParam) * 1000).toISOString()
    console.log(dateData)
    const result = await getUserActivityByDate(dateData)
    console.log(result)
    response.send(request.params.dateParam)
})

export const measurementsTypeRouter = router