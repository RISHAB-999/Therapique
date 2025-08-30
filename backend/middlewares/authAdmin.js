import jwt from "jsonwebtoken";

//auth authentication middleware
const authAdmin = (req, res, next) => {
    try {
        const { atoken } = req.headers
        if (!atoken) {
            return res.json({
                success: false,
                message: "Not Authorized.Login Again"
            });
        }

        const atoken_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        if (atoken_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            return res.json({
                success: false,
                message: "Not Authorized.Login Again"
            });
        }
        next();

    } catch (error) {
        console.log("here")
        console.log(error);
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export default authAdmin;
