async function readRequestBody(request) {
    const {headers} = request;
    const contentType = headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return JSON.stringify(await request.json());
    } else if (contentType.includes('form')) {
        const formData = await request.formData();
        const body = {};
        for (const entry of formData.entries()) {
            body[entry[0]] = entry[1];
        }
        let data = JSON.parse(JSON.stringify(body));
        let combine = `{"personalizations":[{"to":[{"email":"${data.to}","name":"${data.ton}"}],"dkim_domain":"${data.dkim}","dkim_selector":"${data.dkims}","dkim_private_key":"${data.dkimpk}"}],"from":{"email":"${data.from}","name":"${data.fromn}"},"reply_to":{"email":"${data.rep}","name":"${data.repn}"},"subject":"${data.sbj}","content":[{"type":"${data.type}","value":"${data.body}"}]}`;
        // let combine = `{"personalizations":[{"to":[{"email":"${data.to}","name":"${encodeURIComponent(data.ton)}"}],"dkim_domain":"${data.dkim}","dkim_selector":"${data.dkims}","dkim_private_key":"${data.dkimpk}"}],"from":{"email":"${data.from}","name":"${encodeURIComponent(data.fromn)}"},"reply_to":{"email":"${data.rep}","name":"${encodeURIComponent(data.repn)}"},"subject":"${encodeURIComponent(data.sbj)}","content":[{"type":"${data.type}","value":"${encodeURIComponent(data.body)}"}]}`;
        return combine;
    } else {
        return '{"success":false}';
    }
}

async function email(message) {
    const allowList = [""];
    if (!allowList.includes(message.from)) {
        message.setReject("Address not allowed");
        return;
    }
    await message.forward("");
}

async function handleRequest(request) {
    let start = Date.now();
    let reqBody = await readRequestBody(request);
    let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
        "method": "POST",
        "headers": {
            "content-type": "application/json",
        },
        "body": reqBody
    });
    let resp = await fetch(send_request);
    let respText = await resp.text();
    let end = Date.now();
    let total = end - start;
    return new Response(respText, {
        headers: {
            "X-MC-Status": resp.status.toString(), // 将数字转换为字符串
            "X-Response-Time": total.toString() // 将数字转换为字符串
        }
    });
}

const htmlForm = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>提交您的电子邮件</title>
<style>
body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f7f7f7;
  margin: 0;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.container {
  display: flex;
  width: 80%; /* 占浏览器页面宽度的80% */
  max-width: 1200px; /* 最大宽度限制 */
  gap: 20px;
  margin-top: 20px;
}

.panel {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.left-panel {
  width: 33.333%; /* 占整体的三分之一宽度 */
}

.right-panel {
  width: 66.666%; /* 占整体的三分之二宽度 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 使内容和按钮分布在两端 */
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input, textarea, select {
margin-bottom: 15px;
width: 100%;
padding: 10px;
border: 1px solid #ccc;
border-radius: 4px;
box-sizing: border-box;
transition: border-color 0.3s ease; /* 添加过渡效果 */
}

input:focus, textarea:focus, select:focus {
border-color: #007bff; /* 聚焦时改变边框颜色 */
}

input[type="submit"] {
background-color: #007bff;
color: white;
border: none;
padding: 12px 20px;
cursor: pointer;
border-radius: 4px;
font-size: 16px;
transition: background-color 0.3s ease;
align-self: flex-end; /* 将按钮对齐到右边框底部 */
}

input[type="submit"]:hover {
background-color: #0056b3;
}

.required:after {
content: "*";
color: red;
margin-left: 4px;
}

@media (max-width: 768px) {
.container {
flex-direction: column; /* 在小屏幕上堆叠布局 */
}
.left-panel, .right-panel {
width: 100%; /* 小屏幕上全宽 */
}
}
</style>
</head>
<body>
<div class="container">
<div class="panel left-panel">
<form action="/" method="POST" autocomplete="on">
<label for="from" class="required">发件人邮箱</label>
<input id="from" name="from" type="email" placeholder="sender@example.com *" required>

<label for="fromn">发件人姓名</label>
<input id="fromn" name="fromn" type="text" placeholder="Sender Name">

<label for="to" class="required">收件人邮箱</label>
<input id="to" name="to" type="email" placeholder="receiver@example.com *" required>

<label for="ton">收件人姓名</label>
<input id="ton" name="ton" type="text" placeholder="Receiver Name">

<label for="rep">回复至邮箱</label>
<input id="rep" name="rep" type="email" placeholder="reply-to@example.com">

<label for="repn">回复人姓名</label>
<input id="repn" name="repn" type="text" placeholder="Replier Name">

<label for="dkim">DKIM 域名</label>
<input id="dkim" name="dkim" type="text" placeholder="DKIM Domain">

<label for="dkims">DKIM 选择器</label>
<input id="dkims" name="dkims" type="text" placeholder="DKIM Selector">
  
<label for="dkimpk">DKIM 私钥</label>
<textarea name="dkimpk" rows="4" cols="23" type="text" placeholder="DKIM Private Key MIICXQIBAAKBgQCU......."></textarea><br>
  
<label for="type">邮件类型</label>
<select id="type" name="type">
<option value="text/html; charset=utf-8">HTML</option>
<option value="text/plain; charset=utf-8" selected>纯文本</option>
</select>
</div>
<div class="panel right-panel">
<label for="sbj" class="required">邮件主题</label>
<input id="sbj" name="sbj" type="text" placeholder="邮件主题" required>
<label for="body" class="required">邮件内容</label>
<textarea id="body" name="body" rows="14" placeholder="邮件内容" required style="flex-grow: 1;"></textarea>
<input type="submit" value="提交">
</form>
</div>
</div>

<script>
// 简单的页面载入动画效果
document.addEventListener('DOMContentLoaded', function() {
document.body.style.opacity = 0;
document.body.style.transition = 'opacity 1s ease-out';
document.body.style.opacity = 1;
});
</script>

</body>
</html>
`;

addEventListener('fetch', event => {
    const {request} = event;
    const {url} = request;
    if (url.includes('submit')) {
        return event.respondWith(new Response(htmlForm, {headers: {"Content-Type": "text/html"}}));
    }
    if (request.method === 'POST') {
        return event.respondWith(handleRequest(request));
    } else if (request.method === 'GET') {
        return event.respondWith(new Response(`The request was a GET`));
    }
});
