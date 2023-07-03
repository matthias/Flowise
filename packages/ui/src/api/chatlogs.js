import client from './client'

const getChatLogs = () => client.get('/chatlogs')

export { getChatLogs }
