// reference: https://qiita.com/ishikun/items/90b766e5555421970e9f

const aws = require('aws-sdk');
const fetch = require('node-fetch');
const cw    = new aws.CloudWatch({region: 'us-east-1', endpoint: 'monitoring.us-east-1.amazonaws.com'});

const config = require('./env.json');

const postTitle = config.post_title;

// Slackのチャンネル名を指定。#generalや@ishikunなど。
// const channel_name = '';
const channel_name = config.channel_name;

// Slack Incoming Webhook URLを指定。
// const channel_url  = '';
const channel_url  = config.channel_url;

 // サービス名を配列で指定。
const serviceNames = config.service_names;


async function getMetricStatistics(serviceName, startTime, endTime){
  const dimensions = [ { Name: 'Currency', Value: 'USD' } ];
  if (serviceName) dimensions.push({ Name: 'ServiceName', Value: serviceName }); // if not specified, it gives total cost

  const params = {
    MetricName: 'EstimatedCharges',
    Namespace: 'AWS/Billing',
    Period: 86400,
    StartTime: startTime,
    EndTime: endTime,
    Statistics: ['Average'],
    Dimensions: dimensions
  };

  return new Promise( (resolve, reject) => {
    cw.getMetricStatistics(params, (err, data) => {
      if (err) reject(err);
      else {
        if(serviceName) resolve({ name: serviceName, data: data });
        else resolve( {name: 'Total', data: data});
      }
    });
  });
}


async function getBilling(){
  const now = new Date();
  const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1,  0,  0,  0);
  const endTime   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);

  const promises = serviceNames.map( (sn) => {
    return getMetricStatistics(sn, startTime, endTime);
  });
  const rawBills = await Promise.all(promises);

  const bills = rawBills.map((elem) => {
    const datapoints = elem.data['Datapoints'];
    const retVal = {};
    retVal.name = elem.name;
    retVal.cost = (datapoints.length > 0) ? datapoints[datapoints.length - 1]['Average'] : 0; // だいぶどんぶり勘定な気がする。
    return retVal;
  });

  return bills;
}


async function postBillingToSlack(bills){
  const billingText = bills.reduce( (accum, current) => {
    return accum
      + current.name + ': ' + current.cost + ' USD' + '\n';
  }, '');

  const message = {
    channel: channel_name,
    attachments: [{
      title: postTitle,
      text: billingText,
      color: 'good'
    }]
  };
  const body = JSON.stringify(message);

  const response = await fetch(channel_url, {
    method: 'POST',
    body,
    headers: {'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body)}
  });
  // const responseJson = await response.json();
  if(response.status >= 200 && response.status < 300) {
    console.log('successful posting');
  }
  else {
    const err = Object.assign({status: response.status, statusText: response.statusText}, response);
    console.error(err);
  }
}

exports.handler = async (event) => {
  console.log('Lambda called OK!!');
  console.log(event);

  const billing = await getBilling();
  console.log(billing);

  await postBillingToSlack(billing);

};
