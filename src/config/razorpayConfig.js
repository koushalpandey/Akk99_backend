import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_APIKEY,
    key_secret: process.env.RAZORPAY_SECRET,


});


export default razorpay


