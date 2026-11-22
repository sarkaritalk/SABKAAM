-- Public business display name is safe to show on a published listing.
-- Do not expose private employer phone numbers through the public job feed.
alter table public.job_posts
  add column if not exists employer_display_name text;
