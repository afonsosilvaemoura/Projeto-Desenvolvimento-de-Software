import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
 
// Existe apenas um registo nesta tabela (id = 1).
// O administrador pode atualizar os valores dos limiares a qualquer momento.
// Estes limiares são usados pelo AlertaService para decidir quando gerar alertas.
 
@Entity()
export class LimiarAlerta {
 
    @PrimaryGeneratedColumn()
    id!: number;
 
    // Score abaixo deste valor gera alerta de tipo SCORE_BAIXO
    @Column({ default: 24 })
    scoreMinimo!: number;
 
    // Queda de pontos face à última avaliação gera alerta de tipo DETERIORACAO
    @Column({ default: 3 })
    deterioracaoPontos!: number;
 
    @Column()
    dataAtualizacao!: Date;
}
 