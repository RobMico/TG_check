import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as input from 'input';
import * as fs from 'fs';
import * as readline from 'readline';

const wait = (timeout: number) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(true)
    }, timeout);
  })
}

(async () => {
  const apiId = 20658026;
  const apiHash = "2e2512e0537d012f50ae62c907ee084d";
  let session = (await input.text("Inpu session(or skip): ")).replace('\n', '');
  const stringSession = new StringSession(session); // fill this later with the value from session.save()
  const timeoout = 45 * 1000;
  let skipLines = 0;
  const inputFile = 'tmp.csv';// await input.text("Enter csv file with numbers");








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
        console.log(`out.txt`, `${line}\t${x.id}\t${x.className}\t${user.username}\t${user.firstName + user.lastName}`);
        fs.appendFile(`out.txt`, `${line}\t${x.id}\t${x.className}\t${user.username}\t${user.firstName + user.lastName}\n`, function (err) {
          console.log(err);
        });
      }
    } catch (ex) {
      console.log(ex);
    } finally {
      await wait((Math.random() + 1) * timeoout);
    }
  }
  //await client.sendMessage("me", { message: "Hello!" });



})();