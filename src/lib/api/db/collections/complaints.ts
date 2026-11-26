import { createCollection, localOnlyCollectionOptions } from '@tanstack/react-db'
import { ComplaintSchema, type Complaint } from '@/types/api/complaints'

const demoComplaint: Complaint = {
  id: 'complaint-demo-001',
  orderId: 'ord-demo-004',
  reporterId: 'usr-pb-01',
  reporterName: 'Ibu Ratna',
  type: 'weight_discrepancy',
  description: 'Berat yang tercatat di timbangan saat pengambilan 48 kg dari 50 kg yang dipesan.',
  status: 'in_investigation',
  createdAt: new Date().toISOString(),
  clarificationMessages: [
    {
      id: 'complaint-message-demo-001',
      senderRole: 'admin',
      senderName: 'Administrator',
      message: 'Bisa kirim foto hasil timbangan saat pengambilan?',
      createdAt: new Date().toISOString(),
    },
  ],
}

export const complaintsCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'complaints',
    schema: ComplaintSchema,
    getKey: (complaint) => complaint.id,
    initialData: [demoComplaint],
  })
)
