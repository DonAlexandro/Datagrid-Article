import { Box, Chip, Stack, Typography } from '@mui/material';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import pick from 'lodash.pick';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { DataGrid } from '../../components';
import { gameAPI } from '../../redux/api';
import { useAppSelector } from '../../redux/store';
import { Game } from '../../shared/types';
import { mapArraysToInFilter, mapStringToSearchFilter, mapArraysToRangeFilters } from '../../utils';
import { GameFilters } from './components';
import { GameSliceInitialState } from '../../redux/slices';

type FilterStateStringArraysType = Pick<GameSliceInitialState['filterState'], 'genres'>;
type FilterStateNumberArraysType = Pick<GameSliceInitialState['filterState'], 'price'>;

export const Home: React.FC = () => {
  const { search, filterState } = useAppSelector((state) => state.gameSlice);

  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const [findAll, { data: games, isLoading }] = gameAPI.useLazyFindAllQuery();

  const sort = useMemo(() => sorting.map((sortItem) => `${sortItem.id}:${sortItem.desc ? 'desc' : 'asc'}`), [sorting]);

  const filters = useMemo(
    () => ({
      ...mapStringToSearchFilter(search, ['title', 'short_description']),
      ...mapArraysToInFilter(pick(filterState, ['genres']) as FilterStateStringArraysType, { genres: 'title' }),
      ...mapArraysToRangeFilters(pick(filterState, ['price']) as FilterStateNumberArraysType),
    }),
    [search, filterState],
  );

  const selectedGames = useMemo(() => {
    const indexes = Object.keys(rowSelection);

    if (!indexes.length) {
      return [];
    }

    return games?.data.filter((_game, index) => indexes.includes(String(index)));
  }, [rowSelection, games]);

  useEffect(() => {
    findAll({ pagination, sort, filters });
  }, [findAll, pagination, sort, filters]);

  useEffect(() => console.log(selectedGames), [selectedGames]);

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
        id="games"
        columns={columns}
        data={games?.data}
        loading={isLoading}
        setCollapsible={setCollapsible}
        search={search}
        pagination={{
          page: pagination.page,
          pageSize: pagination.pageSize,
          setState: setPagination,
          count: games?.meta.pagination.total,
        }}
        sorting={{ setState: setSorting, state: sorting }}
        rowSelection={{ state: rowSelection, setState: setRowSelection }}
      />
    </Fragment>
  );
};
