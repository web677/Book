const { spawn } = require('child_process')
const nodemailer = require('nodemailer')

setTimeout(() => {
    let gitPull = spawn("git", ["pull"])

    gitPull.stdout.on("data", data => {
        let gitbookBuild = spawn("gitbook", ["build"])
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
            subject: 'Hello 老李',
            text: 'book.eshengeshu.com',
            html: '<b>你的book更新成功并自动构建成功啦</b>'
        }

        transporter.sendMail(mailOptions)
    })

    gitPull.stderr.on("data", data => {
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
            subject: 'Hello 老李',
            text: 'book.eshengeshu.com',
            html: '<b>你的book更新失败啦，无法自动构建了，快去看看</b>'
        }

        transporter.sendMail(mailOptions)
    })

},1000)


