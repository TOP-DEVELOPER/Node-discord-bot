const { MessageEmbed } = require('discord.js')
const Command = require('../../structures/Commandos.js')

module.exports = class queue extends Command {
    constructor(client) {
        super(client, {
            name: 'queue',
            description: ['Displays the current queue.', 'Muestra la cola de reproducción actual.'],
            category: 'musica',
            botpermissions: ['ADD_REACTIONS'],
            alias: ['q', 'cola'],
            args: false
        })
    }
    async run(client, message, args, prefix, lang, webhookClient, ipc) {
        try {
            const player = client.manager.players.get(message.guild.id)
            if (!player) {
                const errorembed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle(client.language.ERROREMBED)
                    .setDescription(client.language.SKIP[1])
                    .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() })
                return message.channel.send({ embeds: [errorembed] })
            }
            if (!player.queue.current) {
                const errorembed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle(client.language.ERROREMBED)
                    .setDescription(client.language.QUEUE[2])
                    .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() })
                return message.channel.send({ embeds: [errorembed] })
            }

            const { title, requester, uri } = player.queue.current

            const { queue } = player

            if (!player.queue[1]) {
                return message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setTitle(client.language.QUEUE[9])
                            .setDescription(`🎧 ${client.language.QUEUE[3]}\n[${title}](${uri}) [<@${requester.id}>]`)
                            .setAuthor(
                                `${client.language.QUEUE[6]} ${message.guild.name} ${client.language.QUEUE[7]}`,
                                'https://i.imgur.com/CCqeomm.gif'
                            )
                            .setColor(process.env.EMBED_COLOR)
                    ]
                })
            }

            let x
            if (args > 1) {
                x = Math.floor(args) * 10 + 1
            } else {
                x = Math.floor(11)
            }
            let i
            if (args > 1) {
                i = x - 11
            } else {
                i = 0
            }
            let queuelist = player.queue
                .slice(x - 10, x)
                .map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`)
                .join('\n')
            if (!queuelist) {
                const errorembed = new MessageEmbed()
                    .setColor('RED')
                    .setTitle(client.language.ERROREMBED)
                    .setDescription(client.language.QUEUE[4])
                    .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() })
                return message.channel.send({ embeds: [errorembed] })
            }
            const embed = new MessageEmbed()
            embed.setDescription(
                `🎧 ${client.language.QUEUE[3]}\n [${title}](${uri}) [<@${requester.id}>]\n__${client.language.QUEUE[8]}__:\n${queuelist}`
            )
            embed.setThumbnail(client.user.displayAvatarURL())
            embed.setAuthor(
                `${client.language.QUEUE[6]} ${message.guild.name} ${client.language.QUEUE[7]} (${Math.floor(
                    x / 10
                )} / ${Math.floor((player.queue.slice(1).length + 10) / 10)})`,
                'https://i.imgur.com/CCqeomm.gif'
            )
            embed.setFooter(`${client.language.QUEUE[5]} ${player.queue.length}`)
            embed.setColor(process.env.EMBED_COLOR)
            message.channel.send({ embeds: [embed] }).then(async (msg) => {
                if (Math.floor((player.queue.slice(1).length + 10) / 10) > 1) {
                    await msg.react('⏪')
                    await msg.react('◀')
                    await msg.react('🟣')
                    await msg.react('▶')
                    await msg.react('⏩')
                    const pages = Math.floor((player.queue.slice(1).length + 10) / 10)
                    let page = Math.floor(x / 10)
                    const back = msg.createReactionCollector(
                        (reaction, user) => reaction.emoji.name === '◀' && user.id === message.author.id,
                        {
                            time: 60000
                        }
                    )
                    const doubleback = msg.createReactionCollector(
                        (reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id,
                        {
                            time: 60000
                        }
                    )
                    const doubleforwad = msg.createReactionCollector(
                        (reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id,
                        {
                            time: 60000
                        }
                    )
                    const forwad = msg.createReactionCollector(
                        (reaction, user) => reaction.emoji.name === '▶' && user.id === message.author.id,
                        {
                            time: 60000
                        }
                    )
                    const middle = msg.createReactionCollector(
                        (reaction, user) => reaction.emoji.name === '🟣' && user.id === message.author.id,
                        {
                            time: 60000
                        }
                    )
                    setTimeout(() => msg.delete(), 5000)
                    back.on('collect', async (r) => {
                        if (page === 1) return r.users.remove(message.author)
                        await r.users.remove(message.author)
                        await page--
                        x = Math.floor(page) * 10 + 1
                        i = x - 11
                        queuelist = player.queue
                            .slice(x - 10, x)
                            .map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`)
                            .join('\n')
                        embed.setColor(process.env.EMBED_COLOR)
                        embed.setTitle(client.language.QUEUE[1])
                        embed.setDescription(
                            `🎧 ${client.language.QUEUE[3]}\n [${title}](${uri}) [<@${requester.id}>]\n__${client.language.QUEUE[8]}__:\n${queuelist}`
                        )
                        embed.setAuthor(
                            `${client.language.QUEUE[6]} ${message.guild.name} ${client.language.QUEUE[7]} (${page} / ${pages})`,
                            'https://i.imgur.com/CCqeomm.gif'
                        )
                        msg.edit(embed)
                    })
                    forwad.on('collect', async (r) => {
                        if (page === pages) return r.users.remove(message.author)
                        await r.users.remove(message.author)
                        await page++
                        x = Math.floor(page) * 10 + 1
                        i = x - 11
                        queuelist = player.queue
                            .slice(x - 10, x)
                            .map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`)
                            .join('\n')
                        embed.setColor(process.env.EMBED_COLOR)
                        embed.setTitle(client.language.QUEUE[1])
                        embed.setDescription(
                            `🎧 ${client.language.QUEUE[3]}\n [${title}](${uri}) [<@${requester.id}>]\n__${client.language.QUEUE[8]}__:\n${queuelist}`
                        )
                        embed.setAuthor(
                            `${client.language.QUEUE[6]} ${message.guild.name} ${client.language.QUEUE[7]} (${page} / ${pages})`,
                            'https://i.imgur.com/CCqeomm.gif'
                        )
                        msg.edit(embed)
                    })
                    doubleback.on('collect', async (r) => {
                        if (page === 1) return r.users.remove(message.author)
                        await r.users.remove(message.author)
                        page = 1
                        x = Math.floor(page) * 10 + 1
                        i = x - 11
                        queuelist = player.queue
                            .slice(x - 10, x)
                            .map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`)
                            .join('\n')
                        embed.setColor(process.env.EMBED_COLOR)
                        embed.setTitle(client.language.QUEUE[1])
                        embed.setDescription(
                            `🎧 ${client.language.QUEUE[3]}\n [${title}](${uri}) [<@${requester.id}>]\n__${client.language.QUEUE[8]}__:\n${queuelist}`
                        )
                        embed.setAuthor(
                            `${client.language.QUEUE[6]} ${message.guild.name} ${client.language.QUEUE[7]} (${page} / ${pages})`,
                            'https://i.imgur.com/CCqeomm.gif'
                        )
                        msg.edit(embed)
                    })
                    doubleforwad.on('collect', async (r) => {
                        if (page === pages) return r.users.remove(message.author)
                        await r.users.remove(message.author)
                        page = pages
                        x = Math.floor(page) * 10 + 1
                        i = x - 11
                        queuelist = player.queue
                            .slice(x - 10, x)
                            .map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`)
                            .join('\n')
                        embed.setColor(process.env.EMBED_COLOR)
                        embed.setTitle(client.language.QUEUE[1])
                        embed.setDescription(
                            `🎧 ${client.language.QUEUE[3]}\n [${title}](${uri}) [<@${requester.id}>]\n__${client.language.QUEUE[8]}__:\n${queuelist}`
                        )
                        embed.setAuthor(
                            `${client.language.QUEUE[6]} ${message.guild.name} ${client.language.QUEUE[7]} (${page} / ${pages})`,
                            'https://i.imgur.com/CCqeomm.gif'
                        )
                        msg.edit(embed)
                    })
                    middle.on('collect', async (r) => r.users.remove(message.author))
                }
            })
        } catch (e) {
            console.error(e)
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setTitle(client.language.ERROREMBED)
                        .setDescription(client.language.fatal_error)
                        .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() })
                ]
            })
            webhookClient.send(
                `Ha habido un error en **${message.guild.name} [ID Server: ${message.guild.id}] [ID Usuario: ${message.author.id}] [Owner: ${message.guild.ownerId}]**. Numero de usuarios: **${message.guild.memberCount}**\nMensaje: ${message.content}\n\nError: ${e}\n\n**------------------------------------**`
            )
            try {
                message.author
                    .send(
                        'Oops... Ha ocurrido un eror con el comando ejecutado. Aunque ya he notificado a mis desarrolladores del problema, ¿te importaría ir a discord.gg/nodebot y dar más información?\n\nMuchísimas gracias rey <a:corazonmulticolor:836295982768586752>'
                    )
                    .catch(e)
            } catch (e) {}
        }
    }
}
