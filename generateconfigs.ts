import * as fs from 'fs';

const count = 100;
const linesPerAcc = 10000;

(async () => {
    for (let i = 0; i < count; i++) {
        fs.appendFile(`./configs/bot${i}.env`, `
SESSION=
SKIP_LINES=${i * linesPerAcc}
CHECK_LINES=${linesPerAcc}
        `, function (err) {
            console.log(err);
        });
    }
})()

