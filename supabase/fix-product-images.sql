-- Fix missing product photos (picsum often blocked / flaky). Run once in Supabase SQL Editor.
-- Sets a stable Unsplash image per sample product name; anything else gets a safe default.

update public.products
set image_url = coalesce(
  case trim(name)
    when 'Ivory Sozni Shawl' then 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop'
    when 'Champagne Bridal Wrap' then 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80&auto=format&fit=crop'
    when 'Zari Border Dupatta' then 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop'
    when 'Jamawar Motif Shawl' then 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80&auto=format&fit=crop'
    when 'Gift Box — Navy Shawl' then 'https://images.unsplash.com/photo-1434389678769-0a32c616b94f?w=800&q=80&auto=format&fit=crop'
    when 'Ombre Stole — Dawn' then 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80&auto=format&fit=crop'
    when 'Herringbone Travel Wrap' then 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&auto=format&fit=crop'
    when 'Checked Academic Scarf' then 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80&auto=format&fit=crop'
    when 'Solid Ring Shawl — Charcoal' then 'https://images.unsplash.com/photo-1583292650780-1191d2960688?w=800&q=80&auto=format&fit=crop'
    when 'Summer Silk Blend Stole' then 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80&auto=format&fit=crop'
    when 'Men''s Muffler — Steel' then 'https://images.unsplash.com/photo-1558171813-4c088774b6cd?w=800&q=80&auto=format&fit=crop'
    when 'Lattice Jacquard Shawl' then 'https://images.unsplash.com/photo-1503341450203-b1d7d7560a4d?w=800&q=80&auto=format&fit=crop'
    else null
  end,
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80&auto=format&fit=crop'
)
where image_url is null
   or trim(image_url) = ''
   or image_url ilike '%picsum.photos%';
