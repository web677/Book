const http = require('http')
const githubWebhook = require('github-webhook-handler')({path: '/webhook', secret: '123qwe,,,'})

const sendEmail = (options = { subject: "来自book.eshengeshu.com的提醒", html: "<b>您的book有新的更新</b>"}) => {
    let nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: "qq",
        auth: {
            user: "407907175@qq.com",
            pass: "yqxhzqgnpmmzbghj"
        }
    })

    let mailOptions = {
        from: '"来自老李的邮件👻" <407907175@qq.com>',
        to: 'ly@fanli.com',
        subject: options.subject,
        text: 'book.eshengeshu.com',
        html: options.html
    }

    transporter.sendMail(mailOptions)

}

const runCmd = (cmd, args, callback) => {
    let { spawn } = require('child_process')
    let childProcess = spawn(cmd, args)

    childProcess.stdout.on("data", (data) => {
        callback(null, data)
    })

    childProcess.stderr.on("data", (data) => {
        callback(data)
    })

}

http.createServer(function (req, res) {
    githubWebhook(req, res, function (err) {
        res.statusCode = 200
        res.end('got it')
    })
}).listen(4001)

githubWebhook.on("push", (event) => {
    // sendEmail()
    console.log(JSON.stringify(event))
})

githubWebhook.on("error", (event) => {
    console.log(JSON.stringify(event))
})

// test