const nodemailer = require("nodemailer");

async function mail(sendMailto, mailSubject, mailText, mailHTMLBody) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'desmond83@ethereal.email',
                pass: 'CMwy8qj3RvAbQs8fW7'
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

