import path from "path";
import os from "os";
import * as vscode from "vscode";

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions
} from "vscode-languageclient/node";

let client: LanguageClient;

export async function activate(context: vscode.ExtensionContext) {

    const config = vscode.workspace.getConfiguration("juno");

    let serverExecutable =
        config.get<string>("languageServer.path") ?? "";

    var serverOptions: ServerOptions = {
        command: serverExecutable,
        args: []
    };
    if (serverExecutable.length === 0) {
        vscode.window.showInformationMessage(
            "No Juno Language Server configured.\nSet 'juno.languageServer.path' in the settings. Using default ~/.cargo/bin/junolsp, ins"
        );
        serverOptions.command = path.join(
            os.homedir(),
            ".cargo",
            "bin",
            "junolsp"
        );
    }

    const clientOptions: LanguageClientOptions = {

        documentSelector: [
            {
                scheme: "file",
                language: "juno"
            }
        ],

        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher("**/*.juno")
        }

    };

    client = new LanguageClient(
        "junolsp",
        "Juno Language Server",
        serverOptions,
        clientOptions
    );

    await client.start();
    context.subscriptions.push(client);
}

export async function deactivate(): Promise<void> {

    if (!client) {
        return;
    }

    await client.stop();

}