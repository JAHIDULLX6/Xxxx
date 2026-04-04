const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

const ROOT_DIR = process.cwd();
const MAX_FILE_SIZE = 250 * 1024;
const MAX_MESSAGE_LENGTH = 12000;

const ALLOWED_EXTENSIONS = new Set([
	".js", ".json", ".txt", ".md", ".ts", ".html", ".css", ".yml", ".yaml"
]);

const BLOCKED_NAMES = new Set([
	".env",
	"appstate.json",
	"token.json",
	"tokens.json",
	"session.json",
	"sessions.json",
	"cookies.json",
	"credential.json",
	"credentials.json"
]);

const BLOCKED_EXTENSIONS = new Set([
	".db", ".sqlite", ".sqlite3", ".pem", ".key", ".crt", ".exe", ".dll", ".so", ".bin"
]);

function safeResolve(relPath = ".") {
	const abs = path.resolve(ROOT_DIR, relPath);
	if (abs !== ROOT_DIR && !abs.startsWith(ROOT_DIR + path.sep))
		throw new Error("Access denied");
	return abs;
}

function isBlockedFile(name) {
	const lower = name.toLowerCase();
	if (BLOCKED_NAMES.has(lower)) return true;
	if (BLOCKED_EXTENSIONS.has(path.extname(lower))) return true;
	return false;
}

function isAllowedFile(name) {
	const lower = name.toLowerCase();
	if (isBlockedFile(lower)) return false;
	return ALLOWED_EXTENSIONS.has(path.extname(lower));
}

async function getItems(relPath = ".") {
	const absPath = safeResolve(relPath);
	const dirents = await fsp.readdir(absPath, { withFileTypes: true });

	return dirents
		.filter(item => {
			if (item.isDirectory()) return true;
			return isAllowedFile(item.name);
		})
		.map(item => ({
			name: item.name,
			isDirectory: item.isDirectory(),
			relPath: path.join(relPath, item.name)
		}))
		.sort((a, b) => {
			if (a.isDirectory && !b.isDirectory) return -1;
			if (!a.isDirectory && b.isDirectory) return 1;
			return a.name.localeCompare(b.name);
		});
}

function formatList(relPath, items) {
	const current = relPath === "." ? "/" : "/" + relPath.replace(/\\/g, "/");
	let msg = `📂 Path: ${current}\n\n`;

	if (relPath !== ".")
		msg += "0. 🔙 Back\n";

	if (!items.length) {
		msg += "(Empty folder)";
	}
	else {
		msg += items.map((item, index) =>
			`${index + 1}. ${item.isDirectory ? "📁" : "📄"} ${item.name}`
		).join("\n");
	}

	msg += "\n\nReply number";
	return msg;
}

async function sendList({ message, commandName, author, relPath = "." }) {
	const items = await getItems(relPath);
	const body = formatList(relPath, items);

	return new Promise((resolve, reject) => {
		message.reply(body, (err, info) => {
			if (err) return reject(err);

			global.GoatBot.onReply.set(info.messageID, {
				commandName,
				author,
				relPath,
				items
			});

			resolve(info);
		});
	});
}

async function sendFileContent(message, filePath, fileName) {
	const stat = await fsp.stat(filePath);

	if (stat.size > MAX_FILE_SIZE) {
		return message.reply(`❌ File too large.\n📄 ${fileName}\n📦 ${(stat.size / 1024).toFixed(1)} KB`);
	}

	const content = await fsp.readFile(filePath, "utf8");
	const text = `📄 ${fileName}\n\n${content}`;

	if (text.length > MAX_MESSAGE_LENGTH) {
		return message.reply(`❌ File content too long to send in one message.\n📄 ${fileName}`);
	}

	return message.reply(text);
}

module.exports = {
	config: {
		name: "shell",
		version: "1.0",
		author: "SaGor",
		countDown: 5,
		role: 2,
		shortDescription: {
			en: "Browse bot folders and read code files"
		},
		description: {
			en: "Reply with number to open folders or show full file code in one message"
		},
		category: "system",
		guide: {
			en: "{pn}"
		}
	},

	langs: {
		en: {
			invalid: "Reply with a valid number.",
			notFound: "Item not found.",
			noPermission: "You can't use this reply.",
			denied: "Access denied.",
			error: "Something went wrong."
		}
	},

	onStart: async function ({ message, event, commandName }) {
		try {
			await sendList({
				message,
				commandName,
				author: event.senderID,
				relPath: "."
			});
		}
		catch (err) {
			console.error(err);
			message.reply("Failed to load files.");
		}
	},

	onReply: async function ({ message, event, Reply, commandName, getLang }) {
		try {
			if (String(event.senderID) !== String(Reply.author))
				return message.reply(getLang("noPermission"));

			const input = String(event.body || "").trim();
			if (!/^\d+$/.test(input))
				return message.reply(getLang("invalid"));

			const choice = Number(input);

			if (Reply.relPath !== "." && choice === 0) {
				const parent = path.dirname(Reply.relPath);
				return await sendList({
					message,
					commandName,
					author: event.senderID,
					relPath: parent === "" ? "." : parent
				});
			}

			const selected = Reply.items[choice - 1];
			if (!selected)
				return message.reply(getLang("notFound"));

			const absPath = safeResolve(selected.relPath);
			const stat = await fsp.stat(absPath);

			if (stat.isDirectory()) {
				return await sendList({
					message,
					commandName,
					author: event.senderID,
					relPath: selected.relPath
				});
			}

			return await sendFileContent(message, absPath, selected.name);
		}
		catch (err) {
			console.error(err);

			if (err.message === "Access denied")
				return message.reply(getLang("denied"));

			return message.reply(getLang("error"));
		}
	}
};