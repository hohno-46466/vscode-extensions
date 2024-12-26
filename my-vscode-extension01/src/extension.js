const vscode = require('vscode');
const mqtt = require('mqtt');

let client; // MQTTクライアントインスタンス

function startMqttClient() {
    console.log('DEBUG: MQTTクライアントを初期化します。');

    // MQTTブローカに接続（localhost:1883）
    client = mqtt.connect('mqtt://localhost:1883');

    client.on('connect', () => {
        console.log('DEBUG: MQTTブローカに接続しました。');
        vscode.window.showInformationMessage('MQTTクライアントが接続しました。');

        // トピックを購読
        const topic = 'vscode/commands';
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`DEBUG: トピック "${topic}" を購読しました。`);
                vscode.window.showInformationMessage(`トピック "${topic}" を購読しました。`);
            } else {
                console.error('ERROR: トピックの購読に失敗しました:', err.message);
            }
        });
    });

    // メッセージ受信時の処理
    client.on('message', (topic, message) => {
        console.log(`DEBUG: トピック "${topic}" からメッセージを受信しました: ${message.toString()}`);

        try {
            const request = JSON.parse(message.toString());
            if (request.command) {
                console.log(`DEBUG: コマンド実行: ${request.command}`);
                vscode.commands.executeCommand(request.command, ...(request.args || []));
            } else {
                console.error('ERROR: コマンドが指定されていません。');
            }
        } catch (error) {
            console.error('ERROR: メッセージ処理中にエラーが発生しました:', error.message);
        }
    });

    client.on('error', (err) => {
        console.error('ERROR: MQTTクライアントエラー:', err.message);
        vscode.window.showErrorMessage('MQTTクライアントエラーが発生しました。');
    });
}

function stopMqttClient() {
    if (client) {
        client.end(() => {
            console.log('DEBUG: MQTTクライアントが切断されました。');
            vscode.window.showInformationMessage('MQTTクライアントが切断されました。');
        });
        client = null;
    } else {
        console.log('DEBUG: MQTTクライアントは起動していません。');
        vscode.window.showInformationMessage('MQTTクライアントは起動していません。');
    }
}

function activate(context) {
    console.log('DEBUG: 拡張機能が有効になりました。');
    vscode.window.showInformationMessage('拡張機能が有効になりました。');

    // コマンド: MQTTクライアントを起動
    let startCommand = vscode.commands.registerCommand('my-vscode-extension01.startMQTT', () => {
        console.log('DEBUG: MQTTクライアントを起動します...');
        vscode.window.showInformationMessage('MQTTクライアントを起動します...');
        startMqttClient();
    });

    // コマンド: MQTTクライアントを停止
    let stopCommand = vscode.commands.registerCommand('my-vscode-extension01.stopMQTT', () => {
        console.log('DEBUG: MQTTクライアントを停止します...');
        vscode.window.showInformationMessage('MQTTクライアントを停止します...');
        stopMqttClient();
    });

    // コマンドをサブスクリプションに追加
    context.subscriptions.push(startCommand);
    console.log('DEBUG: コマンド "my-vscode-extension01.startMQTT" が登録されました。');

    context.subscriptions.push(stopCommand);

    // クライアントの停止処理をライフサイクルに追加
    context.subscriptions.push({
        dispose: () => stopMqttClient(),
    });
}

function deactivate() {
    console.log('DEBUG: 拡張機能が無効になりました。');
    vscode.window.showInformationMessage('拡張機能が無効になりました。');
    stopMqttClient();
}

module.exports = {
    activate,
    deactivate,
};
