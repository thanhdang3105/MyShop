const nodemailer = require("nodemailer");

async function main(mode,email,oobCode) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // create reusable transporter object using the default SMTP transport
    let transporter =  nodemailer.createTransport({ // config mail server
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.MAIL_SECRET, // generated ethereal user
            pass: process.env.SECRET_PASSWORD, // generated ethereal password
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    const html = `
    <h2>Cảm ơn bạn vì đã sử dụng sản phẩm của chúng tôi ❤</h2>
    <h3>Mã xác thực của bạn là:</h3>
    <h3>${oobCode}</h3>
    Nếu bạn không yêu cầu mã xác thực, bạn có thể bỏ qua email này.</br>
    Nhóm Myshop cảm ơn bạn!`
    // send mail with defined transport object
    await transporter.sendMail({
      from: '"Noreply 👻" <myshopstore31@gmail.com>', // sender address
      to: email, // list of receivers
      subject: mode+" ✔", // Subject line
      text: "Hello world?", // plain text body
      html: html, // html body
    });
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview only available when sending through an Ethereal account
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  

module.exports = {main}