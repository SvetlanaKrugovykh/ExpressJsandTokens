const sharp = require('sharp');
const awsService = require('../common/aws/aws.services');
const LiqPay = require('liqpay');

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
		const x = req.headers?.x?.trim();
		const public_key = process.env.LIQPAY_PUBLIC_KEY_ + x;
		const private_key = process.env.LIQPAY_PRIVATE_KEY_ + x;
		const liqpay = new LiqPay(public_key, private_key);
		liqpay.api("request", {
			"action": "payqr",
			"version": "3",
			"amount": "1",
			"currency": "UAH",
			"description": "description text",
			"order_id": "order_id_1"
		}, function (json) {
			console.log(json.status);
		});
	} catch (error) {
		res.status(500).send({
			status: 500,
			error: error.message,
		});
	}
}