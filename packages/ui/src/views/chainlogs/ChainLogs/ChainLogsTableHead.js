import * as React from 'react'
import PropTypes from 'prop-types'
import { visuallyHidden } from '@mui/utils'
import { IconButton, TableCell, TableRow, Box, Checkbox, TableHead, TableSortLabel } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'

const headCells = [
    {
        id: 'Chatflow'
    },
    {
        id: 'Input'
    },
    {
        id: 'Output'
    },
    {
        id: 'Chat ID'
    },
    {
        id: 'Timestamp'
    },
    {
        id: 'Actions'
    }
]

export function ChainLogsTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props

    const onSort = () => {}

    return (
        <TableHead>
            <TableRow>
                <TableCell padding='checkbox'>
                    <Checkbox
                        color='primary'
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts'
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell key={headCell.id} align='center' padding='none' sortDirection={orderBy === headCell.id ? order : false}>
                        {headCell?.sortable && (
                            <IconButton onClick={onSort}>
                                <FilterListIcon />
                            </IconButton>
                        )}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    )
}

ChainLogsTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
}
