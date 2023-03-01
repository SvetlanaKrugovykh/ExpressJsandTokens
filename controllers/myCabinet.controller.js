const sharp = require('sharp');
const awsService = require('../common/aws/aws.services');
const { raw } = require('express');

exports.uploadAvatar = async (req, res) => {
	try {
		const pixels = 500;
		const key = req.headers?.key?.trim();
		const buffer = req.body;
		if ((!key) || (req.headers['content-type'] !== 'image/jpeg')) {
			throw new Error('Invalid file type');
		}
		const resizedBuffer = await sharp(buffer).resize({ width: pixels }).toBuffer();
		const aws = new awsService();
		const upload = await aws.uploadAvatar(resizedBuffer, key);
		res.status(200).send({
			status: 200,
			message: 'File uploaded successfully',
			data: upload,
		});
	} catch (error) {
		res.status(500).send({
			status: 500,
			error: error.message,
		});
	}
};

exports.payment = async (req, res) => {
	try {
		const { amount, currency, order_id, card_number, exp_month, exp_year, cvv } = req.body;
		const paymentData = {
			merchantAccount: 'YOUR_MERCHANT_ACCOUNT',
			merchantDomainName: 'YOUR_MERCHANT_DOMAIN_NAME',
			authorizationType: 'SimpleSignature',
			currency: currency,
			amount: amount,
			orderReference: order_id,
			productName: 'Product',
			productPrice: amount,
			language: 'en',
			serviceUrl: 'https://your-service-url.com/payment-status',
			returnUrl: 'https://your-return-url.com',
			card: {
				number: card_number,
				expMonth: exp_month,
				expYear: exp_year,
				cvv: cvv
			}
		};

		// 	const wayforpayResponse = await wayforpay.initPayment(paymentData);
		// 	res.json({ payment_url: wayforpayResponse.paymentUrl });
	} catch (error) {
		// 	res.status(500).json({ message: error.message });
		// }
	}
};