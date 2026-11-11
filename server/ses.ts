import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { HttpError } from './process-summary.js';
import type { buildSummary } from './summary.js';
export async function send(email:string,summary:ReturnType<typeof buildSummary>){
 const {AWS_REGION:region,AWS_ACCESS_KEY_ID:accessKeyId,AWS_SECRET_ACCESS_KEY:secretAccessKey,SES_FROM_EMAIL:source}=process.env;
 if(!region||!accessKeyId||!secretAccessKey||!source)throw new HttpError(503,'Falta configurar AWS SES en el servidor.');
 const client=new SESClient({region,credentials:{accessKeyId,secretAccessKey},maxAttempts:2});
 await client.send(new SendEmailCommand({Source:source,Destination:{ToAddresses:[email]},Message:{Subject:{Data:summary.subject,Charset:'UTF-8'},Body:{Text:{Data:summary.text,Charset:'UTF-8'},Html:{Data:summary.html,Charset:'UTF-8'}}}}));
}
