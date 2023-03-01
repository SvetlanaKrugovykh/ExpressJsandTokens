const AWS = require('aws-sdk');

class awsService {
	constructor(convertService) {
		this.AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
		this.s3 = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		});
		this.convertService = convertService;
	}

	async uploadAvatar(buffer, key) {
		const params = {
			Bucket: this.AWS_S3_BUCKET,
			Key: key,
			Body: buffer,
			ContentType: 'image/jpeg',
		};
		const upload = this.s3.upload(params);
		return upload.promise();
	}
}

module.exports = awsService;