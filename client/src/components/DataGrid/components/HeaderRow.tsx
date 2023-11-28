import { TableCell, TableRow, Typography } from '@mui/material';
import { HeaderGroup, Row, flexRender } from '@tanstack/react-table';
import Styled from '../datagrid.styled';

type HeaderRowProps<R> = {
  headerGroup: HeaderGroup<R>;
  setCollapsible?: (row: Row<R>) => JSX.Element;
};

export const HeaderRow = <R,>({ headerGroup, setCollapsible }: HeaderRowProps<R>) => {
  return (
    <TableRow>
      {setCollapsible && <TableCell sx={{ width: 10 }} />}
      {headerGroup.headers.map((header) => (
        <TableCell
          component="th"
          colSpan={header.colSpan}
          sx={{
            width: header.getSize(),
            position: 'relative',
          }}
          key={header.id}
        >
          <Typography variant="subtitle2">{flexRender(header.column.columnDef.header, header.getContext())}</Typography>
          <Styled.Resizer
            onMouseDown={header.getResizeHandler()}
            onTouchStart={header.getResizeHandler()}
            $isResizing={header.column.getIsResizing()}
          />
        </TableCell>
      ))}
    </TableRow>
  );
};