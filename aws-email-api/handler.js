'use strict';

const fetch = require("node-fetch");
module.exports.parse = async (event, context, callback) => {

    let message = event.Records[0].Sns.Message;
    console.log('Message received from SNS 23/08:', message);
    let message_parsed = JSON.parse(message);

    let recipient = message_parsed.mail.destination[0];
    let notificationType = message_parsed.notificationType;

    switch (notificationType) {
        case 'Bounce':
            let bounceType = message_parsed.bounce.bounceType;
            if (bounceType == 'Transient') {
                //We can be more specific to detect the Out of Office
                console.log(`This recipient ${recipient} is Out of Office`)
            }
            break;
        case 'Delivery':
            console.log(`The mail for ${recipient} has been delivered with success`)
            break;
        default:
            console.log(`This ${notificationType} is not treated yet`);
    }

    fetch('https://jsonplaceholder.typicode.com/todos/1')
        .then(response => response.json())
        .then(json => console.log(json))

    console.log("I'm calling the API endpoint to transmit this information")
    callback(null, 'Success');
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v3.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};
