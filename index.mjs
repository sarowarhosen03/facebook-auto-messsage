import puppeteer from 'puppeteer';
import fs from 'fs';
import Readline from 'readline';

let isCheckPoint = false;
//lunche the default browser window
const browser = await puppeteer.launch({
  headless: false,
  userDataDir: './tmp',
});
const page = await browser.newPage();

await page.goto('https://facebook.com', {
  waitUntil: 'networkidle2',
});
//await page.click('#mount_0_0_pQ > div > div:nth-child(1) > div > div.x9f619.x1n2onr6.x1ja2u2z > div > div > div > div.x78zum5.xdt5ytf.x1t2pt76.x1n2onr6.x1ja2u2z.x10cihs4 > div.x9f619.x2lah0s.x1nhvcw1.x1qjc9v5.xozqiw3.x1q0g3np.x78zum5.x1iyjqo2.x1t2pt76.x1n2onr6.x1ja2u2z > div.x9f619.x1n2onr6.x1ja2u2z.xdt5ytf.x193iq5w.xeuugli.x1r8uery.x1iyjqo2.xs83m0k.x78zum5.x1t2pt76 > div > div > div > div > div > div > div > div.x1uvtmcs.x4k7w5x.x1h91t0o.x1beo9mf.xaigb6o.x12ejxvf.x3igimt.xarpa2k.xedcshv.x1lytzrv.x1t2pt76.x7ja8zs.x1n2onr6.x1qrby5j.x1jfb8zj > div > div > div:nth-child(2) > div > span:nth-child(3) > div')
await login();
//geting target userid form user
const userId = await getUserId();
await page.goto(`https://www.facebook.com/messages/t/${userId}`, {
  waitUntil: 'networkidle2',
});

const action = await getTheAction();
let message = action === 2 ? await getMessage() : '';
let howManyTime = await getHowManyTime();
console.log('Sending');
process.stdout.write(`\r${howManyTime}`);
while (howManyTime > 0) {
  if (action === 1) {
    await sendLike();
  } else {
    await sendMessage(message);
  }

  await sleep(1000);
  process.stdout.write(`\r${howManyTime}`);

  howManyTime--;
}
process.stdout.clearLine();
console.log('\n finished ');
sleep(2000);
browser.close();

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
      if (!time) {
        rejects('invalid time');
      }
      time = Number(time);
      if (isNaN(time)) {
        rejects('invalid time');
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
      'Eneter The Action ? \n 1. like  \n 2,  send  message ',
      (action) => {
        if (!action) {
          rejects('invalid action');
        }
        action = Number(action);
        if (action > 0 && action < 3) {
          readline.close();
          resolve(action);
        }
        rejects('invalid action');
      },
    );
  });
}

async function sendLike() {
  const element = await page.$('[aria-label="Send a Like"]');

  await element.click();
}
async function sendMessage(message) {
  await page.waitForSelector('[aria-label="Message"]');
  await page.type('[aria-label="Message"]', message);
  page.keyboard.press('Enter');
}

async function getUserId() {
  const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, rejects) => {
    readline.question('Eneter The Target User Chat ?', (id) => {
      if (!id) {
        rejects('invalid user id');
      }
      id = Number(id);
      if (isNaN(id)) {
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

async function login() {
  const data = await page.cookies('https://www.facebook.com/');
  const c_user = data.find((cookie) => cookie.name === 'c_user');
  const savedCookies = getCookies();
  const saved_c_user =
    savedCookies.find((cookie) => cookie.name === 'c_user') || '';
  if (saved_c_user.value === c_user.value) {
    //already login
    return;
  }

  //

  //need to login
  await page.type('#email', process.env.userName);
  await page.type('#pass', process.env.password);

  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  if (await isNeedLoginApproval()) {
    console.log('please aprove login');
    isCheckPoint = true;
    return;
  }

  await saveCookies(await page.cookies());
}

page.on('framenavigated', async (frame) => {
  if (isCheckPoint) {
    if (!frame.url().includes('https://www.facebook.com/checkpoint/?next')) {
      console.log('checkpoint passed');
      isCheckPoint = false;
      saveCookies(await page.cookies());
    }
  }
});

function saveCookies(cookies) {
  if (!cookies) cookies = [];
  fs.writeFileSync('cookies.json', JSON.stringify(cookies));
}
function getCookies() {
  return JSON.parse(fs.readFileSync('cookies.json', 'utf8'))||[];
}
async function isNeedLoginApproval() {
  return await page.url().includes('https://www.facebook.com/checkpoint/?next');
}
