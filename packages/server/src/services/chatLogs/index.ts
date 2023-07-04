import { DataSource, EntityTarget } from 'typeorm'
import logger from '../../utils/logger'
import { ChatLog } from '../../entity/ChatLog'
import { ChatMessage } from '../../entity/ChatMessage'
import { MessageType } from 'flowise-components'
import { ExternalChat } from '../../entity/ExternalChat'

type TSaveLogs = {
    dataSource: DataSource
    chatLogModel: EntityTarget<ChatLog>
    id: string
}

async function saveChatLogs({ dataSource, chatLogModel, id }: TSaveLogs) {
    try {
        let chatLogThread = await dataSource.getRepository(chatLogModel).findOne({ where: { chatid: id } })
        // checking if the chat thread was created
        if (!chatLogThread) {
            chatLogThread = new ChatLog()
            chatLogThread.chatid = id
            chatLogThread.createdDate = new Date().toISOString()
            await dataSource.getRepository(chatLogModel).save(chatLogThread)
        }
        return chatLogThread
    } catch (error) {
        logger.error(error)
    }
}

type TSaveChatMessage = {
    dataSource: DataSource
    chatLogThread: ChatLog
    data: {
        content: string
        chatflowid: string
        role: MessageType
    }[]
}

async function saveExternalChatMessage({ data, chatLogThread, dataSource }: TSaveChatMessage) {
    try {
        const newChatMessage = data.map((item) => {
            let message = new ExternalChat()
            message.chatLog = chatLogThread as ChatLog
            Object.assign(message, item)
            return message
        })
        const chatmessage = dataSource.getRepository(ExternalChat).create(newChatMessage)
        return await dataSource.getRepository(ExternalChat).save(chatmessage)
    } catch (error) {
        logger.error(error)
    }
}

export { saveChatLogs, saveExternalChatMessage }
