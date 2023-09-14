import PropTypes from 'prop-types'
import { ButtonBase, Checkbox, IconButton, TableCell, TableRow, Typography } from '@mui/material'
import { Delete } from '@mui/icons-material'
import moment from 'moment'
import { useState } from 'react'
import useDeleteChainLogs from './useDeleteChainLogs'

import { styled } from '@mui/material/styles'
import ExpendableTextLine from 'ui-component/ExpendableTextLine'

export const StyledFilterButton = styled(ButtonBase)(({ theme }) => ({
    color: theme.palette.primary.main,
    textDecoration: 'dotted',
    padding: '3px 5px 3px 0',
    textAlign: 'left',
    '&:hover': {
        color: theme.palette.primary.dark,
        textDecoration: 'underline'
    }
}))

export const StyledTruncatedTypography = styled(Typography)(() => ({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical'
}))

const ChainLogsTableRow = ({ row, index, onClickRow, handleClick, isSelected, refetch, handleFilter }) => {
    const [selected, setSelected] = useState([row.id])
    const { handleDelete } = useDeleteChainLogs({ refetch, selected, setSelected })

    const onDelete = (event) => {
        event.stopPropagation()
        handleDelete()
    }

    const labelId = `enhanced-table-checkbox-${index}`
    const onFilter = (event) => {
        event.stopPropagation()
        const name = event.target.name
        handleFilter(`{"${name}": "${row?.[name]}"}`)
    }

    return (
        <TableRow
            hover
            onClick={(event) => onClickRow(event, row)}
            role='checkbox'
            aria-checked={isSelected}
            tabIndex={-1}
            key={row.id}
            selected={isSelected}
            sx={{ cursor: 'pointer' }}
        >
            <TableCell padding='checkbox'>
                <Checkbox
                    onClick={(event) => handleClick(event, row.id)}
                    color='primary'
                    checked={isSelected}
                    inputProps={{
                        'aria-labelledby': labelId
                    }}
                />
            </TableCell>
            <TableCell component='th' id={labelId} scope='row'>
                <StyledFilterButton name='chatflowName' onClick={onFilter} disableRipple={true} disableTouchRipple={false}>
                    {row?.chatflowName}
                </StyledFilterButton>
            </TableCell>
            <TableCell sx={{ minWidth: '225px' }}>
                <ExpendableTextLine max={1} html={row?.question} />
            </TableCell>
            <TableCell>
                <ExpendableTextLine max={1} html={row?.text} />
            </TableCell>
            <TableCell>
                <StyledFilterButton name='chatId' onClick={onFilter} disableRipple={true} disableTouchRipple={false}>
                    {row?.chatId}
                </StyledFilterButton>
            </TableCell>
            <TableCell>
                <Typography style={{ whiteSpace: 'nowrap' }}>{moment(row?.createdDate).format('DD.MM.YYYY HH:MM')}</Typography>
            </TableCell>
            <TableCell>
                <IconButton onClick={onDelete}>
                    <Delete />
                </IconButton>
            </TableCell>
        </TableRow>
    )
}

ChainLogsTableRow.propTypes = {
    row: PropTypes.object,
    index: PropTypes.number.isRequired,
    onClickRow: PropTypes.func,
    handleClick: PropTypes.func,
    isSelected: PropTypes.bool.isRequired,
    refetch: PropTypes.func,
    handleFilter: PropTypes.func
}

export default ChainLogsTableRow
