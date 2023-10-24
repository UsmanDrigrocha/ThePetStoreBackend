const nodemailer = require("nodemailer");

async function mail(sendMailto, mailSubject, mailText, mailHTMLBody) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'gust5@ethereal.email',
                pass: 'g8HREkC7GEfCM8HXUy'
            }
        });

        async function main() {
            const info = await transporter.sendMail({
                from: '"Fred Foo 👻" <foo@example.com>', // sender address
                to: `${sendMailto}`, // recipent address
                subject: `${mailSubject} ✔`, // Subject line
                text: `${mailText}`, // plain text body
                html: `${mailHTMLBody}`, // html body
            });
            console.log("Message sent: %s", info.messageId);
        }

        main();
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = mail;
/*
-- In other Function ; 
   const emailSubject = 'Password Reset OTP';
                const emailHTMLBody = `<p>Your OTP is: ${otpCode}</p>`;

                const recipientEmail = email;
                const mailText = 'OTP Reset Email'

                const emailSent = await mail(recipientEmail, emailSubject, mailText, emailHTMLBody);

                if (emailSent) {
                    res.status(200).json({ message: 'OTP Email sent successfully' });
                } else {
                    res.status(500).json({ message: 'Email sending failed' });
                }
*/
