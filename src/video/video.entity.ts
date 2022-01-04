import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class VideoEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    path: string

    @Column()
    remote_path: string
}