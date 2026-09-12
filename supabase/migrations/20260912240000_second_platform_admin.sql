-- Grants platform access to a second administrator.
--
-- Done by migration rather than through sa_set_super_admin because seeding
-- the first one already needed that route, and a second seeded holder means
-- neither can be locked out by losing access to the other's account.
update public.profiles
set is_super_admin = true
where lower(email) = 'utibeabasiekpenyong@gmail.com';
