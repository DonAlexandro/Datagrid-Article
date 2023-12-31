import xl from 'excel4node';
import { toCsv } from '@iwsio/json-csv-core';
import { FormatType } from '../interface';

export default () => ({
  exportGames: async (format: FormatType) => {
    try {
      const data = await strapi.entityService.findMany('api::game.game', {
        fields: ['title', 'description', 'price', 'short_description'],
        populate: { genres: { fields: ['title'] } },
      });

      const games = data.map((game) => ({
        ...game,
        genres: game.genres.map((genre) => genre.title).join(', '),
      }));

      const columnNames = ['Title', 'Description', 'Short Description', 'Price', 'Genres'];

      const exportType = {
        xlsx: exportAsXlsx,
        csv: exportAsCsv,
      };

      return exportType[format](columnNames, games);
    } catch (err) {
      return err;
    }
  },
});

const exportAsXlsx = async <D>(columnNames: string[], data: D[], sheetName = 'Default') => {
  const workbook = new xl.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const columnKeys = columnNames.map((name) => name.toLowerCase().replace(/\s/g, '_'));

  for (let i = 1; i <= columnNames.length; i++) {
    worksheet
      .cell(1, i)
      .string(columnNames[i - 1])
      .style({ font: { bold: true } });
  }

  let rowIndex = 2;

  for (const item of data) {
    let columnIndex = 1;

    for (const key of columnKeys) {
      worksheet.cell(rowIndex, columnIndex++).string(String(item[key]), [key]);
    }

    rowIndex++;
  }

  const buffer = await workbook.writeToBuffer();

  return buffer;
};

const exportAsCsv = <D>(columnNames: string[], data: D[]) => {
  const options = {
    fields: columnNames.map((column) => ({
      name: column.toLowerCase().replace(/\s/g, '_'),
      label: column,
    })),
  };

  const csv = toCsv(data, options);

  return Buffer.from(csv, 'utf-8');
};
