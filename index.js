const { Telegraf } = require('telegraf')
const axios = require("axios");
const request = require('request-promise');
const cheerio = require('cheerio');
const dotenv = require('dotenv');
dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply('Use me inLine to search GSMArena inside <a href="https://t.me/c/1244642299/139660">@Telegram</a>\n\nDev: <a href="https://t.me/JinsoRaj">Jinso Raj</a>\n⭐️ <a href="https://github.com/JinsoRaj/GSMArenaBot">Source Code</a>',
    {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_to_message_id: ctx.message.message_id,
        reply_markup:{
            inline_keyboard: [
                [
                    {text: '👇 Search 👇', switch_inline_query_current_chat:'xperia'}
                ]
            ]
        }
    });
})

bot.on('inline_query',async ctx => {
    let query = ctx.inlineQuery.query;
    // full results array
    let enq = encodeURIComponent(query);
    const url = "https://www.gsmarena.com/res.php3?sSearch=" + enq;

    const scraperesults = [];
        try{
            const html = await request.get(url);
            const $ = await cheerio.load(html);
            $("#review-body > div > ul > li >a").each((index, element) => {
                const mname = $(element).text();
                const npurl = "https://www.gsmarena.com/" + $(element).attr("href");
                const imgurl = $("#review-body > div > ul > li:nth-child(" + ++index + ") > a > img").attr("src");
                const scraperesult = { mname, npurl, imgurl};
                scraperesults.push(scraperesult);
            });
            //console.log(scraperesults);
        }catch (err) {
            bot.telegram.sendMessage(process.env.OWNER_ID, `Ooops, encountered an error for ${ctx.updateType} :`+ err)
        }


    let results = scraperesults.map((item, index) => {
        return {
            type: 'article',
            id: String(index),
            title: item.mname,
            input_message_content: {
                message_text: `Device: [${item.mname}](${item.npurl})`,
                parse_mode: "Markdown"
            },
            reply_markup:{
                inline_keyboard: [
                    [
                        {text: 'Search Again 🔎', switch_inline_query_current_chat: query}
                    ]
                ]
            },
            description: "Instant View ",
            thumb_url: item.imgurl
        }
    })
    ctx.answerInlineQuery(results);
})
bot.catch((err, ctx) => {
    bot.telegram.sendMessage(process.env.OWNER_ID, `Ooops, encountered an error for ${ctx.updateType} :`+ err)
})
bot.launch();

