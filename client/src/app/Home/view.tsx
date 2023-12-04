import { Box, Chip, Stack, Typography } from '@mui/material';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import pick from 'lodash.pick';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { DataGrid } from '../../components';
import { gameAPI } from '../../redux/api';
import { useAppSelector } from '../../redux/store';
import { Game } from '../../shared/types';
import { mapArraysToInFilter, mapStringToSearchFilter } from '../../utils';
import { GameFilters } from './components';

export const Home: React.FC = () => {
  const { search, filterState } = useAppSelector((state) => state.gameSlice);

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  const [findAll, { data: games, isLoading: gamesLoading }] = gameAPI.useLazyFindAllQuery();

  const loading = useMemo(() => gamesLoading, [gamesLoading]);

  const sort = useMemo(() => sorting.map((sortItem) => `${sortItem.id}:${sortItem.desc ? 'desc' : 'asc'}`), [sorting]);

  const filters = useMemo(
    () => ({
      ...mapStringToSearchFilter(search, ['title', 'short_description']),
      ...mapArraysToInFilter(pick(filterState, ['genres']), { genres: 'title' }),
    }),
    [search, filterState],
  );

  useEffect(() => {
    findAll({ pagination, sort, filters });
  }, [findAll, pagination, sort, filters]);

  const columns: ColumnDef<Game>[] = useMemo(
    () => [
      {
        id: 'title',
        accessorKey: 'attributes.title',
        header: 'Title',
        size: 100,
      },
      {
        id: 'short_description',
        accessorKey: 'attributes.short_description',
        header: 'Short Description',
        size: 300,
      },
      {
        id: 'price',
        accessorKey: 'attributes.price',
        header: 'Price',
        size: 50,
        meta: {
          hideTooltip: true,
          flexRender: true,
        },
        cell: ({ row: { original } }) => (
          <NumericFormat value={original.attributes.price} thousandSeparator="," prefix="$" displayType="text" />
        ),
      },
    ],
    [],
  );

  const setCollapsible = ({ original }: { original: Game }) => (
    <Fragment>
      <Typography variant="subtitle2">Genres</Typography>
      <Stack direction="row" gap={1}>
        {original.attributes.genres.data.map((genre) => (
          <Chip size="small" key={genre.id} label={genre.attributes.title} variant="outlined" />
        ))}
      </Stack>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Description</Typography>
        <Typography variant="body2">{original.attributes.description}</Typography>
      </Box>
    </Fragment>
  );

  return (
    <Fragment>
      <Box sx={{ mb: 2 }}>
        <GameFilters />
      </Box>
      <DataGrid
        columns={columns}
        data={games?.data}
        loading={loading}
        setCollapsible={setCollapsible}
        search={search}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          setState: setPagination,
          count: games?.meta.pagination.total,
        }}
        sorting={{ setState: setSorting, state: sorting }}
      />
    </Fragment>
  );
};