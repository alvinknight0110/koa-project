const Koa = require('koa');
const Router = require('koa-router');
const KoaBody = require('koa-body');
const mongo = require('koa-mongo');

const morgan = require('koa-morgan');
const fs = require('fs'); // 檔案存取

const app = new Koa();

app.use(mongo({
    uri: 'mongodb+srv://alvinknight:vbjPeWtkyBvavH4G@cluster0.qlulfz3.mongodb.net/test',
}));

app.use(KoaBody());

const router = new Router();
let lastId = 0;
let articles = [];

router
    .post('/article', ctx => {
        // 把資料分別存在 title、body、author 等變數
        const { title, body, author } = ctx.request.body;

        if (title && body && author) {
            // 如果必填資料都有，就塞進 articles 裡面。然後依照文件回傳 201
            ctx.db.collection('articles').insertOne({
                title,
                body,
                author,
                time: new Date(),
            });

            ctx.status = 201;
        } else {
            // 如果有欄位沒有填，就依照文件回傳 400
            ctx.status = 400;
        }
    })
    .put('/article/:id', ctx => {
        // 把資料分別存在 id、title、body、author 等變數
        const id = parseInt(ctx.params.id);
        const { title } = ctx.request.body;
        const { body } = ctx.request.body;
        const { author } = ctx.request.body;

        if (title && body && author) {
            // 如果必填資料都有，就編輯文章
            // 首先找出文章
            const article = articles.find(x => x.id === id);

            if (article) {
                // 如果有文章的話就編輯，並依照文件回傳 204
                article.title = title;
                article.body = body;
                article.author = author;
                article.time = new Date();
                ctx.status = 204;
            } else {
                // 沒有找到的話就依照文件回傳 404
                ctx.status = 404;
            }
        } else {
            // 如果有欄位沒有填，就依照文件回傳 400
            ctx.status = 400;
        }
    })
    .get('/article', ctx => {
        const article = ctx.mongo.db('mongodbVSCodePlaygroundDB').collection('articles').find();
        if (article) {
            ctx.body = article;
        } else {
            ctx.status = 404;
        }
    })
    .get('/article/:id', async ctx => {
        // 把資料分別存在 id 變數
        const id = ctx.params.id;

        if (id) {
            // 首先找出文章
            const article = await ctx.mongo.db('mongodbVSCodePlaygroundDB').collection('articles').findOne({ _id: mongo.ObjectId(id) });

            if (article) {
                // 如果有文章的話就依照文件回傳文章內容（預設就是狀態 200）
                ctx.body = article;
            } else {
                // 沒有找到的話就依照文件回傳 404
                ctx.status = 404;
            }
        } else {
            // 如果沒送 id，文章就不存在，就依照文件回傳 404
            ctx.status = 404;
        }
    })
    .delete('/article/:id', ctx => {
        // 把資料分別存在 id 變數
        const id = parseInt(ctx.params.id);

        if (id) {
            // 首先找出文章
            const article = articles.find(x => x.id === id);

            if (article) {
                // 如果有文章的話就刪除文章，然後依照文件回傳 204
                articles = articles.filter(x => x.id !== id);
                ctx.status = 204;
            } else {
                // 沒有找到的話就依照文件回傳 404
                ctx.status = 404;
            }
        } else {
            // 如果沒送 id，文章就不存在，就依照文件回傳 404
            ctx.status = 404;
        }
    });

app.use(router.routes());

// 記錄錯誤日誌
// const accessLogStream = fs.createWriteStream(__dirname + '/access.log', { flags: 'a' });
// app.use(morgan('combined', { stream: accessLogStream }));

app.listen(3000);