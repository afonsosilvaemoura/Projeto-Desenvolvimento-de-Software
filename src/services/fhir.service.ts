import { ObservationDTO } from '../dtos/fhir/Observation';
import { MedicationRequestDTO } from '../dtos/fhir/MedicationRequest';
import { ServiceRequestDTO } from '../dtos/fhir/ServiceRequest';
import { ProcedureDTO } from '../dtos/fhir/Procedure';
import { db } from '../database/database';

const FHIR_BASE_URL = 'https://fhir.hl7.pt/r5/fhir';

export async function getObservationsFromFhir(
  code: string = '8310-5',
  patient?: string
): Promise<ObservationDTO[]> {

  let url = `${FHIR_BASE_URL}/Observation?code=${encodeURIComponent(code)}`;
  if (patient) {
    url += `&subject=Patient/${patient}`;
  }

  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Erro FHIR: ${resposta.status}`);
  }

  const bundle = await resposta.json() as { entry?: Array<{ resource: any }> };

  return bundle.entry?.map((entry) => {
    const r = entry.resource;

    const coding = r?.code?.coding?.[0];
    const qty    = r?.valueQuantity;

    return {
      id:                String(r?.id ?? ''),
      status:            String(r?.status ?? ''),
      code:              String(coding?.code ?? ''),
      display:           String(coding?.display ?? r?.code?.text ?? ''),
      value:             qty ? Number(qty.value) : String(r?.valueString ?? ''),
      unit:              String(qty?.unit ?? qty?.code ?? ''),
      effectiveDateTime: String(r?.effectiveDateTime ?? ''),
      subject:           String(r?.subject?.reference ?? r?.subject?.display ?? ''),
    } satisfies ObservationDTO;
  }) ?? [];
}

export function getPrescricoesAsFhir(utenteId?: number): MedicationRequestDTO[] {
  const rows = utenteId
    ? db.prepare('SELECT * FROM prescricao WHERE utente_id = ? ORDER BY data_criacao DESC').all(utenteId) as any[]
    : db.prepare('SELECT * FROM prescricao ORDER BY data_criacao DESC').all() as any[];

  return rows.map(p => ({
    resourceType: 'MedicationRequest',
    id: String(p.id),
    status: 'active',
    intent: 'order',
    medication: { concept: { text: p.farmaco } },
    subject: { reference: `Patient/${p.utente_id}` },
    requester: { display: p.medico_nome },
    dosageInstruction: [{ text: `${p.dosagem} — ${p.posologia}` }],
    authoredOn: p.data_criacao,
  } satisfies MedicationRequestDTO));
}

export function getExamesAsFhir(utenteId?: number): ServiceRequestDTO[] {
  const rows = utenteId
    ? db.prepare('SELECT * FROM exame WHERE utente_id = ? ORDER BY data_criacao DESC').all(utenteId) as any[]
    : db.prepare('SELECT * FROM exame ORDER BY data_criacao DESC').all() as any[];

  return rows.map(e => ({
    resourceType: 'ServiceRequest',
    id: String(e.id),
    status: 'active',
    intent: 'order',
    category: [{ text: e.tipo_exame }],
    code: { concept: { text: e.exame } },
    subject: { reference: `Patient/${e.utente_id}` },
    requester: { reference: `Practitioner/${e.medico_id ?? 'unknown'}` },
    occurrenceDateTime: e.data_marcacao,
    authoredOn: e.data_criacao,
  } satisfies ServiceRequestDTO));
}

export async function getProceduresFromFhir(subject?: string): Promise<ProcedureDTO[]> {
  let url = `${FHIR_BASE_URL}/Procedure`;
  if (subject) url += `?subject=Patient/${subject}`;

  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`Erro FHIR: ${resposta.status}`);

  const bundle = await resposta.json() as { entry?: Array<{ resource: any }> };

  return bundle.entry?.map((entry) => {
    const r = entry.resource;
    return {
      resourceType: 'Procedure',
      id:      String(r?.id ?? ''),
      status:  String(r?.status ?? ''),
      code:    r?.code ?? undefined,
      subject: { reference: String(r?.subject?.reference ?? '') },
      performer:         r?.performer ?? undefined,
      performedDateTime: r?.performedDateTime ?? undefined,
      note:              r?.note ?? undefined,
    } satisfies ProcedureDTO;
  }) ?? [];
}