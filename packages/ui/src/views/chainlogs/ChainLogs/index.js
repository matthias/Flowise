import * as React from 'react'
import PropTypes from 'prop-types'
import {
    Chip,
    Box,
    Grid,
    Table,
    TableBody,
    Checkbox,
    Paper,
    TableCell,
    TableRow,
    TableContainer,
    TablePagination,
    Pagination
} from '@mui/material'
import { ChainLogsTableHead } from './ChainLogsTableHead'
import { ChainLogsTableToolbar } from './ChainLogsTableToolbar'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import TextsmsIcon from '@mui/icons-material/Textsms'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { ChainLogsDetails } from '../ChainLogsDetails'

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1
    }
    if (b[orderBy] > a[orderBy]) {
        return 1
    }
    return 0
}

function getComparator(order, orderBy) {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index])
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0])
        if (order !== 0) {
            return order
        }
        return a[1] - b[1]
    })
    return stabilizedThis.map((el) => el[0])
}

export default function ChainLogsTable({ data, meta }) {
    const [order, setOrder] = React.useState('asc')
    const [orderBy, setOrderBy] = React.useState('calories')
    const [selected, setSelected] = React.useState([])
    const [page, setPage] = React.useState(meta.currentPage || 1)
    const [rowsPerPage, setRowsPerPage] = React.useState(meta.itemsPerPage)
    const [logDetails, setLogDetails] = React.useState(null)

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc'
        setOrder(isAsc ? 'desc' : 'asc')
        setOrderBy(property)
    }

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = data.map((n) => n.id)
            setSelected(newSelected)
            return
        }
        setSelected([])
    }

    const handleClick = (event, id) => {
        event.stopPropagation()
        const selectedIndex = selected.indexOf(id)
        let newSelected = []

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id)
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1))
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1))
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
        }

        setSelected(newSelected)
    }

    const onClickRow = (event, log) => {
        event.stopPropagation()
        setLogDetails(log)
    }

    const onChangePage = (event, newPage) => {
        console.log(event, newPage)
    }

    const onCloseDetailsWindow = () => setLogDetails(null)

    const isSelected = (id) => selected.indexOf(id) !== -1

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(1, (1 + page) * rowsPerPage - meta.totalItems.length) : 1

    return (
        <>
            <Box sx={{ width: '100%' }}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <ChainLogsTableToolbar numSelected={selected.length} />
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-labelledby='tableTitle' size='medium'>
                            <ChainLogsTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={meta.totalItems}
                            />
                            <TableBody>
                                {data.map((row, index) => {
                                    const isItemSelected = isSelected(row.id)
                                    const labelId = `enhanced-table-checkbox-${index}`
                                    // chatId
                                    // :
                                    // "9775d83b-af61-4841-9f73-fbda8c18ab92"
                                    // chatflowId
                                    // :
                                    // "20ee55f6-a4ce-4b0d-b280-0c33bf2a4cbe"
                                    // chatflowName
                                    // :
                                    // "GTP1"
                                    // createdDate
                                    // :
                                    // "2023-07-14T06:36:58.000Z"
                                    // id
                                    // :
                                    // "0be5a74b-a947-42ff-8f33-7b4a6fe99c3c"
                                    // isInternal
                                    // :
                                    // false
                                    // question
                                    // :
                                    // "hi"
                                    // result
                                    // :
                                    // {text: 'Ciao', sourceDocuments: Array(4)}
                                    // text
                                    // :
                                    // "Ciao"
                                    return (
                                        <TableRow
                                            hover
                                            onClick={(event) => onClickRow(event, row)}
                                            role='checkbox'
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.id}
                                            selected={isItemSelected}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding='checkbox'>
                                                <Checkbox
                                                    onClick={(event) => handleClick(event, row.id)}
                                                    color='primary'
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby': labelId
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell component='th' id={labelId} scope='row'>
                                                {row?.chatflowName}
                                            </TableCell>
                                            <TableCell>{row?.question}</TableCell>
                                            <TableCell align='right'>{row?.text}</TableCell>
                                            <TableCell>{row?.chatId}</TableCell>
                                            <TableCell>{row?.createdDate}</TableCell>
                                            <TableCell>actions*</TableCell>
                                        </TableRow>
                                    )
                                })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: (dense ? 33 : 53) * emptyRows
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Pagination
                        count={Math.ceil(page / meta.totalItems)}
                        page={page}
                        onChange={onChangePage}
                        showFirstButton
                        showLastButton
                    />
                    {/* <TablePagination
                        rowsPerPageOptions={[15, 25, 50]}
                        component='div'
                        count={meta.totalItems}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    /> */}
                </Paper>
            </Box>

            <ChainLogsDetails details={logDetails} onClose={onCloseDetailsWindow} />
        </>
    )
}

// Inside your component
ChainLogsTable.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            createdDate: PropTypes.string.isRequired,
            question: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            chatId: PropTypes.string.isRequired,
            isInternal: PropTypes.bool.isRequired,
            chatflowId: PropTypes.string.isRequired,
            chatflowName: PropTypes.string.isRequired,
            result: PropTypes.shape({
                text: PropTypes.string.isRequired,
                sourceDocuments: PropTypes.arrayOf(
                    PropTypes.shape({
                        pageContent: PropTypes.string.isRequired,
                        metadata: PropTypes.shape({
                            source: PropTypes.string.isRequired,
                            blobType: PropTypes.string.isRequired,
                            loc: PropTypes.shape({
                                lines: PropTypes.shape({
                                    from: PropTypes.number.isRequired,
                                    to: PropTypes.number.isRequired
                                }).isRequired
                            }).isRequired
                        }).isRequired
                    })
                ).isRequired
            }).isRequired
        })
    ).isRequired,
    meta: PropTypes.shape({
        totalItems: PropTypes.number.isRequired,
        itemsPerPage: PropTypes.number.isRequired,
        currentPage: PropTypes.number.isRequired,
        lastPage: PropTypes.number.isRequired,
        nextPage: PropTypes.number,
        prevPage: PropTypes.number
    }).isRequired
}
