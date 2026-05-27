import { ObservationDTO } from '../dtos/fhir/Observation';

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