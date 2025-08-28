import doctorModel from "../models/doctorModel.js";

// API to get all doctors list for Frontend
const doctorList = async (req, res) => {
    try {
        console.log("here")
        const doctors = await doctorModel.find({}).select(['-password', '-email'])
        console.log("doctors", doctors)
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const changeAvailability = async (req, res) => {
    try {
        const { docId } = req.body

        const docData = await doctorModel.findById(docId);
        if (!docData) {
            return res.json({
                success: false,
                message: "Doctor not found"
            });
        }

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        res.json({
            success: true,
            message: "Doctor availability updated",
        });

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message,
        });
    }
}

export { doctorList, changeAvailability }