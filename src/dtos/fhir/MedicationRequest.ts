export type MedicationRequestDTO = {
  resourceType: 'MedicationRequest';
  id: string;
  status: string;
  intent: string;
  medication: { concept: { text: string } };
  subject: { reference: string };
  requester: { display: string };
  dosageInstruction: Array<{ text: string }>;
  authoredOn: string;
};
