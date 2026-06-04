export type ProcedureDTO = {
  resourceType: 'Procedure';
  id:           string;
  status:       string;
  code?:        { concept?: { text: string } };
  subject:      { reference: string };
  performer?:   Array<{ actor?: { display?: string } }>;
  performedDateTime?: string;
  note?:        Array<{ text: string }>;
};
