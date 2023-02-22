const nodemailer = require('nodemailer');

exports.sendVerificationEmail = async (email, code) => {
	const smtpOptions = {
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 2525,
		secure: true,
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
		tls: {
			rejectUnauthorized: false,
		},
		timeout: 50,
	};

	const mailOptions = {
		from: `${process.env.SMTP_USER}`,
		to: email,
		subject: 'Verify Your Email Address',
		html: `<p>Dear subscriber,</p>
               <p>Thank you for creating an account on our service. Please click the following link to verify your email address:</p>
               <a href="${process.env.BASE_URL}/verify-email/${email}/"></a>
							 <p>Your verification code is ${code}</p>
               <p>If you did not create an account on My App, please ignore this email.</p>`,
	};

	const transporter = nodemailer.createTransport(smtpOptions);

	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	} catch (error) {
		console.log(error);
	}
}


