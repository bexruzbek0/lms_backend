create table if not exists users (
    id serial primary key,
    full_name text not null,
    phone text unique not null,
    password text not null,
    role text not null check (role in ('admin', 'mentor', 'assistant', 'student')),
    avatar text,
    email text,
    status text not null default 'active',
    experience int,
    profession text,
    website text,
    bio text,
    socials jsonb not null default '{}',
    notifications boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists categories (
    id serial primary key,
    name text not null,
    created_at timestamptz not null default now()
);

create table if not exists courses (
    id serial primary key,
    name text not null,
    description text,
    level text,
    price numeric(12, 2) not null default 0,
    banner text,
    intro_video text,
    category_id int references categories (id) on delete set null,
    mentor_id int references users (id) on delete set null,
    assistant_id int references users (id) on delete set null,
    status text not null default 'active',
    created_at timestamptz not null default now()
);

create table if not exists sections (
    id serial primary key,
    course_id int not null references courses (id) on delete cascade,
    name text not null,
    created_at timestamptz not null default now()
);

create table if not exists lessons (
    id serial primary key,
    section_id int not null references sections (id) on delete cascade,
    name text not null,
    description text,
    video text,
    created_at timestamptz not null default now()
);

create table if not exists materials (
    id serial primary key,
    lesson_id int not null references lessons (id) on delete cascade,
    description text not null,
    file text,
    created_at timestamptz not null default now()
);

create table if not exists tasks (
    id serial primary key,
    lesson_id int not null references lessons (id) on delete cascade,
    title text not null,
    file text,
    created_at timestamptz not null default now()
);

create table if not exists exams (
    id serial primary key,
    lesson_id int not null references lessons (id) on delete cascade,
    question text not null,
    variant_a text not null,
    variant_b text not null,
    variant_c text not null,
    variant_d text not null,
    correct char(1) not null check (correct in ('a', 'b', 'c', 'd')),
    created_at timestamptz not null default now()
);

create table if not exists payments (
    id serial primary key,
    user_id int not null references users (id) on delete cascade,
    course_id int not null references courses (id) on delete cascade,
    amount numeric(12, 2) not null default 0,
    payment_type text not null,
    status text not null default 'paid',
    created_at timestamptz not null default now()
);

create table if not exists comments (
    id serial primary key,
    user_id int not null references users (id) on delete cascade,
    course_id int not null references courses (id) on delete cascade,
    parent_id int references comments (id) on delete cascade,
    text text not null,
    created_at timestamptz not null default now()
);

create table if not exists results (
    id serial primary key,
    user_id int not null references users (id) on delete cascade,
    course_id int not null references courses (id) on delete cascade,
    section_id int references sections (id) on delete set null,
    correct int not null default 0,
    wrong int not null default 0,
    passed boolean not null default false,
    created_at timestamptz not null default now()
);
