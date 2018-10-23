// Made by Conan Dev Team - Kuroemon, neihousaigaai
const botSettings = require("./botsettings.json");
const Discord = require("discord.js");
const prefix = botSettings.prefix;
const bad_words_file = require('./badwords.json');
let bad_words = bad_words_file.bad_words;
const bot = new Discord.Client({disableEveryone : true});
require("dotenv/config");
const ytdl = require("ytdl-core");
const request = require("request");
const fs = require("fs");
const getYouTubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const yt_api_key = process.env.yt_api_key;
let guilds = {};
const mod_id = process.env.mod_list;
const mod_id_list = mod_id.split("|");
const throwing_objects_file = require('./throwing_objects.json');
const throwing_objects = throwing_objects_file.throwing_objects;

function vehinhvuong(key, rong) {
    let res = "";
    for (let i = 0; i < rong*rong; i++) {
        res += key;
        if ((i+1)%rong==0) res += "\n";
    }
    return res;
}
bot.on("ready", async () => {
    console.log(`Bot is ready ! ${bot.user.username}`);
    try{
        let link = await bot.generateInvite(["ADMINISTRATOR"]);
        console.log(link);
    }catch(e) {
        console.log(e.stack);
    }
    bot.user.setActivity('do.help để trợ giúp ');
    
});
bot.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    let messageArray = message.content.split(" ");
    let command = messageArray[0];
    let args = messageArray.slice(1);
    var tmsg = " "+message.content.toLowerCase()+" ";    
    tmsg = tmsg.replace(/[`~!@#$%^&*()_|+\-=÷¿?;:'",.<>\{\}\[\]\\\/]/gi, ' ');
    if (command === `${prefix}remove_word`) {
        if (!mod_id_list.includes(message.author.id.toString())) return message.channel.send("Bạn không có quyền chỉnh các từ tục !!");
        if (args.length === 0) return message.channel.send("Bạn cần thêm từ cần xóa !");
        message.channel.send(`Đã xóa thành công từ \`${message.content.substring(15, message.content.length)}\``);
        bad_words = bad_words.filter(word => word !== message.content.substring(15, message.content.length));
        const new_list = {
            bad_words : bad_words
        }
        const new_list_json = JSON.stringify(new_list);
        new_list_json.replace(",", ", \n");
        fs.writeFile('badwords.json', new_list_json, 'utf8', function(){});
    } else if (command === `${prefix}add_word`) {
        if (!mod_id_list.includes(message.author.id.toString())) return message.channel.send("Bạn không có quyền chỉnh các từ tục !!");
        if (args.length === 0) return message.channel.send("Bạn cần thêm từ cần thêm !");
        if (bad_words.includes(message.content.substring(12, message.content.length))) return message.channel.send(`Trong danh sách đã có từ \`${message.content.substring(12, message.content.length)}\``);
        message.channel.send(`Đã thêm thành công từ \`${message.content.substring(12, message.content.length)}\``);
        bad_words.push(message.content.substring(12, message.content.length));
        const new_list = {
            bad_words : bad_words
        }
        const new_list_json = JSON.stringify(new_list);
        new_list_json.replace(",", ", \n");
        fs.writeFile('badwords.json', new_list_json, 'utf8', function(){});
    }
    const mess = message.content.toLowerCase();
        if (!guilds[message.guild.id]) {
        guilds[message.guild.id] = {
            queue: [],
            queueNames: [],
            isPlaying: false,
            isPaused: false,
            dispatcher: null,
            voiceChannel: null,
            skipReq: 0
        };
    }
    function wrongCmd() {
        let noti = new Discord.RichEmbed()
            .setAuthor(message.author.username)
            .setColor("#3d87ff")
            .addField(`Bạn đang dùng command này sai cách,`, `Hướng dẫn :`)
            .addField("Cách dùng chính xác :", `do.userinfo để biết thông tin chính mình hoặc do.userinfo <tag\_một\_người>`)
            .addField("Ví dụ :", `do.userinfo @Kuroemon#3193`);
        message.channel.send(noti);
    }
    for (let i = 0; i< bad_words.length; i++) {
        if (tmsg.includes(' '+bad_words[i]+' ') || tmsg.includes('dmdm')) {
            let ntfct = new Discord.RichEmbed()
                .setColor("#ff463d")
                .setDescription(`Đề nghị các mod xử lí thành viên <@${message.author.id}> vì đã có hành vi nói tục !!`)
                .addField("Lý do : ", `<@${message.author.id}> đã nói : "${message.content}"`)
                .addField("Thời gian : ", `${message.createdAt}`);
            message.channel.send(ntfct);
            message.react("🏴");
            return;
        }
    }
    if ((args.length===0)&&((tmsg.includes(' dm '))||(tmsg.includes(' đù ')))) {
        let ntfct1 = new Discord.RichEmbed()
            .setColor("#ff463d")
            .setDescription(`Đề nghị các mod xử lí thành viên <@${message.author.id}> vì đã có hành vi nói tục !!`)
            .addField("Lý do : ", `<@${message.author.id}> đã nói : "${message.content}"`)
            .addField("Thời gian : ", `${message.createdAt}`);
        message.channel.send(ntfct1);
        message.react("🏴");
        return;
    }
    if (tmsg.includes(' drama '))
        message.channel.send(`Hít hà, hít hà \:joy:`);
    if (tmsg.includes(' hóng ')) 
        message.channel.send(`Chúng ta cùng hóng nào \:grin:`);
    if (!command.startsWith(prefix)) return;
    if (command === `${prefix}userinfo`) {
         if (args.length>1) {
            wrongCmd();
            return;
        } else if (args.length===0) {
            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username)
                .setColor("#3d87ff")
                .addField("Tên người dùng : ", `${message.author.username}#${message.author.discriminator}`, true)
                .addField("Mã số :", message.author.id, true)
                .addField("Tạo tài khoản lúc : ", message.author.createdAt, true)
                .addField("Tham gia server vào : ", message.channel.guild.joinedAt)
                .addField("Trạng thái : ", message.author.presence.status)
                .setThumbnail(message.author.avatarURL);
            message.channel.send(embed);
            return;
        }
        let usermention = message.guild.member(message.mentions.users.first());
        if (usermention){
            let embed = new Discord.RichEmbed()
                .setAuthor(usermention.user.username)
                .setColor("#3d87ff")
                .addField("Tên người dùng : ", `${usermention.user.username}#${usermention.user.discriminator}`, true)
                .addField("Mã số : ", `${usermention.user.id}`, true)
                .addField("Tạo tài khoản lúc : ", `${usermention.user.createdAt}`, true)
                .addField("Tham gia server vào : ", message.guild.joinedAt)
                .addField("Trạng thái : ", `${usermention.user.presence.status}`)
                .setThumbnail(usermention.user.avatarURL);
            message.channel.send(embed);
            return;
        } else {
            wrongCmd();
            return;
        }
    } else if (command === `${prefix}serverinfo`) {
        let info = new Discord.RichEmbed()
        .setAuthor(message.guild.name)
        .addField("Name : ", message.guild.name, true)
        .addField("ID : ", message.guild.id, true)
        .addField("Owner : ", `<@${message.guild.owner.id}>`, true)
        .addField("Roles : ", message.guild.roles.size)
        .addField("Members : ", message.guild.memberCount)
        .setThumbnail(message.guild.iconURL);
        message.channel.send(info);
    } else if (command === `${prefix}prefix`){
        message.channel.sendMessage("Prefix của mình là 'do.'");
    } else if (command === `${prefix}ping`){
        message.channel.sendMessage("Pong ! :ping_pong:");
    } else if (command === `${prefix}help`){
        let newms = new Discord.RichEmbed()
            .setColor("#3d87ff")
            .addField("userinfo : ", `Hiện thông tin người dùng của bạn, nếu tag ai vào thì sẽ hiện thông tin người đó`)
            .addField("serverinfo : ", `Hiện thông tin của server hiện tại`)
            .addField("ping : ", `Chỉ là chơi`)
            .addField("prefix : ", `Cho bạn biết prefix của Doraku Bot`)
            .addField("help : ", `Yêu cầu trợ giúp về bot này :grin:` )
            .addField("say : ", `Yêu cầu bot nói điều gì đó ` )
            .addField("luom : ", `Dùng để lườm ai đó :"> `)
            .addField("cuoi : ", `Dùng để cười :joy:`)
            .addField("love : ", `Dùng để thể hiện tình cảm của bạn với người khác :)`)
            .addField("throw : ", `Ném đồ vào ai đó :v`)
            .addField("match : ", `Hãy quẹt que diêm, giấc mơ sẽ đến với bạn`)
            .addField("play : ", `Chơi nhạc`)
            .addField("pause : ", `Tạm dừng bài hát`)
            .addField("resume : ", `Tiếp tục bài hát`)
            .addField("skip : ", `Chuyển bài hát`)
            .addField("out : ", `Kêu bot ra khỏi voice chat`)
            .addField("Một khi bạn nói tục bạn sẽ bị mách với các mod :grin: ", `Hết`);
        
        if (args.length>0){
            newms.addField("Bạn đang dùng command này sai đấy nhé !!");
        }
        message.channel.send(newms);
    } else if (command === `${prefix}say`) {
        let says = new Discord.RichEmbed()
            .setColor("#3d87ff")
            .addField(message.author.username,`${message.content.substring(prefix.length + 3)}`);
        message.channel.sendEmbed(says);
    } else if (command === `${prefix}cuoi`) {
        let hd;
        let rong = parseInt(14);
        if (args.length > 0) rong = parseInt(args[0], 10);
        if (isNaN(rong) || rong > 14 || rong <= 0) {
            hd=args[0].toLowerCase();
            rong = parseInt(14);
        }
        let mynewmsg = "";
        if (args.length > 1) 
            hd = args[1].toLowerCase();
        if (hd === "square"){
            mynewmsg = vehinhvuong("😂", rong);
        }
        else if (hd === "triangle") {
            let num = 0;
            for (let i = 0; i<rong*2-1; i++) {
                if (i < rong) num++; else if (i >= rong) num--;
                for (let j = 0; j<num; j++) {
                    mynewmsg += "😂";
                }
                mynewmsg += "\n";
            }
        } else mynewmsg = vehinhvuong("😂", rong);
        message.channel.send(mynewmsg);
    }else if (command === `${prefix}luom`) {
        let nhap = message.mentions.users;
        let nhungnguoibiluom = [];
        nhap.forEach(function(user) {
            nhungnguoibiluom.push(user.id);
        });
        let caunoi = "";
        if (nhungnguoibiluom.length>0) {
            caunoi = `Ahihi, <@${message.author.id}> đang lườm `;
            for (let j = 0; j < nhungnguoibiluom.length; j++) {
                caunoi += `<@${nhungnguoibiluom[j]}>`;
                if (nhungnguoibiluom.length > 1 && j < nhungnguoibiluom.length-2) {
                    caunoi += ", ";
                }
                else if (j === nhungnguoibiluom.length-2 && nhungnguoibiluom.length) {
                    caunoi += " và ";
                }
            }
            caunoi += ` kìa :"> \n\n`;
        }
        else caunoi = `Lườm ai đó hộ <@${message.author.id}> :grimacing: \n\n`;
        
        let hd;
        let rong = parseInt(14);
        if (args.length > 0) rong = parseInt(args[0], 10);
        if (isNaN(rong) || rong > 14 || rong <= 0) {
            hd=args[0].toLowerCase();
            rong = parseInt(14);
        }
        let mynewmsg = caunoi;
        if (args.length > 1 && !args[1].includes('@')) 
            hd = args[1].toLowerCase();
        if (hd === "square"){
            mynewmsg = vehinhvuong("😒", rong);
        }
        else if (hd === "triangle") {
            let num = 0;
            mynewmsg = "";
            for (let i = 0; i<rong*2-1; i++) {
                if (i < rong) num++; else if (i >= rong) num--;
                for (let j = 0; j<num; j++) {
                    mynewmsg += "😒";
                }
                mynewmsg += "\n";
            }
        } else {
            if (nhungnguoibiluom.length>1)
            mynewmsg = vehinhvuong("😒", 12);
            else mynewmsg = vehinhvuong("😒", rong);
        }
        message.channel.send(caunoi + mynewmsg);
    }else if (command === `${prefix}love`) {
    let blank=":black_heart:", heart=":heart:", fill=":black_heart:";
    let n = 9;
    let caunoi = "";
    
    if (args.length > 0)
    {
        if (!isNaN(args[0]))
        n = parseInt(args[0]);
        else n = 12;
        caunoi = "Love you more than I can say \:heart: \n" + draw_heart_coor(n, blank=":black_heart:", heart=":heart:", fill=":black_heart:");
    }else {
        n = parseInt(9);
        caunoi = "Are you ready for loveeee \:kissing_heart: \n" + 
        ":heart: :yellow_heart: :green_heart: :blue_heart: :purple_heart: \n" +
        ":yellow_heart: :green_heart: :blue_heart: :purple_heart: :heart: \n" +
        ":green_heart: :blue_heart: :purple_heart: :heart: :yellow_heart: \n" +
        ":blue_heart: :purple_heart: :heart: :yellow_heart: :green_heart: \n" +
        ":purple_heart: :heart: :yellow_heart: :green_heart: :blue_heart: \n";
    } 
    if (n <= 4 || n >= 13) return message.channel.send("Bạn nhập một số từ 5 đến 12 thôi !");
    message.channel.send(caunoi);
    } else if (command === `${prefix}throw`) {
        let newmsg = "";
    
        let nhap = message.mentions.users;
        let be_thrown = [];
        nhap.forEach(function(user) {
            be_thrown.push(user.id);
        });
    
        let throw_obj = throwing_objects[getRandomInt(0, throwing_objects.length-1)];
        // console.log(throw_obj);
    
        if (be_thrown.length > 0) {
            newmsg = `\:anger: <@${message.author.id}> vừa ném ` + throw_obj["name"] + " vào ";
    
            for (let j = 0; j < be_thrown.length; j++) {
                newmsg += `<@${be_thrown[j]}>`;
    
                if (be_thrown.length > 1) {
                    if (j < be_thrown.length-2)
                        newmsg += ", ";
                    else if (j === be_thrown.length-2)
                        newmsg += " và ";
                }
            }
            newmsg += " kìa";
        } else
            newmsg = `\:anger: <@${message.author.id}> vừa ném ` + throw_obj["name"] + " kìa";
    
        if (throw_obj["price"] >= 10)
            newmsg += ", hốt mau, hốt mau :x";
        else if (throw_obj["damage"] <= 10)
            newmsg += ", né đi \:fearful:";
        else if (throw_obj["damage"] > 10)
            newmsg += " \:scream: CHẠY NGAY ĐI \:runner:";
        else {
            if (be_thrown.length > 0)
                newmsg += " :v";
            else
                newmsg += `, chắc trúng ai đó rồi \:grimacing:`;
        }
        // :bow_and_arrow: 
        message.channel.send(newmsg);
    } else if (command === `${prefix}match`) {
	    let magic = "";
	    if (args.length === 1) {
	        if (args[0] === "hungry") {
	            let now = new Date(); // .toString()
	            let now_day = now.getDay(); // Sunday - Saturday : 0 - 6
	            let now_hour = now.getHours();
	            let now_minute = now.getMinutes();
	            // console.log(now_hour, now_minute);
	            /*
	            ":rice:"
	            ":poultry_leg:", ":meat_on_bone:", ":fried_shrimp:", ":shrimp:", ":fish_cake:",
	            ":curry:", ":stew:", ":oden:",
	            */
	            if (compare_time(now_hour, now_minute, 6, 0) >= 0 && compare_time(now_hour, now_minute, 9, 0) <= 0) {
	                let food = [[":bread:", ":egg:", "☕"],
	                            [":bread:", ":cheese:", "🥛"],
	                            [":croissant:"],
	                            [":french_bread:"],
	                            [":hotdog:"],
	                            [":burrito:"],
	                            [":taco:"],
	                            [":ramen:"]
	                           ];

	                magic = "Ăn sáng thôi!";
	            } else if (compare_time(now_hour, now_minute, 9, 0) > 0 && compare_time(now_hour, now_minute, 11, 0) < 0) {
	                let food = ""
	                magic = "Bây giờ không phải giờ cho bữa sáng \:frowning: Ăn tạm ... nào =))";
	            } else if (compare_time(now_hour, now_minute, 11, 0) >= 0 && compare_time(now_hour, now_minute, 14, 0) < 0) {
	                magic = "Giờ ăn trưa tới rồi!";

	                if (now_day === 0 || now_day === 6) { // weekend
	                    let food = [[":bento:", ":rice_ball:", ":rice_cracker:"]
	                               ];

	                    magic += "\nĐi học hay đi làm gì, ta đã có \:bento:";
	                } else { // weekday
	                    let is_outside = getRandomInt(0, 1);
	                    if (is_outside === 0) {
	                        magic += "\nHôm nay ta sẽ có bữa ăn ấm cúng tại nhà với";
	                    } else {
	                        let food = [[":sushi:", ":sake:"],
	                                    [":spaghetti:"],
	                                    [":hamburger:", ":pizza:", ":fries:"]];

	                        magic += "\nCùng ăn trưa ở ngoài với";
	                    }
	                }
	            } else if (compare_time(now_hour, now_minute, 14, 0) >= 0 && compare_time(now_hour, now_minute, 18, 0) < 0) {
	                let food = [[":doughnut:", ":custard:", ":cookie:", ":cake:", ":pancakes:"],
	                            [":candy:", ":lollipop:", ":chocolate_bar:"],
	                            [":icecream:", ":ice_cream:", ":shaved_ice:"],
	                            [":dango:" /* + tea */]];

	                let random_id = getRandomInt(0, food.length-1);
	                let food_menu = food[random_id];

	                if (random_id === 1) {
	                    magic = "Một chút " + food_menu[getRandomInt(0, food_menu.length-1)] + " cho đời thêm ngọt ngào <3";
	                } else if (random_id === 2) {
	                    magic = "Ăn chút " + food_menu[getRandomInt(0, food_menu.length-1)] + " cho mát nào ~~";
	                } else if (random_id === 0){
	                    magic = "Ăn nhẹ với " + food_menu[getRandomInt(0, food_menu.length-1)] + " nào =))"
	                } else {
	                    magic = "Thưởng thức \:dango: với \:tea: cho một buổi chiều thật an lành \:relieved:";
	                }
	            } else if (compare_time(now_hour, now_minute, 18, 0) >= 0 && compare_time(now_hour, now_minute, 20, 30) < 0) {
	                let food = [];
	                let drink = [];
	                magic = "Tối nay chúng ta sẽ có một bữa ăn hoàn hảo với ...";
	            } else if (compare_time(now_hour, now_minute, 20, 30) >= 0 && compare_time(now_hour, now_minute, 22, 0) < 0) {
	                let food = [];
	                let drink = [];
	                magic = "Một chút đồ ăn vặt tráng miệng buổi tối với ... :3";
	            } else if (compare_time(now_hour, now_minute, 22, 0) >= 0 || compare_time(now_hour, now_minute, 4, 0) < 0) {
	                let food = [];
	                let drink = [];
	                magic = "Ăn đêm dễ béo lắm đó nha =)) Uống \:milk: rồi đi ngủ nào \:sleeping: \:zzz:";
	            } else if (compare_time(now_hour, now_minute, 4, 0) >= 0 && compare_time(now_hour, now_minute, 6, 0) < 0) {
	                let food = [];
	                let drink = [];
	                magic = "Chuẩn bị đồ ăn sáng thôi chứ còn làm gì nữa \:grin:";
	            } else {
	                // BUGGGGGGGGGGGGGGGGGGGGGGGGGGGG
	                magic = "Cứ hở ra là ăn thế hả \:rage:";
	            }
	            // magic = "Bot sẽ mang đến cho bạn...";
	        } else if (args[0] === "bored") {
	            // magic = "Bot sẽ mang đến cho bạn...";
	            let magic_list = ["Đi ngắm mặt trời mọc nào \:sunrise:",
	                              "Cùng ngắm hoàng hôn nào \:city_sunset:",
	                              "Nhậu đêeee... 1 2 3 zo! \:beers:",
	                              " \:kissing_smiling_eyes:"
	                             ];

	            magic = "Đi chơi với bot nào :x";
	        } else if (args[0] === "happy") {
	            let magic_list = ["Chúc bạn mãi luôn vui vẻ và hạnh phúc \:kissing_heart:",
	                              "Cùng chia sẻ niềm vui nào \:heart:",
	                              "Cho mình ôm cái nào \:hugging:",
	                              "Thơm cái nà \:kissing_smiling_eyes:"
	                             ];
	            magic = magic_list[getRandomInt(0, magic_list.length-1)];
	        } else {
	            magic_list = ["Bot không biết bạn cảm thấy gì cả \:frowning:",
	                          "Bot chưa lớn, bot vẫn còn lứa tuổi học sinh \:innocent:",
	                          "Em có biết gì đâu \:fearful: \:cry:",
	                          "Hơm hiểu gì hết \:shrug:",
	                          "\:beetle: đấy, tại thằng dev cả \:unamused:"
	                         ];
	            magic = magic_list[getRandomInt(0, magic_list.length-1)];
	        }
	    } else if (args.length === 0) {
	        let magic_list = ["\:fire: A dream will come true...",
	                          "\:fire: 1 vợ \:woman: 2 con \:baby: 3 tầng \:house: 4 bánh \:red_car:... \:relieved:",
	                          "\:fire: Em đã mơ về... ngôi nhà và những đứa trẻ... \:blush:",
	                          "\:fire: nhiều khi ước mơ chỉ là mơ ước \:notes:",
	                          "Diêm gì mà quẹt mãi chả sáng, đích thị là diêm Tàu \:unamused:"
	                         ];
	        magic = magic_list[getRandomInt(0, magic_list.length-1)];
	    } else {
	        magic = "Bot không biết bạn cảm thấy gì cả \:frowning:";
	    }

	    message.channel.send(magic);
	
	} else if (command === `${prefix}play`) {
        if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null) {
            if (guilds[message.guild.id].queue.length > 0 || guilds[message.guild.id].isPlaying) {
                getID(args, function(id) {
                    add_to_queue(id, message);
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        message.channel.send("Đã thêm **" + videoInfo.title + "** vào danh sách phát");
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                    });
                });
            } else {
                isPlaying = true;
                getID(args, function(id) {
                    guilds[message.guild.id].queue.push(id);
                    playMusic(id, message);
                    fetchVideoInfo(id, function(err, videoInfo) {
                        if (err) throw new Error(err);
                        guilds[message.guild.id].queueNames.push(videoInfo.title);
                        message.channel.send("Đang phát **" + videoInfo.title + "**");
                    });
                });
            }
        } else {
            message.reply(" bạn cần vào trong một voice channel trước!");
        }
    } else if (command === `${prefix}skip`) {
        if (guilds[message.guild.id].voiceChannel === null) return message.channel.send("Không còn gì trong danh sách phát");
    skip_song(message);
    message.reply("đã chuyển bài hát");
    } else if (command === `${prefix}queue`) {
        if (guilds[message.guild.id].queueNames.length < 1) return message.channel.send("```Không có gì trong danh sách phát```");
        var message2 = "```";
        for (var i = 0; i < guilds[message.guild.id].queueNames.length; i++) {
            var temp = (i + 1) + ": " + guilds[message.guild.id].queueNames[i] + (i === 0 ? "**(Đang phát)**" : "") + "\n";
            if ((message2 + temp).length <= 2000 - 3) {
                message2 += temp;
            } else {
                message2 += "```";
                message.channel.send(message2);
                message2 = "```";
            }
        }
        message2 += "```";
        message.channel.send(message2);
    } else if (command === `${prefix}pause`) {
        pause(message);
    } else if (command === `${prefix}resume`) {
        resume(message);
    } else if (command === `${prefix}out`) {
        out(message);
    }
});

bot.login(process.env.token);

function getRandomInt(min, max) {
    return Math.floor(Math.random() * 142857) % (max - min + 1) + min;
}

function compare_time(h1, m1, h2, m2) {
    if ((h1 < h2) || (h1 === h2 && m1 < m2)) return -1;
    if (h1 === h2 && m1 === m2) return 0;
    if ((h1 > h2) || (h1 === h2 && m1 > m2)) return 1;
}

function draw_heart_coor(n, blank=":black_heart:", heart=":heart:", fill=":black_heart:")
{
    let res = "";
    if (n % 2 === 1)
    {
        X = Math.round((n - 1) / 2);

        for (let y = X; y >= -X ; y--)
        {
            for (let x = -X; x <= X; x++)
                {
                if ( y > 0) {
                    if (X >= 4) 
                    {
                        if (((x=== -X+1 || x === 0 || x === X-1) && y === X - 1) || (y === X &&Math.abs(x) > 0 && Math.abs(x) <=  X - 2) || (Math.abs(x) === X &&y > 0 && y <= X - 2))
                            res += heart;
                        else if (((x=== -X+1 || x === 0 || x === X-1) && y < X - 1) || (Math.abs(x) > 0 && Math.abs(x) <=  X - 2 && y < X) || (Math.abs(x) < X &&y > 0 && y <= X - 2))  // inner fill
                            res += fill;
                        else
                            res += blank;
                    }
                    else{
                        if ((x === 0 && y === X - 1) || (y === X &&Math.abs(x) > 0 && Math.abs(x) <= X - 1) || (Math.abs(x) === X && y > 0 && y <= X - 1))
                            res += heart;
                        else if ((x === 0 && y < X - 1) || ( Math.abs(x) >0 && Math.abs(x) <= X - 1 && y < X) || (Math.abs(x) < X && y > 0 && y <= X - 1))  // inner fill
                            res += fill;
                        else
                            res += blank;
                    }  // case 2
                    
                }
                    
                else  // lower part of the heart  // y <= 0
                    if ((Math.abs(x) + Math.abs(y)) === X)
                        res += heart;
                    else if ((Math.abs(x) + Math.abs(y)) < X)  // inner fill
                        res += fill;
                    else // outside
                        res += blank;
                }
            res += "\n";
        }
    }
            
    else
    {
        X =  Math.round( n / 2);
        for (let y = X; y >= -X; y--)
        {
            if (y !== 0)
            {
                for (let x = -X; x <= X; x++)
                {
                    if (x !== 0 )
                    {
                        if (y > 0)  // upper part of the heart
                        {
                            if (X > 4)  // case 1
                            {
                                if (((Math.abs(x) === 1 || Math.abs(x) === X-1) && y === X - 1) || (y === X && 1 < Math.abs(x) && Math.abs(x) <= X - 2) || (Math.abs(x) === X && y >= 1 && y <= X - 2))
                                    res += heart;
                                // else if (y < X && 1 <= Math.abs(x) <= X - 2) || (Math.abs(x) < X && y >= 1 && y <= X - 2):  // inner fill
                                else if (((Math.abs(x) === 1 || Math.abs(x) === X-1)   && y < X - 1) || (1 < Math.abs(x) && Math.abs(x) <= X - 2 && y < X))  // inner fill
                                    res += fill;
                                else
                                    res += blank;
                            }
                            else  // case 2
                            {
                                if ((Math.abs(x) === 1 && y === X - 1) || (y === X && 1 < Math.abs(x) && Math.abs(x) <= X - 1) || (Math.abs(x) === X && y >= 1 && y <= X - 1))
                                    res += heart;
                                // else if (y < X && 1 <= Math.abs(x) <= X - 1) || (Math.abs(x) < X && y >= 1 && y <= X - 1):  // inner fill
                                else if ((Math.abs(x) === 1 && y < X - 1) || (1 < Math.abs(x) && Math.abs(x) <= X - 1 && y < X))  // inner fill
                                    res += fill;
                                else
                                    res += blank;
                            }
                        }
                        else  // lower part of the heart  // y < 0
                        {
                            if (Math.abs(x) + Math.abs(y) === X + 1)
                                res += heart;
                            else if (Math.abs(x) + Math.abs(y) < X + 1)  // inner fill
                                res += fill;
                            else// outside
                                res += blank;
                        }
                    }
                }
                res += "\n";
            }
                
        }
            
    }
    return res;
}

//=======================================music=============================/
function skip_song(message) {
    guilds[message.guild.id].dispatcher.end();
}
function out(message) {
    if (message.channel.voiceChannel != bot.voiceChannel) return message.reply(' mình không ở chung voice channel với bạn');
    message.member.voiceChannel.leave();
}
function pause(message) {
    if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null)
    {
        if (guilds[message.guild.id].isPaused) return message.channel.send("Bài hát đã được tạm dừng trước đó!");
        guilds[message.guild.id].dispatcher.pause();
        guilds[message.guild.id].isPaused = true;
    } else {
        message.reply(" bạn cần vào trong một voice channel trước!");
    }
}

function resume(message) {
    if (message.member.voiceChannel || guilds[message.guild.id].voiceChannel != null)
    {
        if (!guilds[message.guild.id].isPaused) return message.channel.send("Bài hát đã được tiếp tục trước đó!");
        guilds[message.guild.id].dispatcher.resume();
        guilds[message.guild.id].isPaused = false;
    } else {
        message.reply(" bạn cần vào trong một voice channel trước!");
    }
}

function playMusic(id, message) {
    guilds[message.guild.id].voiceChannel = message.member.voiceChannel;


    guilds[message.guild.id].voiceChannel.join().then(function(connection) {
        stream = ytdl("https://www.youtube.com/watch?v=" + id, {
            filter: 'audioonly'
        });
        guilds[message.guild.id].skipReq = 0;

        guilds[message.guild.id].dispatcher = connection.playStream(stream);
        guilds[message.guild.id].dispatcher.on('end', function() {
            guilds[message.guild.id].skipReq = 0;
            guilds[message.guild.id].queue.shift();
            guilds[message.guild.id].queueNames.shift();
            if (guilds[message.guild.id].queue.length === 0) {
                guilds[message.guild.id].queue = [];
                guilds[message.guild.id].queueNames = [];
                guilds[message.guild.id].isfPlaying = false;
            } else {
                setTimeout(function() {
                    playMusic(guilds[message.guild.id].queue[0], message);
                }, 500);
            }
        });
    });
}

function getID(str, cb) {
    if (isYoutube(str)) {
        cb(getYouTubeID(str));
    } else {
        search_video(str, function(id) {
            cb(id);
        });
    }
}

function add_to_queue(strID, message) {
    if (isYoutube(strID)) {
        guilds[message.guild.id].queue.push(getYouTubeID(strID));
    } else {
        guilds[message.guild.id].queue.push(strID);
    }
}

function search_video(query, callback) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
        var json = JSON.parse(body);
        if (!json.items[0]) callback("3_-a9nVZYjk");
        else {
            callback(json.items[0].id.videoId);
        }
    });
}

function isYoutube(str) {
    return str.toString().toLowerCase().indexOf("youtube.com") > -1;
}
