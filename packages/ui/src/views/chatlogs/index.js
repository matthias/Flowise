import { useSelector } from 'react-redux'
import { Stack } from '@mui/material'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import ChatLogsTable from './ChatLogsTable'
import useApi from 'hooks/useApi'
import { getChatLogs } from 'api/chatlogs'
import { useEffect } from 'react'

export default function ChatLogs() {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const getAllChatflowsApi = useApi(getChatLogs)

    useEffect(() => {
        getAllChatflowsApi.request()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '' }}>
            <Stack flexDirection='row'>
                <h1>Chat Logs </h1>
            </Stack>
            <ChatLogsTable />
        </MainCard>
    )
}
