import { io, Socket } from "socket.io-client";
import "./assets/scss/style.scss";
// import { ClientToServerEvents, ServerToClientEvents } from "../shared/types/SocketEvents.types";
import { ChatMessageData, ClientToServerEvents, ServerToClientEvents } from "../../shared/types/SocketEvents.types"

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST as string;
console.log("SOCKET_HOST:", SOCKET_HOST);



// Forms
const loginFormEl = document.querySelector("#login-form") as HTMLFormElement;
const loginUsernameInputEl = document.querySelector("#username") as HTMLInputElement;
const messageEl = document.querySelector("#message") as HTMLInputElement;
const messageFormEl = document.querySelector("#message-form") as HTMLFormElement;


// Lists
const messagesEl = document.querySelector("#messages") as HTMLDivElement;


// Views
const chatView = document.querySelector("#chat-wrapper") as HTMLDivElement;
const loginView = document.querySelector("#login-wrapper") as HTMLDivElement;


// User Details
let username: string | null = null;


// Connect to Socket.IO Server
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_HOST);


/**
 * Functions
 */

const addMessageToChat = (payload: ChatMessageData, ownMessage = false) => {
	// Create a new LI element
	const msgEl = document.createElement("li");

	// Set CSS-classes
	msgEl.classList.add("message");

    // If it's our own message, add the `own-message` class
	if (ownMessage) {
		msgEl.classList.add("own-message");
	};

    // Get human readable time
	const time = new Date(payload.timestamp).toLocaleTimeString();  // "13:37:00"

	// Set text content
	msgEl.innerHTML = ownMessage
		? `
			<span class="content">${payload.content}</span>
            <span class="time">${time}</span>
		`
		: `
			<span class="user">${payload.username}</span>
			<span class="content">${payload.content}</span>
            <span class="time">${time}</span>
		`;

	// Append LI to messages list
	messagesEl.appendChild(msgEl);
};


// Show chat view
const showChatView = () => {
	loginView.classList.add("hide");
	chatView.classList.remove("hide");
};


// Show login view
const showLoginView = () => {
	chatView.classList.add("hide");
	loginView.classList.remove("hide");
};





/**
 * Socket Event Listeners
 */

// Listen for when connection is established
socket.on("connect", () => {
	console.log("💥 Connected to the server", socket.id);
});


// Listen for when server got tired of us
socket.on("disconnect", () => {
	console.log("🥺 Got disconnected from the server");
});



// Listen for new chat messages
socket.on("chatMessage", (payload) => {
	console.log("📨 YAY SOMEONE WROTE SOMETHING!!!!!!!", payload);
    addMessageToChat(payload);
});






/**
 * DOM Event Listeners
 */

// Save username and show chat
loginFormEl.addEventListener("submit", (e) => {
	e.preventDefault();

	// 💇
	const trimmedUsername = loginUsernameInputEl.value.trim();

	// If no username, no join
	if (!trimmedUsername) {
		alert("No username? No chat 4 you!");
		return;
	}

	// Set username
	username = trimmedUsername;

	// Emit `userJoinRequest`-event to server and
	// WAIT for acknowledgement
	// BEFORE showing chat view
	socket.emit("userJoinRequest", username, (success) => {
		// This will only be executed once the server has responded
		console.log("Join was successful?", success);

		if (!success) {
			alert("NO ACCESS 4 U!");
			return;
		}

		// Show chat view
		showChatView();
	});
	console.log("Emitted 'userJoinRequest' event to server", username);
});


// Send message to the server when form is submitted
messageFormEl.addEventListener("submit", (e) => {
	e.preventDefault();

	// 💇
	const trimmedMessage = messageEl.value.trim();

	// If no message, no send
	if (!trimmedMessage || !username) {
		return;
	};

	// Construct message payload
	const payload: ChatMessageData = {
		content: trimmedMessage,
        timestamp: Date.now(),
        username,
	};

	// 📮 Send (emit) the message to the server
	socket.emit("sendChatMessage", payload);
	console.log("Emitted 'sendChatMessage' event to server", payload);

    // Add our own message to the chat
	addMessageToChat(payload, true);

	// Clear input field
	messageEl.value = "";
	messageEl.focus();
});