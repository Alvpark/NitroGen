import chalk from "chalk";
import clear from "clear";
import figlet from "figlet";
import inquirer from "inquirer";
import fs from "fs";
import axios from "axios";

function printLogo() {
  console.log(
    chalk.yellow(
      figlet.textSync('NitroGen', { horizontalLayout: 'full' })
    )
  );
}

clear();
printLogo()

const answers = await inquirer.prompt([
  {
    type: 'list',
    name: 'mode',
    message: 'Mode:',
    choices: [ 'Generate Nitro (Online Code Check) | Slow', 'Generate Nitro (Offline) | Fast' ],
    default: 'Generate Nitro (Online Code Check) | Slow'
  },
  {
    type: 'input',
    name: 'amount',
    default: 1,
    message: 'How Many Codes You Want To Generate:'
  },
  {
    type: 'input',
    name: 'filename',
    default: 'valid_codes.txt',
    message: 'Save Valid Codes To:'
  }
]);

async function GenerateRandomString(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

async function CheckCode(code, proxy = null) {
  try {
    if (proxy != null) {
      const response = await axios.get(`https://discordapp.com/api/v9/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`, {
        proxy: {
          protocol: 'http',
          host: proxy.split(':')[0],
          port: proxy.split(':')[1]
        }
      })
      if (response.status == 200) return true
      else return false
    } else {
      const response = await axios.get(`https://discordapp.com/api/v9/entitlements/gift-codes/${code}?with_application=false&with_subscription_plan=true`)
      if (response.status == 200) return true
      else return false
    }
  } catch (err) {
      return false
  }
}

async function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

if (answers.mode == "Generate Nitro (Online Code Check) | Slow") {
  const proxy = await inquirer.prompt([
    {
      type: 'list',
      name: 'proxy',
      message: 'Do You Want Use Proxy:',
      choices: [ 'Yes', 'No' ],
      default: 'No'
    }
  ])
  if (proxy.proxy == "Yes") {
    const proxy_file = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Proxy filename:',
        default: 'proxy.txt'
      }
    ])
    clear();
    printLogo()
    console.log(`Reading Proxies...`)
    let proxy_array = fs.readFileSync(proxy_file.name).toString().split("\n");

    let status = {"valid": 0, "invalid": 0}
    let validCodes = []
    for (let i = 0; i <= answers.amount; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      clear();
      printLogo()
      console.log(`Generated: ${status.valid + status.invalid} | Valid: ${status.valid} | Invalid: ${status.invalid}`)
      const code = await GenerateRandomString(16)
      console.log(`Checking: https://discord.gift/${code}`)
      if (await CheckCode(code, proxy_array[await getRandomInt(0, proxy_array.length)])) {
        status.valid++
        validCodes.push(code)
      } else status.invalid++
    }
    clear();
    printLogo()
    if (status.valid > 0) {
      console.log(`Generated ${status.valid} Valid Codes`)
      console.log(`Saving To File...`)
      let file = fs.createWriteStream(answers.filename);
      validCodes.forEach(function(v) { file.write(v + '\n'); });
      file.end();
    } else {
      console.log(`Generated 0 Valid Codes`)
    }
  } else {
    let status = {"valid": 0, "invalid": 0}
    let validCodes = []
    for (let i = 0; i <= answers.amount; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      clear();
      printLogo()
      console.log(`Generated: ${status.valid + status.invalid} | Valid: ${status.valid} | Invalid: ${status.invalid}`)
      const code = await GenerateRandomString(16)
      console.log(`Checking: https://discord.gift/${code}`)
      if (await CheckCode(code)) {
        status.valid++
        validCodes.push(`https://discord.gift/${code}`)
      } else status.invalid++
    }
    clear();
    printLogo()
    if (status.valid > 0) {
      console.log(`Generated ${status.valid} Valid Codes`)
      console.log(`Saving To File...`)
      let file = fs.createWriteStream(answers.filename);
      validCodes.forEach(function(v) { file.write(v + '\n'); });
      file.end();
    } else {
      console.log(`Generated 0 Valid Codes`)
    }
  }
} else if (answers.mode == "Generate Nitro (Offline) | Fast") {
  let Codes = []
  for (let i = 0; i <= answers.amount; i++) {
    clear();
    printLogo()
    console.log(`Generated: ${Codes.length}`)
    Codes.push(`https://discord.gift/${await GenerateRandomString(16)}`)
  }
  clear();
  printLogo()
  console.log(`Saving To File...`);
  let file = fs.createWriteStream(answers.filename);
  Codes.forEach(function(v) { file.write(v + '\n'); });
  file.end();
}

// TODO: Worker Threads