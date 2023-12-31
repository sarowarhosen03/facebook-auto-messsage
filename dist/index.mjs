#!/usr/bin/env node
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import Readline from 'readline';
import fs from 'fs';
dotenv.config();
const config = {
    userName: process.env.userName,
    password: process.env.password,
    headless: true,
    action: undefined,
    message: '',
    howManyTime: undefined,
    delay: 5000,
    chatId: undefined,
};
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
        return (config.chatId = Number(process.argv[index + 1]));
    }
    if (val == '-d') {
        return (config.delay = Number(process.argv[index + 1]) * 1000);
    }
    if (val == '-b' || val == '-headless') {
        return config.headless = !(process.argv[index + 1].toLowerCase() == 'true');
    }
    if (val == '-h' || val == '--help') {
        console.log('help \n \t -u \t username (phone or Email) \n \t -p \t password (facebook Account password) \n \t -a \t action (eg 1 for liek 2 for message) \n \t -m \t message \n \t -i \t how many time number(eg 20 30 at a time max 30 recomanded) \n \t -c \t chat id number(eg 1005066375029126) \n \t -d \t delay  sec : sec (eg 5) \n \t -b \t browser true|false');
        process.exit(0);
    }
});
let isCheckPoint = false;
console.log("press 'k' to quite");
//lunche the default browser window
let browser = null;
try {
    if (config.headless) {
        browser = await puppeteer.launch({
            userDataDir: 'headless',
            headless: 'new'
        }).catch((e) => {
            console.log('error ocaurd to lunche browser please try agin');
            fs.unlinkSync('headless');
            kill();
        });
    }
    else {
        browser = await puppeteer.launch({
            userDataDir: 'head',
            headless: false
        }).catch((e) => {
            console.log('error ocaurd to lunche browser please try agin');
            fs.unlinkSync('head');
            kill();
        });
    }
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    page.setDefaultTimeout(0);
    await page.goto('https://facebook.com', {
        waitUntil: 'networkidle2',
    });
    //await page.click('#mount_0_0_pQ > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div:nth-child(2) > div > span:nth-child(3) > div')
    const loginDone = await login(page);
    if (loginDone) {
        //geting target userid form user
        if (!(config === null || config === void 0 ? void 0 : config.chatId)) {
            config.chatId = await getChatId();
        }
        //go to messenger web
        await page.goto(`https://www.facebook.com/messages/t/${config.chatId}`, {
            waitUntil: 'networkidle2',
        });
        await startAction(page);
    }
}
catch (e) {
    console.log(e === null || e === void 0 ? void 0 : e.message);
    kill();
}
async function startAction(page) {
    if (!(config === null || config === void 0 ? void 0 : config.action)) {
        config.action = await getTheAction();
    }
    let message = '';
    if (config.action === 2 && (!(config === null || config === void 0 ? void 0 : config.message))) {
        message = await getMessage();
    }
    if (!(config === null || config === void 0 ? void 0 : config.howManyTime)) {
        config.howManyTime = await getHowManyTime();
    }
    let timeToDo = config.howManyTime || 5;
    console.log('Sending');
    process.stdout.write(`\r${timeToDo}`);
    while (timeToDo > 0) {
        if (config.action === 1) {
            await sendLike(page);
        }
        else {
            await sendMessage(message, page);
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
    await startAction(page);
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
            }
            else if (message == 'k') {
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
    return new Promise((resolve) => {
        readline.question('Eneter How Many Time ?', (time) => {
            if (!time || isNaN(Number(time))) {
                return resolve(1);
            }
            if (time == 'k') {
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
        readline.question('Enter The Action ? \n 1. like  \n 2,  send  message ', (action) => {
            if (!action) {
                rejects('invalid action');
            }
            if (Number(action) > 0 && Number(action) < 3) {
                readline.close();
                resolve(Number(action));
            }
            else if (action === 'k') {
                kill();
            }
            else {
                rejects('invalid action');
            }
        });
    });
}
function kill() {
    console.log('killing the browser');
    browser.close();
    process.exit(0);
}
async function sendLike(page) {
    await page.waitForSelector('[aria-label="Send a Like"]');
    const sendLikebutton = await page.$('[aria-label^="Send a"]');
    sendLikebutton ? await sendLikebutton.click() : console.log('sendLikeButton not found');
}
async function sendMessage(message, page) {
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
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
async function login(page) {
    return new Promise(async (resolve) => {
        const data = await page.cookies('https://www.facebook.com/');
        const c_user = data.find((cookie) => cookie.name === 'c_user');
        if (c_user === null || c_user === void 0 ? void 0 : c_user.value) {
            console.log('already login');
            return resolve(true);
        }
        //
        //need to log in
        console.log('need to login');
        if (config === null || config === void 0 ? void 0 : config.userName)
            console.log(config.userName);
        if (!(config === null || config === void 0 ? void 0 : config.userName)) {
            config.userName = await getUsername();
        }
        await page.type('#email', config === null || config === void 0 ? void 0 : config.userName);
        if (!(config === null || config === void 0 ? void 0 : config.password)) {
            config.password = await getPassword();
        }
        await page.type('#pass', config === null || config === void 0 ? void 0 : config.password);
        await page.keyboard.press('Enter');
        await page.waitForNavigation();
        const errobox = await page.$('#error_box');
        if (errobox) {
            const error = await page.evaluate((el) => el.textContent, errobox);
            console.log(error, "try agin with  valid cradantial");
            kill();
        }
        if (await isNeedLoginApproval(page)) {
            console.log('please aprove login');
            isCheckPoint = true;
            page.on('framenavigated', async (frame) => {
                if (isCheckPoint) {
                    if (!frame.url().includes('https://www.facebook.com/checkpoint/?next')) {
                        console.log('checkpoint passed');
                        isCheckPoint = false;
                        return resolve(true);
                    }
                }
            });
        }
        else {
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
            if (userName == 'k') {
                return kill();
            }
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
            if (password == 'k') {
                return kill();
            }
            if (!password) {
                rejects('invalid username');
            }
            readline.close();
            resolve(password);
        });
    });
}
async function isNeedLoginApproval(page) {
    return page.url().includes('https://www.facebook.com/checkpoint/?next');
}
