import { CARAT, classificarScore, corDoScore, semanasProximaAvaliacao } from '../app/core/constants/carat.constants';
import { environment } from '../environment/environment';

export class CaratComponent {
  private c = environment.CORES;

  // Processar respostas e gerar dados para exibição
  processarAvaliacao(respostas: number[]): void {
    const score = respostas.reduce((soma, r) => soma + r, 0);
    const nivel = classificarScore(score);   // 'CONTROLADA' | 'PARCIALMENTE_CONTROLADA' | 'NAO_CONTROLADA'
    const cor = corDoScore(score);           // '#28A745' | '#F4D03F' | '#DC3545'
    const semanas = semanasProximaAvaliacao(score); // 12 | 4 | 2

    // Configuração para gráfico/visualização
    const graficoConfig = {
      borderColor: this.c.primaria,
      pointBackgroundColor: cor,
    };

    console.log({ score, nivel, cor, semanas, graficoConfig });
    // Usar estes dados no template HTML:
    // [style.color]="corDoScore(avaliacao.score)"
  }
}