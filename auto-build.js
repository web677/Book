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

const runCMD = (cmd, args, callback) => {
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
    var pushInfo = {
        url: event.payload.repository.html_url,
        committer: event.payload.head_commit.committer.name,
        email: event.payload.head_commit.committer.email
    }
    runCMD('git', 'pull', (err, data) => {
        if(err){
            sendEmail({
                html: `<b>${pushInfo.committer}(${pushInfo.email})提交到github仓库<a href="${pushInfo.url}">${pushInfo.url}</a>的更新，在服务器自动更新时出错${err.toString()}，请及时查看<b>`
            })
        }else{
            runCMD('gitbook', 'build', (err, data) => {
                if(err){
                    sendEmail({
                        html: `<b>${pushInfo.committer}(${pushInfo.email})提交到github仓库<a href="${pushInfo.url}">${pushInfo.url}</a>的更新，在构建gitbook时发生错误，请及时查看<b>`
                    })
                }else{
                    sendEmail({
                        html: `<b>${pushInfo.committer}(${pushInfo.email})提交到github仓库<a href="${pushInfo.url}">${pushInfo.url}</a>的更新，构建成功，请知悉<b><br><center><a href="http://book.eshengeshu.com/">点我查看</a></center>`
                    })
                }
            })
        }
    })
})

githubWebhook.on("error", (event) => {
    console.log(JSON.stringify(event))
})

