const http = require('http')
const githubWebhook = require('github-webhook-handler')({path: '/webhook', secret: '123qwe,,,'})

const sendEmail = (options = { subject: "来自book.eshengeshu.com的提醒", html: "<b>您的book有新的更新</b>"}) => {
    let nodemailer = require('nodemailer')
    
    let transporter = nodemailer.createTransport({
        service: "qq",
        auth: {
            user: "407907175@qq.com",
            pass: "qkmynyyyvxojbjbf"
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

const runCMD = (cmd, args, callback) => {
    let { spawn } = require('child_process')
    let childProcess = spawn(cmd, args)

    var res = ""

    childProcess.stdout.on("data", (data) => {
        res += data
    })

    childProcess.stdout.on("end", () => {
        callback(null, res)
    })

}

http.createServer(function (req, res) {
    githubWebhook(req, res, function (err) {
        res.statusCode = 200
        res.end('got it')
    })
}).listen(4001)

githubWebhook.on("push", (event) => {
    var pushInfo = {
        url: event.payload.repository.html_url,
        committer: event.payload.head_commit.committer.name,
        email: event.payload.head_commit.committer.email
    }
    runCMD('git', ['pull'], (err, data) => {
            sendEmail({
                html: `<p>${pushInfo.committer}(${pushInfo.email})提交到github仓库<a href="${pushInfo.url}">${pushInfo.url}</a>的更新，在服务器自动更新成功</p
                        <p>${data.toString()}</p>`
            })
            runCMD('gitbook', ['build'], (err, data) => {
                sendEmail({
                    html: `<p>${pushInfo.committer}(${pushInfo.email})提交到github仓库<a href="${pushInfo.url}">${pushInfo.url}</a>的更新，构建成功，请知悉</p>
                            <p>${data.toString().replac(/\[0;36m/igm, '<br>').replaceAll(/(\[0m)|(\[0;32m)/igm, '')}</p>
                            <center><a href="http://book.eshengeshu.com/">点我查看结果</a></center>`
                })
            })
    })
})

githubWebhook.on("error", (event) => {
    sendEmail({
        html: `您本次在github的提交并未从成功推送到book.eshengeshu.com/webhook，请前往查看`
    })
})
