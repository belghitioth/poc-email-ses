const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const simpleParser = require('mailparser').simpleParser;

exports.handler = function(event, context, callback) {

    console.log("Here is the raw event", event.Records[0]);

    let snsMessageParsed =  event.Records[0].Sns.Message;
    console.log('Message received from SNS:', snsMessageParsed);
    snsMessageParsed = JSON.parse(snsMessageParsed);
    let recipient = snsMessageParsed.mail.destination[0];
    let notificationType = snsMessageParsed.notificationType;

    switch (notificationType) {
        case 'Bounce':
            let bounceType = snsMessageParsed.bounce.bounceType;
            if (bounceType == 'Transient') {
                //We can be more specific to detect the Out of Office
                console.log(`This recipient ${recipient} might be Out of Office`);
            }
            break;
        case 'Delivery':
            console.log(`The mail for ${recipient} has been delivered with success`);
            break;
        case 'Received':
            console.log(`The mail from ${recipient} has been received with success`);
            const s3Object = snsMessageParsed.receipt.action.objectKey;
// Retrieve the email from your bucket
            const req = {
                Bucket: snsMessageParsed.receipt.action.bucketName,
                Key: s3Object
            };
            console.log("I'm trying to get the mail from the s3 Bucket");
            s3.getObject(req, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    callback(err);
                } else {
                    console.log("Raw email:\n" + data.Body);
// Custom email processing goes here
                    simpleParser(data.Body, (err, parsed) => {
                        if (err) {
                            console.log(err, err.stack);
                            callback(err);
                        } else {
                            console.log("date:", parsed.date);
                            console.log("subject:", parsed.subject);
                            console.log("body:", parsed.text);
                            console.log("from:", parsed.from.text);
                            console.log("attachments:", parsed.attachments);
                            // Send data to API
                            console.log("I'm calling the API endpoint to transmit this information");
                            fetch('https://jsonplaceholder.typicode.com/todos/1')
                                .then(response => response.json())
                                .then(json => console.log(json));

                            callback(null, null);
                        }
                    });
                }
            });
            break;
        default:
            console.log(`This ${notificationType} is not treated yet`);
    }
    callback(null, 'Success');
};




