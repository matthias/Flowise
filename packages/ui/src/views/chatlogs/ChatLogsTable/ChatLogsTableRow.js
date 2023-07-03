import * as React from 'react'

import { ChatLogDetails } from '../ChatLogDetails'

import { Chip, Grid, Checkbox, TableCell, TableRow, Typography, IconButton } from '@mui/material'

import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import TextsmsIcon from '@mui/icons-material/Textsms'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess'
import PropTypes from 'prop-types'

export function ChatLogsTableRow({ data, isItemSelected, onToggleSelection }) {
    const { id } = data

    const [open, setOpen] = React.useState(false)

    const [showDetails, setShowDetails] = React.useState(false)

    const onToggleExpending = (event) => {
        event.stopPropagation()
        setOpen((prev) => !prev)
    }

    const onClickRow = (event) => {
        event.stopPropagation()
        setShowDetails(true)
    }

    const onCloseDetailsWindow = () => setShowDetails(false)

    const labelId = `enhanced-table-checkbox-${id}`

    return (
        <>
            <TableRow
                hover
                onClick={onClickRow}
                role='checkbox'
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={id}
                selected={isItemSelected}
                sx={{ cursor: 'pointer' }}
            >
                <TableCell padding='checkbox'>
                    <Checkbox
                        onClick={(event) => onToggleSelection(event, id)}
                        color='primary'
                        checked={isItemSelected}
                        inputProps={{
                            'aria-labelledby': labelId
                        }}
                    />
                </TableCell>
                <TableCell component='th' id={labelId} scope='row'>
                    <Grid marginBottom='4px' display='grid' gridTemplateRows='repeat(2, 1fr)' gridTemplateColumns='50px auto' gap={2}>
                        <Chip label='Q: ' component='span' />
                        <Typography className={open ? '' : 'ellipsis-multiline-2'} component='span'>
                            {data?.text?.question}
                        </Typography>
                        <Chip label='A: ' component='span' />
                        <Typography className={open ? '' : 'ellipsis-multiline-2'} component='span'>
                            {data?.text?.answer}
                        </Typography>
                    </Grid>
                </TableCell>
                <TableCell align='center'>
                    {data?.quality?.thumbsUp && <ThumbUpIcon color='success' />}
                    {data?.quality?.thumbsDown && <ThumbDownIcon color='error' />}
                    {!!data?.quality?.text && <TextsmsIcon />}
                </TableCell>
                <TableCell align='right'>
                    <IconButton onClick={onToggleExpending}>{open ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}</IconButton>
                </TableCell>
            </TableRow>

            <ChatLogDetails open={showDetails} details={data} onClose={onCloseDetailsWindow} />
        </>
    )
}

ChatLogsTableRow.propTypes = {
    onToggleSelection: PropTypes.func,
    isItemSelected: PropTypes.bool.isRequired,
    data: PropTypes.shape({
        id: PropTypes.number.isRequired,
        text: PropTypes.shape({
            question: PropTypes.string.isRequired,
            answer: PropTypes.string.isRequired
        }).isRequired,
        quality: PropTypes.shape({
            thumbsUp: PropTypes.bool.isRequired,
            thumbsDown: PropTypes.bool.isRequired,
            text: PropTypes.string
        }).isRequired,
        inputs: PropTypes.string.isRequired,
        context: PropTypes.string.isRequired
    })
}
