const AWS = require('aws-sdk');

const secretData = async() => {
    AWS.config.update({
        accessKeyId: 'AKIAUYH7R7YS54HAOLXV',
        secretAccessKey: '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',
        region: 'ap-south-1'
      });
  const secretName = 'local';
  const secretManager = new AWS.SecretsManager();

  try {
    const secret = await secretManager.getSecretValue({ SecretId: secretName }).promise();
    if ('SecretString' in secret) {
      const secretValue = JSON.parse(secret.SecretString);
      console.log('MONGO_URI' in secretValue)
      if ('MONGO_URI' in secretValue) {
        
        return secretValue.MONGO_URI;
      }
      
      console.log('MONGO_URI not found in secret');
    } else {
      console.log('SecretString not found in secret');
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    throw error;
  }

  return null;
};

module.exports = secretData;
