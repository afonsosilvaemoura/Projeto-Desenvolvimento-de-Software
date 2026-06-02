export type ServiceRequestDTO = {
  resourceType: 'ServiceRequest';
  id: string;
  status: string;
  intent: string;
  category: Array<{ text: string }>;
  code: { concept: { text: string } };
  subject: { reference: string };
  requester: { reference: string };
  occurrenceDateTime: string;
  authoredOn: string;
};
