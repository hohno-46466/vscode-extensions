const vscode = require('vscode');
let http;
let server; // HTTPサーバインスタンスを保持

// HTTPモジュールの読み込み
try {
    http = require('http');
    console.log('DEBUG: http モジュールが正常に読み込まれました。');
} catch (error) {
    console.log('ERROR: http モジュールの読み込みに失敗しました:', error.message);
}

function startHttpServer() {
    console.log('DEBUG: HTTPサーバを初期化します。');

    server = http.createServer((req, res) => {
        console.log(`DEBUG: リクエストを受信しました - ${req.method} ${req.url}`);

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => (body += chunk));
            req.on('end', () => {
                console.log('DEBUG: 受信したデータ:', body);

                try {
                    const request = JSON.parse(body);
                    if (request.command) {
                        console.log(`DEBUG: コマンド実行: ${request.command}`);
                        vscode.commands.executeCommand(request.command, ...(request.args || []));
                        res.end('Command executed\n');
                    } else {
                        res.statusCode = 400;
                        res.end('No command specified\n');
                    }
                } catch (error) {
                    console.log('ERROR: リクエスト処理中にエラーが発生しました:', error);
                    res.statusCode = 500;
                    res.end('Invalid request\n');
                }
            });
        } else {
            res.statusCode = 405;
            res.end('Method Not Allowed\n');
        }
    });

    // タイムアウトの設定
    server.timeout = 600*1000; // 600秒に設定（任意の値に変更可能）

    server.listen(3000, () => {
        console.log('DEBUG: HTTPサーバがポート3000で起動しました。');
        vscode.window.showInformationMessage('HTTPサーバがポート3000で起動しました。');
    });
}

function stopHttpServer() {
    if (server) {
        server.close(() => {
            console.log('DEBUG: HTTPサーバが停止しました。');
            vscode.window.showInformationMessage('HTTPサーバが停止しました。');
        });
        server = null;
    } else {
        console.log('DEBUG: HTTPサーバは起動していません。');
        vscode.window.showInformationMessage('HTTPサーバは起動していません。');
    }
}

function activate(context) {
    console.log('DEBUG: 拡張機能が有効になりました。');
    vscode.window.showInformationMessage('拡張機能が有効になりました。');

    // コマンド: HTTPサーバを起動
    let startCommand = vscode.commands.registerCommand('my-vscode-extension00.startServer', () => {
        console.log('DEBUG: HTTPサーバを起動します...');
        vscode.window.showInformationMessage('HTTPサーバを起動します...');
        startHttpServer();
    });

    // コマンド: HTTPサーバを停止
    let stopCommand = vscode.commands.registerCommand('my-vscode-extension00.stopServer', () => {
        console.log('DEBUG: HTTPサーバを停止します...');
        vscode.window.showInformationMessage('HTTPサーバを停止します...');
        stopHttpServer();
    });

    // コマンドをサブスクリプションに追加
    context.subscriptions.push(startCommand);
    context.subscriptions.push(stopCommand);

    // サーバの停止処理をライフサイクルに追加
    context.subscriptions.push({
        dispose: () => stopHttpServer(),
    });
}

function deactivate() {
    console.log('DEBUG: 拡張機能が無効になりました。');
    vscode.window.showInformationMessage('拡張機能が無効になりました。');
    stopHttpServer();
}

module.exports = {
    activate,
    deactivate,
};
