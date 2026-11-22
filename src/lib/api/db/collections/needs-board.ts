import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { NeedRequestSchema } from '@/types/api/needs-board'
import { mockNeedsBoardData } from '../fixtures/needs-board.fixture'

export const needsBoardCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'needs_board',
    schema: NeedRequestSchema,
    getKey: (item) => item.id,
    initialData: mockNeedsBoardData,
  })
)
