const { token, appVersion, dir, maxThreads, TIMEOUT, dataFile, admins } = require("./config");
const botUrl = "https://api.telegram.org/bot" + token + "/";
const MIN_INTERVAL = 10, MIN_DELAY = 500, sevenDays = 7*24*60*60*1000; /* 3/5/2021 */
let owners=[...admins];
let running=false, botUsername="usernamebot", saveTimer=null, mainAdmin=owners[0], isBroadcasting=false, timer = false;
const currentQueue = {};
const fs = require('fs'),
request = require('request'),
ytdl = require('ytdl-core'),
http = require('https'),
ffmpeg = require ('fluent-ffmpeg'),
sharp = require('sharp'),
NodeID3 = require('node-id3');
sharp.cache(false);
String.prototype.toPersianDigits = function(){
	let persianNumbers = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']; // Hackers-Mania S.s. 2017
	return this.replace(/[0-9]/g, function(w){
		return persianNumbers[+w]
	});
};
String.prototype.toEnglishDigits = function () {
	let charCodeZero = '۰'.charCodeAt(0);
	return parseInt(this.replace(/[۰-۹]/g, function (w) {
		return w.charCodeAt(0) - charCodeZero;
	}));
};
String.prototype.toPrice = function(){
	return this.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
let DB = {
	users: {},
	UIText: {
		stats: "📊 Stats",
		help: "❔ Help",
		random: "🎲 Random song",
		top5: "🥇 Top 5",
		weekTop: "⏲ Last Week Top",
		mostLikes: "♥ Most Likes",
		recentDownloads: "🗂 Recent Downloads",
		addAdmin: "➕ Add admin",
		remAdmin: "➖ Remove admin",
		return: "🔙 return",
		edtSup: "⚠️ Edited messages aren't supported.",
		submit: "✅ Submit",
		cancel: "❌ Cancel",
		vidStats: "📈 Week Downloads",
		on: "⚪ On",
		off: "⚫ Off",
		ok: "✅",
		faild: "❌",
		noAccess: "❌ You have no access!",
		/* Settings */
		settings: "⚙️ Settings",
		startText: "📃 Start text",
		helpText: "❔ Help text"
	},
	Bot: {
		owners: owners,
		totalDownloads: 0,
		cacheUsage: 0,
		uniqueCacheUsage: 0,
		totalBCs: 0,
		lastBC: null,
		download: 0,
		upload: 0,
		lastweekDownloads: [],
		videos: []
	},
	dynamicText: {
		start: "🤟 Hi [NAME], welcome to YouTube Audio (Private) bot\n⁉ Help: /help",
		help: "📌 Just send me a YouTube link or video ID to get MP3 file here",
		audioCaption: "🎧 @ytajsbot",
		notPromoted: "❌ You're not promoted and don't have access to use the bot"
	}
};
let UIT = DB.UIText, DBB = DB.Bot;
const adminKeyboard = (admin) => {
	let keyboard = [
		[{text: UIT.stats}, {text: UIT.settings}],
		[{text: UIT.vidStats}]
	];
	if(admin && admin.stt === "main")
	{
		keyboard.splice(3, 0, [{text: UIT.addAdmin}, {text: UIT.remAdmin}]);
	}
	return keyboard;
};
const userKeyboard = () => {
	return [
		[{text: UIT.random}, {text: UIT.weekTop}],
		[{text: UIT.recentDownloads}],
		[{text: UIT.top5}, {text: UIT.mostLikes}],
		[{text: UIT.help}]
	];
};
const audioKeyboard = (video, ID) => {
	let cacheObj, heartToShow = "♥", dataQuery = "like";

	if(typeof video === "number")
	{
		cacheObj = DBB.videos[video];
	}
	else if(typeof video === "string")
	{
		cacheObj = DBB.videos.find( v => v.id === video );
	}
	else if(typeof video === "object")
	{
		cacheObj = video;
	}

	if(typeof video === "string" && !cacheObj)
	{
		dataQuery += video;
	}
	else if(cacheObj && cacheObj.id)
	{
		if(ID && cacheObj.likes.includes(ID))
		{
			heartToShow = "💚";
		}
		dataQuery += cacheObj.id
	}

	return [[{text: heartToShow, callback_data: dataQuery}, {text: "Share", switch_inline_query: "getVid"+dataQuery.slice(4)}]];
};
function saveDataWP()
	{
		fs.writeFile(dataFile, JSON.stringify(DB), (err) => {
			if (err) throw err;
		});
		console.log('Files had been saved!');
	}
function saveData() /* with protector */
	{
		if(saveTimer === null)
		{
			saveTimer = setTimeout(function(){
				saveTimer = null;
				saveDataWP();
			}, 1000);
		}
	}

function readData()
{
	if(!fs.existsSync(dir))
		fs.mkdirSync(dir, { recursive: true });
	fs.readFile(dataFile, (err, data) => {
		if (err) { /* Seed */
				console.log("No DB found, initializing DB ...");
				owners.forEach( admin => {
					createUser(admin);
					DB.users[admin].stt = "ok";
				});
				DB.users[mainAdmin].stt = "main";
				saveDataWP();
				setTimeout(function(){
					readData();
				},2000);
			return;
		}
		console.log("DB loaded [1/1]");
		let staticDB = {...DB}, itemsUpdated = 0;
		DB = JSON.parse(data.toString().trim());
		Object.entries(staticDB).forEach( dataCategory => {
			if(["UIText", "Bot", "dynamicText"].includes(dataCategory[0]))
			{
				Object.entries(dataCategory[1]).forEach( item => {
					if(DB[dataCategory[0]][item[0]] === undefined)
					{
						++itemsUpdated;
						DB[dataCategory[0]][item[0]] = item[1];
					}
				});
			}
		});
		if(itemsUpdated)
		{
			console.log(`${itemsUpdated} item(s) updated`);
		}
		UIT = DB.UIText;
		DBB = DB.Bot;
		owners = DBB.owners;
		mainAdmin = owners[0];
	});
}

function startBot() {
	call("getMe", null, function(bot) {
		running=true;
		if(!bot)
		{
			console.log("Connection issue!");
			return;
		}
		botUsername = bot.username;
		console.log(bot.username);
		clearDir();
		forEachUser("equal", "lr", 0);
		saveData();
		owners.forEach( owner => {
			call("sendMessage", {
				chat_id: owner,
				text: "Bot started\nVersion "+appVersion+"\n\nUsers: "+Object.keys(DB.users).length
			});
		});
		getUpdates();
	});
}

let nextUpdateId = 0;
function getUpdates() {
	call("getUpdates", {
		offset: nextUpdateId,
		limit: 100,
		timeout: 10
		}, function(updates) {
			if(updates)
			{
				if (updates.length > 0) {
					for (var i=0; i<updates.length; ++i) {
						handleUpdate(updates[i]);
					}
					var lastUpdate = updates[updates.length-1];
					nextUpdateId = lastUpdate.update_id + 1;
				}
				getUpdates();
			}
	});
}

function handleUpdate(update)
{
	let message = update.message, // message
	query = update.callback_query,
	inlineQuery = update.inline_query;
	if(message)
	{
		const ID = message.chat.id;

		if(owners.includes(ID)) /* Admin */
		{
			const owner = DB.users[ID];
			if(message.text)
			{
				if(message.text.startsWith("/del")){
					const userToDelete = parseInt(message.text.slice(4));
					if (DB.users[userToDelete] !== undefined){
						delete DB.users[userToDelete];
						call("sendMessage",{
							chat_id: ID,
							text:"User deleted"
						});
						return;
					}
				}
				else if(message.text.startsWith("/block")){
					const userToBlock = parseInt(message.text.slice(6));
					if (DB.users[userToBlock] !== undefined){
						DB.users[userToBlock].stt = "blc";
						call("sendMessage",{
							chat_id: ID,
							text:"User blocked"
						});
						return;
					}
				}
				else if(message.text.startsWith("/get")){
					const userToGet = parseInt(message.text.slice(4)), userObj = DB.users[userToGet];
					if(message.reply_to_message && !userObj)
					{
						call("sendMessage",{
							chat_id: ID,
							text: message.reply_to_message
						});
						return;
					}
					call("sendMessage",{
						chat_id: ID,
						reply_to_message_id: message.message_id,
						text: userObj !== undefined ? `User ${userToGet}${userObj.userN ? '\n@'+userObj.userN : ''}\n/usage${userToGet}\nMode: ${userObj.m}\nStatus: ${userObj.stt}\nDownloads: ${userObj.dl}\n${userObj.promoted ? `Promoted by ${userObj.promoted}` : `Not promoted /promote${userToGet}`}\nUpload: ${userObj.u} MB\nDownload: ${userObj.d} MB\n/${userObj.stt === "blc" ? 'un' : ''}block${userToGet}` : "User not found"
					});
					return;
				}
				else if(message.text.startsWith("/stat")){
					const videoStatToGet = parseInt(message.text.slice(5)), videoObj = DBB.lastweekDownloads[videoStatToGet];
					call("sendMessage",{
						chat_id: ID,
						reply_to_message_id: message.message_id,
						text: videoObj !== undefined ? `Date: ${getTimeDist(videoObj.date)}\nFrom: ${videoObj.from}\nVideo: ${videoObj.video}\nUsage: ${videoObj.usage} MB` : "Didn't find"
					});
					return;
				}
				else if(message.text.startsWith("/usage")){
					const userUsageToGet = parseInt(message.text.slice(6)), userObj = DB.users[userUsageToGet];
					call("sendMessage",{
						chat_id: ID,
						reply_to_message_id: message.message_id,
						text: userObj ? `${DBB.videos.filter( v => v.dl.includes(userUsageToGet) ).map( D => `${D.title.slice(0, 10)} /v${DBB.videos.indexOf(D)}` ).join("\n\n")}` : "User not found"
					});
					return;
				}
				else if(message.text.startsWith("/promote")){
					const userToPromote = parseInt(message.text.slice(8)), userObj = DB.users[userToPromote];
					call("sendMessage",{
						chat_id: ID,
						reply_to_message_id: message.message_id,
						text: userObj ? (userObj.promoted ? "⚠ Already promoted" : "✅ Promoted") : "User not found"
					});
					if(userObj && !userObj.promoted)
					{
						userObj.promoted = ID;
						saveData();
					}
					return;
				}
				else if(message.text.startsWith("/find@")){
					const usernameToFind = message.text.slice(6).toLocaleLowerCase();
					const foundUser = Object.keys(DB.users).find(user => 
						DB.users[user].userN && DB.users[user].userN.toLocaleLowerCase() === usernameToFind
					);
					call("sendMessage",{
						chat_id: ID,
						reply_to_message_id: message.message_id,
						text: `${foundUser ? `User \`${foundUser}\`\n/get${foundUser}` : `Not found`}`,
						parse_mode: "Markdown"
					});
					return;
				}
				else if(message.text.startsWith("/unblock")){
					const userToUnBlock = parseInt(message.text.slice(8));
					if (DB.users[userToUnBlock] !== undefined){
						DB.users[userToUnBlock].stt = "ok";
						call("sendMessage",{
							chat_id: ID,
							text: "User unblocked"
						});
						return;
					}
				}
				else if(message.text.startsWith("eval")){
					try {
						eval(message.text.slice(4));
					}
					catch (e) {
						call("sendMessage",{
							chat_id: ID,
							text: e.message
						});
					}
					return;
				}
				else {
					if(message.text === UIT.return)
					{
						if(typeof owner.m === "string")
						{
							switch(owner.m.split("_")[0]){
								case "set":
									message.text = UIT.settings;
									owner.m = 1;
									break;
							}
						}
					}
					switch (message.text){
						case "/bc":
						case "/fbc":
							if(message.reply_to_message){
								if(isBroadcasting){
									call("sendMessage", {
										chat_id: ID,
										reply_to_message_id: message.message_id,
										text: "Another broadcast is in progress..."
									});
								}
								else
								{
									if(new Date() - new Date(DBB.lastBC) > 1200000){
										isBroadcasting = true;
										DBB.lastBC = new Date().toISOString();
										call("sendMessage", {
											chat_id: ID,
											reply_to_message_id: message.message_id,
											text: "Sending to "+Object.keys(DB.users).length+" users"
										});
										bcHandler({
											ownerID: ID,
											message: message.reply_to_message.message_id,
											element: 0,
											sum: 0,
											forward: message.text === "/fbc"
										});
									}
									else
									{
										let lastBcTimeAgo = (1200000 - (new Date() - new Date(DBB.lastBC))) / 1000;
										if(lastBcTimeAgo > 60)
										{
											lastBcTimeAgo = Math.round(lastBcTimeAgo/60) + "m";
										}
										else
										{
											lastBcTimeAgo = Math.round(lastBcTimeAgo) + "s";
										}
										call("sendMessage", {
											chat_id: ID,
											reply_to_message_id: message.message_id,
											text: `There should be a 20m gap between broadcasts.\nYou should wait ${lastBcTimeAgo}`
										});
									}
								}
								return;
							}
						break;
						case "/off":
							running = false;
							call("sendMessage",{
								chat_id: ID,
								text: "Bot turned *OFF* for users",
								parse_mode: "Markdown"
							});
							return;
						break;
						case "/on":
							running = true;
							call("sendMessage",{
								chat_id: ID,
								text: "Bot turned *ON* for users",
								parse_mode: "Markdown"
							});
							return;
						break;
						case UIT.stats:
							owner.m=1;
							call("sendMessage",{
								chat_id: ID,
								text: `Bot YTA\n\n📉 Total BCs: ${DBB.totalBCs}\n⏱ Last BC: ${DBB.lastBC?getTimeDist(DBB.lastBC):"Never"}\n\n📈 Total Downloads: ${DBB.totalDownloads}\n📊 Last Week: ${DBB.lastweekDownloads.length}\n🗃 Saved: ${DBB.videos.length}\n🎧 Cache users: ${DBB.uniqueCacheUsage}\n⚡️ All cache use: ${DBB.cacheUsage}\n\n📤 Upload: ${Math.ceil(DBB.upload)} MB\n📥 Download: ${Math.ceil(DBB.download)} MB\n\n👥 Users: ${Object.keys(DB.users).length}`.toPrice()
							});
							return;
						break;
						case UIT.vidStats:
							owner.m=1;
							DBB.lastweekDownloads = DBB.lastweekDownloads.filter( d => new Date() - new Date(d.date) < sevenDays);
							const vidStatsOut = DBB.lastweekDownloads.map( d => `${d.from} ${Math.ceil(d.usage)} MB` ).join('\n')
							call("sendMessage",{
								chat_id: ID,
								text: vidStatsOut.length > 3000 ? "Message too long, use /stat0-"+DBB.lastweekDownloads.length : (vidStatsOut.length ? vidStatsOut : "No downloads in last 7 days" )
							});
							return;
						break;
						case UIT.settings:
						case "/settings":
							call("sendMessage",{
								chat_id: ID,
								text: '⚙',
								reply_markup: {
									keyboard: [
										[{text: UIT.startText}, {text: UIT.helpText}],
										[{text: UIT.return}]
									],
									resize_keyboard: true
								}
							});
							owner.m = "settings";
							return;
						break;
						case UIT.addAdmin:
							if(owner.stt === "main")
							{
								let currentAdmins = owners.join('\n');
								call("sendMessage",{
									chat_id: ID,
									text: "Send user ID\n\nCurrent admins:\n"+currentAdmins,
									reply_markup: {
										keyboard: [[{text: UIT.return}]],
										resize_keyboard: true
									}
								});
								owner.m=9;
							}
							else
							{
								sendMessage({
									to: ID,
									input: UIT.noAccess
								});
							}
							return;
						break;
						case UIT.remAdmin:
							if(owner.stt === "main")
							{
								let adminsToChoose = owners.map((id)=>{
									return [{text: id.toString()}];
								});
								adminsToChoose.unshift([{text: DB.UIText.return}]);
								call("sendMessage",{
									chat_id: ID,
									text: "Select admin to remove or exit",
									reply_markup: {
										keyboard: adminsToChoose,
										resize_keyboard: true
									}
								});
								owner.m=10;
							}
							else
							{
								sendMessage({
									to: ID,
									input: UIT.noAccess
								});
							}
							return;
						break;
						case "...":
						case UIT.return:
						case UIT.cancel:
							owner.m=1;
							call("sendMessage",{
								chat_id: ID,
								text: "🤖",
								reply_markup: {
									keyboard: adminKeyboard(owner),
									resize_keyboard: true
								}
							});
							return;
						break;
						default:
							switch (owner.m)
							{
								case 9: /* addAdmin */
									let newAdminId = parseInt(message.text);
									if(!isNaN(newAdminId))
									{
										if(DB.users[newAdminId] !== undefined)
										{
											if(!owners.includes(newAdminId))
											{
												DB.Bot.owners.push(newAdminId);
												saveData();
												call("sendMessage",{
													chat_id: ID,
													text: "✅ Admin "+newAdminId+" added",
													reply_markup: {
														keyboard: adminKeyboard(owner),
														resize_keyboard: true
													}
												});
											}
											else
											{
												call("sendMessage",{
													chat_id: ID,
													text: "❌ Already admin"
												});
											}
										}
										else
										{
											call("sendMessage",{
												chat_id: ID,
												text: "❌ User not found (should start the bot)"
											});
										}
										owner.m=1;
									}
									else
									{
										call("sendMessage",{
											chat_id: ID,
											text: "❌ Invalid ID"
										});
									}
									return;
								break;
								case 10: /* remAdmin */
									const adminToRemove = parseInt(message.text);
									if(!isNaN(adminToRemove))
									{
										const adminToRemoveObj = DB.users[adminToRemove];
										if(adminToRemoveObj)
										{
											if(adminToRemoveObj.stt !== "main")
											{
												let adminId = owners.indexOf(adminToRemove);
												if(adminId !== -1)
												{
													owner.m = 1;
													DB.Bot.owners.splice(adminId,1);
													saveData();
													call("sendMessage",{
														chat_id: ID,
														text: "Admin removed ✅",
														reply_markup: {
															keyboard: adminKeyboard(owner),
															resize_keyboard: true
														}
													});
												}
												else
												{
													call("sendMessage",{
														chat_id: ID,
														text: "❌ Admin not found"
													});
												}
											}
											else
											{
												call("sendMessage",{
													chat_id: ID,
													text: "❌ You can't remove main admins"
												});
											}
										}
										else
										{
											call("sendMessage",{
												chat_id: ID,
												text: "❌ User not found"
											});
										}
									}
									else
									{
										call("sendMessage",{
											chat_id: ID,
											text: "❌ Invalid ID"
										});
									}
									return;
								break;
								default:
									if(typeof owner.m === "string"){
										switch(owner.m.split("_")[0]){
											case "settings":
												let settingTypeSelect = false, settingText = "", settingKeyboard = [], availableDTs = [], onOfCurrentStatus = false;
												const dynamicTextHelp = dynamicText({getWords: true}).words;
												switch(message.text)
												{
													case UIT.startText:
														owner.m = "set_start";
														settingText = `Current value:\n\n'${DB.dynamicText.start}'\n\n\nSend new message`;
														availableDTs = ["name"];
													break;
													case UIT.helpText:
														owner.m = "set_help";
														settingText = `Current value:\n\n'${DB.dynamicText.help}'\n\n\nSend new message`;
														availableDTs = ["name"];
													break;
													default:
														call("sendMessage",{
															chat_id: ID,
															text: UIT.faild
														});
														return;
													break;
												}
												if(settingTypeSelect)
												{
													settingKeyboard.push([{text: onOfCurrentStatus ? UIT.off : UIT.on}])
												}
												if(availableDTs.length)
												{
													settingText += "\n\nAvailable dynamic words:\n" + availableDTs.map((key)=>{
														const dt = dynamicTextHelp[key];
														return dt ? `${dt.key} ${dt.value}` : ""
													}).join('\n');
												}
												settingKeyboard.push([{text: UIT.return}]);
												call("sendMessage",{
													chat_id: ID,
													text: settingText,
													reply_markup: {
														keyboard: settingKeyboard,
														resize_keyboard: true
													}
												});
												return;
												break;
											case "set":
												let newValue,
												title = "",
												error = "",
												input = null,
												inputNumber = parseInt(message.text.toEnglishDigits()),
												toSet = owner.m.split("_")[1];

												switch(message.text){
													case UIT.on:
														input = true;
													break;
													case UIT.off:
														input = false;
													break;
													default:
														input = message.text;
													break;
												}

												if(typeof input === "string")
												{
													switch(toSet){
														case "start":
															title = "Start message text";
															if(input.length < 1000)
															{
																newValue = input;
																DB.dynamicText.start = newValue;
															}
															else
															{
																error = "Maximum length is 1000";
															}
															break;
														case "help":
															title = "Help message text";
															if(input.length < 1000)
															{
																newValue = input;
																DB.dynamicText.help = newValue;
															}
															else
															{
																error = "Maximum length is 1000";
															}
															break;
													}
												}
												owner.m = 1;
												call("sendMessage",{
													chat_id: ID,
													text: newValue !== undefined ?
													`${title} ${typeof input === "boolean"?`turned ${input?"on":"off"}`:` changed to ${newValue.toString().includes("\n")?`\n\n'${newValue}'\n\n`:` '${newValue}' `}`}`
													:
													(title?
														`${title}\n\n${UIT.faild} Invalid value${error?`\n- ${error.replace(/\n/g,'\n- ')}`:``}`
														:
														`Error in settings`),
													reply_markup: {
														keyboard: adminKeyboard(owner),
														resize_keyboard: true
													}
												});
												saveData();
												return;
												break;
										}
									}
									break;
							}
						break;
					}
				}
			}
		}

		/* User */
		if (DB.users[ID] === undefined){ // New user
			createUser(ID); // Create user
			saveData();
		}

		user = DB.users[ID];

		if (user.stt === "blc" || !running) /* Bot is off or user is blocked */
			return;
		else if(user.stt === "rm")
			user.stt = "tmp";
		else if(user.stt === "tmp")
			user.stt = "ok";

		if(message.from.username && user.userN !== message.from.username) /* update username if exists */
		{
			user.userN = message.from.username;
		}

		
		if(message.text)
		{
			let startParameter = "";
			if(message.text.startsWith("/start"))
			{
				startParameter = message.text.slice(7);
			}
			switch(message.text){
				case "/start":
					sendMessage({
						to: ID,
						input: dynamicText({
							text: DB.dynamicText.start,
							message: message
						}),
						extra: {
							reply_markup: {
								keyboard: userKeyboard(),
								resize_keyboard: true
							}
						}
					});
				break;
				case "/cancel":
					sendMessage({
						to: ID,
						input: "This feature is not available - Developing..."
					});
					return;
					if(isUserAllowed(ID))
					{
						const userRequest = Object.entries(currentQueue).find( R => R[1].from == ID);
						if(userRequest)
						{
							userRequest[1].error = "CANCEL";
						}
						else
						{
							sendMessage({
								to: ID,
								input: "You have no pending request"
							});
						}
					}
					else
					{
						sendMessage({
							to: ID,
							input: dynamicText({
								text: DB.dynamicText.notPromoted,
								message: message
							})
						});
					}
					break;
				case "/help":
				case UIT.help:
					sendMessage({
						to: ID,
						input: dynamicText({
							text: DB.dynamicText.help,
							message: message
						})
					});
					break;
				case UIT.random:
					sendAudio({
						ID, msgObj: message, cacheObj: DBB.videos[Math.floor(Math.random()*DBB.videos.length)]
					});
					break;
				case UIT.top5:
					const countToGet = 5;
					const topDownloads = [...DBB.videos].sort((A,B) => B.dl.length - A.dl.length).slice(0, countToGet);
					sendMessage({
						to: ID,
						input: `🔥 Top ${topDownloads.length} downloads\n\n\n${topDownloads.map( (D, i) => `${i+1}. ${D.title} /v${getUICode(DBB.videos.indexOf(D))}` ).join("\n\n")}`
					});
					break;
				case UIT.mostLikes:
					const mostLikedCountToGet = 5;
					const topLikes = [...DBB.videos].reverse().sort((A,B) => B.likes.length - A.likes.length).slice(0, mostLikedCountToGet);
					sendMessage({
						to: ID,
						input: `♥ Top ${topLikes.length} likes\n\n\n${topLikes.map( (D, i) => `${i+1}. ${D.title} /v${getUICode(DBB.videos.indexOf(D))}` ).join("\n\n")}`
					});
					break;
				case UIT.recentDownloads:
					const recentCountToGet = 5;
					const recentList = [...DBB.videos].slice(recentCountToGet * -1).reverse();
					sendMessage({
						to: ID,
						input: `📆 Recent ${recentList.length} downloads\n\n\n${recentList.map( (D, i) => `${i+1}. ${D.title} /v${getUICode(DBB.videos.indexOf(D))}` ).join("\n\n")}`
					});
					break;
				case UIT.weekTop:
					const weekCountToGet = 5, lastWeekIds = DBB.lastweekDownloads.map( V => V.video );
					const topWeekDownloads = [...DBB.videos].filter( V => lastWeekIds.includes(V.id) ).sort((A,B) => B.dl.length - A.dl.length).slice(0, weekCountToGet);
					sendMessage({
						to: ID,
						input: topWeekDownloads.length ? `🔥 Top ${topWeekDownloads.length} last week downloads\n\n\n${topWeekDownloads.map( (D, i) => `${i+1}. ${D.title} /v${getUICode(DBB.videos.indexOf(D))}` ).join("\n\n")}` : "No downloads!"
					});
					break;
				case UIT.return:
					sendMessage({
						to: ID,
						input: "🏠",
						extra: {
							reply_markup: {
								keyboard: userKeyboard(),
								resize_keyboard: true
							}
						}
					});
				break;
				default:
					if(isUserAllowed(ID))
					{
						if(startParameter && startParameter.startsWith("getV"))
						{
							message.text = "/v" + startParameter.slice(4);
							startParameter = "";
						}
						if(message.text.startsWith("/v"))
						{
							let indexToGet = parseInt(getVideoIndex(message.text.slice(2)));
							if(isNaN(indexToGet))
							{
								indexToGet = parseInt(message.text.slice(2));
							}
							if(!isNaN(indexToGet) && DBB.videos[indexToGet])
							{
								sendAudio({
									ID, msgObj: message, cacheObj: DBB.videos[indexToGet]
								});
							}
							else
							{
								sendMessage({
									to: ID,
									input: "❌ Invalid"
								});
							}
						}
						else if(!startParameter)
						{
							const timeFromLastReq = ((new Date() - new Date(user.lr)) - MIN_INTERVAL*1000)/1000;
							if(timeFromLastReq > 0)
							{
								const videoID = getVideoID(message.text);
								if(videoID)
								{
									const fromCache = DBB.videos.find( v => v.id == videoID);
									if(fromCache)
									{
										sendAudio({
											ID, msgObj: message, cacheObj: fromCache
										});
										return;
									}
									if(!currentQueue[videoID])
									{
										if(!Object.values(currentQueue).find( item => item.from == ID ))
										{
											if(Object.keys(currentQueue).length < maxThreads)
											{
												currentQueue[videoID] = {};
												call("sendMessage", {
													chat_id: ID,
													text: "ℹ️ [1/5] Getting info",
													reply_to_message_id: message.message_id
												}, function(res){
													if(res)
													{
														currentQueue[videoID] = {
															localID: getLocalID(videoID),
															from: ID,
															userMsgId: message.message_id,
															lastUpdate: new Date(),
															updateID: res.message_id
														};
														TIMER_ON();
														startProcess(videoID);
													}
													else
													{
														delete currentQueue[videoID];
													}
												});
											}
											else
											{
												sendMessage({
													to: ID,
													input: "❗ Download queue is full!"
												});
											}
										}
										else
										{
											sendMessage({
												to: ID,
												input: "⚠ You have another video in progress"
											});
										}
									}
									else
									{
										sendMessage({
											to: ID,
											input: "⚠ Video already in queue"
										});
									}
								}
								else
								{
									sendMessage({
										to: ID,
										input: "❌ Video is not valid!"
									});
								}
							}
							else
							{
								sendMessage({
									to: ID,
									input: `⏱ Wait ${Math.ceil(Math.abs(timeFromLastReq))} second(s) to submit another request`
								});
							}
						}
					}
					else
					{
						sendMessage({
							to: ID,
							input: dynamicText({
								text: DB.dynamicText.notPromoted,
								message: message
							})
						});
					}
					if(startParameter) /* no function used parameter, so just a normal start */
					{
						sendMessage({
							to: ID,
							input: dynamicText({
								text: DB.dynamicText.start,
								message: message
							}),
							extra: {
								reply_markup: {
									keyboard: userKeyboard(),
									resize_keyboard: true
								}
							}
						});
					}
					break;
			}
		}
	}
	else if (query)
	{
		if(query.data.startsWith("like"))
		{
			let vidToLike = query.data.slice(4), queryReplyText = "Couldn't find music";
			const vidObjToLike = DBB.videos.find( v => v.id === vidToLike );
			if(vidObjToLike)
			{
				const likeIndex = vidObjToLike.likes.indexOf(query.from.id);
				if(likeIndex === -1)
				{
					vidObjToLike.likes.push(query.from.id);
					queryReplyText = "Liked 💚";
				}
				else
				{
					vidObjToLike.likes.splice(likeIndex, 1);
					queryReplyText = "Unliked 💔";
				}
				saveData();
			}
			call("answerCallbackQuery",{
				callback_query_id: query.id,
				text: queryReplyText
			}, () => {
				if(vidObjToLike)
				{
					call("editMessageReplyMarkup", {
						chat_id: query.message.chat.id,
						message_id: query.message.message_id,
						reply_markup: {
							inline_keyboard: audioKeyboard(vidObjToLike, query.from.id)
						}
					});
				}
			});
		}
	}
	else if (inlineQuery)
	{
		const ID = inlineQuery.from.id;
		if(isUserAllowed(ID))
		{
			if(inlineQuery.query.startsWith("getVid"))
			{
				const foundVideo = DBB.videos.find( v => v.id === inlineQuery.query.slice(6) ),
				inlineResults = [];
				if(foundVideo)
				{
					inlineResults.push({
						type: "audio",
						id: foundVideo.id,
						audio_file_id: foundVideo.msg,
						//caption: `More songs @${botUsername}`,
						reply_markup: {
							inline_keyboard: [
								[{text: "📲 Listen in bot", url: "t.me/"+botUsername+"?start=getV"+getUICode(DBB.videos.indexOf(foundVideo))}]
							]
						}
					});
				}
				call("answerInlineQuery", {
					inline_query_id: inlineQuery.id,
					results: inlineResults
				});
			}
		}
	}
}

/* YouTube download START */
function getVideoID(input)
{
	if(ytdl.validateURL(input))
		return ytdl.getVideoID(input);
	else if(ytdl.validateID(input))
		return input;
	else
		return false;
}

function getLocalID(vid) {
	return `YTD-I${Math.random().toString(36).substring(2).slice(-2)}D-${vid}`;
}

const TIMER_ON = () => { /* check if not responding cancel progress - delete files and delete from queue */
	const checkInterval = () => {
		const queueAudios = Object.entries(currentQueue);
		if(queueAudios.length === 0)
		{
			//clearDir();
			timer = false;
			return;
		}
		queueAudios.forEach( A => {
			const userObj = DB.users[A[1].from], hasError = A[1].error, isCanceled = A[1].error === "CANCEL";
			if(hasError || new Date() - A[1].lastUpdate > TIMEOUT*1000)
			{
				call("editMessageText", {
					chat_id: currentQueue[A[0]].from,
					message_id: currentQueue[A[0]].updateID,
					text: hasError ? (isCanceled ? "🚮 Canceled by user" : "❌ Error occurred:\n"+A[1].error) : "❌ Task timed out"
				});
				userObj.lr = new Date().toISOString();
				delete currentQueue[A[0]];
				["webp", "jpg", "mp4", "mp3"].forEach( format => deleteFile(dir+A[1].localID+'.'+format) );
				deleteFile(generateName(A[0]));
			}
		});
		if(timer)
		{
			setTimeout(checkInterval, 1000);
		}
	};
	if(!timer)
	{
		timer = true;
		checkInterval();
	}
};

async function startProcess(vid){
	let basicInfo;
	try {
		basicInfo = await ytdl.getBasicInfo(vid)
	}
	catch(e) {
		currentQueue[vid].error = "Fake video ID";
		return;
	}
	if(!currentQueue[vid])
	{
		return;
	}
	const fakeDelay = new Date() - currentQueue[vid].lastUpdate - MIN_DELAY;
	setTimeout(function(){
		call("editMessageText", {
			chat_id: currentQueue[vid].from,
			message_id: currentQueue[vid].updateID,
			text: "📥 [2/5] Downloading MP4"
		}, function(res){
			if(res && currentQueue[vid])
			{
				currentQueue[vid].lastUpdate = new Date();
				currentQueue[vid].updateID = res.message_id;

				if(basicInfo.videoDetails.author.name.endsWith(" - Topic") && basicInfo.videoDetails.author.name.length > 8) /* remove ' - Topic' */
				{
					basicInfo.videoDetails.author.name = basicInfo.videoDetails.author.name.slice(0, -8);
				}

				const videoTitleSplit = basicInfo.videoDetails.title.split(" - ");
				if(videoTitleSplit.length === 2)
				{
					currentQueue[vid].title = videoTitleSplit[1];
					currentQueue[vid].artist = videoTitleSplit[0];
					currentQueue[vid].album = basicInfo.videoDetails.author.name;
				}
				else
				{
					currentQueue[vid].title = basicInfo.videoDetails.title;
					currentQueue[vid].artist = basicInfo.videoDetails.author.name;
					if(currentQueue[vid].title.startsWith(currentQueue[vid].artist+" - ") && currentQueue[vid].title.length > currentQueue[vid].artist.length+3)
					{
						currentQueue[vid].title = currentQueue[vid].title.slice(currentQueue[vid].artist.length+3);
					}
				}


				if(basicInfo.videoDetails.publishDate)
				{
					currentQueue[vid].year = basicInfo.videoDetails.publishDate.split("-").shift();
				}
				if(basicInfo.videoDetails.media
					&& basicInfo.videoDetails.media
					&& basicInfo.videoDetails.media.song
					&& basicInfo.videoDetails.media.artist)
				{
					currentQueue[vid].title = basicInfo.videoDetails.media.song;
					currentQueue[vid].artist = basicInfo.videoDetails.media.artist;
					currentQueue[vid].album = basicInfo.videoDetails.media.album;
				}
				currentQueue[vid].thumbnail = basicInfo.videoDetails.thumbnails.pop().url;
				download(vid);
				/*
				https.get(`https://img.youtube.com/vi/${vid}/hqdefault.jpg`, function(res) {
					if(res.statusCode == 200)
					{
						currentQueue[vid].thumbnail = `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
					}
					download({
						vid: vid
					});
				});
				*/
			}
		});
	}, fakeDelay > 0 ? 10 : Math.abs(fakeDelay));
}

async function download(vid) {
	if(currentQueue[vid])
	{
		//const obj = await ytdl.getInfo(vid);
		const fileAddress = dir+currentQueue[vid].localID;
		try {
			const videoFileAddress = fileAddress+'.mp4';
			ytdl(vid, {quality: "highestaudio"}).pipe(fs.createWriteStream(videoFileAddress).on("finish", async function(){

				currentQueue[vid].mp4Size = await getFilesizeInMegaBytes(videoFileAddress);

				http.get(currentQueue[vid].thumbnail , function(res){
					res.pipe(fs.createWriteStream(fileAddress+(currentQueue[vid].thumbnail.endsWith(".jpg") ? ".jpg" : ".webp"))).on("finish", async function(){

						currentQueue[vid].thumbSize = await getFilesizeInMegaBytes(fileAddress+(currentQueue[vid].thumbnail.endsWith(".jpg") ? ".jpg" : ".webp"));
						DBB.download += currentQueue[vid].mp4Size + currentQueue[vid].thumbSize;

						const fakeDelay = new Date() - currentQueue[vid].lastUpdate - MIN_DELAY;
						setTimeout(function(){
							call("editMessageText", {
								chat_id: currentQueue[vid].from,
								message_id: currentQueue[vid].updateID,
								text: "🎙 [3/5] Converting to MP3"
							}, function(res){
								if(res)
								{
									currentQueue[vid].lastUpdate = new Date();
									currentQueue[vid].updateID = res.message_id;
									convert(vid);
								}
							});
						}, fakeDelay > 0 ? 10 : Math.abs(fakeDelay));

					});
				});

			}));
		}
		catch (e) {
			console.log(e)
		}
	}
}

function convert(vid)
{
	if(currentQueue[vid])
	{
		const fileAddress = dir+currentQueue[vid].localID;
		const videoFileAddress = fileAddress+'.mp4';
		//var outStream = fs.createWriteStream('audio.mp3');
			const mp3File = new ffmpeg({ source: videoFileAddress })
				//.addInput(fileAddress+'.jpg')
				// .outputOptions(
				// 	'-id3v2_version', '3',
				// 	'-metadata', 'title='+currentQueue[vid].title,
				// 	'-metadata', 'artist='+currentQueue[vid].artist
				// )
				.setFfmpegPath(ffmpegExe)
				//.withNoVideo('libx264')
				.withAudioCodec('libmp3lame')
				//.withAudioBitrate('128k').withAudioChannels(2).withAudioQuality(5)
				.toFormat('mp3')
				.on('error', function(err) {
					currentQueue[vid].error = "Error in converting";
					console.log('An error occurred: ' + err.message);
				})
				.on('end', function() {
					const fakeDelay = new Date() - currentQueue[vid].lastUpdate - MIN_DELAY;
					setTimeout(function(){
						call("editMessageText", {
							chat_id: currentQueue[vid].from,
							message_id: currentQueue[vid].updateID,
							text: "📸 [4/5] Generating cover"
						}, async function(res){
							if(res)
							{
								currentQueue[vid].mp3Size = await getFilesizeInMegaBytes(fileAddress+".mp3");
								if(currentQueue[vid].mp3Size > 50)
								{
									currentQueue[vid].error = "File size is over 50 MB";
									return;
								}
								currentQueue[vid].lastUpdate = new Date();
								currentQueue[vid].updateID = res.message_id;
								generateThumb(vid);
							}
						});
					}, fakeDelay > 0 ? 10 : Math.abs(fakeDelay));
				});
				// if(currentQueue[vid].album)
				// {
				// 	mp3File.addOutputOptions(
				// 		'-metadata', 'album='+currentQueue[vid].album
				// 	)
				// }
				mp3File.saveToFile(fileAddress+'.mp3');
				// .writeToStream(outStream, { end: true });
	}
}

function generateThumb(vid)
{
	if(currentQueue[vid])
	{
		const fileAddress = dir+currentQueue[vid].localID;
		if(currentQueue[vid].thumbnail.endsWith(".jpg"))
		{
			setMeta(vid);
			return;
		}
		sharp(fileAddress+".webp").toFile(fileAddress+".jpg").then((newFileInfo) => {
			currentQueue[vid].maxIs = newFileInfo.height > newFileInfo.width ? "height" : "width"
			setMeta(vid);
		}).catch((err) => {
			currentQueue[vid].error = "Couldn't convert cover";
		});
		/*
		webp.dwebp(fileAddress+".webp", "-o",logging="-v").then((response) => {
			if(response.startsWith("cannot open input file"))
			{
				currentQueue[vid].error = "Couldn't convert cover";
			}
			else
			{
				setMeta(vid);
			}
		});
		*/
	}
}

function setMeta(vid)
{
	if(currentQueue[vid])
	{
		const fileAddress = dir+currentQueue[vid].localID;
		const options = {
			title: currentQueue[vid].title,
			artist: currentQueue[vid].artist,
			year: currentQueue[vid].year,
			APIC: fileAddress+".jpg"
		};
		if(currentQueue[vid].album)
		{
			options.album = currentQueue[vid].album;
		}
		const success = NodeID3.write(options, fileAddress+".mp3", function(err){
			if(err)
			{
				currentQueue[vid].error = "Couldn't set cover";
			}
			else
			{
				const fakeDelay = new Date() - currentQueue[vid].lastUpdate - MIN_DELAY;
				setTimeout(function(){
					call("editMessageText", {
						chat_id: currentQueue[vid].from,
						message_id: currentQueue[vid].updateID,
						text: "📤 [5/5] Uploading to Telegram"
					}, function(res){
						if(res)
						{
							currentQueue[vid].lastUpdate = new Date();
							currentQueue[vid].updateID = res.message_id;
							upload(vid);
						}
					});
				}, fakeDelay > 0 ? 10 : Math.abs(fakeDelay));
			}
		});
	}
}

async function upload(vid){
	if(currentQueue[vid])
	{
		const fileLocalId = dir+currentQueue[vid].localID;
		const reqFromUser = DB.users[currentQueue[vid].from],
		trackFileName = generateName(vid);
		if(await fileExist(trackFileName))
		{
			currentQueue[vid].lastUpdate = new Date();
			setTimeout(function(){
				upload(vid);
			}, 5000);
			return;
		}
		else
		{
			fs.rename(fileLocalId+".mp3", trackFileName, (error) => {
				if(error)
				{
					currentQueue[vid].error = "Error while renaming before upload";
					return;
				}
				const resizeOptions = {};
				resizeOptions[currentQueue[vid].maxIs] = 300;
				sharp(fileLocalId+".jpg").resize(resizeOptions).toBuffer(function(err, buffer) {
					if(err)
					{
						currentQueue[vid].error = "Couldn't resize cover for Telegram";
					}
					fs.writeFile(fileLocalId+".jpg", buffer, function(e) {
						if(e)
						{
							currentQueue[vid].error = "Error while saving resized cover for Telegram";
						}
						else
						{
							const r = request(botUrl+"sendAudio", (err, res, body) => {
								if(body)
								{
									if(reqFromUser)
									{
										reqFromUser.dl++;
									}
									body = JSON.parse(body);
									if(body.result && body.result.audio && body.result.audio.file_id)
									{
										DBB.videos.push({
											id: vid,
											msg: body.result.audio.file_id,
											dl: [currentQueue[vid].from],
											title: currentQueue[vid].title,
											likes: []
										});
									}
									DBB.lastweekDownloads.push({
										date: new Date().toISOString(),
										from: currentQueue[vid].from,
										video: vid,
										usage: Math.round(currentQueue[vid].mp3Size + currentQueue[vid].thumbSize + currentQueue[vid].mp4Size)
									});
									DBB.totalDownloads++;
									DBB.upload += currentQueue[vid].thumbSize + currentQueue[vid].mp3Size;
									reqFromUser.d += Math.round(currentQueue[vid].thumbSize + currentQueue[vid].mp4Size);
									reqFromUser.u += Math.round(currentQueue[vid].thumbSize + currentQueue[vid].mp3Size);
									call("deleteMessage", {
										chat_id: currentQueue[vid].from,
										message_id: currentQueue[vid].updateID
									});
								}
								else
								{
									call("editMessageText", {
										chat_id: currentQueue[vid].from,
										message_id: currentQueue[vid].updateID,
										text: "❌ Error while uploading"
									});
								}
								["webp", "jpg", "mp4", "mp3"].forEach( format => deleteFile(fileLocalId+'.'+format) );
								deleteFile(trackFileName);
								reqFromUser.lr = new Date().toISOString();
								delete currentQueue[vid];
								saveData();
							});
							const f = r.form();
							f.append('chat_id', currentQueue[vid].from);
							f.append('title', currentQueue[vid].title);
							f.append('performer', currentQueue[vid].artist);
							f.append('caption', DB.dynamicText.audioCaption);
							f.append('reply_to_message_id', currentQueue[vid].userMsgId);
							f.append('reply_markup', JSON.stringify({inline_keyboard: audioKeyboard(vid, null) }) );
							f.append('audio', fs.createReadStream(trackFileName));
							f.append('thumb', fs.createReadStream(fileLocalId+".jpg"));
						}
					});
				});
			});
		}
	}
}

function generateName(vid)
{
	if(currentQueue[vid])
	{
		let fileName = currentQueue[vid].title;
		if(!fileName.startsWith(currentQueue[vid].artist) && fileName.split(" - ").length !== 2)
		{
			fileName = currentQueue[vid].artist + " - " + fileName;
		}
		fileName = fileName.replace(/[/\\?%*:|"<>]/g, '-');
		return dir + fileName + ".mp3"
	}
}

async function getFilesizeInMegaBytes(filename) {
	if(await fileExist(filename))
	{
		const stats = fs.statSync(filename);
		const fileSizeInBytes = stats.size;
		if(typeof fileSizeInBytes !== "number")
		{
			return 0;
		}
		return fileSizeInBytes / (1024*1024);
	}
	else
	{
		return 0;
	}
}

function fileExist(path)
{
	try{
		if(fs.existsSync(path))
		{
			return true;
		}
	}
	catch(e)
	{
		return false;
	}
}

async function deleteFile(path)
{
	if(await fileExist(path))
	{
		fs.unlinkSync(path);
	}
}

function clearDir()
{
	fs.readdir(dir.slice(0,-1), (err, files) => {
		if (err) throw err;

		for (const file of files) {
			fs.unlink(dir+file, err => {
				if (err) console.log(err);
			});
		}
	});
}

function isUserAllowed(objOrId)
{
	let userObj = objOrId;
	if(typeof objOrId === "number")
	{
		if(owners.includes(objOrId))
		{
			return true;
		}
		userObj = DB.users[objOrId];
	}
	if(userObj && userObj.promoted)
	{
		return true;
	}
	return false;
}
/* YouTube download END */

function getUICode(index)
{
	return Buffer.from(index.toString()).toString('base64').replace(/=/g,"_");
}

function getVideoIndex(UICode)
{
	return Buffer.from(UICode.replace(/_/g,"="), 'base64').toString();
}

const sendAudio = ({ID, msgObj, caption = DB.dynamicText.audioCaption, cacheObj}) => {
	if(!cacheObj)
		return;
	const sendAudioOptions = {
		chat_id: ID,
		audio: cacheObj.msg,
		caption: caption,
		reply_markup: {
			inline_keyboard: audioKeyboard(cacheObj, ID)
		}
	};
	if(msgObj)
	{
		sendAudioOptions.reply_to_message_id = msgObj.message_id;
	}
	call("sendAudio", sendAudioOptions, function(response){
		if(response)
		{
			DBB.cacheUsage++;
			if(cacheObj.dl.indexOf(ID) === -1)
			{
				DBB.uniqueCacheUsage++;
				cacheObj.dl.push(ID);
				saveData();
			}
		}
		else
		{
			
			DBB.videos.splice(DBB.videos.indexOf(cacheObj), 1);
			saveData();
			sendMessage({
				to: ID,
				input: "Couldn't use cache, please re-submit your request"
			});
		}
	});
};

const createUser = (ID) => {
	DB.users[ID] = {m: 1, stt: "tmp", dl: 0, lr: 0, d:0, u:0};
	if(!owners.includes(ID))
	{
		call("sendMessage",{chat_id:mainAdmin,text:`#NEW_USER /get${ID}`})
	}
};

const getTimeDist = (then, getDay = false) => {
	let timeDiff = Math.round((new Date() - new Date(then))/60000); /* in minute */
	if(getDay && timeDiff < 24 * 60){
		return "Today";
	}
	if(timeDiff <= 0){
		return "Just now";
	}
	else if(!getDay && timeDiff > 0 && timeDiff < 60){
		return `${timeDiff}m ago`;
	} else if (!getDay && timeDiff < 24 * 60) {
		timeDiff = Math.round(timeDiff / 60);
		return `${timeDiff}h ago`;
	} else if (timeDiff < 30 * 24 * 60) {
		timeDiff = Math.round(timeDiff / (24 * 60)) ;
		return `${timeDiff} day${timeDiff>1?'s':''} ago`;
	} else {
		timeDiff = Math.round(timeDiff / (30 * 24 * 60));
		return `${timeDiff} month${timeDiff>1?'s':''} ago`;
	}
}

function bcHandler({ownerID, message, element = 0, sum = 0, forward = false})
{
	if(element<Object.keys(DB.users).length)
	{
		let userID = Object.keys(DB.users)[element];
		if(["rm","blc"].includes(DB.users[userID].stt))
		{
			bcHandler({ownerID, message, element: element+1, sum, forward});
		}
		else {
			call( forward ? "forwardMessage" : "copyMessage",{
				chat_id: userID,
				from_chat_id: ownerID,
				message_id: message
			},function(res){
				if (res)
				{
					sum++;
				}
				else
				{
					/*delete DB.users[userID];
					element-=1;*/
					if(!["blc","main"].includes(DB.users[userID].stt))
					{
						DB.users[userID].stt = "rm";
					}
				}
				bcHandler({ownerID, message, element: element+1, sum, forward});
			});
		}
	}
	else{
		isBroadcasting = false;
		DBB.totalBCs++;
		call("sendMessage",{
			chat_id: ownerID,
			text: "Sent to "+sum+" users"
		});
		saveData();
	}
}

function sendMessage ({type = "text", to, input, caption, parse, extra = {}, callBack = () => {return}}) {
	let method = "sendMessage", callData = {}, extraKeys = Object.keys(extra);
	callData.chat_id = to;
	if(caption)
	{
		callData.caption = caption;
	}
	if(parse)
	{
		callData.parse_mode = parse;
	}
	switch(type)
	{
		case "text":
			method = "sendMessage";
			callData.text =  input;
		break;
		case "photo":
			method = "sendPhoto";
			callData.photo =  input;
		break;
		case "video":
			method = "sendVideo";
			callData.video =  input;
		break;
		case "voice":
			method = "sendVoice";
			callData.voice =  input;
		break;
	}
	extraKeys.map((key) => callData[key] = extra[key]);
	call(method, callData, (response) => callBack(response));
}

function forEachUser(type, key, amount){
	switch(type)
	{
		case "delete":
			if(amount)
			{
				Object.keys(DB.users).forEach((user)=>{
					if(DB.users[user][key] === amount)
					{
						delete DB.users[user];
					}
				});
			}
			else
			{
				Object.keys(DB.users).forEach((user)=>{
					delete DB.users[user][key];
				});
			}
			break;
		case "increase":
			Object.keys(DB.users).forEach((user)=>{
				DB.users[user][key] += amount;
			});
			break;
		case "decrease":
			Object.keys(DB.users).forEach((user)=>{
				DB.users[user][key] -= amount;
			});
			break;
		case "equal":
			Object.keys(DB.users).forEach((user)=>{
				DB.users[user][key] = amount;
			});
			break;
	}
}

function dynamicText({text = '', message = null, specialParams = null, getWords = false}){
	if(getWords){
		return {
			version: "1.0.0",
			words: {
				name: { key: "[NAME]", value: " User account name" }
			}
		};
	}
	if(typeof text !== "string" || !text.length){
		return;
	}
	return text.replace(/\[(NAME)]/g,function(word){
		const WORD = word.slice(1,-1);
		switch(WORD){
			case "NAME":
				if(message && message.from)
				{
					return message.from.first_name;
				}
			break;
		}
		if(specialParams && Object.keys(specialParams).includes(WORD))
		{
			return specialParams[WORD];
		}
		return word;
	});
}

function call(method, params, onResponse)
{
	request.post({
		url: botUrl+method,
		json: true,
		body: params
		},function(error, httpResponse, body){
		if (onResponse) {
			if(body)
			{
				onResponse(body.result);
			}
		}
	});
}
readData();
setTimeout(startBot,1000);