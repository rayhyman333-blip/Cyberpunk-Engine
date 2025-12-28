import { z } from 'zod';
import { insertUserSchema, insertCampaignSchema, insertTransactionSchema, campaigns, transactions, analytics, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    user: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.void(),
      },
    },
  },
  campaigns: {
    list: {
      method: 'GET' as const,
      path: '/api/campaigns',
      responses: {
        200: z.array(z.custom<typeof campaigns.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/campaigns',
      input: insertCampaignSchema,
      responses: {
        201: z.custom<typeof campaigns.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/campaigns/:id',
      responses: {
        200: z.custom<typeof campaigns.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  transactions: {
    list: {
      method: 'GET' as const,
      path: '/api/transactions',
      responses: {
        200: z.array(z.custom<typeof transactions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/transactions',
      input: insertTransactionSchema.extend({
        amount: z.coerce.number().min(100), // Minimum $1.00
      }),
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  analytics: {
    get: {
      method: 'GET' as const,
      path: '/api/analytics',
      responses: {
        200: z.array(z.custom<typeof analytics.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
