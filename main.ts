import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as input from 'input';
import * as fs from 'fs';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

if (process.env.baseEnv && process.env.botEnv) {
  dotenv.config({ path: process.env.baseEnv });
  dotenv.config({ path: process.env.botEnv });
} else {
  console.log('no env found');
}



const wait = (timeout: number) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(true)
    }, timeout);
  })
}

(async () => {
  const apiId = (process.env.API_ID ? parseInt(process.env.API_ID) : null) || 20658026;
  const apiHash = process.env.API_HASH || "2e2512e0537d012f50ae62c907ee084d";
  let session = process.env.SESSION || (await input.text("Inpu session(or skip): ")).replace('\n', '');
  const stringSession = new StringSession(session); // fill this later with the value from session.save()
  const timeout = (process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : null) || 45 * 1000;
  let skipLines = (process.env.SKIP_LINES ? parseInt(process.env.SKIP_LINES) : null) || 0;
  let checkLines = (process.env.CHECK_LINES ? parseInt(process.env.CHECK_LINES) : null) || 10000;
  const inputFile = process.env.INPUT_FILE || 'tmp.csv';// await input.text("Enter csv file with numbers");
  const resultFile = process.env.RES_FILE || 'out.csv';// await input.text("Enter csv file with numbers");








  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });


  console.log("You should now be connected.");
  console.log(client.session.save()); // Save this string to avoid logging in again


  const fileStream = fs.createReadStream(inputFile);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  let count = 0, success = 0;
  for await (const line of rl) {
    try {
      count++;
      if (count < skipLines) {
        continue;
      }

      let res = await client.invoke(new Api.contacts.ResolvePhone({ phone: line }));
      for (let x of res.users) {
        let user = x as any;
        success++;

        console.log(`count:${count}, success:${success}`);
        fs.appendFile('log.txt', process.env.botEnv + '/4//' + `count:${count}, success:${success}`, function (err) { })
        console.log(`${line}\t${x.id}\t${x.className}\t${user.username}\t${user.firstName + user.lastName}`);
        fs.appendFile('log.txt', process.env.botEnv + '/3//' + `${line}\t${x.id}\t${x.className}\t${user.username}\t${user.firstName + user.lastName}`, function (err) { })
        fs.appendFile(resultFile, `${line}\t${x.id}\t${x.className}\t${user.username}\t${user.firstName + user.lastName}\n`, function (err) {
          console.log(err);
          fs.appendFile('log.txt', process.env.botEnv + '/2//' + err.message, function (err) { })
        });
      }
    } catch (ex) {
      fs.appendFile('log.txt', process.env.botEnv + '/1//' + ex.message, function (err) { })
      console.log(ex);
    } finally {
      await wait((Math.random() + 1) * timeout);
    }
  }
  //await client.sendMessage("me", { message: "Hello!" });



})();