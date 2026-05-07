create table if not exists public.pokemon_quiz_items (
  id bigint generated always as identity primary key,
  pokemon_id integer not null,
  name_ko text not null,
  name_en text not null,
  aliases text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint pokemon_quiz_items_pokemon_id_key unique (pokemon_id),
  constraint pokemon_quiz_items_name_ko_length_check check (char_length(name_ko) between 1 and 50),
  constraint pokemon_quiz_items_name_en_length_check check (char_length(name_en) between 1 and 50),
  constraint pokemon_quiz_items_aliases_count_check check (coalesce(array_length(aliases, 1), 0) <= 10)
);

create table if not exists public.quiz_messages (
  id bigint generated always as identity primary key,
  nickname text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint quiz_messages_nickname_message_key unique (nickname, message),
  constraint quiz_messages_nickname_length_check check (char_length(nickname) between 1 and 20),
  constraint quiz_messages_message_length_check check (char_length(message) between 1 and 200)
);

create table if not exists public.quiz_rankings (
  id bigint generated always as identity primary key,
  nickname text not null,
  score integer not null,
  total_questions integer not null default 100,
  created_at timestamptz not null default now(),
  constraint quiz_rankings_nickname_score_total_questions_key unique (nickname, score, total_questions),
  constraint quiz_rankings_nickname_length_check check (char_length(nickname) between 1 and 20),
  constraint quiz_rankings_score_range_check check (score between 0 and total_questions),
  constraint quiz_rankings_total_questions_check check (total_questions = 100)
);

alter table public.pokemon_quiz_items enable row level security;
alter table public.quiz_messages enable row level security;
alter table public.quiz_rankings enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.pokemon_quiz_items to anon, authenticated;
grant select, insert on public.quiz_messages to anon, authenticated;
grant select, insert on public.quiz_rankings to anon, authenticated;

grant usage, select on sequence public.pokemon_quiz_items_id_seq to anon, authenticated;
grant usage, select on sequence public.quiz_messages_id_seq to anon, authenticated;
grant usage, select on sequence public.quiz_rankings_id_seq to anon, authenticated;

drop policy if exists "Anyone can read pokemon quiz items" on public.pokemon_quiz_items;
create policy "Anyone can read pokemon quiz items"
on public.pokemon_quiz_items
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can read quiz messages" on public.quiz_messages;
create policy "Anyone can read quiz messages"
on public.quiz_messages
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can insert quiz messages" on public.quiz_messages;
create policy "Anyone can insert quiz messages"
on public.quiz_messages
for insert
to anon, authenticated
with check (
  char_length(nickname) between 1 and 20
  and char_length(message) between 1 and 200
);

drop policy if exists "Anyone can read quiz rankings" on public.quiz_rankings;
create policy "Anyone can read quiz rankings"
on public.quiz_rankings
for select
to anon, authenticated
using (true);

drop policy if exists "Anyone can insert quiz rankings" on public.quiz_rankings;
create policy "Anyone can insert quiz rankings"
on public.quiz_rankings
for insert
to anon, authenticated
with check (
  char_length(nickname) between 1 and 20
  and score between 0 and total_questions
  and total_questions = 100
);

insert into public.pokemon_quiz_items (pokemon_id, name_ko, name_en, aliases) values
  (1, '이상해씨', 'Bulbasaur', '{"fushigidane"}'),
  (2, '이상해풀', 'Ivysaur', '{}'),
  (3, '이상해꽃', 'Venusaur', '{}'),
  (4, '파이리', 'Charmander', '{"hitokage"}'),
  (5, '리자드', 'Charmeleon', '{}'),
  (6, '리자몽', 'Charizard', '{}'),
  (7, '꼬부기', 'Squirtle', '{"zenigame"}'),
  (8, '어니부기', 'Wartortle', '{}'),
  (9, '거북왕', 'Blastoise', '{}'),
  (10, '캐터피', 'Caterpie', '{}'),
  (11, '단데기', 'Metapod', '{}'),
  (12, '버터플', 'Butterfree', '{}'),
  (13, '뿔충이', 'Weedle', '{}'),
  (14, '딱충이', 'Kakuna', '{}'),
  (15, '독침붕', 'Beedrill', '{}'),
  (16, '구구', 'Pidgey', '{}'),
  (17, '피죤', 'Pidgeotto', '{}'),
  (18, '피죤투', 'Pidgeot', '{}'),
  (19, '꼬렛', 'Rattata', '{}'),
  (20, '레트라', 'Raticate', '{}'),
  (21, '깨비참', 'Spearow', '{}'),
  (22, '깨비드릴조', 'Fearow', '{}'),
  (23, '아보', 'Ekans', '{}'),
  (24, '아보크', 'Arbok', '{}'),
  (25, '피카츄', 'Pikachu', '{}'),
  (26, '라이츄', 'Raichu', '{}'),
  (27, '모래두지', 'Sandshrew', '{}'),
  (28, '고지', 'Sandslash', '{}'),
  (29, '니드런F', 'Nidoran F', '{"nidoranf"}'),
  (30, '니드리나', 'Nidorina', '{}'),
  (31, '니드퀸', 'Nidoqueen', '{}'),
  (32, '니드런M', 'Nidoran M', '{"nidoranm"}'),
  (33, '니드리노', 'Nidorino', '{}'),
  (34, '니드킹', 'Nidoking', '{}'),
  (35, '삐삐', 'Clefairy', '{}'),
  (36, '픽시', 'Clefable', '{}'),
  (37, '식스테일', 'Vulpix', '{}'),
  (38, '나인테일', 'Ninetales', '{}'),
  (39, '푸린', 'Jigglypuff', '{"purin"}'),
  (40, '푸크린', 'Wigglytuff', '{}'),
  (41, '주뱃', 'Zubat', '{}'),
  (42, '골뱃', 'Golbat', '{}'),
  (43, '뚜벅쵸', 'Oddish', '{}'),
  (44, '냄새꼬', 'Gloom', '{}'),
  (45, '라플레시아', 'Vileplume', '{}'),
  (46, '파라스', 'Paras', '{}'),
  (47, '파라섹트', 'Parasect', '{}'),
  (48, '콘팡', 'Venonat', '{}'),
  (49, '도나리', 'Venomoth', '{}'),
  (50, '디그다', 'Diglett', '{}'),
  (51, '닥트리오', 'Dugtrio', '{}'),
  (52, '나옹', 'Meowth', '{}'),
  (53, '페르시온', 'Persian', '{}'),
  (54, '고라파덕', 'Psyduck', '{"koduck"}'),
  (55, '골덕', 'Golduck', '{}'),
  (56, '망키', 'Mankey', '{}'),
  (57, '성원숭', 'Primeape', '{}'),
  (58, '가디', 'Growlithe', '{"gardie"}'),
  (59, '윈디', 'Arcanine', '{}'),
  (60, '발챙이', 'Poliwag', '{}'),
  (61, '슈륙챙이', 'Poliwhirl', '{}'),
  (62, '강챙이', 'Poliwrath', '{}'),
  (63, '캐이시', 'Abra', '{"casey"}'),
  (64, '윤겔라', 'Kadabra', '{}'),
  (65, '후딘', 'Alakazam', '{}'),
  (66, '알통몬', 'Machop', '{}'),
  (67, '근육몬', 'Machoke', '{}'),
  (68, '괴력몬', 'Machamp', '{}'),
  (69, '모다피', 'Bellsprout', '{}'),
  (70, '우츠동', 'Weepinbell', '{}'),
  (71, '우츠보트', 'Victreebel', '{}'),
  (72, '왕눈해', 'Tentacool', '{}'),
  (73, '독파리', 'Tentacruel', '{}'),
  (74, '꼬마돌', 'Geodude', '{"ishitsubute"}'),
  (75, '데구리', 'Graveler', '{}'),
  (76, '딱구리', 'Golem', '{}'),
  (77, '포니타', 'Ponyta', '{}'),
  (78, '날쌩마', 'Rapidash', '{}'),
  (79, '야돈', 'Slowpoke', '{}'),
  (80, '야도란', 'Slowbro', '{}'),
  (81, '코일', 'Magnemite', '{"coil"}'),
  (82, '레어코일', 'Magneton', '{}'),
  (83, '파오리', 'Farfetchd', '{"farfetchd"}'),
  (84, '두두', 'Doduo', '{}'),
  (85, '두트리오', 'Dodrio', '{}'),
  (86, '쥬쥬', 'Seel', '{}'),
  (87, '쥬레곤', 'Dewgong', '{}'),
  (88, '질퍽이', 'Grimer', '{}'),
  (89, '질뻐기', 'Muk', '{}'),
  (90, '셀러', 'Shellder', '{}'),
  (91, '파르셀', 'Cloyster', '{}'),
  (92, '고오스', 'Gastly', '{}'),
  (93, '고우스트', 'Haunter', '{}'),
  (94, '팬텀', 'Gengar', '{}'),
  (95, '롱스톤', 'Onix', '{}'),
  (96, '슬리프', 'Drowzee', '{}'),
  (97, '슬리퍼', 'Hypno', '{}'),
  (98, '크랩', 'Krabby', '{}'),
  (99, '킹크랩', 'Kingler', '{}'),
  (100, '찌리리공', 'Voltorb', '{}'),
  (104, '탕구리', 'Cubone', '{}'),
  (115, '캥카', 'Kangaskhan', '{}'),
  (122, '마임맨', 'Mr Mime', '{"mrmime","mr.mime"}'),
  (129, '잉어킹', 'Magikarp', '{}'),
  (133, '이브이', 'Eevee', '{"eievui"}'),
  (143, '잠만보', 'Snorlax', '{"kabigon"}'),
  (147, '미뇽', 'Dratini', '{"minyong"}'),
  (149, '망나뇽', 'Dragonite', '{"mangnanyong"}'),
  (150, '뮤츠', 'Mewtwo', '{}'),
  (152, '치코리타', 'Chikorita', '{}'),
  (155, '브케인', 'Cyndaquil', '{"bukein"}'),
  (158, '리아코', 'Totodile', '{}'),
  (172, '피츄', 'Pichu', '{}'),
  (175, '토게피', 'Togepi', '{}'),
  (183, '마릴', 'Marill', '{}'),
  (194, '우파', 'Wooper', '{}'),
  (197, '블래키', 'Umbreon', '{"blacky"}'),
  (200, '무우마', 'Misdreavus', '{}'),
  (246, '애버라스', 'Larvitar', '{"aeburaseu"}'),
  (252, '나무지기', 'Treecko', '{}'),
  (255, '아차모', 'Torchic', '{}'),
  (258, '물짱이', 'Mudkip', '{}'),
  (280, '랄토스', 'Ralts', '{}'),
  (282, '가디안', 'Gardevoir', '{}'),
  (302, '깜까미', 'Sableye', '{}'),
  (359, '앱솔', 'Absol', '{}'),
  (371, '아공이', 'Bagon', '{}'),
  (376, '메타그로스', 'Metagross', '{}'),
  (387, '모부기', 'Turtwig', '{}'),
  (390, '불꽃숭이', 'Chimchar', '{}'),
  (393, '팽도리', 'Piplup', '{}'),
  (448, '루카리오', 'Lucario', '{}'),
  (470, '리피아', 'Leafeon', '{}'),
  (471, '글레이시아', 'Glaceon', '{}'),
  (700, '님피아', 'Sylveon', '{"ninfia"}'),
  (778, '따라큐', 'Mimikyu', '{}')
on conflict (pokemon_id) do update
set
  name_ko = excluded.name_ko,
  name_en = excluded.name_en,
  aliases = excluded.aliases;

insert into public.quiz_messages (nickname, message) values
  ('학생1', '포켓몬 퀴즈 재미있어요!'),
  ('학생2', '실루엣만 보고 맞히는 게 생각보다 어렵네요.')
on conflict (nickname, message) do update
set
  nickname = excluded.nickname,
  message = excluded.message;

insert into public.quiz_rankings (nickname, score, total_questions) values
  ('피카츄마스터', 88, 100),
  ('실루엣헌터', 72, 100),
  ('포켓몬박사', 65, 100)
on conflict (nickname, score, total_questions) do update
set
  nickname = excluded.nickname,
  score = excluded.score,
  total_questions = excluded.total_questions;
