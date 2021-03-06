import { delay, ReceiveMode, Namespace } from "../../lib";
import * as dotenv from "dotenv";
dotenv.config();

const str = process.env.SERVICEBUS_CONNECTION_STRING || "";
const path = process.env.QUEUE_NAME || "";
console.log("str: ", str);
console.log("path: ", path);

let ns: Namespace;
async function main(): Promise<void> {
  ns = Namespace.createFromConnectionString(str);
  const client = ns.createQueueClient(path, { receiveMode: ReceiveMode.peekLock });
  const messageSession = await client.acceptSession({ maxAutoRenewDurationInSeconds: 0 });
  await delay(10000);
  console.log("Sleeping for 10 seconds..");
  const result = await messageSession.renewLock();
  console.log("Session renew lock result for sessionId '%s': %O / %s", messageSession.sessionId,
    result, result.toString());
  await messageSession.close();
}

main().then(() => {
  console.log(">>>> Calling close....");
  return ns.close();
}).catch((err) => {
  console.log("error: ", err);
});
