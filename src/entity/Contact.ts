import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  phoneNumber!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({ type: 'integer', nullable: true })
  linkedId!: number | null; // points to primary contact

  @Column({ type: 'varchar', default: 'primary' })
  linkPrecedence!: 'primary' | 'secondary';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  deletedAt!: Date | null;
} 