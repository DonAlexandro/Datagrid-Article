import { TablePagination } from '@mui/material';
import { DataGridProps } from '../interface';

type PaginationProps<R> = Pick<DataGridProps<R>, 'pagination'>;

export const Pagination = <R,>({ pagination: state }: Required<PaginationProps<R>>) => {
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    state.setState({ pageSize: parseInt(event.target.value, 10), page: 1 });
  };

  const handleChangePage = (_: unknown, page: number) => {
    state.setState((prev) => ({ ...prev, page: page + 1 }));
  };

  return (
    <TablePagination
      rowsPerPageOptions={[5, 10, 20, 50, 100]}
      count={state.count!}
      page={state.page - 1}
      onRowsPerPageChange={handleChangeRowsPerPage}
      onPageChange={handleChangePage}
      rowsPerPage={state.pageSize}
      component="div"
    />
  );
};
