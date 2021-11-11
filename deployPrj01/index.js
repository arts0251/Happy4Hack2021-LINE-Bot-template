//LINE SDKを読み込み
const line = require('@line/bot-sdk');

//アプリケーション設定の値を取得
const config = {
    //LINEチャネルの値
    channelAccessToken:process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret:process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

//イベント処理メソッド
//module.exportsに結果を格納すると返送できる
module.exports = async function (context, req) {

    //構文を短くするため共通する処理は定数に格納
    const events = req.body.events[0];

    //体調に合わせた就寝促し時間の調整用
    var pushMessageTimeAdd = 0;

    //受信イベントのタイプがメッセージでもポストバックでも無い場合
    if (events.type !== 'message' && events.type !== 'postback') {
        //何も返送せずに終了
        return Promise.resolve(null);

    //受信イベントのタイプがポストバックの場合
    } else if (events.type === 'postback' ) {
        //ポストバックが「起床時間データ」の場合
        if (events.postback.data === 'WakeUpTime') {

            //Cosmos DBへ「起きたい時間」「送信元ユーザーのLINE ID」を登録する処理を追加予定

            //Timerトリガーの起動時間を「起床時間」「今日の体調」に合わせて変更予定
            //（function.jsonのscheduleを変更）
            //変更点：キューを私用した方法に変更するため、やり方を精査中
            
            //送られてきた[起きたい時間]にメッセージを添えて返送
            return client.replyMessage(events.replyToken,{
                type:"text",
                text:events.postback.params.time + "に起きたいんですね！分かりました！"
            });
        };

    //受信イベントのタイプがテキストの場合
    } else if (events.message.type === 'text') {
        //受信したテキストの内容に合わせて処理を分岐
        switch(events.message.text){

            case('今日の体調を教えるよ。'):
                //「体調の選択ボタン」をテンプレートで返送
                return client.replyMessage(events.replyToken,{
                    "type": "template",
                    "altText": "今日の体調を確認",
                    "template": {       
                        "type": "buttons",
                        "title": "今日の体調を教えて！",
                        "text": "一番近いモノを選んでね。",
                        "actions": [
                            {
                            "type": "message",
                            "label": "疲れた…",
                            "text": "疲れた…。",
                            },
                            {
                            "type": "message",
                            "label": "いつも通り",
                            "text": "いつも通り。",
                            },
                            {
                            "type": "message",
                            "label": "調子良い！",
                            "text": "調子良い！",
                            },
                        ]
                    }
                });

            case('疲れた…。'):
                pushMessageTimeAdd=2;
                return client.replyMessage(events.replyToken,{
                        type:"text",
                        text:"今日は早く休もうね、お疲れ様です…！"
                });

            case('いつも通り。'):
                pushMessageTimeAdd=1;
                return client.replyMessage(events.replyToken,{
                    type:"text",
                    text:"うんうん、お疲れ様です！"
                });

            case('調子良い！'):
                pushMessageTimeAdd=0;
                return client.replyMessage(events.replyToken,{
                    type:"text",
                    text:"素晴らしいですね！お疲れ様です！"
                });

            case('明日起きたい時間を教えるよ。'):
                //「起床時間の選択アクション」をテンプレートで返送
                return client.replyMessage(events.replyToken,{
                    "type": "template",
                    "altText": "明日起きる時間を確認",
                    "template": {       
                        "type": "buttons",
                        "title": "明日は何時に起きたい？",
                        "text": "時間を設定してね。",
                        "actions": [
                            {
                            "type": "datetimepicker",
                            "label": "起床時間を設定",
                            "mode": "time",
                            "data": "WakeUpTime"
                            },
                        ]
                    }
                });
            
            //どれにも当てはまらないテキストの場合
            default:
                //送られたテキストに好印象な言葉を添えて返す
                const wkText = { type: 'text', text: events.message.text + "、素敵な言葉ですね！" };
                return client.replyMessage(events.replyToken, wkText );
        };
    };
};