#!/usr/bin/env node


import dotenv from 'dotenv';

dotenv.config();
type configType = {
    userName: string | undefined,
    password: string | undefined,
    headless: boolean,
    action: number | 1 | 2 | undefined,
    message: string | undefined,
    howManyTime: number | undefined,
    delay: number,
    chatId: number | undefined,
}
const config: configType = {
    userName: process.env.userName,
    password: process.env.password,
    headless: false,
    action: undefined,
    message: '',
    howManyTime: undefined,
    delay: 5000,
    chatId: undefined,
};
import puppeteer from 'puppeteer';
import Readline from 'readline';

process.argv.forEach((val, index) => {
    if (val == '-u') {
        return (config.userName = process.argv[index + 1]);
    }
    if (val == '-p') {
        return (config.password = process.argv[index + 1]);
    }
    if ((val == '-a')) {
        const action = Number(process.argv[index + 1]);
        if (isNaN(action) || (action < 0 && action < 3)) {
            console.log('invalid action');
            process.exit(0);
        }
        return (config.action = Number(process.argv[index + 1]));
    }
    if (val == '-m') {
        return (config.message = process.argv[index + 1]);
    }
    if (val == '-i') {
        return (config.howManyTime = Number(process.argv[index + 1]));
    }
    if (val == '-c') {
        return (config.chatId = Number(process.argv[index + 1]))
    }
    if (val == '-d') {
        return (config.delay = Number(process.argv[index + 1]) * 1000);
    }
    if (val == '-b' || val == '-headless') {
        return config.headless = process.argv[index + 1] == 'false';
    }
    if (val == '-h' || val == '--help') {
        console.log('help \n \t -u \t username (phone or Email) \n \t -p \t password (facebook Account password) \n \t -a \t action (eg 1 for liek 2 for message) \n \t -m \t message \n \t -i \t how many time number(eg 20 30 at a time max 30 recomanded) \n \t -c \t chat id number(eg 1005066375029126) \n \t -d \t delay  sec : sec (eg 5) \n \t -b \t headless true|false');
        process.exit(0);

    }
});

let isCheckPoint = false;
console.log("press 'k' to quite");

//lunche the default browser window




const browser = await puppeteer.launch({
    userDataDir: '../tmp/',
    headless: config.headless,
})
const page = await browser.newPage();
page.setDefaultNavigationTimeout(0);
page.setDefaultTimeout(0);

await page.goto('https://facebook.com', {
    waitUntil: 'networkidle2',
});
//await page.click('#mount_0_0_pQ > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div:nth-child(2) > div > span:nth-child(3) > div')
const loginDone = await login();
if (loginDone) {
    //geting target userid form user
    if (!config?.chatId) {
        config.chatId = await getChatId() as number;
    }

    //go to messenger web
    await page.goto(`https://www.facebook.com/messages/t/${config.chatId}`, {
        waitUntil: 'networkidle2',
    });

    await startAction();
}

async function startAction() {
    if (!config?.action) {
        config.action = await getTheAction() as number;
    }
    ;
    let message = '';
    if (config.action === 2 && (!config?.message)) {
        message = await getMessage() as string;

    }
    if (!config?.howManyTime) {
        config.howManyTime = await getHowManyTime() as number;
    }
    let timeToDo = config.howManyTime || 5;
    console.log('Sending');
    process.stdout.write(`\r${timeToDo}`);
    while (timeToDo > 0) {
        if (config.action === 1) {
            await sendLike();
        } else {
            await sendMessage(message);
        }

        await sleep(5000);
        process.stdout.write(`\r${timeToDo}`);

        timeToDo--;
    }
    process.stdout.clearLine(0);
    console.log('\n finished ');
    sleep(2000);
    config.action = undefined;
    config.howManyTime = undefined;
    config.message = undefined;
    await startAction();
}

async function getMessage() {
    const readline2 = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, rejects) => {
        readline2.question(' Eneter The Message ? ', (message) => {
            if (!message) {
                rejects('invalid message');
            } else if (message == 'k') {
                kill();
            }
            readline2.close();
            resolve(message);
        });
    });
}

function getHowManyTime() {
    const readline = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, rejects) => {
        readline.question('Eneter How Many Time ?', (time) => {
            if (!time || isNaN(Number(time))) {
                return resolve(1);
            } if (time == 'k') {
                return kill();
            }
            readline.close();
            resolve(time);
        });
    });
}

function getTheAction() {
    const readline = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, rejects) => {
        readline.question(
            'Enter The Action ? \n 1. like  \n 2,  send  message ',
            (action) => {
                if (!action) {
                    rejects('invalid action');
                }
                if (Number(action) > 0 && Number(action) < 3) {
                    readline.close();
                    resolve(Number(action));
                } else if (action === 'k') {
                    kill();
                } else {
                    rejects('invalid action');
                }
            },
        );
    });
}

function kill() {
    console.log('killing the browser');
    browser.close();
    process.exit(0);
}

async function sendLike() {
    await page.waitForSelector('[aria-label="Send a Like"]');
    const sendLikebutton = await page.$('[aria-label="Send a Like"]');

    sendLikebutton ? await sendLikebutton.click() : console.log('sendLikeButton not found');
}

async function sendMessage(message: string) {
    await page.waitForSelector('[aria-label="Message"]');
    await page.type('[aria-label="Message"]', message);
    page.keyboard.press('Enter');
}

async function getChatId() {
    const readline = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, rejects) => {

        readline.question('Eneter The Target User Chat id \t?', (id) => {
            if (!id) {
                rejects('invalid user id');
            }

            if (isNaN(Number(id))) {
                rejects('invalid user id');
            }
            readline.close();
            resolve(id);
        });
    });
}

await sleep(3000);

//browser.close();
function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function login() {
    return new Promise(async (resolve, rejects) => {
        const data = await page.cookies('https://www.facebook.com/');
        const c_user = data.find((cookie) => cookie.name === 'c_user');

        if (c_user?.value) {
            console.log('already login');
            return resolve(true);
        }

        //

        //need to login
        console.log('need to login', config?.userName);

        if (!config?.userName) {
            config.userName = await getUsername() as string;
        }
        await page.type('#email', config?.userName);
        if (!config?.password) {
            config.password = await getPassword() as string;
        }
        await page.type('#pass', config?.password);

        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        const errobox = await page.$('#error_box');
        if (errobox) {
            const error = await page.evaluate((el) => el.textContent, errobox);
            console.log(error, "try agin with  valid cradantial");
            browser.close();
            process.exit(0);
        }


        if (await isNeedLoginApproval()) {
            console.log('please aprove login');
            isCheckPoint = true;
            page.on('framenavigated', async (frame) => {
                if (isCheckPoint) {
                    if (
                        !frame.url().includes('https://www.facebook.com/checkpoint/?next')
                    ) {
                        console.log('checkpoint passed');
                        isCheckPoint = false;
                        return resolve(true);
                    }
                }
            });
        } else {
            resolve(true);
        }
    });
}

async function getUsername() {
    const readline = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, rejects) => {
        readline.question('Enter Your Facebook Account Email or Phone Number ? ', (userName) => {
            if (!userName) {
                return rejects('invalid username');
            }
            readline.close();
            return resolve(userName || '');
        });
    });


}

async function getPassword() {
    const readline = Readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve, rejects) => {
        readline.question('Enter Your Facebook Account Password ? ', (password) => {
            if (!password) {
                rejects('invalid username');
            }
            readline.close();
            resolve(password);
        });
    });


}

async function isNeedLoginApproval() {
    return await page.url().includes('https://www.facebook.com/checkpoint/?next');
}
