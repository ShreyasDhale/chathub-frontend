import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export function createSignalRConnection(token: string) {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/chathub`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
}

export function getSignalRConnection() {
  return connection;
}

export async function stopSignalRConnection() {
  if (connection) {
    await connection.stop();
    connection = null;
  }
}
