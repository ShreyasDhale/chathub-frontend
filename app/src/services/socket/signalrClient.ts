import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;
let eventsRegistered = false;

export function createSignalRConnection(token: string) {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_HUB_URL}`, {
      accessTokenFactory: () => token,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
}

export async function startSignalRConnection() {
  if (!connection || connection.state === signalR.HubConnectionState.Connected) return;

  await connection.start();
  console.log("✅ SignalR connected");
}

export function getSignalRConnection() {
  return connection;
}

export async function stopSignalRConnection() {
  if (connection) {
    await connection.stop();
    connection = null;
    eventsRegistered = false;
    console.log("🛑 SignalR disconnected");
  }
}

export function markEventsRegistered() {
  eventsRegistered = true;
}

export function areEventsRegistered() {
  return eventsRegistered;
}
