export const autocompleteResponseSchema = {
  type: 'object',
  required: [
    'account_id',
    'account_email',
    'start_date',
    'end_date',
    'locale',
    'text',
    'suggestion_list',
    'completed'
  ],
  properties: {
    account_id: { type: 'string', minLength: 1 },
    account_email: { type: 'string', format: 'email' },
    start_date: { type: 'string', format: 'ist-local-date-time' },
    end_date: { type: 'string', format: 'ist-local-date-time' },
    locale: { type: 'string', format: 'bcp47' },
    text: { type: 'string' },
    suggestion_list: { type: 'string' },
    completed: { type: 'boolean' }
  },
  additionalProperties: true
} as const;
