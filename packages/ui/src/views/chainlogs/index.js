import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Stack } from '@mui/material'
import MainCard from 'ui-component/cards/MainCard'
import { useTheme } from '@mui/material/styles'
import ChainLogsTable from './ChainLogs'
import { getAllChainLogs } from 'api/chainlogs'
import useApi from 'hooks/useApi'

export default function ChainLogs() {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)

    const { data, isLoading, request } = useApi(getAllChainLogs)

    useEffect(() => {
        // request({ params: { page: 2 } })
        request()
    }, [])

    console.log(data)

    return (
        <MainCard sx={{ background: customization.isDarkMode ? theme.palette.common.black : '' }}>
            <Stack flexDirection='row'>
                <h1>Chain Logs </h1>
            </Stack>
            {data?.data ? <ChainLogsTable data={data.data} meta={data.meta} /> : 'Loading...'}
        </MainCard>
    )
}
