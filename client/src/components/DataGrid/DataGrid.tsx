import { Card, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { columnsAdapter } from '../../storage';
import { ColumnsManagement, DensitySelect, Export, HeaderRow, Pagination, Row } from './components';
import { DataGridProps } from './interface';

export const DataGrid = <R,>({
  id,
  data,
  columns,
  loading,
  setCollapsible,
  pagination,
  sorting,
  search,
  rowSelection,
}: DataGridProps<R>) => {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [size, setSize] = useState<'small' | 'medium'>('medium');

  const table = useReactTable({
    columns,
    data: data ?? [],
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    manualSorting: true,
    state: {
      sorting: sorting?.state,
      columnVisibility,
      rowSelection: rowSelection?.state,
    },
    onSortingChange: sorting?.setState,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: rowSelection?.setState,
  });

  const { rows } = table.getRowModel();

  const mockRows = [1, 2, 3, 4, 5];

  useEffect(() => {
    columnsAdapter.setColumnVisibility(id, columnVisibility);
  }, [columnVisibility, id]);

  useEffect(() => {
    const fetchColumnVisibility = async () => {
      const columnVisibility = await columnsAdapter.getColumnVisibility();

      setColumnVisibility(columnVisibility[id]);
    };

    fetchColumnVisibility();
  }, [id]);

  return (
    <TableContainer component={Card}>
      <Stack sx={{ p: 1 }} gap={1} direction="row">
        <ColumnsManagement table={table} />
        <DensitySelect setSize={setSize} size={size} />
        <Export entity={id} />
      </Stack>
      <Table sx={{ minWidth: table.getTotalSize() }} size={size}>
        <TableHead>
          {loading ? (
            <TableRow>
              {mockRows.map((header) => (
                <TableCell key={header}>
                  <Skeleton variant="rounded" width={210} height={30} />
                </TableCell>
              ))}
            </TableRow>
          ) : (
            table
              .getHeaderGroups()
              .map((headerGroup) => (
                <HeaderRow headerGroup={headerGroup} key={headerGroup.id} table={table} size={size} />
              ))
          )}
        </TableHead>
        <TableBody>
          {loading
            ? mockRows.map((item) => (
                <TableRow key={item}>
                  {mockRows.map((item) => (
                    <TableCell key={item}>
                      <Skeleton variant="rounded" width={210} height={30} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <Row row={row} key={row.id} setCollapsible={setCollapsible} search={search} size={size} />
              ))}
        </TableBody>
      </Table>
      {pagination?.count && <Pagination pagination={pagination} />}
    </TableContainer>
  );
};
