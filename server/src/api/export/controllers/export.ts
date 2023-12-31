import { QueryParamsType } from '../interface';

export default {
  exportData: async (ctx) => {
    try {
      const query = ctx.request.query as QueryParamsType;

      if (!query.entity || !query.format) {
        throw new Error('Invalid query parameters');
      }

      const exportEntities = {
        games: strapi.service('api::export.export').exportGames,
      };

      if (!exportEntities[query.entity]) {
        throw new Error('Entity is not defined');
      }

      const bufferData = await exportEntities[query.entity](query.format);

      ctx.body = bufferData;
    } catch (err) {
      console.error(err);

      ctx.badRequest('Games export error', { moreDetails: err });
    }
  },
};
