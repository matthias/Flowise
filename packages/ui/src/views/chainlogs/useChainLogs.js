import { useState, useEffect } from 'react'
import { getAllChainLogs } from 'api/chainlogs'
import useApi from 'hooks/useApi'

export function useChainLogs({ pageSizes }) {
    const { data, isLoading, request } = useApi(getAllChainLogs)
    const [term, setTerm] = useState('')
    const [sort, setSort] = useState('')
    const [sortBy, setSortBy] = useState('')

    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(pageSizes[0])

    useEffect(() => {
        const params = { searchFields: 'question,text', search: term, page, pageSize, sortOrders: sort, sortFields: sortBy }
        request({ params })
    }, [term, sort, page, pageSize])

    function onChangeTerm(term) {
        setTerm(term)
    }

    function onChangePage(_event, newPage) {
        setPage(newPage)
    }

    function onChangePaeSize(size) {
        setPageSize(size)
    }

    function handleRequestSort(property) {
        const isCurrent = sortBy === property
        const isAsc = isCurrent && sort === 'ASC'

        if (isCurrent && sort === 'DESC') {
            setSort('')
            return
        }

        const newSort = isAsc ? 'DESC' : 'ASC'
        setSort(newSort)
        setSortBy(property)
    }

    return {
        isLoading,
        data: data?.data,
        meta: data?.meta,

        sort,
        setSort,
        sortBy,
        setSortBy,

        page,
        setPage,
        pageSize,
        setPageSize,

        onChangeTerm,
        onChangePage,
        onChangePaeSize,
        handleRequestSort
    }
}
