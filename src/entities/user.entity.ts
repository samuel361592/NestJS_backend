import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, ManyToOne} from 'typeorm';
import { Post } from './post.entity';
import { Role } from './role.entity';


@Entity()
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'varchar', length: 100 })
    email: string;

    @Column({ type: 'varchar', select: false })
    password: string;

    @Column({ type: 'int' })
    age: number;

    @ManyToOne(() => Role, role => role.users)
    role: Role;

    // 一個使用者可以擁有多個帖子
    @OneToMany(() => Post, post => post.user)
    posts: Post[];
}
